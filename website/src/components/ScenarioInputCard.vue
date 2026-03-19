<script setup lang="ts">
import InputComparisonFigure from './InputComparisonFigure.vue';
import InputReferenceCharts from './InputReferenceCharts.vue';
import { type Input } from '../lib/calculations';
import {
  getInputFieldId,
  getInputHeadingId,
  getInputLabelId,
  getInputSummaryId,
  getInputTitle,
  getInputVisibleLabel,
  type InputScope,
} from '../lib/input-ui';

type ScenarioInputEntry = {
  key: string;
  input: Input;
};

const props = defineProps<{
  entry: ScenarioInputEntry;
  scope: Exclude<InputScope, 'library'>;
  changed: boolean;
  fieldValue: string;
  step?: number;
  readableNote?: string | null;
  sourceQualityLabel: string;
  confidenceLabel?: string | null;
}>();

const emit = defineEmits<{
  adjust: [factor: number];
  'begin-edit': [];
  commit: [];
  inspect: [trigger?: HTMLElement | null];
  keydown: [event: KeyboardEvent];
  reset: [];
  'update-draft': [value: string];
}>();

function getTitle(): string {
  return getInputTitle(props.entry.key, props.entry.input);
}

function getAdjustValueLabel(factor: number): string {
  return `Multiply ${getTitle()} by ${factor}`;
}

function getResetValueLabel(): string {
  return `Reset ${getTitle()} to its default value`;
}

function getInspectValueLabel(): string {
  return `Open the inspector for ${getTitle()}`;
}
</script>

<template>
  <div class="scenario-input-card" :class="{ changed }">
    <div class="scenario-input-header">
      <div>
        <h4 :id="getInputHeadingId(scope, entry.key)">{{ getTitle() }}</h4>
        <p :id="getInputSummaryId(scope, entry.key)" class="scenario-input-summary">
          {{ entry.input.summary || entry.input.importanceReason }}
        </p>
      </div>

      <div class="scenario-input-badges">
        <span class="input-quality-badge">
          {{ sourceQualityLabel }}
        </span>
        <span v-if="changed" class="changed-badge">Modified</span>
      </div>
    </div>

    <label
      class="scenario-input-label"
      :for="getInputFieldId(scope, entry.key)"
      :id="getInputLabelId(scope, entry.key)"
    >
      {{ getInputVisibleLabel(entry.input) }}
    </label>

    <InputComparisonFigure
      v-if="entry.input.comparisonImage"
      :comparison-image="entry.input.comparisonImage"
    />

    <InputReferenceCharts
      v-if="entry.input.referenceCharts?.length"
      :reference-charts="entry.input.referenceCharts"
    />

    <div class="scenario-input-controls">
      <input
        :id="getInputFieldId(scope, entry.key)"
        type="number"
        class="form-control"
        :aria-describedby="getInputSummaryId(scope, entry.key)"
        :aria-labelledby="`${getInputHeadingId(scope, entry.key)} ${getInputLabelId(scope, entry.key)}`"
        :value="fieldValue"
        :step="step"
        :min="entry.input.min ?? undefined"
        :max="entry.input.max ?? undefined"
        @focus="emit('begin-edit')"
        @input="emit('update-draft', ($event.target as HTMLInputElement).value)"
        @blur="emit('commit')"
        @keydown="emit('keydown', $event)"
      />
      <button
        class="btn btn-outline-secondary"
        type="button"
        :aria-label="getAdjustValueLabel(0.1)"
        @click="emit('adjust', 0.1)"
      >
        x0.1
      </button>
      <button
        class="btn btn-outline-secondary"
        type="button"
        :aria-label="getAdjustValueLabel(10)"
        @click="emit('adjust', 10)"
      >
        x10
      </button>
      <button
        class="btn btn-outline-secondary"
        type="button"
        :aria-label="getResetValueLabel()"
        :disabled="!changed"
        @click="emit('reset')"
      >
        Reset
      </button>
      <button
        class="btn btn-secondary"
        type="button"
        aria-controls="input-inspector-dialog"
        :aria-label="getInspectValueLabel()"
        aria-haspopup="dialog"
        @click="emit('inspect', $event.currentTarget as HTMLElement)"
      >
        Inspect
      </button>
    </div>

    <p v-if="readableNote" class="input-readable-note">
      {{ readableNote }}
    </p>

    <div class="scenario-input-footer">
      <span v-if="entry.input.usedIn?.length" class="input-usage">
        Used in {{ entry.input.usedIn?.length }}
        {{ entry.input.usedIn?.length === 1 ? 'scenario' : 'scenarios' }}
      </span>
      <span v-if="confidenceLabel" class="confidence-text">
        {{ confidenceLabel }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.scenario-input-card {
  padding: 1rem;
  border: 1px solid rgba(216, 222, 230, 0.92);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.84);
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.scenario-input-card:hover {
  transform: translateY(-2px);
  border-color: rgba(43, 76, 111, 0.22);
}

.scenario-input-card.changed {
  border-color: rgba(43, 76, 111, 0.28);
  box-shadow: 0 12px 24px rgba(43, 76, 111, 0.1);
}

.scenario-input-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.9rem;
}

.scenario-input-header h4 {
  margin-bottom: 0.32rem;
}

.scenario-input-badges {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.input-quality-badge,
.changed-badge {
  display: inline-flex;
  align-items: center;
  min-height: 1.8rem;
  padding: 0.2rem 0.58rem;
  border-radius: 999px;
  font-size: 0.8rem;
  white-space: nowrap;
}

.input-quality-badge {
  color: var(--ink-soft);
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(216, 222, 230, 0.92);
}

.changed-badge {
  color: var(--white);
  background: var(--dark-gray);
}

.scenario-input-label {
  display: inline-flex;
  align-items: center;
  color: var(--dark-gray);
  font-family: var(--font-ui);
  font-size: 0.9rem;
  font-weight: 700;
}

.scenario-input-controls {
  display: grid;
  grid-template-columns: minmax(0, 1fr) repeat(4, auto);
  gap: 0.5rem;
  margin-top: 0.55rem;
}

.scenario-input-footer {
  display: flex;
  justify-content: space-between;
  gap: 0.8rem;
  margin-top: 0.7rem;
  color: var(--dark-gray);
  font-size: 0.88rem;
  flex-wrap: wrap;
}

.input-usage,
.confidence-text {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}
</style>
