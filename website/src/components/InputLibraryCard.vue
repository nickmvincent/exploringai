<script setup lang="ts">
import InputComparisonFigure from './InputComparisonFigure.vue';
import InputReferenceCharts from './InputReferenceCharts.vue';
import { formatLabel, type Input } from '../lib/calculations';
import {
  getInputFieldId,
  getInputHeadingId,
  getInputLabelId,
  getInputSummaryId,
  getInputTitle,
  getInputVisibleLabel,
} from '../lib/input-ui';

type InputLibraryEntry = {
  key: string;
  input: Input;
};

const props = defineProps<{
  entry: InputLibraryEntry;
  changed: boolean;
  compact?: boolean;
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
  jump: [scenarioId: string, category: string];
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
  <article class="input-library-card" :class="{ compact: props.compact }">
    <div class="input-library-header">
      <div class="input-library-badges">
        <span class="input-quality-badge">{{ sourceQualityLabel }}</span>
        <span v-if="entry.input.mainExampleForCategory" class="input-quality-badge input-quality-badge-muted">
          Main example
        </span>
      </div>
    </div>

    <h3 :id="getInputHeadingId('library', entry.key)">{{ getTitle() }}</h3>
    <p v-if="entry.input.summary" :id="getInputSummaryId('library', entry.key)" class="input-library-summary">
      {{ entry.input.summary }}
    </p>

    <InputComparisonFigure
      v-if="!props.compact && entry.input.comparisonImage"
      :comparison-image="entry.input.comparisonImage"
    />

    <InputReferenceCharts
      v-if="!props.compact && entry.input.referenceCharts?.length"
      :reference-charts="entry.input.referenceCharts"
    />

    <div class="input-library-value-row">
      <input
        :id="getInputFieldId('library', entry.key)"
        type="number"
        class="form-control"
        :aria-describedby="entry.input.summary ? getInputSummaryId('library', entry.key) : undefined"
        :aria-labelledby="`${getInputHeadingId('library', entry.key)} ${getInputLabelId('library', entry.key)}`"
        :value="fieldValue"
        :step="step"
        :min="entry.input.min ?? undefined"
        :max="entry.input.max ?? undefined"
        @focus="emit('begin-edit')"
        @input="emit('update-draft', ($event.target as HTMLInputElement).value)"
        @blur="emit('commit')"
        @keydown="emit('keydown', $event)"
      />
      <label
        class="input-library-units"
        :for="getInputFieldId('library', entry.key)"
        :id="getInputLabelId('library', entry.key)"
      >
        {{ getInputVisibleLabel(entry.input) }}
      </label>
    </div>

    <p v-if="readableNote" class="input-readable-note input-library-readable-note">
      {{ readableNote }}
    </p>

    <div class="input-library-quick-actions">
      <button
        v-if="!props.compact"
        class="btn btn-outline-secondary btn-sm"
        type="button"
        :aria-label="getAdjustValueLabel(0.1)"
        @click="emit('adjust', 0.1)"
      >
        x0.1
      </button>
      <button
        v-if="!props.compact"
        class="btn btn-outline-secondary btn-sm"
        type="button"
        :aria-label="getAdjustValueLabel(10)"
        @click="emit('adjust', 10)"
      >
        x10
      </button>
      <button
        class="btn btn-outline-secondary btn-sm"
        type="button"
        :aria-label="getResetValueLabel()"
        :disabled="!changed"
        @click="emit('reset')"
      >
        Reset
      </button>
      <button
        class="btn btn-outline-primary btn-sm"
        type="button"
        aria-controls="input-inspector-dialog"
        :aria-label="getInspectValueLabel()"
        aria-haspopup="dialog"
        @click="emit('inspect', $event.currentTarget as HTMLElement)"
      >
        Inspect
      </button>
      <a
        v-if="entry.input.source_url || entry.input.sourceLocatorUrl"
        class="btn btn-outline-secondary btn-sm"
        :href="entry.input.sourceLocatorUrl || entry.input.source_url"
        target="_blank"
        rel="noreferrer"
      >
        Source
      </a>
    </div>

    <div class="input-library-meta">
      <span>{{ formatLabel(entry.input.variable_type) }}</span>
      <span v-if="entry.input.entity">{{ formatLabel(entry.input.entity) }}</span>
    </div>

    <div v-if="!props.compact" class="input-library-source">
      <strong>{{ entry.input.sourceName || 'Source' }}</strong>
      <span v-if="entry.input.lastReviewed">Reviewed {{ entry.input.lastReviewed }}</span>
    </div>

    <p v-if="!props.compact && entry.input.sourceNote" class="input-library-note">
      {{ entry.input.sourceNote }}
    </p>

    <div v-if="!props.compact && entry.input.usedIn?.length" class="input-library-usage">
      <span class="input-library-usage-count">
        {{ entry.input.usedIn.length }}
        {{ entry.input.usedIn.length === 1 ? 'scenario uses this' : 'scenarios use this' }}
      </span>
      <button
        v-for="scenario in entry.input.usedIn"
        :key="scenario.id"
        class="scenario-link-chip"
        type="button"
        @click="emit('jump', scenario.id, scenario.category)"
      >
        {{ scenario.title }}
      </button>
    </div>
  </article>
</template>

<style scoped>
.input-library-card {
  display: flex;
  flex-direction: column;
  gap: 0.95rem;
  padding: 1.15rem;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease;
}

.input-library-card:hover {
  transform: translateY(-2px);
  border-color: rgba(43, 76, 111, 0.22);
}

.input-library-card.compact {
  gap: 0.8rem;
  padding: 0.95rem;
  background:
    linear-gradient(180deg, rgba(43, 76, 111, 0.04), rgba(255, 255, 255, 0)),
    rgba(255, 255, 255, 0.92);
}

.input-library-header {
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  gap: 0.9rem;
}

.input-library-card h3,
.input-library-summary,
  .input-library-note {
  margin: 0;
}

.input-rank-number {
  color: var(--primary-color);
  font-family: var(--font-heading);
  font-size: 1.55rem;
  line-height: 1;
}

.input-rank-label {
  color: var(--dark-gray);
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.input-library-badges {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.input-quality-badge {
  display: inline-flex;
  align-items: center;
  font-size: 0.82rem;
  font-weight: 600;
  white-space: nowrap;
  color: var(--ink-soft);
}

.input-quality-badge-muted {
  color: var(--dark-gray);
}

.input-library-value-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.45rem;
  padding: 0.82rem 0.88rem;
  border: 1px solid rgba(216, 222, 230, 0.92);
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(43, 76, 111, 0.05), rgba(255, 255, 255, 0.96)),
    rgba(255, 255, 255, 0.96);
}

.input-library-units,
.input-library-usage-count {
  display: inline-flex;
  align-items: center;
  color: var(--dark-gray);
  font-family: var(--font-ui);
  font-size: 0.9rem;
  font-weight: 700;
}

.input-library-quick-actions,
.input-library-meta,
.input-library-usage {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  flex-wrap: wrap;
}

.input-library-meta span {
  display: inline-flex;
  align-items: center;
  color: var(--dark-gray);
  font-size: 0.85rem;
}

.input-library-meta span + span::before,
.input-library-badges span + span::before {
  content: ' / ';
  color: rgba(31, 39, 51, 0.32);
}

.input-library-source {
  display: flex;
  justify-content: space-between;
  gap: 0.8rem;
  padding-top: 0.2rem;
  color: var(--dark-gray);
  font-size: 0.92rem;
  flex-wrap: wrap;
  align-items: center;
}

.input-library-source a {
  color: var(--primary-color);
  text-decoration: none;
}

.input-library-source a:hover {
  text-decoration: underline;
}
</style>
