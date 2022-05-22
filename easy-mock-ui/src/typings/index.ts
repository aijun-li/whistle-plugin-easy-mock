export const enum MockType {
  IDL = 'rpc', // TODO: should rename to rpc
  HTTP = 'http',
}

export interface MockItemData {
  label: string;
  value: string;
}

export interface MockItem {
  type: MockType;
  pattern: string;
  data: MockItemData[];
  enabled: boolean;
  delay: number;
  idx: number;
}

type JSONValue = string | number | boolean | { [x: string]: JSONValue } | Array<JSONValue>;

export interface Rules {
  idl: MockItem[];
  http: MockItem[];
}

export interface CollectionBrief {
  title: string;
  id: string;
}

export interface Collection extends CollectionBrief {
  rules: Rules;
  zap: boolean;
}
