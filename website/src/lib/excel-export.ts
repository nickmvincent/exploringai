import { formatLabel, formatValue, type Input, type Scenario } from './calculations.ts';
import { extractInputTokens } from './formulas.js';

type PrimitiveCell = string | number | boolean | null;

export type WorkbookFormulaCell = {
  formula: string;
  resultType?: 'n' | 's' | 'b';
  value?: PrimitiveCell;
};

export type WorkbookCell = PrimitiveCell | WorkbookFormulaCell;

export type WorkbookSheet = {
  name: string;
  rows: WorkbookCell[][];
  columnWidths?: number[];
  autoFilter?: {
    from: string;
    to: string;
  };
};

export type WorkbookExportModel = {
  filename: string;
  sheets: WorkbookSheet[];
};

export type CustomScenarioExport = {
  title: string;
  description: string;
  category: string;
  expression: string;
  resultLabel: string;
  resultUnits: string;
  rawValue?: number | null;
  error?: string;
};

type ExportScenario = Scenario & {
  exportKind: 'Curated' | 'Custom';
  exportStatus?: string;
};

const SHEET_NAMES = {
  readme: 'README',
  inputs: 'Inputs',
  scenarioInputs: 'Scenario Inputs',
  scenarios: 'Scenarios',
} as const;

export const INPUTS_SHEET_COLUMNS = {
  variableName: 0,
  title: 1,
  editableValue: 2,
  displayUnits: 3,
  defaultValue: 4,
  scale: 5,
  rawValue: 6,
  baseUnits: 7,
  variableType: 8,
  entity: 9,
  summary: 10,
  mainExample: 11,
  min: 12,
  max: 13,
  step: 14,
  sourceQuality: 15,
  sourceName: 16,
  sourceNote: 17,
  sourceUrl: 18,
  sourceLocator: 19,
  sourceLocatorUrl: 20,
  sourcePublished: 21,
  lastReviewed: 22,
  derivationNote: 23,
  sourceExcerpt: 24,
  usedIn: 25,
} as const;

export const SCENARIO_INPUTS_SHEET_COLUMNS = {
  scenarioId: 0,
  scenarioTitle: 1,
  category: 2,
  kind: 3,
  formulaToken: 4,
  selectedInputVariable: 5,
  selectedInputTitle: 6,
  editableValue: 7,
  displayUnits: 8,
  rawValue: 9,
  summary: 10,
} as const;

export const SCENARIOS_SHEET_COLUMNS = {
  scenarioId: 0,
  title: 1,
  category: 2,
  kind: 3,
  resultLabel: 4,
  resultUnits: 5,
  result: 6,
  formulaTemplate: 7,
  excelFormula: 8,
  description: 9,
  inputTokens: 10,
  selectedInputs: 11,
  status: 12,
} as const;

const LOOKUP_RESULT_TYPES = {
  string: 's',
  number: 'n',
} as const;

function isWorkbookFormulaCell(cell: WorkbookCell): cell is WorkbookFormulaCell {
  return typeof cell === 'object' && cell !== null && 'formula' in cell;
}

function quoteSheetName(name: string): string {
  return `'${name.replace(/'/g, "''")}'`;
}

export function toExcelColumnName(index: number): string {
  let current = index + 1;
  let column = '';

  while (current > 0) {
    const remainder = (current - 1) % 26;
    column = String.fromCharCode(65 + remainder) + column;
    current = Math.floor((current - 1) / 26);
  }

  return column;
}

export function toExcelCellRef(rowIndex: number, columnIndex: number): string {
  return `${toExcelColumnName(columnIndex)}${rowIndex + 1}`;
}

function absoluteCellRef(sheetName: string, rowIndex: number, columnIndex: number): string {
  return `${quoteSheetName(sheetName)}!$${toExcelColumnName(columnIndex)}$${rowIndex + 1}`;
}

function getInputDisplayValue(input: Input): number {
  return formatValue(input.value, input.scale);
}

function getInputDefaultDisplayValue(input: Input): number {
  return formatValue(input.default_value, input.scale);
}

function getSortedInputEntries(inputs: Record<string, Input>) {
  return Object.entries(inputs).sort(([, inputA], [, inputB]) => {
    if (Boolean(inputA.mainExampleForCategory) !== Boolean(inputB.mainExampleForCategory)) {
      return inputA.mainExampleForCategory ? -1 : 1;
    }

    return (inputA.title || inputA.variable_name).localeCompare(inputB.title || inputB.variable_name);
  });
}

function buildLookupFormula(options: {
  lookupCellRef: string;
  returnColumnIndex: number;
  resultType: keyof typeof LOOKUP_RESULT_TYPES;
  workbookValue?: PrimitiveCell;
}): WorkbookFormulaCell {
  const variableColumn = `$${toExcelColumnName(INPUTS_SHEET_COLUMNS.variableName)}:$${toExcelColumnName(INPUTS_SHEET_COLUMNS.variableName)}`;
  const returnColumn = `$${toExcelColumnName(options.returnColumnIndex)}:$${toExcelColumnName(options.returnColumnIndex)}`;
  const inputsSheet = quoteSheetName(SHEET_NAMES.inputs);

  return {
    formula: `IFERROR(INDEX(${inputsSheet}!${returnColumn},MATCH(${options.lookupCellRef},${inputsSheet}!${variableColumn},0)),"")`,
    resultType: LOOKUP_RESULT_TYPES[options.resultType],
    value: options.workbookValue ?? '',
  };
}

export function buildExcelExpression(
  expression: string,
  cellRefByVariable: Record<string, string>,
): string | null {
  if (!expression.trim()) {
    return null;
  }

  let hasMissingReference = false;
  const replacedExpression = expression.replace(/\{([a-z0-9_]+)\}/g, (_match, variableName: string) => {
    const cellRef = cellRefByVariable[variableName];
    if (!cellRef) {
      hasMissingReference = true;
      return 'NA()';
    }

    return cellRef;
  });

  if (hasMissingReference) {
    return null;
  }

  return `=${replacedExpression.trim()}`;
}

function buildReadmeSheet(options: {
  exportedAt: Date;
  inputCount: number;
  scenarioCount: number;
  sourceUrl?: string;
}): WorkbookSheet {
  const exportedAtLabel = options.exportedAt.toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const rows: WorkbookCell[][] = [
    ['Exploring AI workbook export', ''],
    ['Exported at', exportedAtLabel],
    ['Source page', options.sourceUrl ?? ''],
    ['Inputs exported', options.inputCount],
    ['Scenarios exported', options.scenarioCount],
    ['How to use this workbook', ''],
    [
      '1',
      'Edit the "Editable Value" column on the Inputs sheet to change shared assumptions in spreadsheet-friendly units.',
    ],
    [
      '2',
      'Edit the "Selected Input Variable" column on the Scenario Inputs sheet to swap a scenario slot to another input key from the Inputs sheet.',
    ],
    [
      '3',
      'Scenario result cells on the Scenarios sheet are live Excel formulas, so they recalculate after edits.',
    ],
    [
      '4',
      'Source notes, review dates, and citations are carried onto the Inputs sheet for reference.',
    ],
  ];

  return {
    name: SHEET_NAMES.readme,
    rows,
    columnWidths: [12, 120],
  };
}

function buildInputsSheet(inputs: Record<string, Input>) {
  const rows: WorkbookCell[][] = [
    [
      'Input Variable',
      'Input Title',
      'Editable Value',
      'Display Units',
      'Default Value',
      'Scale',
      'Raw Value',
      'Base Units',
      'Variable Type',
      'Entity',
      'Summary',
      'Main Example',
      'Min',
      'Max',
      'Step',
      'Source Quality',
      'Source Name',
      'Source Note',
      'Source URL',
      'Source Locator',
      'Source Locator URL',
      'Source Published',
      'Last Reviewed',
      'Derivation Note',
      'Source Excerpt',
      'Used In Scenarios',
    ],
  ];

  const inputCellRefs = new Map<string, { rawValue: string }>();

  getSortedInputEntries(inputs).forEach(([key, input]) => {
    const rowIndex = rows.length;
    const rawValueCellRef = absoluteCellRef(SHEET_NAMES.inputs, rowIndex, INPUTS_SHEET_COLUMNS.rawValue);
    inputCellRefs.set(key, { rawValue: rawValueCellRef });

    rows.push([
      key,
      input.title || formatLabel(key),
      getInputDisplayValue(input),
      input.display_units,
      getInputDefaultDisplayValue(input),
      input.scale,
      {
        formula: `${toExcelCellRef(rowIndex, INPUTS_SHEET_COLUMNS.editableValue)}*${toExcelCellRef(rowIndex, INPUTS_SHEET_COLUMNS.scale)}`,
        resultType: 'n',
        value: input.value,
      },
      input.units,
      input.variable_type,
      input.entity ?? '',
      input.summary ?? '',
      input.mainExampleForCategory ? 'Yes' : '',
      input.min ?? '',
      input.max ?? '',
      input.step ?? '',
      input.sourceQuality ?? '',
      input.sourceName ?? '',
      input.sourceNote ?? '',
      input.source_url ?? '',
      input.sourceLocator ?? '',
      input.sourceLocatorUrl ?? '',
      input.sourcePublished ?? '',
      input.lastReviewed ?? '',
      input.derivationNote ?? '',
      input.sourceExcerpt ?? '',
      input.usedIn?.map((scenario) => scenario.title).join('; ') ?? '',
    ]);
  });

  return {
    sheet: {
      name: SHEET_NAMES.inputs,
      rows,
      columnWidths: [34, 34, 16, 20, 16, 10, 16, 16, 18, 18, 42, 12, 10, 10, 10, 16, 20, 42, 28, 24, 28, 16, 16, 28, 36, 40],
      autoFilter: {
        from: 'A1',
        to: `${toExcelCellRef(0, INPUTS_SHEET_COLUMNS.usedIn)}`,
      },
    } satisfies WorkbookSheet,
    inputCellRefs,
  };
}

function buildExportScenarios(options: {
  scenarios: Scenario[];
  customScenario?: CustomScenarioExport | null;
}): ExportScenario[] {
  const curatedScenarios = options.scenarios.map((scenario) => ({
    ...scenario,
    exportKind: 'Curated' as const,
    exportStatus: 'Curated scenario from the site library.',
  }));

  if (!options.customScenario?.expression.trim() || options.customScenario.error) {
    return curatedScenarios;
  }

  const customScenarioInputVariables = extractInputTokens(options.customScenario.expression);

  curatedScenarios.push({
    id: 'custom_scenario',
    title: options.customScenario.title.trim() || 'Custom Scenario',
    description: options.customScenario.description.trim() || 'Custom scenario exported from the builder.',
    input_variables: customScenarioInputVariables,
    inputs: customScenarioInputVariables,
    formula: options.customScenario.expression,
    result_label: options.customScenario.resultLabel.trim() || 'Custom result',
    result_units: options.customScenario.resultUnits.trim() || 'units',
    category: options.customScenario.category,
    result: {
      value: '',
      rawValue: options.customScenario.rawValue ?? null,
      units: options.customScenario.resultUnits.trim() || 'units',
    },
    exportKind: 'Custom',
    exportStatus: 'Custom scenario from the current builder state.',
  });

  return curatedScenarios;
}

function buildScenarioInputsSheet(options: {
  exportScenarios: ExportScenario[];
  inputs: Record<string, Input>;
}) {
  const rows: WorkbookCell[][] = [
    [
      'Scenario ID',
      'Scenario Title',
      'Category',
      'Kind',
      'Formula Token',
      'Selected Input Variable',
      'Selected Input Title',
      'Editable Value',
      'Display Units',
      'Raw Value',
      'Summary',
    ],
  ];

  const rawValueCellRefByScenarioAndToken = new Map<string, string>();

  options.exportScenarios.forEach((scenario) => {
    scenario.input_variables.forEach((token, index) => {
      const selectedInputVariable = scenario.inputs[index] || token;
      const selectedInput = options.inputs[selectedInputVariable];
      const rowIndex = rows.length;
      const selectedVariableCellRef = absoluteCellRef(
        SHEET_NAMES.scenarioInputs,
        rowIndex,
        SCENARIO_INPUTS_SHEET_COLUMNS.selectedInputVariable,
      );

      rows.push([
        scenario.id,
        scenario.title,
        scenario.category,
        scenario.exportKind,
        token,
        selectedInputVariable,
        buildLookupFormula({
          lookupCellRef: selectedVariableCellRef,
          returnColumnIndex: INPUTS_SHEET_COLUMNS.title,
          resultType: 'string',
          workbookValue: selectedInput?.title || formatLabel(selectedInputVariable),
        }),
        buildLookupFormula({
          lookupCellRef: selectedVariableCellRef,
          returnColumnIndex: INPUTS_SHEET_COLUMNS.editableValue,
          resultType: 'number',
          workbookValue: selectedInput ? getInputDisplayValue(selectedInput) : '',
        }),
        buildLookupFormula({
          lookupCellRef: selectedVariableCellRef,
          returnColumnIndex: INPUTS_SHEET_COLUMNS.displayUnits,
          resultType: 'string',
          workbookValue: selectedInput?.display_units ?? '',
        }),
        buildLookupFormula({
          lookupCellRef: selectedVariableCellRef,
          returnColumnIndex: INPUTS_SHEET_COLUMNS.rawValue,
          resultType: 'number',
          workbookValue: selectedInput?.value ?? '',
        }),
        buildLookupFormula({
          lookupCellRef: selectedVariableCellRef,
          returnColumnIndex: INPUTS_SHEET_COLUMNS.summary,
          resultType: 'string',
          workbookValue: selectedInput?.summary ?? '',
        }),
      ]);

      rawValueCellRefByScenarioAndToken.set(
        `${scenario.id}::${token}`,
        absoluteCellRef(SHEET_NAMES.scenarioInputs, rowIndex, SCENARIO_INPUTS_SHEET_COLUMNS.rawValue),
      );
    });
  });

  return {
    sheet: {
      name: SHEET_NAMES.scenarioInputs,
      rows,
      columnWidths: [18, 30, 20, 12, 30, 34, 28, 16, 20, 16, 42],
      autoFilter: {
        from: 'A1',
        to: toExcelCellRef(0, SCENARIO_INPUTS_SHEET_COLUMNS.summary),
      },
    } satisfies WorkbookSheet,
    rawValueCellRefByScenarioAndToken,
  };
}

function buildScenariosSheet(options: {
  exportScenarios: ExportScenario[];
  rawValueCellRefByScenarioAndToken: Map<string, string>;
}) {
  const rows: WorkbookCell[][] = [
    [
      'Scenario ID',
      'Scenario Title',
      'Category',
      'Kind',
      'Result Label',
      'Result Units',
      'Result',
      'Formula Template',
      'Excel Formula',
      'Description',
      'Input Tokens',
      'Selected Inputs',
      'Status',
    ],
  ];

  options.exportScenarios.forEach((scenario) => {
    const cellRefByVariable = Object.fromEntries(
      scenario.input_variables.map((token) => [
        token,
        options.rawValueCellRefByScenarioAndToken.get(`${scenario.id}::${token}`) ?? '',
      ]),
    );
    const excelFormula = buildExcelExpression(scenario.formula, cellRefByVariable);

    rows.push([
      scenario.id,
      scenario.title,
      scenario.category,
      scenario.exportKind,
      scenario.result_label,
      scenario.result_units,
      excelFormula
        ? {
            formula: excelFormula.slice(1),
            resultType: 'n',
            value: scenario.result.rawValue ?? '',
          }
        : '',
      scenario.formula,
      excelFormula ?? '',
      scenario.description,
      scenario.input_variables.join(', '),
      scenario.inputs.join(', '),
      scenario.exportStatus ?? (excelFormula ? 'Ready to edit in Excel.' : 'Formula could not be converted for Excel.'),
    ]);
  });

  return {
    name: SHEET_NAMES.scenarios,
    rows,
    columnWidths: [18, 34, 20, 12, 22, 16, 16, 42, 54, 50, 36, 36, 34],
    autoFilter: {
      from: 'A1',
      to: toExcelCellRef(0, SCENARIOS_SHEET_COLUMNS.status),
    },
  } satisfies WorkbookSheet;
}

function buildWorkbookFilename(exportedAt: Date): string {
  const safeStamp = exportedAt.toISOString().replace(/[:]/g, '-').replace(/\.\d{3}Z$/, 'Z');
  return `exploring-ai-scenarios-inputs-${safeStamp}.xlsx`;
}

export function buildWorkbookExportModel(options: {
  inputs: Record<string, Input>;
  scenarios: Scenario[];
  customScenario?: CustomScenarioExport | null;
  sourceUrl?: string;
  exportedAt?: Date;
}): WorkbookExportModel {
  const exportedAt = options.exportedAt ?? new Date();
  const { sheet: inputsSheet } = buildInputsSheet(options.inputs);
  const exportScenarios = buildExportScenarios({
    scenarios: options.scenarios,
    customScenario: options.customScenario,
  });
  const { sheet: scenarioInputsSheet, rawValueCellRefByScenarioAndToken } = buildScenarioInputsSheet({
    exportScenarios,
    inputs: options.inputs,
  });
  const scenariosSheet = buildScenariosSheet({
    exportScenarios,
    rawValueCellRefByScenarioAndToken,
  });

  return {
    filename: buildWorkbookFilename(exportedAt),
    sheets: [
      buildReadmeSheet({
        exportedAt,
        inputCount: Object.keys(options.inputs).length,
        scenarioCount: exportScenarios.length,
        sourceUrl: options.sourceUrl,
      }),
      inputsSheet,
      scenarioInputsSheet,
      scenariosSheet,
    ],
  };
}

export async function downloadWorkbookExport(model: WorkbookExportModel) {
  const XLSX = await import('xlsx');
  const workbook = XLSX.utils.book_new();

  model.sheets.forEach((sheet) => {
    const plainRows = sheet.rows.map((row) => row.map((cell) => (isWorkbookFormulaCell(cell) ? cell.value ?? '' : cell)));
    const worksheet = XLSX.utils.aoa_to_sheet(plainRows);

    sheet.rows.forEach((row, rowIndex) => {
      row.forEach((cell, columnIndex) => {
        if (!isWorkbookFormulaCell(cell)) {
          return;
        }

        const cellRef = toExcelCellRef(rowIndex, columnIndex);
        const worksheetCell: {
          t: 'n' | 's' | 'b';
          f: string;
          v?: string | number | boolean;
        } = {
          t: cell.resultType ?? 'n',
          f: cell.formula,
        };

        if (cell.resultType === 'n' && typeof cell.value === 'number') {
          worksheetCell.v = cell.value;
        }

        if (cell.resultType === 's' && typeof cell.value === 'string') {
          worksheetCell.v = cell.value;
        }

        if (cell.resultType === 'b' && typeof cell.value === 'boolean') {
          worksheetCell.v = cell.value;
        }

        worksheet[cellRef] = worksheetCell;
      });
    });

    if (sheet.columnWidths?.length) {
      worksheet['!cols'] = sheet.columnWidths.map((width) => ({ wch: width }));
    }

    if (sheet.autoFilter) {
      worksheet['!autofilter'] = { ref: `${sheet.autoFilter.from}:${sheet.autoFilter.to}` };
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
  });

  XLSX.writeFile(workbook, model.filename, { compression: true });
}
