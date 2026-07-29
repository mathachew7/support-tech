export default function Home() {
  return (
    <main style={{ maxWidth: 640, margin: "4rem auto", padding: "0 1rem", fontFamily: "system-ui, sans-serif", lineHeight: 1.6 }}>
      <h1>support-tech</h1>
      <p>Tech mentorship marketplace. Phase 0 scaffold - auth, roles, and feature-domain structure.</p>
      <h2 style={{ fontSize: "1rem", marginTop: "2rem" }}>Role-gated areas</h2>
      <ul>
        <li><a href="/admin">Admin</a></li>
        <li><a href="/providers/dashboard">Provider dashboard</a></li>
        <li><a href="/seekers/dashboard">Seeker dashboard</a></li>
      </ul>
    </main>
  );
}
