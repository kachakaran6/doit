-- AlterTable: Add defaultAssigneeId to Project
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "defaultAssigneeId" UUID;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Project_defaultAssigneeId_idx" ON "Project"("defaultAssigneeId");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "Project" ADD CONSTRAINT "Project_defaultAssigneeId_fkey" FOREIGN KEY ("defaultAssigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

