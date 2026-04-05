/*
  Warnings:

  - You are about to drop the column `fileUrl` on the `submissions` table. All the data in the column will be lost.
  - You are about to drop the column `linkUrl` on the `submissions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "submissions" DROP COLUMN "fileUrl",
DROP COLUMN "linkUrl",
ADD COLUMN     "attachments" TEXT[];

-- AlterTable
ALTER TABLE "tests" ADD COLUMN     "nusGroupId" TEXT;

-- AddForeignKey
ALTER TABLE "tests" ADD CONSTRAINT "tests_nusGroupId_fkey" FOREIGN KEY ("nusGroupId") REFERENCES "nus_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
