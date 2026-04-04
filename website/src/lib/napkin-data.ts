import { getCollection } from 'astro:content';
import type { Input, Scenario } from './calculations';
import { extractInputTokens } from './formulas.js';

export function getEntryStem(entryId: string) {
  const segments = entryId.split('/').filter(Boolean);
  return segments[segments.length - 1] || entryId;
}

function getUniqueInputVariables(inputVariables: string[]) {
  return [...new Set(inputVariables.filter(Boolean))];
}

export async function loadNapkinData() {
  const inputEntries = await getCollection('inputs');
  const scenarioEntries = await getCollection('scenarios');

  const scenarioReferences = scenarioEntries.map((entry) => ({
    id: getEntryStem(entry.id),
    title: entry.data.title,
    category: entry.data.category,
    inputVariables: getUniqueInputVariables(
      entry.data.input_variables?.length ? entry.data.input_variables : extractInputTokens(entry.data.formula),
    ),
  }));

  const inputUsage = new Map<string, { id: string; title: string; category: string }[]>();
  for (const scenario of scenarioReferences) {
    scenario.inputVariables.forEach((inputKey) => {
      const existing = inputUsage.get(inputKey) ?? [];
      if (!existing.some((usage) => usage.id === scenario.id)) {
        existing.push({
          id: scenario.id,
          title: scenario.title,
          category: scenario.category,
        });
      }
      inputUsage.set(inputKey, existing);
    });
  }

  const inputs: Record<string, Input> = {};
  for (const entry of inputEntries) {
    const { data } = entry;
    const variableName = data.variable_name ?? getEntryStem(entry.id);

    if (inputs[variableName]) {
      throw new Error(`Duplicate input id "${variableName}" found while building the input library.`);
    }

    inputs[variableName] = {
      id: entry.id,
      title: data.title,
      value: data.value,
      default_value: data.value,
      scale: data.scale || 1,
      display_units: data.display_units,
      variable_name: variableName,
      variable_type: data.variable_type,
      entity: data.entity ?? undefined,
      units: data.units,
      source_url: data.source_url ?? undefined,
      summary: data.summary ?? undefined,
      mainExampleForCategory: data.mainExampleForCategory ?? false,
      sourceName: data.sourceName ?? undefined,
      sourceNote: data.sourceNote ?? undefined,
      sourceLocator: data.sourceLocator ?? undefined,
      sourceLocatorUrl: data.sourceLocatorUrl ?? undefined,
      sourceExcerpt: data.sourceExcerpt ?? undefined,
      derivationNote: data.derivationNote ?? undefined,
      sourcePublished: data.sourcePublished ?? undefined,
      sourceQuality: data.sourceQuality ?? undefined,
      lastReviewed: data.lastReviewed ?? undefined,
      min: data.min ?? undefined,
      max: data.max ?? undefined,
      step: data.step ?? undefined,
      comparisonImage: data.comparisonImage
        ? {
            src: data.comparisonImage.src,
            alt: data.comparisonImage.alt,
            caption: data.comparisonImage.caption ?? undefined,
            href: data.comparisonImage.href ?? undefined,
            label: data.comparisonImage.label ?? undefined,
          }
        : undefined,
      referenceCharts: data.referenceCharts?.map((chart) => ({
        title: chart.title,
        description: chart.description ?? undefined,
        scale: chart.scale ?? undefined,
        bars: chart.bars.map((bar) => ({
          label: bar.label,
          value: bar.value,
          displayValue: bar.displayValue ?? undefined,
          note: bar.note ?? undefined,
          highlight: bar.highlight ?? false,
        })),
      })),
      usedIn: inputUsage.get(variableName) ?? [],
    };
  }

  const scenarios: Scenario[] = scenarioEntries.map((entry) => {
    const { data } = entry;
    const inputVariables = getUniqueInputVariables(
      data.input_variables?.length ? data.input_variables : extractInputTokens(data.formula),
    );

    return {
      id: getEntryStem(entry.id),
      title: data.title,
      description: data.description,
      input_variables: inputVariables,
      inputs: inputVariables,
      formula: data.formula,
      presets: data.presets?.map((preset) => ({
        id: preset.id,
        label: preset.label,
        description: preset.description ?? undefined,
        fills: preset.fills?.map((fill) => ({
          input: fill.input,
          variant: fill.variant,
        })) ?? [],
        values: preset.values?.map((value) => ({
          input: value.input,
          value: value.value,
        })) ?? [],
      })) ?? [],
      result_label: data.result_label,
      result_units: data.result_units,
      category: data.category,
      result: {
        value: 'Loading...',
        rawValue: null,
        units: data.result_units,
      },
      showExplore: false,
      showCalcDetails: false,
    };
  });

  return {
    inputs,
    scenarios,
    inputCount: inputEntries.length,
    scenarioCount: scenarioEntries.length,
  };
}
