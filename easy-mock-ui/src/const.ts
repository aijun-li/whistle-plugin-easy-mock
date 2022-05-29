import { VariableStatus } from './typings';

export const LOCAL_DEFAULT_TYPE_KEY = 'default_type';

export const VariableStatusInvalidMsg = {
  [VariableStatus.Valid]: '',
  [VariableStatus.NameCharInvalid]: 'can only contain [0-9a-zA-Z_]',
  [VariableStatus.NameEndsInvalid]: 'cannot start/end with _',
  [VariableStatus.ValueInvalid]: 'not a valid JSON value',
};
