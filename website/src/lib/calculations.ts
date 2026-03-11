// Calculation utilities for Exploring AI: Data Napkin Math
import { evaluateFormulaExpression } from './formulas.js';

export interface Input {
  id: string;
  title: string;
  value: number;
  default_value: number;
  scale: number;
  display_units: string;
  variable_name: string;
  variable_type: string;
  entity?: string;
  units: string;
  source_url?: string;
  nice_name?: string;
  importanceRank?: number;
  importanceReason?: string;
  sourceName?: string;
  sourceNote?: string;
  sourceQuality?: string;
  summary?: string;
  confidence?: number;
  lastReviewed?: string;
  featured?: boolean;
  min?: number;
  max?: number;
  step?: number;
  comparisonImage?: InputComparisonImage;
  referenceCharts?: InputReferenceChart[];
  usedIn?: {
    id: string;
    title: string;
    category: string;
  }[];
}

export interface InputComparisonImage {
  src: string;
  alt: string;
  caption?: string;
  href?: string;
  label?: string;
}

export interface InputReferenceChart {
  title: string;
  description?: string;
  scale?: 'linear' | 'log';
  bars: InputReferenceChartBar[];
}

export interface InputReferenceChartBar {
  label: string;
  value: number;
  displayValue?: string;
  note?: string;
  highlight?: boolean;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  input_variables: string[];
  inputs: string[];
  formula: string;
  result_label: string;
  result_units: string;
  category: string;
  result: {
    value: string;
    rawValue: number | null;
    units: string;
  };
  showExplore?: boolean;
  showCalcDetails?: boolean;
  calculate?: (...args: number[]) => number;
}

export interface ExpressionEvaluation {
  rawValue: number | null;
  usedVariables: string[];
  error?: string;
}

/**
 * Format a variable key into a readable label
 */
export function formatLabel(key: string): string {
  if (!key) return '';
  return key
    .replace(/__/g, ' ')
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (str) => str.toUpperCase());
}

/**
 * Format a value according to its scale
 */
export function formatValue(value: number, scale: number): number {
  return scale ? value / scale : value;
}

/**
 * Format a number in a human-readable way
 */
export function humanReadable(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A';
  if (value === 0) return "0";

  if (Math.abs(value) < 1) {
    if (Math.abs(value) < 1e-6) {
      return value.toExponential(2);
    }
    // Count leading zeros after decimal
    const str = value.toFixed(20); // Avoid scientific notation in string
    const match = str.match(/\.0*[1-9]/);
    if (match) {
      // significant digits starts at match.index + match[0].length - 1
      // We want to keep 2 significant digits
      const firstDigitIdx = match[0].search(/[1-9]/) - 1; // index in fractional part
      return value.toFixed(firstDigitIdx + 2);
    }
    return value.toFixed(2);
  }

  const units = ["", "thousand", "million", "billion", "trillion"];
  const order = Math.floor(Math.log10(Math.abs(value)) / 3);

  if (order === 0) {
    return value.toFixed(2);
  }

  const unitName = units[order] || `10^${order * 3}`;
  const adjustedValue = value / Math.pow(10, 3 * order);

  return `${adjustedValue.toFixed(2)} ${unitName}`;
}

/**
 * Create a calculation function from scenario data
 */
export function createCalculationFunction(scenario: Scenario): (...args: number[]) => number {
  return function (...args: number[]): number {
    const context: Record<string, number> = {};

    scenario.input_variables.forEach((varName, index) => {
      context[varName] = args[index];
    });

    const evaluation = evaluateFormulaExpression(scenario.formula, context) as ExpressionEvaluation;
    if (evaluation.error || evaluation.rawValue === null) {
      throw new Error(evaluation.error || `Unable to evaluate formula for ${scenario.title}`);
    }

    return evaluation.rawValue;
  };
}

export function evaluateMathExpression(expression: string, inputs: Record<string, Input>): ExpressionEvaluation {
  const values = Object.fromEntries(
    Object.entries(inputs).map(([key, input]) => [key, input.value])
  );

  return evaluateFormulaExpression(expression, values) as ExpressionEvaluation;
}

/**
 * Update calculations for all scenarios
 */
export function updateCalculations(scenarios: Scenario[], inputs: Record<string, Input>): Scenario[] {
  return scenarios.map(scenario => {
    try {
      if (!scenario.inputs || !scenario.inputs.length || !scenario.calculate) {
        return {
          ...scenario,
          result: {
            ...scenario.result,
            value: 'Error: Missing inputs or calculation',
            rawValue: null
          }
        };
      }

      const inputValues = scenario.inputs.map(key => inputs[key]?.value);

      if (inputValues.some(val => val === undefined)) {
        return {
          ...scenario,
          result: {
            ...scenario.result,
            value: 'Error: Missing input values',
            rawValue: null
          }
        };
      }

      const rawValue = scenario.calculate(...inputValues);

      return {
        ...scenario,
        result: {
          ...scenario.result,
          value: humanReadable(rawValue),
          rawValue
        }
      };
    } catch (error) {
      console.error(`Error calculating result for ${scenario.title}:`, error);
      return {
        ...scenario,
        result: {
          ...scenario.result,
          value: 'Error: Calculation failed',
          rawValue: null
        }
      };
    }
  });
}
