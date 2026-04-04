---
title: Commissioning New Datasets
description: >-
  How much would it cost to pay for a brand new LLM-scale pre-training dataset
  (say, {dataset_size__llama3__tokens}) assuming moderate freelance writing
  wages (say, {wage_data__generic_freelance_higher__dollars_per_word})?
formula: >-
  {dataset_size__llama3__tokens} * {training_detail__openai__words_per_token} *
  {wage_data__generic_freelance_higher__dollars_per_word}
presets:
  - id: olmo3-at-lower-rate
    label: OLMo 3 scale -> lower freelance rate
    fills:
      - input: dataset_size__llama3__tokens
        variant: dataset_size__olmo3__tokens
      - input: wage_data__generic_freelance_higher__dollars_per_word
        variant: wage_data__generic_freelance_lower__dollars_per_word
  - id: qwen3-at-higher-rate
    label: Qwen 3 scale -> higher freelance rate
    fills:
      - input: dataset_size__llama3__tokens
        variant: dataset_size__qwen3__tokens
  - id: deepseek-at-lower-rate
    label: DeepSeek V3 scale -> lower freelance rate
    fills:
      - input: dataset_size__llama3__tokens
        variant: dataset_size__deepseek_v3__tokens
      - input: wage_data__generic_freelance_higher__dollars_per_word
        variant: wage_data__generic_freelance_lower__dollars_per_word
  - id: llama4-maverick-at-higher-rate
    label: Llama 4 Maverick scale -> higher freelance rate
    fills:
      - input: dataset_size__llama3__tokens
        variant: dataset_size__llama4_maverick__tokens
result_label: Dataset Cost
result_units: dollars
category: Paying for new labour
date_added: "2025-03-19T00:00:00.000Z"
tags:
  - type:calculation
  - category:paying-for-new-labour
visibility: public
type: ScenarioCalculation
---

# Commissioning New Datasets

## Description

How much would it cost to pay for a brand new LLM-scale pre-training dataset (say, 15,000 billions of tokens) assuming moderate freelance writing wages (say, 1 dollars per word)?

## Inputs

- **Total pre-training tokens (Llama 3)**: 15,000 billions of tokens
- **Average words per token**: 0.75 words per token
- **Freelance rate per word (high estimate)**: 1 dollars per word

## Calculation

- Multiply: 15,000 billions of tokens × 0.75 words per token = [total_words]
- Multiply: [total_words] × 1 dollars per word = [result]

## Result

The Dataset Cost is calculated in dollars.

## Category

Paying for new labour
