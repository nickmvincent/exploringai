---
title: API inference price for GPT-4o output tokens
value: 10
scale: 1
display_units: dollars per 1M output tokens
variable_name: inference_price__gpt_4o__output_dollars_per_1m_tokens
variable_type: inference_price
entity: gpt_4o
units: dollars_per_1m_output_tokens
source_url: 'https://platform.openai.com/docs/models/gpt-4o'
summary: "Public API price benchmark for GPT-4o output tokens."
importanceRank: 5
importanceReason: "Output-token pricing is especially useful for comparing the cost of long generations."
sourceName: "OpenAI model docs"
sourceNote: "GPT-4o output pricing is listed at $10.00 per 1M tokens."
sourceQuality: "official"
confidence: 0.95
lastReviewed: "2026-03-10"
featured: true
min: 0
step: 0.1
date_added: '2026-03-10T00:00:00.000Z'
tags:
  - variable-type:inference-price
  - entity:gpt-4o
  - unit:dollars-per-1m-output-tokens
visibility: public
type: InputVariable
---

# API inference price for GPT-4o output tokens

**Value:** 10 dollars per 1M output tokens

## Description

Public API price benchmark for GPT-4o output tokens.

## Key Assumption

Public API pricing is a price-to-user benchmark, not OpenAI's internal marginal cost of inference.

## Source

- [https://platform.openai.com/docs/models/gpt-4o](https://platform.openai.com/docs/models/gpt-4o)
- OpenAI lists GPT-4o output pricing at $10.00 per 1 million tokens.
