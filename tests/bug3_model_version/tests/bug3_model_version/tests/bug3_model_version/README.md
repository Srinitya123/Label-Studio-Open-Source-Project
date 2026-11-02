# Bug 3 Model Version Testing

This folder contains validation tests and sample JSON files for User Story 3 / Bug 3.

## Bug Summary

The reported bug occurs when prediction data is imported without a `model_version` field.

## Test Cases

- Prediction JSON without model_version
- Prediction JSON with model_version

## Local Testing

Manual testing was performed in Label Studio version 1.13.1.

The validation error from the original bug report could not be reproduced locally, but team testing on Label Studio version 1.23.0 successfully reproduced the issue.

This suggests the bug may be version-specific.

## Validation Script

Run:

```bash
python3 test_bug3_model_version.py
```

Expected output:

```text
All Bug 3 model_version validation tests passed.
```
## Contribution

Added validation test cases and sample prediction data for Bug 3 local testing.
