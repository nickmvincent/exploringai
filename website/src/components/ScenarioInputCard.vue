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
        <p v-if="entry.input.summary" :id="getInputSummaryId(scope, entry.key)" class="scenario-input-summary">
          {{ entry.input.summary }}
        </p>
      </div>

      <div class="scenario-input-badges">
        <span class="input-quality-badge">
          {{ sourceQualityLabel }}
        </span>
        <span v-if="entry.input.mainExampleForCategory" class="input-quality-badge">Main example</span>
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
        :aria-describedby="entry.input.summary ? getInputSummaryId(scope, entry.key) : undefined"
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
      <details class="scenario-input-adjust-menu">
        <summary class="btn btn-outline-secondary scenario-input-adjust-summary">
          Scale
        </summary>
        <div class="scenario-input-adjust-panel">
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
        </div>
      </details>
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
  </div>
</template>

<style scoped>
.scenario-input-card {
  padding: 0.9rem 0.95rem 0.85rem;
  border: 1px solid rgba(31, 39, 51, 0.12);
  border-radius: var(--border-radius-sm);
  background: rgba(255, 255, 255, 0.84);
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.scenario-input-card:hover {
  border-color: rgba(31, 39, 51, 0.22);
}

.scenario-input-card.changed {
  border-color: rgba(31, 39, 51, 0.28);
  box-shadow: none;
}

.scenario-input-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.scenario-input-header h4 {
  margin-bottom: 0.22rem;
}

.scenario-input-summary {
  margin: 0;
  color: var(--ink-soft);
  font-size: 0.94rem;
  line-height: 1.5;
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
  border-radius: var(--border-radius-sm);
  font-size: 0.74rem;
  white-space: nowrap;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.input-quality-badge {
  color: var(--ink-soft);
  background: rgba(251, 249, 243, 0.94);
  border: 1px solid rgba(31, 39, 51, 0.14);
}

.changed-badge {
  color: var(--black);
  background: rgba(31, 39, 51, 0.08);
}

.scenario-input-label {
  display: inline-flex;
  align-items: center;
  margin-top: 0.45rem;
  color: var(--dark-gray);
  font-family: var(--font-ui);
  font-size: 0.9rem;
  font-weight: 700;
}

.scenario-input-controls {
  display: grid;
  grid-template-columns: minmax(0, 1fr) repeat(2, auto);
  align-items: start;
  gap: 0.45rem;
  margin-top: 0.45rem;
}

.scenario-input-adjust-menu {
  position: relative;
}

.scenario-input-adjust-summary {
  min-height: 2.55rem;
  list-style: none;
  cursor: pointer;
}

.scenario-input-adjust-summary::-webkit-details-marker {
  display: none;
}

.scenario-input-adjust-panel {
  position: absolute;
  top: calc(100% + 0.35rem);
  right: 0;
  z-index: 24;
  display: grid;
  gap: 0.35rem;
  width: max-content;
  min-width: 9rem;
  padding: 0.45rem;
  border: 1px solid rgba(31, 39, 51, 0.14);
  border-radius: var(--border-radius-sm);
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 16px 34px rgba(31, 39, 51, 0.13);
}

@media (max-width: 640px) {
  .scenario-input-controls {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .scenario-input-controls .form-control {
    grid-column: 1 / -1;
  }

  .scenario-input-controls .btn {
    min-width: 0;
  }

  .scenario-input-adjust-panel {
    position: static;
    width: 100%;
    margin-top: 0.35rem;
  }

  .scenario-input-adjust-menu,
  .scenario-input-adjust-summary {
    width: 100%;
  }
}
</style>
