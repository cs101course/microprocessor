import { Processor } from "./processor";
import { Processor as P } from "./types";

const defaultPipeline = [Processor.fetch, Processor.increment, Processor.execute];
export const getIp = <T>(processor: P<T>) => processor.ipName || "IP";
export const getIs = <T>(processor: P<T>) => processor.isName || "IS";
export const getPipeline = <T>(processor: P<T>) => processor.pipeline || defaultPipeline;
