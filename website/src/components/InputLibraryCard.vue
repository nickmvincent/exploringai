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
  <article class="input-library-card" :class="{ featured: entry.input.featured }">
    <div class="input-library-header">
      <div class="input-rank">
        <span class="input-rank-number">#{{ entry.input.importanceRank || '-' }}</span>
        <span class="input-rank-label">Importance</span>
      </div>

      <div class="input-library-badges">
        <span class="input-quality-badge">
          {{ sourceQualityLabel }}
        </span>
        <span v-if="entry.input.featured" class="featured-badge">Featured</span>
      </div>
    </div>

    <h3 :id="getInputHeadingId('library', entry.key)">{{ getTitle() }}</h3>
    <p :id="getInputSummaryId('library', entry.key)" class="input-library-summary">
      {{ entry.input.summary || entry.input.importanceReason }}
    </p>

    <InputComparisonFigure
      v-if="entry.input.comparisonImage"
      :comparison-image="entry.input.comparisonImage"
    />

    <InputReferenceCharts
      v-if="entry.input.referenceCharts?.length"
      :reference-charts="entry.input.referenceCharts"
    />

    <div class="input-library-value-row">
      <input
        :id="getInputFieldId('library', entry.key)"
        type="number"
        class="form-control"
        :aria-describedby="getInputSummaryId('library', entry.key)"
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
        class="btn btn-outline-secondary btn-sm"
        type="button"
        :aria-label="getAdjustValueLabel(0.1)"
        @click="emit('adjust', 0.1)"
      >
        x0.1
      </button>
      <button
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
      <span v-if="confidenceLabel">{{ confidenceLabel }}</span>
    </div>

    <p v-if="entry.input.importanceReason" class="input-library-reason">
      <strong>Why it matters:</strong> {{ entry.input.importanceReason }}
    </p>

    <div class="input-library-source">
      <strong>{{ entry.input.sourceName || 'Source status' }}</strong>
      <span v-if="entry.input.lastReviewed">Reviewed {{ entry.input.lastReviewed }}</span>
    </div>

    <p v-if="entry.input.sourceNote" class="input-library-note">
      {{ entry.input.sourceNote }}
    </p>

    <div v-if="entry.input.usedIn?.length" class="input-library-usage">
      <span class="usage-label">Used in</span>
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

.input-library-card.featured {
  background:
    linear-gradient(180deg, rgba(43, 76, 111, 0.06), rgba(255, 255, 255, 0)),
    rgba(255, 255, 255, 0.9);
}

.input-library-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.9rem;
}

.input-rank {
  display: inline-flex;
  flex-direction: column;
  gap: 0.1rem;
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

.input-quality-badge,
.featured-badge {
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

.featured-badge {
  color: var(--primary-color);
  background: rgba(43, 76, 111, 0.08);
}

.input-library-value-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.45rem;
}

.input-library-units,
.usage-label {
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
  min-height: 2rem;
  padding: 0.28rem 0.62rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(216, 222, 230, 0.92);
  color: var(--dark-gray);
  font-size: 0.85rem;
}

.input-library-reason {
  margin-bottom: 0;
}

.input-library-source {
  display: flex;
  justify-content: space-between;
  gap: 0.8rem;
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
