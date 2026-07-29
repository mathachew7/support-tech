import Link from "next/link";

export default function Forbidden() {
  return (
    <main className="page page--narrow">
      <div className="card stack">
        <h1>Access denied</h1>
        <p className="muted">
          Your account does not have permission to view that page.
        </p>
        <Link className="btn btn--primary" href="/dashboard">
          Go to your dashboard
        </Link>
      </div>
    </main>
  );
}
