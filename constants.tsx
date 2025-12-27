
import { Palette, PixelSettings } from './types';

export const PALETTES: Palette[] = [
  {
    id: 'olive-dream',
    name: 'Olive Dream (User Ref)',
    colors: ['#2d3122', '#575d41', '#898e6c', '#bcc19f', '#f2f5e1']
  },
  {
    id: 'gameboy',
    name: 'Classic GameBoy',
    colors: ['#0f380f', '#306230', '#8bac0f', '#9bbc0f']
  },
  {
    id: 'noir',
    name: 'Noir Cinema',
    colors: ['#000000', '#333333', '#666666', '#999999', '#cccccc', '#ffffff']
  },
  {
    id: 'cga',
    name: 'CGA Mode 4',
    colors: ['#000000', '#55ffff', '#ff55ff', '#ffffff']
  },
  {
    id: 'sepia',
    name: 'Vintage Sepia',
    colors: ['#433422', '#6e5a3e', '#a6906f', '#e1d2b1']
  },
  {
    id: 'sunset',
    name: 'Cyber Sunset',
    colors: ['#2d1b33', '#731c4b', '#f22e52', '#fb8c4d', '#ffed9d']
  },
  {
    id: 'nes',
    name: 'Retro 8-Bit',
    colors: ['#000000', '#fc0000', '#0000fc', '#00fc00', '#fcfcfc', '#fcac44']
  }
];

export const DEFAULT_SETTINGS: PixelSettings = {
  pixelSize: 4,
  paletteId: 'olive-dream',
  dithering: 0.5,
  ditherMethod: 'FLOYD_STEINBERG',
  contrast: 1.1,
  brightness: 1.0,
  blur: 0,
  saturation: 1.0
};
