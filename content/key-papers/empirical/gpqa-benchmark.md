---
title: "GPQA: A Graduate-Level Google-Proof Q&A Benchmark"
anchor: Rein et al., 2023
authors:
  - David Rein
  - Betty Li Hou
  - Asa Cooper Stickland
  - Jackson Petty
  - Richard Yuanzhe Pang
  - Julien Dirani
  - Julian Michael
  - Samuel R. Bowman
year: 2023
kind: empirical
source_url: 'https://arxiv.org/abs/2311.12022'
links:
  - label: Dataset card
    href: 'https://huggingface.co/datasets/Idavidrein/gpqa'
relevance: Expert-written benchmark source that anchors smaller eval-set sizes and the idea of hard, domain-specific question production.
related_input_ids:
  - dataset_size__gpqa_main__questions
key_inputs:
  - Expert-written multiple-choice question counts
  - Domain-expert validation process
  - Smaller comparison point for HLE-scale evaluation sets
sourceQuality: "third-party-report"
sort_order: 45
visibility: public
type: KeyPaper
---

## Relevance

GPQA is a useful smaller benchmark reference when HLE-scale estimates feel too large for a pilot or domain-specific evaluation effort.

## Key inputs

- Main GPQA question count
- Expert-written and expert-validated benchmark construction
- Domain focus in biology, physics, and chemistry
