import type { Input, Scenario, ScenarioPreset } from './calculations';
import { evaluateFormulaExpression } from './formulas.js';

export type ScenarioContext = {
  shortTitle: string;
  question: string;
  takeaway: string;
  caveat: string;
  task: 'compensation' | 'funding' | 'scale';
  featured?: boolean;
};

export const SCENARIO_CONTEXT: Record<string, ScenarioContext> = {
  'commissioning-new-datasets': {
    shortTitle: 'Frontier-scale English-text equivalent',
    question: 'What does an English-text-equivalent replacement-cost exercise produce at frontier token scale?',
    takeaway: 'A professional writing-rate proxy becomes enormous when applied to trillions of token exposures.',
    caveat: 'This is a replacement-cost thought experiment, not a forecast. The 0.75 words-per-token conversion is an English OpenAI-tokenizer rule of thumb applied to another model family’s disclosed token exposure; it does not measure unique text, repetition, code, synthetic data, other languages, or multimodal content.',
    task: 'compensation',
    featured: true,
  },
  'compensating-an-entire-copied-library-at-settlement-rates': {
    shortTitle: 'Per-work benchmarks and identified settlement works',
    question: 'What arithmetic results from applying a per-work benchmark to identified settlement works?',
    takeaway: 'A per-work benchmark becomes a substantial illustrative pool across hundreds of thousands of identified works.',
    caveat: 'This arithmetic uses the preliminary settlement Works List and a selected per-work benchmark. It does not establish final payouts, liability, ownership, eligibility, registration timing, availability of statutory damages, or an eventual settlement outcome.',
    task: 'compensation',
    featured: true,
  },
  'distributing-money-from-data-deals': {
    shortTitle: 'Dividing data-deal payments',
    question: 'How much does a disclosed data deal represent per contributor or item?',
    takeaway: 'The same deal can look substantial or negligible depending on who—or what—shares it.',
    caveat: 'This is an even-division ratio, not a beneficiary model. Some denominators are activity or article counts rather than people, and real contracts may allocate cash, service credits, rights, or revenue through institutions and rightsholders.',
    task: 'compensation',
  },
  'funding-expert-evaluation-questions-from-data-deals': {
    shortTitle: 'Turning data deals into expert evaluations',
    question: 'How much expert evaluation work could one data deal fund?',
    takeaway: 'Public deal values can be compared with HLE prize tiers and prize-pool ratios.',
    caveat: 'The denominator is a prize benchmark or prize-pool-per-final-question ratio, not a measured production cost or contributor wage. Review, rejected questions, organizer labor, adjudication, tooling, benefits, and overhead are excluded.',
    task: 'funding',
    featured: true,
  },
  'funding-continuous-physician-oversight-for-medical-ai': {
    shortTitle: 'Continuous physician oversight',
    question: 'What annual labor budget could continuous medical-AI oversight require?',
    takeaway: 'Oversight budgets are driven more by participation and time commitments than by any single wage assumption.',
    caveat: 'This is a planning envelope, not a forecast or staffing recommendation. Participation and time are hypothetical; the model combines a mixed-year global headcount estimate with a May 2025 U.S. internal-medicine employee-wage proxy and excludes administration, benefits, tooling, and institutional overhead.',
    task: 'funding',
  },
  'funding-a-domain-specific-physician-eval-set': {
    shortTitle: 'A physician-built evaluation set',
    question: 'What would a domain-specific physician evaluation effort cost?',
    takeaway: 'A focused expert panel can be budgeted directly from panel size, time, and wage assumptions.',
    caveat: 'This estimates reviewer labor using a May 2025 U.S. general-internal-medicine mean employee-wage proxy. HealthBench’s physicians worked across specialties and countries; consulting rates, recruitment, coordination, adjudication, dataset engineering, benefits, and overhead are excluded.',
    task: 'funding',
  },
  'producing-an-expert-evaluation-set': {
    shortTitle: 'Producing an expert evaluation set',
    question: 'What would it cost to commission an expert-written evaluation set?',
    takeaway: 'Question counts can be compared with HLE prize tiers and its prize-pool-per-final-question ratio.',
    caveat: 'The $200 default is derived from HLE’s $500,000 prize pool divided by 2,500 final questions, so the default reproduces that prize budget rather than independently estimating production cost. Actual prizes were concentrated, and review, rejected work, coordination, infrastructure, and maintenance are excluded.',
    task: 'funding',
  },
  'turning-pretraining-composition-shares-into-absolute-tokens': {
    shortTitle: 'Making training-data shares tangible',
    question: 'How many tokens does a small training-data share represent at model scale?',
    takeaway: 'A visually small composition percentage can still represent billions of tokens.',
    caveat: 'The calculation transfers a disclosed composition share to the selected total scale. It does not claim that model families use the same data mixture, tokenizer, training repetition, or modalities.',
    task: 'scale',
  },
  'distributing-ai-company-revenue-broadly': {
    shortTitle: 'Dividing AI revenue broadly',
    question: 'What does a reported AI revenue figure look like when divided across a population?',
    takeaway: 'Large company-level totals can become modest per-person amounts when spread broadly.',
    caveat: 'This is an illustrative ratio. It treats annualized revenue as a hypothetical numerator; revenue is not profit, free cash, a feasible dividend, a compensation pool, or a claim about current payment policy.',
    task: 'compensation',
  },
};

export function getScenarioContext(scenario: Pick<Scenario, 'id' | 'title' | 'description' | 'category'>): ScenarioContext {
  return SCENARIO_CONTEXT[scenario.id] ?? {
    shortTitle: scenario.title,
    question: scenario.description,
    takeaway: 'Change the assumptions to see how the result moves.',
    caveat: 'This is an illustrative calculation built from public benchmarks, not a forecast or legal conclusion.',
    task: scenario.category === 'Making data scale vivid' ? 'scale' : 'funding',
  };
}

export function evaluateScenario(
  scenario: Pick<Scenario, 'formula'>,
  values: Record<string, number>,
): number | null {
  const evaluation = evaluateFormulaExpression(scenario.formula, values);
  return evaluation.error ? null : evaluation.rawValue;
}

export function getDefaultScenarioValues(
  scenario: Pick<Scenario, 'input_variables'>,
  inputs: Record<string, Input>,
): Record<string, number> {
  return Object.fromEntries(
    scenario.input_variables.map((key) => [key, inputs[key]?.default_value ?? inputs[key]?.value ?? 0]),
  );
}

export function applyScenarioPreset(
  scenario: Pick<Scenario, 'input_variables'>,
  preset: ScenarioPreset,
  inputs: Record<string, Input>,
): { selectedKeys: Record<string, string>; values: Record<string, number> } {
  const selectedKeys = Object.fromEntries(scenario.input_variables.map((key) => [key, key]));
  const values = getDefaultScenarioValues(scenario, inputs);

  preset.fills?.forEach((fill) => {
    if (!scenario.input_variables.includes(fill.input) || !inputs[fill.variant]) return;
    selectedKeys[fill.input] = fill.variant;
    values[fill.input] = inputs[fill.variant].default_value;
  });

  preset.values?.forEach((entry) => {
    if (scenario.input_variables.includes(entry.input)) {
      values[entry.input] = entry.value;
    }
  });

  return { selectedKeys, values };
}

export function getScenarioCases(scenario: Scenario, inputs: Record<string, Input>) {
  const baseValues = getDefaultScenarioValues(scenario, inputs);
  const baseResult = evaluateScenario(scenario, baseValues);
  const cases = [{ id: 'base', label: 'Base case', result: baseResult }];

  scenario.presets?.forEach((preset) => {
    const { values } = applyScenarioPreset(scenario, preset, inputs);
    cases.push({ id: preset.id, label: preset.label, result: evaluateScenario(scenario, values) });
  });

  return cases.filter((entry): entry is { id: string; label: string; result: number } => entry.result !== null);
}

export function formatEstimate(value: number | null | undefined, units?: string): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return 'Not available';

  const absolute = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  const currency = units === 'dollars' ? '$' : '';
  const suffixes = [
    { threshold: 1e12, label: 'trillion' },
    { threshold: 1e9, label: 'billion' },
    { threshold: 1e6, label: 'million' },
    { threshold: 1e3, label: 'thousand' },
  ];

  const suffix = suffixes.find((entry) => absolute >= entry.threshold);
  if (suffix) {
    const scaled = absolute / suffix.threshold;
    const digits = scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2;
    return `${sign}${currency}${scaled.toLocaleString('en-US', { maximumFractionDigits: digits })} ${suffix.label}`;
  }

  const maximumFractionDigits = absolute >= 100 ? 0 : absolute >= 10 ? 1 : absolute >= 1 ? 2 : 4;
  return `${sign}${currency}${absolute.toLocaleString('en-US', { maximumFractionDigits })}`;
}

export function formatInputBenchmark(input: Input): string {
  const scaled = input.scale ? input.value / input.scale : input.value;
  if ((input.scale || 1) >= 1_000) {
    const unitLabel = input.units === 'dollars'
      ? ''
      : ` ${input.units.replaceAll('_', ' ')}`;
    return `${formatEstimate(input.value, input.units === 'dollars' ? 'dollars' : undefined)}${unitLabel}`;
  }
  return `${scaled.toLocaleString('en-US', { maximumFractionDigits: scaled >= 100 ? 0 : 3 })} ${input.display_units}`;
}

export function formatQualityLabel(quality?: string): string {
  const labels: Record<string, string> = {
    'first-party-report': 'Primary or first-party source',
    'third-party-report': 'Research, external report, or filed record',
    news: 'Reported in news coverage',
    other: 'Project benchmark',
  };
  return labels[quality ?? ''] ?? 'Source documented';
}
