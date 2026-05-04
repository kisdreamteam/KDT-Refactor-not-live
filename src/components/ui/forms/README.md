# Form Components (`src/components/ui/forms`)

## Purpose
This folder contains form-focused components for data entry workflows.

## What Belongs Here
- Controlled form UI and field-level validation.
- Submit handlers that call passed-in actions/callbacks.
- Reusable form sections specific to a domain workflow.

## What Does Not Belong Here
- Routing concerns.
- Broad page orchestration logic.
- Non-form UI that is better placed in `src/components/ui`.

## Rules
- Keep form state local unless shared across siblings.
- Surface submission outcomes via callbacks.
- Keep field naming and validation messages consistent.

## Typical Imports
- May import UI atoms from `src/components/ui`.
- May call domain hooks/services through props or thin adapters.
