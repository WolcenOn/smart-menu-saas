import type { ReactNode } from 'react';
import Image from 'next/image';
import { getLayout, getTheme } from '@/lib/themes';

export type MenuDish = {
  id: string;
  name: string;
  description: string;
  price: string;
  imageUrl?: string | null;
  availability: 'AVAILABLE' | 'SOLD_OUT';
  allergens: string[];
};
export type MenuSection = { id: string; name: string; dishes: MenuDish[] };
export type PublicMenu = { id: string; name: string; categories: MenuSection[] };

type Props = {
  restaurantName: string;
  tagline: string;
  themePreset: string;
  menuLayout: string;
  menus: PublicMenu[];
  footer?: ReactNode;
};

function MenuDishCard({ dish }: { dish: MenuDish }) {
  const soldOut = dish.availability === 'SOLD_OUT';
  return (
    <article className={`menu-dish ${soldOut ? 'menu-dish--sold-out' : ''}`} aria-label={dish.name}>
      {dish.imageUrl ? (
        <Image unoptimized className="menu-photo" src={dish.imageUrl} alt={'Fotografía de ' + dish.name} width={960} height={600} />
      ) : null}
      <div className="menu-dish-main">
        <div className="menu-dish-title-row">
          <h4>{dish.name}</h4>
          {soldOut ? <span className="sold-out">Agotado</span> : null}
        </div>
        {dish.description ? <p className="menu-dish-description">{dish.description}</p> : null}
        <p className="allergens"><strong>Alérgenos:</strong>{' '}
          {dish.allergens.length > 0
            ? dish.allergens.join(', ')
            : 'Sin alérgenos de declaración obligatoria identificados por el restaurante'}
        </p>
      </div>
      <div className="menu-dish-aside">
        <p className="menu-price">{dish.price}</p>
        {soldOut ? <span className="menu-next-time">Vuelve a consultarlo en tu próxima visita</span> : null}
      </div>
    </article>
  );
}

export function MenuView({ restaurantName, tagline, themePreset, menuLayout, menus, footer }: Props) {
  const theme = getTheme(themePreset);
  const layout = getLayout(menuLayout);
  return (
    <main className={`menu-shell ${theme.className}`} data-testid="restaurant-menu" data-theme={themePreset in { OLIVE:1,TERRACOTTA:1,OCEAN:1,NOIR:1 } ? themePreset : 'OLIVE'}>
      <div className="menu-container">
        <header className="menu-header">
          <div className="brand-symbol" aria-hidden="true">✳</div>
          <div className="menu-header-line"><span>LA CARTA</span><span>HECHO PARA DISFRUTAR</span></div>
          <h1>{restaurantName}</h1>
          <p className="menu-tagline">{tagline || 'Sabores para recordar, momentos para compartir.'}</p>
          <div className="menu-header-rule" aria-hidden="true"><span>✦</span></div>
          <nav aria-label="Secciones de la carta" className="menu-jump">
            {menus.flatMap(menu => menu.categories).filter(cat => cat.dishes.length > 0).map(cat => (
              <a key={cat.id} href={`#categoria-${cat.id}`}>{cat.name}</a>
            ))}
          </nav>
        </header>
        {menus.length === 0 ? <p className="menu-empty">Este restaurante aún no ha publicado su carta.</p> : null}
        {menus.map(menu => (
          <section className="menu-group" key={menu.id} aria-label={menu.name}>
            <div className="menu-group-heading"><span>MENÚ</span><h2>{menu.name}</h2></div>
            {menu.categories.filter(category => category.dishes.length > 0).map((category, index) => (
              <section className="menu-category" id={`categoria-${category.id}`} key={category.id} aria-label={category.name}>
                <div className="menu-category-heading">
                  <span className="menu-category-index">{String(index + 1).padStart(2, '0')}</span>
                  <h3>{category.name}</h3>
                  <span className="menu-category-line" aria-hidden="true" />
                </div>
                <div className={`menu-dishes ${layout === 'LIST' ? 'menu-dishes--list' : 'menu-dishes--cards'}`}>
                  {category.dishes.map(dish => <MenuDishCard key={dish.id} dish={dish} />)}
                </div>
              </section>
            ))}
          </section>
        ))}
        <footer className="menu-footer">
          <p>Si tienes alguna alergia o intolerancia alimentaria, consulta con nuestro personal antes de pedir.</p>
          {footer}
          <span>SMART MENU · CARTA DIGITAL</span>
        </footer>
      </div>
    </main>
  );
}
