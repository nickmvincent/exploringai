import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import prompts from 'prompts';
import yaml from 'js-yaml';
import {
  INPUT_TYPE_VALUE,
  INPUT_UNITS,
  INPUT_VARIABLE_TYPES,
  SCENARIO_CATEGORIES,
  SCENARIO_TYPE_VALUE,
  SOURCE_QUALITY_VALUES,
} from '../src/lib/content-vocab.js';
import { evaluateFormulaExpression, extractInputTokens } from '../src/lib/formulas.js';

const mode = process.argv[2];
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const contentRoot = path.join(repoRoot, 'content');

function slugify(value, separator = '-') {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, separator)
    .replace(new RegExp(`^${separator}+|${separator}+$`, 'g'), '')
    .replace(new RegExp(`${separator}{2,}`, 'g'), separator);
}

function humanizeUnit(unit) {
  return unit
    .replace(/_1m_/g, ' 1m ')
    .replace(/_/g, ' ')
    .replace(/\b1m\b/gi, '1M');
}

async function readInputValues() {
  const inputsDir = path.join(contentRoot, 'inputs');
  const files = (await fs.readdir(inputsDir)).filter((file) => file.endsWith('.md')).sort();
  const values = {};

  for (const file of files) {
    const filePath = path.join(inputsDir, file);
    const raw = await fs.readFile(filePath, 'utf8');
    const match = raw.match(/^---\n([\s\S]*?)\n---\n?/);
    if (!match) continue;
    const data = yaml.load(match[1]) ?? {};
    values[data.variable_name || path.basename(file, '.md')] = data.value;
  }

  return values;
}

function withDate(frontmatter) {
  return {
    ...frontmatter,
    date_added: new Date().toISOString(),
    visibility: 'public',
  };
}

function frontmatterToText(frontmatter) {
  return `---\n${yaml.dump(frontmatter, { lineWidth: 0, noRefs: true }).trimEnd()}\n---`;
}

async function writeNewFile(targetPath, contents) {
  try {
    await fs.writeFile(targetPath, contents, { flag: 'wx' });
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'EEXIST') {
      console.error(`Refusing to overwrite existing file: ${targetPath}`);
      process.exitCode = 1;
      return false;
    }
    throw error;
  }

  console.log(`Created ${path.relative(repoRoot, targetPath)}`);
  return true;
}

async function createInput() {
  const initial = await prompts([
    {
      type: 'text',
      name: 'title',
      message: 'Input title',
      validate: (value) => value.trim() ? true : 'Title is required.',
    },
    {
      type: 'select',
      name: 'variableType',
      message: 'Variable type',
      choices: INPUT_VARIABLE_TYPES.map((value) => ({ title: value, value })),
    },
    {
      type: 'text',
      name: 'entity',
      message: 'Entity slug (for the middle part of the id)',
      initial: (prev, values) => slugify(values.title, '_'),
      validate: (value) => /^[a-z0-9_]+$/.test(value.trim()) ? true : 'Use lowercase letters, numbers, and underscores only.',
    },
    {
      type: 'select',
      name: 'units',
      message: 'Canonical units',
      choices: INPUT_UNITS.map((value) => ({ title: value, value })),
    },
  ]);

  if (!initial.title || !initial.variableType || !initial.entity || !initial.units) {
    return;
  }

  const inputId = [initial.variableType, initial.entity, initial.units].join('__');
  const followUp = await prompts([
    {
      type: 'text',
      name: 'value',
      message: 'Default numeric value',
      validate: (value) => Number.isFinite(Number(value)) ? true : 'Enter a valid number.',
    },
    {
      type: 'text',
      name: 'scale',
      message: 'Scale factor (1 for raw values, 1000000 for millions, etc.)',
      initial: '1',
      validate: (value) => Number.isFinite(Number(value)) && Number(value) > 0 ? true : 'Enter a number greater than 0.',
    },
    {
      type: 'text',
      name: 'displayUnits',
      message: 'Display units shown in the UI',
      initial: humanizeUnit(initial.units),
      validate: (value) => value.trim() ? true : 'Display units are required.',
    },
    {
      type: 'text',
      name: 'summary',
      message: 'Short summary',
      initial: '',
    },
    {
      type: 'text',
      name: 'sourceUrl',
      message: 'Source URL (optional)',
      initial: '',
    },
    {
      type: 'select',
      name: 'sourceQuality',
      message: 'Source quality label',
      choices: [
        { title: 'Skip for now', value: '' },
        ...SOURCE_QUALITY_VALUES.map((value) => ({ title: value, value })),
      ],
    },
  ]);

  const frontmatter = withDate({
    title: initial.title.trim(),
    value: Number(followUp.value),
    scale: Number(followUp.scale),
    display_units: followUp.displayUnits.trim(),
    variable_type: initial.variableType,
    entity: initial.entity.trim(),
    units: initial.units,
    ...(followUp.summary.trim() ? { summary: followUp.summary.trim() } : {}),
    ...(followUp.sourceUrl.trim() ? { source_url: followUp.sourceUrl.trim() } : {}),
    ...(followUp.sourceQuality ? { sourceQuality: followUp.sourceQuality } : {}),
    type: INPUT_TYPE_VALUE,
  });

  const body = [
    `# ${initial.title.trim()}`,
    '',
    '## Description',
    '',
    followUp.summary.trim() || 'TODO: explain what this input represents and why it matters.',
    '',
    '## Key Assumption',
    '',
    'TODO: call out the main caveat, conversion, or judgment embedded in this input.',
    '',
    '## Source',
    '',
    followUp.sourceUrl.trim()
      ? `- [${followUp.sourceUrl.trim()}](${followUp.sourceUrl.trim()})`
      : '- TODO: add a source URL or citation.',
  ].join('\n');

  const filePath = path.join(contentRoot, 'inputs', `${inputId}.md`);
  await writeNewFile(filePath, `${frontmatterToText(frontmatter)}\n\n${body}\n`);
}

async function createScenario() {
  const inputValues = await readInputValues();
  const initial = await prompts([
    {
      type: 'text',
      name: 'title',
      message: 'Scenario title',
      validate: (value) => value.trim() ? true : 'Title is required.',
    },
    {
      type: 'text',
      name: 'scenarioId',
      message: 'Filename slug',
      initial: (prev, values) => slugify(values.title),
      validate: (value) => /^[a-z0-9-]+$/.test(value.trim()) ? true : 'Use lowercase letters, numbers, and hyphens only.',
    },
    {
      type: 'textarea',
      name: 'description',
      message: 'Scenario description',
      validate: (value) => value.trim() ? true : 'Description is required.',
    },
    {
      type: 'textarea',
      name: 'formula',
      message: 'Formula using {input_tokens}',
      validate: (value) => value.trim() ? true : 'Formula is required.',
    },
    {
      type: 'text',
      name: 'resultLabel',
      message: 'Result label',
      initial: 'Custom result',
      validate: (value) => value.trim() ? true : 'Result label is required.',
    },
    {
      type: 'select',
      name: 'resultUnits',
      message: 'Result units',
      choices: INPUT_UNITS.map((value) => ({ title: value, value })),
    },
    {
      type: 'select',
      name: 'category',
      message: 'Scenario category',
      choices: SCENARIO_CATEGORIES.map((value) => ({ title: value, value })),
    },
  ]);

  if (!initial.title || !initial.scenarioId || !initial.description || !initial.formula) {
    return;
  }

  const tokens = extractInputTokens(initial.formula);
  const unknownTokens = tokens.filter((token) => !(token in inputValues));
  if (unknownTokens.length) {
    console.error(`Unknown input tokens in formula: ${unknownTokens.join(', ')}`);
    process.exitCode = 1;
    return;
  }

  const evaluation = evaluateFormulaExpression(initial.formula, inputValues);
  if (evaluation.error || evaluation.rawValue === null) {
    console.error(`Formula could not be evaluated with current defaults: ${evaluation.error}`);
    process.exitCode = 1;
    return;
  }

  const frontmatter = withDate({
    title: initial.title.trim(),
    description: initial.description.trim(),
    formula: initial.formula.trim(),
    result_label: initial.resultLabel.trim(),
    result_units: initial.resultUnits,
    category: initial.category,
    type: SCENARIO_TYPE_VALUE,
  });

  const referencedInputs = tokens.length
    ? tokens.map((token) => `- \`${token}\``).join('\n')
    : '- TODO: add one or more shared input tokens.';
  const body = [
    `# ${initial.title.trim()}`,
    '',
    '## Description',
    '',
    initial.description.trim(),
    '',
    '## Formula',
    '',
    '```text',
    initial.formula.trim(),
    '```',
    '',
    '## Referenced inputs',
    '',
    referencedInputs,
    '',
    '## Result',
    '',
    `The ${initial.resultLabel.trim()} is calculated in ${initial.resultUnits}.`,
  ].join('\n');

  const filePath = path.join(contentRoot, 'scenarios', `${initial.scenarioId.trim()}.md`);
  await writeNewFile(filePath, `${frontmatterToText(frontmatter)}\n\n${body}\n`);
}

if (mode === 'input') {
  await createInput();
} else if (mode === 'scenario') {
  await createScenario();
} else {
  console.error('Usage: node ./scripts/new-content.mjs <input|scenario>');
  process.exitCode = 1;
}
