import type { FC } from 'react';
import { memo } from 'react';
import type { Invoice, Policy } from '@/lib/billing/types';
import StatusBadge from './StatusBadge';

interface InvoiceTableProps {
  invoices: Invoice[];
  policies: Policy[];
}

const InvoiceTable: FC<InvoiceTableProps> = memo(function InvoiceTable({
  invoices,
  policies,
}) {
  const getPolicyById = (id: string): Policy | undefined =>
    policies.find((p) => p.id === id);

  if (invoices.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-slate-500">
        No invoices found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-100">
      <div className="grid grid-cols-6 bg-slate-50/80 px-3 py-2 text-xs font-semibold text-slate-600">
        <div>Invoice #</div>
        <div>Policy #</div>
        <div className="hidden sm:block">Insured</div>
        <div className="hidden md:block">Issue / Due</div>
        <div className="text-right">Amount</div>
        <div className="text-right">Status</div>
      </div>
      <ul className="divide-y divide-slate-100">
        {invoices.map((invoice) => {
          const policy = getPolicyById(invoice.policyId);
          return (
            <li
              key={invoice.id}
              className="grid grid-cols-6 items-center bg-white px-3 py-2 text-xs hover:bg-slate-50"
            >
              <div className="truncate font-mono text-slate-800">
                {invoice.invoiceNumber}
              </div>
              <div className="truncate font-mono text-slate-700">
                {policy?.policyNumber ?? '—'}
              </div>
              <div className="hidden truncate text-slate-600 sm:block">
                {policy?.insuredName ?? '—'}
              </div>
              <div className="hidden flex-col text-[11px] text-slate-500 md:flex">
                <span>{invoice.issueDate || '—'}</span>
                <span>Due: {invoice.dueDate || '—'}</span>
              </div>
              <div className="text-right text-slate-900">
                {invoice.amount.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
              </div>
              <div className="flex justify-end">
                <StatusBadge value={invoice.status} type="invoice" />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
});

export default InvoiceTable;