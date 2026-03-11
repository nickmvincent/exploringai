---
title: Total training tokens (DeepSeek-V3)
value: 14800000000000
scale: 1000000000
display_units: billions of tokens
variable_name: dataset_size__deepseek_v3__tokens
variable_type: dataset_size
entity: deepseek_v3
units: tokens
source_url: 'https://github.com/deepseek-ai/DeepSeek-V3'
summary: "Total tokens DeepSeek reports for DeepSeek-V3 training."
importanceRank: 5
importanceReason: "Adds a second recent frontier-model disclosure to compare against Llama-family training scale."
sourceName: "DeepSeek-V3 repository"
sourceNote: "DeepSeek reports that DeepSeek-V3 was pretrained on 14.8 trillion high-quality and diverse tokens."
sourceQuality: "official"
confidence: 0.95
lastReviewed: "2026-03-11"
featured: true
min: 0
step: 100
date_added: '2026-03-11T00:00:00.000Z'
tags:
  - variable-type:dataset-size
  - entity:deepseek-v3
  - unit:tokens
visibility: public
type: InputVariable
---

# Total training tokens (DeepSeek-V3)

**Value:** 14,800 billions of tokens

## Description

Total tokens DeepSeek reports for DeepSeek-V3 training.

## Key Assumption

Uses the repository's total-token disclosure as a direct benchmark for a recent open model rather than trying to infer hidden training scale.

## Source

- [https://github.com/deepseek-ai/DeepSeek-V3](https://github.com/deepseek-ai/DeepSeek-V3)
- DeepSeek says DeepSeek-V3 was pretrained on 14.8 trillion tokens.
