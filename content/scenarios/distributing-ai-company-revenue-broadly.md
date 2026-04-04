---
title: Distributing AI Company Revenue Broadly
description: >-
  If we distribute AI revenue (say, {yearly_revenue__openai__dollars}) to some
  group of people (say, {group_size__world__people}), how much will each person
  get?
formula: >-
  {yearly_revenue__openai__dollars} / {group_size__world__people}
presets:
  - id: openai-to-usa
    label: OpenAI revenue -> all Americans
    fills:
      - input: group_size__world__people
        variant: group_size__usa__people
  - id: anthropic-to-world
    label: Anthropic revenue -> everyone on Earth
    fills:
      - input: yearly_revenue__openai__dollars
        variant: yearly_revenue__anthropic__dollars
  - id: anthropic-to-usa
    label: Anthropic revenue -> all Americans
    fills:
      - input: yearly_revenue__openai__dollars
        variant: yearly_revenue__anthropic__dollars
      - input: group_size__world__people
        variant: group_size__usa__people
  - id: microsoft-to-world
    label: Microsoft AI revenue -> everyone on Earth
    fills:
      - input: yearly_revenue__openai__dollars
        variant: yearly_revenue__microsoft__dollars
  - id: coreweave-to-usa
    label: CoreWeave revenue -> all Americans
    fills:
      - input: yearly_revenue__openai__dollars
        variant: yearly_revenue__coreweave__dollars
      - input: group_size__world__people
        variant: group_size__usa__people
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

# Distributing AI Company Revenue Broadly

## Description

If we distribute AI revenue (say, 3,490 millions of dollars) to some group of people (say, 8.10 billions of people), how much will each person get?

## Inputs

- **Revenue from AI (OpenAI)**: 3,490 millions of dollars
- **Number of people on Earth**: 8.10 billions of people

## Calculation

- Divide: 3,490 millions of dollars ÷ 8.10 billions of people

## Result

The Per Person Revenue is calculated in dollars.

## Category

Distributing money
