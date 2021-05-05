import { Peripheral } from "../types";

export type Speaker = {
  numBeeps: number;
};

export class SpeakerPeripheral implements Peripheral<Speaker> {
  reset(state: Speaker) {
    state.numBeeps = 0;
  }

  beep(state: Speaker) {
    state.numBeeps += 1
  }
}
