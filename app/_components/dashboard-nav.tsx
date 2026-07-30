import type { Role } from "@/lib/auth/access";

export type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  soon?: boolean; // rendered disabled with a "Soon" tag (planned, not built)
};
export type NavSection = { title: string; items: NavItem[] };

// ---- Icons (inline so the shell has no asset deps) ----
const stroke = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};
export const Icons = {
  grid: (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></svg>
  ),
  calendar: (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
  ),
  calendarPlus: (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M12 14v4M10 16h4" /></svg>
  ),
  clock: (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
  ),
  user: (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke}><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" /></svg>
  ),
  card: (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke}><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20M6 15h4" /></svg>
  ),
  users: (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 21v-1A5.5 5.5 0 0 1 8 14.5h2A5.5 5.5 0 0 1 15.5 20v1" /><path d="M16 3.5a3.5 3.5 0 0 1 0 7M18 14.5a5.5 5.5 0 0 1 3.5 5.1V21" /></svg>
  ),
  bolt: (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke}><path d="M13 2 4 14h7l-1 8 9-12h-7z" /></svg>
  ),
  gear: (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
  ),
};

const SEEKER: NavSection[] = [
  {
    title: "Menu",
    items: [
      { href: "/seekers/dashboard", label: "Overview", icon: Icons.grid },
      { href: "/seekers/dashboard/request", label: "Request a session", icon: Icons.calendarPlus },
      { href: "/seekers/dashboard/sessions", label: "Sessions", icon: Icons.calendar },
      { href: "/seekers/dashboard/history", label: "History", icon: Icons.clock },
    ],
  },
  {
    title: "Account",
    items: [
      { href: "/seekers/dashboard/account", label: "Account", icon: Icons.user },
      { href: "/seekers/dashboard/payments", label: "Payments", icon: Icons.card },
    ],
  },
];

const PROVIDER: NavSection[] = [
  {
    title: "Menu",
    items: [
      { href: "/providers/dashboard", label: "Overview", icon: Icons.grid },
      { href: "/providers/dashboard/sessions", label: "Sessions", icon: Icons.calendar },
      { href: "/providers/dashboard/history", label: "History", icon: Icons.clock },
      { href: "/providers/dashboard/seekers", label: "My seekers", icon: Icons.users },
    ],
  },
  {
    title: "Account",
    items: [
      { href: "/providers/dashboard/account", label: "Account", icon: Icons.user },
      { href: "/providers/dashboard/settings", label: "Settings", icon: Icons.gear },
      { href: "#", label: "Payouts", icon: Icons.card, soon: true },
    ],
  },
];

const ADMIN: NavSection[] = [
  {
    title: "Menu",
    items: [
      { href: "/admin", label: "Overview", icon: Icons.grid },
      { href: "/admin/requests", label: "Requests", icon: Icons.calendarPlus },
      { href: "/admin/users", label: "Users", icon: Icons.users },
      { href: "/admin/invoices", label: "Invoices", icon: Icons.card },
    ],
  },
];

export function navFor(role: Role): NavSection[] {
  switch (role) {
    case "seeker":
      return SEEKER;
    case "provider":
      return PROVIDER;
    case "admin":
      return ADMIN;
    default:
      return [];
  }
}
