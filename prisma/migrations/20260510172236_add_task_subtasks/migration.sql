-- AlterTable
ALTER TABLE "project_tasks" ADD COLUMN     "parent_id" TEXT;

-- CreateIndex
CREATE INDEX "project_tasks_parent_id_idx" ON "project_tasks"("parent_id");

-- AddForeignKey
ALTER TABLE "project_tasks" ADD CONSTRAINT "project_tasks_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "project_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
