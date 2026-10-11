import { Injectable, effect, signal } from '@angular/core';

const THEME_KEY = 'app-theme-color';

/** Ready-made colors offered in Settings. `null` = the app's default green (which also adapts to dark mode). */
export const THEME_PRESETS = ['#2e7d32', '#00897b', '#1e88e5', '#3949ab', '#8e24aa', '#d81b60', '#f4511e', '#6d4c41', '#546e7a'];

type Rgb = [number, number, number];

function hexToRgb(hex: string): Rgb {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const rgbToHex = (rgb: Rgb) => '#' + rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

/** Mixes the color towards black (`amount` > 0 = darker) or white (`amount` < 0 = lighter), like Ionic's generator. */
const mix = (rgb: Rgb, target: number, amount: number): Rgb => rgb.map((v) => v + (target - v) * amount) as Rgb;

/** WCAG relative luminance – decides whether text on the color should be black or white. */
function luminance([r, g, b]: Rgb): number {
  const lin = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

const isHexColor = (v: unknown): v is string => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v);

/** The user-chosen primary color. Derives all `--ion-color-primary-*` variables from one hex value. */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly color = signal<string | null>(this.load());

  constructor() {
    effect(() => this.apply(this.color()));
  }

  set(color: string | null) {
    this.color.set(isHexColor(color) ? color.toLowerCase() : null);
    try {
      if (this.color()) localStorage.setItem(THEME_KEY, this.color()!);
      else localStorage.removeItem(THEME_KEY);
    } catch {
      // not critical – the color just won't be remembered
    }
  }

  private load(): string | null {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      return isHexColor(saved) ? saved : null;
    } catch {
      return null;
    }
  }

  private apply(color: string | null) {
    const style = document.documentElement.style;
    const names = ['', '-rgb', '-contrast', '-contrast-rgb', '-shade', '-tint'].map((s) => `--ion-color-primary${s}`);
    if (!color) {
      names.forEach((n) => style.removeProperty(n)); // back to the defaults from theme/variables.scss
      return;
    }
    const rgb = hexToRgb(color);
    const contrast: Rgb = luminance(rgb) > 0.35 ? [0, 0, 0] : [255, 255, 255];
    style.setProperty('--ion-color-primary', color);
    style.setProperty('--ion-color-primary-rgb', rgb.join(', '));
    style.setProperty('--ion-color-primary-contrast', rgbToHex(contrast));
    style.setProperty('--ion-color-primary-contrast-rgb', contrast.join(', '));
    style.setProperty('--ion-color-primary-shade', rgbToHex(mix(rgb, 0, 0.12)));
    style.setProperty('--ion-color-primary-tint', rgbToHex(mix(rgb, 255, 0.1)));
  }
}
