import type { Input, Scenario, ScenarioPreset } from './calculations';

export const DEFAULT_SCENARIO_PRESET_ID = '__default__';
export const CUSTOM_SCENARIO_PRESET_ID = '__custom__';

type InputState = Pick<Input, 'value' | 'default_value'>;
type FillSelections = Record<string, string>;

function getPresetSelectedInputKey(
  preset: ScenarioPreset | null | undefined,
  inputKey: string,
): string {
  return preset?.fills?.find((fill) => fill.input === inputKey)?.variant ?? inputKey;
}

function getExpectedInputValue(
  preset: ScenarioPreset | null | undefined,
  inputKey: string,
  inputState?: InputState,
): number | undefined {
  const override = preset?.values?.find((value) => value.input === inputKey);
  if (override) {
    return override.value;
  }

  return inputState?.default_value;
}

export function findScenarioPreset(
  scenario: Pick<Scenario, 'presets'>,
  presetId: string,
): ScenarioPreset | null {
  return scenario.presets?.find((preset) => preset.id === presetId) ?? null;
}

export function getScenarioPresetRelevantInputKeys(
  scenario: Pick<Scenario, 'input_variables' | 'presets'>,
): string[] {
  const keys = new Set(scenario.input_variables);

  scenario.presets?.forEach((preset) => {
    preset.fills?.forEach((fill) => {
      keys.add(fill.variant);
    });
    preset.values?.forEach((value) => {
      keys.add(value.input);
    });
  });

  return [...keys];
}

export function scenarioPresetMatches(
  scenario: Pick<Scenario, 'input_variables'>,
  preset: ScenarioPreset | null | undefined,
  fillSelections: FillSelections,
  inputs: Record<string, InputState>,
): boolean {
  return scenario.input_variables.every((inputKey) => {
    const selectedInputKey = fillSelections[inputKey] ?? inputKey;
    const expectedInputKey = getPresetSelectedInputKey(preset, inputKey);

    if (selectedInputKey !== expectedInputKey) {
      return false;
    }

    const selectedInput = inputs[selectedInputKey];
    const expectedValue = getExpectedInputValue(preset, expectedInputKey, selectedInput);

    if (!selectedInput || expectedValue === undefined) {
      return false;
    }

    return selectedInput.value === expectedValue;
  });
}

export function getActiveScenarioPresetId(
  scenario: Pick<Scenario, 'input_variables' | 'presets'>,
  fillSelections: FillSelections,
  inputs: Record<string, InputState>,
): string {
  if (scenarioPresetMatches(scenario, null, fillSelections, inputs)) {
    return DEFAULT_SCENARIO_PRESET_ID;
  }

  const matchingPreset = scenario.presets?.find((preset) => {
    return scenarioPresetMatches(scenario, preset, fillSelections, inputs);
  });

  return matchingPreset?.id ?? CUSTOM_SCENARIO_PRESET_ID;
}
