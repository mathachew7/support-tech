import { auth } from "@/lib/auth/auth";
import DashboardShell from "@/app/_components/DashboardShell";
import { getProviderProfile } from "@/lib/services/providers";
import { ProviderAccount } from "./ProviderAccount";

function initials(name: string): string {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase() || "?";
}

export default async function ProviderAccountPage() {
  const session = await auth();
  const profile = await getProviderProfile(session!.user!.id!);

  const name = profile?.name ?? session!.user!.name!;
  const skillNames = (profile?.providerSkills ?? []).map((ps) => ps.skill.name);

  return (
    <DashboardShell
      user={{ name, email: session!.user!.email, role: "provider" }}
      title="Account"
    >
      <ProviderAccount
        card={{
          name,
          email: profile?.email ?? session!.user!.email,
          createdAt: profile?.createdAt,
          headline: profile?.headline,
          bio: profile?.bio,
          location: profile?.location,
          avatarUrl: profile?.avatarUrl,
          company: profile?.company,
          position: profile?.position,
          linkedin: profile?.linkedin,
          github: profile?.github,
          website: profile?.website,
          skills: skillNames,
          phone: profile?.phone,
          whatsapp: profile?.whatsapp,
          street: profile?.street,
          city: profile?.city,
          state: profile?.state,
          zip: profile?.zip,
          country: profile?.country,
        }}
        values={{
          headline: profile?.headline ?? "",
          bio: profile?.bio ?? "",
          location: profile?.location ?? "",
          avatarUrl: profile?.avatarUrl ?? "",
          company: profile?.company ?? "",
          position: profile?.position ?? "",
          linkedin: profile?.linkedin ?? "",
          github: profile?.github ?? "",
          website: profile?.website ?? "",
          phone: profile?.phone ?? "",
          whatsapp: profile?.whatsapp ?? "",
          street: profile?.street ?? "",
          city: profile?.city ?? "",
          state: profile?.state ?? "",
          zip: profile?.zip ?? "",
          country: profile?.country ?? "",
        }}
        fallbackInitials={initials(name)}
      />
    </DashboardShell>
  );
}
