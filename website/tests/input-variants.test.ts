import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildVariantOptionGroups,
  isReasonableVariant,
} from '../src/lib/input-variants.ts';
import type { Input } from '../src/lib/calculations.ts';

function buildInput(
  key: string,
  overrides: Partial<Input> = {},
): Input {
  return {
    id: key,
    title: key,
    value: 1,
    default_value: 1,
    scale: 1,
    display_units: 'units',
    variable_name: key,
    variable_type: 'dataset_size',
    units: 'tokens',
    ...overrides,
  };
}

test('isReasonableVariant requires matching unit buckets for dataset and wage inputs', () => {
  const datasetTokens = buildInput('dataset_tokens', {
    variable_type: 'dataset_size',
    units: 'tokens',
  });
  const datasetQuestions = buildInput('dataset_questions', {
    variable_type: 'dataset_size',
    units: 'questions',
  });
  const wagePerWord = buildInput('wage_per_word', {
    variable_type: 'wage_data',
    units: 'dollars_per_word',
  });
  const wagePerQuestion = buildInput('wage_per_question', {
    variable_type: 'wage_data',
    units: 'dollars_per_question',
  });

  assert.equal(isReasonableVariant(datasetTokens, datasetTokens), true);
  assert.equal(isReasonableVariant(datasetTokens, datasetQuestions), false);
  assert.equal(isReasonableVariant(wagePerWord, wagePerQuestion), false);
});

test('deal group size variants keep people-like options without mixing in article counts', () => {
  const dailyUsers = buildInput('deal_group_size__reddit__daily_active_users', {
    variable_type: 'deal_group_size',
    units: 'daily_active_users',
  });
  const employees = buildInput('deal_group_size__newscorp__employees', {
    variable_type: 'deal_group_size',
    units: 'employees',
  });
  const journalists = buildInput('deal_group_size__wsj__journalists', {
    variable_type: 'deal_group_size',
    units: 'journalists',
  });
  const articles = buildInput('deal_group_size__taylorandfrancis__articles', {
    variable_type: 'deal_group_size',
    units: 'articles',
  });

  assert.equal(isReasonableVariant(dailyUsers, employees), true);
  assert.equal(isReasonableVariant(dailyUsers, journalists), true);
  assert.equal(isReasonableVariant(dailyUsers, articles), false);
});

test('buildVariantOptionGroups separates current selection, default, suggested swaps, and long-tail variants', () => {
  const inputs = {
    source: buildInput('source', {
      title: 'Source benchmark',
      variable_type: 'dataset_size',
      units: 'tokens',
      mainExampleForCategory: false,
    }),
    selected_alt: buildInput('selected_alt', {
      title: 'Selected alt',
      variable_type: 'dataset_size',
      units: 'tokens',
      mainExampleForCategory: false,
    }),
    suggested_alt: buildInput('suggested_alt', {
      title: 'Suggested alt',
      variable_type: 'dataset_size',
      units: 'tokens',
      mainExampleForCategory: true,
    }),
    long_tail: buildInput('long_tail', {
      title: 'Long tail',
      variable_type: 'dataset_size',
      units: 'tokens',
      mainExampleForCategory: false,
    }),
    incompatible: buildInput('incompatible', {
      title: 'Wrong units',
      variable_type: 'dataset_size',
      units: 'terabytes',
    }),
  };

  const groups = buildVariantOptionGroups('source', 'selected_alt', inputs);

  assert.deepEqual(
    groups.map((group) => ({
      key: group.key,
      options: group.options.map((option) => option.variable_name),
    })),
    [
      { key: 'current', options: ['selected_alt'] },
      { key: 'default', options: ['source'] },
      { key: 'suggested', options: ['suggested_alt'] },
      { key: 'more', options: ['long_tail'] },
    ],
  );
});
