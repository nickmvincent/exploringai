---
title: Multimodal pretraining tokens (Llama 4 Maverick)
value: 22000000000000
scale: 1000000000
display_units: billions of tokens
variable_name: dataset_size__llama4_maverick__tokens
variable_type: dataset_size
entity: llama4_maverick
units: tokens
source_url: 'https://github.com/meta-llama/llama-models/blob/main/models/llama4/MODEL_CARD.md'
summary: "Approximate multimodal tokens Meta reports using to pretrain Llama 4 Maverick."
sourceName: "Meta Llama 4 model card"
sourceNote: "Meta reports that Llama 4 Maverick was pretrained on approximately 22 trillion tokens of multimodal data. This count is not directly comparable with a text-only token total."
sourceLocator: "Training Data section in MODEL_CARD.md"
sourceLocatorUrl: 'https://github.com/meta-llama/llama-models/blob/main/models/llama4/MODEL_CARD.md#training-data'
sourceExcerpt: "The model card's training overview lists Maverick at roughly 22T pretraining tokens."
sourceQuality: "first-party-report"
lastReviewed: "2026-07-09"
mainExampleForCategory: false
min: 0
step: 100
date_added: '2026-03-11T19:19:59.000Z'
tags:
  - variable-type:dataset-size
  - entity:llama4-maverick
  - unit:tokens
visibility: public
type: InputVariable
---

# Multimodal pretraining tokens (Llama 4 Maverick)

**Value:** 22,000 billions of tokens

## Description

Approximate multimodal tokens Meta reports using to pretrain Llama 4 Maverick.

## Key Assumption

This uses the model card's rounded multimodal-token disclosure. It should not be treated as a text-only corpus size or compared across model families without checking tokenization and modality definitions.

## Source

- [https://github.com/meta-llama/llama-models/blob/main/models/llama4/MODEL_CARD.md](https://github.com/meta-llama/llama-models/blob/main/models/llama4/MODEL_CARD.md)
- Meta says Llama 4 Maverick was trained on 22 trillion tokens.
