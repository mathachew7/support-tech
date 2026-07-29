import AuthShell from "@/app/_components/AuthShell";
import LoginForm from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; registered?: string }>;
}) {
  const { callbackUrl, registered } = await searchParams;

  return (
    <AuthShell>
      <LoginForm
        callbackUrl={callbackUrl || "/dashboard"}
        registered={registered === "1"}
      />
    </AuthShell>
  );
}
