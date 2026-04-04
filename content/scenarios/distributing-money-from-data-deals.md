---
title: Distributing Money from Data Deals
description: >-
  If we distribute the payments from recent data deal (say,
  {deal_value__reddit_google__dollars}) to some group of people (say,
  {deal_group_size__reddit__daily_active_users}), how much will each person get?
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
result_label: Per Person Revenue
result_units: dollars
category: Distributing money
date_added: "2025-03-19T00:00:00.000Z"
tags:
  - type:calculation
  - category:distributing-money
visibility: public
type: ScenarioCalculation
---

# Distributing Money from Data Deals

## Description

If we distribute the payments from recent data deal (say, 60 millions of dollars) to some group of people (say, 267.50 millions of daily active users), how much will each person get?

## Inputs

- **Payment made to Reddit by Google**: 60 millions of dollars
- **Number of Reddit daily active users**: 267.50 millions of daily active users

## Calculation

- Divide: 60 millions of dollars ÷ 267.50 millions of daily active users

## Result

The Per Person Revenue is calculated in dollars.

## Category

Distributing money
