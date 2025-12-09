import type { FC } from 'react';
import { memo } from 'react';
import type { InvoiceStatus, PolicyStatus } from '@/lib/billing/types';

interface StatusBadgeProps {
  value: PolicyStatus | InvoiceStatus;
  type: 'policy' | 'invoice';
}

const StatusBadge: FC<StatusBadgeProps> = memo(function StatusBadge({ value, type }) {
  let className: string;

  if (type === 'policy') {
    if (value === 'active') {
      className = 'bg-emerald-50 text-emerald-700 ring-emerald-200';
    } else if (value === 'expired') {
      className = 'bg-slate-100 text-slate-600 ring-slate-200';
    } else {
      className = 'bg-rose-50 text-rose-700 ring-rose-200';
    }
  } else {
    if (value === 'paid') {
      className = 'bg-emerald-50 text-emerald-700 ring-emerald-200';
    } else if (value === 'overdue') {
      className = 'bg-rose-50 text-rose-700 ring-rose-200';
    } else {
      className = 'bg-amber-50 text-amber-700 ring-amber-200';
    }
  }

  return (
    <span
      className={`inline-flex items-center justify-end rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${className}`}
    >
      {value.toUpperCase()}
    </span>
  );
});

export default StatusBadge;