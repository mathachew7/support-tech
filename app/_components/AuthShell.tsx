import Link from "next/link";
import styles from "./auth.module.css";

// Centered auth layout: logo + tagline, a single card, trust badges.
// Shared by the login and signup pages so both stay on-brand.
export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.authRoot}>
      <div className={styles.authCenter}>
        <Link href="/" className={styles.brand}>
          <span className={styles.mark}>J</span>
          JoslaLink
        </Link>
        <p className={styles.tagline}>Tech mentorship, matched by humans.</p>

        <div className={styles.card}>{children}</div>

        <p className={styles.foot}>
          <Link href="/" className={styles.footLink}>← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
