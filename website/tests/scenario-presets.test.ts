import test from 'node:test';
import assert from 'node:assert/strict';

import type { Input, Scenario } from '../src/lib/calculations.ts';
import {
  CUSTOM_SCENARIO_PRESET_ID,
  DEFAULT_SCENARIO_PRESET_ID,
  getActiveScenarioPresetId,
  getScenarioPresetRelevantInputKeys,
  scenarioPresetMatches,
} from '../src/lib/scenario-presets.ts';

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

function buildScenario(overrides: Partial<Scenario> = {}): Scenario {
  return {
    id: 'scenario',
    title: 'Scenario',
    description: 'desc',
    input_variables: ['dataset_source', 'wage_source'],
    inputs: ['dataset_source', 'wage_source'],
    formula: '{dataset_source} * {wage_source}',
    result_label: 'Result',
    result_units: 'dollars',
    result: {
      value: '0',
      rawValue: 0,
      units: 'dollars',
    },
    category: 'Paying for new labour',
    presets: [],
    ...overrides,
  };
}

test('scenarioPresetMatches treats default state as a preset with default fills and values', () => {
  const scenario = buildScenario();
  const inputs = {
    dataset_source: buildInput('dataset_source', { value: 10, default_value: 10 }),
    wage_source: buildInput('wage_source', { value: 2, default_value: 2 }),
  };

  assert.equal(
    scenarioPresetMatches(scenario, null, {
      dataset_source: 'dataset_source',
      wage_source: 'wage_source',
    }, inputs),
    true,
  );

  inputs.wage_source.value = 3;

  assert.equal(
    scenarioPresetMatches(scenario, null, {
      dataset_source: 'dataset_source',
      wage_source: 'wage_source',
    }, inputs),
    false,
  );
});

test('getActiveScenarioPresetId recognizes fill-based and value-based presets', () => {
  const scenario = buildScenario({
    presets: [
      {
        id: 'alt-benchmark',
        label: 'Alt benchmark',
        fills: [{ input: 'dataset_source', variant: 'dataset_alt' }],
      },
      {
        id: 'premium-rate',
        label: 'Premium rate',
        values: [{ input: 'wage_source', value: 5 }],
      },
    ],
  });
  const inputs = {
    dataset_source: buildInput('dataset_source', { value: 10, default_value: 10 }),
    dataset_alt: buildInput('dataset_alt', { value: 15, default_value: 15 }),
    wage_source: buildInput('wage_source', { value: 2, default_value: 2 }),
  };

  assert.equal(
    getActiveScenarioPresetId(scenario, {
      dataset_source: 'dataset_source',
      wage_source: 'wage_source',
    }, inputs),
    DEFAULT_SCENARIO_PRESET_ID,
  );

  assert.equal(
    getActiveScenarioPresetId(scenario, {
      dataset_source: 'dataset_alt',
      wage_source: 'wage_source',
    }, inputs),
    'alt-benchmark',
  );

  inputs.wage_source.value = 5;

  assert.equal(
    getActiveScenarioPresetId(scenario, {
      dataset_source: 'dataset_source',
      wage_source: 'wage_source',
    }, inputs),
    'premium-rate',
  );

  inputs.wage_source.value = 7;

  assert.equal(
    getActiveScenarioPresetId(scenario, {
      dataset_source: 'dataset_source',
      wage_source: 'wage_source',
    }, inputs),
    CUSTOM_SCENARIO_PRESET_ID,
  );
});

test('getScenarioPresetRelevantInputKeys collects base inputs, fill targets, and overridden values', () => {
  const scenario = buildScenario({
    presets: [
      {
        id: 'combo',
        label: 'Combo',
        fills: [{ input: 'dataset_source', variant: 'dataset_alt' }],
        values: [{ input: 'wage_source', value: 5 }],
      },
    ],
  });

  assert.deepEqual(
    getScenarioPresetRelevantInputKeys(scenario).sort(),
    ['dataset_alt', 'dataset_source', 'wage_source'],
  );
});
