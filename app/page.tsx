'use client';

import type { FC } from 'react';
import { memo, useEffect, useMemo, useState } from 'react';
import type { Policy, Invoice, BillingStats, ApiState } from '@/lib/billing/types';
import { DEMO_POLICIES, DEMO_INVOICES } from '@/lib/billing/demoData';
import { computeBillingStats } from '@/lib/billing/stats';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import PolicyTable from './components/PolicyTable';
import InvoiceTable from './components/InvoiceTable';

const HomePage: FC = memo(function HomePage() {
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
              `
            )
            .order('inception_date', { ascending: false })
            .limit(50),
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
              `
            )
            .order('issue_date', { ascending: false })
            .limit(100),
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
    [policies, invoices]
  );

  return (
    <main className="flex min-h-[calc(100vh-3rem)] items-start justify-center bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex w-full max-w-6xl flex-col gap-6">
        {/* Header */}
        <header className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-white p-6 shadow-md sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Billing Dashboard
            </h1>
            <p className="text-sm text-gray-600">
              UAE motor policies, invoices, and collections overview.
            </p>
          </div>
          <div className="flex flex-col items-start gap-1 text-sm text-gray-700 sm:items-end">
            <span className="font-medium">
              {hasSupabaseEnv ? 'Supabase Connected' : 'Demo Mode (no Supabase)'}
            </span>
            <span className="text-xs text-gray-500">
              {hasSupabaseEnv
                ? 'Reading data from Supabase when available.'
                : 'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local to enable backend.'}
            </span>
          </div>
        </header>

        {/* Stats */}
        <section
          aria-labelledby="stats-title"
          className="grid gap-4 md:grid-cols-5"
        >
          <h2 id="stats-title" className="sr-only">
            Billing statistics
          </h2>

          <article className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Total Premium
            </p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              AED {stats.totalPremium.toFixed(2)}
            </p>
          </article>

          <article className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Outstanding
            </p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              AED {stats.totalOutstanding.toFixed(2)}
            </p>
          </article>

          <article className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Collected
            </p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              AED {stats.totalCollected.toFixed(2)}
            </p>
          </article>

          <article className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Active Policies
            </p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {stats.activePolicies}
            </p>
          </article>

          <article className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Overdue Invoices
            </p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {stats.overdueInvoices}
            </p>
          </article>
        </section>

        {(policyState.error || invoiceState.error) && (
          <section
            aria-label="Supabase status"
            className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
          >
            <ul className="list-disc space-y-1 pl-5">
              {policyState.error && <li>{policyState.error}</li>}
              {invoiceState.error && <li>{invoiceState.error}</li>}
            </ul>
          </section>
        )}

        {/* Policies & Invoices */}
        <section className="grid gap-6 lg:grid-cols-2">
          <section
            aria-labelledby="policies-title"
            className="rounded-2xl bg-white p-6 shadow-md"
          >
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2
                id="policies-title"
                className="text-lg font-semibold text-gray-900"
              >
                Policies
              </h2>
              <span className="text-xs text-gray-500">
                {policyState.loading
                  ? 'Loading…'
                  : `${policies.length} policies`}
              </span>
            </div>

            {policyState.loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                  <span className="text-sm text-gray-600">Loading policies…</span>
                </div>
              </div>
            ) : (
              <PolicyTable policies={policies} />
            )}
          </section>

          <section
            aria-labelledby="invoices-title"
            className="rounded-2xl bg-white p-6 shadow-md"
          >
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2
                id="invoices-title"
                className="text-lg font-semibold text-gray-900"
              >
                Invoices
              </h2>
              <span className="text-xs text-gray-500">
                {invoiceState.loading
                  ? 'Loading…'
                  : `${invoices.length} invoices`}
              </span>
            </div>

            {invoiceState.loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                  <span className="text-sm text-gray-600">Loading invoices…</span>
                </div>
              </div>
            ) : (
              <InvoiceTable invoices={invoices} policies={policies} />
            )}
          </section>
        </section>
      </div>
    </main>
  );
});

export default HomePage;