import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import DashboardShell from "@/app/_components/DashboardShell";
import { StatusBadge } from "@/app/_components/dashboard/StatusBadge";
import { whenLabel } from "@/app/_components/dashboard/format";
import { getProviderBooking } from "@/lib/services/providers";
import styles from "./detail.module.css";

function dateOnly(d: Date) {
  return d.toLocaleDateString(undefined, { dateStyle: "medium" } as Intl.DateTimeFormatOptions);
}

export default async function ProviderSessionDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [session, { id }] = await Promise.all([auth(), params]);
  const providerId = session!.user!.id!;
  const b = await getProviderBooking(providerId, id);
  if (!b) notFound();

  const skills = (b.request?.skillName ?? "").split(",").map((s) => s.trim()).filter(Boolean);

  return (
    <DashboardShell
      user={{ name: session!.user!.name!, email: session!.user!.email, role: "provider" }}
      title="Session"
    >
      <div className="stack" style={{ gap: "1.25rem" }}>
        <Link href="/providers/dashboard/sessions" className="small">
          ← Back to sessions
        </Link>

        <div className="pageHead">
          <div className="stack" style={{ gap: "0.4rem" }}>
            <h1 className={styles.title}>{b.reference ?? "Session"}</h1>
            <p className="muted small" style={{ margin: 0 }}>
              {whenLabel(b.datetime)} · {b.durationMin} min
            </p>
          </div>
          <StatusBadge status={b.status} />
        </div>

        <div className="card">
          <div className={styles.grid}>
            <div className={styles.item}>
              <span className={styles.k}>Seeker</span>
              <span className={styles.v}>{b.seeker?.name ?? "-"}</span>
              {b.seeker?.email && <span className={styles.sub}>{b.seeker.email}</span>}
            </div>
            <div className={styles.item}>
              <span className={styles.k}>Scheduled</span>
              <span className={styles.v}>{whenLabel(b.datetime)}</span>
            </div>

            <div className={styles.item}>
              <span className={styles.k}>Duration</span>
              <span className={styles.v}>{b.durationMin} minutes</span>
            </div>
            <div className={styles.item}>
              <span className={styles.k}>Timezone</span>
              <span className={styles.v}>
                {b.request?.timezone?.replace(/_/g, " ") ?? "-"}
              </span>
            </div>

            <div className={styles.item}>
              <span className={styles.k}>Plan window</span>
              <span className={styles.v}>
                {b.request ? `${dateOnly(b.request.startDate)} – ${dateOnly(b.request.endDate)}` : "-"}
              </span>
              <span className={styles.sub}>
                {b.request ? `${b.request.commitmentMonths}-month plan` : ""}
              </span>
            </div>
            <div className={styles.item}>
              <span className={styles.k}>Session focus</span>
              <span className={styles.v}>{b.skill?.name ?? "General"}</span>
            </div>

            <div className={`${styles.item} ${styles.full}`}>
              <span className={styles.k}>Package skills</span>
              {skills.length ? (
                <span className={styles.chips}>
                  {skills.map((s) => (
                    <span key={s} className="badge badge--role">{s}</span>
                  ))}
                </span>
              ) : (
                <span className={styles.v}>-</span>
              )}
            </div>

            <div className={`${styles.item} ${styles.full}`}>
              <span className={styles.k}>Notes from admin</span>
              <span className={`${styles.v} ${styles.note}`}>
                {b.note ? b.note : "No notes for this session."}
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
