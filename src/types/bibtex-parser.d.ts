// Minimal ambient types for @retorquere/bibtex-parser (it ships no declarations).
// We only use `parse`; field values are read defensively as unknown.
declare module "@retorquere/bibtex-parser" {
  export interface BibtexEntry {
    type: string;
    key: string;
    fields: Record<string, unknown>;
  }
  export interface Bibliography {
    entries: BibtexEntry[];
  }
  export function parse(
    input: string,
    options?: { sentenceCase?: boolean } & Record<string, unknown>,
  ): Bibliography;
}
