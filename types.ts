
export type DitherMethod = 
  | 'NONE'
  | 'FLOYD_STEINBERG'
  | 'ATKINSON'
  | 'JARVIS_JUDICE_NINKE'
  | 'STUCKI'
  | 'BAYER_2X2'
  | 'BAYER_4X4'
  | 'BAYER_8X8'
  | 'CLUSTERED_4X4';

export interface Palette {
  id: string;
  name: string;
  colors: string[]; // Hex codes
}

export interface PixelSettings {
  pixelSize: number;
  paletteId: string;
  dithering: number; // intensity 0 to 1
  ditherMethod: DitherMethod;
  contrast: number; // 0 to 2
  brightness: number; // 0 to 2
  blur: number; // 0 to 10
  saturation: number; // 0 to 2
}

export type RGB = [number, number, number];
