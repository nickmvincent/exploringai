<script setup lang="ts">
import { computed } from 'vue';
import type { InputComparisonImage } from '../lib/calculations';

const props = defineProps<{
  comparisonImage: InputComparisonImage;
}>();

const linkLabel = computed(() => props.comparisonImage.label || 'Open reference');
</script>

<template>
  <figure class="comparison-figure">
    <a
      v-if="comparisonImage.href"
      class="comparison-figure-image-link"
      :href="comparisonImage.href"
      target="_blank"
      rel="noreferrer"
    >
      <img
        class="comparison-figure-image"
        :src="comparisonImage.src"
        :alt="comparisonImage.alt"
        loading="lazy"
        decoding="async"
      />
    </a>
    <img
      v-else
      class="comparison-figure-image"
      :src="comparisonImage.src"
      :alt="comparisonImage.alt"
      loading="lazy"
      decoding="async"
    />

    <figcaption v-if="comparisonImage.caption || comparisonImage.href" class="comparison-figure-caption">
      <span v-if="comparisonImage.caption">{{ comparisonImage.caption }}</span>
      <a v-if="comparisonImage.href" :href="comparisonImage.href" target="_blank" rel="noreferrer">
        {{ linkLabel }}
      </a>
    </figcaption>
  </figure>
</template>

<style scoped>
.comparison-figure {
  margin: 0.85rem 0 0;
  padding: 0.7rem;
  border: 1px solid rgba(90, 98, 112, 0.16);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.88);
}

.comparison-figure-image-link {
  display: block;
}

.comparison-figure-image {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 12px;
  border: 1px solid rgba(90, 98, 112, 0.14);
  background: rgba(251, 250, 247, 0.88);
}

.comparison-figure-caption {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 0.55rem;
  color: var(--dark-gray);
  font-family: var(--font-ui);
  font-size: 0.84rem;
  line-height: 1.45;
}

.comparison-figure-caption a {
  color: var(--primary-color);
  text-decoration: none;
  white-space: nowrap;
}

.comparison-figure-caption a:hover {
  text-decoration: underline;
}

@media (max-width: 640px) {
  .comparison-figure-caption {
    flex-direction: column;
  }
}
</style>
