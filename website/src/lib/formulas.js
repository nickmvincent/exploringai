const VARIABLE_TOKEN_PATTERN = /\{([a-z0-9_]+)\}/g;

/**
 * @typedef {{ rawValue: number | null, usedVariables: string[], error?: string }} FormulaEvaluation
 */

/**
 * @typedef
 *   | { type: 'number', value: number }
 *   | { type: 'variable', value: string }
 *   | { type: 'operator', value: '+' | '-' | '*' | '/' | '^' | 'neg' }
 *   | { type: 'leftParen' }
 *   | { type: 'rightParen' }
 * ExpressionToken
 */

export function extractInputTokens(text = '') {
  const usedVariables = [];

  if (typeof text !== 'string' || !text.trim()) {
    return usedVariables;
  }

  for (const match of text.matchAll(VARIABLE_TOKEN_PATTERN)) {
    const variable = match[1]?.trim();
    if (variable && !usedVariables.includes(variable)) {
      usedVariables.push(variable);
    }
  }

  return usedVariables;
}

function tokenizeExpression(expression) {
  /** @type {ExpressionToken[]} */
  const tokens = [];
  const usedVariables = [];
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
      tokens.push({ type: 'operator', value: /** @type {'+' | '-' | '*' | '/' | '^'} */ (current) });
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

function toReversePolishNotation(tokens) {
  /** @type {ExpressionToken[]} */
  const output = [];
  /** @type {ExpressionToken[]} */
  const operators = [];

  const precedence = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
    '^': 3,
    neg: 4,
  };

  const associativity = {
    '+': 'left',
    '-': 'left',
    '*': 'left',
    '/': 'left',
    '^': 'right',
    neg: 'right',
  };

  /** @type {ExpressionToken | null} */
  let previousToken = null;

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

      const operatorToken = isUnaryMinus
        ? /** @type {ExpressionToken} */ ({ type: 'operator', value: 'neg' })
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
        output.push(operators.pop());
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
        const top = operators.pop();
        if (!top) break;
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
    const top = operators.pop();
    if (!top) break;
    if (top.type === 'leftParen' || top.type === 'rightParen') {
      return { tokens: [], error: 'Parentheses are unbalanced.' };
    }
    output.push(top);
  }

  return { tokens: output };
}

function evaluateReversePolishNotation(tokens, values) {
  const stack = [];
  const usedVariables = [];

  for (const token of tokens) {
    if (token.type === 'number') {
      stack.push(token.value);
      continue;
    }

    if (token.type === 'variable') {
      const value = values[token.value];
      if (value === undefined) {
        return {
          rawValue: null,
          usedVariables,
          error: `Unknown input token "${token.value}".`,
        };
      }

      stack.push(value);
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

/**
 * @param {string} expression
 * @param {Record<string, number>} values
 * @returns {FormulaEvaluation}
 */
export function evaluateFormulaExpression(expression, values) {
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

  const evaluated = evaluateReversePolishNotation(rpn.tokens, values);
  return {
    rawValue: evaluated.rawValue,
    usedVariables: evaluated.usedVariables.length ? evaluated.usedVariables : tokenized.usedVariables,
    error: evaluated.error,
  };
}
