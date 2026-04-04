---
title: Total pre-training tokens (Llama 4 Scout)
value: 40000000000000
scale: 1000000000
display_units: billions of tokens
variable_name: dataset_size__llama4_scout__tokens
variable_type: dataset_size
entity: llama4_scout
units: tokens
source_url: 'https://github.com/meta-llama/llama-models/blob/main/models/llama4/MODEL_CARD.md'
summary: "Total tokens Meta reports using to pretrain Llama 4 Scout."
sourceName: "Meta Llama 4 model card"
sourceNote: "Meta reports that Llama 4 Scout was trained on 40 trillion tokens."
sourceLocator: "Training Data section in MODEL_CARD.md"
sourceLocatorUrl: 'https://github.com/meta-llama/llama-models/blob/main/models/llama4/MODEL_CARD.md#L267-L275'
sourceExcerpt: "The model card's training overview lists Scout at roughly 40T pretraining tokens."
sourceQuality: "first-party-report"
lastReviewed: "2026-03-11"
mainExampleForCategory: true
min: 0
step: 100
date_added: '2026-03-11T00:00:00.000Z'
tags:
  - variable-type:dataset-size
  - entity:llama4-scout
  - unit:tokens
visibility: public
type: InputVariable
---

# Total pre-training tokens (Llama 4 Scout)

**Value:** 40,000 billions of tokens

## Description

Total tokens Meta reports using to pretrain Llama 4 Scout.

## Key Assumption

This uses the model card's rounded total-token disclosure as the best public benchmark for a current frontier open-weight model.

## Source

- [https://github.com/meta-llama/llama-models/blob/main/models/llama4/MODEL_CARD.md](https://github.com/meta-llama/llama-models/blob/main/models/llama4/MODEL_CARD.md)
- Meta says Llama 4 Scout was trained on 40 trillion tokens.
