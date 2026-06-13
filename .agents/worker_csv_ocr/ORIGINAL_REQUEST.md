## 2026-06-13T20:37:00Z
Objective: Port `src/csvImporter.js` to `src/csvImporter.ts` and `src/receiptScanner.js` to `src/receiptScanner.ts`.
Tasks:
1. Read the contents of `d:\Antigravity playthings general\Android app\BudgetApp\src\csvImporter.js` and `d:\Antigravity playthings general\Android app\BudgetApp\src\receiptScanner.js`.
2. Define explicit TypeScript interfaces for:
   - `CSVMapping`: `{ dateIndex: number; amountIndex: number; merchantIndex: number; }`
   - `ReceiptData`: `{ amount: number | null; date: string | null; merchant: string; rawText: string; }`
3. Port `src/csvImporter.js` to `src/csvImporter.ts` using strict type annotations (e.g. `parseCSV(file: File): Promise<any[][]>`, `importMappedTransactions(data: any[][], mapping: CSVMapping, accountId: number): Promise<number>`).
4. Port `src/receiptScanner.js` to `src/receiptScanner.ts` using strict type annotations (e.g. `scanReceipt(imageFile: File): Promise<ReceiptData>`, `parseReceiptData(text: string): ReceiptData`).
5. Resolve external global libraries: Declare `Papa` and `Tesseract` globals (e.g. at the top of the files using `declare const Papa: any;` and `declare const Tesseract: any;` or via a shared declarations file `src/globals.d.ts`).
6. Delete the original JavaScript files `src/csvImporter.js` and `src/receiptScanner.js` once ported.
7. Run `npx tsc --noEmit` and `npm run build` to verify correctness. (Note: Node/npm commands may need `$env:PATH = "C:\Program Files\nodejs;" + $env:PATH` prepended to execute correctly).

Scope:
- Only modify files related to `csvImporter` and `receiptScanner` (and optionally a globals declaration file).

Output:
Write a handoff report at `d:\Antigravity playthings general\Android app\BudgetApp\.agents\worker_csv_ocr\handoff.md` showing the contents of the new `.ts` files, verification outputs, and type declarations.
