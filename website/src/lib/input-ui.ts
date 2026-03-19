import { formatLabel, type Input } from './calculations';

export type InputScope = 'free' | 'scenario' | 'library';

export function getInputTitle(key: string, input?: Input | null): string {
  return input?.title || formatLabel(key);
}

function getInputElementId(scope: InputScope, key: string, suffix: string): string {
  return `${scope}-input-${key}-${suffix}`;
}

export function getInputFieldId(scope: InputScope, key: string): string {
  return getInputElementId(scope, key, 'field');
}

export function getInputHeadingId(scope: InputScope, key: string): string {
  return getInputElementId(scope, key, 'heading');
}

export function getInputSummaryId(scope: InputScope, key: string): string {
  return getInputElementId(scope, key, 'summary');
}

export function getInputLabelId(scope: InputScope, key: string): string {
  return getInputElementId(scope, key, 'label');
}

export function getInputVisibleLabel(input?: Pick<Input, 'display_units'> | null): string {
  if (!input?.display_units) {
    return 'Current value';
  }

  return `Current value (${input.display_units})`;
}
