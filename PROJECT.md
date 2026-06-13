# Project: BudgetApp TypeScript Migration

## Architecture
The BudgetApp is a client-side personal finance manager built with Vite. It features offline database storage via IndexedDB, interactive analytics via Chart.js, CSV importing via PapaParse, and receipt OCR scanning via Tesseract.js.

### Module Dependencies and Interfaces
1. **Database Layer (src/db.ts)**
   - Imports: `openDB` from `idb`.
   - Exports: `initDB()`, `seedDefaults()`, `dbAPI`.
   - Domain Interfaces:
     - `Account`: name, balance, type, currency, optional id.
     - `Category`: name, color, icon, budgetLimit, type, optional id.
     - `Transaction`: amount, description, type, accountId, categoryId, date, targetAccountId, createdAt, optional id.
2. **Utilities (src/utils.ts)**
   - Exports: `formatCurrency()`, `formatDate()`.
3. **CSV Importer (src/csvImporter.ts)**
   - Imports: `dbAPI` from `src/db.ts`.
   - Dependencies: Global `Papa` library.
   - Exports: `parseCSV()`, `importMappedTransactions()`.
4. **Receipt Scanner (src/receiptScanner.ts)**
   - Dependencies: Global `Tesseract` library.
   - Exports: `scanReceipt()`.
5. **Main Entry (src/main.ts)**
   - Imports all files above and `Chart` from `chart.js/auto`.
   - Handles views rendering, modals, event bindings, and router.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Setup & TS Configuration | Install ts-related dependencies, initialize tsconfig.json with "strict": true | None | DONE |
| 2 | Migrate Simple Utilities | Port counter.js and utils.js to TypeScript, ensuring strict type safety | M1 | DONE |
| 3 | Migrate DB Layer | Port db.js to db.ts, define Account, Category, Transaction models and dbAPI types | M1, M2 | DONE |
| 4 | Migrate CSV & OCR Modules | Port csvImporter.js and receiptScanner.js, declaring global types for Papa and Tesseract | M3 | DONE |
| 5 | Migrate Main Application Shell | Port main.js to main.ts, declare Window properties, and update index.html to reference main.ts | M3, M4 | DONE |
| 6 | Verification & Build | Verify via `npx tsc --noEmit` and build via `npm run build` | M5 | DONE |

## Interface Contracts
### Data Models
```typescript
export interface Account {
  id?: number;
  name: string;
  balance: number;
  type: 'checking' | 'savings' | 'cash' | 'investment';
  currency: string;
}

export interface Category {
  id?: number;
  name: string;
  color: string;
  icon: string;
  budgetLimit: number;
  type?: 'expense' | 'income';
}

export interface Transaction {
  id?: number;
  amount: number;
  description: string;
  type: 'expense' | 'income' | 'transfer';
  accountId: number;
  categoryId?: number;
  targetAccountId?: number;
  date: string;
  createdAt?: string;
}

export interface CSVMapping {
  dateIndex: number;
  amountIndex: number;
  merchantIndex: number;
}

export interface ReceiptData {
  amount: number | null;
  date: string | null;
  merchant: string;
  rawText: string;
}
```

## Code Layout
- `src/counter.ts`
- `src/utils.ts`
- `src/db.ts`
- `src/csvImporter.ts`
- `src/receiptScanner.ts`
- `src/main.ts`
- `index.html`
- `tsconfig.json`
- `package.json`
- `vite.config.js`
