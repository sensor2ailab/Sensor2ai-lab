// Creates (or promotes) the first admin. Never exposed via HTTP.
import { prisma } from "@/server/db/prisma";
import { hashPassword, passwordPolicy } from "@/server/auth/password";

async function main(): Promise<void> {
  const email = process.env.SEED_ADMIN_EMAIL ?? process.argv[2];
  const password = process.env.SEED_ADMIN_PASSWORD ?? process.argv[3];
  const fullName = process.env.SEED_ADMIN_NAME ?? process.argv[4] ?? "Lab Admin";

  if (!email || !password) {
    console.error(
      "Usage: SEED_ADMIN_EMAIL=.. SEED_ADMIN_PASSWORD=.. npm run seed:admin\n" +
        "   or: npm run seed:admin -- <email> <password> [fullName]",
    );
    process.exitCode = 1;
    return;
  }

  passwordPolicy.parse(password);
  const passwordHash = await hashPassword(password);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { role: "admin", passwordHash, isActive: true, mustChangePassword: false },
    create: {
      email,
      passwordHash,
      role: "admin",
      fullName,
      isActive: true,
      mustChangePassword: false,
    },
  });

  console.log(`Admin ready: ${admin.email} (${admin.id})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
