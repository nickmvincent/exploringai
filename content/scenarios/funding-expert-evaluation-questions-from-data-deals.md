---
title: Funding Expert Evaluation Questions from Data Deals
description: >-
  How many expert-eval questions could one data deal (say,
  {deal_value__reddit_google__dollars}) represent at an HLE prize-budget
  benchmark (say,
  {wage_data__phd__dollars_per_question})?
formula: >-
  {deal_value__reddit_google__dollars} /
  {wage_data__phd__dollars_per_question}
presets:
  - id: news-corp-at-current-rate
    label: News Corp deal -> HLE prize-budget ratio
    fills:
      - input: deal_value__reddit_google__dollars
        variant: deal_value__newscorp__dollars
  - id: taylor-francis-at-current-rate
    label: Taylor & Francis floor -> HLE prize-budget ratio
    fills:
      - input: deal_value__reddit_google__dollars
        variant: deal_value__taylorandfrancis_microsoft__dollars
  - id: reddit-at-premium-rate
    label: Reddit deal -> $500 HLE prize tier
    fills:
      - input: wage_data__phd__dollars_per_question
        variant: wage_data__hle_runner_up_prize__dollars_per_question
result_label: Prize-Equivalent Question Count
result_units: questions
category: Paying for new labour
sort_order: 40
date_added: '2026-04-03T20:52:00.000Z'
tags:
  - type:calculation
  - category:paying-for-new-labour
visibility: public
type: ScenarioCalculation
---

# Funding Expert Evaluation Questions from Data Deals

## Description

How many final-question equivalents does a data-deal value represent when divided by the HLE prize-budget ratio or a selected HLE prize tier?

## Inputs

- **Payment made to Reddit by Google**: 60 millions of dollars
- **HLE prize-budget per final public question**: 200 dollars per question

## Calculation

- Divide: 60 millions of dollars / 200 dollars per question = [result]

## Result

The result is a prize-equivalent question count, not an estimate of questions that could actually be produced. Full production costs are not represented.

## Category

Paying for new labour
