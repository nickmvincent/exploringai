---
title: Funding Continuous Physician Oversight for Medical AI
description: >-
  If feeling comfortable with medical AI meant asking some share of the world's
  physicians (say,
  {training_detail__medical_ai_oversight__share_of_physicians_percent}) out of
  a global pool of roughly {group_size__world__physicians} to each spend about
  {training_detail__medical_ai_oversight__hours_per_physician_per_year} on
  audits, review, and oversight, what annual labor budget would that imply at
  a May 2025 U.S. general-internal-medicine mean employee-wage proxy (say,
  {wage_data__physician__dollars_per_hour})?
formula: >-
  {group_size__world__physicians} *
  ({training_detail__medical_ai_oversight__share_of_physicians_percent} / 100) *
  {training_detail__medical_ai_oversight__hours_per_physician_per_year} *
  {wage_data__physician__dollars_per_hour}
presets:
  - id: specialty-network
    label: 0.01% of physicians -> one workweek each
    fills:
      - input: training_detail__medical_ai_oversight__share_of_physicians_percent
        variant: training_detail__medical_ai_oversight_specialty_network__share_of_physicians_percent
  - id: broad-regime
    label: 0.1% of physicians -> one workweek each
    values:
      - input: training_detail__medical_ai_oversight__share_of_physicians_percent
        value: 0.1
  - id: one-percent-two-weeks
    label: 1% of physicians -> two workweeks each
    values:
      - input: training_detail__medical_ai_oversight__hours_per_physician_per_year
        value: 80
  - id: five-percent-one-week
    label: 5% of physicians -> one workweek each
    values:
      - input: training_detail__medical_ai_oversight__share_of_physicians_percent
        value: 5
result_label: Illustrative Annual Labor Budget
result_units: dollars
category: Paying for new labour
sort_order: 50
date_added: '2026-04-06T21:05:00.000Z'
tags:
  - type:calculation
  - category:paying-for-new-labour
visibility: public
type: ScenarioCalculation
---

# Funding Continuous Physician Oversight for Medical AI

## Description

If a hypothetical share of a rough global physician headcount spent 40 hours per year on medical-AI oversight, what annual labor-budget envelope would result using a May 2025 U.S. general-internal-medicine mean employee-wage proxy?

## Inputs

- **Estimated physicians worldwide**: 13.92 million physicians
- **Participating share of physicians**: 1 percent of physicians
- **Annual oversight time per participating physician**: 40 hours per physician per year
- **Mean hourly wage for U.S. general internal medicine physicians**: 128.46 dollars per hour

## Calculation

- Divide: 1 percent of physicians ÷ 100 = [participating_share]
- Multiply: 13.92 million physicians × [participating_share] = [participating_physicians]
- Multiply: [participating_physicians] × 40 hours per physician per year = [oversight_hours]
- Multiply: [oversight_hours] × 128.46 dollars per hour = [result]

## Result

The result is an illustrative annual labor-budget envelope, not a forecast or evidence-backed policy cost. Participation and hours are planning assumptions, and the model mixes a global headcount estimate with a U.S. employee-wage proxy.

## Category

Paying for new labour
