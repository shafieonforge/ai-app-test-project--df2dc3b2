'use client';

import type { FC } from 'react';
import { memo, useEffect, useMemo, useState } from 'react';
import type { BillingStats, Invoice, Policy } from '@/lib/billing/types';
import type { ApiState } from '@/lib/billing/types';
import { DEMO_INVOICES, DEMO_POLICIES } from '@/lib/billing/demoData';
import { computeBillingStats } from '@/lib/billing/stats';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

interface ReportsData {
  policies: Policy[];
  invoices: Invoice[];
}

const ReportsPage: FC = memo(function ReportsPage() {
  const [state, setState] = useState<ApiState<ReportsData>>({
    data: null,
    error: null,
    loading: true,
  });

  const hasSupabaseEnv =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  useEffect(() => {
    let isMounted = true;

    if (!hasSupabaseEnv) {
      if (!isMounted) return;
      setState({
        data: { policies: DEMO_POLICIES, invoices: DEMO_INVOICES },
        error: 'Supabase not configured. Showing demo reports.',
        loading: false,
      });
      return;
    }

    const fetchData = async () => {
      try {
        const supabase = createSupabaseBrowserClient();

        const [policiesRes, invoicesRes] = await Promise.all([
          supabase
            .from('policies')
            .select(
              `
              id,
              policy_number,
              insured_name,
              vehicle_plate,
              emirate,
              inception_date,
              expiry_date,
              premium,
              status
            `,
            ),
          supabase
            .from('invoices')
            .select(
              `
              id,
              policy_id,
              invoice_number,
              issue_date,
              due_date,
              amount,
              status
            `,
            ),
        ]);

        if (!isMounted) return;

        const policiesRows = policiesRes.data ?? [];
        const invoicesRows = invoicesRes.data ?? [];

        const policies: Policy[] = policiesRows.map((row: unknown) => {
          const r = row as {
            id: string;
            policy_number: string | null;
            insured_name: string | null;
            vehicle_plate: string | null;
            emirate: string | null;
            inception_date: string | null;
            expiry_date: string | null;
            premium: number | null;
            status: string | null;
          };

          const status =
            r.status === 'cancelled'
              ? 'cancelled'
              : r.status === 'expired'
              ? 'expired'
              : 'active';

          return {
            id: r.id,
            policyNumber: r.policy_number ?? 'N/A',
            insuredName: r.insured_name ?? '—',
            vehiclePlate: r.vehicle_plate ?? '—',
            emirate: r.emirate ?? '—',
            inceptionDate: r.inception_date ?? '',
            expiryDate: r.expiry_date ?? '',
            premium: r.premium ?? 0,
            status,
          };
        });

        const invoices: Invoice[] = invoicesRows.map((row: unknown) => {
          const r = row as {
            id: string;
            policy_id: string | null;
            invoice_number: string | null;
            issue_date: string | null;
            due_date: string | null;
            amount: number | null;
            status: string | null;
          };

          const status =
            r.status === 'paid'
              ? 'paid'
              : r.status === 'overdue'
              ? 'overdue'
              : 'pending';

          return {
            id: r.id,
            policyId: r.policy_id ?? '',
            invoiceNumber: r.invoice_number ?? 'N/A',
            issueDate: r.issue_date ?? '',
            dueDate: r.due_date ?? '',
            amount: r.amount ?? 0,
            status,
          };
        });

        setState({
          data: { policies: policies.length ? policies : DEMO_POLICIES, invoices: invoices.length ? invoices : DEMO_INVOICES },
          error: null,
          loading: false,
        });
      } catch (err) {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : 'Unknown Supabase error';
        setState({
          data: { policies: DEMO_POLICIES, invoices: DEMO_INVOICES },
          error: `Supabase error: ${msg}. Showing demo reports.`,
          loading: false,
        });
      }
    };

    void fetchData();

    return () => {
      isMounted = false;
    };
  }, [hasSupabaseEnv]);

  const policies = state.data?.policies ?? DEMO_POLICIES;
  const invoices = state.data?.invoices ?? DEMO_INVOICES;

  const stats: BillingStats = useMemo(
    () => computeBillingStats(policies, invoices),
    [policies, invoices],
  );

  const totalPolicyCount = policies.length;
  const totalInvoiceCount = invoices.length;
  const pendingCount = invoices.filter((i) => i.status === 'pending').length;
  const paidCount = invoices.filter((i) => i.status === 'paid').length;
  const overdueCount = invoices.filter((i) => i.status === 'overdue').length;

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Reports</h1>
          <p className="text-sm text-slate-600">
            Book performance, premium vs collection, and invoice aging.
          </p>
        </div>
        <span className="text-xs text-slate-500">
          {state.loading
            ? 'Loading…'
            : `${totalPolicyCount} policies · ${totalInvoiceCount} invoices`}
        </span>
      </header>

      {state.error && (
        <section
          aria-label="Reports warning"
          className="mb-4 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-xs text-amber-900"
        >
          {state.error}
        </section>
      )}

      {state.loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            <span className="text-sm text-slate-600">Loading reports…</span>
          </div>
        </div>
      ) : (
        <section className="grid gap-6 lg:grid-cols-3">
          {/* Premium vs Collection */}
          <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">
              Premium vs Collections
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Relationship between written premium and collected cash.
            </p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-slate-600">Total Premium</dt>
                <dd className="font-medium text-slate-900">
                  AED{' '}
                  {stats.totalPremium.toLocaleString('en-AE', {
                    minimumFractionDigits: 2,
                  })}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-600">Collected</dt>
                <dd className="font-medium text-emerald-700">
                  AED{' '}
                  {stats.totalCollected.toLocaleString('en-AE', {
                    minimumFractionDigits: 2,
                  })}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-600">Outstanding</dt>
                <dd className="font-medium text-amber-700">
                  AED{' '}
                  {stats.totalOutstanding.toLocaleString('en-AE', {
                    minimumFractionDigits: 2,
                  })}
                </dd>
              </div>
            </dl>
          </article>

          {/* Invoice aging simple breakdown */}
          <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">
              Invoice Aging Snapshot
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Distribution by status as a quick aging proxy.
            </p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-slate-600">Pending</dt>
                <dd className="font-medium text-amber-700">
                  {pendingCount} invoices
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-600">Paid</dt>
                <dd className="font-medium text-emerald-700">
                  {paidCount} invoices
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-600">Overdue</dt>
                <dd className="font-medium text-rose-700">
                  {overdueCount} invoices
                </dd>
              </div>
            </dl>
          </article>

          {/* Portfolio mix */}
          <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">
              Portfolio Snapshot
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              High-level composition of your motor book.
            </p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-slate-600">Total Policies</dt>
                <dd className="font-medium text-slate-900">{totalPolicyCount}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-600">Active Policies</dt>
                <dd className="font-medium text-slate-900">
                  {stats.activePolicies}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-600">Overdue Rate</dt>
                <dd className="font-medium text-rose-700">
                  {totalInvoiceCount === 0
                    ? '—'
                    : `${Math.round((overdueCount / totalInvoiceCount) * 100)}%`}
                </dd>
              </div>
            </dl>
          </article>
        </section>
      )}
    </main>
  );
});

export default ReportsPage;