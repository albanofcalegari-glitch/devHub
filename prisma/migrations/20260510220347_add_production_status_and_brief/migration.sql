-- AlterEnum
ALTER TYPE "ProjectStatus" ADD VALUE 'PRODUCTION';

-- AlterTable (brief may already exist from direct db change)
DO $$ BEGIN
  ALTER TABLE "projects" ADD COLUMN "brief" TEXT;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;
