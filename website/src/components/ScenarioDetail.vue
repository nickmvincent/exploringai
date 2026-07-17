<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import type { Input, Scenario } from '../lib/calculations';
import { isReasonableVariant } from '../lib/input-variants';
import {
  applyScenarioPreset,
  evaluateScenario,
  formatEstimate,
  formatInputBenchmark,
  formatQualityLabel,
  getDefaultScenarioValues,
  getScenarioCases,
  getScenarioContext,
} from '../lib/public-estimates';

const props = defineProps<{
  scenario: Scenario;
  inputs: Record<string, Input>;
}>();

const context = getScenarioContext(props.scenario);
const selectedKeys = ref<Record<string, string>>(
  Object.fromEntries(props.scenario.input_variables.map((key) => [key, key])),
);
const values = ref<Record<string, number>>(getDefaultScenarioValues(props.scenario, props.inputs));
const selectedCase = ref('base');
const copyLabel = ref('Share this case');
const citationLabel = ref('Copy citation');

const result = computed(() => evaluateScenario(props.scenario, values.value));
const formattedResult = computed(() => formatEstimate(result.value, props.scenario.result_units));
const cases = computed(() => getScenarioCases(props.scenario, props.inputs));
const caseResults = computed(() => cases.value.map((entry) => entry.result).filter(Number.isFinite));
const caseMinimum = computed(() => Math.min(...caseResults.value));
const caseMaximum = computed(() => Math.max(...caseResults.value));

const activeInputs = computed(() => props.scenario.input_variables.map((token) => ({
  token,
  selectedKey: selectedKeys.value[token] ?? token,
  input: props.inputs[selectedKeys.value[token] ?? token],
})));

const sensitivity = computed(() => {
  const current = result.value;
  if (current === null || current === 0) return [];

  const rows = activeInputs.value.map(({ token, input }) => {
    const low = evaluateScenario(props.scenario, { ...values.value, [token]: values.value[token] * 0.8 });
    const high = evaluateScenario(props.scenario, { ...values.value, [token]: values.value[token] * 1.2 });
    const effect = Math.max(Math.abs((low ?? current) - current), Math.abs((high ?? current) - current));
    return { token, title: input?.title ?? token, low, high, effect };
  });
  const maxEffect = Math.max(...rows.map((row) => row.effect), 1);
  return rows
    .map((row) => ({ ...row, width: Math.max(6, (row.effect / maxEffect) * 100) }))
    .sort((a, b) => b.effect - a.effect);
});

function compatibleOptions(token: string) {
  const source = props.inputs[token];
  return Object.values(props.inputs)
    .filter((candidate) => isReasonableVariant(source, candidate))
    .sort((a, b) => {
      if (Boolean(a.mainExampleForCategory) !== Boolean(b.mainExampleForCategory)) {
        return a.mainExampleForCategory ? -1 : 1;
      }
      return a.title.localeCompare(b.title);
    });
}

function setBenchmark(token: string, nextKey: string) {
  const nextInput = props.inputs[nextKey];
  if (!nextInput) return;
  selectedKeys.value = { ...selectedKeys.value, [token]: nextKey };
  values.value = { ...values.value, [token]: nextInput.default_value };
  selectedCase.value = 'custom';
}

function setDisplayValue(token: string, input: Input, displayValue: string) {
  const numeric = Number(displayValue);
  if (!Number.isFinite(numeric)) return;
  values.value = { ...values.value, [token]: numeric * (input.scale || 1) };
  selectedCase.value = 'custom';
}

function resetCase() {
  selectedKeys.value = Object.fromEntries(props.scenario.input_variables.map((key) => [key, key]));
  values.value = getDefaultScenarioValues(props.scenario, props.inputs);
  selectedCase.value = 'base';
}

function applyCase(caseId: string) {
  if (caseId === 'base') {
    resetCase();
    return;
  }
  const preset = props.scenario.presets?.find((entry) => entry.id === caseId);
  if (!preset) return;
  const next = applyScenarioPreset(props.scenario, preset, props.inputs);
  selectedKeys.value = next.selectedKeys;
  values.value = next.values;
  selectedCase.value = caseId;
}

function serializeState() {
  return btoa(JSON.stringify({ keys: selectedKeys.value, values: values.value, caseId: selectedCase.value }));
}

function syncUrl() {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (selectedCase.value === 'base') {
    url.searchParams.delete('state');
  } else {
    url.searchParams.set('state', serializeState());
  }
  window.history.replaceState({}, '', url);
}

async function copyShareLink() {
  syncUrl();
  await navigator.clipboard.writeText(window.location.href);
  copyLabel.value = 'Link copied';
  window.setTimeout(() => { copyLabel.value = 'Share this case'; }, 1800);
}

async function copyCitation() {
  const citation = `${props.scenario.title}. Exploring AI: Data Napkin Math. ${window.location.href}`;
  await navigator.clipboard.writeText(citation);
  citationLabel.value = 'Citation copied';
  window.setTimeout(() => { citationLabel.value = 'Copy citation'; }, 1800);
}

function downloadCsv() {
  const rows = [
    ['Scenario', props.scenario.title],
    ['Result', formattedResult.value],
    ['Units', props.scenario.result_units],
    [],
    ['Assumption', 'Current value', 'Display units', 'Source', 'Reviewed'],
    ...activeInputs.value.map(({ token, input }) => [
      input?.title ?? token,
      String(values.value[token]),
      input?.display_units ?? '',
      input?.sourceName ?? input?.source_url ?? '',
      input?.lastReviewed ?? '',
    ]),
    [],
    ['Formula', props.scenario.formula],
    ['Caveat', context.caveat],
  ];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(blob);
  anchor.download = `${props.scenario.id}.csv`;
  anchor.click();
  URL.revokeObjectURL(anchor.href);
}

onMounted(() => {
  const encoded = new URL(window.location.href).searchParams.get('state');
  if (!encoded) return;
  try {
    const parsed = JSON.parse(atob(encoded));
    if (parsed?.keys && parsed?.values) {
      selectedKeys.value = parsed.keys;
      values.value = parsed.values;
      selectedCase.value = parsed.caseId ?? 'custom';
    }
  } catch {
    resetCase();
  }
});

watch([selectedKeys, values], syncUrl, { deep: true });
</script>

<template>
  <div class="scenario-detail-app">
    <section class="scenario-answer-grid" aria-labelledby="scenario-answer-heading">
      <div class="scenario-answer-copy">
        <p class="section-kicker">Illustrative estimate</p>
        <h1 id="scenario-answer-heading">{{ context.question }}</h1>
        <p class="scenario-answer-summary">{{ context.takeaway }}</p>
        <div class="scenario-answer-actions">
          <button class="btn btn-primary" type="button" @click="copyShareLink">{{ copyLabel }}</button>
          <button class="btn btn-outline-primary" type="button" @click="copyCitation">{{ citationLabel }}</button>
          <button class="btn btn-outline-primary" type="button" @click="downloadCsv">Download data</button>
        </div>
      </div>

      <aside class="scenario-answer-panel" aria-live="polite">
        <span class="result-label">{{ scenario.result_label }}</span>
        <output class="scenario-answer-value">{{ formattedResult }}</output>
        <span v-if="scenario.result_units !== 'dollars'" class="scenario-answer-units">{{ scenario.result_units }}</span>
        <p>{{ context.caveat }}</p>
      </aside>
    </section>

    <section v-if="cases.length > 1" class="scenario-case-section" aria-labelledby="case-heading">
      <div class="section-heading-row">
        <div>
          <p class="section-kicker">Curated cases</p>
          <h2 id="case-heading">Try a defensible comparison</h2>
        </div>
        <p>These are named benchmark combinations—not a confidence interval.</p>
      </div>
      <div class="scenario-case-layout">
        <label class="case-picker">
          <span>Case</span>
          <select :value="selectedCase" @change="applyCase(($event.target as HTMLSelectElement).value)">
            <option v-for="entry in cases" :key="entry.id" :value="entry.id">{{ entry.label }}</option>
            <option v-if="selectedCase === 'custom'" value="custom">Custom case</option>
          </select>
        </label>
        <div class="case-range">
          <span>Across curated cases</span>
          <strong>{{ formatEstimate(caseMinimum, scenario.result_units) }} – {{ formatEstimate(caseMaximum, scenario.result_units) }}</strong>
        </div>
        <div class="case-chips" aria-label="Case results">
          <button
            v-for="entry in cases"
            :key="entry.id"
            :class="['case-chip', { active: selectedCase === entry.id }]"
            type="button"
            @click="applyCase(entry.id)"
          >
            <span>{{ entry.label }}</span>
            <strong>{{ formatEstimate(entry.result, scenario.result_units) }}</strong>
          </button>
        </div>
      </div>
    </section>

    <section class="scenario-assumptions-section" aria-labelledby="assumptions-heading">
      <div class="section-heading-row">
        <div>
          <p class="section-kicker">Editable assumptions</p>
          <h2 id="assumptions-heading">Change what matters</h2>
        </div>
        <button class="text-button" type="button" @click="resetCase">Reset to base case</button>
      </div>

      <div class="assumption-card-grid">
        <article v-for="entry in activeInputs" :key="entry.token" class="assumption-card">
          <div class="assumption-card-heading">
            <div>
              <span class="quality-pill">{{ formatQualityLabel(entry.input?.sourceQuality) }}</span>
              <h3>{{ entry.input?.title ?? entry.token }}</h3>
            </div>
            <a :href="`/inputs/${entry.selectedKey}`">Source details</a>
          </div>

          <label class="assumption-field">
            <span>Current value</span>
            <div>
              <input
                :value="values[entry.token] / (entry.input?.scale || 1)"
                :min="entry.input?.min ?? undefined"
                :max="entry.input?.max ?? undefined"
                :step="entry.input?.step ?? 'any'"
                type="number"
                @input="setDisplayValue(entry.token, entry.input, ($event.target as HTMLInputElement).value)"
              />
              <span>{{ entry.input?.display_units }}</span>
            </div>
          </label>

          <label v-if="compatibleOptions(entry.token).length > 1" class="benchmark-picker">
            <span>Benchmark</span>
            <select :value="entry.selectedKey" @change="setBenchmark(entry.token, ($event.target as HTMLSelectElement).value)">
              <option v-for="option in compatibleOptions(entry.token)" :key="option.variable_name" :value="option.variable_name">
                {{ option.title }} — {{ formatInputBenchmark(option) }}
              </option>
            </select>
          </label>

          <p class="assumption-source-note">{{ entry.input?.sourceNote || entry.input?.summary }}</p>
          <div class="assumption-source-meta">
            <span v-if="entry.input?.lastReviewed">Reviewed {{ entry.input.lastReviewed }}</span>
            <a
              v-if="entry.input?.sourceLocatorUrl || entry.input?.source_url"
              :href="entry.input.sourceLocatorUrl || entry.input.source_url"
              target="_blank"
              rel="noreferrer"
            >Open source ↗</a>
          </div>
        </article>
      </div>
    </section>

    <section class="scenario-sensitivity-section" aria-labelledby="sensitivity-heading">
      <div class="section-heading-row">
        <div>
          <p class="section-kicker">Sensitivity test</p>
          <h2 id="sensitivity-heading">What moves the answer?</h2>
        </div>
        <p>Each row changes one active assumption by ±20%, holding the others fixed.</p>
      </div>
      <div class="sensitivity-list">
        <div v-for="entry in sensitivity" :key="entry.token" class="sensitivity-row">
          <div class="sensitivity-label">
            <strong>{{ entry.title }}</strong>
            <span>{{ formatEstimate(entry.low, scenario.result_units) }} – {{ formatEstimate(entry.high, scenario.result_units) }}</span>
          </div>
          <div class="sensitivity-track" aria-hidden="true">
            <span :style="{ width: `${entry.width}%` }"></span>
          </div>
        </div>
      </div>
    </section>

    <details class="scenario-method-details">
      <summary>Show formula and audit notes</summary>
      <div class="scenario-method-grid">
        <div>
          <span class="detail-label">Formula</span>
          <code>{{ scenario.formula }}</code>
        </div>
        <div>
          <span class="detail-label">Current result</span>
          <strong>{{ formattedResult }} {{ scenario.result_units === 'dollars' ? '' : scenario.result_units }}</strong>
        </div>
        <div>
          <span class="detail-label">Interpretation boundary</span>
          <p>{{ context.caveat }}</p>
        </div>
      </div>
    </details>
  </div>
</template>
