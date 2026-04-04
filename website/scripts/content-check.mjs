import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import yaml from 'js-yaml';
import {
  INPUT_TYPE_VALUE,
  INPUT_UNITS,
  INPUT_VARIABLE_TYPES,
  SCENARIO_CATEGORIES,
  SCENARIO_TYPE_VALUE,
  SOURCE_QUALITY_VALUES,
  VISIBILITY_VALUES,
} from '../src/lib/content-vocab.js';
import { evaluateFormulaExpression, extractInputTokens } from '../src/lib/formulas.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const inputsDir = path.join(repoRoot, 'content', 'inputs');
const scenariosDir = path.join(repoRoot, 'content', 'scenarios');

function getEntryStem(filePath) {
  return path.basename(filePath, path.extname(filePath));
}

async function walkMarkdownFiles(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      return walkMarkdownFiles(entryPath);
    }

    return entry.isFile() && entry.name.endsWith('.md') ? [entryPath] : [];
  }));

  return files.flat().sort();
}

async function readMarkdownDocument(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?/);

  if (!match) {
    throw new Error(`Missing frontmatter block in ${filePath}`);
  }

  return {
    raw,
    data: yaml.load(match[1]) ?? {},
    body: raw.slice(match[0].length),
  };
}

function ensureOneOf(errors, filePath, label, value, allowedValues) {
  if (value === undefined || value === null || value === '') {
    return;
  }

  if (!allowedValues.includes(value)) {
    errors.push(`${filePath}: ${label} must be one of ${allowedValues.join(', ')}.`);
  }
}

function ensureFiniteNumber(errors, filePath, label, value) {
  if (value === undefined || value === null) {
    return;
  }

  if (typeof value !== 'number' || !Number.isFinite(value)) {
    errors.push(`${filePath}: ${label} must be a finite number.`);
  }
}

function ensureNonEmptyString(errors, filePath, label, value) {
  if (value === undefined || value === null) {
    return;
  }

  if (typeof value !== 'string' || !value.trim()) {
    errors.push(`${filePath}: ${label} must be a non-empty string.`);
  }
}

function ensureHttpUrl(errors, filePath, label, value) {
  if (!value) {
    return;
  }

  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) {
      errors.push(`${filePath}: ${label} must use http or https.`);
    }
  } catch {
    errors.push(`${filePath}: ${label} must be a valid absolute URL.`);
  }
}

function sortStrings(values) {
  return [...values].sort((a, b) => a.localeCompare(b));
}

function getInputCatalogFamilyKey(input) {
  if (input.entity) {
    return `${input.variable_type}::${input.entity}`;
  }

  return `${input.variable_type}::${input.id}`;
}

export function collectInputLibraryConsistencyIssues(inputs) {
  const errors = [];
  const seenTitles = new Map();
  const mainExamplesByFamily = new Map();

  inputs.forEach((input) => {
    const title = typeof input.title === 'string' ? input.title.trim() : '';

    if (title) {
      if (seenTitles.has(title)) {
        errors.push(
          `${input.filePath}: duplicate input title "${title}" also used by ${seenTitles.get(title)}.`
        );
      } else {
        seenTitles.set(title, input.filePath);
      }
    }

    if (!input.mainExampleForCategory) {
      return;
    }

    const familyKey = getInputCatalogFamilyKey(input);
    const existing = mainExamplesByFamily.get(familyKey) ?? [];
    existing.push(input);
    mainExamplesByFamily.set(familyKey, existing);
  });

  mainExamplesByFamily.forEach((familyInputs, familyKey) => {
    if (familyInputs.length <= 1) {
      return;
    }

    const locations = familyInputs
      .map((input) => `${input.id} (${input.filePath})`)
      .join(', ');

    errors.push(
      `Catalog family "${familyKey}" has multiple inputs marked mainExampleForCategory: ${locations}.`
    );
  });

  return errors;
}

async function loadInputs(errors) {
  const files = await walkMarkdownFiles(inputsDir);
  const inputs = [];
  const seenIds = new Map();

  for (const filePath of files) {
    const { data } = await readMarkdownDocument(filePath);
    const fileId = getEntryStem(filePath);
    const inputId = data.variable_name || fileId;

    if (!/^[a-z0-9_]+$/.test(fileId)) {
      errors.push(`${filePath}: input filename must use lowercase letters, numbers, and underscores only.`);
    }

    if (data.variable_name && data.variable_name !== fileId) {
      errors.push(`${filePath}: variable_name must match the filename stem (${fileId}) or be omitted.`);
    }

    if (seenIds.has(inputId)) {
      errors.push(`${filePath}: duplicate input id "${inputId}" also used by ${seenIds.get(inputId)}.`);
    } else {
      seenIds.set(inputId, filePath);
    }

    ensureOneOf(errors, filePath, 'variable_type', data.variable_type, INPUT_VARIABLE_TYPES);
    ensureOneOf(errors, filePath, 'units', data.units, INPUT_UNITS);
    ensureOneOf(errors, filePath, 'visibility', data.visibility, VISIBILITY_VALUES);
    ensureOneOf(errors, filePath, 'sourceQuality', data.sourceQuality, SOURCE_QUALITY_VALUES);

    if (data.type && data.type !== INPUT_TYPE_VALUE) {
      errors.push(`${filePath}: type must be ${INPUT_TYPE_VALUE} when provided.`);
    }

    ensureFiniteNumber(errors, filePath, 'value', data.value);
    ensureFiniteNumber(errors, filePath, 'scale', data.scale);
    ensureFiniteNumber(errors, filePath, 'min', data.min);
    ensureFiniteNumber(errors, filePath, 'max', data.max);
    ensureFiniteNumber(errors, filePath, 'step', data.step);

    if (typeof data.step === 'number' && data.step <= 0) {
      errors.push(`${filePath}: step must be greater than 0.`);
    }

    if (
      typeof data.min === 'number' &&
      typeof data.max === 'number' &&
      Number.isFinite(data.min) &&
      Number.isFinite(data.max) &&
      data.min > data.max
    ) {
      errors.push(`${filePath}: min cannot be greater than max.`);
    }

    ensureHttpUrl(errors, filePath, 'source_url', data.source_url);

    if (data.referenceCharts !== undefined && data.referenceCharts !== null) {
      if (!Array.isArray(data.referenceCharts)) {
        errors.push(`${filePath}: referenceCharts must be an array when provided.`);
      } else {
        data.referenceCharts.forEach((chart, chartIndex) => {
          const chartPath = `referenceCharts[${chartIndex}]`;

          if (!chart || typeof chart !== 'object' || Array.isArray(chart)) {
            errors.push(`${filePath}: ${chartPath} must be an object.`);
            return;
          }

          ensureNonEmptyString(errors, filePath, `${chartPath}.title`, chart.title);
          ensureOneOf(errors, filePath, `${chartPath}.scale`, chart.scale, ['linear', 'log']);

          if (!Array.isArray(chart.bars) || chart.bars.length < 2) {
            errors.push(`${filePath}: ${chartPath}.bars must be an array with at least 2 items.`);
            return;
          }

          chart.bars.forEach((bar, barIndex) => {
            const barPath = `${chartPath}.bars[${barIndex}]`;

            if (!bar || typeof bar !== 'object' || Array.isArray(bar)) {
              errors.push(`${filePath}: ${barPath} must be an object.`);
              return;
            }

            ensureNonEmptyString(errors, filePath, `${barPath}.label`, bar.label);
            ensureFiniteNumber(errors, filePath, `${barPath}.value`, bar.value);

            if (typeof bar.value === 'number' && bar.value < 0) {
              errors.push(`${filePath}: ${barPath}.value must be zero or greater.`);
            }
          });
        });
      }
    }

    inputs.push({
      id: inputId,
      filePath,
      title: data.title,
      value: data.value,
      variable_type: data.variable_type,
      entity: data.entity ?? undefined,
      mainExampleForCategory: Boolean(data.mainExampleForCategory),
    });
  }

  errors.push(...collectInputLibraryConsistencyIssues(inputs));

  return inputs;
}

async function loadScenarios(inputValues, errors) {
  const files = await walkMarkdownFiles(scenariosDir);
  const seenIds = new Map();

  for (const filePath of files) {
    const { data } = await readMarkdownDocument(filePath);
    const scenarioId = getEntryStem(filePath);

    if (!/^[a-z0-9-]+$/.test(scenarioId)) {
      errors.push(`${filePath}: scenario filename must use lowercase letters, numbers, and hyphens only.`);
    }

    if (seenIds.has(scenarioId)) {
      errors.push(`${filePath}: duplicate scenario id "${scenarioId}" also used by ${seenIds.get(scenarioId)}.`);
    } else {
      seenIds.set(scenarioId, filePath);
    }

    ensureOneOf(errors, filePath, 'category', data.category, SCENARIO_CATEGORIES);
    ensureOneOf(errors, filePath, 'result_units', data.result_units, INPUT_UNITS);
    ensureOneOf(errors, filePath, 'visibility', data.visibility, VISIBILITY_VALUES);

    if (data.type && data.type !== SCENARIO_TYPE_VALUE) {
      errors.push(`${filePath}: type must be ${SCENARIO_TYPE_VALUE} when provided.`);
    }

    if (typeof data.formula !== 'string' || !data.formula.trim()) {
      errors.push(`${filePath}: formula is required.`);
      continue;
    }

    const formulaTokens = extractInputTokens(data.formula);
    const descriptionTokens = extractInputTokens(typeof data.description === 'string' ? data.description : '');

    for (const token of sortStrings(new Set([...formulaTokens, ...descriptionTokens]))) {
      if (!(token in inputValues)) {
        errors.push(`${filePath}: unknown input token "${token}" referenced in scenario content.`);
      }
    }

    if (Array.isArray(data.input_variables)) {
      const declared = [...data.input_variables];
      const unusedDeclared = declared.filter((token) => !formulaTokens.includes(token));
      const undeclaredFormulaInputs = formulaTokens.filter((token) => !declared.includes(token));

      if (unusedDeclared.length) {
        errors.push(
          `${filePath}: legacy input_variables contains unused tokens: ${unusedDeclared.join(', ')}.`
        );
      }

      if (undeclaredFormulaInputs.length) {
        errors.push(
          `${filePath}: formula references tokens missing from input_variables: ${undeclaredFormulaInputs.join(', ')}.`
        );
      }
    }

    const evaluation = evaluateFormulaExpression(data.formula, inputValues);
    if (evaluation.error || evaluation.rawValue === null) {
      errors.push(`${filePath}: formula does not evaluate cleanly with default inputs (${evaluation.error}).`);
    } else if (!Number.isFinite(evaluation.rawValue)) {
      errors.push(`${filePath}: formula returned a non-finite result with default inputs.`);
    }
  }

  return files.length;
}

async function main() {
  const errors = [];
  const inputs = await loadInputs(errors);
  const inputValues = Object.fromEntries(inputs.map((input) => [input.id, input.value]));
  const scenarioCount = await loadScenarios(inputValues, errors);

  if (errors.length) {
    console.error(`Content check failed with ${errors.length} issue${errors.length === 1 ? '' : 's'}:\n`);
    errors.forEach((message) => {
      console.error(`- ${message}`);
    });
    process.exitCode = 1;
    return;
  }

  console.log(`Content check passed for ${inputs.length} inputs and ${scenarioCount} scenarios.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
