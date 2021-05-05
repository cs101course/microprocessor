import { getIp } from "../defaults";
import { Lcd, LcdPeripheral } from "../peripherals/lcd";
import { Speaker, SpeakerPeripheral } from "../peripherals/speaker";
import { ProcessorState as State } from "../state";

import { Processor } from "../types";

const lcd = new LcdPeripheral();
const speaker = new SpeakerPeripheral();

export const proc4101: Processor<Lcd & Speaker> = {
  memoryBitSize: 4,
  registerBitSize: 4,
  numMemoryAddresses: 16,
  registerNames: ["IP", "IS", "R0", "R1"],
  peripherals: [
    lcd,
    speaker
  ],
  instructions: [
    {
      description: "Halt",
      execute: (ps) => {
        ps.state.isHalted = true;
      },
      ipIncrement: 1
    },
    {
      description: "Increment R0 (R0 = R0 + 1)",
      execute: (ps) => {
        const r0 = State.getRegister(ps, "R0");
        State.setRegister(ps, "R0", r0 + 1);
      },
      ipIncrement: 1
    },
    {
      description: "Decrement R0 (R0 = R0 - 1)",
      execute: (ps) => {
        const r0 = State.getRegister(ps, "R0");
        State.setRegister(ps, "R0", r0 - 1);
      },
      ipIncrement: 1
    },
    {
      description: "Increment R1 (R1 = R1 + 1)",
      execute: (ps) => {
        const r1 = State.getRegister(ps, "R1");
        State.setRegister(ps, "R1", r1 + 1);
      },
      ipIncrement: 1
    },
    {
      description: "Decrement R1 (R1 = R1 - 1)",
      execute: (ps) => {
        const r1 = State.getRegister(ps, "R1");
        State.setRegister(ps, "R1", r1 - 1);
      },
      ipIncrement: 1
    },
    {
      description: "Add (R0 = R0 + R1)",
      execute: (ps) => {
        const r0 = State.getRegister(ps, "R0");
        const r1 = State.getRegister(ps, "R1");
        State.setRegister(ps, "R0", r0 + r1);
      },
      ipIncrement: 1
    },
    {
      description: "Subtract (R0 = R0 - R1)",
      execute: (ps) => {
        const r0 = State.getRegister(ps, "R0");
        const r1 = State.getRegister(ps, "R1");
        State.setRegister(ps, "R0", r0 - r1);
      },
      ipIncrement: 1
    },
    {
      description: "Print R0 (numerical value is printed)",
      execute: (ps) => {
        const peripherals = State.getPeripherals(ps);
        const r0 = State.getRegister(ps, "R0");

        lcd.printNumber(peripherals, r0);
      },
      ipIncrement: 2
    },
    {
      description: "Jump to address <data> if R0 != 0",
      execute: (ps) => {
        if (State.getRegister(ps, "R0") !== 0) {
          const ipName = getIp(ps.processor);
          const ip = State.getRegister(ps, getIp(ps.processor));
          const address = State.getMemoryAddress(ps, ip-1);
          State.setRegister(ps, ipName, address);
        }
      },
      ipIncrement: 2
    },
    {
      description: "Jump to address <data> if R0 == 0",
      execute: (ps) => {
        if (State.getRegister(ps, "R0") === 0) {
          const ipName = getIp(ps.processor);
          const ip = State.getRegister(ps, getIp(ps.processor));
          const address = State.getMemoryAddress(ps, ip-1);
          State.setRegister(ps, ipName, address);
        }
      },
      ipIncrement: 2
    },
    {
      description: "Load value at address <data> into R0",
      execute: (ps) => {
        const ip = State.getRegister(ps, getIp(ps.processor));
        const address = State.getMemoryAddress(ps, ip-1);
        
        State.setRegister(ps, "R0", State.getMemoryAddress(ps, address));
      },
      ipIncrement: 2
    },
    {
      description: "Load value at address <data> into R1",
      execute: (ps) => {
        const ip = State.getRegister(ps, getIp(ps.processor));
        const address = State.getMemoryAddress(ps, ip-1);
        
        State.setRegister(ps, "R1", State.getMemoryAddress(ps, address));
      },
      ipIncrement: 2
    },
    {
      description: "Store R0 into address <data>",
      execute: (ps) => {
        const ip = State.getRegister(ps, getIp(ps.processor));
        const address = State.getMemoryAddress(ps, ip-1);
        
        State.setMemoryAddress(ps, address, State.getRegister(ps, "R0"));
      },
      ipIncrement: 2
    },
    {
      description: "Store R1 into address <data>",
      execute: (ps) => {
        const ip = State.getRegister(ps, getIp(ps.processor));
        const address = State.getMemoryAddress(ps, ip-1);
        
        State.setMemoryAddress(ps, address, State.getRegister(ps, "R1"));
      },
      ipIncrement: 2
    },
    {
      description: "Swap R0 and address <data>",
      execute: (ps) => {
        const ip = State.getRegister(ps, getIp(ps.processor));
        const address = State.getMemoryAddress(ps, ip-1);
        const value = State.getMemoryAddress(ps, address);
        const r0 = State.getRegister(ps, "R0");
        State.setMemoryAddress(ps, address, r0);
        State.setRegister(ps, "R0", value);
      },
      ipIncrement: 2
    },
    {
      description: "Swap R1 and address <data>",
      execute: (ps) => {
        const ip = State.getRegister(ps, getIp(ps.processor));
        const address = State.getMemoryAddress(ps, ip-1);
        const value = State.getMemoryAddress(ps, address);
        const r1= State.getRegister(ps, "R1");
        State.setMemoryAddress(ps, address, r1);
        State.setRegister(ps, "R1", value);
      },
      ipIncrement: 2
    }
  ]
};
