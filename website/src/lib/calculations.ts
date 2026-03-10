// Calculation utilities for Data Napkin Math

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

export interface Scenario {
  id: string;
  title: string;
  description: string;
  input_variables: string[];
  inputs: string[];
  calculation_type: string;
  operations: string;
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

export interface Operation {
  func: string;
  args: (string | number)[];
  name?: string;
}

export interface ExpressionEvaluation {
  rawValue: number | null;
  usedVariables: string[];
  error?: string;
}

type ExpressionToken =
  | { type: 'number'; value: number }
  | { type: 'variable'; value: string }
  | { type: 'operator'; value: '+' | '-' | '*' | '/' | '^' | 'neg' }
  | { type: 'leftParen' }
  | { type: 'rightParen' };

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
  if (scenario.calculation_type === "operations") {
    try {
      const operations: Operation[] = JSON.parse(scenario.operations);
      return createOperationsFunction(scenario.input_variables, operations);
    } catch (error) {
      console.error(`Error creating calculation function for ${scenario.title}:`, error);
      return () => 0;
    }
  } else {
    console.warn(`Unsupported calculation type for ${scenario.title}: ${scenario.calculation_type}`);
    return () => 0;
  }
}

/**
 * Create a function that processes a sequence of operations
 */
function createOperationsFunction(inputVariables: string[], operations: Operation[]): (...args: number[]) => number {
  return function (...args: number[]): number {
    const context: Record<string, number> = {};

    // Add input values to context
    inputVariables.forEach((varName, index) => {
      context[varName] = args[index];
    });

    let result = 0;

    // Process operations in sequence
    for (const op of operations) {
      const processedArgs = op.args.map(arg => {
        if (typeof arg === 'string' && arg.startsWith('{') && arg.endsWith('}')) {
          const varName = arg.slice(1, -1);
          if (context[varName] !== undefined) {
            return context[varName];
          } else {
            throw new Error(`Missing value for "${varName}" in calculation`);
          }
        }
        return parseFloat(String(arg));
      });

      switch (op.func) {
        case "multiply":
          result = processedArgs.reduce((a, b) => a * b, 1);
          break;
        case "divide":
          result = processedArgs[0] / processedArgs[1];
          break;
        case "add":
          result = processedArgs.reduce((a, b) => a + b, 0);
          break;
        case "subtract":
          result = processedArgs[0] - processedArgs[1];
          break;
        case "power":
          result = Math.pow(processedArgs[0], processedArgs[1]);
          break;
        default:
          throw new Error(`Unsupported operation: ${op.func}`);
      }

      if (op.name) {
        context[op.name] = result;
      }
    }

    return result;
  };
}

/**
 * Format operation for human readability
 */
export function formatOperation(operationsJson: string, inputs: Record<string, Input>): string {
  try {
    const operations: Operation[] = JSON.parse(operationsJson);

    if (!operations || !operations.length) {
      return 'No operations defined';
    }

    const descriptions = operations.map(op => {
      const formattedArgs = op.args.map(arg => {
        if (typeof arg === 'string' && arg.startsWith('{') && arg.endsWith('}')) {
          const varName = arg.slice(1, -1);
          return inputs[varName]?.nice_name || inputs[varName]?.title || formatLabel(varName);
        }
        return String(arg);
      });

      switch (op.func) {
        case 'multiply':
          return `Multiply ${formattedArgs.join(' x ')}`;
        case 'divide':
          return `Divide ${formattedArgs[0]} by ${formattedArgs[1]}`;
        case 'add':
          return `Add ${formattedArgs.join(' + ')}`;
        case 'subtract':
          return `Subtract ${formattedArgs[1]} from ${formattedArgs[0]}`;
        case 'power':
          return `Raise ${formattedArgs[0]} to the power of ${formattedArgs[1]}`;
        default:
          return `${op.func}(${formattedArgs.join(', ')})`;
      }
    });

    return descriptions.map((desc, index) => `Step ${index + 1}: ${desc}`).join('\n');
  } catch (error) {
    console.error('Error formatting operation:', error);
    return 'Error parsing operations';
  }
}

function tokenizeExpression(expression: string): { tokens: ExpressionToken[]; usedVariables: string[]; error?: string } {
  const tokens: ExpressionToken[] = [];
  const usedVariables: string[] = [];
  let index = 0;

  while (index < expression.length) {
    const remaining = expression.slice(index);
    const current = expression[index];

    if (/\s/.test(current)) {
      index += 1;
      continue;
    }

    if (current === '{') {
      const end = expression.indexOf('}', index + 1);
      if (end === -1) {
        return { tokens: [], usedVariables: [], error: 'Missing closing brace for an input token.' };
      }

      const variable = expression.slice(index + 1, end).trim();
      if (!variable) {
        return { tokens: [], usedVariables: [], error: 'Input tokens cannot be empty.' };
      }

      tokens.push({ type: 'variable', value: variable });
      if (!usedVariables.includes(variable)) {
        usedVariables.push(variable);
      }
      index = end + 1;
      continue;
    }

    const numberMatch = remaining.match(/^((?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)/);
    if (numberMatch) {
      const value = Number(numberMatch[1]);
      if (!Number.isFinite(value)) {
        return { tokens: [], usedVariables: [], error: `Invalid number "${numberMatch[1]}".` };
      }

      tokens.push({ type: 'number', value });
      index += numberMatch[1].length;
      continue;
    }

    if (current === '(') {
      tokens.push({ type: 'leftParen' });
      index += 1;
      continue;
    }

    if (current === ')') {
      tokens.push({ type: 'rightParen' });
      index += 1;
      continue;
    }

    if (['+', '-', '*', '/', '^'].includes(current)) {
      tokens.push({ type: 'operator', value: current as '+' | '-' | '*' | '/' | '^' });
      index += 1;
      continue;
    }

    return {
      tokens: [],
      usedVariables: [],
      error: `Unsupported character "${current}". Use numbers, parentheses, operators, and {input_tokens}.`,
    };
  }

  return { tokens, usedVariables };
}

function toReversePolishNotation(tokens: ExpressionToken[]): { tokens: ExpressionToken[]; error?: string } {
  const output: ExpressionToken[] = [];
  const operators: ExpressionToken[] = [];

  const precedence: Record<string, number> = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
    '^': 3,
    neg: 4,
  };

  const associativity: Record<string, 'left' | 'right'> = {
    '+': 'left',
    '-': 'left',
    '*': 'left',
    '/': 'left',
    '^': 'right',
    neg: 'right',
  };

  let previousToken: ExpressionToken | null = null;

  for (const token of tokens) {
    if (token.type === 'number' || token.type === 'variable') {
      output.push(token);
      previousToken = token;
      continue;
    }

    if (token.type === 'operator') {
      const isUnaryMinus =
        token.value === '-' &&
        (!previousToken || previousToken.type === 'operator' || previousToken.type === 'leftParen');

      const operatorToken: ExpressionToken = isUnaryMinus
        ? { type: 'operator', value: 'neg' }
        : token;

      if (
        operatorToken.value !== 'neg' &&
        (!previousToken || previousToken.type === 'operator' || previousToken.type === 'leftParen')
      ) {
        return { tokens: [], error: 'Binary operators must appear between two values.' };
      }

      while (operators.length) {
        const top = operators[operators.length - 1];
        if (top.type !== 'operator') break;

        const shouldPop =
          associativity[operatorToken.value] === 'left'
            ? precedence[operatorToken.value] <= precedence[top.value]
            : precedence[operatorToken.value] < precedence[top.value];

        if (!shouldPop) break;
        output.push(operators.pop() as ExpressionToken);
      }

      operators.push(operatorToken);
      previousToken = operatorToken;
      continue;
    }

    if (token.type === 'leftParen') {
      operators.push(token);
      previousToken = token;
      continue;
    }

    if (token.type === 'rightParen') {
      let foundLeftParen = false;
      while (operators.length) {
        const top = operators.pop() as ExpressionToken;
        if (top.type === 'leftParen') {
          foundLeftParen = true;
          break;
        }
        output.push(top);
      }

      if (!foundLeftParen) {
        return { tokens: [], error: 'Closing parenthesis is missing its matching opening parenthesis.' };
      }

      previousToken = token;
    }
  }

  if (previousToken?.type === 'operator') {
    return { tokens: [], error: 'Formula cannot end with an operator.' };
  }

  while (operators.length) {
    const top = operators.pop() as ExpressionToken;
    if (top.type === 'leftParen' || top.type === 'rightParen') {
      return { tokens: [], error: 'Parentheses are unbalanced.' };
    }
    output.push(top);
  }

  return { tokens: output };
}

function evaluateReversePolishNotation(tokens: ExpressionToken[], inputs: Record<string, Input>): ExpressionEvaluation {
  const stack: number[] = [];
  const usedVariables: string[] = [];

  for (const token of tokens) {
    if (token.type === 'number') {
      stack.push(token.value);
      continue;
    }

    if (token.type === 'variable') {
      const input = inputs[token.value];
      if (!input) {
        return {
          rawValue: null,
          usedVariables,
          error: `Unknown input token "${token.value}".`,
        };
      }

      stack.push(input.value);
      if (!usedVariables.includes(token.value)) {
        usedVariables.push(token.value);
      }
      continue;
    }

    if (token.type !== 'operator') {
      return {
        rawValue: null,
        usedVariables,
        error: 'Formula contains an unsupported token.',
      };
    }

    if (token.value === 'neg') {
      const operand = stack.pop();
      if (operand === undefined) {
        return {
          rawValue: null,
          usedVariables,
          error: 'Unary minus is missing a value.',
        };
      }

      stack.push(-operand);
      continue;
    }

    const right = stack.pop();
    const left = stack.pop();
    if (left === undefined || right === undefined) {
      return {
        rawValue: null,
        usedVariables,
        error: 'Each operator needs values on both sides.',
      };
    }

    switch (token.value) {
      case '+':
        stack.push(left + right);
        break;
      case '-':
        stack.push(left - right);
        break;
      case '*':
        stack.push(left * right);
        break;
      case '/':
        stack.push(left / right);
        break;
      case '^':
        stack.push(Math.pow(left, right));
        break;
      default:
        return {
          rawValue: null,
          usedVariables,
          error: `Unsupported operator "${token.value}".`,
        };
    }
  }

  if (stack.length !== 1) {
    return {
      rawValue: null,
      usedVariables,
      error: 'Formula could not be resolved to a single result.',
    };
  }

  const rawValue = stack[0];
  if (!Number.isFinite(rawValue)) {
    return {
      rawValue: null,
      usedVariables,
      error: 'Formula returned a non-finite value. Check for divide-by-zero or overflow.',
    };
  }

  return {
    rawValue,
    usedVariables,
  };
}

export function evaluateMathExpression(expression: string, inputs: Record<string, Input>): ExpressionEvaluation {
  const trimmedExpression = expression.trim();
  if (!trimmedExpression) {
    return {
      rawValue: null,
      usedVariables: [],
      error: 'Enter a formula to start exploring.',
    };
  }

  const tokenized = tokenizeExpression(trimmedExpression);
  if (tokenized.error) {
    return {
      rawValue: null,
      usedVariables: tokenized.usedVariables,
      error: tokenized.error,
    };
  }

  const rpn = toReversePolishNotation(tokenized.tokens);
  if (rpn.error) {
    return {
      rawValue: null,
      usedVariables: tokenized.usedVariables,
      error: rpn.error,
    };
  }

  const evaluated = evaluateReversePolishNotation(rpn.tokens, inputs);
  return {
    rawValue: evaluated.rawValue,
    usedVariables: evaluated.usedVariables.length ? evaluated.usedVariables : tokenized.usedVariables,
    error: evaluated.error,
  };
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
