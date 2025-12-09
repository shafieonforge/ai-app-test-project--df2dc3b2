import type { BillingStats, Invoice, Policy } from './types';

export function computeBillingStats(policies: Policy[], invoices: Invoice[]): BillingStats {
  const totalPremium = policies.reduce((sum, p) => sum + p.premium, 0);
  const totalCollected = invoices
    .filter((invoice) => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.amount, 0);
  const totalOutstanding = invoices
    .filter((invoice) => invoice.status !== 'paid')
    .reduce((sum, invoice) => sum + invoice.amount, 0);
  const activePolicies = policies.filter((policy) => policy.status === 'active').length;
  const overdueInvoices = invoices.filter((invoice) => invoice.status === 'overdue').length;

  return {
    totalPremium,
    totalOutstanding,
    totalCollected,
    activePolicies,
    overdueInvoices,
  };
}