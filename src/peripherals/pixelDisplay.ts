import { ProcessorState, Peripheral } from "../types"

import { colors } from "./xTermColors"

const width = 640;
const height = 480;

export interface Pixel {
  colorId: number;
  hexString: string;
  rgb: {
    r: number;
    g: number;
    b: number;
  },
  hsl: {
    h: number;
    s: number;
    l: number;
  },
  name: string;
};

export interface PixelDisplay {
  pixels: Array<Pixel>;
}

export class PixelDisplayPeripheral implements Peripheral<PixelDisplay> {
  reset(state: PixelDisplay) {
    state.pixels = Array(width * height).fill(colors[0]);
  }

  plot(state: PixelDisplay, x: number, y: number, value: number) {
    state.pixels[width * y + x] = colors[value];
  }
}
