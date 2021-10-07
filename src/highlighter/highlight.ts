import { Processor } from "../types";

const isMnemonic = (processor: Processor<any>, token: string) => {
  return Object.values(processor.instructions).some((value) => value.mnemonic === token);
};

export const highlightCode = (processor: Processor<any>, highlightRowCol?: [number, number]) => (code: string) => {
  const lines = code.split("\n");

  const labels: Record<string, boolean> = {};
  lines.forEach((line: string) => {
    const results = line.matchAll(/(\S+):/g);
    for (let result of results) {
      labels[result[1]] = true;
    }
  });

  if (highlightRowCol) {
    const currLine = lines[highlightRowCol[0]];
    const startIndex = highlightRowCol[1];

    let endIndex = startIndex;
    while (endIndex < currLine.length) {
      if (/\s/.test(currLine.charAt(endIndex))) {
        break;
      }
      endIndex++;
    }

    const prefix = currLine.substring(0, startIndex);
    const highlighted = currLine.substring(startIndex, endIndex);
    const suffix = currLine.substring(endIndex);

    lines[highlightRowCol[0]] = `${prefix}<span class="code-highlight">${highlighted}</span>${suffix}`;
  }

  return lines.map(
    (line: string) => {
      const parts = line.split("//");

      const linePrefix = parts[0]
        .replace(/([\S^<^>]+)/g, (match: string, token: string) => {
          if (token.endsWith(":")) {
            return `<span class="code-label">${token}</span>`;
          } else if (isMnemonic(processor, token)) {
            return `<span class="code-mnemonic">${token}</span>`;
          } else if (labels[token]) {
            return `<span class="code-labelref">${token}</span>`;
          } else {
            return match;
          }
        });

      const lineSuffix = parts.length > 1 ? `<span class="code-comment">//${parts.slice(1).join("//")}</span>` : "";

      return linePrefix + lineSuffix;
    }
  ).join('\n');
};
