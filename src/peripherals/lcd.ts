import { ProcessorState, Peripheral } from "../types"

export type Lcd = {
  lcdOutput: string;
}

export class LcdPeripheral implements Peripheral<Lcd> {
  reset(state: Lcd) {
    state.lcdOutput = "";
  }

  printNumber(state: Lcd, value: number) {
    state.lcdOutput += value + "";
  }

  printAscii(state: Lcd, value: number) {
    state.lcdOutput += String.fromCharCode(value);
  }
}
