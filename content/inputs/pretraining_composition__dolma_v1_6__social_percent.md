---
title: Pretraining mix share from social media (Dolma v1.6)
value: 2.9
scale: 1
display_units: percent of tokens
variable_name: pretraining_composition__dolma_v1_6__social_percent
variable_type: pretraining_composition
entity: dolma_v1_6
units: percent
source_url: 'https://huggingface.co/datasets/allenai/dolma'
summary: "Approximate share of Dolma v1.6 tokens that come from Reddit."
importanceRank: 22
importanceReason: "Social platforms are central to data-rights debates and should be visible as their own source class."
sourceName: "AllenAI Dolma dataset card"
sourceNote: "Derived from the published Reddit token count in Dolma v1.6."
sourceQuality: "official"
confidence: 0.95
lastReviewed: "2026-03-10"
featured: false
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

# Pretraining mix share from social media (Dolma v1.6)

**Value:** 2.9 percent of tokens

## Description

Approximate share of Dolma v1.6 tokens that come from Reddit.

## Key Assumption

Derived from the Reddit token count divided by the published 3,059B-token total.

## Source

- [https://huggingface.co/datasets/allenai/dolma](https://huggingface.co/datasets/allenai/dolma)
- Dolma v1.6 reports 89B Reddit tokens out of 3,059B total tokens.
