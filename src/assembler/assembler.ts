import { Processor } from "../types";

export const assemble = <T>(processor: Processor<T>, code: string): Array<number> => {
  const lines = code.split("\n");
  const strippedLines = lines.map(
    (line: string) => line.split("//")[0]
  );
  const byteLabels = strippedLines.flatMap(
    (line) => line.split(/\s+/).filter(
      (byteLabel) => byteLabel !== ""
    )
  );
  
  const instructionNumbers = Object.keys(processor.instructions).map(Number);
  const mnemonicLookup = instructionNumbers.reduce(
    (lookup, instructionNumber) => {
      const mnemonic = processor.instructions[instructionNumber].mnemonic;

      if (mnemonic) {
        lookup[mnemonic] = instructionNumber;
      }

      return lookup;
    },
    <Record<string, number>>{}
  );

  const byteLabelsStripped = [];
  const labelAddresses: Record<string, number> = {};
  let replacedIndex = 0;
  for (let byteLabel of byteLabels) {
    if (byteLabel === byteLabel.toUpperCase() && byteLabel.endsWith(":")) {
      labelAddresses[byteLabel.replace(":", "")] = replacedIndex;
    } else {
      byteLabelsStripped.push(byteLabel);
      replacedIndex++;
    }
  }

  const bytes = byteLabelsStripped.map((byteLabel, pos) => {
    if (byteLabel in labelAddresses) {
      return labelAddresses[byteLabel];
    } else if (byteLabel in mnemonicLookup) {
      return mnemonicLookup[byteLabel]
    } else if (byteLabel.length === 3 && byteLabel.startsWith("'") && byteLabel.endsWith("'")) {
      return byteLabel.charCodeAt(1);
    } else {
      const instructionNumber = Number(byteLabel);
      if (!isNaN(instructionNumber)) {
        return instructionNumber;
      }
    }

    throw new Error(`Unable to parse instruction: "${byteLabel}" at ${pos}`);
  });

  return bytes;
};
