---
title: API inference price for GPT-4.1 mini output tokens
value: 1.6
scale: 1
display_units: dollars per 1M output tokens
variable_name: inference_price__gpt_4_1_mini__output_dollars_per_1m_tokens
variable_type: inference_price
entity: gpt_4_1_mini
units: dollars_per_1m_output_tokens
source_url: 'https://platform.openai.com/docs/models/gpt-4.1-mini'
summary: "Public API price benchmark for GPT-4.1 mini output tokens."
importanceRank: 7
importanceReason: "Pairs with the input benchmark above to make full request-cost comparisons possible."
sourceName: "OpenAI model docs"
sourceNote: "GPT-4.1 mini output pricing is listed at $1.60 per 1M tokens."
sourceQuality: "official"
confidence: 0.95
lastReviewed: "2026-03-10"
featured: true
min: 0
step: 0.01
date_added: '2026-03-10T00:00:00.000Z'
tags:
  - variable-type:inference-price
  - entity:gpt-4.1-mini
  - unit:dollars-per-1m-output-tokens
visibility: public
type: InputVariable
---

# API inference price for GPT-4.1 mini output tokens

**Value:** 1.6 dollars per 1M output tokens

## Description

Public API price benchmark for GPT-4.1 mini output tokens.

## Key Assumption

Public API pricing is a price-to-user benchmark, not OpenAI's internal marginal cost of inference.

## Source

- [https://platform.openai.com/docs/models/gpt-4.1-mini](https://platform.openai.com/docs/models/gpt-4.1-mini)
- OpenAI lists GPT-4.1 mini output pricing at $1.60 per 1 million tokens.
