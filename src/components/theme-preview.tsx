'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MenuView, type PublicMenu } from '@/components/menu-view';
import { THEME_PRESETS, type ThemePreset, type MenuLayoutChoice } from '@/lib/themes';

const demoMenu: PublicMenu[] = [{
  id: 'ejemplo', name: 'Nuestra carta',
  categories: [
    { id: 'entrantes', name: 'Para empezar', dishes: [
      { id: 'croquetas', name: 'Croquetas de la abuela', description: 'Crujientes por fuera, cremosas por dentro. Receta de la casa.', price: '9,50 €', availability: 'AVAILABLE', allergens: ['Cereales con gluten', 'Leche y derivados'] },
      { id: 'ensaladilla', name: 'Ensaladilla de gambas', description: 'Patata, gambas y mayonesa suave, preparada cada mañana.', price: '10,00 €', availability: 'SOLD_OUT', allergens: ['Crustáceos', 'Huevos'] },
      { id: 'tomate', name: 'Tomate de temporada', description: 'Tomate de la huerta, aceite de oliva virgen extra y sal en escamas.', price: '8,50 €', availability: 'AVAILABLE', allergens: [] },
    ] },
    { id: 'principales', name: 'Nuestros favoritos', dishes: [
      { id: 'arroz', name: 'Arroz meloso de marisco', description: 'Cocinado lentamente con caldo de pescado y producto fresco.', price: '19,00 €', availability: 'AVAILABLE', allergens: ['Pescado', 'Crustáceos'] },
      { id: 'solomillo', name: 'Solomillo a la brasa', description: 'Carne seleccionada acompañada de patatas y verduras asadas.', price: '24,00 €', availability: 'AVAILABLE', allergens: [] },
    ] },
  ],
}];

export function ThemePreview() {
  const [preset, setPreset] = useState<ThemePreset>('OLIVE');
  const [layout, setLayout] = useState<MenuLayoutChoice>('CARDS');

  return (
    <div className="theme-preview">
      <div className="theme-preview-toolbar">
        <div>
          <h1>Diseños de carta</h1>
          <p>Elige un estilo y compara cómo verá el cliente tu carta.</p>
        </div>
        <div className="theme-preview-controls">
          <div className="theme-preview-options" role="group" aria-label="Estilo de carta">
            {(Object.keys(THEME_PRESETS) as ThemePreset[]).map(key => {
              const theme = THEME_PRESETS[key];
              return <button type="button" className="theme-picker-option" aria-pressed={preset === key} onClick={() => setPreset(key)} key={key}>
                <span className="theme-swatches" aria-hidden="true">{theme.swatches.map(color => <span key={color} className="theme-swatch" style={{ backgroundColor: color }} />)}</span>
                {theme.label}
              </button>;
            })}
          </div>
          <label htmlFor="menu-layout" className="sr-only">Presentación</label>
          <select id="menu-layout" className="theme-preview-select" value={layout} onChange={event => setLayout(event.target.value === 'LIST' ? 'LIST' : 'CARDS')}>
            <option value="CARDS">Tarjetas</option>
            <option value="LIST">Lista</option>
          </select>
        </div>
        <Link href="/" style={{ fontSize: 12, textDecoration: 'none', fontWeight: 700 }}>← Inicio</Link>
      </div>
      <div className="theme-preview-inner">
        <MenuView restaurantName="Casa Laurel" tagline="Cocina de aquí, hecha con cariño." themePreset={preset} menuLayout={layout} menus={demoMenu} />
      </div>
      <p className="theme-preview-notice">Vista de demostración: los datos son ficticios y los ajustes no se guardan. La edición persistente estará disponible cuando exista el panel privado con autenticación.</p>
    </div>
  );
}
