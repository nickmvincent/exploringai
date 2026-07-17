---
title: Estimated physicians worldwide
value: 13918300
scale: 1000000
display_units: million physicians
variable_name: group_size__world__physicians
variable_type: group_size
entity: world_physicians
units: people
source_url: 'https://data.who.int/indicators/i/217795A'
summary: "Estimated global physician headcount, derived from WHO's worldwide doctor-density benchmark."
sourceName: "WHO Global Health Observatory"
sourceNote: "WHO's latest downloadable series reports a 2022 global density estimate of 17.2 doctors per 10,000 people. This input turns that mixed-year benchmark into a rough headcount using the repo's January 1, 2025 population benchmark; it is not a contemporaneous global census."
sourceLocator: "World row for 2022 in the WHO density-of-doctors dataset export"
sourceLocatorUrl: 'https://srhdpeuwpubsa.blob.core.windows.net/whdh/DATADOT/INDICATOR/217795A_ALL_LATEST.csv'
sourceExcerpt: "WHO's global row reports a 2022 density of 17.2 doctors per 10,000 people."
derivationNote: "13,918,300 physicians = 8,092,034,511 people × 17.2 doctors per 10,000 people."
sourceQuality: "first-party-report"
lastReviewed: "2026-07-09"
mainExampleForCategory: false
min: 0
step: 0.01
date_added: '2026-04-06T21:05:00.000Z'
tags:
  - variable-type:group-size
  - entity:world-physicians
  - unit:people
visibility: public
type: InputVariable
---

# Estimated physicians worldwide

**Value:** 13.92 million physicians

## Description

Estimated global physician headcount, derived from WHO's worldwide doctor-density benchmark.

## Key Assumption

This is a back-of-the-envelope stock estimate, not a direct WHO census of every practicing physician. It combines WHO's latest global density figure with the site's shared world-population benchmark.

## Source

- [https://data.who.int/indicators/i/217795A](https://data.who.int/indicators/i/217795A)
- [https://srhdpeuwpubsa.blob.core.windows.net/whdh/DATADOT/INDICATOR/217795A_ALL_LATEST.csv](https://srhdpeuwpubsa.blob.core.windows.net/whdh/DATADOT/INDICATOR/217795A_ALL_LATEST.csv)
- WHO's global row reports a 2022 density of 17.2 doctors per 10,000 people.
- This input converts that density into a rough headcount using the site's January 1, 2025 world-population benchmark.
