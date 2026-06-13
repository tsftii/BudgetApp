import { initDB, dbAPI } from './db.js';

// Convert string to ArrayBuffer
function str2ab(str: string): ArrayBuffer {
  return new TextEncoder().encode(str);
}

// Convert ArrayBuffer to string
function ab2str(buf: ArrayBuffer): string {
  return new TextDecoder().decode(buf);
}

// Derive a key from a password
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    str2ab(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
  
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function exportBackup(password: string): Promise<Blob> {
  const db = await initDB();
  const data = {
    accounts: await dbAPI.getAccounts(),
    categories: await dbAPI.getCategories(),
    transactions: await dbAPI.getTransactions(),
    rules: await db.getAll('categoryRules')
  };
  
  const jsonStr = JSON.stringify(data);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  
  const key = await deriveKey(password, salt);
  
  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv
    },
    key,
    str2ab(jsonStr)
  );
  
  // Combine salt, iv, and encrypted data into one payload
  const payload = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  payload.set(salt, 0);
  payload.set(iv, salt.length);
  payload.set(new Uint8Array(encrypted), salt.length + iv.length);
  
  return new Blob([payload], { type: 'application/octet-stream' });
}

export async function importBackup(blob: Blob, password: string): Promise<void> {
  const arrayBuffer = await blob.arrayBuffer();
  const payload = new Uint8Array(arrayBuffer);
  
  if (payload.length < 28) {
    throw new Error("Archivo de respaldo inválido o corrupto.");
  }

  const salt = payload.slice(0, 16);
  const iv = payload.slice(16, 28);
  const encrypted = payload.slice(28);
  
  const key = await deriveKey(password, salt);
  
  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      key,
      encrypted
    );
    
    const jsonStr = ab2str(decryptedBuffer);
    const data = JSON.parse(jsonStr);
    
    if (!data.accounts || !data.categories || !data.transactions) {
      throw new Error("Formato de datos irreconocible.");
    }

    // Clear and restore
    const db = await initDB();
    const tx = db.transaction(['accounts', 'categories', 'transactions', 'categoryRules'], 'readwrite');
    
    await tx.objectStore('accounts').clear();
    for (const acc of data.accounts) await tx.objectStore('accounts').put(acc);
    
    await tx.objectStore('categories').clear();
    for (const cat of data.categories) await tx.objectStore('categories').put(cat);
    
    await tx.objectStore('transactions').clear();
    for (const txn of data.transactions) await tx.objectStore('transactions').put(txn);
    
    await tx.objectStore('categoryRules').clear();
    for (const rule of data.rules || []) await tx.objectStore('categoryRules').put(rule);
    
    await tx.done;
  } catch (e) {
    throw new Error("Contraseña incorrecta o archivo dañado.");
  }
}
