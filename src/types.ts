export type ExecutionFunction<T> = (ps: ProcessorState<T>) => void;

export type PipelineStep<T> = (ps: ProcessorState<T>) => void;

export interface Instruction<T> {
  description: string;
  ipIncrement: number;
  execute: ExecutionFunction<T>;
}

export interface State<T> {
  memory: Array<number>;
  registers: Record<string, number>;
  isHalted: boolean;
  peripherals: T;
  pipelineStep: number;
  executionStep: number;
}

export interface Processor<T> {
  memoryBitSize: number;
  registerBitSize: number;
  numMemoryAddresses: number;
  instructions: Array<Instruction<T>>;
  registerNames: Array<string>;
  peripherals: Array<Peripheral<T>>;
  pipeline?: Array<PipelineStep<T>>;
  ipName?: string;
  isName?: string;
}

export interface ProcessorState<T> {
  processor: Processor<T>;
  state: State<T>;
}

export interface Peripheral<T> {
  reset(peripheralState: T): void;
}
