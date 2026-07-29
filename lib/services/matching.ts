// Provider suggestion for a seeker's session request. Pure + framework-free so
// the matching rules are fast to unit test; the DB layer feeds it candidates.
//
// A provider is suggestable for a request only if ALL hold:
//   1. admin-approved (only approved providers are bookable - Phase 1 rule),
//   2. offers the requested skill,
//   3. has a weekly availability window that fully covers the session slot.
// Survivors are ranked by proficiency (highest first), ties broken by name so
// the output is deterministic.

import type { Window, Day } from "./availability";

export type Proficiency = "beginner" | "intermediate" | "advanced" | "expert";

export const DEFAULT_SESSION_MIN = 60;

const PROFICIENCY_RANK: Record<Proficiency, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4,
};

export type ProviderCandidate = {
  providerId: string;
  name: string;
  approved: boolean;
  skillIds: string[];
  proficiencyBySkill?: Record<string, Proficiency>;
  availability: Window[];
};

export type SessionRequest = {
  skillId: string;
  day: Day;
  startMin: number; // minute of day, 0..1439
  durationMin?: number; // defaults to DEFAULT_SESSION_MIN
};

export type Suggestion = {
  providerId: string;
  name: string;
  proficiency: Proficiency | null;
  score: number;
};

/** True if some window on `day` fully contains [startMin, startMin+duration]. */
export function coversSlot(
  windows: Window[],
  day: Day,
  startMin: number,
  durationMin: number,
): boolean {
  const endMin = startMin + durationMin;
  return windows.some(
    (w) => w.day === day && w.startMin <= startMin && w.endMin >= endMin,
  );
}

export function suggestProviders(
  req: SessionRequest,
  candidates: ProviderCandidate[],
): Suggestion[] {
  const duration = req.durationMin ?? DEFAULT_SESSION_MIN;

  const matches: Suggestion[] = [];
  for (const c of candidates) {
    if (!c.approved) continue;
    if (!c.skillIds.includes(req.skillId)) continue;
    if (!coversSlot(c.availability, req.day, req.startMin, duration)) continue;

    const proficiency = c.proficiencyBySkill?.[req.skillId] ?? null;
    const score = proficiency ? PROFICIENCY_RANK[proficiency] : 0;
    matches.push({ providerId: c.providerId, name: c.name, proficiency, score });
  }

  // Highest score first; deterministic tie-break by name then id.
  matches.sort(
    (a, b) =>
      b.score - a.score ||
      a.name.localeCompare(b.name) ||
      a.providerId.localeCompare(b.providerId),
  );
  return matches;
}
