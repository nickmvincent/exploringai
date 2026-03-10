<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import InputComparisonFigure from './InputComparisonFigure.vue';
import type { Input, Scenario } from '../lib/calculations';
import {
  createCalculationFunction,
  evaluateMathExpression,
  formatLabel,
  formatOperation,
  formatValue,
  humanReadable,
  updateCalculations,
} from '../lib/calculations';

type ViewMode = 'scenarios' | 'inputs';
type FreeScenarioState = {
  title: string;
  expression: string;
  resultLabel: string;
  resultUnits: string;
  showCalcDetails: boolean;
};

const QUALITY_ORDER = ['official', 'primary', 'reported', 'industry', 'heuristic', 'assumption'];
const FREE_SCENARIO_DEFAULTS: FreeScenarioState = {
  title: 'Free Scenario Builder',
  expression: '',
  resultLabel: 'Custom result',
  resultUnits: 'context-dependent units',
  showCalcDetails: false,
};
const FREE_SCENARIO_SNIPPETS = [
  { label: '+', value: ' + ' },
  { label: '-', value: ' - ' },
  { label: 'x', value: ' * ' },
  { label: '/', value: ' / ' },
  { label: '^', value: ' ^ ' },
  { label: '( )', value: '()' },
];

const props = withDefaults(defineProps<{
  initialInputs: Record<string, Input>;
  initialScenarios: Scenario[];
  initialView?: ViewMode;
  showInputLibrary?: boolean;
  showHeader?: boolean;
  showAbout?: boolean;
}>(), {
  initialView: 'scenarios',
  showInputLibrary: true,
  showHeader: true,
  showAbout: true,
});

const rightPanelOpen = ref(false);
const selectedInputKey = ref<string | null>(null);
const selectedScenario = ref('All');
const activeView = ref<ViewMode>(props.showInputLibrary ? props.initialView : 'scenarios');
const inputSearch = ref('');
const selectedSourceQuality = ref('All');
const selectedInputType = ref('All');
const featuredOnly = ref(false);

const inputs = ref<Record<string, Input>>({});
const scenariosData = ref<Scenario[]>([]);
const logs = ref<Record<string, { time: string; value: number }[]>>({});
const fillSelections = ref<Record<string, string>>({});
const inputDrafts = ref<Record<string, string>>({});
const freeScenario = ref<FreeScenarioState>({ ...FREE_SCENARIO_DEFAULTS });
const freeScenarioInputPicker = ref('');
const freeScenarioExpressionField = ref<HTMLTextAreaElement | null>(null);

const shareButtonLabel = ref('Copy Share Link');
const hasMounted = ref(false);
const isApplyingUrlState = ref(false);

let shareResetTimeout: ReturnType<typeof setTimeout> | null = null;

const selectedInputDetails = computed(() => {
  return selectedInputKey.value ? inputs.value[selectedInputKey.value] : null;
});

const uniqueCategories = computed(() => {
  const categories = scenariosData.value
    .map((scenario) => scenario.category)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  return ['All', ...new Set(categories)];
});

const filteredScenarios = computed(() => {
  return selectedScenario.value === 'All'
    ? scenariosData.value
    : scenariosData.value.filter((scenario) => scenario.category === selectedScenario.value);
});

const inputsByType = computed(() => {
  return Object.values(inputs.value).reduce((groups: Record<string, Input[]>, input) => {
    if (!groups[input.variable_type]) {
      groups[input.variable_type] = [];
    }
    groups[input.variable_type].push(input);
    return groups;
  }, {});
});

const sortedInputs = computed(() => {
  return Object.entries(inputs.value)
    .map(([key, input]) => ({ key, input }))
    .sort((a, b) => {
      const rankA = a.input.importanceRank ?? Number.MAX_SAFE_INTEGER;
      const rankB = b.input.importanceRank ?? Number.MAX_SAFE_INTEGER;

      if (rankA !== rankB) {
        return rankA - rankB;
      }

      return (a.input.title || a.key).localeCompare(b.input.title || b.key);
    });
});

const inputTypeOptions = computed(() => {
  const types = [...new Set(sortedInputs.value.map(({ input }) => input.variable_type))];
  return types.sort((a, b) => formatLabel(a).localeCompare(formatLabel(b)));
});

const sourceQualityOptions = computed(() => {
  const found = new Set(
    sortedInputs.value
      .map(({ input }) => input.sourceQuality)
      .filter((value): value is string => Boolean(value))
  );

  return QUALITY_ORDER.filter((quality) => found.has(quality));
});

const filteredInputs = computed(() => {
  const query = inputSearch.value.trim().toLowerCase();

  return sortedInputs.value.filter(({ input }) => {
    if (featuredOnly.value && !input.featured) {
      return false;
    }

    if (selectedSourceQuality.value !== 'All' && input.sourceQuality !== selectedSourceQuality.value) {
      return false;
    }

    if (selectedInputType.value !== 'All' && input.variable_type !== selectedInputType.value) {
      return false;
    }

    if (!query) {
      return true;
    }

    const searchIndex = [
      input.title,
      input.variable_name,
      input.summary,
      input.importanceReason,
      input.sourceName,
      input.sourceNote,
      input.entity ? formatLabel(input.entity) : '',
      input.variable_type ? formatLabel(input.variable_type) : '',
      ...(input.usedIn ?? []).map((scenario) => scenario.title),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return searchIndex.includes(query);
  });
});

const changedInputKeys = computed(() => {
  return Object.entries(inputs.value)
    .filter(([, input]) => input.value !== input.default_value)
    .map(([key]) => key)
    .sort();
});

const changedInputState = computed(() => {
  return changedInputKeys.value.map((key) => `${key}:${formatInputFieldValue(inputs.value[key])}`);
});

const changedFillState = computed(() => {
  return Object.entries(fillSelections.value)
    .filter(([key, value]) => value !== key)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${value}`);
});

const calcDetailsState = computed(() => {
  return scenariosData.value
    .filter((scenario) => scenario.showCalcDetails)
    .map((scenario) => scenario.id)
    .sort();
});

const hasNonDefaultFills = computed(() => changedFillState.value.length > 0);
const freeScenarioEvaluation = computed(() => evaluateMathExpression(freeScenario.value.expression, inputs.value));
const freeScenarioReferencedInputKeys = computed(() => {
  return freeScenarioEvaluation.value.usedVariables.filter((key) => Boolean(inputs.value[key]));
});
const freeScenarioState = computed(() => [
  freeScenario.value.title,
  freeScenario.value.expression,
  freeScenario.value.resultLabel,
  freeScenario.value.resultUnits,
  freeScenario.value.showCalcDetails ? '1' : '0',
].join('|'));

function normalizeFieldNumber(value: number): string {
  if (!Number.isFinite(value)) return '';

  if (value === 0) {
    return '0';
  }

  const abs = Math.abs(value);
  if (abs >= 1_000_000 || abs < 0.0001) {
    return value.toExponential(4).replace(/\.?0+e/, 'e');
  }

  return Number(value.toFixed(6)).toString();
}

function formatInputFieldValue(input?: Input | null): string {
  if (!input) return '';
  return normalizeFieldNumber(formatValue(input.value, input.scale));
}

function getFieldValue(key: string): string {
  if (key in inputDrafts.value) {
    return inputDrafts.value[key];
  }

  return formatInputFieldValue(inputs.value[key]);
}

function getInputStep(input?: Input | null): number | undefined {
  return input?.step;
}

function formatSourceQuality(sourceQuality?: string | null) {
  if (!sourceQuality) return 'Unlabeled';

  const labels: Record<string, string> = {
    official: 'Official',
    primary: 'Primary',
    reported: 'Reported',
    industry: 'Industry',
    heuristic: 'Heuristic',
    assumption: 'Assumption',
  };

  return labels[sourceQuality] || formatLabel(sourceQuality);
}

function formatConfidence(confidence?: number | null): string {
  if (confidence === null || confidence === undefined) {
    return 'Confidence unlabeled';
  }

  return `${Math.round(confidence * 100)}% confidence`;
}

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}

function isInputChanged(key: string) {
  return Boolean(inputs.value[key] && inputs.value[key].value !== inputs.value[key].default_value);
}

function isAlternateFillSelected(variable: string) {
  return (fillSelections.value[variable] || variable) !== variable;
}

function initializeFillSelections() {
  fillSelections.value = Object.keys(inputs.value).reduce((acc, key) => {
    acc[key] = key;
    return acc;
  }, {} as Record<string, string>);
}

function ensureFreeScenarioInputPicker() {
  if (!freeScenarioInputPicker.value && sortedInputs.value.length) {
    freeScenarioInputPicker.value = sortedInputs.value[0].key;
  }
}

function logChange(key: string, newValue: number) {
  if (!logs.value[key]) {
    logs.value[key] = [];
  }

  const timestamp = new Date().toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  });

  logs.value[key].push({ time: timestamp, value: newValue });

  if (logs.value[key].length > 20) {
    logs.value[key] = logs.value[key].slice(-20);
  }
}

function recalculate() {
  scenariosData.value = updateCalculations(scenariosData.value, inputs.value);
}

function beginEditingValue(key: string) {
  const input = inputs.value[key];
  if (!input) return;

  inputDrafts.value[key] = formatInputFieldValue(input);
}

function updateDraftValue(key: string, value: string) {
  inputDrafts.value[key] = value;
}

function clearDraftValue(key: string) {
  delete inputDrafts.value[key];
}

function commitDraftValue(key: string) {
  const input = inputs.value[key];
  if (!input) return;

  const draft = inputDrafts.value[key];
  if (draft === undefined) return;

  const trimmed = draft.trim();
  if (!trimmed) {
    clearDraftValue(key);
    return;
  }

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    inputDrafts.value[key] = formatInputFieldValue(input);
    return;
  }

  clearDraftValue(key);
  const nextValue = parsed * (input.scale || 1);

  if (input.value !== nextValue) {
    input.value = nextValue;
    logChange(key, nextValue);
    recalculate();
  }
}

function handleValueKeydown(key: string, event: KeyboardEvent) {
  const target = event.target as HTMLInputElement;

  if (event.key === 'Enter') {
    commitDraftValue(key);
    target.blur();
  }

  if (event.key === 'Escape') {
    clearDraftValue(key);
    target.blur();
  }
}

function adjustValue(key: string, factor: number) {
  const input = inputs.value[key];
  if (!input) return;

  const nextValue = input.value * factor;
  clearDraftValue(key);
  input.value = nextValue;
  logChange(key, nextValue);
  recalculate();
}

function resetValue(key: string) {
  const input = inputs.value[key];
  if (!input) return;

  clearDraftValue(key);
  input.value = input.default_value;
  logChange(key, input.default_value);
  recalculate();
}

function resetAllInputs() {
  Object.values(inputs.value).forEach((input) => {
    input.value = input.default_value;
  });

  initializeFillSelections();
  inputDrafts.value = {};
  logs.value = {};
  scenariosData.value.forEach((scenario) => {
    scenario.showCalcDetails = false;
  });
  applyCardVariantChange();
}

async function insertIntoFreeScenarioExpression(snippet: string) {
  const textarea = freeScenarioExpressionField.value;
  const currentExpression = freeScenario.value.expression;

  if (!textarea) {
    freeScenario.value.expression += snippet;
    return;
  }

  const start = textarea.selectionStart ?? currentExpression.length;
  const end = textarea.selectionEnd ?? currentExpression.length;
  freeScenario.value.expression =
    `${currentExpression.slice(0, start)}${snippet}${currentExpression.slice(end)}`;

  const cursorTarget = snippet === '()' ? start + 1 : start + snippet.length;
  await nextTick();
  textarea.focus();
  textarea.setSelectionRange(cursorTarget, cursorTarget);
}

function insertSelectedFreeScenarioInput() {
  if (!freeScenarioInputPicker.value) return;
  void insertIntoFreeScenarioExpression(`{${freeScenarioInputPicker.value}}`);
}

function resetFreeScenario() {
  freeScenario.value = { ...FREE_SCENARIO_DEFAULTS };
}

function showDetails(key: string) {
  if (!inputs.value[key]) return;

  selectedInputKey.value = key;
  rightPanelOpen.value = true;
}

function closeInspector() {
  rightPanelOpen.value = false;
}

function setActiveView(view: ViewMode) {
  if (!props.showInputLibrary && view === 'inputs') {
    return;
  }

  activeView.value = view;
}

function toggleCategory(category: string) {
  selectedScenario.value = category;
}

function isCompatibleFill(variable: string, replacement: string) {
  const source = inputs.value[variable];
  const target = inputs.value[replacement];

  return Boolean(source && target && source.variable_type === target.variable_type);
}

function onVariableChange(variable: string, value: string) {
  if (!isCompatibleFill(variable, value)) return;

  fillSelections.value[variable] = value;
  applyCardVariantChange();
}

function applyCardVariantChange() {
  scenariosData.value.forEach((scenario) => {
    scenario.inputs = scenario.input_variables.map((key) => {
      const replacement = fillSelections.value[key];
      return replacement && isCompatibleFill(key, replacement) ? replacement : key;
    });
  });

  recalculate();
}

function parseDescription(desc: string) {
  const segments: { type: 'text' | 'variable'; text?: string; variable?: string }[] = [];
  let lastIndex = 0;
  const regex = /\{([a-z0-9_]+)\}/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(desc)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', text: desc.slice(lastIndex, match.index) });
    }

    const variable = match[1];
    if (inputs.value[variable]) {
      segments.push({ type: 'variable', variable });
    } else {
      segments.push({ type: 'text', text: match[0] });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < desc.length) {
    segments.push({ type: 'text', text: desc.slice(lastIndex) });
  }

  return segments;
}

function getFillOptions(variable: string) {
  const input = inputs.value[variable];
  if (!input) return [];

  const sameType = inputsByType.value[input.variable_type] ?? [];

  return [...sameType]
    .sort((a, b) => {
      const rankA = a.importanceRank ?? Number.MAX_SAFE_INTEGER;
      const rankB = b.importanceRank ?? Number.MAX_SAFE_INTEGER;

      if (rankA !== rankB) {
        return rankA - rankB;
      }

      return a.title.localeCompare(b.title);
    })
    .map((option) => ({
      variable: option.variable_name,
      text: `${option.title || formatLabel(option.variable_name)} (${formatInputFieldValue(option)} ${option.display_units})`,
    }));
}

function resetInputFilters() {
  inputSearch.value = '';
  selectedSourceQuality.value = 'All';
  selectedInputType.value = 'All';
  featuredOnly.value = false;
}

async function jumpToScenario(scenarioId: string, category?: string) {
  activeView.value = 'scenarios';
  selectedScenario.value = category && uniqueCategories.value.includes(category) ? category : 'All';
  await nextTick();
  document.getElementById(`scenario-${scenarioId}`)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

function serializeEntries(entries: [string, string][]) {
  return entries
    .map(([key, value]) => `${encodeURIComponent(key)}:${encodeURIComponent(value)}`)
    .join(',');
}

function parseEntries(serialized: string | null) {
  const result: Record<string, string> = {};
  if (!serialized) return result;

  serialized.split(',').forEach((entry) => {
    if (!entry) return;
    const separator = entry.indexOf(':');
    if (separator === -1) return;

    const key = decodeURIComponent(entry.slice(0, separator));
    const value = decodeURIComponent(entry.slice(separator + 1));
    result[key] = value;
  });

  return result;
}

function syncUrlState() {
  if (!hasMounted.value || isApplyingUrlState.value) return;

  const params = new URLSearchParams();

  if (props.showInputLibrary && activeView.value !== 'scenarios') {
    params.set('view', activeView.value);
  }

  if (selectedScenario.value !== 'All') {
    params.set('category', selectedScenario.value);
  }

  if (rightPanelOpen.value && selectedInputKey.value) {
    params.set('inspect', selectedInputKey.value);
  }

  if (props.showInputLibrary && inputSearch.value.trim()) {
    params.set('q', inputSearch.value.trim());
  }

  if (props.showInputLibrary && selectedSourceQuality.value !== 'All') {
    params.set('quality', selectedSourceQuality.value);
  }

  if (props.showInputLibrary && selectedInputType.value !== 'All') {
    params.set('type', selectedInputType.value);
  }

  if (props.showInputLibrary && featuredOnly.value) {
    params.set('featured', '1');
  }

  if (changedInputKeys.value.length) {
    params.set(
      'values',
      serializeEntries(
        changedInputKeys.value.map((key) => [key, formatInputFieldValue(inputs.value[key])])
      )
    );
  }

  if (hasNonDefaultFills.value) {
    params.set(
      'fills',
      serializeEntries(
        Object.entries(fillSelections.value).filter(([key, value]) => key !== value)
      )
    );
  }

  if (calcDetailsState.value.length) {
    params.set('details', calcDetailsState.value.join(','));
  }

  if (freeScenario.value.expression.trim()) {
    params.set('custom_expr', freeScenario.value.expression);
  }

  if (freeScenario.value.title !== FREE_SCENARIO_DEFAULTS.title) {
    params.set('custom_title', freeScenario.value.title);
  }

  if (freeScenario.value.resultLabel !== FREE_SCENARIO_DEFAULTS.resultLabel) {
    params.set('custom_label', freeScenario.value.resultLabel);
  }

  if (freeScenario.value.resultUnits !== FREE_SCENARIO_DEFAULTS.resultUnits) {
    params.set('custom_units', freeScenario.value.resultUnits);
  }

  if (freeScenario.value.showCalcDetails) {
    params.set('custom_details', '1');
  }

  const nextUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
  window.history.replaceState({}, '', nextUrl);
}

function applyUrlStateFromLocation() {
  isApplyingUrlState.value = true;

  try {
    const params = new URLSearchParams(window.location.search);

    activeView.value = props.showInputLibrary && params.get('view') === 'inputs' ? 'inputs' : 'scenarios';

    const category = params.get('category');
    selectedScenario.value = category && uniqueCategories.value.includes(category) ? category : 'All';

    inputSearch.value = props.showInputLibrary ? (params.get('q') ?? '') : '';
    selectedSourceQuality.value = props.showInputLibrary && sourceQualityOptions.value.includes(params.get('quality') ?? '')
      ? (params.get('quality') as string)
      : 'All';
    selectedInputType.value = props.showInputLibrary && inputTypeOptions.value.includes(params.get('type') ?? '')
      ? (params.get('type') as string)
      : 'All';
    featuredOnly.value = props.showInputLibrary && params.get('featured') === '1';
    freeScenario.value = {
      title: params.get('custom_title') ?? FREE_SCENARIO_DEFAULTS.title,
      expression: params.get('custom_expr') ?? FREE_SCENARIO_DEFAULTS.expression,
      resultLabel: params.get('custom_label') ?? FREE_SCENARIO_DEFAULTS.resultLabel,
      resultUnits: params.get('custom_units') ?? FREE_SCENARIO_DEFAULTS.resultUnits,
      showCalcDetails: params.get('custom_details') === '1',
    };

    initializeFillSelections();
    const fillState = parseEntries(params.get('fills'));
    Object.entries(fillState).forEach(([key, value]) => {
      if (isCompatibleFill(key, value)) {
        fillSelections.value[key] = value;
      }
    });
    applyCardVariantChange();

    const valueState = parseEntries(params.get('values'));
    Object.entries(valueState).forEach(([key, value]) => {
      const input = inputs.value[key];
      const parsed = Number(value);

      if (input && Number.isFinite(parsed)) {
        input.value = parsed * (input.scale || 1);
      }
    });

    const openDetails = new Set((params.get('details') ?? '').split(',').filter(Boolean));
    scenariosData.value.forEach((scenario) => {
      scenario.showCalcDetails = openDetails.has(scenario.id);
    });

    const inspect = params.get('inspect');
    if (inspect && inputs.value[inspect]) {
      selectedInputKey.value = inspect;
      rightPanelOpen.value = true;
    } else {
      selectedInputKey.value = null;
      rightPanelOpen.value = false;
    }

    recalculate();
    ensureFreeScenarioInputPicker();
  } finally {
    isApplyingUrlState.value = false;
  }
}

async function copyShareLink() {
  syncUrlState();

  try {
    await navigator.clipboard.writeText(window.location.href);
    shareButtonLabel.value = 'Link Copied';
  } catch {
    shareButtonLabel.value = 'Copy Failed';
  }

  if (shareResetTimeout) {
    clearTimeout(shareResetTimeout);
  }

  shareResetTimeout = window.setTimeout(() => {
    shareButtonLabel.value = 'Copy Share Link';
  }, 1800);
}

function handlePopState() {
  applyUrlStateFromLocation();
}

watch(
  [
    activeView,
    selectedScenario,
    selectedInputKey,
    rightPanelOpen,
    inputSearch,
    selectedSourceQuality,
    selectedInputType,
    featuredOnly,
    changedInputState,
    changedFillState,
    calcDetailsState,
    freeScenarioState,
  ],
  () => {
    syncUrlState();
  },
  { deep: true }
);

onMounted(() => {
  inputs.value = JSON.parse(JSON.stringify(props.initialInputs));
  scenariosData.value = JSON.parse(JSON.stringify(props.initialScenarios));

  ensureFreeScenarioInputPicker();
  initializeFillSelections();

  scenariosData.value.forEach((scenario) => {
    scenario.calculate = createCalculationFunction(scenario);
  });

  applyUrlStateFromLocation();
  recalculate();
  hasMounted.value = true;
  syncUrlState();
  window.addEventListener('popstate', handlePopState);
});

onBeforeUnmount(() => {
  window.removeEventListener('popstate', handlePopState);

  if (shareResetTimeout) {
    clearTimeout(shareResetTimeout);
  }
});
</script>

<template>
  <div id="app">
    <div v-if="rightPanelOpen" class="drawer-backdrop" @click="closeInspector"></div>

    <div class="app-layout">
      <main class="main-content">
        <header v-if="props.showHeader" id="headerContent" class="page-header">
          <p class="eyebrow">Interactive calculator</p>
          <h1>Napkin Math for Training Data Value</h1>
          <p>
            Napkin math, back-of-the-envelope estimates, and ballpark figures: this interactive page
            explores order-of-magnitude estimates for important data value questions. How will the
            proceeds and benefits of AI be distributed?
          </p>
        </header>

        <section class="page-toolbar" aria-label="Page controls">
          <div class="page-toolbar-top" :class="{ 'single-view': !props.showInputLibrary }">
            <div
              v-if="props.showInputLibrary"
              class="view-tabs"
              role="tablist"
              aria-label="Main views"
            >
              <button
                class="view-tab"
                :class="{ active: activeView === 'scenarios' }"
                :aria-selected="activeView === 'scenarios'"
                role="tab"
                type="button"
                @click="setActiveView('scenarios')"
              >
                Scenarios
              </button>
              <button
                class="view-tab"
                :class="{ active: activeView === 'inputs' }"
                :aria-selected="activeView === 'inputs'"
                role="tab"
                type="button"
                @click="setActiveView('inputs')"
              >
                Inputs Library
              </button>
            </div>

            <div class="toolbar-actions">
              <button
                class="btn btn-outline-secondary btn-sm"
                type="button"
                :disabled="!changedInputKeys.length && !hasNonDefaultFills"
                @click="resetAllInputs"
              >
                Reset Assumptions
              </button>
              <button
                class="btn btn-outline-primary btn-sm"
                type="button"
                @click="rightPanelOpen = !rightPanelOpen"
              >
                {{ rightPanelOpen ? 'Hide' : 'Show' }} Inspector
              </button>
              <button class="btn btn-primary btn-sm" type="button" @click="copyShareLink">
                {{ shareButtonLabel }}
              </button>
            </div>
          </div>

          <div v-if="activeView === 'scenarios' || !props.showInputLibrary" class="page-toolbar-bottom">
            <p class="toolbar-note">
              <strong>{{ filteredScenarios.length }}</strong>
              curated {{ pluralize(filteredScenarios.length, 'scenario') }} shown, plus one free scenario builder.
              Inputs are shared across cards, so one edit updates every calculation that uses that variable.
            </p>

            <div class="chip-row">
              <button
                v-for="category in uniqueCategories"
                :key="category"
                class="category-chip"
                :class="{ active: selectedScenario === category }"
                type="button"
                @click="toggleCategory(category)"
              >
                {{ category }}
              </button>
            </div>
          </div>

          <div v-else class="library-toolbar">
            <label class="search-field">
              <span class="visually-hidden">Search inputs</span>
              <input
                v-model="inputSearch"
                class="form-control form-control-sm"
                type="search"
                placeholder="Search by title, source, scenario, or variable"
              />
            </label>

            <select v-model="selectedInputType" class="form-select form-select-sm">
              <option value="All">All types</option>
              <option v-for="type in inputTypeOptions" :key="type" :value="type">
                {{ formatLabel(type) }}
              </option>
            </select>

            <select v-model="selectedSourceQuality" class="form-select form-select-sm">
              <option value="All">All source quality</option>
              <option v-for="quality in sourceQualityOptions" :key="quality" :value="quality">
                {{ formatSourceQuality(quality) }}
              </option>
            </select>

            <label class="toggle-chip">
              <input v-model="featuredOnly" type="checkbox" />
              Featured only
            </label>

            <button class="btn btn-outline-secondary btn-sm" type="button" @click="resetInputFilters">
              Reset filters
            </button>

            <p class="toolbar-note">
              Showing {{ filteredInputs.length }} of {{ sortedInputs.length }}
              {{ pluralize(sortedInputs.length, 'input') }}.
            </p>
          </div>
        </section>

        <section v-if="activeView === 'scenarios' || !props.showInputLibrary" id="napkinMath">
          <h2 class="section-title">Scenarios</h2>
          <p class="section-description">
            Change the assumptions directly on each card. Inline comparison menus let you swap in
            related public benchmarks without leaving the page.
          </p>

          <div class="scenarios-container">
            <article id="scenario-freeform" class="scenario-card free-scenario-card">
              <div class="scenario-card-header free-scenario-header">
                <div class="scenario-intro">
                  <div class="scenario-category-label">Free exploration</div>
                  <h3>{{ freeScenario.title || FREE_SCENARIO_DEFAULTS.title }}</h3>
                  <p class="scenario-description-text">
                    Build any formula from the shared input library. Use the inserter below for input tokens,
                    then combine them with numbers, operators, and parentheses.
                  </p>

                  <div class="free-scenario-metadata">
                    <label class="free-scenario-field">
                      <span>Card title</span>
                      <input
                        v-model="freeScenario.title"
                        class="form-control form-control-sm"
                        type="text"
                        placeholder="Free Scenario Builder"
                      />
                    </label>

                    <label class="free-scenario-field">
                      <span>Result label</span>
                      <input
                        v-model="freeScenario.resultLabel"
                        class="form-control form-control-sm"
                        type="text"
                        placeholder="Custom result"
                      />
                    </label>

                    <label class="free-scenario-field">
                      <span>Units</span>
                      <input
                        v-model="freeScenario.resultUnits"
                        class="form-control form-control-sm"
                        type="text"
                        placeholder="context-dependent units"
                      />
                    </label>
                  </div>
                </div>

                <div class="scenario-result-panel" :class="{ 'scenario-result-panel-error': freeScenarioEvaluation.error }">
                  <span class="result-label">{{ freeScenario.resultLabel || FREE_SCENARIO_DEFAULTS.resultLabel }}</span>
                  <div class="result-output" :class="{ 'result-output-error': freeScenarioEvaluation.error }">
                    {{ freeScenarioEvaluation.error ? 'Check formula' : humanReadable(freeScenarioEvaluation.rawValue) }}
                  </div>
                  <div class="result-units">
                    {{ freeScenario.resultUnits || FREE_SCENARIO_DEFAULTS.resultUnits }}
                  </div>
                  <p class="free-scenario-result-note" :class="{ error: freeScenarioEvaluation.error }">
                    <template v-if="freeScenarioEvaluation.error">
                      {{ freeScenarioEvaluation.error }}
                    </template>
                    <template v-else-if="freeScenarioReferencedInputKeys.length">
                      Using {{ freeScenarioReferencedInputKeys.length }}
                      shared {{ pluralize(freeScenarioReferencedInputKeys.length, 'input') }}.
                    </template>
                    <template v-else>
                      Add input tokens to pull shared assumptions into this custom calculation.
                    </template>
                  </p>
                </div>
              </div>

              <div class="free-scenario-builder">
                <div class="free-scenario-toolbar">
                  <label class="free-scenario-picker">
                    <span>Insert input token</span>
                    <select v-model="freeScenarioInputPicker" class="form-select form-select-sm">
                      <option
                        v-for="entry in sortedInputs"
                        :key="entry.key"
                        :value="entry.key"
                      >
                        {{ entry.input.title || formatLabel(entry.key) }} ({{ entry.input.display_units }})
                      </option>
                    </select>
                  </label>

                  <button class="btn btn-outline-primary btn-sm" type="button" @click="insertSelectedFreeScenarioInput">
                    Insert input
                  </button>
                  <button class="btn btn-outline-secondary btn-sm" type="button" @click="resetFreeScenario">
                    Reset card
                  </button>
                </div>

                <div class="free-scenario-operator-row">
                  <button
                    v-for="snippet in FREE_SCENARIO_SNIPPETS"
                    :key="snippet.label"
                    class="operator-chip"
                    type="button"
                    @click="insertIntoFreeScenarioExpression(snippet.value)"
                  >
                    {{ snippet.label }}
                  </button>
                </div>

                <label class="free-scenario-formula-field">
                  <span>Formula</span>
                  <textarea
                    ref="freeScenarioExpressionField"
                    v-model="freeScenario.expression"
                    class="form-control free-scenario-textarea"
                    rows="4"
                    placeholder="Example: ({yearly_revenue__openai__dollars} / {group_size__world__people}) * 0.1"
                  ></textarea>
                </label>

                <p class="free-scenario-helper">
                  Supported syntax: numbers, parentheses, and <code>+</code>, <code>-</code>, <code>*</code>,
                  <code>/</code>, <code>^</code>. Input tokens use curly braces, like
                  <code>{{ '{yearly_revenue__openai__dollars}' }}</code>.
                </p>
              </div>

              <div v-if="freeScenarioReferencedInputKeys.length" class="scenario-input-grid">
                <div
                  v-for="inputKey in freeScenarioReferencedInputKeys"
                  :key="inputKey"
                  class="scenario-input-card"
                  :class="{ changed: isInputChanged(inputKey) }"
                >
                  <div class="scenario-input-header">
                    <div>
                      <h4>{{ inputs[inputKey]?.title || formatLabel(inputKey) }}</h4>
                      <p class="scenario-input-summary">
                        {{ inputs[inputKey]?.summary || inputs[inputKey]?.importanceReason }}
                      </p>
                    </div>

                    <div class="scenario-input-badges">
                      <span class="input-quality-badge">
                        {{ formatSourceQuality(inputs[inputKey]?.sourceQuality) }}
                      </span>
                      <span v-if="isInputChanged(inputKey)" class="changed-badge">Modified</span>
                    </div>
                  </div>

                  <label class="scenario-input-label">
                    {{ inputs[inputKey]?.display_units }}
                  </label>

                  <InputComparisonFigure
                    v-if="inputs[inputKey]?.comparisonImage"
                    :comparison-image="inputs[inputKey]?.comparisonImage"
                  />

                  <div class="scenario-input-controls">
                    <input
                      type="number"
                      class="form-control"
                      :value="getFieldValue(inputKey)"
                      :step="getInputStep(inputs[inputKey])"
                      :min="inputs[inputKey]?.min ?? undefined"
                      :max="inputs[inputKey]?.max ?? undefined"
                      @focus="beginEditingValue(inputKey)"
                      @input="updateDraftValue(inputKey, ($event.target as HTMLInputElement).value)"
                      @blur="commitDraftValue(inputKey)"
                      @keydown="handleValueKeydown(inputKey, $event)"
                    />
                    <button class="btn btn-outline-secondary" type="button" @click="adjustValue(inputKey, 0.1)">
                      x0.1
                    </button>
                    <button class="btn btn-outline-secondary" type="button" @click="adjustValue(inputKey, 10)">
                      x10
                    </button>
                    <button
                      class="btn btn-outline-secondary"
                      type="button"
                      :disabled="!isInputChanged(inputKey)"
                      @click="resetValue(inputKey)"
                    >
                      Reset
                    </button>
                    <button class="btn btn-secondary" type="button" @click="showDetails(inputKey)">
                      Inspect
                    </button>
                  </div>

                  <div class="scenario-input-footer">
                    <span v-if="inputs[inputKey]?.usedIn?.length" class="input-usage">
                      Used in {{ inputs[inputKey]?.usedIn?.length }}
                      {{ pluralize(inputs[inputKey]?.usedIn?.length || 0, 'scenario') }}
                    </span>
                    <span v-if="inputs[inputKey]?.confidence !== undefined" class="confidence-text">
                      {{ formatConfidence(inputs[inputKey]?.confidence) }}
                    </span>
                  </div>
                </div>
              </div>

              <div v-else class="free-scenario-empty-state">
                Referenced inputs will appear here once your formula includes one or more shared input tokens.
              </div>

              <div class="scenario-card-footer">
                <button
                  class="btn btn-outline-info btn-sm"
                  type="button"
                  @click="freeScenario.showCalcDetails = !freeScenario.showCalcDetails"
                >
                  {{ freeScenario.showCalcDetails ? 'Hide' : 'Show' }} Calculation Details
                </button>
              </div>

              <div v-if="freeScenario.showCalcDetails" class="calc-details">
                <h4>Calculation Details</h4>
                <div class="operation-description">
                  <strong>Formula</strong>
                  <pre class="formula-preview">{{ freeScenario.expression.trim() || 'No formula yet' }}</pre>
                </div>
                <div v-if="freeScenarioReferencedInputKeys.length" class="calculation-inputs">
                  <strong>Current inputs</strong>
                  <ul class="list-unstyled">
                    <li v-for="inputKey in freeScenarioReferencedInputKeys" :key="inputKey">
                      {{ inputs[inputKey]?.title || formatLabel(inputKey) }}:
                      <span class="text-primary">
                        {{ formatInputFieldValue(inputs[inputKey]) }} {{ inputs[inputKey]?.display_units }}
                      </span>
                    </li>
                  </ul>
                </div>
                <div>
                  <strong>Result</strong>
                  <span class="text-primary">
                    {{
                      freeScenarioEvaluation.error
                        ? freeScenarioEvaluation.error
                        : `${humanReadable(freeScenarioEvaluation.rawValue)} ${freeScenario.resultUnits || FREE_SCENARIO_DEFAULTS.resultUnits}`
                    }}
                  </span>
                </div>
              </div>
            </article>

            <article
              v-for="scenario in filteredScenarios"
              :id="`scenario-${scenario.id}`"
              :key="scenario.id"
              class="scenario-card"
            >
              <div class="scenario-card-header">
                <div class="scenario-intro">
                  <div class="scenario-category-label">{{ scenario.category }}</div>
                  <h3>{{ scenario.title }}</h3>
                  <p class="scenario-description-text">
                    <template v-for="(segment, idx) in parseDescription(scenario.description)" :key="idx">
                      <template v-if="segment.type === 'text'">{{ segment.text }}</template>
                      <template v-else>
                        <span
                          class="inline-select-shell"
                          :class="{ changed: isAlternateFillSelected(segment.variable!) }"
                        >
                          <select
                            class="inline-select"
                            :value="fillSelections[segment.variable!] || segment.variable"
                            @change="onVariableChange(segment.variable!, ($event.target as HTMLSelectElement).value)"
                          >
                            <option
                              v-for="option in getFillOptions(segment.variable!)"
                              :key="option.variable"
                              :value="option.variable"
                            >
                              {{ option.text }}
                            </option>
                          </select>
                        </span>
                      </template>
                    </template>
                  </p>
                </div>

                <div class="scenario-result-panel">
                  <span class="result-label">{{ scenario.result_label }}</span>
                  <div class="result-output">{{ scenario.result.value }}</div>
                  <div class="result-units">{{ scenario.result.units }}</div>
                </div>
              </div>

              <div class="scenario-input-grid">
                <div
                  v-for="inputKey in scenario.inputs"
                  :key="inputKey"
                  class="scenario-input-card"
                  :class="{ changed: isInputChanged(inputKey) }"
                >
                  <div class="scenario-input-header">
                    <div>
                      <h4>{{ inputs[inputKey]?.title || formatLabel(inputKey) }}</h4>
                      <p class="scenario-input-summary">
                        {{ inputs[inputKey]?.summary || inputs[inputKey]?.importanceReason }}
                      </p>
                    </div>

                    <div class="scenario-input-badges">
                      <span class="input-quality-badge">
                        {{ formatSourceQuality(inputs[inputKey]?.sourceQuality) }}
                      </span>
                      <span v-if="isInputChanged(inputKey)" class="changed-badge">Modified</span>
                    </div>
                  </div>

                  <label class="scenario-input-label">
                    {{ inputs[inputKey]?.display_units }}
                  </label>

                  <InputComparisonFigure
                    v-if="inputs[inputKey]?.comparisonImage"
                    :comparison-image="inputs[inputKey]?.comparisonImage"
                  />

                  <div class="scenario-input-controls">
                    <input
                      type="number"
                      class="form-control"
                      :value="getFieldValue(inputKey)"
                      :step="getInputStep(inputs[inputKey])"
                      :min="inputs[inputKey]?.min ?? undefined"
                      :max="inputs[inputKey]?.max ?? undefined"
                      @focus="beginEditingValue(inputKey)"
                      @input="updateDraftValue(inputKey, ($event.target as HTMLInputElement).value)"
                      @blur="commitDraftValue(inputKey)"
                      @keydown="handleValueKeydown(inputKey, $event)"
                    />
                    <button class="btn btn-outline-secondary" type="button" @click="adjustValue(inputKey, 0.1)">
                      x0.1
                    </button>
                    <button class="btn btn-outline-secondary" type="button" @click="adjustValue(inputKey, 10)">
                      x10
                    </button>
                    <button
                      class="btn btn-outline-secondary"
                      type="button"
                      :disabled="!isInputChanged(inputKey)"
                      @click="resetValue(inputKey)"
                    >
                      Reset
                    </button>
                    <button class="btn btn-secondary" type="button" @click="showDetails(inputKey)">
                      Inspect
                    </button>
                  </div>

                  <div class="scenario-input-footer">
                    <span v-if="inputs[inputKey]?.usedIn?.length" class="input-usage">
                      Used in {{ inputs[inputKey]?.usedIn?.length }}
                      {{ pluralize(inputs[inputKey]?.usedIn?.length || 0, 'scenario') }}
                    </span>
                    <span v-if="inputs[inputKey]?.confidence !== undefined" class="confidence-text">
                      {{ formatConfidence(inputs[inputKey]?.confidence) }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="scenario-card-footer">
                <button
                  class="btn btn-outline-info btn-sm"
                  type="button"
                  @click="scenario.showCalcDetails = !scenario.showCalcDetails"
                >
                  {{ scenario.showCalcDetails ? 'Hide' : 'Show' }} Calculation Details
                </button>
              </div>

              <div v-if="scenario.showCalcDetails" class="calc-details">
                <h4>Calculation Details</h4>
                <div class="operation-description">
                  <strong>Operation</strong>
                  <span>{{ formatOperation(scenario.operations, inputs) }}</span>
                </div>
                <div class="calculation-inputs">
                  <strong>Current inputs</strong>
                  <ul class="list-unstyled">
                    <li v-for="inputKey in scenario.inputs" :key="inputKey">
                      {{ inputs[inputKey]?.title || formatLabel(inputKey) }}:
                      <span class="text-primary">
                        {{ formatInputFieldValue(inputs[inputKey]) }} {{ inputs[inputKey]?.display_units }}
                      </span>
                    </li>
                  </ul>
                </div>
                <div>
                  <strong>Result</strong>
                  <span class="text-primary">{{ humanReadable(scenario.result.rawValue) }} {{ scenario.result.units }}</span>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section v-else-if="props.showInputLibrary" id="inputLibrary">
          <h2 class="section-title">Inputs Library</h2>
          <p class="section-description">
            Search, filter, and edit the shared assumptions. Each change immediately updates every
            scenario that depends on that input.
          </p>

          <div v-if="filteredInputs.length" class="inputs-library">
            <article
              v-for="entry in filteredInputs"
              :key="entry.key"
              class="input-library-card"
              :class="{ featured: entry.input.featured }"
            >
              <div class="input-library-header">
                <div class="input-rank">
                  <span class="input-rank-number">#{{ entry.input.importanceRank || '-' }}</span>
                  <span class="input-rank-label">Importance</span>
                </div>

                <div class="input-library-badges">
                  <span class="input-quality-badge">
                    {{ formatSourceQuality(entry.input.sourceQuality) }}
                  </span>
                  <span v-if="entry.input.featured" class="featured-badge">Featured</span>
                </div>
              </div>

              <h3>{{ entry.input.title || formatLabel(entry.key) }}</h3>
              <p class="input-library-summary">
                {{ entry.input.summary || entry.input.importanceReason }}
              </p>

              <InputComparisonFigure
                v-if="entry.input.comparisonImage"
                :comparison-image="entry.input.comparisonImage"
              />

              <div class="input-library-value-row">
                <input
                  type="number"
                  class="form-control"
                  :value="getFieldValue(entry.key)"
                  :step="getInputStep(entry.input)"
                  :min="entry.input.min ?? undefined"
                  :max="entry.input.max ?? undefined"
                  @focus="beginEditingValue(entry.key)"
                  @input="updateDraftValue(entry.key, ($event.target as HTMLInputElement).value)"
                  @blur="commitDraftValue(entry.key)"
                  @keydown="handleValueKeydown(entry.key, $event)"
                />
                <span class="input-library-units">{{ entry.input.display_units }}</span>
              </div>

              <div class="input-library-quick-actions">
                <button class="btn btn-outline-secondary btn-sm" type="button" @click="adjustValue(entry.key, 0.1)">
                  x0.1
                </button>
                <button class="btn btn-outline-secondary btn-sm" type="button" @click="adjustValue(entry.key, 10)">
                  x10
                </button>
                <button
                  class="btn btn-outline-secondary btn-sm"
                  type="button"
                  :disabled="!isInputChanged(entry.key)"
                  @click="resetValue(entry.key)"
                >
                  Reset
                </button>
                <button class="btn btn-outline-primary btn-sm" type="button" @click="showDetails(entry.key)">
                  Inspect
                </button>
                <a
                  v-if="entry.input.source_url"
                  class="btn btn-outline-secondary btn-sm"
                  :href="entry.input.source_url"
                  target="_blank"
                  rel="noreferrer"
                >
                  Source
                </a>
              </div>

              <div class="input-library-meta">
                <span>{{ formatLabel(entry.input.variable_type) }}</span>
                <span v-if="entry.input.entity">{{ formatLabel(entry.input.entity) }}</span>
                <span v-if="entry.input.confidence !== undefined">{{ formatConfidence(entry.input.confidence) }}</span>
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
                  @click="jumpToScenario(scenario.id, scenario.category)"
                >
                  {{ scenario.title }}
                </button>
              </div>
            </article>
          </div>

          <div v-else class="empty-state">
            No inputs match these filters. Try broadening the search or resetting the filters.
          </div>
        </section>

        <section v-if="props.showAbout" id="aboutContent" class="about-section">
          <details open>
            <summary>About this page</summary>
            <div class="about-content">
              <p>
                <strong>This website is still evolving.</strong> The goal is to make public debates about
                training data legible through transparent assumptions and easy-to-share napkin math.
              </p>
              <p>
                The calculations are intentionally simple. What matters most is helping readers inspect the
                assumptions, compare alternate reference points, and see how much each estimate depends on a
                small set of shared inputs.
              </p>
              <p>
                To participate in the discussion about better defaults or additional scenarios, visit the
                <a href="https://github.com/nickmvincent/exploringai" target="_blank" rel="noreferrer">GitHub repository</a>.
              </p>
            </div>
          </details>
        </section>
      </main>

      <aside class="inspector-drawer" :class="{ open: rightPanelOpen }">
        <div class="inspector-shell">
          <div class="panel-header">
            <h2>Inspector</h2>
            <button class="btn btn-sm btn-outline-secondary" type="button" @click="closeInspector">
              Close
            </button>
          </div>

          <div class="inspector-content">
            <div v-if="!selectedInputDetails" class="inspector-empty">
              Select any "Inspect" button to see the source notes, confidence, and scenario usage for that input.
            </div>

            <div v-else class="inspector-details">
              <div class="inspector-detail-header">
                <div>
                  <p class="eyebrow">{{ formatLabel(selectedInputDetails.variable_type) }}</p>
                  <h3>{{ selectedInputDetails.title }}</h3>
                </div>
                <span class="input-quality-badge">
                  {{ formatSourceQuality(selectedInputDetails.sourceQuality) }}
                </span>
              </div>

              <p class="inspector-summary">
                {{ selectedInputDetails.summary || selectedInputDetails.importanceReason }}
              </p>

              <div class="detail-item">
                <span class="detail-label">Current value</span>
                <span class="detail-value">
                  {{ formatInputFieldValue(selectedInputDetails) }} {{ selectedInputDetails.display_units }}
                </span>
              </div>

              <div class="detail-item">
                <span class="detail-label">Default value</span>
                <span class="detail-value">
                  {{ formatInputFieldValue({ ...selectedInputDetails, value: selectedInputDetails.default_value }) }}
                  {{ selectedInputDetails.display_units }}
                </span>
              </div>

              <div v-if="selectedInputDetails.importanceRank" class="detail-item">
                <span class="detail-label">Importance rank</span>
                <span class="detail-value">#{{ selectedInputDetails.importanceRank }}</span>
              </div>

              <div v-if="selectedInputDetails.importanceReason" class="detail-item">
                <span class="detail-label">Why it matters</span>
                <span class="detail-value">{{ selectedInputDetails.importanceReason }}</span>
              </div>

              <div v-if="selectedInputDetails.confidence !== undefined" class="detail-item">
                <span class="detail-label">Confidence</span>
                <span class="detail-value">{{ formatConfidence(selectedInputDetails.confidence) }}</span>
              </div>

              <div class="detail-item">
                <span class="detail-label">Variable name</span>
                <span class="detail-value">{{ selectedInputDetails.variable_name }}</span>
              </div>

              <div v-if="selectedInputDetails.sourceName" class="detail-item">
                <span class="detail-label">Source name</span>
                <span class="detail-value">{{ selectedInputDetails.sourceName }}</span>
              </div>

              <div v-if="selectedInputDetails.source_url" class="detail-item">
                <span class="detail-label">Source link</span>
                <span class="detail-value">
                  <a :href="selectedInputDetails.source_url" target="_blank" rel="noreferrer">
                    {{ selectedInputDetails.source_url }}
                  </a>
                </span>
              </div>

              <div v-if="selectedInputDetails.sourceNote" class="detail-item">
                <span class="detail-label">Source note</span>
                <span class="detail-value">{{ selectedInputDetails.sourceNote }}</span>
              </div>

              <div v-if="selectedInputDetails.lastReviewed" class="detail-item">
                <span class="detail-label">Last reviewed</span>
                <span class="detail-value">{{ selectedInputDetails.lastReviewed }}</span>
              </div>

              <div v-if="selectedInputDetails.usedIn?.length" class="detail-item">
                <span class="detail-label">Used in</span>
                <div class="detail-chip-group">
                  <button
                    v-for="scenario in selectedInputDetails.usedIn"
                    :key="scenario.id"
                    class="scenario-link-chip"
                    type="button"
                    @click="jumpToScenario(scenario.id, scenario.category)"
                  >
                    {{ scenario.title }}
                  </button>
                </div>
              </div>
            </div>

            <div v-if="selectedInputKey && logs[selectedInputKey]?.length" class="change-log">
              <h3>Recent changes</h3>
              <div class="change-log-list">
                <div v-for="(log, idx) in logs[selectedInputKey]" :key="idx" class="change-log-item">
                  <span class="change-log-time">{{ log.time }}</span>
                  <span>{{ humanReadable(log.value) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>
