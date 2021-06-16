import { ProcessorState as PS, Processor as P } from "./types";
import { ProcessorState } from "./state";

export namespace Processor {
  export const getPipeline = <T>(processor: P<T>) => {
    const defaultPipeline = [Processor.fetch, Processor.increment, Processor.execute];
    return processor.pipeline || defaultPipeline;
  };

  export const fetch = <T>(ps: PS<T>) => {
    const memoryAddress = ProcessorState.getIp(ps);
    const instruction = ProcessorState.getMemoryAddress(ps, memoryAddress);
    ProcessorState.setIs(ps, instruction);
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
    const ip = ProcessorState.getIp(ps);
    const instructionNumber = ProcessorState.getIs(ps);

    let ipIncrement = 1;
    const instruction = getInstruction(ps, instructionNumber);
    if (instruction) {
      ipIncrement = instruction.ipIncrement;
    }

    ProcessorState.setIp(ps, ip + ipIncrement);
  };

  export const execute = <T>(ps: PS<T>) => {
    const instructionNumber = ProcessorState.getIs(ps);

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
      ProcessorState.nextStep(ps, pipeline);
    }
  };

  export function* run<T>(ps: PS<T>) {
    while (!ps.state.isHalted) {
      step(ps);
    }
  }
}
