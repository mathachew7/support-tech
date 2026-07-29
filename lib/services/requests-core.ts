// Pure rules for a seeker session request. Framework-free so they are fast to
// unit test; the DB wrapper (requests.ts) composes them.

export const COMMITMENT_MONTHS = [1, 3, 5] as const;
export type CommitmentMonths = (typeof COMMITMENT_MONTHS)[number];

// A seeker may hold at most this many *active* requests at once. A request is
// active until an admin closes/cancels it (i.e. still requested or matched).
export const MAX_ACTIVE_REQUESTS = 3;
export const ACTIVE_REQUEST_STATUSES = ["requested", "matched"] as const;

export function isAtRequestLimit(activeCount: number): boolean {
  return activeCount >= MAX_ACTIVE_REQUESTS;
}

export function remainingRequestSlots(activeCount: number): number {
  return Math.max(0, MAX_ACTIVE_REQUESTS - activeCount);
}

/**
 * Normalize a free-typed skill: trim, collapse inner whitespace, and title-case
 * each word (first letter upper, rest lower). "  system  DESIGN " -> "System Design".
 */
export function normalizeSkillName(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(" ");
}

export type ResolvedSkill = { skillId: string | null; skillName: string };

/**
 * Match a typed skill to the catalog case-insensitively. On a hit, keep the
 * catalog's canonical name+id (so "aws" -> "AWS"). Otherwise it is a free skill:
 * no id, title-cased name.
 */
export function resolveSkill(
  raw: string,
  catalog: { id: string; name: string }[],
): ResolvedSkill {
  const needle = raw.trim().toLowerCase();
  const hit = catalog.find((s) => s.name.toLowerCase() === needle);
  if (hit) return { skillId: hit.id, skillName: hit.name };
  return { skillId: null, skillName: normalizeSkillName(raw) };
}

/**
 * Resolve several typed skills against the catalog, de-duplicated. Returns a
 * joined display name, the individual names, and a single skillId only when
 * exactly one skill was chosen and it matches the catalog (interim: the schema
 * still holds one skill; a join table comes with the next model change).
 */
export function resolveSkills(
  raws: string[],
  catalog: { id: string; name: string }[],
): { skillId: string | null; skillName: string; skillNames: string[] } {
  const uniq: ResolvedSkill[] = [];
  const seen = new Set<string>();
  for (const raw of raws) {
    const r = resolveSkill(raw, catalog);
    const key = r.skillName.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    uniq.push(r);
  }
  const skillNames = uniq.map((r) => r.skillName);
  return {
    skillId: uniq.length === 1 ? uniq[0].skillId : null,
    skillName: skillNames.join(", "),
    skillNames,
  };
}

export function isValidCommitment(months: number): months is CommitmentMonths {
  return (COMMITMENT_MONTHS as readonly number[]).includes(months);
}

/** Start date + N months, month-overflow handled by the Date API. */
export function computeEndDate(start: Date, months: number): Date {
  const d = new Date(start);
  d.setMonth(d.getMonth() + months);
  return d;
}

export type RequestDraft = {
  skillName: string;
  commitmentMonths: number;
  startDate: Date;
  times: Date[];
};

export type Valid = { ok: true } | { ok: false; error: string };

const isValidDate = (d: Date) => d instanceof Date && !Number.isNaN(d.getTime());

/** Structural validation, no clock dependency (future-time check lives in the service). */
export function validateRequestDraft(d: RequestDraft): Valid {
  if (!d.skillName.trim()) return { ok: false, error: "Choose or type a skill" };
  if (!isValidCommitment(d.commitmentMonths)) {
    return { ok: false, error: "Choose a commitment of 1, 3, or 5 months" };
  }
  if (!isValidDate(d.startDate)) return { ok: false, error: "Choose a valid start date" };
  if (d.times.length === 0) return { ok: false, error: "Add at least one preferred time" };
  if (!d.times.every(isValidDate)) return { ok: false, error: "One of the preferred times is invalid" };
  return { ok: true };
}
