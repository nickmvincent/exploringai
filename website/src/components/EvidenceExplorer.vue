<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { Input } from '../lib/calculations';
import { INPUT_FOCUS_GROUPS, getInputFocusGroupKey } from '../lib/input-groups';
import { formatInputBenchmark, formatQualityLabel } from '../lib/public-estimates';

const props = defineProps<{ inputs: Record<string, Input> }>();

const search = ref('');
const focus = ref('all');
const quality = ref('all');
const visibleLimit = ref(18);
const selected = ref<string[]>([]);

const allInputs = computed(() => Object.values(props.inputs).sort((a, b) => {
  if (Boolean(a.mainExampleForCategory) !== Boolean(b.mainExampleForCategory)) {
    return a.mainExampleForCategory ? -1 : 1;
  }
  return a.title.localeCompare(b.title);
}));

const filtered = computed(() => {
  const query = search.value.trim().toLowerCase();
  return allInputs.value.filter((input) => {
    if (focus.value !== 'all' && getInputFocusGroupKey(input) !== focus.value) return false;
    if (quality.value !== 'all' && input.sourceQuality !== quality.value) return false;
    if (!query) return true;
    return [
      input.title,
      input.summary,
      input.sourceName,
      input.sourceNote,
      input.entity,
      input.variable_name,
      ...(input.usedIn?.map((scenario) => scenario.title) ?? []),
    ].filter(Boolean).join(' ').toLowerCase().includes(query);
  });
});

const visible = computed(() => filtered.value.slice(0, visibleLimit.value));
const compared = computed(() => selected.value.map((key) => props.inputs[key]).filter(Boolean));

function toggleCompare(key: string) {
  if (selected.value.includes(key)) {
    selected.value = selected.value.filter((entry) => entry !== key);
    return;
  }
  if (selected.value.length < 4) selected.value = [...selected.value, key];
}

function resetFilters() {
  search.value = '';
  focus.value = 'all';
  quality.value = 'all';
}

watch([search, focus, quality], () => { visibleLimit.value = 18; });
</script>

<template>
  <div class="evidence-explorer">
    <section class="evidence-toolbar" aria-label="Evidence filters">
      <label class="evidence-search">
        <span>Search evidence</span>
        <input v-model="search" type="search" placeholder="Try “revenue”, “Llama”, “physicians”, or a scenario name" />
      </label>
      <label>
        <span>Question type</span>
        <select v-model="focus">
          <option value="all">All question types</option>
          <option v-for="group in INPUT_FOCUS_GROUPS" :key="group.key" :value="group.key">{{ group.label }}</option>
        </select>
      </label>
      <label>
        <span>Evidence type</span>
        <select v-model="quality">
          <option value="all">All evidence types</option>
          <option value="first-party-report">Primary or first-party</option>
          <option value="third-party-report">Research or external record</option>
          <option value="news">News coverage</option>
          <option value="other">Project benchmark</option>
        </select>
      </label>
      <button class="text-button" type="button" @click="resetFilters">Clear filters</button>
    </section>

    <div class="evidence-results-heading">
      <p><strong>{{ filtered.length }}</strong> matching assumptions</p>
      <p>Select up to four to compare.</p>
    </div>

    <section v-if="compared.length" class="comparison-panel" aria-labelledby="comparison-heading">
      <div class="section-heading-row compact">
        <div>
          <p class="section-kicker">Comparison tray</p>
          <h2 id="comparison-heading">Compare selected evidence</h2>
        </div>
        <button class="text-button" type="button" @click="selected = []">Clear comparison</button>
      </div>
      <div class="comparison-table-wrap">
        <table>
          <thead>
            <tr><th>Assumption</th><th>Current benchmark</th><th>Evidence type</th><th>Reviewed</th></tr>
          </thead>
          <tbody>
            <tr v-for="input in compared" :key="input.variable_name">
              <th><a :href="`/inputs/${input.variable_name}`">{{ input.title }}</a></th>
              <td>{{ formatInputBenchmark(input) }}</td>
              <td>{{ formatQualityLabel(input.sourceQuality) }}</td>
              <td>{{ input.lastReviewed || 'Not recorded' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-if="visible.length" class="evidence-card-grid" aria-label="Evidence results">
      <article v-for="input in visible" :key="input.variable_name" class="evidence-card">
        <div class="evidence-card-topline">
          <span class="quality-pill">{{ formatQualityLabel(input.sourceQuality) }}</span>
          <label class="compare-control">
            <input
              :checked="selected.includes(input.variable_name)"
              :disabled="selected.length >= 4 && !selected.includes(input.variable_name)"
              type="checkbox"
              @change="toggleCompare(input.variable_name)"
            />
            Compare
          </label>
        </div>
        <h2><a :href="`/inputs/${input.variable_name}`">{{ input.title }}</a></h2>
        <p class="evidence-card-value">{{ formatInputBenchmark(input) }}</p>
        <p>{{ input.summary || input.sourceNote }}</p>
        <div class="evidence-card-meta">
          <span>{{ input.sourceName || 'Documented project benchmark' }}</span>
          <span v-if="input.lastReviewed">Reviewed {{ input.lastReviewed }}</span>
          <span v-if="input.usedIn?.length">Used in {{ input.usedIn.length }} {{ input.usedIn.length === 1 ? 'estimate' : 'estimates' }}</span>
        </div>
        <a class="evidence-card-link" :href="`/inputs/${input.variable_name}`">Inspect evidence →</a>
      </article>
    </section>

    <div v-else class="public-empty-state">
      <h2>No matching evidence</h2>
      <p>Try a broader search or clear one of the filters.</p>
      <button class="btn btn-outline-primary" type="button" @click="resetFilters">Clear filters</button>
    </div>

    <div v-if="visible.length < filtered.length" class="load-more-row">
      <button class="btn btn-outline-primary" type="button" @click="visibleLimit += 18">
        Show 18 more
      </button>
      <span>{{ visible.length }} of {{ filtered.length }} shown</span>
    </div>
  </div>
</template>
