import { describe, it, expect } from "vitest";
import {
  formatMoney,
  formatInvoiceNumber,
  dollarsToCents,
  validateInvoiceDraft,
  canMarkPaid,
} from "./invoices-core";

describe("formatMoney", () => {
  it("formats cents as currency", () => {
    expect(formatMoney(4999, "USD")).toMatch(/\$49\.99/);
    expect(formatMoney(0, "USD")).toMatch(/\$0\.00/);
  });
});

describe("formatInvoiceNumber", () => {
  it("zero-pads to INV-00001", () => {
    expect(formatInvoiceNumber(1)).toBe("INV-00001");
    expect(formatInvoiceNumber(123)).toBe("INV-00123");
  });
});

describe("dollarsToCents", () => {
  it("parses dollar strings to cents", () => {
    expect(dollarsToCents("49.99")).toBe(4999);
    expect(dollarsToCents("$1,200")).toBe(120000);
    expect(dollarsToCents("0")).toBe(0);
  });
  it("returns null for garbage", () => {
    expect(dollarsToCents("abc")).toBeNull();
  });
});

describe("validateInvoiceDraft", () => {
  it("accepts a positive amount with a seeker", () => {
    expect(validateInvoiceDraft({ seekerId: "s1", amountCents: 4999 })).toEqual({ ok: true });
  });
  it("rejects missing seeker", () => {
    expect(validateInvoiceDraft({ seekerId: "", amountCents: 4999 }).ok).toBe(false);
  });
  it("rejects zero / negative amounts", () => {
    expect(validateInvoiceDraft({ seekerId: "s1", amountCents: 0 }).ok).toBe(false);
    expect(validateInvoiceDraft({ seekerId: "s1", amountCents: -5 }).ok).toBe(false);
  });
  it("rejects absurdly large amounts", () => {
    expect(validateInvoiceDraft({ seekerId: "s1", amountCents: 999_999_99 }).ok).toBe(false);
  });
});

describe("canMarkPaid", () => {
  it("allows paying a pending invoice", () => {
    expect(canMarkPaid("pending")).toEqual({ ok: true });
  });
  it("blocks re-paying or paying a void invoice", () => {
    expect(canMarkPaid("paid").ok).toBe(false);
    expect(canMarkPaid("void").ok).toBe(false);
  });
});
