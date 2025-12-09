'use client';

import type { FC } from 'react';
import { memo, useEffect, useState } from 'react';
import type { Invoice, Policy } from '@/lib/billing/types';
import type { ApiState } from '@/lib/billing/types';
import { DEMO_INVOICES, DEMO_POLICIES } from '@/lib/billing/demoData';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import InvoiceTable from '@/app/components/InvoiceTable';

interface InvoicesData {
  invoices: Invoice[];
  policies: Policy[];
}

const InvoicesPage: FC = memo(function InvoicesPage() {
  const [state, setState] = useState<ApiState<InvoicesData>>({
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
        data: { invoices: DEMO_INVOICES, policies: DEMO_POLICIES },
        error: 'Supabase not configured. Showing demo invoices and policies.',
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

        const usePolicies = policies.length ? policies : DEMO_POLICIES;
        const useInvoices = invoices.length ? invoices : DEMO_INVOICES;
        const error =
          !policies.length && !invoices.length
            ? 'No invoices or policies found. Showing demo data.'
            : null;

        setState({
          data: { invoices: useInvoices, policies: usePolicies },
          error,
          loading: false,
        });
      } catch (err) {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : 'Unknown Supabase error';
        setState({
          data: { invoices: DEMO_INVOICES, policies: DEMO_POLICIES },
          error: `Supabase error: ${msg}. Showing demo invoices and policies.`,
          loading: false,
        });
      }
    };

    void fetchData();

    return () => {
      isMounted = false;
    };
  }, [hasSupabaseEnv]);

  const invoices = state.data?.invoices ?? DEMO_INVOICES;
  const policies = state.data?.policies ?? DEMO_POLICIES;

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Invoices</h1>
          <p className="text-sm text-slate-600">
            Full accounts receivable ledger linked to motor policies.
          </p>
        </div>
        <span className="text-xs text-slate-500">
          {state.loading ? 'Loading…' : `${invoices.length} invoices`}
        </span>
      </header>

      {state.error && (
        <section
          aria-label="Invoices warning"
          className="mb-4 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-xs text-amber-900"
        >
          {state.error}
        </section>
      )}

      {state.loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            <span className="text-sm text-slate-600">Loading invoices…</span>
          </div>
        </div>
      ) : (
        <InvoiceTable invoices={invoices} policies={policies} />
      )}
    </main>
  );
});

export default InvoicesPage;