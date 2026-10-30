-- AlterTable Task: add generated tsvector column for fast full-text search
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "tsv" tsvector
  GENERATED ALWAYS AS (
    to_tsvector('simple', coalesce("title", '') || ' ' || coalesce("description", ''))
  ) STORED;

CREATE INDEX IF NOT EXISTS "Task_tsv_idx" ON "Task" USING GIN ("tsv");

-- AlterTable Comment: add generated tsvector column
ALTER TABLE "Comment" ADD COLUMN IF NOT EXISTS "tsv" tsvector
  GENERATED ALWAYS AS (
    to_tsvector('simple', coalesce("body", ''))
  ) STORED;

CREATE INDEX IF NOT EXISTS "Comment_tsv_idx" ON "Comment" USING GIN ("tsv");

-- AlterTable Sticky: add generated tsvector column
ALTER TABLE "Sticky" ADD COLUMN IF NOT EXISTS "tsv" tsvector
  GENERATED ALWAYS AS (
    to_tsvector('simple', coalesce("body", ''))
  ) STORED;

CREATE INDEX IF NOT EXISTS "Sticky_tsv_idx" ON "Sticky" USING GIN ("tsv");
