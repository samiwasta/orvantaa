-- CreateTable
CREATE TABLE "school_contacts" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "school_contacts_schoolId_idx" ON "school_contacts"("schoolId");

-- AddForeignKey
ALTER TABLE "school_contacts" ADD CONSTRAINT "school_contacts_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
