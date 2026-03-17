---
title: API inference price for GPT-4o input tokens
value: 2.5
scale: 1
display_units: dollars per 1M input tokens
variable_name: inference_price__gpt_4o__input_dollars_per_1m_tokens
variable_type: inference_price
entity: gpt_4o
units: dollars_per_1m_input_tokens
source_url: 'https://platform.openai.com/docs/pricing'
summary: "Public API price benchmark for GPT-4o input tokens."
importanceRank: 4
importanceReason: "Public API prices are one of the few transparent benchmarks for inference economics."
sourceName: "OpenAI pricing page"
sourceNote: "GPT-4o input pricing is listed at $2.50 per 1M tokens."
sourceLocator: "Pricing table entry for GPT-4o input tokens"
sourceLocatorUrl: 'https://platform.openai.com/docs/pricing'
sourceExcerpt: "The pricing page lists GPT-4o input tokens at $2.50 per 1M tokens."
sourceQuality: "official"
confidence: 0.95
lastReviewed: "2026-03-10"
featured: true
min: 0
step: 0.01
date_added: '2026-03-10T00:00:00.000Z'
tags:
  - variable-type:inference-price
  - entity:gpt-4o
  - unit:dollars-per-1m-input-tokens
visibility: public
type: InputVariable
---

# API inference price for GPT-4o input tokens

**Value:** 2.5 dollars per 1M input tokens

## Description

Public API price benchmark for GPT-4o input tokens.

## Key Assumption

Public API pricing is a price-to-user benchmark, not OpenAI's internal marginal cost of inference.

## Source

- [https://platform.openai.com/docs/pricing](https://platform.openai.com/docs/pricing)
- OpenAI lists GPT-4o input pricing at $2.50 per 1 million tokens.
