declare const Papa: any;
declare const Tesseract: any;

interface CSVMapping {
  dateIndex: number;
  amountIndex: number;
  merchantIndex: number;
}

interface ReceiptData {
  amount: number | null;
  date: string | null;
  merchant: string;
  rawText: string;
}

interface Window {
  editTransaction: (id: number) => Promise<void>;
  deleteTransaction: () => Promise<void>;
  openCategoryModal: () => void;
  editCategory: (id: number) => Promise<void>;
  deleteCategory: () => Promise<void>;
  openAccountModal: () => void;
  editAccount: (id: number) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

