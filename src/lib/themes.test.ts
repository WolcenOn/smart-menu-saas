import { describe, expect, it } from 'vitest';
import { getLayout, getTheme, THEME_PRESETS } from './themes';

describe('controlled restaurant themes', () => {
  it('maps trusted preset values to fixed classes', () => {
    expect(getTheme('OCEAN').className).toBe('theme-ocean');
    expect(Object.keys(THEME_PRESETS)).toHaveLength(4);
  });

  it('does not allow arbitrary CSS or HTML as a preset', () => {
    expect(getTheme('<style>body{display:none}</style>').className).toBe('theme-olive');
    expect(getTheme('constructor').className).toBe('theme-olive');
  });

  it('only allows known layouts', () => {
    expect(getLayout('LIST')).toBe('LIST');
    expect(getLayout('value;position:absolute')).toBe('CARDS');
  });
});
