import { Processor, State, ProcessorState as PS, Processor as P, PipelineStep } from "./types";

const getIpName = <T>(processor: P<T>) => processor.ipName || "IP";
const getIsName = <T>(processor: P<T>) => processor.isName || "IS";

const constrainRegister = <T>(
  processor: Processor<T>,
  register: string,
  value: number
) => {
  const mask = (1 << processor.registerBitSize) - 1;
  const ipName = getIpName(processor);
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

  export const getIp = <T>(ps: PS<T>): number => getRegister(ps, getIpName(ps.processor));
  export const getIs = <T>(ps: PS<T>): number => getRegister(ps, getIsName(ps.processor));

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

  export const setIp = <T>(ps: PS<T>, value: number): void => setRegister(ps, getIpName(ps.processor), value);
  export const setIs = <T>(ps: PS<T>, value: number): void => setRegister(ps, getIsName(ps.processor), value);

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
    const ip = ProcessorState.getIp(ps);
    const is = ProcessorState.getIs(ps);
    const instruction = ps.processor.instructions[is];
    const argumentAddress = ip - (instruction.ipIncrement - argument);

    return ProcessorState.getMemoryAddress(ps, argumentAddress);
  };

  export const nextStep = <T>(ps: PS<T>, pipeline: Array<PipelineStep<T>>) => {
    ps.state.pipelineStep =
      (ps.state.pipelineStep + 1) % pipeline.length;
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
