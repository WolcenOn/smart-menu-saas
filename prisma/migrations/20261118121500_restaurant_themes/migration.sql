CREATE TYPE "RestaurantThemePreset" AS ENUM ('OLIVE', 'TERRACOTTA', 'OCEAN', 'NOIR');
CREATE TYPE "MenuLayout" AS ENUM ('CARDS', 'LIST');

ALTER TABLE "Restaurant"
  ADD COLUMN "tagline" VARCHAR(180) NOT NULL DEFAULT '',
  ADD COLUMN "themePreset" "RestaurantThemePreset" NOT NULL DEFAULT 'OLIVE',
  ADD COLUMN "menuLayout" "MenuLayout" NOT NULL DEFAULT 'CARDS';
