---
title: Funding Expert Evaluation Questions from Data Deals
description: >-
  How many expert-eval questions could one data deal (say,
  {deal_value__reddit_google__dollars}) fund at current expert rates (say,
  {wage_data__phd__dollars_per_question})?
formula: >-
  {deal_value__reddit_google__dollars} /
  {wage_data__phd__dollars_per_question}
presets:
  - id: news-corp-at-current-rate
    label: News Corp deal -> current expert rate
    fills:
      - input: deal_value__reddit_google__dollars
        variant: deal_value__newscorp__dollars
  - id: taylor-francis-at-current-rate
    label: Taylor & Francis floor -> current expert rate
    fills:
      - input: deal_value__reddit_google__dollars
        variant: deal_value__taylorandfrancis_microsoft__dollars
  - id: reddit-at-premium-rate
    label: Reddit deal -> premium expert rate
    values:
      - input: wage_data__phd__dollars_per_question
        value: 500
result_label: Questions Funded
result_units: questions
category: Paying for new labour
date_added: '2026-04-03T20:52:00.000Z'
tags:
  - type:calculation
  - category:paying-for-new-labour
visibility: public
type: ScenarioCalculation
---

# Funding Expert Evaluation Questions from Data Deals

## Description

How many expert-eval questions could one data deal (say, 60 millions of dollars) fund at current expert rates (say, 300 dollars per question)?

## Inputs

- **Payment made to Reddit by Google**: 60 millions of dollars
- **Expert benchmark rate per question**: 300 dollars per question

## Calculation

- Divide: 60 millions of dollars ÷ 300 dollars per question = [result]

## Result

The Questions Funded is calculated in questions.

## Category

Paying for new labour
