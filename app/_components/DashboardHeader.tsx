import Link from "next/link";
import { signOutAction } from "@/app/auth-actions";
import type { Role } from "@/lib/auth/access";

// Shared top bar for the role dashboards: who you are + sign out.
export default function DashboardHeader({
  name,
  role,
}: {
  name: string;
  role: Role;
}) {
  return (
    <header className="row between" style={{ marginBottom: "1.75rem" }}>
      <Link href="/" style={{ fontWeight: 700, color: "var(--foreground)" }}>
        JoslaLink
      </Link>
      <div className="row" style={{ gap: "0.75rem" }}>
        <span className="small muted">{name}</span>
        <span className="badge badge--role">{role}</span>
        <form action={signOutAction}>
          <button className="btn btn--small" type="submit">
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
