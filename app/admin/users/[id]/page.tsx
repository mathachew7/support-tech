import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import DashboardShell from "@/app/_components/DashboardShell";
import { ProfileCard } from "@/app/_components/dashboard/ProfileCard";
import { getUserById } from "@/lib/services/admin";

const STATUS_BADGE: Record<string, string> = {
  pending: "badge--pending",
  approved: "badge--approved",
  suspended: "badge--suspended",
};

export default async function AdminUserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [session, { id }] = await Promise.all([auth(), params]);
  const u = await getUserById(id);
  if (!u) notFound();

  return (
    <DashboardShell
      user={{ name: session!.user!.name!, email: session!.user!.email, role: "admin" }}
      title={u.name}
    >
      <div className="stack" style={{ gap: "1.25rem" }}>
        <Link href="/admin/users" className="small">← Back to users</Link>

        <div className="row" style={{ gap: "0.5rem" }}>
          <span className="badge badge--role">{u.role}</span>
          <span className={`badge ${STATUS_BADGE[u.status] ?? ""}`}>{u.status}</span>
        </div>

        <ProfileCard
          p={{
            name: u.name,
            email: u.email,
            createdAt: u.createdAt,
            headline: u.headline,
            bio: u.bio,
            location: u.location,
            avatarUrl: u.avatarUrl,
            company: u.company,
            position: u.position,
            linkedin: u.linkedin,
            github: u.github,
            website: u.website,
            skills: u.skills,
            phone: u.phone,
            whatsapp: u.whatsapp,
            street: u.street,
            city: u.city,
            state: u.state,
            zip: u.zip,
            country: u.country,
          }}
        />
      </div>
    </DashboardShell>
  );
}
