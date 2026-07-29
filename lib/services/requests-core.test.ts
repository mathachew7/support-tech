import { describe, it, expect } from "vitest";
import {
  normalizeSkillName,
  resolveSkill,
  resolveSkills,
  isValidCommitment,
  computeEndDate,
  validateRequestDraft,
  isAtRequestLimit,
  remainingRequestSlots,
  MAX_ACTIVE_REQUESTS,
  type RequestDraft,
} from "./requests-core";

describe("normalizeSkillName", () => {
  it("title-cases each word and collapses whitespace", () => {
    expect(normalizeSkillName("  system   DESIGN ")).toBe("System Design");
    expect(normalizeSkillName("react")).toBe("React");
    expect(normalizeSkillName("MACHINE learning")).toBe("Machine Learning");
  });
});

describe("resolveSkill", () => {
  const catalog = [
    { id: "s1", name: "AWS" },
    { id: "s2", name: "Kubernetes" },
  ];
  it("snaps to the catalog's canonical name/id on a case-insensitive match", () => {
    expect(resolveSkill("aws", catalog)).toEqual({ skillId: "s1", skillName: "AWS" });
    expect(resolveSkill("  KUBERNETES ", catalog)).toEqual({ skillId: "s2", skillName: "Kubernetes" });
  });
  it("keeps a free-typed skill with no id, title-cased", () => {
    expect(resolveSkill("rust programming", catalog)).toEqual({
      skillId: null,
      skillName: "Rust Programming",
    });
  });
});

describe("resolveSkills", () => {
  const catalog = [
    { id: "s1", name: "AWS" },
    { id: "s2", name: "Kubernetes" },
  ];
  it("joins multiple skills, canonicalises catalog hits, keeps free text", () => {
    const r = resolveSkills(["aws", "rust programming"], catalog);
    expect(r.skillNames).toEqual(["AWS", "Rust Programming"]);
    expect(r.skillName).toBe("AWS, Rust Programming");
    expect(r.skillId).toBeNull(); // more than one -> no single id
  });
  it("keeps a single catalog id when only one skill is chosen", () => {
    expect(resolveSkills(["kubernetes"], catalog)).toMatchObject({
      skillId: "s2",
      skillName: "Kubernetes",
    });
  });
  it("de-duplicates case-insensitively", () => {
    expect(resolveSkills(["AWS", "aws"], catalog).skillNames).toEqual(["AWS"]);
  });
});

describe("isValidCommitment", () => {
  it("accepts only 1, 3, 5", () => {
    expect(isValidCommitment(1)).toBe(true);
    expect(isValidCommitment(3)).toBe(true);
    expect(isValidCommitment(5)).toBe(true);
    expect(isValidCommitment(2)).toBe(false);
    expect(isValidCommitment(12)).toBe(false);
  });
});

describe("request limit", () => {
  it(`allows up to ${MAX_ACTIVE_REQUESTS} active requests`, () => {
    expect(isAtRequestLimit(0)).toBe(false);
    expect(isAtRequestLimit(MAX_ACTIVE_REQUESTS - 1)).toBe(false);
    expect(isAtRequestLimit(MAX_ACTIVE_REQUESTS)).toBe(true);
    expect(isAtRequestLimit(MAX_ACTIVE_REQUESTS + 5)).toBe(true);
  });
  it("reports remaining slots, never negative", () => {
    expect(remainingRequestSlots(0)).toBe(MAX_ACTIVE_REQUESTS);
    expect(remainingRequestSlots(2)).toBe(MAX_ACTIVE_REQUESTS - 2);
    expect(remainingRequestSlots(MAX_ACTIVE_REQUESTS)).toBe(0);
    expect(remainingRequestSlots(99)).toBe(0);
  });
});

describe("computeEndDate", () => {
  it("adds the commitment months", () => {
    expect(computeEndDate(new Date("2026-08-01T00:00:00Z"), 3).toISOString()).toContain("2026-11-01");
    expect(computeEndDate(new Date("2026-10-15T00:00:00Z"), 5).toISOString()).toContain("2027-03-15");
  });
});

describe("validateRequestDraft", () => {
  const base: RequestDraft = {
    skillName: "Kubernetes",
    commitmentMonths: 3,
    startDate: new Date("2026-08-01"),
    times: [new Date("2026-08-03T10:00:00")],
  };
  it("accepts a well-formed draft", () => {
    expect(validateRequestDraft(base)).toEqual({ ok: true });
  });
  it("rejects an empty skill", () => {
    expect(validateRequestDraft({ ...base, skillName: "  " }).ok).toBe(false);
  });
  it("rejects a bad commitment", () => {
    expect(validateRequestDraft({ ...base, commitmentMonths: 2 }).ok).toBe(false);
  });
  it("rejects when there are no preferred times", () => {
    expect(validateRequestDraft({ ...base, times: [] }).ok).toBe(false);
  });
  it("rejects an invalid preferred time", () => {
    expect(validateRequestDraft({ ...base, times: [new Date("nonsense")] }).ok).toBe(false);
  });
});
