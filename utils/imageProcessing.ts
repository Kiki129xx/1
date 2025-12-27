
import { RGB, DitherMethod } from '../types';

export const hexToRgb = (hex: string): RGB => {
  const bigint = parseInt(hex.slice(1), 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
};

export const findClosestColor = (rgb: RGB, paletteRgb: RGB[]): RGB => {
  let minDistance = Infinity;
  let closest = paletteRgb[0];

  for (const pRgb of paletteRgb) {
    const d = Math.pow(rgb[0] - pRgb[0], 2) +
              Math.pow(rgb[1] - pRgb[1], 2) +
              Math.pow(rgb[2] - pRgb[2], 2);
    if (d < minDistance) {
      minDistance = d;
      closest = pRgb;
    }
  }
  return closest;
};

const BAYER_2X2 = [
  [0, 2],
  [3, 1]
].map(row => row.map(v => (v + 0.5) / 4));

const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5]
].map(row => row.map(v => (v + 0.5) / 16));

const BAYER_8X8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21]
].map(row => row.map(v => (v + 0.5) / 64));

const CLUSTERED_4X4 = [
  [12, 5, 6, 13],
  [4, 0, 1, 7],
  [11, 3, 2, 8],
  [15, 10, 9, 14]
].map(row => row.map(v => (v + 0.5) / 16));

export const applyDithering = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  paletteRgb: RGB[],
  intensity: number,
  method: DitherMethod
) => {
  if (method === 'NONE') {
    for (let i = 0; i < data.length; i += 4) {
      const closest = findClosestColor([data[i], data[i+1], data[i+2]], paletteRgb);
      data[i] = closest[0];
      data[i+1] = closest[1];
      data[i+2] = closest[2];
    }
    return;
  }

  // Ordered Dithering
  if (method.startsWith('BAYER') || method === 'CLUSTERED_4X4') {
    let matrix: number[][];
    if (method === 'BAYER_2X2') matrix = BAYER_2X2;
    else if (method === 'BAYER_4X4') matrix = BAYER_4X4;
    else if (method === 'BAYER_8X8') matrix = BAYER_8X8;
    else matrix = CLUSTERED_4X4;

    const mSize = matrix.length;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const threshold = matrix[y % mSize][x % mSize] - 0.5;
        const shift = threshold * intensity * 255;
        
        const r = Math.min(255, Math.max(0, data[i] + shift));
        const g = Math.min(255, Math.max(0, data[i+1] + shift));
        const b = Math.min(255, Math.max(0, data[i+2] + shift));
        
        const closest = findClosestColor([r, g, b], paletteRgb);
        data[i] = closest[0];
        data[i+1] = closest[1];
        data[i+2] = closest[2];
      }
    }
    return;
  }

  // Error Diffusion Dithering
  const diffusionMatrix: { dx: number, dy: number, factor: number }[] = [];
  let divisor = 1;

  switch (method) {
    case 'FLOYD_STEINBERG':
      diffusionMatrix.push({ dx: 1, dy: 0, factor: 7 }, { dx: -1, dy: 1, factor: 3 }, { dx: 0, dy: 1, factor: 5 }, { dx: 1, dy: 1, factor: 1 });
      divisor = 16;
      break;
    case 'ATKINSON':
      diffusionMatrix.push(
        { dx: 1, dy: 0, factor: 1 }, { dx: 2, dy: 0, factor: 1 },
        { dx: -1, dy: 1, factor: 1 }, { dx: 0, dy: 1, factor: 1 }, { dx: 1, dy: 1, factor: 1 },
        { dx: 0, dy: 2, factor: 1 }
      );
      divisor = 8;
      break;
    case 'JARVIS_JUDICE_NINKE':
      diffusionMatrix.push(
        { dx: 1, dy: 0, factor: 7 }, { dx: 2, dy: 0, factor: 5 },
        { dx: -2, dy: 1, factor: 3 }, { dx: -1, dy: 1, factor: 5 }, { dx: 0, dy: 1, factor: 7 }, { dx: 1, dy: 1, factor: 5 }, { dx: 2, dy: 1, factor: 3 },
        { dx: -2, dy: 2, factor: 1 }, { dx: -1, dy: 2, factor: 3 }, { dx: 0, dy: 2, factor: 5 }, { dx: 1, dy: 2, factor: 3 }, { dx: 2, dy: 2, factor: 1 }
      );
      divisor = 48;
      break;
    case 'STUCKI':
      diffusionMatrix.push(
        { dx: 1, dy: 0, factor: 8 }, { dx: 2, dy: 0, factor: 4 },
        { dx: -2, dy: 1, factor: 2 }, { dx: -1, dy: 1, factor: 4 }, { dx: 0, dy: 1, factor: 8 }, { dx: 1, dy: 1, factor: 4 }, { dx: 2, dy: 1, factor: 2 },
        { dx: -2, dy: 2, factor: 1 }, { dx: -1, dy: 2, factor: 2 }, { dx: 0, dy: 2, factor: 4 }, { dx: 1, dy: 2, factor: 2 }, { dx: 2, dy: 2, factor: 1 }
      );
      divisor = 42;
      break;
  }

  const errors = new Float32Array(width * height * 3);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const ei = (y * width + x) * 3;

      const r = Math.min(255, Math.max(0, data[i] + errors[ei]));
      const g = Math.min(255, Math.max(0, data[i+1] + errors[ei+1]));
      const b = Math.min(255, Math.max(0, data[i+2] + errors[ei+2]));

      const closest = findClosestColor([r, g, b], paletteRgb);
      
      data[i] = closest[0];
      data[i+1] = closest[1];
      data[i+2] = closest[2];

      const errR = (r - closest[0]) * intensity;
      const errG = (g - closest[1]) * intensity;
      const errB = (b - closest[2]) * intensity;

      for (const { dx, dy, factor } of diffusionMatrix) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const ni = (ny * width + nx) * 3;
          errors[ni] += errR * factor / divisor;
          errors[ni+1] += errG * factor / divisor;
          errors[ni+2] += errB * factor / divisor;
        }
      }
    }
  }
};
