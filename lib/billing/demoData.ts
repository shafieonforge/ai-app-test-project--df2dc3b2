// lib/billing/demoData.ts
import type { Policy, Invoice } from './types';

export const DEMO_POLICIES: Policy[] = [
  {
    id: 'pol-1',
    policyNumber: 'DXB-MTR-2025-0101',
    insuredName: 'Emirates Auto Brokers LLC',
    vehiclePlate: 'D 12345',
    emirate: 'Dubai',
    inceptionDate: '2025-01-01',
    expiryDate: '2025-12-31',
    premium: 12500,
    status: 'active',
  },
  {
    id: 'pol-2',
    policyNumber: 'AUH-MTR-2024-2201',
    insuredName: 'Gulf Motor Leasing FZ-LLC',
    vehiclePlate: 'AD 90876',
    emirate: 'Abu Dhabi',
    inceptionDate: '2024-06-15',
    expiryDate: '2025-06-14',
    premium: 18900,
    status: 'active',
  },
  {
    id: 'pol-3',
    policyNumber: 'SHJ-MTR-2024-0912',
    insuredName: 'Sharjah Cargo Transport',
    vehiclePlate: 'S 55432',
    emirate: 'Sharjah',
    inceptionDate: '2024-01-10',
    expiryDate: '2025-01-09',
    premium: 9800,
    status: 'expired',
  },
];

export const DEMO_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    policyId: 'pol-1',
    invoiceNumber: 'INV-UAE-2001',
    issueDate: '2025-01-05',
    dueDate: '2025-01-20',
    amount: 6250,
    status: 'pending',
  },
  {
    id: 'inv-2',
    policyId: 'pol-1',
    invoiceNumber: 'INV-UAE-2002',
    issueDate: '2024-12-10',
    dueDate: '2024-12-25',
    amount: 6250,
    status: 'paid',
  },
  {
    id: 'inv-3',
    policyId: 'pol-2',
    invoiceNumber: 'INV-UAE-2003',
    issueDate: '2024-12-01',
    dueDate: '2024-12-20',
    amount: 9450,
    status: 'overdue',
  },
];