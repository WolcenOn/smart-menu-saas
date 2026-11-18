-- Non-destructive account administration; preserve historical records.
ALTER TABLE "User" ADD COLUMN "suspendedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "deletedAt" TIMESTAMP(3);

CREATE TABLE "AdminAuditEvent" (
  "id" TEXT NOT NULL,
  "action" VARCHAR(40) NOT NULL,
  "userId" VARCHAR(40),
  "email" VARCHAR(254) NOT NULL,
  "details" VARCHAR(300) NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AdminAuditEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AdminAuditEvent_createdAt_idx" ON "AdminAuditEvent"("createdAt");
CREATE INDEX "AdminAuditEvent_userId_createdAt_idx" ON "AdminAuditEvent"("userId", "createdAt");
