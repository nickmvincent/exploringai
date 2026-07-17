---
title: Pricing an English-Text-Equivalent Dataset at Frontier Scale
description: >-
  What replacement-cost thought experiment results if a frontier-scale token
  exposure (say, {dataset_size__llama3__tokens}) is treated as English text
  using {training_detail__openai__words_per_token} and priced at a professional
  work-for-hire writing benchmark (say,
  {wage_data__generic_freelance_higher__dollars_per_word})?
formula: >-
  {dataset_size__llama3__tokens} * {training_detail__openai__words_per_token} *
  {wage_data__generic_freelance_higher__dollars_per_word}
presets:
  - id: lower-writing-rate
    label: Same token scale -> lower work-for-hire rate
    fills:
      - input: wage_data__generic_freelance_higher__dollars_per_word
        variant: wage_data__generic_freelance_lower__dollars_per_word
result_label: Dataset Cost
result_units: dollars
category: Paying for new labour
sort_order: 10
date_added: "2025-03-19T00:00:00.000Z"
tags:
  - type:calculation
  - category:paying-for-new-labour
visibility: public
type: ScenarioCalculation
---

# Pricing an English-Text-Equivalent Dataset at Frontier Scale

## Description

What replacement-cost thought experiment results if 15 trillion tokenizer tokens are treated as English text using a 0.75-word-per-token rule of thumb and priced at a professional work-for-hire writing benchmark?

## Inputs

- **Total pre-training tokens (Llama 3)**: 15,000 billions of tokens
- **Average words per token**: 0.75 words per token
- **Work-for-hire article or essay rate (upper benchmark)**: 0.45 dollars per word

## Calculation

- Multiply: 15,000 billions of tokens × 0.75 words per token = [total_words]
- Multiply: [total_words] × 0.45 dollars per word = [result]

## Result

The dataset cost is an English-text-equivalent replacement-cost thought experiment. It is not a forecast of actual model-development spending or a measured cost of producing a unique training corpus.

## Category

Paying for new labour
