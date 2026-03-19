import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createCalculationFunction,
  humanReadable,
  updateCalculations,
  type Input,
  type Scenario,
} from '../src/lib/calculations.ts';

function buildScenario(overrides: Partial<Scenario> = {}): Scenario {
  return {
    id: 'scenario-a',
    title: 'Scenario A',
    description: 'Simple division',
    input_variables: ['revenue', 'group_size'],
    inputs: ['revenue', 'group_size'],
    formula: '{revenue} / {group_size}',
    result_label: 'Payout per person',
    result_units: 'dollars',
    category: 'Distribution',
    result: {
      value: '0',
      rawValue: 0,
      units: 'dollars',
    },
    showCalcDetails: false,
    ...overrides,
  };
}

function buildInput(
  key: string,
  value: number,
  overrides: Partial<Input> = {},
): Input {
  return {
    id: key,
    title: key,
    value,
    default_value: value,
    scale: 1,
    display_units: 'dollars',
    variable_name: key,
    variable_type: 'money',
    units: 'dollars',
    ...overrides,
  };
}

test('humanReadable formats large numbers with named orders of magnitude', () => {
  assert.equal(humanReadable(2_500_000), '2.50 million');
  assert.equal(humanReadable(1000), '1.00 thousand');
});

test('humanReadable preserves very small values without collapsing to zero', () => {
  assert.equal(humanReadable(0.0045), '0.0045');
  assert.equal(humanReadable(0.00000034), '3.40e-7');
});

test('createCalculationFunction evaluates a scenario formula with ordered inputs', () => {
  const scenario = buildScenario();
  const calculate = createCalculationFunction(scenario);

  assert.equal(calculate(120, 6), 20);
});

test('updateCalculations stores human-readable results and raw values', () => {
  const scenario = buildScenario({
    calculate: (revenue, groupSize) => revenue / groupSize,
  });
  const inputs = {
    revenue: buildInput('revenue', 120),
    group_size: buildInput('group_size', 6),
  };

  const [updatedScenario] = updateCalculations([scenario], inputs);

  assert.equal(updatedScenario.result.rawValue, 20);
  assert.equal(updatedScenario.result.value, '20.00');
});

test('updateCalculations returns a safe error state when an input is missing', () => {
  const scenario = buildScenario({
    calculate: (revenue, groupSize) => revenue / groupSize,
  });
  const inputs = {
    revenue: buildInput('revenue', 120),
  } as unknown as Record<string, Input>;

  const [updatedScenario] = updateCalculations([scenario], inputs);

  assert.equal(updatedScenario.result.rawValue, null);
  assert.equal(updatedScenario.result.value, 'Error: Missing input values');
});
