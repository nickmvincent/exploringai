import type { Input } from './calculations';

export type InputFocusKey = 'money' | 'training-scale' | 'people' | 'data-mix' | 'other';

export type InputFocusGroup = {
  key: InputFocusKey;
  chipLabel: string;
  prompt: string;
  label: string;
  description: string;
};

export const INPUT_FOCUS_GROUPS: InputFocusGroup[] = [
  {
    key: 'money',
    chipLabel: 'Money',
    prompt: "I'm curious about money",
    label: 'Money, payouts, and prices',
    description: 'Revenue anchors, deal values, labour rates, and inference pricing.',
  },
  {
    key: 'training-scale',
    chipLabel: 'Training sizes',
    prompt: "I'm curious about training sizes",
    label: 'Training sizes and benchmark totals',
    description: 'Token counts, example counts, benchmark sizes, and other scale assumptions.',
  },
  {
    key: 'people',
    chipLabel: 'People and groups',
    prompt: "I'm curious about people or audience size",
    label: 'People, groups, and distribution targets',
    description: 'Population, audience, workforce, and contributor counts used in per-person math.',
  },
  {
    key: 'data-mix',
    chipLabel: 'Data mix',
    prompt: "I'm curious about data mix",
    label: 'Data mix and dataset structure',
    description: 'Composition shares, source slices, document size, and related dataset structure.',
  },
  {
    key: 'other',
    chipLabel: 'Other',
    prompt: "I'm curious about the remaining inputs",
    label: 'Other inputs',
    description: 'Additional anchors that do not fit one of the main question buckets.',
  },
];

const INPUT_FOCUS_BY_TYPE: Record<string, InputFocusKey> = {
  average_length: 'data-mix',
  conversion_rate: 'data-mix',
  dataset_attribute: 'data-mix',
  dataset_size: 'training-scale',
  deal_group_size: 'people',
  deal_value: 'money',
  group_size: 'people',
  inference_price: 'money',
  post_training_size: 'training-scale',
  post_training_source: 'data-mix',
  pretraining_composition: 'data-mix',
  target_metric: 'training-scale',
  total_books: 'training-scale',
  training_detail: 'training-scale',
  wage_data: 'money',
  yearly_revenue: 'money',
};

export function getInputFocusGroupKey(
  inputOrType?: Pick<Input, 'variable_type'> | string | null
): InputFocusKey {
  const variableType = typeof inputOrType === 'string' ? inputOrType : inputOrType?.variable_type;
  return (variableType && INPUT_FOCUS_BY_TYPE[variableType]) || 'other';
}

export function getInputFocusGroup(
  inputOrType?: Pick<Input, 'variable_type'> | string | null
): InputFocusGroup {
  const key = getInputFocusGroupKey(inputOrType);
  return INPUT_FOCUS_GROUPS.find((group) => group.key === key) ?? INPUT_FOCUS_GROUPS[INPUT_FOCUS_GROUPS.length - 1];
}
