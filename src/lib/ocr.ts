import Tesseract from 'tesseract.js';
import type { OCRResult, ParsedItem } from '@/types';

// Process image with Tesseract.js (runs in browser or Node.js)
export async function processReceiptImage(imageSource: string | File): Promise<OCRResult> {
  try {
    const result = await Tesseract.recognize(
      imageSource,
      'eng',
      {
        logger: (m) => {
          if (process.env.NODE_ENV === 'development') {
            console.log(m);
          }
        },
      }
    );

    const rawText = result.data.text;
    const parsedData = parseReceiptText(rawText);

    return {
      success: true,
      rawText,
      ...parsedData,
    };
  } catch (error) {
    console.error('OCR Error:', error);
    return {
      success: false,
      rawText: '',
      items: [],
    };
  }
}

// Parse the raw OCR text to extract structured data
export function parseReceiptText(text: string): Omit<OCRResult, 'success' | 'rawText'> {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  
  const items: ParsedItem[] = [];
  let total: number | undefined;
  let subtotal: number | undefined;
  let gst: number | undefined;
  let venueName: string | undefined;
  let date: string | undefined;

  // Try to find venue name (usually at the top)
  if (lines.length > 0) {
    // First non-empty line that's not a number is likely the venue name
    for (const line of lines.slice(0, 5)) {
      if (!/^\d/.test(line) && !/total|subtotal|gst|tax|change|cash|card/i.test(line)) {
        venueName = line;
        break;
      }
    }
  }

  // Try to find date (common Australian formats)
  const datePatterns = [
    /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/,
    /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})/i,
  ];

  for (const line of lines) {
    for (const pattern of datePatterns) {
      const match = line.match(pattern);
      if (match) {
        date = match[1];
        break;
      }
    }
    if (date) break;
  }

  // Parse items and prices
  // Common patterns: "Item Name    $XX.XX" or "Item Name    XX.XX"
  const pricePattern = /\$?\s*(\d+[.,]\d{2})\s*$/;
  const itemPattern = /^(.+?)\s+\$?\s*(\d+[.,]\d{2})\s*$/;
  const qtyItemPattern = /^(\d+)\s*[xX×]\s*(.+?)\s+\$?\s*(\d+[.,]\d{2})\s*$/;

  for (const line of lines) {
    // Skip common non-item lines
    if (/^(subtotal|sub total|total|gst|tax|change|cash|card|eftpos|visa|mastercard|amex|thank|welcome)/i.test(line)) {
      continue;
    }

    // Try quantity pattern first (e.g., "2 x Burger $30.00")
    const qtyMatch = line.match(qtyItemPattern);
    if (qtyMatch) {
      const quantity = parseInt(qtyMatch[1], 10);
      const name = qtyMatch[2].trim();
      const totalPrice = parsePrice(qtyMatch[3]);
      
      if (name.length > 1 && totalPrice > 0) {
        items.push({
          name,
          quantity,
          unitPrice: totalPrice / quantity,
          totalPrice,
        });
        continue;
      }
    }

    // Try simple item pattern (e.g., "Burger $15.00")
    const itemMatch = line.match(itemPattern);
    if (itemMatch) {
      const name = itemMatch[1].trim();
      const price = parsePrice(itemMatch[2]);
      
      // Filter out obvious non-items
      if (name.length > 1 && price > 0 && price < 10000) {
        items.push({
          name,
          quantity: 1,
          unitPrice: price,
          totalPrice: price,
        });
      }
    }
  }

  // Find totals
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    const priceMatch = line.match(pricePattern);
    
    if (priceMatch) {
      const price = parsePrice(priceMatch[1]);
      
      if (/\b(sub\s*total)\b/i.test(lowerLine)) {
        subtotal = price;
      } else if (/\bgst\b|\btax\b/i.test(lowerLine)) {
        gst = price;
      } else if (/\btotal\b/i.test(lowerLine) && !/sub/i.test(lowerLine)) {
        total = price;
      }
    }
  }

  // If we found a total but no subtotal, calculate it
  if (total && !subtotal && gst) {
    subtotal = total - gst;
  }

  // If we have items but no total, sum them up
  if (!total && items.length > 0) {
    total = items.reduce((sum, item) => sum + item.totalPrice, 0);
  }

  return {
    items,
    total,
    subtotal,
    gst,
    venueName,
    date,
  };
}

// Helper to parse price strings
function parsePrice(priceStr: string): number {
  // Handle both "." and "," as decimal separator
  const normalized = priceStr.replace(',', '.');
  const price = parseFloat(normalized);
  return isNaN(price) ? 0 : Math.round(price * 100) / 100;
}

// Clean up item names
export function cleanItemName(name: string): string {
  return name
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s\-&']/g, '')
    .trim();
}
