---
title: Average tokens per document (RedPajama V2 English subset)
value: 1414
scale: 1
display_units: tokens per document
variable_name: dataset_attribute__redpajama__tokens_per_contribution
variable_type: dataset_attribute
entity: redpajama
units: tokens_per_contribution
source_url: 'https://github.com/togethercomputer/RedPajama-Data'
summary: "Derived average tokens per document in RedPajama V2's English annotated-and-deduplicated head_middle subset."
sourceName: "RedPajama-Data repository"
sourceNote: "Derived from the English deduplicated counts reported by the project: 20.5T tokens over 14.5B documents."
sourceLocator: "Repository README summary of English deduplicated token and document counts"
sourceLocatorUrl: 'https://github.com/togethercomputer/RedPajama-Data'
sourceExcerpt: "The repository reports 20.5T English deduplicated tokens over 14.5B documents."
derivationNote: "This input divides 20.5T tokens by 14.5B documents, giving about 1,414 tokens per document."
sourceQuality: "first-party-report"
lastReviewed: "2026-07-09"
mainExampleForCategory: false
min: 0
step: 10
date_added: '2025-03-19T00:00:00.000Z'
tags:
  - variable-type:dataset-attribute
  - entity:redpajama
  - unit:tokens-per-contribution
visibility: public
type: InputVariable
---

# Average tokens per document (RedPajama V2 English subset)

**Value:** 1,414 tokens per document

## Description

Derived average tokens per document in the English annotated-and-deduplicated head_middle subset.

## Key Assumption

This is a ratio of two rounded repository totals, not a measured distribution of document lengths.

## Source

- [https://github.com/togethercomputer/RedPajama-Data](https://github.com/togethercomputer/RedPajama-Data)
- RedPajama readme reports a ratio of documents to tokens (after dedupe). We use the English figures (20.5T tokens / 14.5B documents)
