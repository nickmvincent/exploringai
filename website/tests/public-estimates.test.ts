import test from 'node:test';
import assert from 'node:assert/strict';

import type { Input, Scenario } from '../src/lib/calculations.ts';
import {
  applyScenarioPreset,
  evaluateScenario,
  formatEstimate,
  formatInputBenchmark,
  getScenarioCases,
} from '../src/lib/public-estimates.ts';

function input(key: string, value: number, overrides: Partial<Input> = {}): Input {
  return {
    id: key,
    title: key,
    value,
    default_value: value,
    scale: 1,
    display_units: 'units',
    variable_name: key,
    variable_type: 'dataset_size',
    units: 'tokens',
    ...overrides,
  };
}

function scenario(): Scenario {
  return {
    id: 'example',
    title: 'Example',
    description: 'Example question',
    input_variables: ['quantity', 'rate'],
    inputs: ['quantity', 'rate'],
    formula: '{quantity} * {rate}',
    result_label: 'Result',
    result_units: 'dollars',
    category: 'Paying for new labour',
    result: { value: '', rawValue: null, units: 'dollars' },
    presets: [{
      id: 'alternative',
      label: 'Alternative case',
      fills: [{ input: 'quantity', variant: 'quantity_alt' }],
      values: [{ input: 'rate', value: 4 }],
    }],
  };
}

test('formatEstimate uses readable magnitudes and currency symbols', () => {
  assert.equal(formatEstimate(1_012_500_000_000, 'dollars'), '$1.01 trillion');
  assert.equal(formatEstimate(715_180_000, 'dollars'), '$715 million');
  assert.equal(formatEstimate(300_000, 'questions'), '300 thousand');
});

test('formatInputBenchmark converts scaled quantities to natural magnitudes', () => {
  assert.equal(formatInputBenchmark(input('tokens', 15_000_000_000_000, {
    scale: 1_000_000_000,
    display_units: 'billions of tokens',
  })), '15 trillion tokens');
  assert.equal(formatInputBenchmark(input('revenue', 25_000_000_000, {
    scale: 1_000_000_000,
    display_units: 'billions of dollars',
    units: 'dollars',
  })), '$25 billion');
});

test('scenario cases apply both variant fills and explicit value overrides', () => {
  const testScenario = scenario();
  const inputs = {
    quantity: input('quantity', 10),
    quantity_alt: input('quantity_alt', 20),
    rate: input('rate', 2),
  };
  const preset = testScenario.presets![0];
  const applied = applyScenarioPreset(testScenario, preset, inputs);

  assert.equal(applied.selectedKeys.quantity, 'quantity_alt');
  assert.equal(applied.values.quantity, 20);
  assert.equal(applied.values.rate, 4);
  assert.equal(evaluateScenario(testScenario, applied.values), 80);
  assert.deepEqual(getScenarioCases(testScenario, inputs).map((entry) => entry.result), [20, 80]);
});
