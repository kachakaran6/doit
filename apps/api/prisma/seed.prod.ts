import { PrismaClient, Role, AccentName } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  // eslint-disable-next-line no-console
  console.log('Seeding DoIt database with clean PRODUCTION admin account...');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@samyukt.com';
  const rawPassword = process.env.ADMIN_PASSWORD || 'DoItAdmin2026!Secure';
  const adminName = process.env.ADMIN_NAME || 'DoIt Administrator';

  const passwordHash = await argon2.hash(rawPassword);

  // 1. Create or ensure single Admin User
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
    },
    create: {
      email: adminEmail,
      passwordHash,
      name: adminName,
      locale: 'en-IN',
      prefs: { theme: 'DARK', accent: 'INDIGO' },
    },
  });

  // eslint-disable-next-line no-console
  console.log(`✔ Admin user ready: ${admin.email} (id: ${admin.id})`);

  // 2. Ensure initial primary workspace
  const workspaceSlug = 'doit-prod';
  const workspace = await prisma.workspace.upsert({
    where: { slug: workspaceSlug },
    update: {},
    create: {
      name: 'DoIt Primary',
      slug: workspaceSlug,
      ownerId: admin.id,
    },
  });

  // 3. Ensure admin membership
  await prisma.membership.upsert({
    where: {
      workspaceId_userId: {
        workspaceId: workspace.id,
        userId: admin.id,
      },
    },
    update: { role: Role.OWNER },
    create: {
      workspaceId: workspace.id,
      userId: admin.id,
      role: Role.OWNER,
    },
  });

  // 4. Ensure initial project
  await prisma.project.upsert({
    where: {
      workspaceId_key: {
        workspaceId: workspace.id,
        key: 'DOIT',
      },
    },
    update: {},
    create: {
      name: 'General Tasks & Bugs',
      key: 'DOIT',
      workspaceId: workspace.id,
      color: AccentName.INDIGO,
    },
  });

  // eslint-disable-next-line no-console
  console.log(`✔ Production workspace '${workspace.name}' and project 'DOIT' initialized.`);
  // eslint-disable-next-line no-console
  console.log('✔ Zero mock tasks, zero demo stickies, zero dummy users generated.');
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error('Failed to run production seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
