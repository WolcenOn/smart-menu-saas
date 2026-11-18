CREATE TABLE "RestaurantInvitation" (
  "id" TEXT NOT NULL,
  "tokenHash" CHAR(64) NOT NULL,
  "email" VARCHAR(254) NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "usedAt" TIMESTAMP(3),
  "revokedAt" TIMESTAMP(3),
  "restaurantId" TEXT,
  CONSTRAINT "RestaurantInvitation_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "RestaurantInvitation_tokenHash_key" ON "RestaurantInvitation"("tokenHash");
CREATE INDEX "RestaurantInvitation_email_expiresAt_idx" ON "RestaurantInvitation"("email","expiresAt");
CREATE INDEX "RestaurantInvitation_usedAt_revokedAt_expiresAt_idx" ON "RestaurantInvitation"("usedAt","revokedAt","expiresAt");
