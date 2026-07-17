---
title: Applying Per-Work Benchmarks to Identified Settlement Works
description: >-
  What arithmetic results from applying a selected per-work benchmark (say,
  {settlement_value__anthropic_books__dollars_per_work}) to the works identified
  for preliminary settlement administration (say,
  {settlement_group_size__anthropic_books__works})?
formula: >-
  {settlement_group_size__anthropic_books__works} *
  {settlement_value__anthropic_books__dollars_per_work}
presets:
  - id: statutory-minimum
    label: Identified works -> ordinary statutory minimum
    fills:
      - input: settlement_value__anthropic_books__dollars_per_work
        variant: settlement_value__copyright_statutory_minimum__dollars_per_work
result_label: Illustrative Pool
result_units: dollars
category: Distributing money
sort_order: 20
date_added: '2026-04-03T20:52:00.000Z'
tags:
  - type:calculation
  - category:distributing-money
visibility: public
type: ScenarioCalculation
---

# Applying Per-Work Benchmarks to Identified Settlement Works

## Description

What arithmetic results from applying a selected per-work benchmark to the 482,460 works identified for preliminary settlement administration?

## Inputs

- **Identified works in Anthropic books settlement**: 482,460 works
- **Proposed settlement value per work (Anthropic books case)**: 3,000 dollars per work

## Calculation

- Multiply: 482,460 works × 3,000 dollars per work = [result]

## Result

The illustrative pool is calculated in dollars. This does not establish final payouts, legal liability, ownership, eligibility, availability of statutory damages, or registration timing.

## Category

Distributing money
