---
title: Compensating an Entire Copied Library at Settlement Rates
description: >-
  What would it cost to compensate an entire copied library (say,
  {total_books__anthropic_pirated_library__books}) at a settlement-style rate
  per work (say, {settlement_value__anthropic_books__dollars_per_work})?
formula: >-
  {total_books__anthropic_pirated_library__books} *
  {settlement_value__anthropic_books__dollars_per_work}
presets:
  - id: books3-only
    label: Books3 only -> settlement rate
    fills:
      - input: total_books__anthropic_pirated_library__books
        variant: total_books__books3__books
  - id: libgen-only
    label: LibGen only -> settlement rate
    fills:
      - input: total_books__anthropic_pirated_library__books
        variant: total_books__libgen__books
  - id: pirate-library-mirror-only
    label: Pirate Library Mirror only -> settlement rate
    fills:
      - input: total_books__anthropic_pirated_library__books
        variant: total_books__pirate_library_mirror__books
result_label: Total Compensation
result_units: dollars
category: Distributing money
date_added: '2026-04-03T20:52:00.000Z'
tags:
  - type:calculation
  - category:distributing-money
visibility: public
type: ScenarioCalculation
---

# Compensating an Entire Copied Library at Settlement Rates

## Description

What would it cost to compensate an entire copied library (say, 7 millions of books) at a settlement-style rate per work (say, 3,000 dollars per work)?

## Inputs

- **Total copied books in Anthropic's pirated library**: 7 millions of books
- **Proposed settlement value per work (Anthropic books case)**: 3,000 dollars per work

## Calculation

- Multiply: 7 millions of books × 3,000 dollars per work = [result]

## Result

The Total Compensation is calculated in dollars.

## Category

Distributing money
