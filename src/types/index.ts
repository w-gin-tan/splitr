// Perth Split - TypeScript Types

export interface ReceiptItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isShared: boolean;
  assignments: ItemAssignment[];
}

export interface ItemAssignment {
  id: string;
  itemId: string;
  participantId: string;
  portion: number;
  amount: number;
}

export interface Participant {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  color: string;
  amountOwed: number;
  amountPaid: number;
}

export interface Receipt {
  id: string;
  imageUrl?: string;
  venueName?: string;
  venueAddress?: string;
  date?: Date;
  subtotal?: number;
  gst?: number;
  total: number;
  currency: string;
  items: ReceiptItem[];
}

export interface Split {
  id: string;
  shareId: string;
  receiptId: string;
  title?: string;
  description?: string;
  payId?: string;
  bsb?: string;
  accountNumber?: string;
  accountName?: string;
  paypalEmail?: string;
  status: 'ACTIVE' | 'SETTLED' | 'CANCELLED';
  participants: Participant[];
  receipt: Receipt;
  payments: Payment[];
  createdAt: Date;
}

export interface Payment {
  id: string;
  splitId: string;
  participantId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  reference?: string;
  notes?: string;
  paidAt?: Date;
  confirmedAt?: Date;
}

export type PaymentMethod = 
  | 'PAYID'
  | 'BANK_TRANSFER'
  | 'PAYPAL'
  | 'BEEM_IT'
  | 'CASH'
  | 'OTHER';

export type PaymentStatus = 'PENDING' | 'CONFIRMED' | 'DECLINED';

// OCR Types
export interface OCRResult {
  success: boolean;
  rawText: string;
  items: ParsedItem[];
  total?: number;
  subtotal?: number;
  gst?: number;
  venueName?: string;
  date?: string;
}

export interface ParsedItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// Color palette for participants
export const PARTICIPANT_COLORS = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#EAB308', // Yellow
  '#22C55E', // Green
  '#14B8A6', // Teal
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#6B7280', // Gray
] as const;

export type ParticipantColor = typeof PARTICIPANT_COLORS[number];
