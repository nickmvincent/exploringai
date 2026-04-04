import test from 'node:test';
import assert from 'node:assert/strict';

import { collectInputLibraryConsistencyIssues } from '../scripts/content-check.mjs';

function buildInput(
  id: string,
  overrides: Partial<{
    filePath: string;
    title: string;
    variable_type: string;
    entity: string | undefined;
    mainExampleForCategory: boolean;
  }> = {},
) {
  return {
    id,
    filePath: `/tmp/${id}.md`,
    title: id,
    variable_type: 'dataset_size',
    entity: undefined,
    mainExampleForCategory: false,
    ...overrides,
  };
}

test('collectInputLibraryConsistencyIssues flags duplicate titles', () => {
  const errors = collectInputLibraryConsistencyIssues([
    buildInput('alpha', { title: 'Same title' }),
    buildInput('beta', { title: 'Same title' }),
  ]);

  assert.equal(errors.length, 1);
  assert.match(errors[0], /duplicate input title "Same title"/i);
});

test('collectInputLibraryConsistencyIssues flags multiple main examples in one catalog family', () => {
  const errors = collectInputLibraryConsistencyIssues([
    buildInput('inference_price__gpt_4_1_mini__input', {
      title: 'Input price',
      variable_type: 'inference_price',
      entity: 'gpt_4_1_mini',
      mainExampleForCategory: true,
    }),
    buildInput('inference_price__gpt_4_1_mini__output', {
      title: 'Output price',
      variable_type: 'inference_price',
      entity: 'gpt_4_1_mini',
      mainExampleForCategory: true,
    }),
  ]);

  assert.equal(errors.length, 1);
  assert.match(errors[0], /multiple inputs marked mainExampleForCategory/i);
  assert.match(errors[0], /inference_price::gpt_4_1_mini/i);
});

test('collectInputLibraryConsistencyIssues allows one main example per catalog family', () => {
  const errors = collectInputLibraryConsistencyIssues([
    buildInput('inference_price__gpt_4_1_mini__input', {
      title: 'Input price',
      variable_type: 'inference_price',
      entity: 'gpt_4_1_mini',
      mainExampleForCategory: true,
    }),
    buildInput('inference_price__gpt_4_1_mini__output', {
      title: 'Output price',
      variable_type: 'inference_price',
      entity: 'gpt_4_1_mini',
      mainExampleForCategory: false,
    }),
    buildInput('inference_price__gpt_4o__input', {
      title: 'GPT-4o input price',
      variable_type: 'inference_price',
      entity: 'gpt_4o',
      mainExampleForCategory: true,
    }),
  ]);

  assert.deepEqual(errors, []);
});
