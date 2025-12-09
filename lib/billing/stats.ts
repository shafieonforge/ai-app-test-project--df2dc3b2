// lib/billing/stats.ts
import type { BillingStats, Policy, Invoice } from './types';

export function computeBillingStats(policies: Policy[], invoices: Invoice[]): BillingStats {
  const totalPremium = policies.reduce((sum, p) => sum + p.premium, 0);
  const totalCollected = invoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + i.amount, 0);
  const totalOutstanding = invoices
    .filter((i) => i.status !== 'paid')
    .reduce((sum, i) => sum + i.amount, 0);
  const activePolicies = policies.filter((p) => p.status === 'active').length;
  const overdueInvoices = invoices.filter((i) => i.status === 'overdue').length;

  return {
    totalPremium,
    totalOutstanding,
    totalCollected,
    activePolicies,
    overdueInvoices,
  };
}