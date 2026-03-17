---
title: Pretraining mix share from web text (Dolma v1.6)
value: 81
scale: 1
display_units: percent of tokens
variable_name: pretraining_composition__dolma_v1_6__web_percent
variable_type: pretraining_composition
entity: dolma_v1_6
units: percent
source_url: 'https://huggingface.co/datasets/allenai/dolma'
summary: "Approximate share of Dolma v1.6 tokens that come from web crawls."
importanceRank: 19
importanceReason: "Makes it easier to talk concretely about how much pretraining data comes from web crawls."
sourceName: "AllenAI Dolma dataset card"
sourceNote: "Derived from the Common Crawl and C4 token counts in Dolma v1.6."
sourceLocator: "Dataset card table of source-token counts for Dolma v1.6"
sourceLocatorUrl: 'https://huggingface.co/datasets/allenai/dolma'
sourceExcerpt: "The Dolma card lists 2,281B Common Crawl tokens and 198B C4 tokens out of 3,059B total."
derivationNote: "This input adds the Common Crawl and C4 token counts, then divides by the 3,059B-token total."
sourceQuality: "official"
confidence: 0.95
lastReviewed: "2026-03-10"
featured: false
min: 0
step: 0.1
date_added: '2026-03-10T00:00:00.000Z'
tags:
  - variable-type:pretraining-composition
  - entity:dolma-v1.6
  - unit:percent
visibility: public
type: InputVariable
---

# Pretraining mix share from web text (Dolma v1.6)

**Value:** 81 percent of tokens

## Description

Approximate share of Dolma v1.6 tokens that come from web crawls.

## Key Assumption

This combines Common Crawl and C4 token counts from the official Dolma v1.6 table and divides by the 3,059B-token total.

## Source

- [https://huggingface.co/datasets/allenai/dolma](https://huggingface.co/datasets/allenai/dolma)
- Dolma v1.6 reports 2,281B Common Crawl tokens and 198B C4 tokens out of 3,059B total tokens.
