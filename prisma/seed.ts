import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Starter skill catalog. Admin-curated later; this just gives providers
// something to attach to in Phase 1. Idempotent: safe to run repeatedly.
const CATALOG: { category: string; names: string[] }[] = [
  { category: "Cloud & Infrastructure", names: ["AWS", "Kubernetes", "Docker", "Terraform"] },
  { category: "Languages", names: ["Python", "TypeScript", "Go", "Java"] },
  { category: "Data", names: ["SQL", "PostgreSQL", "Data Engineering"] },
  { category: "Frontend", names: ["React", "Next.js"] },
  { category: "Backend", names: ["Node.js", "System Design"] },
  { category: "Practices", names: ["CI/CD", "Git"] },
];

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  for (const { category, names } of CATALOG) {
    for (const name of names) {
      const slug = slugify(name);
      await prisma.skill.upsert({
        where: { slug },
        update: { name, category },
        create: { name, slug, category },
      });
    }
  }
  const count = await prisma.skill.count();
  console.log(`Seed complete: ${count} skills in catalog.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
