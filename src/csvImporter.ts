import { dbAPI, Transaction } from './db.js';

export function parseCSV(file: File): Promise<any[][]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: false, // Start without headers so we can preview the raw array
      skipEmptyLines: true,
      complete: function(results: any) {
        if (results.errors.length && !results.data.length) {
          reject(new Error("Error al analizar el archivo CSV"));
        } else {
          resolve(results.data); // Array of arrays (rows of columns)
        }
      },
      error: function(err: Error) {
        reject(err);
      }
    });
  });
}

/**
 * Maps the raw CSV data to transactions and saves them
 * @param data - The parsed CSV data
 * @param mapping - { dateIndex, amountIndex, merchantIndex }
 * @param accountId - The account to add transactions to
 */
export async function importMappedTransactions(
  data: any[][],
  mapping: CSVMapping,
  accountId: number
): Promise<number> {
  const { dateIndex, amountIndex, merchantIndex } = mapping;
  let importedCount = 0;

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    
    // Skip likely header rows if they don't contain a number in the amount column
    if (isNaN(parseFloat(row[amountIndex]))) {
      continue;
    }

    const dateRaw = row[dateIndex];
    const amountRaw = row[amountIndex];
    const merchantRaw = row[merchantIndex];

    if (!amountRaw) continue;

    // Try to normalize the amount (remove commas, dollar signs)
    const amountStr = amountRaw.toString().replace(/[$,]/g, '').trim();
    let amount = parseFloat(amountStr);
    
    if (isNaN(amount)) continue;

    // If bank exports expenses as negative, we want them positive in our DB
    // Or if they are negative, it's an expense, positive is income
    let type: 'expense' | 'income' = 'expense';
    if (amount > 0) {
      type = 'income';
    } else {
      amount = Math.abs(amount);
    }

    // Very naive date parsing (assuming YYYY-MM-DD or MM/DD/YYYY)
    let date = new Date().toISOString().split('T')[0];
    if (dateRaw) {
      const parsedDate = new Date(dateRaw);
      if (!isNaN(parsedDate.getTime())) {
        date = parsedDate.toISOString().split('T')[0];
      }
    }

    const tx: Transaction = {
      amount: amount,
      description: merchantRaw ? merchantRaw.substring(0, 50) : 'Transacción Importada',
      type: type,
      accountId: accountId,
      date: date
    };

    await dbAPI.addTransaction(tx);
    importedCount++;
  }

  return importedCount;
}
