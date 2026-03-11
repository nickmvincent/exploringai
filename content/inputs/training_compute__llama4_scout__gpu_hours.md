---
title: Training compute (Llama 4 Scout)
value: 5000000
scale: 1000000
display_units: millions of H100-80GB GPU hours
variable_name: training_compute__llama4_scout__gpu_hours
variable_type: training_compute
entity: llama4_scout
units: h100_80gb_gpu_hours
source_url: 'https://github.com/meta-llama/llama-models/blob/main/models/llama4/MODEL_CARD.md'
summary: "Public training-compute benchmark for Llama 4 Scout."
importanceRank: 6
importanceReason: "Disclosed GPU-hour counts are rare and help connect dataset debates to compute scale."
sourceName: "Meta Llama 4 model card"
sourceNote: "Meta reports 5.0 million H100-80GB GPU hours for Llama 4 Scout training."
sourceQuality: "official"
confidence: 0.95
lastReviewed: "2026-03-11"
featured: true
min: 0
step: 0.01
date_added: '2026-03-11T00:00:00.000Z'
tags:
  - variable-type:training-compute
  - entity:llama4-scout
  - unit:h100-80gb-gpu-hours
visibility: public
type: InputVariable
---

# Training compute (Llama 4 Scout)

**Value:** 5 millions of H100-80GB GPU hours

## Description

Public training-compute benchmark for Llama 4 Scout.

## Key Assumption

This is the disclosed training-compute figure from the model card, not a standardized FLOP estimate across labs.

## Source

- [https://github.com/meta-llama/llama-models/blob/main/models/llama4/MODEL_CARD.md](https://github.com/meta-llama/llama-models/blob/main/models/llama4/MODEL_CARD.md)
- Meta reports 5.0 million H100-80GB GPU hours for Llama 4 Scout.
