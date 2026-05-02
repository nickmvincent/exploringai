---
title: Producing an expert evaluation set
description: >-
  How much would it cost to pay for an eval dataset (say,
  {dataset_size__hle__questions}) assuming a per-question expert benchmark (say,
  {wage_data__phd__dollars_per_question})?
formula: >-
  {dataset_size__hle__questions} * {wage_data__phd__dollars_per_question}
presets:
  - id: pilot-set
    label: 300-question pilot at current expert rate
    values:
      - input: dataset_size__hle__questions
        value: 300
  - id: gpqa-main-set
    label: GPQA main scale at current expert rate
    fills:
      - input: dataset_size__hle__questions
        variant: dataset_size__gpqa_main__questions
  - id: expanded-public-set
    label: 10,000-question set at current expert rate
    values:
      - input: dataset_size__hle__questions
        value: 10000
  - id: premium-public-set
    label: HLE public set at premium expert prize tier
    fills:
      - input: wage_data__phd__dollars_per_question
        variant: wage_data__hle_runner_up_prize__dollars_per_question
  - id: expanded-premium-set
    label: 10,000-question set at premium expert rate
    fills:
      - input: wage_data__phd__dollars_per_question
        variant: wage_data__hle_runner_up_prize__dollars_per_question
    values:
      - input: dataset_size__hle__questions
        value: 10000
result_label: Dataset Cost
result_units: dollars
category: Paying for new labour
sort_order: 70
date_added: "2025-03-19T00:00:00.000Z"
tags:
  - type:calculation
  - category:paying-for-new-labour
visibility: public
type: ScenarioCalculation
---

# Producing an expert evaluation set

## Description

How much would it cost to pay for an eval dataset (say, 2,500 questions) assuming a per-question expert benchmark (say, 200 dollars per question)?

## Inputs

- **Total public questions (Humanity's Last Exam)**: 2,500 questions
- **Expert benchmark rate per question**: 200 dollars per question

## Calculation

- Multiply: 2,500 questions x 200 dollars per question = [result]

## Result

The Dataset Cost is calculated in dollars.

## Category

Paying for new labour
