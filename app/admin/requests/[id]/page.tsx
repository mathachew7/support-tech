import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import DashboardShell from "@/app/_components/DashboardShell";
import { getRequestForAssign, listApprovedProviders } from "@/lib/services/admin";
import { whenLabel } from "@/app/_components/dashboard/format";
import { AssignSection } from "./AssignSection";

function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function dateOnly(d: Date): string {
  return d.toLocaleDateString(undefined, { dateStyle: "medium" } as Intl.DateTimeFormatOptions);
}

export default async function AssignRequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [session, { id }] = await Promise.all([auth(), params]);
  const req = await getRequestForAssign(id);
  if (!req) notFound();

  const providers = await listApprovedProviders();
  const requestSkills = req.skillName.split(",").map((s) => s.trim()).filter(Boolean);
  const times = req.times.map((t) => ({ iso: toLocalInput(t.datetime), label: whenLabel(t.datetime) }));
  const providerOptions = providers.map((p) => ({
    id: p.id,
    name: p.name,
    headline: p.headline,
    skills: p.providerSkills.map((ps) => ps.skill.name),
    availabilityDays: new Set(p.availability.map((a) => a.day)).size,
  }));

  return (
    <DashboardShell
      user={{ name: session!.user!.name!, email: session!.user!.email, role: "admin" }}
      title="Match & assign"
    >
      <div className="stack" style={{ gap: "1.25rem" }}>
        <Link href="/admin/requests" className="small">← Back to requests</Link>

        {/* Request summary */}
        <div className="card stack" style={{ gap: "0.9rem" }}>
          <div className="row between" style={{ alignItems: "flex-start" }}>
            <div>
              <h2 style={{ fontSize: "1.2rem" }}>
                <Link
                  href={`/admin/users/${req.seekerId}`}
                  style={{ color: "var(--accent)", textDecoration: "none" }}
                >
                  {req.seeker.name}
                </Link>
              </h2>
              <div className="muted small">{req.seeker.email}</div>
            </div>
            <span className="badge badge--pending">Awaiting match</span>
          </div>

          <div className="stack" style={{ gap: "0.3rem" }}>
            <span className="small" style={{ fontWeight: 700 }}>Skills requested</span>
            <div className="row" style={{ gap: "0.4rem", flexWrap: "wrap" }}>
              {requestSkills.length ? (
                requestSkills.map((s) => (
                  <span key={s} className="badge badge--role">{s}</span>
                ))
              ) : (
                <span className="muted small">-</span>
              )}
            </div>
          </div>

          <div className="widgetGrid">
            <div>
              <span className="small" style={{ fontWeight: 700 }}>Plan</span>
              <div className="muted small">
                {req.commitmentMonths}-month plan · {dateOnly(req.startDate)} – {dateOnly(req.endDate)}
              </div>
            </div>
            <div>
              <span className="small" style={{ fontWeight: 700 }}>Timezone · Requested</span>
              <div className="muted small">
                {req.timezone.replace(/_/g, " ")} · {dateOnly(req.createdAt)}
              </div>
            </div>
          </div>

          <div className="stack" style={{ gap: "0.3rem" }}>
            <span className="small" style={{ fontWeight: 700 }}>Preferred times</span>
            {req.times.length ? (
              <div className="row" style={{ gap: "0.4rem", flexWrap: "wrap" }}>
                {req.times.map((t) => (
                  <span key={t.id} className="badge badge--role">{whenLabel(t.datetime)}</span>
                ))}
              </div>
            ) : (
              <span className="muted small">No times provided</span>
            )}
          </div>

          {req.note && (
            <div className="stack" style={{ gap: "0.3rem" }}>
              <span className="small" style={{ fontWeight: 700 }}>Note from seeker</span>
              <p className="muted small" style={{ margin: 0 }}>{req.note}</p>
            </div>
          )}
        </div>

        {/* Assign (form reveals on click) */}
        <AssignSection
          requestId={req.id}
          requestSkills={requestSkills}
          times={times}
          providers={providerOptions}
        />
      </div>
    </DashboardShell>
  );
}
