# Tasks

## 1. Split the displayed model from the usage model

- [x] 1.1 In `buildDashboardRows`, derive the displayed `modelRef` as the session's selected model falling back to `usage.model`, and derive the context fill from `usage.model` instead; verify with a new `src/view-model.test.mjs` case where the two differ and `modelName` reports the selected model while `contextPercentage` is computed with the usage model's context limit
- [x] 1.2 Keep the fallback when the session has no selected model; verify with a `src/view-model.test.mjs` case with `session.model` absent where `modelName` and the context fill both come from the latest assistant usage
- [x] 1.3 Keep `modelName` and `context` as `unavailable` when neither source yields a model; verify with a `src/view-model.test.mjs` case with no selection and no assistant usage
- [x] 1.4 Update every existing expectation in `src/view-model.test.mjs` that assumed the single-ref precedence and verify `node --test src/view-model.test.mjs` passes

## 2. Integration checks

- [x] 2.1 Run the full `npm test` suite and verify the model-details, agents, and view-model tests still pass with the split refs (the dialog keeps consuming `row.modelRef`/`row.modelInfo`)
- [x] 2.2 Run `npm run check` and verify the TypeScript build reports no errors
