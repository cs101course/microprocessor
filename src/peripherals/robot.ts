import { Peripheral } from "../types"

export type Robot = {
  row: number;
  column: number;
  direction: "North" | "South" | "East" | "West";
}

export class RobotPeripheral implements Peripheral<Robot> {
  reset(state: Robot) {
    state.row = 0;
    state.column = 0;
    state.direction = "North";
  }

  move(state: Robot, value: number) {
    if (state.direction === "North") {
      state.row -= value;
    } else if (state.direction === "South") {
      state.row += value;
    } else if (state.direction === "East") {
      state.column += value;
    } else if (state.direction === "West") {
      state.column -= value;
    }
  }

  turnLeft(state: Robot) {
    if (state.direction === "North") {
      state.direction = "West";
    } else if (state.direction === "South") {
      state.direction = "East";
    } else if (state.direction === "East") {
      state.direction = "North";
    } else if (state.direction === "West") {
      state.direction = "South";
    }
  }

  turnRight(state: Robot) {
    if (state.direction === "North") {
      state.direction = "East";
    } else if (state.direction === "South") {
      state.direction = "West";
    } else if (state.direction === "East") {
      state.direction = "South";
    } else if (state.direction === "West") {
      state.direction = "North";
    }
  }
}
