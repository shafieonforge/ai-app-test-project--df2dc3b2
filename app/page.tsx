'use client';

import type { FC } from 'react';
import { memo, useEffect, useMemo, useState } from 'react';
import type { BillingStats, Invoice, Policy } from '@/lib/billing/types';
import type { ApiState } from '@/lib/billing/types';
import { DEMO_INVOICES, DEMO_POLICIES } from '@/lib/billing/demoData';
import { computeBillingStats } from '@/lib/billing/stats';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import PolicyTable from './components/PolicyTable';
import InvoiceTable from './components/InvoiceTable';

const DashboardPage: FC = memo(function DashboardPage() {
  const [policyState, setPolicyState] = useState<ApiState<Policy[]>>({
    data: null,
    error: null,
    loading: true,
  });

  const [invoiceState, setInvoiceState] = useState<ApiState<Invoice[]>>({
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
      setPolicyState({
        data: DEMO_POLICIES,
        error: 'Supabase not configured. Showing demo policies.',
        loading: false,
      });
      setInvoiceState({
        data: DEMO_INVOICES,
        error: 'Supabase not configured. Showing demo invoices.',
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
            )
            .order('inception_date', { ascending: false })
            .limit(100),
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
            )
            .order('issue_date', { ascending: false })
            .limit(200),
        ]);

        if (!isMounted) return;

        const policiesRows = policiesRes.data ?? [];
        const invoicesRows = invoicesRes.data ?? [];

        const mappedPolicies: Policy[] = policiesRows.map((row: unknown) => {
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

        const mappedInvoices: Invoice[] = invoicesRows.map((row: unknown) => {
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

        setPolicyState({
          data: mappedPolicies.length ? mappedPolicies : DEMO_POLICIES,
          error: mappedPolicies.length ? null : 'No policies in Supabase. Showing demo.',
          loading: false,
        });

        setInvoiceState({
          data: mappedInvoices.length ? mappedInvoices : DEMO_INVOICES,
          error: mappedInvoices.length ? null : 'No invoices in Supabase. Showing demo.',
          loading: false,
        });
      } catch (err) {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : 'Unknown Supabase error';
        setPolicyState({
          data: DEMO_POLICIES,
          error: `Supabase error: ${msg}. Showing demo policies.`,
          loading: false,
        });
        setInvoiceState({
          data: DEMO_INVOICES,
          error: `Supabase error: ${msg}. Showing demo invoices.`,
          loading: false,
        });
      }
    };

    void fetchData();

    return () => {
      isMounted = false;
    };
  }, [hasSupabaseEnv]);

  const policies = policyState.data ?? DEMO_POLICIES;
  const invoices = invoiceState.data ?? DEMO_INVOICES;

  const stats: BillingStats = useMemo(
    () => computeBillingStats(policies, invoices),
    [policies, invoices],
  );

  const envLabel = hasSupabaseEnv ? 'Supabase Connected' : 'Demo Mode';
  const envHint = hasSupabaseEnv
    ? 'Using Supabase tables: policies, invoices'
    : 'Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable Supabase';

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="flex flex-col gap-4 rounded-2xl bg-white/90 p-6 shadow-sm ring-1 ring-slate-100 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Billing Control Center
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Portfolio, receivables, and collections overview for UAE motor book.
          </p>
        </div>
        <div className="flex flex-col items-start gap-1 text-xs text-slate-600 sm:items-end">
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
            <span
              className={`h-2 w-2 rounded-full ${
                hasSupabaseEnv ? 'bg-emerald-500' : 'bg-amber-400'
              }`}
            />
            {envLabel}
          </span>
          <span className="text-[11px] text-slate-500">{envHint}</span>
        </div>
      </header>

      {/* KPIs */}
      <section
        aria-labelledby="dashboard-kpis"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-5"
      >
        <h2 id="dashboard-kpis" className="sr-only">
          Key performance indicators
        </h2>

        <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Total Premium
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            AED {stats.totalPremium.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
          </p>
          <p className="mt-1 text-xs text-slate-500">Sum of all written premiums.</p>
        </article>

        <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Outstanding
          </p>
          <p className="mt-2 text-2xl font-semibold text-amber-700">
            AED {stats.totalOutstanding.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
          </p>
          <p className="mt-1 text-xs text-slate-500">Pending + overdue invoices.</p>
        </article>

        <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Collected
          </p>
          <p className="mt-2 text-2xl font-semibold text-emerald-700">
            AED {stats.totalCollected.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
          </p>
          <p className="mt-1 text-xs text-slate-500">Fully settled receivables.</p>
        </article>

        <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Active Policies
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {stats.activePolicies.toLocaleString('en-AE')}
          </p>
          <p className="mt-1 text-xs text-slate-500">In-force book size.</p>
        </article>

        <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Overdue Invoices
          </p>
          <p className="mt-2 text-2xl font-semibold text-rose-700">
            {stats.overdueInvoices.toLocaleString('en-AE')}
          </p>
          <p className="mt-1 text-xs text-slate-500">Require urgent follow-up.</p>
        </article>
      </section>

      {(policyState.error || invoiceState.error) && (
        <section
          aria-label="Data source warnings"
          className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-xs text-amber-900"
        >
          <ul className="list-disc space-y-1 pl-4">
            {policyState.error && <li>{policyState.error}</li>}
            {invoiceState.error && <li>{invoiceState.error}</li>}
          </ul>
        </section>
      )}

      {/* Split view */}
      <section className="grid gap-6 lg:grid-cols-2">
        <section
          aria-labelledby="dashboard-policies-title"
          className="flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
        >
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <h2
                id="dashboard-policies-title"
                className="text-base font-semibold text-slate-900"
              >
                Latest Policies
              </h2>
              <p className="text-xs text-slate-500">
                Recent risks written across the motor book.
              </p>
            </div>
            <span className="text-xs text-slate-500">
              {policyState.loading ? 'Loading…' : `${policies.length} records`}
            </span>
          </div>

          {policyState.loading ? (
            <div className="flex flex-1 items-center justify-center py-8">
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                <span className="text-sm text-slate-600">Loading policies…</span>
              </div>
            </div>
          ) : (
            <PolicyTable policies={policies} />
          )}
        </section>

        <section
          aria-labelledby="dashboard-invoices-title"
          className="flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
        >
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <h2
                id="dashboard-invoices-title"
                className="text-base font-semibold text-slate-900"
              >
                Latest Invoices
              </h2>
              <p className="text-xs text-slate-500">
                Accounts receivable linked to current portfolio.
              </p>
            </div>
            <span className="text-xs text-slate-500">
              {invoiceState.loading ? 'Loading…' : `${invoices.length} records`}
            </span>
          </div>

          {invoiceState.loading ? (
            <div className="flex flex-1 items-center justify-center py-8">
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                <span className="text-sm text-slate-600">Loading invoices…</span>
              </div>
            </div>
          ) : (
            <InvoiceTable invoices={invoices} policies={policies} />
          )}
        </section>
      </section>
    </main>
  );
});

export default DashboardPage;