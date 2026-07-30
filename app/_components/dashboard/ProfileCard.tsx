import { addressLines } from "./invoice-format";
import styles from "./profile-card.module.css";

export type ProfileCardData = {
  name: string;
  email?: string | null;
  createdAt?: Date;
  headline?: string | null;
  bio?: string | null;
  location?: string | null;
  avatarUrl?: string | null;
  company?: string | null;
  position?: string | null;
  linkedin?: string | null;
  github?: string | null;
  website?: string | null;
  skills?: string[];
  phone?: string | null;
  whatsapp?: string | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
};

function initials(name: string): string {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase() || "?";
}
function host(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

const icons = {
  linkedin: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM3 9h4v12H3zM10 9h3.8v1.7h.05c.53-.95 1.83-1.95 3.76-1.95 4.02 0 4.76 2.5 4.76 5.76V21H18.6v-5.3c0-1.26-.02-2.9-1.77-2.9-1.77 0-2.04 1.38-2.04 2.8V21H10z" /></svg>
  ),
  github: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.5 2 2 6.6 2 12.2c0 4.5 2.9 8.3 6.8 9.6.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.4-3.4-1.4-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1a9.3 9.3 0 015 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.3 4.7-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5 3.9-1.3 6.8-5.1 6.8-9.6C22 6.6 17.5 2 12 2z" /></svg>
  ),
  globe: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18" /></svg>
  ),
};

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className={styles.detail}>
      <span className={styles.dk}>{label}</span>
      <span className={styles.dv}>{value || "-"}</span>
    </div>
  );
}

export function ProfileCard({
  p,
  onEdit,
  hideAddress = false,
}: {
  p: ProfileCardData;
  onEdit?: () => void;
  hideAddress?: boolean;
}) {
  const joined = p.createdAt
    ? p.createdAt.toLocaleDateString(undefined, { month: "long", year: "numeric" })
    : null;
  const address = addressLines(p);

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        {onEdit && (
          <button type="button" className={`btn btn--small ${styles.editBtn}`} onClick={onEdit}>
            Edit profile
          </button>
        )}
        <div className={styles.avatar}>
          {p.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className={styles.avatarImg} src={p.avatarUrl} alt={p.name} />
          ) : (
            initials(p.name)
          )}
        </div>
        <div className={styles.headText}>
          <div className={styles.name}>{p.name}</div>
          {joined && <div className={styles.joined}>Joined {joined}</div>}
          {(p.position || p.company) && (
            <div className={styles.title}>
              {p.position}
              {p.company && (
                <>
                  {p.position ? " at " : ""}
                  <span className={styles.company}>{p.company}</span>
                </>
              )}
            </div>
          )}
          {p.headline && <div className={styles.headline}>{p.headline}</div>}

          <div className={styles.links}>
            {p.linkedin && (
              <a className={styles.link} href={p.linkedin} target="_blank" rel="noreferrer">
                {icons.linkedin} LinkedIn
              </a>
            )}
            {p.github && (
              <a className={styles.link} href={p.github} target="_blank" rel="noreferrer">
                {icons.github} GitHub
              </a>
            )}
            {p.website && (
              <a className={styles.link} href={p.website} target="_blank" rel="noreferrer">
                {icons.globe} {host(p.website)}
              </a>
            )}
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>About</div>
        {p.bio ? <p className={styles.about}>{p.bio}</p> : <p className={styles.empty}>No bio yet.</p>}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Details</div>
        <div className={styles.details}>
          <Detail label="Current company" value={p.company} />
          <Detail label="Position" value={p.position} />
          <Detail label="Location" value={p.location} />
          <Detail label="Email" value={p.email} />
          <Detail label="Phone" value={p.phone} />
          <div className={styles.detail}>
            <span className={styles.dk}>WhatsApp</span>
            {p.whatsapp ? (
              <a
                className={styles.dv}
                href={`https://wa.me/${p.whatsapp.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noreferrer"
                style={{ color: "var(--accent)" }}
              >
                {p.whatsapp}
              </a>
            ) : (
              <span className={styles.dv}>-</span>
            )}
          </div>
          {!hideAddress && (
            <div className={styles.detail}>
              <span className={styles.dk}>Billing address</span>
              <span className={styles.dv}>
                {address.length ? address.join(", ") : "-"}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Skills &amp; interests</div>
        {p.skills && p.skills.length ? (
          <div className={styles.skills}>
            {p.skills.map((s) => (
              <span key={s} className={styles.skill}>{s}</span>
            ))}
          </div>
        ) : (
          <p className={styles.empty}>No skills added yet.</p>
        )}
      </div>
    </div>
  );
}
