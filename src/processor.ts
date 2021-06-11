import { ProcessorState as PS } from "./types";
import { ProcessorState } from "./state";
import { getIp, getIs, getPipeline } from "./defaults";

export namespace Processor {
  export const fetch = <T>(ps: PS<T>) => {
    const memoryAddress = ProcessorState.getRegister(ps, getIp(ps.processor));
    const instruction = ProcessorState.getMemoryAddress(ps, memoryAddress);

    ProcessorState.setRegister(ps, getIs(ps.processor), instruction);
  };

  const getInstruction = <T>(ps: PS<T>, instructionNumber: number) => {
    let instruction = null;
    if (instructionNumber in ps.processor.instructions) {
      instruction = ps.processor.instructions[instructionNumber];
    } else if (ps.processor.getUndocumentedInstruction) {
      instruction = ps.processor.getUndocumentedInstruction(instructionNumber);
    }

    return instruction;
  };

  export const increment = <T>(ps: PS<T>) => {
    const ipName = getIp(ps.processor);

    const ip = ProcessorState.getRegister(ps, ipName);
    const instructionNumber = ProcessorState.getRegister(ps, getIs(ps.processor));

    let ipIncrement = 1;
    const instruction = getInstruction(ps, instructionNumber);
    if (instruction) {
      ipIncrement = instruction.ipIncrement;
    }

    ProcessorState.setRegister(ps, ipName, ip + ipIncrement);
  };

  export const execute = <T>(ps: PS<T>) => {
    const instructionNumber = ProcessorState.getRegister(ps, getIs(ps.processor));

    const instruction = getInstruction(ps, instructionNumber);
    if (instruction) {
      instruction.execute(ps);
    } else {
      ps.state.isHalted = true;
    }
  };

  export const step = <T>(ps: PS<T>) => {
    if (!ps.state.isHalted) {
      const pipeline = getPipeline(ps.processor);
      const stepFunction = pipeline[ps.state.pipelineStep];
      stepFunction(ps);
      ProcessorState.nextStep(ps);
    }
  };

  export function* run<T>(ps: PS<T>) {
    while (!ps.state.isHalted) {
      step(ps);
    }
  }
}
