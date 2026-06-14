import { openDB, DBSchema, IDBPDatabase } from 'idb';

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

export interface CategoryRule {
  id?: number;
  keyword: string;
  categoryId: number;
  type: 'expense' | 'income';
}

export interface BudgetDB extends DBSchema {
  transactions: {
    key: number;
    value: Transaction;
    indexes: {
      date: string;
      categoryId: number;
      accountId: number;
    };
  };
  categories: {
    key: number;
    value: Category;
  };
  accounts: {
    key: number;
    value: Account;
  };
  categoryRules: {
    key: number;
    value: CategoryRule;
    indexes: {
      keyword: string;
    };
  };
}

const DB_NAME = 'budgetapp_db_es_v2';
const DB_VERSION = 2;

export async function initDB(): Promise<IDBPDatabase<BudgetDB>> {
  return openDB<BudgetDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Transactions Store
      if (!db.objectStoreNames.contains('transactions')) {
        const txStore = db.createObjectStore('transactions', { keyPath: 'id', autoIncrement: true });
        txStore.createIndex('date', 'date');
        txStore.createIndex('categoryId', 'categoryId');
        txStore.createIndex('accountId', 'accountId');
      }

      // Categories Store
      if (!db.objectStoreNames.contains('categories')) {
        db.createObjectStore('categories', { keyPath: 'id', autoIncrement: true });
      }

      // Accounts Store
      if (!db.objectStoreNames.contains('accounts')) {
        db.createObjectStore('accounts', { keyPath: 'id', autoIncrement: true });
      }

      // Category Rules Store
      if (!db.objectStoreNames.contains('categoryRules')) {
        const ruleStore = db.createObjectStore('categoryRules', { keyPath: 'id', autoIncrement: true });
        ruleStore.createIndex('keyword', 'keyword', { unique: true });
      }
    },
  });
}

// Seed default data if empty
export async function seedDefaults(): Promise<void> {
  const db = await initDB();
  
  // Seed default accounts
  const accountsCount = await db.count('accounts');
  if (accountsCount === 0) {
    await db.add('accounts', { name: 'Cuenta Principal', balance: 0, type: 'checking', currency: 'ARS' });
    await db.add('accounts', { name: 'Efectivo', balance: 0, type: 'cash', currency: 'ARS' });
  }

  // Seed default categories
  const catCount = await db.count('categories');
  if (catCount === 0) {
    const defaultCategories: Category[] = [
      { name: 'Vivienda', color: '#f85149', icon: 'ph-house', budgetLimit: 150000 },
      { name: 'Comida', color: '#d29922', icon: 'ph-fork-knife', budgetLimit: 80000 },
      { name: 'Transporte', color: '#2f81f7', icon: 'ph-car', budgetLimit: 30000 },
      { name: 'Entretenimiento', color: '#a371f7', icon: 'ph-popcorn', budgetLimit: 20000 },
      { name: 'Servicios', color: '#89929b', icon: 'ph-lightning', budgetLimit: 40000 },
      { name: 'Salud', color: '#f77cd8', icon: 'ph-heart', budgetLimit: 30000 }, // Added for MercadoPago screenshot
      { name: 'Sueldo', color: '#238636', icon: 'ph-money', type: 'income', budgetLimit: 0 }
    ];
    for (const cat of defaultCategories) {
      await db.add('categories', cat);
    }
  }
}

// Data Access Object (DAO) helpers
export const dbAPI = {
  // TRANSACTIONS
  async getTransactions(): Promise<Transaction[]> {
    const db = await initDB();
    return db.getAllFromIndex('transactions', 'date'); // sorted by date
  },
  async addTransaction(tx: Transaction): Promise<number> {
    const db = await initDB();
    const id = await db.add('transactions', { ...tx, createdAt: new Date().toISOString() });
    
    // Update account balance
    const account = await db.get('accounts', tx.accountId);
    if (account) {
      if (tx.type === 'transfer') {
        account.balance -= tx.amount;
        await db.put('accounts', account);
        if (tx.targetAccountId) {
          const targetAccount = await db.get('accounts', tx.targetAccountId);
          if (targetAccount) {
            targetAccount.balance += tx.amount;
            await db.put('accounts', targetAccount);
          }
        }
      } else {
        account.balance += (tx.type === 'income' ? tx.amount : -tx.amount);
        await db.put('accounts', account);
      }
    }
    return id;
  },
  async getTransaction(id: number): Promise<Transaction | undefined> {
    const db = await initDB();
    return db.get('transactions', id);
  },
  async updateTransaction(id: number, updatedTx: Transaction): Promise<boolean> {
    const db = await initDB();
    const oldTx = await db.get('transactions', id);
    if (!oldTx) return false;

    // 1. Revert old transaction effect
    const oldAccount = await db.get('accounts', oldTx.accountId);
    if (oldAccount) {
      if (oldTx.type === 'transfer') {
        oldAccount.balance += oldTx.amount;
        await db.put('accounts', oldAccount);
        if (oldTx.targetAccountId) {
          const oldTarget = await db.get('accounts', oldTx.targetAccountId);
          if (oldTarget) {
            oldTarget.balance -= oldTx.amount;
            await db.put('accounts', oldTarget);
          }
        }
      } else {
        oldAccount.balance -= (oldTx.type === 'income' ? oldTx.amount : -oldTx.amount);
        await db.put('accounts', oldAccount);
      }
    }

    // 2. Apply new transaction effect
    const newAccount = await db.get('accounts', updatedTx.accountId);
    if (newAccount) {
      if (updatedTx.type === 'transfer') {
        newAccount.balance -= updatedTx.amount;
        await db.put('accounts', newAccount);
        if (updatedTx.targetAccountId) {
          const newTarget = await db.get('accounts', updatedTx.targetAccountId);
          if (newTarget) {
            newTarget.balance += updatedTx.amount;
            await db.put('accounts', newTarget);
          }
        }
      } else {
        newAccount.balance += (updatedTx.type === 'income' ? updatedTx.amount : -updatedTx.amount);
        await db.put('accounts', newAccount);
      }
    }

    // Update the transaction
    updatedTx.id = id;
    updatedTx.createdAt = oldTx.createdAt;
    await db.put('transactions', updatedTx);
    return true;
  },
  async deleteTransaction(id: number): Promise<boolean> {
    const db = await initDB();
    const tx = await db.get('transactions', id);
    if (!tx) return false;

    // Revert effect on balance
    const account = await db.get('accounts', tx.accountId);
    if (account) {
      if (tx.type === 'transfer') {
        account.balance += tx.amount;
        await db.put('accounts', account);
        if (tx.targetAccountId) {
          const targetAccount = await db.get('accounts', tx.targetAccountId);
          if (targetAccount) {
            targetAccount.balance -= tx.amount;
            await db.put('accounts', targetAccount);
          }
        }
      } else {
        account.balance -= (tx.type === 'income' ? tx.amount : -tx.amount);
        await db.put('accounts', account);
      }
    }

    await db.delete('transactions', id);
    return true;
  },
  
  // CATEGORIES
  async getCategories(): Promise<Category[]> {
    const db = await initDB();
    return db.getAll('categories');
  },
  async getCategory(id: number): Promise<Category | undefined> {
    const db = await initDB();
    return db.get('categories', id);
  },
  async addCategory(cat: Category): Promise<number> {
    const db = await initDB();
    return db.add('categories', cat);
  },
  async updateCategory(id: number, updatedCat: Category): Promise<boolean> {
    const db = await initDB();
    updatedCat.id = id;
    await db.put('categories', updatedCat);
    return true;
  },
  async deleteCategory(id: number): Promise<boolean> {
    const db = await initDB();
    await db.delete('categories', id);
    return true;
  },
  
  // ACCOUNTS
  async getAccounts(): Promise<Account[]> {
    const db = await initDB();
    return db.getAll('accounts');
  },
  async getAccount(id: number): Promise<Account | undefined> {
    const db = await initDB();
    return db.get('accounts', id);
  },
  async addAccount(account: Account): Promise<number> {
    const db = await initDB();
    return db.add('accounts', account);
  },
  async updateAccount(id: number, updatedAccount: Account): Promise<boolean> {
    const db = await initDB();
    updatedAccount.id = id;
    await db.put('accounts', updatedAccount);
    return true;
  },
  async deleteAccount(id: number): Promise<boolean> {
    const db = await initDB();
    await db.delete('accounts', id);
    return true;
  },
  
  // UTILS
  async getLiquidBalance(): Promise<number> {
    const accounts = await this.getAccounts();
    return accounts
      .filter(acc => acc.type !== 'savings' && acc.type !== 'investment')
      .reduce((sum: number, acc: Account) => sum + acc.balance, 0);
  },
  async getNetWorth(): Promise<number> {
    const accounts = await this.getAccounts();
    return accounts.reduce((sum: number, acc: Account) => sum + acc.balance, 0);
  },
  
  // CATEGORY RULES
  async learnCategoryRule(keyword: string, categoryId: number, type: 'expense' | 'income'): Promise<void> {
    const db = await initDB();
    keyword = keyword.trim().toLowerCase();
    if (!keyword) return;
    
    const existing = await db.getFromIndex('categoryRules', 'keyword', keyword);
    if (existing) {
      existing.categoryId = categoryId;
      existing.type = type;
      await db.put('categoryRules', existing);
    } else {
      await db.add('categoryRules', { keyword, categoryId, type });
    }
  },
  async getCategoryRule(keyword: string): Promise<CategoryRule | undefined> {
    const db = await initDB();
    keyword = keyword.trim().toLowerCase();
    return db.getFromIndex('categoryRules', 'keyword', keyword);
  }
};
