import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import DashboardShell from "@/app/_components/DashboardShell";
import { ProfileCard } from "@/app/_components/dashboard/ProfileCard";
import { ProviderSessionsTable } from "@/app/_components/dashboard/ProviderSessionsTable";
import { getAssignedSeeker } from "@/lib/services/providers";

function dateOnly(d: Date) {
  return d.toLocaleDateString(undefined, { dateStyle: "medium" } as Intl.DateTimeFormatOptions);
}

export default async function AssignedSeekerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [session, { id }] = await Promise.all([auth(), params]);
  const providerId = session!.user!.id!;
  const data = await getAssignedSeeker(providerId, id);
  if (!data || !data.seeker) notFound();

  const s = data.seeker;
  const pkg = data.bookings.find((b) => b.request)?.request ?? null;
  const waDigits = s.whatsapp?.replace(/[^0-9]/g, "");

  return (
    <DashboardShell
      user={{ name: session!.user!.name!, email: session!.user!.email, role: "provider" }}
      title={s.name}
    >
      <div className="stack" style={{ gap: "1.25rem" }}>
        <Link href="/providers/dashboard/seekers" className="small">
          ← Back to my seekers
        </Link>

        {/* Quick contact actions */}
        <div className="row" style={{ gap: "0.6rem", flexWrap: "wrap" }}>
          {waDigits && (
            <a className="btn btn--primary" href={`https://wa.me/${waDigits}`} target="_blank" rel="noreferrer">
              Message on WhatsApp
            </a>
          )}
          {s.phone && (
            <a className="btn" href={`tel:${s.phone.replace(/[^0-9+]/g, "")}`}>
              Call {s.phone}
            </a>
          )}
          {s.email && (
            <a className="btn" href={`mailto:${s.email}`}>
              Email
            </a>
          )}
        </div>

        {/* Contact card - no personal/billing address */}
        <ProfileCard
          hideAddress
          p={{
            name: s.name,
            email: s.email,
            createdAt: s.createdAt,
            headline: s.headline,
            bio: s.bio,
            location: s.location,
            avatarUrl: s.avatarUrl,
            company: s.company,
            position: s.position,
            linkedin: s.linkedin,
            github: s.github,
            website: s.website,
            skills: s.skills,
            phone: s.phone,
            whatsapp: s.whatsapp,
          }}
        />

        {/* Package */}
        {pkg && (
          <div className="card stack" style={{ gap: "0.5rem" }}>
            <h2 style={{ fontSize: "1.05rem" }}>Package</h2>
            <div>{pkg.skillName}</div>
            <div className="muted small">
              {pkg.commitmentMonths}-month plan · {dateOnly(pkg.startDate)} – {dateOnly(pkg.endDate)}
            </div>
          </div>
        )}

        {/* Sessions with this seeker */}
        <div className="card stack">
          <h2 style={{ fontSize: "1.05rem" }}>Sessions</h2>
          <ProviderSessionsTable rows={data.bookings} />
        </div>
      </div>
    </DashboardShell>
  );
}
