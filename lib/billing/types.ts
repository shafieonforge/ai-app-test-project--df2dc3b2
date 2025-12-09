export type PolicyStatus = 'active' | 'cancelled' | 'expired';
export type InvoiceStatus = 'pending' | 'paid' | 'overdue';

export interface Policy {
  id: string;
  policyNumber: string;
  insuredName: string;
  vehiclePlate: string;
  emirate: string;
  inceptionDate: string;
  expiryDate: string;
  premium: number;
  status: PolicyStatus;
}

export interface Invoice {
  id: string;
  policyId: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  status: InvoiceStatus;
}

export interface BillingStats {
  totalPremium: number;
  totalOutstanding: number;
  totalCollected: number;
  activePolicies: number;
  overdueInvoices: number;
}