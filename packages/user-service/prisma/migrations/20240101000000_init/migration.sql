-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "uniqueId" TEXT NOT NULL,
    "userType" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "sex" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "aadhaarStatus" TEXT NOT NULL DEFAULT 'unverified',
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "emergencyName" TEXT,
    "emergencyPhone" TEXT,
    "profession" TEXT,
    "profileExtras" JSONB NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_uniqueId_key" ON "users"("uniqueId");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

