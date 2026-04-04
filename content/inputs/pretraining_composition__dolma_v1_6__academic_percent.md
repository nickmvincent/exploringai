---
title: Pretraining mix share from academic papers (Dolma v1.6)
value: 2.3
scale: 1
display_units: percent of tokens
variable_name: pretraining_composition__dolma_v1_6__academic_percent
variable_type: pretraining_composition
entity: dolma_v1_6
units: percent
source_url: 'https://huggingface.co/datasets/allenai/dolma'
summary: "Approximate share of Dolma v1.6 tokens that come from scientific papers."
sourceName: "AllenAI Dolma dataset card"
sourceNote: "Derived from the published PeS2o paper count in Dolma v1.6."
sourceLocator: "Dataset card table of source-token counts for Dolma v1.6"
sourceLocatorUrl: 'https://huggingface.co/datasets/allenai/dolma'
sourceExcerpt: "The Dolma card lists 70B PeS2o tokens out of 3,059B total tokens."
derivationNote: "This input divides the PeS2o token count by the 3,059B-token total."
sourceQuality: "first-party-report"
lastReviewed: "2026-03-10"
mainExampleForCategory: false
min: 0
step: 0.01
date_added: '2026-03-10T00:00:00.000Z'
tags:
  - variable-type:pretraining-composition
  - entity:dolma-v1.6
  - unit:percent
visibility: public
type: InputVariable
---

# Pretraining mix share from academic papers (Dolma v1.6)

**Value:** 2.3 percent of tokens

## Description

Approximate share of Dolma v1.6 tokens that come from scientific papers.

## Key Assumption

Derived from the PeS2o token count divided by the published 3,059B-token total.

## Source

- [https://huggingface.co/datasets/allenai/dolma](https://huggingface.co/datasets/allenai/dolma)
- Dolma v1.6 reports 70B tokens from PeS2o STEM papers out of 3,059B total tokens.
