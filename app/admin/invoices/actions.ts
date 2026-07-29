"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/auth";
import { createInvoice, markInvoicePaid } from "@/lib/services/invoices";
import { dollarsToCents } from "@/lib/services/invoices-core";

export type InvoiceFormState = { ok?: boolean; error?: string };

async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === "admin" ? session : null;
}

export async function createInvoiceAction(
  _prev: InvoiceFormState,
  formData: FormData,
): Promise<InvoiceFormState> {
  if (!(await requireAdmin())) return { error: "Not authorized" };

  const seekerId = String(formData.get("seekerId") ?? "");
  const amountCents = dollarsToCents(String(formData.get("amount") ?? ""));
  const description = String(formData.get("description") ?? "");
  const planName = String(formData.get("planName") ?? "");
  const periodLabel = String(formData.get("periodLabel") ?? "");
  const idx = Number(formData.get("periodIndex"));
  const total = Number(formData.get("periodTotal"));
  const dueStr = String(formData.get("dueDate") ?? "");
  const dueDate = dueStr ? new Date(dueStr + "T00:00:00") : null;

  if (amountCents === null) return { error: "Enter a valid amount" };

  const result = await createInvoice({
    seekerId,
    amountCents,
    description,
    planName,
    periodLabel,
    periodIndex: Number.isInteger(idx) && idx > 0 ? idx : null,
    periodTotal: Number.isInteger(total) && total > 0 ? total : null,
    dueDate,
  });
  if (!result.ok) return { error: result.error };

  revalidatePath("/admin/invoices");
  return { ok: true };
}

export async function markPaidAction(formData: FormData): Promise<void> {
  if (!(await requireAdmin())) return;
  const invoiceId = String(formData.get("invoiceId") ?? "");
  if (invoiceId) await markInvoicePaid(invoiceId);
  revalidatePath("/admin/invoices");
}
