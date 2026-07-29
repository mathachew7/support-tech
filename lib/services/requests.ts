// Session-request persistence. Thin DB wrapper around the pure rules in
// ./requests-core: validate -> resolve skills -> enforce the active-request
// limit atomically -> persist the request plus its preferred times.
import { Prisma } from "@prisma/client";
import type { RequestStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  validateRequestDraft,
  resolveSkills,
  computeEndDate,
  isAtRequestLimit,
  MAX_ACTIVE_REQUESTS,
  ACTIVE_REQUEST_STATUSES,
} from "@/lib/services/requests-core";

const ACTIVE = ACTIVE_REQUEST_STATUSES as unknown as RequestStatus[];

// Thrown inside the transaction when the seeker is already at the limit.
class RequestLimitError extends Error {}

// Human-friendly reference, e.g. "REQ-7F3K2M". Ambiguous chars (0/O/1/I) omitted.
function generateReference(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  let code = "";
  for (const b of bytes) code += alphabet[b % alphabet.length];
  return `REQ-${code}`;
}

export type CreateRequestInput = {
  skillsRaw: string[];
  commitmentMonths: number;
  startDate: Date;
  timezone: string;
  note?: string | null;
  times: Date[];
};

export type CreateRequestResult =
  | { ok: true; requestId: string }
  | { ok: false; error: string };

/** How many active (requested/matched) requests this seeker currently holds. */
export function countActiveRequests(seekerId: string): Promise<number> {
  return prisma.sessionRequest.count({
    where: { seekerId, status: { in: ACTIVE } },
  });
}

export async function createSessionRequest(
  seekerId: string,
  input: CreateRequestInput,
): Promise<CreateRequestResult> {
  const catalog = await prisma.skill.findMany({ select: { id: true, name: true } });
  const { skillId, skillName } = resolveSkills(input.skillsRaw, catalog);

  const valid = validateRequestDraft({
    skillName,
    commitmentMonths: input.commitmentMonths,
    startDate: input.startDate,
    times: input.times,
  });
  if (!valid.ok) return valid;
  if (!input.timezone) return { ok: false, error: "Choose your timezone" };

  const data = {
    seekerId,
    reference: generateReference(),
    skillId,
    skillName,
    commitmentMonths: input.commitmentMonths,
    startDate: input.startDate,
    endDate: computeEndDate(input.startDate, input.commitmentMonths),
    timezone: input.timezone,
    note: input.note?.trim() || null,
    times: { create: input.times.map((datetime) => ({ datetime })) },
  };

  try {
    // Count + insert atomically so two concurrent submits can't both pass the
    // limit check (TOCTOU). Serializable makes the racing txn fail rather than
    // over-create; the UI also disables submit while pending.
    const request = await prisma.$transaction(
      async (tx) => {
        const active = await tx.sessionRequest.count({
          where: { seekerId, status: { in: ACTIVE } },
        });
        if (isAtRequestLimit(active)) throw new RequestLimitError();
        return tx.sessionRequest.create({ data });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
    return { ok: true, requestId: request.id };
  } catch (e) {
    if (e instanceof RequestLimitError) {
      return {
        ok: false,
        error: `You can have up to ${MAX_ACTIVE_REQUESTS} active requests. Wait until one is completed or cancelled before adding another.`,
      };
    }
    // Serialization/write conflict from a concurrent submit - safe to retry.
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2034") {
      return { ok: false, error: "Could not submit just now - please try again." };
    }
    throw e;
  }
}

/** A seeker's requests, newest first, with their preferred times (ascending). */
export function getSeekerRequests(seekerId: string) {
  return prisma.sessionRequest.findMany({
    where: { seekerId },
    include: { times: { orderBy: { datetime: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * A single request, scoped to its owner. Filtering by BOTH id and seekerId means
 * a seeker can never load another user's request by guessing the id (returns
 * null -> the page 404s).
 */
export function getSeekerRequest(seekerId: string, id: string) {
  return prisma.sessionRequest.findFirst({
    where: { id, seekerId },
    include: { times: { orderBy: { datetime: "asc" } }, skill: true },
  });
}
