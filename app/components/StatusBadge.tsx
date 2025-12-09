// app/components/StatusBadge.tsx
import type { FC } from 'react';
import { memo } from 'react';
import type { InvoiceStatus, PolicyStatus } from '@/lib/billing/types';

interface StatusBadgeProps {
  value: PolicyStatus | InvoiceStatus;
  type: 'policy' | 'invoice';
}

const StatusBadge: FC<StatusBadgeProps> = memo(function StatusBadge({ value, type }) {
  let className = '';
  if (type === 'policy') {
    className =
      value === 'active'
        ? 'bg-green-50 text-green-700'
        : value === 'expired'
        ? 'bg-gray-100 text-gray-700'
        : 'bg-red-50 text-red-700';
  } else {
    className =
      value === 'paid'
        ? 'bg-green-50 text-green-700'
        : value === 'overdue'
        ? 'bg-red-50 text-red-700'
        : 'bg-amber-50 text-amber-700';
  }

  return (
    <span
      className={`inline-flex items-center justify-end rounded-full px-2 py-0.5 text-[10px] font-semibold ${className}`}
    >
      {value.toUpperCase()}
    </span>
  );
});

export default StatusBadge;