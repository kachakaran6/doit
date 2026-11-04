import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Running migration...');
  
  // Create enum
  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);
  console.log('Enum InvitationStatus verified.');

  // Create WorkspaceInvitation table
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "WorkspaceInvitation" (
      "id" UUID NOT NULL DEFAULT gen_random_uuid(),
      "workspaceId" UUID NOT NULL,
      "email" TEXT,
      "tokenHash" TEXT NOT NULL,
      "role" "Role" NOT NULL DEFAULT 'TESTER',
      "invitedById" UUID NOT NULL,
      "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
      "maxUses" INTEGER NOT NULL DEFAULT 1,
      "usesCount" INTEGER NOT NULL DEFAULT 0,
      "expiresAt" TIMESTAMP(3) NOT NULL,
      "acceptedAt" TIMESTAMP(3),
      "revokedAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "WorkspaceInvitation_pkey" PRIMARY KEY ("id")
    );
  `);
  console.log('WorkspaceInvitation table verified.');

  // Create SmtpConfig table
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "SmtpConfig" (
      "id" TEXT NOT NULL DEFAULT 'default',
      "host" TEXT NOT NULL,
      "port" INTEGER NOT NULL DEFAULT 587,
      "username" TEXT,
      "passwordEncrypted" TEXT,
      "fromEmail" TEXT NOT NULL,
      "fromName" TEXT NOT NULL DEFAULT 'DoIt',
      "secure" BOOLEAN NOT NULL DEFAULT false,
      "enabled" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "SmtpConfig_pkey" PRIMARY KEY ("id")
    );
  `);
  console.log('SmtpConfig table verified.');

  // Indexes and constraints
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "WorkspaceInvitation_tokenHash_key" ON "WorkspaceInvitation"("tokenHash");
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "WorkspaceInvitation_workspaceId_status_idx" ON "WorkspaceInvitation"("workspaceId", "status");
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "WorkspaceInvitation_tokenHash_idx" ON "WorkspaceInvitation"("tokenHash");
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "WorkspaceInvitation_email_idx" ON "WorkspaceInvitation"("email");
  `);

  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      ALTER TABLE "WorkspaceInvitation" ADD CONSTRAINT "WorkspaceInvitation_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      ALTER TABLE "WorkspaceInvitation" ADD CONSTRAINT "WorkspaceInvitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);
  console.log('Indexes and foreign keys verified.');

  console.log('Migration complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
