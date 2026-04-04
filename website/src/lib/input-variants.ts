import type { Input } from './calculations';

export type VariantOptionGroupKey = 'current' | 'default' | 'suggested' | 'more';

export type VariantOptionGroup = {
  key: VariantOptionGroupKey;
  label: string;
  options: Input[];
};

const DEAL_GROUP_SIZE_PEOPLEISH_UNITS = new Set([
  'people',
  'employees',
  'daily_active_users',
  'journalists',
]);

function getCompatibilityUnitsBucket(input: Pick<Input, 'variable_type' | 'units'>): string {
  if (
    input.variable_type === 'deal_group_size' &&
    DEAL_GROUP_SIZE_PEOPLEISH_UNITS.has(input.units)
  ) {
    return 'peopleish';
  }

  return input.units;
}

function sortVariantOptions(a: Input, b: Input): number {
  if (Boolean(a.mainExampleForCategory) !== Boolean(b.mainExampleForCategory)) {
    return a.mainExampleForCategory ? -1 : 1;
  }

  return (a.title || a.variable_name).localeCompare(b.title || b.variable_name);
}

export function isReasonableVariant(
  source?: Pick<Input, 'variable_type' | 'units'> | null,
  target?: Pick<Input, 'variable_type' | 'units'> | null,
): boolean {
  if (!source || !target) {
    return false;
  }

  return (
    source.variable_type === target.variable_type &&
    getCompatibilityUnitsBucket(source) === getCompatibilityUnitsBucket(target)
  );
}

export function buildVariantOptionGroups(
  sourceKey: string,
  selectedKey: string | null | undefined,
  inputs: Record<string, Input>,
): VariantOptionGroup[] {
  const source = inputs[sourceKey];
  if (!source) {
    return [];
  }

  const selected =
    selectedKey && isReasonableVariant(source, inputs[selectedKey]) ? selectedKey : sourceKey;

  const groups = new Map<VariantOptionGroupKey, Input[]>();
  const compatibleOptions = Object.values(inputs)
    .filter((candidate) => isReasonableVariant(source, candidate))
    .sort(sortVariantOptions);

  compatibleOptions.forEach((candidate) => {
    let groupKey: VariantOptionGroupKey = 'more';

    if (candidate.variable_name === selected) {
      groupKey = 'current';
    } else if (candidate.variable_name === sourceKey) {
      groupKey = 'default';
    } else if (candidate.mainExampleForCategory) {
      groupKey = 'suggested';
    }

    const existing = groups.get(groupKey) ?? [];
    existing.push(candidate);
    groups.set(groupKey, existing);
  });

  return [
    { key: 'current', label: 'Current selection', options: groups.get('current') ?? [] },
    { key: 'default', label: 'Scenario default', options: groups.get('default') ?? [] },
    { key: 'suggested', label: 'Suggested benchmarks', options: groups.get('suggested') ?? [] },
    { key: 'more', label: 'More options', options: groups.get('more') ?? [] },
  ].filter((group) => group.options.length);
}
