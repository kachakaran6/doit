-- Project context, personal AI credentials, quick-capture prefs, solution prompts.
-- Idempotent-safe: uses IF NOT EXISTS where PostgreSQL allows it.

DO $$ BEGIN
  CREATE TYPE "AiProviderName" AS ENUM ('OPENAI');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "AiCredentialStatus" AS ENUM ('UNTESTED', 'VALID', 'INVALID', 'DISABLED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "PromptGenerationStatus" AS ENUM ('DRAFT', 'GENERATED', 'FAILED', 'EDITED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "ProjectContext" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "projectId" UUID NOT NULL,
  "markdown" TEXT NOT NULL DEFAULT '',
  "version" INTEGER NOT NULL DEFAULT 1,
  "updatedByUserId" UUID,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProjectContext_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ProjectContext_projectId_key" ON "ProjectContext"("projectId");

CREATE TABLE IF NOT EXISTS "AiProviderCredential" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "ownerUserId" UUID NOT NULL,
  "provider" "AiProviderName" NOT NULL,
  "model" TEXT NOT NULL,
  "encryptedSecret" TEXT NOT NULL,
  "encryptionKeyVersion" INTEGER NOT NULL DEFAULT 1,
  "keyHint" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "lastTestedAt" TIMESTAMP(3),
  "status" "AiCredentialStatus" NOT NULL DEFAULT 'UNTESTED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AiProviderCredential_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AiProviderCredential_ownerUserId_provider_key" ON "AiProviderCredential"("ownerUserId", "provider");

CREATE TABLE IF NOT EXISTS "QuickCapturePreference" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "workspaceId" UUID NOT NULL,
  "defaultProjectId" UUID,
  "defaultLabelIds" UUID[] NOT NULL DEFAULT ARRAY[]::UUID[],
  "rememberLastProject" BOOLEAN NOT NULL DEFAULT true,
  "showProjectSelector" BOOLEAN NOT NULL DEFAULT true,
  "labelsExpanded" BOOLEAN NOT NULL DEFAULT false,
  "lastProjectId" UUID,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "QuickCapturePreference_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "QuickCapturePreference_userId_workspaceId_key" ON "QuickCapturePreference"("userId", "workspaceId");

CREATE TABLE IF NOT EXISTS "TaskSolutionPrompt" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "taskId" UUID NOT NULL,
  "projectId" UUID NOT NULL,
  "createdByUserId" UUID NOT NULL,
  "promptMarkdown" TEXT NOT NULL,
  "generationStatus" "PromptGenerationStatus" NOT NULL DEFAULT 'DRAFT',
  "provider" TEXT,
  "model" TEXT,
  "sourceSnapshotHash" TEXT,
  "sourceContextVersion" INTEGER,
  "selectedAttachmentIds" UUID[] NOT NULL DEFAULT ARRAY[]::UUID[],
  "isUserEdited" BOOLEAN NOT NULL DEFAULT false,
  "errorMessage" TEXT,
  "usageJson" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TaskSolutionPrompt_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "TaskSolutionPrompt_taskId_createdAt_idx" ON "TaskSolutionPrompt"("taskId", "createdAt");

DO $$ BEGIN
  ALTER TABLE "ProjectContext" ADD CONSTRAINT "ProjectContext_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ProjectContext" ADD CONSTRAINT "ProjectContext_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "AiProviderCredential" ADD CONSTRAINT "AiProviderCredential_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "QuickCapturePreference" ADD CONSTRAINT "QuickCapturePreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "QuickCapturePreference" ADD CONSTRAINT "QuickCapturePreference_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "TaskSolutionPrompt" ADD CONSTRAINT "TaskSolutionPrompt_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "TaskSolutionPrompt" ADD CONSTRAINT "TaskSolutionPrompt_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "TaskSolutionPrompt" ADD CONSTRAINT "TaskSolutionPrompt_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
