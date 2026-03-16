import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import {
  ASK_TYPE_VALUE,
  BLOG_STATUS_VALUES,
  BLOG_TYPE_VALUE,
  INPUT_TYPE_VALUE,
  INPUT_UNITS,
  INPUT_VARIABLE_TYPES,
  KEY_PAPER_KIND_VALUES,
  KEY_PAPER_TYPE_VALUE,
  SCENARIO_CATEGORIES,
  SCENARIO_TYPE_VALUE,
  SOURCE_QUALITY_VALUES,
  VISIBILITY_VALUES,
} from './lib/content-vocab.js';

const inputVariableTypes = INPUT_VARIABLE_TYPES as [string, ...string[]];
const inputUnits = INPUT_UNITS as [string, ...string[]];
const scenarioCategories = SCENARIO_CATEGORIES as [string, ...string[]];
const sourceQualityValues = SOURCE_QUALITY_VALUES as [string, ...string[]];
const visibilityValues = VISIBILITY_VALUES as [string, ...string[]];
const blogStatusValues = BLOG_STATUS_VALUES as [string, ...string[]];
const keyPaperKindValues = KEY_PAPER_KIND_VALUES as [string, ...string[]];
const referenceChartScaleValues = ['linear', 'log'] as const;
const linkSchema = z.object({
  label: z.string(),
  href: z.string().url(),
});

const inputs = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "../content/inputs" }),
  schema: z.object({
    title: z.string(),
    value: z.number(),
    scale: z.number().optional().default(1),
    display_units: z.string(),
    variable_name: z.string().optional().nullable(),
    variable_type: z.enum(inputVariableTypes),
    entity: z.string().optional().nullable(),
    units: z.enum(inputUnits),
    source_url: z.string().url().optional().nullable(),
    summary: z.string().optional().nullable(),
    importanceRank: z.number().optional().nullable(),
    importanceReason: z.string().optional().nullable(),
    sourceName: z.string().optional().nullable(),
    sourceNote: z.string().optional().nullable(),
    sourceLocator: z.string().optional().nullable(),
    sourceLocatorUrl: z.string().optional().nullable(),
    sourceExcerpt: z.string().optional().nullable(),
    derivationNote: z.string().optional().nullable(),
    sourcePublished: z.string().optional().nullable(),
    source_key_papers: z.array(z.string()).optional().nullable(),
    sourceQuality: z.enum(sourceQualityValues).optional().nullable(),
    confidence: z.number().min(0).max(1).optional().nullable(),
    lastReviewed: z.string().optional().nullable(),
    featured: z.boolean().optional().nullable(),
    min: z.number().optional().nullable(),
    max: z.number().optional().nullable(),
    step: z.number().optional().nullable(),
    comparisonImage: z.object({
      src: z.string(),
      alt: z.string(),
      caption: z.string().optional().nullable(),
      href: z.string().optional().nullable(),
      label: z.string().optional().nullable(),
    }).optional().nullable(),
    referenceCharts: z.array(z.object({
      title: z.string(),
      description: z.string().optional().nullable(),
      scale: z.enum(referenceChartScaleValues).optional().nullable(),
      bars: z.array(z.object({
        label: z.string(),
        value: z.number(),
        displayValue: z.string().optional().nullable(),
        note: z.string().optional().nullable(),
        highlight: z.boolean().optional().nullable(),
      })).min(2),
    })).optional().nullable(),
    date_added: z.string().optional().nullable(),
    tags: z.array(z.string()).optional().nullable(),
    visibility: z.enum(visibilityValues).optional().nullable(),
    type: z.literal(INPUT_TYPE_VALUE).optional().nullable(),
  }),
});

const scenarios = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "../content/scenarios" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    formula: z.string(),
    input_variables: z.array(z.string()).optional(),
    result_label: z.string(),
    result_units: z.enum(inputUnits),
    category: z.enum(scenarioCategories),
    date_added: z.string().optional(),
    tags: z.array(z.string()).optional(),
    visibility: z.enum(visibilityValues).optional(),
    type: z.literal(SCENARIO_TYPE_VALUE).optional(),
  }),
});

const blogs = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "../content/blogs" }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    status: z.enum(blogStatusValues),
    sort_order: z.number().optional().nullable(),
    related_input_ids: z.array(z.string()).optional().nullable(),
    related_scenario_ids: z.array(z.string()).optional().nullable(),
    visibility: z.enum(visibilityValues).optional().nullable(),
    type: z.literal(BLOG_TYPE_VALUE).optional().nullable(),
  }),
});

const keyPapers = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "../content/key-papers" }),
  schema: z.object({
    title: z.string(),
    anchor: z.string(),
    authors: z.array(z.string()).optional().nullable(),
    year: z.number().optional().nullable(),
    kind: z.enum(keyPaperKindValues),
    source_url: z.string().url().optional().nullable(),
    links: z.array(linkSchema).optional().nullable(),
    relevance: z.string(),
    related_input_ids: z.array(z.string()).optional().nullable(),
    key_inputs: z.array(z.string()).optional().nullable(),
    sourceQuality: z.enum(sourceQualityValues).optional().nullable(),
    sort_order: z.number().optional().nullable(),
    visibility: z.enum(visibilityValues).optional().nullable(),
    type: z.literal(KEY_PAPER_TYPE_VALUE).optional().nullable(),
  }),
});

const asks = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "../content/asks" }),
  schema: z.object({
    title: z.string(),
    summary: z.string().optional().nullable(),
    sort_order: z.number().optional().nullable(),
    visibility: z.enum(visibilityValues).optional().nullable(),
    type: z.literal(ASK_TYPE_VALUE).optional().nullable(),
  }),
});

export const collections = { inputs, scenarios, blogs, keyPapers, asks };
