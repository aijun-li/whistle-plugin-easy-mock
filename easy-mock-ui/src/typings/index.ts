export const enum MockType {
  IDL = 'idl',
  HTTP = 'http',
}

export interface MockItem {
  type: MockType;
  pattern: string;
  data: string;
  enabled: boolean;
  delay: number;
}

type JSONValue =
  | string
  | number
  | boolean
  | { [x: string]: JSONValue }
  | Array<JSONValue>;

export interface Content {
  text?: string;
  json?: JSONValue;
}

export interface Rules {
  idl: MockItem[];
  http: MockItem[];
}
