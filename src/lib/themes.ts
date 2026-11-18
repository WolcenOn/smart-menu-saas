// The only theme values allowed to reach the DOM are defined here.
// Never treat database-provided text as CSS, HTML, URLs, or arbitrary class names.
export const THEME_PRESETS = {
  OLIVE: { label: 'Oliva', description: 'Natural y mediterránea', className: 'theme-olive', swatches: ['#294d40', '#f7f7f0', '#b88d4b'] },
  TERRACOTTA: { label: 'Terracota', description: 'Cálida y artesanal', className: 'theme-terracotta', swatches: ['#994e38', '#fff7ef', '#e4b17f'] },
  OCEAN: { label: 'Atlántico', description: 'Fresca y luminosa', className: 'theme-ocean', swatches: ['#194e70', '#f1f9fa', '#7cbbc5'] },
  NOIR: { label: 'Noche', description: 'Elegante y contemporánea', className: 'theme-noir', swatches: ['#d6b67c', '#1d2023', '#4a4e51'] },
} as const;

export type ThemePreset = keyof typeof THEME_PRESETS;
export type MenuLayoutChoice = 'CARDS' | 'LIST';

export function getTheme(preset: string) {
  if (Object.prototype.hasOwnProperty.call(THEME_PRESETS, preset)) {
    return THEME_PRESETS[preset as ThemePreset];
  }
  return THEME_PRESETS.OLIVE;
}

export function getLayout(value: string): MenuLayoutChoice {
  return value === 'LIST' ? 'LIST' : 'CARDS';
}
