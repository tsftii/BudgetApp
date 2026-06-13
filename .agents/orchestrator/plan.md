# TypeScript Migration Plan - BudgetApp

This document details the step-by-step plan for migrating the BudgetApp codebase from Vanilla JavaScript to TypeScript.

## Plan Summary

1. **Setup & TS Configuration (Milestone 1)**
   - Add `typescript` and any necessary types packages as devDependencies in `package.json`.
   - Run `npm install`.
   - Create and configure `tsconfig.json` with `"strict": true`, appropriate target/lib config, and module resolution for Vite.

2. **Migrate Simple Utilities (Milestone 2)**
   - Port `src/counter.js` to `src/counter.ts`.
   - Port `src/utils.js` to `src/utils.ts`.
   - Update type signatures and verify strict checking on these files.

3. **Migrate DB Layer (Milestone 3)**
   - Port `src/db.js` to `src/db.ts`.
   - Define strict models for `Account`, `Category`, and `Transaction` interfaces.
   - Enforce type safety on `dbAPI` methods (e.g. `getTransactions`, `addTransaction`).

4. **Migrate CSV & OCR Modules (Milestone 4)**
   - Port `src/csvImporter.js` to `src/csvImporter.ts`.
   - Port `src/receiptScanner.js` to `src/receiptScanner.ts`.
   - Add global declarations for `Papa` and `Tesseract` to resolve window/CDN script issues.

5. **Migrate Main Application Shell (Milestone 5)**
   - Port `src/main.js` to `src/main.ts`.
   - Define window custom methods on the `Window` interface to allow inline events (e.g. `window.editTransaction`).
   - Update `index.html` to reference `src/main.ts`.
   - Remove old `.js` files to avoid duplicates.

6. **Verification & Build (Milestone 6)**
   - Run type checker `npx tsc --noEmit` and fix any compiler errors.
   - Run production bundle builder `npm run build` and ensure compilation is correct.
   - Verify index.html points to `/src/main.ts`.

## Verification Criteria
- `tsconfig.json` has `"strict": true`.
- Zero errors from `npx tsc --noEmit`.
- Successful output from `npm run build`.
