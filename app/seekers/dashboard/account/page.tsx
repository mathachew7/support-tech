import { auth } from "@/lib/auth/auth";
import DashboardShell from "@/app/_components/DashboardShell";
import { getSeekerProfile } from "@/lib/services/seekers";
import { getSkillCatalog } from "@/lib/services/providers";
import { AccountProfile } from "./AccountProfile";

export default async function SeekerAccountPage() {
  const session = await auth();
  const seekerId = session!.user!.id!;
  const [profile, catalog] = await Promise.all([
    getSeekerProfile(seekerId),
    getSkillCatalog(),
  ]);

  const name = profile?.name ?? session!.user!.name!;
  const skills = profile?.skills ?? [];

  return (
    <DashboardShell
      user={{ name, email: session!.user!.email, role: "seeker" }}
      title="Account"
    >
      <AccountProfile
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
          skills,
          street: profile?.street,
          city: profile?.city,
          state: profile?.state,
          zip: profile?.zip,
          country: profile?.country,
        }}
        editable={{
          headline: profile?.headline ?? "",
          bio: profile?.bio ?? "",
          location: profile?.location ?? "",
          avatarUrl: profile?.avatarUrl ?? "",
          company: profile?.company ?? "",
          position: profile?.position ?? "",
          linkedin: profile?.linkedin ?? "",
          github: profile?.github ?? "",
          website: profile?.website ?? "",
          skills,
          street: profile?.street ?? "",
          city: profile?.city ?? "",
          state: profile?.state ?? "",
          zip: profile?.zip ?? "",
          country: profile?.country ?? "",
        }}
        skillOptions={catalog.map((s) => s.name)}
      />
    </DashboardShell>
  );
}
