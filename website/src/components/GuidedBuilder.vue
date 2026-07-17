<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import type { Input } from '../lib/calculations';
import { formatEstimate, formatInputBenchmark, formatQualityLabel } from '../lib/public-estimates';

type BuilderTemplate = {
  id: string;
  title: string;
  description: string;
  resultLabel: string;
  resultUnits: string;
  slots: { label: string; help: string; defaultKey: string; accepts: (input: Input) => boolean }[];
  calculate: (values: number[]) => number;
};

const props = defineProps<{ inputs: Record<string, Input> }>();

const templates: BuilderTemplate[] = [
  {
    id: 'divide-pool',
    title: 'Divide a pool across a group',
    description: 'Translate a company revenue figure or data deal into an even per-person or per-item amount.',
    resultLabel: 'Amount per recipient',
    resultUnits: 'dollars',
    slots: [
      { label: 'Pool of money', help: 'Revenue, a data deal, or another monetary pool.', defaultKey: 'deal_value__reddit_google__dollars', accepts: (input) => ['deal_value', 'yearly_revenue'].includes(input.variable_type) },
      { label: 'Recipients or items', help: 'The group or collection sharing the pool.', defaultKey: 'deal_group_size__reddit__daily_active_users', accepts: (input) => ['deal_group_size', 'group_size', 'settlement_group_size'].includes(input.variable_type) },
    ],
    calculate: ([pool, recipients]) => pool / recipients,
  },
  {
    id: 'commission-work',
    title: 'Price a body of expert work',
    description: 'Multiply a quantity of work by a per-item compensation benchmark.',
    resultLabel: 'Estimated labor budget',
    resultUnits: 'dollars',
    slots: [
      { label: 'Quantity of work', help: 'Questions, books, documents, or another count.', defaultKey: 'dataset_size__hle__questions', accepts: (input) => ['dataset_size', 'total_books', 'settlement_group_size'].includes(input.variable_type) && !input.units.includes('tokens') && !input.units.includes('terabytes') },
      { label: 'Rate per item', help: 'A wage or per-work payment benchmark.', defaultKey: 'wage_data__phd__dollars_per_question', accepts: (input) => ['wage_data', 'settlement_value'].includes(input.variable_type) && input.units !== 'dollars_per_hour' && input.units !== 'dollars_per_word' },
    ],
    calculate: ([quantity, rate]) => quantity * rate,
  },
  {
    id: 'composition-share',
    title: 'Turn a data share into a total',
    description: 'Apply a disclosed composition percentage to a model-scale token count.',
    resultLabel: 'Absolute token slice',
    resultUnits: 'tokens',
    slots: [
      { label: 'Total training scale', help: 'A token-count benchmark.', defaultKey: 'dataset_size__llama3__tokens', accepts: (input) => input.variable_type === 'dataset_size' && input.units.includes('tokens') },
      { label: 'Composition share', help: 'A percentage of the training mix.', defaultKey: 'pretraining_composition__dolma_v1_6__books_percent', accepts: (input) => input.variable_type === 'pretraining_composition' },
    ],
    calculate: ([total, share]) => total * (share / 100),
  },
  {
    id: 'labor-budget',
    title: 'Budget an expert panel',
    description: 'Combine the number of experts, time per expert, and an hourly wage benchmark.',
    resultLabel: 'Estimated labor budget',
    resultUnits: 'dollars',
    slots: [
      { label: 'Number of experts', help: 'The panel or workforce size.', defaultKey: 'group_size__healthbench__physicians', accepts: (input) => ['group_size', 'deal_group_size'].includes(input.variable_type) && ['people', 'physicians', 'employees', 'journalists'].includes(input.units) },
      { label: 'Hours per expert', help: 'The expected time commitment.', defaultKey: 'training_detail__medical_eval__hours_per_physician', accepts: (input) => input.variable_type === 'training_detail' && input.units.includes('hours') },
      { label: 'Hourly rate', help: 'The selected labor-cost benchmark.', defaultKey: 'wage_data__physician__dollars_per_hour', accepts: (input) => input.variable_type === 'wage_data' && input.units === 'dollars_per_hour' },
    ],
    calculate: ([people, hours, rate]) => people * hours * rate,
  },
];

const templateId = ref(templates[0].id);
const selections = ref<string[]>(templates[0].slots.map((slot) => slot.defaultKey));
const customValues = ref<number[]>(selections.value.map((key) => props.inputs[key]?.value ?? 0));
const shareLabel = ref('Copy share link');

const template = computed(() => templates.find((entry) => entry.id === templateId.value) ?? templates[0]);
const selectedInputs = computed(() => selections.value.map((key) => props.inputs[key]).filter(Boolean));
const result = computed(() => template.value.calculate(customValues.value));
const formulaSummary = computed(() => {
  if (template.value.id === 'divide-pool') return `${selectedInputs.value[0]?.title} ÷ ${selectedInputs.value[1]?.title}`;
  if (template.value.id === 'composition-share') return `${selectedInputs.value[0]?.title} × (${selectedInputs.value[1]?.title} ÷ 100)`;
  return selectedInputs.value.map((input) => input.title).join(' × ');
});

function optionsFor(index: number) {
  const slot = template.value.slots[index];
  return Object.values(props.inputs)
    .filter(slot.accepts)
    .sort((a, b) => a.title.localeCompare(b.title));
}

function selectTemplate(nextId: string) {
  const next = templates.find((entry) => entry.id === nextId) ?? templates[0];
  templateId.value = next.id;
  selections.value = next.slots.map((slot) => slot.defaultKey);
  customValues.value = selections.value.map((key) => props.inputs[key]?.value ?? 0);
}

function selectInput(index: number, key: string) {
  const nextSelections = [...selections.value];
  nextSelections[index] = key;
  selections.value = nextSelections;
  const nextValues = [...customValues.value];
  nextValues[index] = props.inputs[key]?.value ?? 0;
  customValues.value = nextValues;
}

function setValue(index: number, input: Input, displayValue: string) {
  const numeric = Number(displayValue);
  if (!Number.isFinite(numeric)) return;
  const next = [...customValues.value];
  next[index] = numeric * (input.scale || 1);
  customValues.value = next;
}

function encodeState() {
  return btoa(JSON.stringify({ template: templateId.value, selections: selections.value, values: customValues.value }));
}

async function copyShareLink() {
  const url = new URL(window.location.href);
  url.searchParams.set('state', encodeState());
  window.history.replaceState({}, '', url);
  await navigator.clipboard.writeText(url.toString());
  shareLabel.value = 'Link copied';
  window.setTimeout(() => { shareLabel.value = 'Copy share link'; }, 1800);
}

onMounted(() => {
  const state = new URL(window.location.href).searchParams.get('state');
  if (!state) return;
  try {
    const parsed = JSON.parse(atob(state));
    if (!templates.some((entry) => entry.id === parsed.template)) return;
    templateId.value = parsed.template;
    selections.value = parsed.selections;
    customValues.value = parsed.values;
  } catch {
    selectTemplate(templates[0].id);
  }
});

watch([templateId, selections, customValues], () => {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  url.searchParams.set('state', encodeState());
  window.history.replaceState({}, '', url);
}, { deep: true });
</script>

<template>
  <div class="guided-builder">
    <section class="builder-template-section" aria-labelledby="builder-template-heading">
      <p class="section-kicker">Step 1</p>
      <h2 id="builder-template-heading">Choose the shape of the question</h2>
      <div class="builder-template-grid">
        <button
          v-for="entry in templates"
          :key="entry.id"
          :aria-pressed="templateId === entry.id"
          :class="['builder-template-card', { active: templateId === entry.id }]"
          type="button"
          @click="selectTemplate(entry.id)"
        >
          <strong>{{ entry.title }}</strong>
          <span>{{ entry.description }}</span>
        </button>
      </div>
    </section>

    <section class="builder-workbench" aria-labelledby="builder-input-heading">
      <div class="builder-inputs">
        <p class="section-kicker">Step 2</p>
        <h2 id="builder-input-heading">Select and adjust the evidence</h2>
        <div class="builder-slot-list">
          <article v-for="(slot, index) in template.slots" :key="`${template.id}-${slot.label}`" class="builder-slot">
            <div class="builder-slot-heading">
              <span>{{ index + 1 }}</span>
              <div><h3>{{ slot.label }}</h3><p>{{ slot.help }}</p></div>
            </div>
            <label>
              <span>Benchmark</span>
              <select v-model="selections[index]" @change="selectInput(index, selections[index])">
                <option v-for="input in optionsFor(index)" :key="input.variable_name" :value="input.variable_name">
                  {{ input.title }} — {{ formatInputBenchmark(input) }}
                </option>
              </select>
            </label>
            <label v-if="selectedInputs[index]" class="builder-value-field">
              <span>Value</span>
              <div>
                <input
                  :value="customValues[index] / (selectedInputs[index].scale || 1)"
                  type="number"
                  :step="selectedInputs[index].step ?? 'any'"
                  @input="setValue(index, selectedInputs[index], ($event.target as HTMLInputElement).value)"
                />
                <span>{{ selectedInputs[index].display_units }}</span>
              </div>
            </label>
            <div v-if="selectedInputs[index]" class="builder-source-line">
              <span>{{ formatQualityLabel(selectedInputs[index].sourceQuality) }}</span>
              <a :href="`/inputs/${selectedInputs[index].variable_name}`">Inspect source</a>
            </div>
          </article>
        </div>
      </div>

      <aside class="builder-result-card" aria-live="polite">
        <p class="section-kicker">Live result</p>
        <span class="result-label">{{ template.resultLabel }}</span>
        <output>{{ formatEstimate(result, template.resultUnits) }}</output>
        <span v-if="template.resultUnits !== 'dollars'" class="builder-result-units">{{ template.resultUnits }}</span>
        <p>{{ formulaSummary }}</p>
        <div class="builder-result-actions">
          <button class="btn btn-primary" type="button" @click="copyShareLink">{{ shareLabel }}</button>
          <a class="btn btn-outline-primary" href="/scenarios">Browse curated estimates</a>
        </div>
        <p class="builder-boundary-note">This is an illustrative calculation. Check whether the selected units and populations make sense together before citing the result.</p>
      </aside>
    </section>
  </div>
</template>
