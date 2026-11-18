CREATE TYPE "RestaurantRole" AS ENUM ('OWNER', 'EDITOR', 'WAITER');

CREATE TABLE "User" (
 "id" TEXT NOT NULL,
 "name" TEXT,
 "email" TEXT NOT NULL,
 "emailVerified" TIMESTAMP(3),
 "image" TEXT,
 CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE TABLE "Account" (
 "userId" TEXT NOT NULL,
 "type" TEXT NOT NULL,
 "provider" TEXT NOT NULL,
 "providerAccountId" TEXT NOT NULL,
 "refresh_token" TEXT,
 "access_token" TEXT,
 "expires_at" INTEGER,
 "token_type" TEXT,
 "scope" TEXT,
 "id_token" TEXT,
 "session_state" TEXT,
 CONSTRAINT "Account_pkey" PRIMARY KEY ("provider", "providerAccountId")
);
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

CREATE TABLE "Session" (
 "sessionToken" TEXT NOT NULL,
 "userId" TEXT NOT NULL,
 "expires" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "Session_pkey" PRIMARY KEY ("sessionToken")
);
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

CREATE TABLE "VerificationToken" (
 "identifier" TEXT NOT NULL,
 "token" TEXT NOT NULL,
 "expires" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("identifier","token")
);
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

CREATE TABLE "RestaurantMember" (
 "restaurantId" TEXT NOT NULL,
 "userId" TEXT NOT NULL,
 "role" "RestaurantRole" NOT NULL DEFAULT 'WAITER',
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "RestaurantMember_pkey" PRIMARY KEY ("restaurantId","userId")
);
CREATE INDEX "RestaurantMember_userId_role_idx" ON "RestaurantMember"("userId","role");

ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RestaurantMember" ADD CONSTRAINT "RestaurantMember_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RestaurantMember" ADD CONSTRAINT "RestaurantMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
