import { Processor, State, ProcessorState as PS } from "./types";
import { getIp, getIs, getPipeline } from "./defaults";

const constrainRegister = <T>(
  processor: Processor<T>,
  register: string,
  value: number
) => {
  const mask = (1 << processor.registerBitSize) - 1;
  const ipName = getIp(processor);
  const newValue = value & mask;

  if (register === ipName) {
    return constrainAddress(processor, newValue);
  } else {
    return newValue;
  }
};

const constrainMemory = <T>(processor: Processor<T>, value: number) => {
  const mask = (1 << processor.memoryBitSize) - 1;
  return value & mask;
};

const constrainAddress = <T>(processor: Processor<T>, value: number) => {
  let newValue = value % processor.numMemoryAddresses;
  if (newValue < 0) {
    newValue += processor.numMemoryAddresses;
  }
  return newValue;
};

export namespace ProcessorState {
  export const newState = <T>(
    processor: Processor<T>
  ): State<T> => {
    const registers: Record<string, number> = {};
    processor.registerNames.forEach((name) => {
      registers[name] = 0;
    });

    const peripherals = {} as T;
    processor.peripherals.forEach((peripheral) => {
      peripheral.reset(peripherals);
    });

    return {
      memory: Array<number>(processor.numMemoryAddresses).fill(0),
      registers,
      isHalted: false,
      peripherals,
      pipelineStep: 0,
      executionStep: 0,
    };
  };

  export const reset = <T>(ps: PS<T>): void => {
    ps.state = newState(ps.processor);
  };

  export const getRegister = <T>(ps: PS<T>, register: string): number => {
    return ps.state.registers[register];
  };

  export const setRegister = <T>(
    ps: PS<T>,
    register: string,
    value: number
  ): void => {
    ps.state.registers[register] = constrainRegister(
      ps.processor,
      register,
      value
    );
  };

  export const getMemoryAddress = <T>(ps: PS<T>, address: number): number => {
    return ps.state.memory[constrainAddress(ps.processor, address)];
  };

  export const setMemoryAddress = <T>(
    ps: PS<T>,
    address: number,
    value: number
  ): void => {
    const newValue = constrainMemory(ps.processor, value);
    ps.state.memory[constrainAddress(ps.processor, address)] = newValue;
  };

  export const getMemory = <T>(ps: PS<T>): Array<number> => {
    return ps.state.memory;
  };

  export const setMemory = <T>(ps: PS<T>, values: Array<number>) => {
    for (let i = 0; i < ps.processor.numMemoryAddresses; i++) {
      if (i < values.length) {
        ps.state.memory[i] = constrainMemory(ps.processor, values[i]);
      } else {
        ps.state.memory[i] = 0;
      }
    }
  };

  export const setRegisters = <T>(ps: PS<T>, values: Array<number>) => {
    ps.processor.registerNames.forEach((register, i) => {
      if (i < values.length) {
        ps.state.registers[register] = values[i];
      } else {
        ps.state.registers[register] = 0;
      }
    });
  };

  export const getArgument = <T>(ps: PS<T>, argument=1) => {
    const ip = ProcessorState.getRegister(ps, getIp(ps.processor));
    const is = ProcessorState.getRegister(ps, getIs(ps.processor));
    const instruction = ps.processor.instructions[is];
    const argumentAddress = ip - (instruction.ipIncrement - argument);

    return ProcessorState.getMemoryAddress(ps, argumentAddress);
  };

  export const nextStep = <T>(ps: PS<T>) => {
    ps.state.pipelineStep =
      (ps.state.pipelineStep + 1) % getPipeline(ps.processor).length;
    if (ps.state.pipelineStep === 0) {
      ps.state.executionStep += 1;
    }
  };

  export const halt = <T>(ps: PS<T>) => {
    ps.state.isHalted = true;
  };


  export const getPeripherals = <T>(ps: PS<T>) => {
    return ps.state.peripherals;
  }
}
