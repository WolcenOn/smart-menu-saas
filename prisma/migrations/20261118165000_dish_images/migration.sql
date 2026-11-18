ALTER TABLE "Dish" ADD COLUMN "imageKey" VARCHAR(300);

CREATE TABLE "DishImageUpload" (
  "id" TEXT NOT NULL,
  "dishId" TEXT NOT NULL,
  "restaurantId" TEXT NOT NULL,
  "objectKey" VARCHAR(300) NOT NULL,
  "maxBytes" INTEGER NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DishImageUpload_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "DishImageUpload_objectKey_key" ON "DishImageUpload"("objectKey");
CREATE INDEX "DishImageUpload_dishId_expiresAt_idx" ON "DishImageUpload"("dishId","expiresAt");
ALTER TABLE "DishImageUpload" ADD CONSTRAINT "DishImageUpload_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "Dish"("id") ON DELETE CASCADE ON UPDATE CASCADE;
