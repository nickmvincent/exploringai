// @ts-check
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';

import vue from '@astrojs/vue';

const repoRoot = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const siteUrl = process.env.SITE_URL?.trim() || 'https://exploringai.org';

// https://astro.build/config
export default defineConfig({
  // Custom domain - override in deploy environments when needed.
  site: siteUrl,
  integrations: [vue()],
  vite: {
    server: {
      fs: {
        allow: [repoRoot],
      },
    },
  },
});
