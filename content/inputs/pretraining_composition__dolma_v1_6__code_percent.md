---
title: Pretraining mix share from code (Dolma v1.6)
value: 13.4
scale: 1
display_units: percent of tokens
variable_name: pretraining_composition__dolma_v1_6__code_percent
variable_type: pretraining_composition
entity: dolma_v1_6
units: percent
source_url: 'https://huggingface.co/datasets/allenai/dolma'
summary: "Approximate share of Dolma v1.6 tokens that come from code."
sourceName: "AllenAI Dolma dataset card"
sourceNote: "Derived from the published The Stack token count in Dolma v1.6."
sourceLocator: "Dataset card table of source-token counts for Dolma v1.6"
sourceLocatorUrl: 'https://huggingface.co/datasets/allenai/dolma'
sourceExcerpt: "The Dolma card lists 411B The Stack tokens out of 3,059B total tokens."
derivationNote: "This input divides the The Stack token count by the 3,059B-token total."
sourceQuality: "first-party-report"
lastReviewed: "2026-03-10"
mainExampleForCategory: false
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

# Pretraining mix share from code (Dolma v1.6)

**Value:** 13.4 percent of tokens

## Description

Approximate share of Dolma v1.6 tokens that come from code.

## Key Assumption

Derived from The Stack token count divided by the published 3,059B-token total.

## Source

- [https://huggingface.co/datasets/allenai/dolma](https://huggingface.co/datasets/allenai/dolma)
- Dolma v1.6 reports 411B code tokens from The Stack out of 3,059B total tokens.
