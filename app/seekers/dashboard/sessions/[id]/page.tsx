import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import DashboardShell from "@/app/_components/DashboardShell";
import { StatusBadge } from "@/app/_components/dashboard/StatusBadge";
import { getSeekerRequest } from "@/lib/services/requests";
import { label12 } from "@/app/_components/ui/datetime";
import styles from "./detail.module.css";

function dateLabel(d: Date) {
  return d.toLocaleDateString(undefined, { dateStyle: "medium" } as Intl.DateTimeFormatOptions);
}
function timeOfDay(d: Date) {
  return label12(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
}

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [session, { id }] = await Promise.all([auth(), params]);
  const seekerId = session!.user!.id!;
  // Scoped to the owner - a mismatched id returns null -> 404 (IDOR-safe).
  const req = await getSeekerRequest(seekerId, id);
  if (!req) notFound();

  const skills = req.skillName.split(",").map((s) => s.trim()).filter(Boolean);

  return (
    <DashboardShell
      user={{ name: session!.user!.name!, email: session!.user!.email, role: "seeker" }}
      title="Session request"
    >
      <div className="stack" style={{ gap: "1.25rem" }}>
        <Link href="/seekers/dashboard/sessions" className="small">
          ← Back to sessions
        </Link>

        <div className="pageHead">
          <div className="stack" style={{ gap: "0.4rem" }}>
            <h1 className={styles.title}>Ref: {req.reference ?? "-"}</h1>
            <p className="muted small" style={{ margin: 0 }}>
              Requested on {dateLabel(req.createdAt)}
            </p>
          </div>
          <StatusBadge status={req.status} />
        </div>

        {/* Everything, two columns */}
        <div className="card">
          <div className={styles.grid}>
            <div className={`${styles.item} ${styles.full}`}>
              <span className={styles.k}>Skills</span>
              <span className={styles.chips}>
                {skills.length ? (
                  skills.map((s) => (
                    <span key={s} className="badge badge--role">{s}</span>
                  ))
                ) : (
                  <span className={styles.v}>-</span>
                )}
              </span>
            </div>

            <div className={styles.item}>
              <span className={styles.k}>Commitment</span>
              <span className={styles.v}>{req.commitmentMonths} months</span>
            </div>
            <div className={styles.item}>
              <span className={styles.k}>Window</span>
              <span className={styles.v}>
                {dateLabel(req.startDate)} – {dateLabel(req.endDate)}
              </span>
            </div>

            <div className={styles.item}>
              <span className={styles.k}>Timezone</span>
              <span className={styles.v}>{req.timezone.replace(/_/g, " ")}</span>
            </div>
            <div className={styles.item}>
              <span className={styles.k}>Status</span>
              <span className={styles.v}>
                <StatusBadge status={req.status} />
              </span>
            </div>

            <div className={styles.item}>
              <span className={styles.k}>Requested on</span>
              <span className={styles.v}>{dateLabel(req.createdAt)}</span>
            </div>

            <div className={`${styles.item} ${styles.full}`}>
              <span className={styles.k}>Preferred times</span>
              {req.times.length ? (
                <span className={styles.chips}>
                  {req.times.map((t) => (
                    <span key={t.id} className="badge badge--role">{timeOfDay(t.datetime)}</span>
                  ))}
                </span>
              ) : (
                <span className={styles.v}>None provided</span>
              )}
            </div>

            <div className={`${styles.item} ${styles.full}`}>
              <span className={styles.k}>Additional details</span>
              <span className={`${styles.v} ${styles.note}`}>
                {req.note ? req.note : "None"}
              </span>
            </div>
          </div>
        </div>

        <p className="notice notice--info">
          An admin reviews your request and matches you with a provider. You&apos;ll
          see the status change here once it&apos;s picked up.
        </p>
      </div>
    </DashboardShell>
  );
}
