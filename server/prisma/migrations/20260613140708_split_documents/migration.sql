/*
  Warnings:

  - You are about to drop the column `documents` on the `school_registration_requests` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "school_registration_requests" DROP COLUMN "documents",
ADD COLUMN     "appointmentOrderDocs" TEXT[],
ADD COLUMN     "edrDocs" TEXT[],
ADD COLUMN     "employmentContractDocs" TEXT[],
ADD COLUMN     "passportDocs" TEXT[];
