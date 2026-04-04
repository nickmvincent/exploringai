<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

type PickerOption = {
  variable: string;
  title: string;
  valueText: string;
  sourceQualityLabel?: string | null;
  summary?: string | null;
};

type PickerGroup = {
  key: string;
  label: string;
  options: PickerOption[];
};

const props = defineProps<{
  ariaLabel: string;
  changed?: boolean;
  groups: PickerGroup[];
  selectedVariable: string;
}>();

const emit = defineEmits<{
  select: [variable: string];
}>();

const open = ref(false);
const rootRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLButtonElement | null>(null);

const flatOptions = computed(() => props.groups.flatMap((group) => group.options));
const isInteractive = computed(() => flatOptions.value.length > 1);
const selectedOption = computed(() => {
  return flatOptions.value.find((option) => option.variable === props.selectedVariable) ?? flatOptions.value[0] ?? null;
});

function close() {
  open.value = false;
}

function toggle() {
  if (!isInteractive.value) {
    return;
  }

  open.value = !open.value;
}

function selectOption(variable: string) {
  emit('select', variable);
  close();
  triggerRef.value?.focus();
}

function handleDocumentPointerdown(event: Event) {
  if (!open.value) {
    return;
  }

  if (!(event.target instanceof Node)) {
    return;
  }

  if (!rootRef.value?.contains(event.target)) {
    close();
  }
}

function handleDocumentKeydown(event: KeyboardEvent) {
  if (!open.value || event.key !== 'Escape') {
    return;
  }

  event.preventDefault();
  close();
  triggerRef.value?.focus();
}

watch(
  () => props.selectedVariable,
  () => close(),
);

watch(isInteractive, (interactive) => {
  if (!interactive) {
    close();
  }
});

onMounted(() => {
  document.addEventListener('pointerdown', handleDocumentPointerdown);
  document.addEventListener('keydown', handleDocumentKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleDocumentPointerdown);
  document.removeEventListener('keydown', handleDocumentKeydown);
});
</script>

<template>
  <span
    ref="rootRef"
    class="benchmark-picker"
    :class="{ changed, open, static: !isInteractive }"
  >
    <button
      v-if="selectedOption && isInteractive"
      ref="triggerRef"
      type="button"
      class="benchmark-picker-trigger"
      :aria-expanded="open"
      :aria-label="ariaLabel"
      :title="selectedOption.valueText"
      aria-haspopup="dialog"
      @click="toggle"
    >
      <span class="benchmark-picker-copy">
        <span class="benchmark-picker-title">{{ selectedOption.title }}</span>
      </span>
      <span class="benchmark-picker-caret" aria-hidden="true"></span>
    </button>

    <span v-else-if="selectedOption" class="benchmark-picker-static-copy" :title="selectedOption.valueText">
      <span class="benchmark-picker-copy">
        <span class="benchmark-picker-title">{{ selectedOption.title }}</span>
      </span>
    </span>

    <div
      v-if="open && isInteractive"
      class="benchmark-picker-popover"
      role="dialog"
      :aria-label="ariaLabel"
    >
      <div
        v-for="group in groups"
        :key="group.key"
        class="benchmark-picker-group"
      >
        <div class="benchmark-picker-group-label">{{ group.label }}</div>

        <div class="benchmark-picker-option-list">
          <button
            v-for="option in group.options"
            :key="option.variable"
            type="button"
            class="benchmark-picker-option"
            :class="{ selected: option.variable === selectedVariable }"
            :aria-pressed="option.variable === selectedVariable"
            @click="selectOption(option.variable)"
          >
            <span class="benchmark-picker-option-main">
              <span class="benchmark-picker-option-title">{{ option.title }}</span>
              <span v-if="option.summary" class="benchmark-picker-option-summary">
                {{ option.summary }}
              </span>
            </span>

            <span class="benchmark-picker-option-meta">
              <span class="benchmark-picker-option-value">{{ option.valueText }}</span>
              <span v-if="option.sourceQualityLabel" class="benchmark-picker-chip">
                {{ option.sourceQualityLabel }}
              </span>
            </span>
          </button>
        </div>
      </div>
    </div>
  </span>
</template>

<style scoped>
.benchmark-picker {
  position: relative;
  display: inline-flex;
  vertical-align: baseline;
  max-width: min(100%, 24rem);
  margin: 0 0.16rem;
  z-index: 2;
}

.benchmark-picker.open {
  z-index: 30;
}

.benchmark-picker-trigger,
.benchmark-picker-static-copy {
  display: inline-flex;
  align-items: baseline;
  gap: 0.35rem;
  min-width: 0;
  max-width: 100%;
  padding: 0.08rem 0.42rem 0.12rem;
  border-radius: 2px;
  border: 1px solid rgba(31, 39, 51, 0.14);
  background: rgba(255, 255, 255, 0.72);
  transition:
    border-color 0.18s ease,
    transform 0.18s ease,
    background 0.18s ease;
}

.benchmark-picker-trigger {
  cursor: pointer;
}

.benchmark-picker.changed .benchmark-picker-trigger,
.benchmark-picker.changed .benchmark-picker-static-copy {
  border-color: rgba(31, 39, 51, 0.28);
  background: rgba(243, 239, 228, 0.9);
}

.benchmark-picker-trigger:hover {
  border-color: rgba(31, 39, 51, 0.24);
  background: rgba(255, 255, 255, 0.96);
}

.benchmark-picker-trigger:focus-visible {
  outline: none;
  border-color: rgba(31, 39, 51, 0.34);
  box-shadow: 0 0 0 0.18rem rgba(31, 39, 51, 0.08);
}

.benchmark-picker-copy {
  display: inline;
  min-width: 0;
}

.benchmark-picker-title {
  color: var(--black);
  font-family: var(--font-body);
  font-size: 0.98rem;
  font-weight: 600;
  line-height: 1.3;
}

.benchmark-picker-caret {
  flex: 0 0 auto;
  width: 0.52rem;
  height: 0.52rem;
  margin-left: 0.06rem;
  border-right: 1.5px solid rgba(31, 39, 51, 0.66);
  border-bottom: 1.5px solid rgba(31, 39, 51, 0.66);
  transform: rotate(45deg) translateY(-1px);
  transition: transform 0.18s ease;
}

.benchmark-picker.open .benchmark-picker-caret {
  transform: rotate(-135deg) translateY(-1px);
}

.benchmark-picker-popover {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  width: min(30rem, calc(100vw - 2rem));
  max-height: min(28rem, 65vh);
  padding: 0.8rem;
  border: 1px solid rgba(31, 39, 51, 0.16);
  border-radius: 2px;
  background: rgba(250, 248, 242, 0.98);
  box-shadow: 0 14px 30px rgba(31, 39, 51, 0.14);
  overflow-y: auto;
}

.benchmark-picker-group + .benchmark-picker-group {
  margin-top: 0.8rem;
  padding-top: 0.8rem;
  border-top: 1px solid rgba(216, 222, 230, 0.72);
}

.benchmark-picker-group-label {
  margin-bottom: 0.55rem;
  color: var(--dark-gray);
  font-family: var(--font-ui);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.benchmark-picker-option-list {
  display: grid;
  gap: 0.5rem;
}

.benchmark-picker-option {
  display: flex;
  justify-content: space-between;
  gap: 0.85rem;
  width: 100%;
  padding: 0.72rem 0.8rem;
  border: 1px solid rgba(31, 39, 51, 0.12);
  border-radius: 0;
  background: rgba(255, 255, 255, 0.94);
  text-align: left;
  transition:
    border-color 0.18s ease,
    background 0.18s ease,
    transform 0.18s ease;
}

.benchmark-picker-option:hover {
  border-color: rgba(31, 39, 51, 0.2);
  background: rgba(251, 249, 243, 0.98);
}

.benchmark-picker-option:focus-visible {
  outline: none;
  border-color: rgba(31, 39, 51, 0.3);
  box-shadow: 0 0 0 0.14rem rgba(31, 39, 51, 0.08);
}

.benchmark-picker-option.selected {
  border-color: rgba(31, 39, 51, 0.24);
  background: rgba(244, 240, 229, 0.98);
}

.benchmark-picker-option-main {
  display: grid;
  gap: 0.24rem;
  min-width: 0;
}

.benchmark-picker-option-title {
  color: var(--black);
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.25;
}

.benchmark-picker-option-summary {
  color: var(--ink-soft);
  font-size: 0.8rem;
  line-height: 1.35;
}

.benchmark-picker-option-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-content: flex-start;
  gap: 0.38rem;
  min-width: 7rem;
}

.benchmark-picker-option-value {
  color: var(--dark-gray);
  font-family: var(--font-ui);
  font-size: 0.78rem;
  font-weight: 700;
}

.benchmark-picker-chip {
  display: inline-flex;
  align-items: center;
  min-height: 1.6rem;
  padding: 0.16rem 0.5rem;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(31, 39, 51, 0.14);
  color: var(--ink-soft);
  font-size: 0.72rem;
  font-weight: 700;
}

@media (max-width: 640px) {
  .benchmark-picker {
    max-width: 100%;
    margin: 0.08rem 0.12rem;
  }

  .benchmark-picker-trigger,
  .benchmark-picker-static-copy {
    max-width: 100%;
  }

  .benchmark-picker-popover {
    left: 50%;
    transform: translateX(-50%);
    width: min(26rem, calc(100vw - 1rem));
    max-height: min(24rem, 60vh);
  }

  .benchmark-picker-option {
    flex-direction: column;
  }

  .benchmark-picker-option-meta {
    justify-content: flex-start;
    min-width: 0;
  }
}
</style>
