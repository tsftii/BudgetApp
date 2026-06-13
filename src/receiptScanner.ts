export async function preprocessImage(imageFile: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(URL.createObjectURL(imageFile)); // Fallback if no canvas support
        return;
      }
      
      // Limit resolution to avoid crashing Tesseract and improve speed
      const maxDim = 2048;
      let width = img.width;
      let height = img.height;
      
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.floor((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.floor((width * maxDim) / height);
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw original image
      ctx.drawImage(img, 0, 0, width, height);

      // Get pixel data
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      // Apply grayscale and contrast boost
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Grayscale (Luminance)
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
        
        // Boost contrast slightly to make text pop against paper
        const contrast = 60; // 0-255 scale
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        const newLuminance = factor * (luminance - 128) + 128;
        const clamped = Math.max(0, Math.min(255, newLuminance));
        
        data[i] = clamped;     // R
        data[i+1] = clamped;   // G
        data[i+2] = clamped;   // B
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(imageFile);
  });
}

export interface InvestmentReceiptData {
  capital: number | null;
  tna: number | null;
  days: number | null;
}

export async function scanInvestmentReceipt(imageFile: File): Promise<InvestmentReceiptData> {
  try {
    const processedImageUrl = await preprocessImage(imageFile);
    const result = await Tesseract.recognize(processedImageUrl, 'spa', {
      logger: (m: any) => console.log(m)
    });
    return parseInvestmentReceiptData(result.data.text);
  } catch (error) {
    console.error("OCR Error:", error);
    throw new Error("Error al escanear el comprobante de inversión");
  }
}

export function parseInvestmentReceiptData(text: string): InvestmentReceiptData {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  let capital: number | null = null;
  let tna: number | null = null;
  let days: number | null = null;

  function parseNumber(str: string): number | null {
    let clean = str.replace(/[^\d\.,]/g, '');
    if (clean.includes(',') && clean.includes('.')) {
      clean = clean.replace(/\./g, ''); 
      clean = clean.replace(',', '.'); 
      return parseFloat(clean);
    }
    if (clean.includes(',')) {
      clean = clean.replace(',', '.');
      return parseFloat(clean);
    }
    return parseFloat(clean);
  }

  // 1. Find TNA
  const tnaRegex = /(?:tna|tasa.*?anual|rendimiento).*?([\d\.,]+)\s*%/i;
  for (const line of lines) {
    const match = line.match(tnaRegex);
    if (match) {
      const val = parseNumber(match[1]);
      if (val) { tna = val; break; }
    }
  }

  // 2. Find Capital
  const capitalRegex = /(?:capital|inversión|monto|invertiste).*?\$?\s*([\d\.,]+)/i;
  for (const line of lines) {
    if (line.match(/tna|tasa/i)) continue; // avoid mixing up percentage
    const match = line.match(capitalRegex);
    if (match) {
      const val = parseNumber(match[1]);
      if (val && String(val).includes('.')) { // Usually has decimals or is large
         capital = val;
         break;
      }
    }
  }

  // 3. Find Days (Plazo)
  const daysRegex = /(?:plazo|duración|días).*?(\d+)/i;
  for (const line of lines) {
    const match = line.match(daysRegex);
    if (match) {
      const val = parseInt(match[1]);
      if (val && val < 1000) { days = val; break; }
    }
  }

  // Fallback if not found on the same line (look for "Plazo" then next line is "30")
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (!tna && (line.includes('tna') || line.includes('tasa'))) {
      if (i + 1 < lines.length) {
        const match = lines[i+1].match(/([\d\.,]+)\s*%/);
        if (match) { tna = parseNumber(match[1]); }
      }
    }
    if (!days && (line.includes('plazo') || line.includes('días'))) {
      if (i + 1 < lines.length) {
        const match = lines[i+1].match(/^(\d+)$/);
        if (match) { days = parseInt(match[1]); }
      }
    }
  }

  return { capital, tna, days };
}

export async function scanReceipt(imageFile: File): Promise<ReceiptData> {
  try {
    const processedImageUrl = await preprocessImage(imageFile);
    
    // We can use recognize directly which manages worker creation and destruction internally
    const result = await Tesseract.recognize(processedImageUrl, 'spa', {
      logger: (m: any) => console.log(m)
    });
    return parseReceiptData(result.data.text);
  } catch (error) {
    console.error("OCR Error:", error);
    throw new Error("Error al escanear el recibo");
  }
}

export function parseReceiptData(text: string): ReceiptData {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  let amount: number | null = null;
  let date: string | null = null;
  
  // Clean merchant heuristic
  let merchant = '';
  let foundMpMerchant = false;
  // Mercado Pago usually has the merchant name directly above "Pago online" or "Aprobado"
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (line.includes('pago online') || line.includes('aprobado') || line.includes('transferencia enviada')) {
      if (i > 0) {
        let candidate = lines[i-1];
        // If the line above is a price, it might be the generic layout where the merchant is 2 lines above
        if (candidate.match(/^[0-9\W]+$/) && i > 1) {
          candidate = lines[i-2];
        }
        if (!candidate.match(/^[0-9\W]+$/)) {
          merchant = candidate;
          foundMpMerchant = true;
        }
      }
      break;
    }
  }

  if (!foundMpMerchant) {
    for (const line of lines) {
      if (line.match(/^[0-9\W]+$/)) continue; // skip pure numbers/symbols
      if (line.toLowerCase().match(/(welcome|receipt|store|tax|total|amount|due|change|pago|tarjeta|aprobado|mercado)/)) continue;
      if (line.length > 3) {
        merchant = line;
        break;
      }
    }
  }

  // Robust ARS number parser
  function parseArsMoney(str: string): number | null {
    let clean = str.replace(/[^\d\.,]/g, '');
    if (clean.includes(',') && clean.includes('.')) {
      clean = clean.replace(/\./g, ''); // remove thousands separator
      clean = clean.replace(',', '.'); // convert decimal comma to period
      return parseFloat(clean);
    }
    if (clean.includes(',')) {
      clean = clean.replace(',', '.');
      return parseFloat(clean);
    }
    if (clean.includes('.')) {
      const parts = clean.split('.');
      if (parts[1] && parts[1].length === 3) {
        return parseFloat(clean.replace(/\./g, ''));
      }
      return parseFloat(clean);
    }
    return parseFloat(clean);
  }

  // 1. Look for lines with "Total", "Monto", "Importe" or "Conversión"
  const totalRegex = /(?:total|monto|importe|suma|pago)\s*.*?\$?\s*([\d\.,\s]+)/i;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // MP specific: Conversión US$10 -> $15.409,59
    const conversionMatch = line.match(/(?:conversión).*?\$.*?\$\s*([\d\.,\s]+)/i);
    if (conversionMatch) {
      const val = parseArsMoney(conversionMatch[1]);
      if (val && !isNaN(val)) {
        amount = val;
        break;
      }
    }
    
    const match = totalRegex.exec(line);
    if (match) {
      // Check if it's explicitly labeled monto/total and has a reasonable value
      const val = parseArsMoney(match[1]);
      // If there's no $ sign in the match and no decimals, it might be a CC number.
      // Let's ensure it has a $ OR it has decimals.
      if (val && !isNaN(val)) {
        if (line.includes('$') || String(val).includes('.')) {
          amount = val;
          break;
        }
      }
    }
    
    if (line.toLowerCase().match(/(total|monto|importe)/)) {
      if (i + 1 < lines.length) {
        // Strict requirement for $ if it's on the next line
        const nextLineMatch = lines[i+1].match(/\$\s*([\d\.,\s]+)/);
        if (nextLineMatch) {
          const val = parseArsMoney(nextLineMatch[1]);
          if (val && !isNaN(val)) {
            amount = val;
            break;
          }
        }
      }
    }
  }

  // Fallback to max value
  if (amount === null) {
    let maxVal = 0;
    // Strict requirement: MUST have a $ sign for the fallback so we don't catch credit card numbers
    const currencyRegex = /\$\s*(\d{1,3}(?:[\.\,]\d{3})*(?:[\.\,]\d{2})?|\d+(?:[\.\,]\d{2})?)/g;
    for (const line of lines) {
      let match: RegExpExecArray | null;
      while ((match = currencyRegex.exec(line)) !== null) {
        const val = parseArsMoney(match[1]);
        if (val && val > maxVal && val < 5000000) { 
          maxVal = val;
        }
      }
    }
    if (maxVal > 0) amount = maxVal;
  }

  // Better Date Parsing for Argentina (DD/MM/YYYY, DD/MMM)
  const dateRegexes = [
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})\b/,
    /(\d{1,2})\/([a-z]{3})/i // e.g. 11/jun
  ];
  
  for (const line of lines) {
    for (const rx of dateRegexes) {
      const match = line.match(rx);
      if (match) {
        if (rx === dateRegexes[2]) {
           const d = match[1].padStart(2, '0');
           const months: Record<string, string> = {
             'ene': '01', 'feb': '02', 'mar': '03', 'abr': '04', 'may': '05', 'jun': '06',
             'jul': '07', 'ago': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dic': '12'
           };
           const m = months[match[2].toLowerCase()] || '01';
           date = `${new Date().getFullYear()}-${m}-${d}`;
        } else {
           let y = match[3];
           if (y.length === 2) y = "20" + y;
           const m = match[2].padStart(2, '0');
           const d = match[1].padStart(2, '0');
           date = `${y}-${m}-${d}`;
        }
        break;
      }
    }
    if (date) break;
  }

  return { amount, date, merchant, rawText: text };
}
