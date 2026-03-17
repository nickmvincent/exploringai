<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { humanReadable, type InputReferenceChart, type InputReferenceChartBar } from '../lib/calculations';

const props = withDefaults(defineProps<{
  referenceCharts: InputReferenceChart[];
  defaultOpen?: boolean;
  summaryLabel?: string;
}>(), {
  defaultOpen: false,
  summaryLabel: 'Visual reference points',
});

const chartCountLabel = computed(() => {
  const count = props.referenceCharts.length;
  return `${count} ${count === 1 ? 'chart' : 'charts'}`;
});
const detailsEl = ref<HTMLDetailsElement | null>(null);

onMounted(() => {
  if (props.defaultOpen && detailsEl.value) {
    detailsEl.value.open = true;
  }
});

function getScaleLabel(chart: InputReferenceChart) {
  return chart.scale === 'log' ? 'Log scale' : 'Linear scale';
}

function getChartMax(chart: InputReferenceChart) {
  return Math.max(...chart.bars.map((bar) => Math.max(bar.value, 0)), 0);
}

function getLogChartMax(chart: InputReferenceChart) {
  return Math.max(...chart.bars.map((bar) => Math.log10(Math.max(bar.value, 0) + 1)), 0);
}

function getBarWidth(chart: InputReferenceChart, bar: InputReferenceChartBar) {
  const safeValue = Math.max(bar.value, 0);

  if (safeValue === 0) {
    return 0;
  }

  if (chart.scale === 'log') {
    const max = getLogChartMax(chart);
    return max > 0 ? (Math.log10(safeValue + 1) / max) * 100 : 0;
  }

  const max = getChartMax(chart);
  return max > 0 ? (safeValue / max) * 100 : 0;
}

function formatBarValue(bar: InputReferenceChartBar) {
  return bar.displayValue || humanReadable(bar.value);
}
</script>

<template>
  <details ref="detailsEl" class="reference-charts">
    <summary class="reference-charts-summary">
      <span>{{ summaryLabel }}</span>
      <span class="reference-charts-count">{{ chartCountLabel }}</span>
    </summary>

    <div class="reference-charts-body">
      <section
        v-for="(chart, chartIndex) in referenceCharts"
        :key="`${chart.title}-${chartIndex}`"
        class="reference-chart"
      >
        <div class="reference-chart-header">
          <div>
            <h4>{{ chart.title }}</h4>
            <p v-if="chart.description">{{ chart.description }}</p>
          </div>
          <span class="reference-chart-scale">{{ getScaleLabel(chart) }}</span>
        </div>

        <ol class="reference-chart-bars">
          <li
            v-for="(bar, barIndex) in chart.bars"
            :key="`${chart.title}-${bar.label}-${barIndex}`"
            class="reference-chart-bar"
            :class="{ highlight: bar.highlight }"
          >
            <div class="reference-chart-bar-header">
              <div class="reference-chart-bar-copy">
                <strong>{{ bar.label }}</strong>
                <span v-if="bar.note">{{ bar.note }}</span>
              </div>
              <span class="reference-chart-bar-value">{{ formatBarValue(bar) }}</span>
            </div>

            <div class="reference-chart-track" aria-hidden="true">
              <div
                class="reference-chart-fill"
                :style="{ width: `${getBarWidth(chart, bar).toFixed(2)}%` }"
              ></div>
            </div>
          </li>
        </ol>

        <p v-if="chart.scale === 'log'" class="reference-chart-note">
          Log scale keeps extreme order-of-magnitude differences visible without flattening the smaller reference points.
        </p>
      </section>
    </div>
  </details>
</template>

<style scoped>
.reference-charts {
  margin-top: 0.85rem;
  border: 1px solid rgba(90, 98, 112, 0.16);
  border-radius: 16px;
  background: rgba(248, 249, 251, 0.84);
  overflow: hidden;
}

.reference-charts-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.8rem 0.9rem;
  cursor: pointer;
  font-family: var(--font-ui);
  font-size: 0.92rem;
  font-weight: 600;
  list-style: none;
}

.reference-charts-summary::-webkit-details-marker {
  display: none;
}

.reference-charts-summary::after {
  content: '▾';
  margin-left: auto;
  color: var(--primary-color);
  transition: transform 0.18s ease;
}

.reference-charts[open] .reference-charts-summary::after {
  transform: rotate(180deg);
}

.reference-charts-count,
.reference-chart-scale {
  color: var(--dark-gray);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.reference-charts-body {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 0 0.9rem 0.9rem;
}

.reference-chart {
  padding: 0.85rem;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(216, 222, 230, 0.92);
}

.reference-chart-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.reference-chart-header h4 {
  margin-bottom: 0.25rem;
  font-size: 0.98rem;
}

.reference-chart-header p,
.reference-chart-note {
  margin: 0;
  color: var(--dark-gray);
  font-size: 0.84rem;
  line-height: 1.5;
}

.reference-chart-bars {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.reference-chart-bar {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.reference-chart-bar-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.reference-chart-bar-copy {
  display: flex;
  flex-direction: column;
  gap: 0.12rem;
  min-width: 0;
}

.reference-chart-bar-copy strong,
.reference-chart-bar-value {
  font-size: 0.9rem;
}

.reference-chart-bar-copy span {
  color: var(--dark-gray);
  font-size: 0.8rem;
  line-height: 1.4;
}

.reference-chart-bar-value {
  flex-shrink: 0;
  color: var(--ink-soft);
  font-family: var(--font-ui);
  font-weight: 700;
  white-space: nowrap;
}

.reference-chart-track {
  height: 0.72rem;
  border-radius: 999px;
  background: rgba(215, 221, 228, 0.78);
  overflow: hidden;
}

.reference-chart-fill {
  min-width: 0;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, rgba(88, 114, 141, 0.88), rgba(43, 76, 111, 0.98));
}

.reference-chart-bar.highlight .reference-chart-fill {
  background: linear-gradient(90deg, rgba(213, 151, 69, 0.92), rgba(182, 113, 20, 0.98));
}

.reference-chart-note {
  margin-top: 0.75rem;
}

@media (max-width: 640px) {
  .reference-charts-summary,
  .reference-chart-header,
  .reference-chart-bar-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .reference-charts-summary::after {
    display: none;
  }
}
</style>
