CREATE TYPE "DishStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE', 'SOLD_OUT');

CREATE TABLE "Restaurant" (
 "id" TEXT NOT NULL,
 "slug" VARCHAR(80) NOT NULL,
 "name" VARCHAR(160) NOT NULL,
 "timezone" VARCHAR(64) NOT NULL DEFAULT 'Europe/Madrid',
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "Restaurant_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Restaurant_slug_key" ON "Restaurant"("slug");

CREATE TABLE "Menu" (
 "id" TEXT NOT NULL,
 "restaurantId" TEXT NOT NULL,
 "name" VARCHAR(120) NOT NULL,
 "published" BOOLEAN NOT NULL DEFAULT false,
 CONSTRAINT "Menu_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Menu_restaurantId_published_idx" ON "Menu"("restaurantId", "published");

CREATE TABLE "MenuCategory" (
 "id" TEXT NOT NULL,
 "menuId" TEXT NOT NULL,
 "name" VARCHAR(100) NOT NULL,
 "position" INTEGER NOT NULL DEFAULT 0,
 CONSTRAINT "MenuCategory_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "MenuCategory_menuId_position_idx" ON "MenuCategory"("menuId", "position");

CREATE TABLE "Dish" (
 "id" TEXT NOT NULL,
 "categoryId" TEXT NOT NULL,
 "name" VARCHAR(160) NOT NULL,
 "description" VARCHAR(1200) NOT NULL DEFAULT '',
 "price" DECIMAL(9,2) NOT NULL,
 "status" "DishStatus" NOT NULL DEFAULT 'DRAFT',
 "availability" "AvailabilityStatus" NOT NULL DEFAULT 'AVAILABLE',
 "allergensReviewedAt" TIMESTAMP(3),
 "position" INTEGER NOT NULL DEFAULT 0,
 CONSTRAINT "Dish_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Dish_categoryId_status_position_idx" ON "Dish"("categoryId", "status", "position");

CREATE TABLE "Allergen" (
 "id" VARCHAR(40) NOT NULL,
 "name" VARCHAR(100) NOT NULL,
 CONSTRAINT "Allergen_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Allergen_name_key" ON "Allergen"("name");

CREATE TABLE "DishAllergen" (
 "dishId" TEXT NOT NULL,
 "allergenId" VARCHAR(40) NOT NULL,
 CONSTRAINT "DishAllergen_pkey" PRIMARY KEY ("dishId","allergenId")
);

ALTER TABLE "Menu" ADD CONSTRAINT "Menu_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MenuCategory" ADD CONSTRAINT "MenuCategory_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Dish" ADD CONSTRAINT "Dish_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MenuCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DishAllergen" ADD CONSTRAINT "DishAllergen_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "Dish"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DishAllergen" ADD CONSTRAINT "DishAllergen_allergenId_fkey" FOREIGN KEY ("allergenId") REFERENCES "Allergen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
