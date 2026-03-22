import { hash } from "bcryptjs";
import { PrismaClient, PortalRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_OWNER_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_OWNER_PASSWORD?.trim();
  const firstName = process.env.SEED_OWNER_FIRST_NAME?.trim() || "Portal";
  const lastName = process.env.SEED_OWNER_LAST_NAME?.trim() || "Owner";

  if (!email) {
    throw new Error("Missing SEED_OWNER_EMAIL in environment.");
  }

  if (!password) {
    throw new Error("Missing SEED_OWNER_PASSWORD in environment.");
  }

  const passwordHash = await hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      firstName,
      lastName,
      isActive: true,
      passwordHash,
    },
    create: {
      email,
      firstName,
      lastName,
      isActive: true,
      passwordHash,
    },
    select: {
      id: true,
      email: true,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_role: {
        userId: user.id,
        role: PortalRole.OWNER,
      },
    },
    update: {},
    create: {
      userId: user.id,
      role: PortalRole.OWNER,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_role: {
        userId: user.id,
        role: PortalRole.ADMIN,
      },
    },
    update: {},
    create: {
      userId: user.id,
      role: PortalRole.ADMIN,
    },
  });

  console.log("Seeded owner user:");
  console.log(`- Email: ${user.email}`);
  console.log("- Roles: OWNER, ADMIN");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });