---
title: Turning Pretraining Composition Shares into Absolute Tokens
description: >-
  How many absolute tokens would a books, code, or social share (say,
  {pretraining_composition__dolma_v1_6__books_percent}) represent at frontier
  scale (say, {dataset_size__llama3__tokens})?
formula: >-
  {dataset_size__llama3__tokens} *
  ({pretraining_composition__dolma_v1_6__books_percent} / 100)
presets:
  - id: social-share-at-llama3
    label: Social share -> Llama 3 scale
    fills:
      - input: pretraining_composition__dolma_v1_6__books_percent
        variant: pretraining_composition__dolma_v1_6__social_percent
  - id: code-share-at-llama3
    label: Code share -> Llama 3 scale
    fills:
      - input: pretraining_composition__dolma_v1_6__books_percent
        variant: pretraining_composition__dolma_v1_6__code_percent
  - id: qwen3-coder-code-share
    label: Qwen3-Coder code share -> Qwen3-Coder scale
    fills:
      - input: dataset_size__llama3__tokens
        variant: dataset_size__qwen3_coder__tokens
      - input: pretraining_composition__dolma_v1_6__books_percent
        variant: pretraining_composition__qwen3_coder__code_percent
result_label: Token Slice
result_units: tokens
category: Making data scale vivid
date_added: '2026-04-03T20:52:00.000Z'
tags:
  - type:calculation
  - category:making-data-scale-vivid
visibility: public
type: ScenarioCalculation
---

# Turning Pretraining Composition Shares into Absolute Tokens

## Description

How many absolute tokens would a books, code, or social share (say, 0.2 percent of tokens) represent at frontier scale (say, 15,000 billions of tokens)?

## Inputs

- **Total pre-training tokens (Llama 3)**: 15,000 billions of tokens
- **Pretraining mix share from books (Dolma v1.6)**: 0.2 percent of tokens

## Calculation

- Divide: 0.2 percent ÷ 100 = [share_fraction]
- Multiply: 15,000 billions of tokens × [share_fraction] = [result]

## Result

The Token Slice is calculated in tokens.

## Category

Making data scale vivid
