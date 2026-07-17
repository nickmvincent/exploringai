---
title: Funding a Domain-Specific Physician Eval Set
description: >-
  How much would it cost to fund a domain-specific eval effort using a panel of
  physicians (say, {group_size__healthbench__physicians}) for some review time
  each (say, {training_detail__medical_eval__hours_per_physician}) using a May
  2025 U.S. general-internal-medicine mean employee-wage proxy (say,
  {wage_data__physician__dollars_per_hour})?
formula: >-
  {group_size__healthbench__physicians} *
  {training_detail__medical_eval__hours_per_physician} *
  {wage_data__physician__dollars_per_hour}
presets:
  - id: healthbench-two-days
    label: HealthBench-style panel -> two workdays each
    values:
      - input: training_detail__medical_eval__hours_per_physician
        value: 16
  - id: specialty-panel
    label: 25-physician specialty panel -> 20 hours each
    values:
      - input: group_size__healthbench__physicians
        value: 25
      - input: training_detail__medical_eval__hours_per_physician
        value: 20
  - id: pilot-panel
    label: 10-physician pilot -> one workday each
    values:
      - input: group_size__healthbench__physicians
        value: 10
      - input: training_detail__medical_eval__hours_per_physician
        value: 8
result_label: Evaluation Cost
result_units: dollars
category: Paying for new labour
sort_order: 60
date_added: '2026-04-03T21:15:00.000Z'
tags:
  - type:calculation
  - category:paying-for-new-labour
visibility: public
type: ScenarioCalculation
---

# Funding a Domain-Specific Physician Eval Set

## Description

How much reviewer labor would a domain-specific eval effort imply using a 262-physician panel, eight hours each, and a May 2025 U.S. general-internal-medicine mean employee-wage proxy?

## Inputs

- **Physician experts in HealthBench**: 262 physicians
- **Planning time per physician reviewer**: 8 hours per physician
- **Mean hourly wage for U.S. general internal medicine physicians**: 128.46 dollars per hour

## Calculation

- Multiply: 262 physicians × 8 hours per physician = [total_hours]
- Multiply: [total_hours] × 128.46 dollars per hour = [result]

## Result

The result estimates reviewer labor only. Consulting rates, employer costs, recruitment, coordination, adjudication, dataset engineering, benefits, and overhead are excluded.

## Category

Paying for new labour
