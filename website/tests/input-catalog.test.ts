import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildInputCatalogFamilies,
  getInputCatalogFamilyKey,
} from '../src/lib/input-catalog.ts';
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

test('getInputCatalogFamilyKey groups inputs by type and entity when possible', () => {
  assert.equal(
    getInputCatalogFamilyKey(buildInput('dataset_size__fineweb2__tokens', {
      variable_type: 'dataset_size',
      entity: 'fineweb2',
    })),
    'dataset_size::fineweb2',
  );

  assert.equal(
    getInputCatalogFamilyKey(buildInput('standalone_benchmark', {
      variable_type: 'other',
      entity: undefined,
    })),
    'other::standalone_benchmark',
  );
});

test('buildInputCatalogFamilies turns near-duplicate benchmark rows into one family', () => {
  const entries = [
    {
      key: 'dataset_size__fineweb2__terabytes',
      input: buildInput('dataset_size__fineweb2__terabytes', {
        title: 'Corpus size (FineWeb2)',
        variable_type: 'dataset_size',
        entity: 'fineweb2',
        display_units: 'terabytes',
        mainExampleForCategory: false,
      }),
    },
    {
      key: 'dataset_size__fineweb2__words',
      input: buildInput('dataset_size__fineweb2__words', {
        title: 'Total words (FineWeb2)',
        variable_type: 'dataset_size',
        entity: 'fineweb2',
        display_units: 'trillions of words',
        mainExampleForCategory: true,
      }),
    },
    {
      key: 'yearly_revenue__openai__dollars',
      input: buildInput('yearly_revenue__openai__dollars', {
        title: 'Yearly revenue (OpenAI)',
        variable_type: 'yearly_revenue',
        entity: 'openai',
        display_units: 'billions of dollars',
        mainExampleForCategory: true,
      }),
    },
  ];

  const families = buildInputCatalogFamilies(entries);

  assert.deepEqual(
    families.map((family) => ({
      key: family.key,
      title: family.title,
      entries: family.entries.map((entry) => entry.key),
    })),
    [
      {
        key: 'dataset_size::fineweb2',
        title: 'Fineweb2 dataset size benchmarks',
        entries: [
          'dataset_size__fineweb2__words',
          'dataset_size__fineweb2__terabytes',
        ],
      },
      {
        key: 'yearly_revenue::openai',
        title: 'Openai revenue benchmarks',
        entries: ['yearly_revenue__openai__dollars'],
      },
    ],
  );

  assert.match(families[0].description, /2 related measurements\. Including terabytes\./i);
});
