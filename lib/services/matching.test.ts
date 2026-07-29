import { describe, it, expect } from "vitest";
import { suggestProviders, type ProviderCandidate, type SessionRequest } from "./matching";

// A Tuesday 10:00-12:00 window for an approved provider offering skill "k8s".
function baseProvider(overrides: Partial<ProviderCandidate> = {}): ProviderCandidate {
  return {
    providerId: "p1",
    name: "Maya",
    approved: true,
    skillIds: ["k8s"],
    proficiencyBySkill: { k8s: "expert" },
    availability: [{ day: "tue", startMin: 600, endMin: 720 }], // 10:00-12:00
    ...overrides,
  };
}

// Requesting k8s on Tuesday at 10:00 (600), default 60-min session -> 10:00-11:00.
const req: SessionRequest = { skillId: "k8s", day: "tue", startMin: 600 };

describe("suggestProviders", () => {
  it("suggests an approved provider who has the skill and covers the slot", () => {
    const out = suggestProviders(req, [baseProvider()]);
    expect(out).toHaveLength(1);
    expect(out[0].providerId).toBe("p1");
    expect(out[0].proficiency).toBe("expert");
  });

  it("excludes providers who are not admin-approved", () => {
    const out = suggestProviders(req, [baseProvider({ approved: false })]);
    expect(out).toHaveLength(0);
  });

  it("excludes providers who do not offer the requested skill", () => {
    const out = suggestProviders(req, [
      baseProvider({ skillIds: ["aws"], proficiencyBySkill: { aws: "expert" } }),
    ]);
    expect(out).toHaveLength(0);
  });

  it("excludes providers with no window on the requested day", () => {
    const out = suggestProviders(req, [
      baseProvider({ availability: [{ day: "wed", startMin: 600, endMin: 720 }] }),
    ]);
    expect(out).toHaveLength(0);
  });

  it("excludes providers whose window starts after the requested time", () => {
    const out = suggestProviders(req, [
      baseProvider({ availability: [{ day: "tue", startMin: 660, endMin: 780 }] }), // 11:00-13:00
    ]);
    expect(out).toHaveLength(0);
  });

  it("excludes providers whose window ends before the session finishes", () => {
    // window 10:00-10:30 cannot hold a 60-min session starting 10:00
    const out = suggestProviders(req, [
      baseProvider({ availability: [{ day: "tue", startMin: 600, endMin: 630 }] }),
    ]);
    expect(out).toHaveLength(0);
  });

  it("ranks higher proficiency first", () => {
    const expert = baseProvider({ providerId: "expert", name: "Ada", proficiencyBySkill: { k8s: "expert" } });
    const beginner = baseProvider({ providerId: "beg", name: "Bo", proficiencyBySkill: { k8s: "beginner" } });
    const out = suggestProviders(req, [beginner, expert]);
    expect(out.map((s) => s.providerId)).toEqual(["expert", "beg"]);
  });

  it("is deterministic: equal proficiency ties break by name", () => {
    const zoe = baseProvider({ providerId: "z", name: "Zoe" });
    const amy = baseProvider({ providerId: "a", name: "Amy" });
    const out = suggestProviders(req, [zoe, amy]);
    expect(out.map((s) => s.providerId)).toEqual(["a", "z"]);
  });

  it("honours a custom session duration", () => {
    // 90-min session from 10:00 needs the window to reach 11:30 (690)
    const longReq: SessionRequest = { ...req, durationMin: 90 };
    const fits = baseProvider({ availability: [{ day: "tue", startMin: 600, endMin: 690 }] });
    const tooShort = baseProvider({
      providerId: "short",
      availability: [{ day: "tue", startMin: 600, endMin: 660 }],
    });
    expect(suggestProviders(longReq, [fits])).toHaveLength(1);
    expect(suggestProviders(longReq, [tooShort])).toHaveLength(0);
  });
});
