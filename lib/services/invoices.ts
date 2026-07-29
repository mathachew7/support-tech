// Invoice persistence. Admin issues invoices; seekers read their own. Business
// rules (validation, numbering, mark-paid transition) live in ./invoices-core.
import { prisma } from "@/lib/db/prisma";
import {
  validateInvoiceDraft,
  formatInvoiceNumber,
  canMarkPaid,
  type InvoiceStatus,
} from "@/lib/services/invoices-core";

export type CreateInvoiceInput = {
  seekerId: string;
  amountCents: number;
  currency?: string;
  description?: string | null;
  planName?: string | null;
  periodLabel?: string | null;
  periodIndex?: number | null;
  periodTotal?: number | null;
  dueDate?: Date | null;
};

export type CreateInvoiceResult =
  | { ok: true; invoiceId: string }
  | { ok: false; error: string };

/** Issue an invoice to a seeker. Numbered sequentially inside a transaction. */
export async function createInvoice(
  input: CreateInvoiceInput,
): Promise<CreateInvoiceResult> {
  const valid = validateInvoiceDraft({
    seekerId: input.seekerId,
    amountCents: input.amountCents,
    description: input.description,
  });
  if (!valid.ok) return valid;

  // Guard: the target must actually be a seeker.
  const seeker = await prisma.user.findUnique({
    where: { id: input.seekerId },
    select: { role: true },
  });
  if (!seeker || seeker.role !== "seeker") {
    return { ok: false, error: "Invoices can only be issued to seekers" };
  }

  const invoice = await prisma.$transaction(async (tx) => {
    const count = await tx.invoice.count();
    return tx.invoice.create({
      data: {
        number: formatInvoiceNumber(count + 1),
        seekerId: input.seekerId,
        amountCents: input.amountCents,
        currency: input.currency || "USD",
        description: input.description?.trim() || null,
        planName: input.planName?.trim() || null,
        periodLabel: input.periodLabel?.trim() || null,
        periodIndex: input.periodIndex ?? null,
        periodTotal: input.periodTotal ?? null,
        dueDate: input.dueDate ?? null,
        status: "pending",
      },
    });
  });

  return { ok: true, invoiceId: invoice.id };
}

/** Mark a pending invoice paid. Returns an error if the transition is illegal. */
export async function markInvoicePaid(
  invoiceId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: { status: true },
  });
  if (!invoice) return { ok: false, error: "Invoice not found" };

  const can = canMarkPaid(invoice.status as InvoiceStatus);
  if (!can.ok) return can;

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { status: "paid", paidAt: new Date() },
  });
  return { ok: true };
}

/** All invoices for the admin view, newest first, with the seeker's name. */
export function listAllInvoices() {
  return prisma.invoice.findMany({
    orderBy: { issuedAt: "desc" },
    include: { seeker: { select: { name: true, email: true } } },
  });
}

/** A seeker's own invoices, newest first. */
export function listSeekerInvoices(seekerId: string) {
  return prisma.invoice.findMany({
    where: { seekerId },
    orderBy: { issuedAt: "desc" },
  });
}

/** A single invoice scoped to its owner (IDOR-safe: null when not owned). */
export function getSeekerInvoice(seekerId: string, id: string) {
  return prisma.invoice.findFirst({
    where: { id, seekerId },
    include: {
      seeker: {
        select: {
          name: true,
          email: true,
          street: true,
          city: true,
          state: true,
          zip: true,
          country: true,
        },
      },
    },
  });
}
