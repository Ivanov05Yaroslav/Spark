-- CreateTable
CREATE TABLE "edebo_schools" (
    "id" TEXT NOT NULL,
    "edeboId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "shortName" TEXT,
    "isChecked" TEXT,
    "status" TEXT,
    "institutionType" TEXT,
    "financingType" TEXT,
    "koatuuId" TEXT,
    "region" TEXT NOT NULL,
    "koatuuName" TEXT,
    "address" TEXT,
    "katottgCode" TEXT,
    "katottgName" TEXT,
    "parentInstitutionId" TEXT,
    "governanceName" TEXT,
    "phone" TEXT,
    "fax" TEXT,
    "email" TEXT,
    "website" TEXT,
    "directorFullName" TEXT,
    "isSupport" TEXT,
    "isVillage" TEXT,
    "isMountain" TEXT,
    "isInternat" TEXT,
    "approvedCount" TEXT,
    "city" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "edebo_schools_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "edebo_schools_edeboId_key" ON "edebo_schools"("edeboId");

-- CreateIndex
CREATE INDEX "edebo_schools_region_idx" ON "edebo_schools"("region");

-- CreateIndex
CREATE INDEX "edebo_schools_city_idx" ON "edebo_schools"("city");
