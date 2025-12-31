import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency in AUD
export function formatAUD(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(amount);
}

// Format date in Australian format
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-AU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

// Format date with time
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-AU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

// Calculate GST (10% in Australia)
export function calculateGST(amount: number): number {
  return amount * 0.1;
}

// Calculate amount including GST
export function addGST(amount: number): number {
  return amount * 1.1;
}

// Calculate amount excluding GST
export function removeGST(amountWithGST: number): number {
  return amountWithGST / 1.1;
}

// Generate a short share ID
export function generateShareId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Validate Australian phone number
export function isValidAustralianPhone(phone: string): boolean {
  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, '');
  // Check for valid Australian mobile (04xx) or landline formats
  return /^(\+61|0)[2-478]\d{8}$/.test(cleaned) || /^(\+61|0)4\d{8}$/.test(cleaned);
}

// Format Australian phone number
export function formatAustralianPhone(phone: string): string {
  const cleaned = phone.replace(/[\s-]/g, '');
  if (cleaned.startsWith('+61')) {
    const local = cleaned.slice(3);
    return `+61 ${local.slice(0, 1)} ${local.slice(1, 5)} ${local.slice(5)}`;
  }
  if (cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
}

// Validate email
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Validate PayID (can be email or phone)
export function isValidPayId(payId: string): boolean {
  return isValidEmail(payId) || isValidAustralianPhone(payId);
}

// Validate BSB (6 digits)
export function isValidBSB(bsb: string): boolean {
  const cleaned = bsb.replace(/[\s-]/g, '');
  return /^\d{6}$/.test(cleaned);
}

// Format BSB with hyphen
export function formatBSB(bsb: string): string {
  const cleaned = bsb.replace(/[\s-]/g, '');
  if (cleaned.length === 6) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  }
  return bsb;
}

// Validate Australian account number (6-9 digits typically)
export function isValidAccountNumber(accountNumber: string): boolean {
  const cleaned = accountNumber.replace(/[\s-]/g, '');
  return /^\d{6,9}$/.test(cleaned);
}

// Split an amount evenly among n people, handling rounding
export function splitEvenly(amount: number, count: number): number[] {
  if (count <= 0) return [];
  
  const baseAmount = Math.floor((amount * 100) / count) / 100;
  const remainder = Math.round((amount - baseAmount * count) * 100) / 100;
  
  const splits = Array(count).fill(baseAmount);
  
  // Distribute remainder to first few people (1 cent each)
  const extraCents = Math.round(remainder * 100);
  for (let i = 0; i < extraCents; i++) {
    splits[i] = Math.round((splits[i] + 0.01) * 100) / 100;
  }
  
  return splits;
}

// Copy text to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

// Generate share URL
export function getShareUrl(shareId: string): string {
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXTAUTH_URL || 'http://localhost:3000';
  return `${baseUrl}/split/${shareId}`;
}
