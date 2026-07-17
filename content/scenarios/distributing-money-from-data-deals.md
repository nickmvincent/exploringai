---
title: Distributing Money from Data Deals
description: >-
  What ratio results if a reported data-deal value (say,
  {deal_value__reddit_google__dollars}) is divided by an activity, workforce,
  or article-count benchmark (say,
  {deal_group_size__reddit__daily_active_users})?
formula: >-
  {deal_value__reddit_google__dollars} / {deal_group_size__reddit__daily_active_users}
presets:
  - id: newscorp-to-employees
    label: News Corp deal -> all employees
    fills:
      - input: deal_value__reddit_google__dollars
        variant: deal_value__newscorp__dollars
      - input: deal_group_size__reddit__daily_active_users
        variant: deal_group_size__newscorp__employees
  - id: newscorp-to-wsj-journalists
    label: News Corp deal -> WSJ journalists
    fills:
      - input: deal_value__reddit_google__dollars
        variant: deal_value__newscorp__dollars
      - input: deal_group_size__reddit__daily_active_users
        variant: deal_group_size__wsj__journalists
  - id: taylor-francis-to-articles
    label: Taylor & Francis deal -> journal articles
    fills:
      - input: deal_value__reddit_google__dollars
        variant: deal_value__taylorandfrancis_microsoft__dollars
      - input: deal_group_size__reddit__daily_active_users
        variant: deal_group_size__taylorandfrancis__articles
result_label: Deal Value per Denominator Unit
result_units: dollars
category: Distributing money
sort_order: 30
date_added: "2025-03-19T00:00:00.000Z"
tags:
  - type:calculation
  - category:distributing-money
visibility: public
type: ScenarioCalculation
---

# Distributing Money from Data Deals

## Description

What ratio results if a reported data-deal value is divided by an activity, workforce, or article-count benchmark?

## Inputs

- **Payment made to Reddit by Google**: 60 millions of dollars
- **Reddit daily active uniques**: 121.40 millions of daily active users

## Calculation

- Divide: 60 millions of dollars / 121.40 millions of daily active users

## Result

The result is an illustrative ratio, not a beneficiary model. The denominator may count activity, employees, journalists, or articles rather than rights-holders.

## Category

Distributing money
