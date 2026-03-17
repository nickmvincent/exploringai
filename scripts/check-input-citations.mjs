#!/usr/bin/env node

import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const inputsDir = path.resolve(__dirname, '../content/inputs');
const strict = process.argv.includes('--strict');
const sourceFreeQualities = new Set(['assumption', 'heuristic']);

const files = readdirSync(inputsDir)
  .filter((name) => name.endsWith('.md'))
  .sort((a, b) => a.localeCompare(b));

function getFrontmatter(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---/);
  return match ? match[1] : '';
}

function readField(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  if (!match) return null;
  return match[1].trim();
}

function normalizeFieldValue(rawValue) {
  if (rawValue === null) return null;

  const trimmed = rawValue.trim();
  if (!trimmed || trimmed === 'null' || trimmed === '~' || trimmed === '""' || trimmed === "''") {
    return null;
  }

  const quoted = trimmed.match(/^(['"])([\s\S]*)\1$/);
  return quoted ? quoted[2].trim() : trimmed;
}

function hasStructuredField(frontmatter, key) {
  return normalizeFieldValue(readField(frontmatter, key)) !== null;
}

const sharedRequiredFields = ['sourceName', 'sourceNote', 'sourceLocator', 'sourceExcerpt', 'sourceQuality', 'confidence'];

const results = files.map((name) => {
  const absPath = path.join(inputsDir, name);
  const frontmatter = getFrontmatter(readFileSync(absPath, 'utf8'));
  const sourceQuality = normalizeFieldValue(readField(frontmatter, 'sourceQuality')) ?? 'unknown';
  const requiresExternalSource = !sourceFreeQualities.has(sourceQuality);
  const requiredFields = requiresExternalSource
    ? ['source_url', ...sharedRequiredFields]
    : sharedRequiredFields;
  const missing = requiredFields.filter((field) => !hasStructuredField(frontmatter, field));
  const hasExternalSource = hasStructuredField(frontmatter, 'source_url');

  return {
    name,
    sourceQuality,
    hasExternalSource,
    requiresExternalSource,
    missing,
  };
});

const missingCount = results.filter((entry) => entry.missing.length > 0).length;
const externallyVerifiableCount = results.filter((entry) => entry.requiresExternalSource && entry.missing.length === 0).length;
const documentedAssumptionCount = results.filter((entry) => !entry.requiresExternalSource && entry.missing.length === 0).length;
const sourceFreeCount = results.filter((entry) => !entry.hasExternalSource).length;

console.log(`Inputs scanned: ${results.length}`);
console.log(`Externally sourced and verification-ready: ${externallyVerifiableCount}`);
console.log(`Documented assumptions or heuristics: ${documentedAssumptionCount}`);
console.log(`Without external source URL: ${sourceFreeCount}`);
console.log(`Missing required citation fields: ${missingCount}`);

if (missingCount > 0) {
  console.log('');
  for (const entry of results.filter((item) => item.missing.length > 0)) {
    console.log(`${entry.name} [${entry.sourceQuality}]`);
    console.log(`  missing: ${entry.missing.join(', ')}`);
  }
}

if (strict && missingCount > 0) {
  process.exitCode = 1;
}
