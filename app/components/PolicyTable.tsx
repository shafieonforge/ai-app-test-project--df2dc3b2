import type { FC } from 'react';
import { memo } from 'react';
import type { Policy } from '@/lib/billing/types';
import StatusBadge from './StatusBadge';

interface PolicyTableProps {
  policies: Policy[];
}

const PolicyTable: FC<PolicyTableProps> = memo(function PolicyTable({ policies }) {
  if (policies.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-slate-500">
        No policies found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-100">
      <div className="grid grid-cols-6 bg-slate-50/80 px-3 py-2 text-xs font-semibold text-slate-600">
        <div>Policy #</div>
        <div>Insured</div>
        <div className="hidden sm:block">Vehicle</div>
        <div className="hidden md:block">Emirate</div>
        <div className="text-right">Premium</div>
        <div className="text-right">Status</div>
      </div>
      <ul className="divide-y divide-slate-100">
        {policies.map((policy) => (
          <li
            key={policy.id}
            className="grid grid-cols-6 items-center bg-white px-3 py-2 text-xs hover:bg-slate-50"
          >
            <div className="truncate font-mono text-slate-800">
              {policy.policyNumber}
            </div>
            <div className="truncate text-slate-800">
              {policy.insuredName}
            </div>
            <div className="hidden truncate text-slate-600 sm:block">
              {policy.vehiclePlate}
            </div>
            <div className="hidden truncate text-slate-600 md:block">
              {policy.emirate}
            </div>
            <div className="text-right text-slate-900">
              {policy.premium.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex justify-end">
              <StatusBadge value={policy.status} type="policy" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
});

export default PolicyTable;