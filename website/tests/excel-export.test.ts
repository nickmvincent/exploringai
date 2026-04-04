import test from 'node:test';
import assert from 'node:assert/strict';

import type { Input, Scenario } from '../src/lib/calculations.ts';
import {
  buildExcelExpression,
  buildWorkbookExportModel,
  INPUTS_SHEET_COLUMNS,
  SCENARIO_INPUTS_SHEET_COLUMNS,
  SCENARIOS_SHEET_COLUMNS,
  type WorkbookCell,
  type WorkbookFormulaCell,
} from '../src/lib/excel-export.ts';

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
    display_units: 'units',
    variable_name: key,
    variable_type: 'dataset_size',
    units: 'tokens',
    ...overrides,
  };
}

function buildScenario(overrides: Partial<Scenario> = {}): Scenario {
  return {
    id: 'distribution',
    title: 'Distribution',
    description: 'Distribute revenue broadly.',
    input_variables: [
      'yearly_revenue__openai__dollars',
      'group_size__world__people',
    ],
    inputs: [
      'yearly_revenue__anthropic__dollars',
      'group_size__world__people',
    ],
    formula: '{yearly_revenue__openai__dollars} / {group_size__world__people}',
    result_label: 'Per person revenue',
    result_units: 'dollars',
    category: 'Distributing money',
    result: {
      value: '1.00',
      rawValue: 1,
      units: 'dollars',
    },
    ...overrides,
  };
}

function getFormulaCell(cell: WorkbookCell): WorkbookFormulaCell {
  assert.equal(typeof cell, 'object');
  assert.ok(cell);
  assert.ok('formula' in cell);
  return cell;
}

test('buildExcelExpression swaps project tokens for absolute worksheet references', () => {
  assert.equal(
    buildExcelExpression(
      '({revenue} + {cost}) / 2',
      {
        revenue: "'Scenario Inputs'!$J$2",
        cost: "'Scenario Inputs'!$J$3",
      },
    ),
    "=('Scenario Inputs'!$J$2 + 'Scenario Inputs'!$J$3) / 2",
  );

  assert.equal(
    buildExcelExpression('{revenue} / {missing}', {
      revenue: "'Scenario Inputs'!$J$2",
    }),
    null,
  );
});

test('buildWorkbookExportModel links editable inputs to scenario formulas', () => {
  const inputs = {
    yearly_revenue__openai__dollars: buildInput('yearly_revenue__openai__dollars', 3_490_000_000, {
      title: 'OpenAI revenue',
      scale: 1_000_000,
      display_units: 'millions of dollars',
      units: 'dollars',
    }),
    yearly_revenue__anthropic__dollars: buildInput('yearly_revenue__anthropic__dollars', 1_500_000_000, {
      title: 'Anthropic revenue',
      scale: 1_000_000,
      display_units: 'millions of dollars',
      units: 'dollars',
    }),
    group_size__world__people: buildInput('group_size__world__people', 8_100_000_000, {
      title: 'World population',
      scale: 1_000_000_000,
      display_units: 'billions of people',
      units: 'people',
    }),
  };
  const scenario = buildScenario({
    result: {
      value: '0.19',
      rawValue: 1_500_000_000 / 8_100_000_000,
      units: 'dollars',
    },
  });

  const workbook = buildWorkbookExportModel({
    inputs,
    scenarios: [scenario],
    sourceUrl: 'https://example.com/calculator',
    exportedAt: new Date('2026-04-03T12:00:00.000Z'),
  });

  assert.equal(workbook.filename, 'exploring-ai-scenarios-inputs-2026-04-03T12-00-00Z.xlsx');
  assert.deepEqual(workbook.sheets.map((sheet) => sheet.name), [
    'README',
    'Inputs',
    'Scenario Inputs',
    'Scenarios',
  ]);

  const inputsSheet = workbook.sheets[1];
  const firstInputRow = inputsSheet.rows[1];
  const rawValueCell = getFormulaCell(firstInputRow[INPUTS_SHEET_COLUMNS.rawValue]);
  assert.equal(rawValueCell.formula, 'C2*F2');
  assert.equal(rawValueCell.value, 1_500_000_000);

  const scenarioInputsSheet = workbook.sheets[2];
  const revenueSlotRow = scenarioInputsSheet.rows[1];
  const selectedVariable = revenueSlotRow[SCENARIO_INPUTS_SHEET_COLUMNS.selectedInputVariable];
  assert.equal(selectedVariable, 'yearly_revenue__anthropic__dollars');

  const scenarioInputRawValue = getFormulaCell(revenueSlotRow[SCENARIO_INPUTS_SHEET_COLUMNS.rawValue]);
  assert.match(
    scenarioInputRawValue.formula,
    /MATCH\('Scenario Inputs'!\$F\$2,'Inputs'!\$A:\$A,0\)/,
  );
  assert.equal(scenarioInputRawValue.value, 1_500_000_000);

  const scenariosSheet = workbook.sheets[3];
  const scenarioRow = scenariosSheet.rows[1];
  const resultCell = getFormulaCell(scenarioRow[SCENARIOS_SHEET_COLUMNS.result]);
  assert.equal(
    resultCell.formula,
    "'Scenario Inputs'!$J$2 / 'Scenario Inputs'!$J$3",
  );
  assert.equal(resultCell.value, 1_500_000_000 / 8_100_000_000);
  assert.equal(
    scenarioRow[SCENARIOS_SHEET_COLUMNS.excelFormula],
    "='Scenario Inputs'!$J$2 / 'Scenario Inputs'!$J$3",
  );
});

test('buildWorkbookExportModel includes valid custom scenarios and skips broken ones', () => {
  const inputs = {
    yearly_revenue__openai__dollars: buildInput('yearly_revenue__openai__dollars', 10, {
      title: 'OpenAI revenue',
      units: 'dollars',
    }),
  };

  const validWorkbook = buildWorkbookExportModel({
    inputs,
    scenarios: [],
    customScenario: {
      title: 'Custom Revenue',
      description: 'A custom draft.',
      category: 'Distributing money',
      expression: '{yearly_revenue__openai__dollars} * 2',
      resultLabel: 'Adjusted revenue',
      resultUnits: 'dollars',
      rawValue: 20,
    },
    exportedAt: new Date('2026-04-03T12:00:00.000Z'),
  });

  assert.equal(validWorkbook.sheets[3].rows.length, 2);
  assert.equal(validWorkbook.sheets[3].rows[1][SCENARIOS_SHEET_COLUMNS.kind], 'Custom');

  const invalidWorkbook = buildWorkbookExportModel({
    inputs,
    scenarios: [],
    customScenario: {
      title: 'Broken custom',
      description: 'Should not export.',
      category: 'Distributing money',
      expression: '{yearly_revenue__openai__dollars} /',
      resultLabel: 'Adjusted revenue',
      resultUnits: 'dollars',
      error: 'Formula cannot end with an operator.',
    },
    exportedAt: new Date('2026-04-03T12:00:00.000Z'),
  });

  assert.equal(invalidWorkbook.sheets[3].rows.length, 1);
});
