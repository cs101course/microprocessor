import { Fire, FirePeripheral } from "../peripherals/fire";
import { Lcd, LcdPeripheral } from "../peripherals/lcd";
import { PixelDisplay, PixelDisplayPeripheral } from "../peripherals/pixelDisplay";
import { Speaker, SpeakerPeripheral } from "../peripherals/speaker";
import { ProcessorState as State } from "../state";

import { Instruction, Processor } from "../types";

const lcd = new LcdPeripheral();
const speaker = new SpeakerPeripheral();
const pixelDisplay = new PixelDisplayPeripheral();
const fire = new FirePeripheral();

const randByte = () => Math.floor(Math.random() * 256);

type PeripheralType = Lcd & Speaker & PixelDisplay & Fire;

const undocumentedInstructions: Record<string, Instruction<PeripheralType>> = {
  "27": {
    description: "Undefined",
    execute: (ps) => {
      State.setRegister(ps, "R0", randByte());
    },
    ipIncrement: 1
  },
  "28-31": {
    description: "Undefined",
    execute: (ps) => {
      State.setMemoryAddress(ps, randByte(), randByte());
    },
    ipIncrement: 1
  },
  "42": {
    description: "Undefined",
    execute: (ps) => {
      const peripherals = State.getPeripherals(ps);
      fire.catchFire(peripherals);
    },
    ipIncrement: 1
  },
  "43-47": {
    description: "Undefined",
    execute: (ps) => {
      const instructions = Object.keys(ps.processor.instructions);
      const randomIndex = Math.floor(Math.random() * instructions.length);
      const randomInstruction = Number(instructions[randomIndex]);
      const instruction = ps.processor.instructions[randomInstruction];
      const extraIncrement = instruction.ipIncrement - 1;
      if (extraIncrement > 0) {
        State.setRegister(ps, "IP", State.getRegister(ps, "IP") + extraIncrement);
      }
      instruction.execute(ps);
    },
    ipIncrement: 1
  },
  "67-255": {
    description: "Undefined",
    execute: (ps) => {
      const peripherals = State.getPeripherals(ps);
      lcd.printString(peripherals, "Error");
    },
    ipIncrement: 1
  }
};

export const processor: Processor<PeripheralType> = {
  memoryBitSize: 8,
  registerBitSize: 8,
  numMemoryAddresses: 256,
  registerNames: ["IP", "IS", "R0", "R1", "SP", "PORT"],
  peripherals: [
    lcd,
    speaker,
    pixelDisplay,
    fire
  ],
  getUndocumentedInstruction: (instruction: number) => {
    let lookup;

    if (instruction >= 28 && instruction <= 31) {
      lookup = "28-31";
    } else if (instruction >= 43 && instruction <= 47) {
      lookup = "43-47";
    } else if (instruction >= 67) {
      lookup = "67-255";
    } else {
      lookup = instruction;
    }

    return undocumentedInstructions[lookup];
  },
  instructions: {
    "0": {
      description: "Halt",
      execute: (ps) => {
        ps.state.isHalted = true;
      },
      ipIncrement: 1,
      mnemonic: "HALT"
    },
    "1": {
      description: "Increment (R0 = R0 + 1)",
      execute: (ps) => {
        const r0 = State.getRegister(ps, "R0");
        State.setRegister(ps, "R0", r0 + 1);
      },
      ipIncrement: 1,
      mnemonic: "INC"
    },
    "2": {
      description: "Decrement (R0 = R0 - 1)",
      execute: (ps) => {
        const r0 = State.getRegister(ps, "R0");
        State.setRegister(ps, "R0", r0 - 1);
      },
      ipIncrement: 1,
      mnemonic: "DEC"
    },
    "3": {
      description: "Add (R0 = R0 + R1)",
      execute: (ps) => {
        const r0 = State.getRegister(ps, "R0");
        const r1 = State.getRegister(ps, "R1");
        State.setRegister(ps, "R0", r0 + r1);
      },
      ipIncrement: 1,
      mnemonic: "ADD"
    },
    "4": {
      description: "Subtract (R0 = R0 - R1)",
      execute: (ps) => {
        const r0 = State.getRegister(ps, "R0");
        const r1 = State.getRegister(ps, "R1");
        State.setRegister(ps, "R0", r0 - r1);
      },
      ipIncrement: 1,
      mnemonic: "SUB"
    },
    "5": {
      description: "Multiply (R0 = R0 * R1)",
      execute: (ps) => {
        const r0 = State.getRegister(ps, "R0");
        const r1 = State.getRegister(ps, "R1");
        State.setRegister(ps, "R0", r0 * r1);
      },
      ipIncrement: 1,
      mnemonic: "MUL"
    },
    "6": {
      description: "Integer Divide (R0 = R0 / R1)",
      execute: (ps) => {
        const r0 = State.getRegister(ps, "R0");
        const r1 = State.getRegister(ps, "R1");
        State.setRegister(ps, "R0", Math.floor(r0 / r1));
      },
      ipIncrement: 1,
      mnemonic: "DIV"
    },
    "7": {
      description: "Modulo (R0 = R0 % R1)",
      execute: (ps) => {
        const r0 = State.getRegister(ps, "R0");
        const r1 = State.getRegister(ps, "R1");
        State.setRegister(ps, "R0", r0 % r1);
      },
      ipIncrement: 1,
      mnemonic: "MOD"
    },
    "8": {
      description: "Shift Left (R0 = R0 << R1)",
      execute: (ps) => {
        const r0 = State.getRegister(ps, "R0");
        const r1 = State.getRegister(ps, "R1");
        State.setRegister(ps, "R0", r0 << r1);
      },
      ipIncrement: 1,
      mnemonic: "SHL"
    },
    "9": {
      description: "Shift Right (R0 = R0 >> R1)",
      execute: (ps) => {
        const r0 = State.getRegister(ps, "R0");
        const r1 = State.getRegister(ps, "R1");
        State.setRegister(ps, "R0", r0 >> r1);
      },
      ipIncrement: 1,
      mnemonic: "SHR"
    },
    "10": {
      description: "Bitwise AND (R0 = R0 & R1)",
      execute: (ps) => {
        const r0 = State.getRegister(ps, "R0");
        const r1 = State.getRegister(ps, "R1");
        State.setRegister(ps, "R0", r0 & r1);
      },
      ipIncrement: 1,
      mnemonic: "AND"
    },
    "11": {
      description: "Bitwise OR (R0 = R0 | R1)",
      execute: (ps) => {
        const r0 = State.getRegister(ps, "R0");
        const r1 = State.getRegister(ps, "R1");
        State.setRegister(ps, "R0", r0 | r1);
      },
      ipIncrement: 1,
      mnemonic: "OR"
    },
    "12": {
      description: "Bitwise XOR (R0 = R0 ^ R1)",
      execute: (ps) => {
        const r0 = State.getRegister(ps, "R0");
        const r1 = State.getRegister(ps, "R1");
        State.setRegister(ps, "R0", r0 ^ r1);
      },
      ipIncrement: 1,
      mnemonic: "XOR"
    },
    "13": {
      description: "Bitwise NOT (R0 = ~R0)",
      execute: (ps) => {
        const r0 = State.getRegister(ps, "R0");
        State.setRegister(ps, "R0", ~r0);
      },
      ipIncrement: 1,
      mnemonic: "NOT"
    },
    "14": {
      description: "Minimum (R0 = Lesser of R0, R1)",
      execute: (ps) => {
        const r0 = State.getRegister(ps, "R0");
        const r1 = State.getRegister(ps, "R1");
        State.setRegister(ps, "R0", Math.min(r0, r1));
      },
      ipIncrement: 1,
      mnemonic: "MIN"
    },
    "15": {
      description: "Maximum (R0 = Greater of R0, R1)",
      execute: (ps) => {
        const r0 = State.getRegister(ps, "R0");
        const r1 = State.getRegister(ps, "R1");
        State.setRegister(ps, "R0", Math.max(r0, r1));
      },
      ipIncrement: 1,
      mnemonic: "MAX"
    },

    "16": {
      description: "Swap the values of R0, R1",
      execute: (ps) => {
        const r0 = State.getRegister(ps, "R0");
        const r1 = State.getRegister(ps, "R1");
        State.setRegister(ps, "R0", r1);
        State.setRegister(ps, "R1", r0);
      },
      ipIncrement: 1,
      mnemonic: "SWAP"
    },
    "17": {
      description: "Load (direct) <data> into R0",
      execute: (ps) => {
        const value = State.getArgument(ps);
        State.setRegister(ps, "R0", value);
      },
      ipIncrement: 2,
      mnemonic: "LDR0"
    },
    "18": {
      description: "Load (direct) <data> into R1",
      execute: (ps) => {
        const value = State.getArgument(ps);
        State.setRegister(ps, "R1", value);
      },
      ipIncrement: 2,
      mnemonic: "LDR1"
    },
    "19": {
      description: "Load (indirect) value at address <data> into R0",
      execute: (ps) => {
        const address = State.getArgument(ps);
        State.setRegister(ps, "R0", State.getMemoryAddress(ps, address));
      },
      ipIncrement: 2,
      mnemonic: "LIR0",
    },
    "20": {
      description: "Load (indirect) value at address <data> into R1",
      execute: (ps) => {
        const address = State.getArgument(ps);
        State.setRegister(ps, "R1", State.getMemoryAddress(ps, address));
      },
      ipIncrement: 2,
      mnemonic: "LIR1"
    },
    "21": {
      description: "Store R0 into address <data>",
      execute: (ps) => {
        const address = State.getArgument(ps);
        State.setMemoryAddress(ps, address, State.getRegister(ps, "R0"));
      },
      ipIncrement: 2,
      mnemonic: "SR0",
    },
    "22": {
      description: "Store R1 into address <data>",
      execute: (ps) => {
        const address = State.getArgument(ps);
        State.setMemoryAddress(ps, address, State.getRegister(ps, "R1"));
      },
      ipIncrement: 2,
      mnemonic: "SR1"
    },
    "23": {
      description: "Load value at address SP+[data] into R0",
      execute: (ps) => {
        const data = State.getArgument(ps);
        const sp = State.getRegister(ps, "SP");
        
        State.setRegister(ps, "R0", State.getMemoryAddress(ps, sp + data));
      },
      ipIncrement: 2,
      mnemonic: "LSR0"
    },
    "24": {
      description: "Load value at address SP+[data] into R1",
      execute: (ps) => {
        const data = State.getArgument(ps);
        const sp = State.getRegister(ps, "SP");
        
        State.setRegister(ps, "R1", State.getMemoryAddress(ps, sp + data));
      },
      ipIncrement: 2,
      mnemonic: "LSR1"
    },
    "25": {
      description: "Store R0 at address SP+[data]",
      execute: (ps) => {
        const data = State.getArgument(ps);
        const sp = State.getRegister(ps, "SP");
        
        State.setMemoryAddress(ps, sp + data, State.getRegister(ps, "R0"));
      },
      ipIncrement: 2,
      mnemonic: "SSR0"
    },
    "26": {
      description: "Store R1 at address SP+[data]",
      execute: (ps) => {
        const data = State.getArgument(ps);
        const sp = State.getRegister(ps, "SP");
        
        State.setMemoryAddress(ps, sp + data, State.getRegister(ps, "R1"));
      },
      ipIncrement: 2,
      mnemonic: "SSR1"
    },

    "32": {
      description: "Compare R0 with value at address [data]",
      execute: (ps) => {
        const address = State.getArgument(ps);
        const value = State.getMemoryAddress(ps, address);
        const r0 = State.getRegister(ps, "R0");

        if (r0 === value) {
          State.setRegister(ps, "R0", 1);
        } else {
          State.setRegister(ps, "R0", 0);
        }
      },
      ipIncrement: 2,
      mnemonic: "CMP"
    },
    "33": {
      description: "Jump to address <data>",
      execute: (ps) => {
        const address = State.getArgument(ps);
        State.setIp(ps, address);
      },
      ipIncrement: 2,
      mnemonic: "JMP"
    },
    "34": {
      description: "Jump to address <data> if R0 == 0",
      execute: (ps) => {
        if (State.getRegister(ps, "R0") === 0) {
          const address = State.getArgument(ps);
          State.setIp(ps, address);
        }
      },
      ipIncrement: 2,
      mnemonic: "JZ"
    },
    "35": {
      description: "Jump to address <data> if R0 != 0",
      execute: (ps) => {
        if (State.getRegister(ps, "R0") !== 0) {
          const address = State.getArgument(ps);
          State.setIp(ps, address);
        }
      },
      ipIncrement: 2,
      mnemonic: "JNZ"
    },
    "36": {
      description: "Jump to address <data> if R0 == R1",
      execute: (ps) => {
        if (State.getRegister(ps, "R0") === State.getRegister(ps, "R1")) {
          const address = State.getArgument(ps);
          State.setIp(ps, address);
        }
      },
      ipIncrement: 2,
      mnemonic: "JE"
    },
    "37": {
      description: "Jump to address <data> if R0 != R1",
      execute: (ps) => {
        if (State.getRegister(ps, "R0") !== State.getRegister(ps, "R1")) {
          const address = State.getArgument(ps);
          State.setIp(ps, address);
        }
      },
      ipIncrement: 2,
      mnemonic: "JNE"
    },
    "38": {
      description: "Jump to address <data> if R0 < R1",
      execute: (ps) => {
        if (State.getRegister(ps, "R0") < State.getRegister(ps, "R1")) {
          const address = State.getArgument(ps);
          State.setIp(ps, address);
        }
      },
      ipIncrement: 2,
      mnemonic: "JB"
    },
    "39": {
      description: "Jump to address <data> if R0 <= R1",
      execute: (ps) => {
        if (State.getRegister(ps, "R0") <= State.getRegister(ps, "R1")) {
          const address = State.getArgument(ps);
          State.setIp(ps, address);
        }
      },
      ipIncrement: 2,
      mnemonic: "JZP"
    },
    "40": {
      description: "Jump to address <data> if (PORT & R0) != 0",
      execute: (ps) => {
        if ((State.getRegister(ps, "PORT") & State.getRegister(ps, "R0")) !== 0) {
          const address = State.getArgument(ps);
          State.setIp(ps, address);
        }
      },
      ipIncrement: 2,
      mnemonic: "JNZP"
    },
    "41": {
      description: "Jump to address <data> if (PORT & R0) == 0",
      execute: (ps) => {
        if ((State.getRegister(ps, "PORT") & State.getRegister(ps, "R0")) === 0) {
          const address = State.getArgument(ps);
          State.setIp(ps, address);
        }
      },
      ipIncrement: 2,
      mnemonic: "JPZ"
    },
    "48": {
      description: "Pop (into R0)",
      execute: (ps) => {
        const sp = State.getRegister(ps, "SP");
        State.setRegister(ps, "R0", State.getMemoryAddress(ps, sp));
        State.setRegister(ps, "SP", sp + 1);
      },
      ipIncrement: 1,
      mnemonic: "POP"
    },
    "49": {
      description: "Return (Pop into IP)",
      execute: (ps) => {
        const sp = State.getRegister(ps, "SP");
        State.setIp(ps, State.getMemoryAddress(ps, sp));
        State.setRegister(ps, "SP", sp + 1);
      },
      ipIncrement: 1,
      mnemonic: "RET"
    },
    "50": {
      description: "Push R0",
      execute: (ps) => {
        const r0 = State.getRegister(ps, "R0");
        const sp = State.getRegister(ps, "SP") - 1;
        State.setRegister(ps, "SP", sp);
        State.setMemoryAddress(ps, sp, r0);
      },
      ipIncrement: 1,
      mnemonic: "PUSH"
    },
    "51": {
      description: "Call function at address [data] (Push IP and Jump)",
      execute: (ps) => {
        const address = State.getArgument(ps);
        const ip = State.getIp(ps);
        const sp = State.getRegister(ps, "SP") - 1;
        State.setRegister(ps, "SP", sp);
        State.setMemoryAddress(ps, sp, ip);
        State.setIp(ps, address);
      },
      ipIncrement: 2,
      mnemonic: "CALL"
    },

    "64": {
      description: "Print R0 as unsigned integer",
      execute: (ps) => {
        const peripherals = State.getPeripherals(ps);
        const r0 = State.getRegister(ps, "R0");

        lcd.printNumber(peripherals, r0);
      },
      ipIncrement: 1,
      mnemonic: "PRINT"
    },
    "65": {
      description: "Print R0 as ASCII character",
      execute: (ps) => {
        const peripherals = State.getPeripherals(ps);
        const r0 = State.getRegister(ps, "R0");

        lcd.printAscii(peripherals, r0);
      },
      ipIncrement: 1,
      mnemonic: "PRINTC"
    },
    "66": {
      description: "Play a sound (R0 specifies the sound)",
      execute: (ps) => {
        const peripherals = State.getPeripherals(ps);
        const r0 = State.getRegister(ps, "R0");

        speaker.sound(peripherals, r0);
      },
      ipIncrement: 1,
      mnemonic: "SOUND"
    },
    "67": {
      description: "Plot pixel <data> at coordinate R0, R1",
      execute: (ps) => {
        const peripherals = State.getPeripherals(ps);
        const r0 = State.getRegister(ps, "R0");
        const r1 = State.getRegister(ps, "R1");
        const value = State.getArgument(ps);

        pixelDisplay.plot(peripherals, r0, r1, value);
      },
      ipIncrement: 2,
      mnemonic: "PLOT"
    }
  }
};
