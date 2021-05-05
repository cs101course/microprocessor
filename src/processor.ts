import { ProcessorState as PS } from "./types";
import { ProcessorState } from "./state";
import { getIp, getIs, getPipeline } from "./defaults";

export namespace Processor {
  export const fetch = <T>(ps: PS<T>) => {
    const memoryAddress = ProcessorState.getRegister(ps, getIp(ps.processor));
    const instruction = ProcessorState.getMemoryAddress(ps, memoryAddress);

    ProcessorState.setRegister(ps, getIs(ps.processor), instruction);
  };

  export const increment = <T>(ps: PS<T>) => {
    const ipName = getIp(ps.processor);

    const ip = ProcessorState.getRegister(ps, ipName);
    const instructionNumber = ProcessorState.getRegister(ps, getIs(ps.processor));

    let ipIncrement = 1;
    if (instructionNumber < ps.processor.instructions.length) {
      const instruction = ps.processor.instructions[instructionNumber];
      ipIncrement = instruction.ipIncrement;
    }

    ProcessorState.setRegister(ps, ipName, ip + ipIncrement);
  };

  export const execute = <T>(ps: PS<T>) => {
    const instructionNumber = ProcessorState.getRegister(ps, getIs(ps.processor));

    if (instructionNumber < ps.processor.instructions.length) {
      const instruction = ps.processor.instructions[instructionNumber];
      instruction.execute(ps);
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
