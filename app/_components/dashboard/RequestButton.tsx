import Link from "next/link";
import { MAX_ACTIVE_REQUESTS, isAtRequestLimit } from "@/lib/services/requests-core";

/**
 * "Request a session" CTA that turns into a limit note once the seeker holds
 * the max active requests. (Convenience only - the server still enforces it.)
 */
export function RequestButton({ activeCount }: { activeCount: number }) {
  if (isAtRequestLimit(activeCount)) {
    return (
      <span className="muted small">
        Limit reached ({MAX_ACTIVE_REQUESTS} active) - complete or cancel one to request more.
      </span>
    );
  }
  return (
    <Link href="/seekers/dashboard/request" className="btn btn--primary">
      + Request a session
    </Link>
  );
}
