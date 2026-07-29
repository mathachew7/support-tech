import { auth } from "@/lib/auth/auth";
import DashboardHeader from "@/app/_components/DashboardHeader";
import { listUsers } from "@/lib/services/admin";
import { approveProviderAction } from "./actions";

const STATUS_BADGE: Record<string, string> = {
  pending: "badge--pending",
  approved: "badge--approved",
  suspended: "badge--suspended",
};

function dateLabel(d: Date) {
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function AdminPage() {
  const session = await auth();
  const users = await listUsers();
  const pendingProviders = users.filter(
    (u) => u.role === "provider" && u.status === "pending",
  ).length;

  return (
    <main className="page">
      <DashboardHeader name={session!.user!.name!} role="admin" />

      <div className="stack" style={{ gap: "1.25rem" }}>
        <div className="stack" style={{ gap: "0.35rem" }}>
          <h1>Users</h1>
          <p className="muted small">
            {users.length} total.{" "}
            {pendingProviders > 0
              ? `${pendingProviders} provider${pendingProviders === 1 ? "" : "s"} awaiting approval.`
              : "No providers awaiting approval."}
          </p>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Profile</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td className="muted">{u.email}</td>
                  <td>
                    <span className="badge badge--role">{u.role}</span>
                  </td>
                  <td>
                    <span className={`badge ${STATUS_BADGE[u.status] ?? ""}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="muted small">
                    {u.role === "provider"
                      ? `${u._count.providerSkills} skill${u._count.providerSkills === 1 ? "" : "s"}, ${u._count.availability} slot${u._count.availability === 1 ? "" : "s"}`
                      : "-"}
                  </td>
                  <td className="muted small">{dateLabel(u.createdAt)}</td>
                  <td>
                    {u.role === "provider" && u.status === "pending" ? (
                      <form action={approveProviderAction}>
                        <input type="hidden" name="userId" value={u.id} />
                        <button className="btn btn--primary btn--small" type="submit">
                          Approve
                        </button>
                      </form>
                    ) : (
                      <span className="muted small">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
