---
title: Average number of a token in a single document (Red Pajama dataset)
value: 1413
scale: 1
display_units: tokens per contribution
variable_name: dataset_attribute__redpajama__tokens_per_contribution
variable_type: dataset_attribute
entity: redpajama
units: tokens_per_contribution
source_url: 'https://github.com/togethercomputer/RedPajama-Data'
summary: "Average number of tokens in a single 'contribution'"
sourceName: "RedPajama-Data repository"
sourceNote: "Derived from the English deduplicated counts reported by the project: 20.5T tokens over 14.5B documents."
sourceLocator: "Repository README summary of English deduplicated token and document counts"
sourceLocatorUrl: 'https://github.com/togethercomputer/RedPajama-Data'
sourceExcerpt: "The repository reports 20.5T English deduplicated tokens over 14.5B documents."
derivationNote: "This input divides 20.5T tokens by 14.5B documents to estimate average tokens per contribution."
sourceQuality: "third-party-report"
lastReviewed: "2026-03-10"
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

# Average number of a token in a single document (Red Pajama dataset)

**Value:** 1,413 tokens per contribution

## Description

Average number of tokens in a single 'contribution'

## Key Assumption

Working with averages here

## Source

- [https://github.com/togethercomputer/RedPajama-Data](https://github.com/togethercomputer/RedPajama-Data)
- RedPajama readme reports a ratio of documents to tokens (after dedupe). We use the English figures (20.5T tokens / 14.5B documents)
