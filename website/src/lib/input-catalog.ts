import { formatLabel, type Input } from './calculations.ts';

export type InputCatalogEntry<T extends Input = Input> = {
  key: string;
  input: T;
};

export type InputCatalogFamily<T extends Input = Input> = {
  key: string;
  title: string;
  eyebrow: string;
  description: string;
  entries: InputCatalogEntry<T>[];
};

const FAMILY_TITLE_BY_TYPE: Record<string, string> = {
  average_length: 'length benchmark',
  conversion_rate: 'conversion benchmarks',
  dataset_attribute: 'dataset attributes',
  dataset_size: 'dataset size benchmarks',
  deal_group_size: 'audience sizes',
  deal_value: 'deal values',
  group_size: 'population benchmarks',
  inference_price: 'API prices',
  post_training_size: 'post-training sizes',
  post_training_source: 'post-training sources',
  pretraining_composition: 'pretraining mix',
  target_metric: 'target metrics',
  total_books: 'book counts',
  training_detail: 'training details',
  training_compute: 'training compute',
  wage_data: 'wage benchmarks',
  yearly_revenue: 'revenue benchmarks',
};

function sortCatalogEntries(a: InputCatalogEntry, b: InputCatalogEntry): number {
  const rankA = a.input.importanceRank ?? Number.MAX_SAFE_INTEGER;
  const rankB = b.input.importanceRank ?? Number.MAX_SAFE_INTEGER;
  if (rankA !== rankB) {
    return rankA - rankB;
  }

  return (a.input.title || a.key).localeCompare(b.input.title || b.key);
}

function getFamilyTitle(input: Pick<Input, 'entity' | 'variable_type' | 'variable_name' | 'title'>): string {
  if (!input.entity) {
    return input.title || formatLabel(input.variable_name);
  }

  const familyLabel = FAMILY_TITLE_BY_TYPE[input.variable_type] ?? formatLabel(input.variable_type);
  return `${formatLabel(input.entity)} ${familyLabel}`;
}

function getFamilyDescription(entries: InputCatalogEntry[]): string {
  const lead = entries[0]?.input;
  if (!lead) {
    return '';
  }

  if (entries.length === 1) {
    return lead.summary || lead.importanceReason || 'Standalone benchmark.';
  }

  const variantLabels = entries
    .slice(1, 4)
    .map(({ input }) => input.display_units)
    .filter(Boolean)
    .join(', ');
  const remainingCount = Math.max(entries.length - 4, 0);
  const suffix = remainingCount ? `, and ${remainingCount} more` : '';

  return `${formatLabel(lead.entity || lead.variable_name)} is tracked in ${entries.length} related measurements. The representative entry uses ${lead.display_units}; variants include ${variantLabels}${suffix}.`;
}

export function getInputCatalogFamilyKey(
  input: Pick<Input, 'entity' | 'variable_name' | 'variable_type'>,
): string {
  if (input.entity) {
    return `${input.variable_type}::${input.entity}`;
  }

  return `${input.variable_type}::${input.variable_name}`;
}

export function buildInputCatalogFamilies<T extends Input>(
  entries: InputCatalogEntry<T>[],
): InputCatalogFamily<T>[] {
  const families = new Map<string, InputCatalogEntry<T>[]>();

  entries
    .slice()
    .sort(sortCatalogEntries)
    .forEach((entry) => {
      const familyKey = getInputCatalogFamilyKey(entry.input);
      const existing = families.get(familyKey) ?? [];
      existing.push(entry);
      families.set(familyKey, existing);
    });

  return [...families.entries()]
    .map(([key, familyEntries]) => {
      const lead = familyEntries[0].input;
      return {
        key,
        title: getFamilyTitle(lead),
        eyebrow: formatLabel(lead.variable_type),
        description: getFamilyDescription(familyEntries),
        entries: familyEntries,
      };
    })
    .sort((a, b) => sortCatalogEntries(a.entries[0], b.entries[0]));
}
