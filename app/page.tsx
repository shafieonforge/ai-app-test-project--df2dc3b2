'use client';

import { memo, useEffect, useState } from 'react';
import type { FC } from 'react';
import { createClient as createSupabaseBrowserClient } from '@/lib/supabase/client';

type InvoiceStatus = 'pending' | 'paid' | 'overdue';

interface InvoiceSummary {
  id: string;
  policyNumber: string;
  customerName: string;
  totalAmount: number;
  status: InvoiceStatus;
  createdAt: string;
}

interface DashboardStats {
  totalOutstanding: number;
  totalPaid: number;
  invoiceCount: number;
  overdueCount: number;
}

interface ApiState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

const MOCK_INVOICES: InvoiceSummary[] = [
  {
    id: '1',
    policyNumber: 'POL-20241201-ALF-001',
    customerName: 'Ahmed Al Farsi',
    totalAmount: 2450.0,
    status: 'pending',
    createdAt: '2024-12-01T10:15:00Z',
  },
  {
    id: '2',
    policyNumber: 'POL-20241120-SAL-002',
    customerName: 'Salama Motors LLC',
    totalAmount: 3150.5,
    status: 'paid',
    createdAt: '2024-11-20T09:00:00Z',
  },
  {
    id: '3',
    policyNumber: 'POL-20241101-NAS-003',
    customerName: 'Nasser Al Mansoori',
    totalAmount: 1899.75,
    status: 'overdue',
    createdAt: '2024-11-01T14:30:00Z',
  },
];

const computeStats = (invoices: InvoiceSummary[]): DashboardStats => {
  const totalOutstanding = invoices
    .filter((i) => i.status !== 'paid')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const totalPaid = invoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const overdueCount = invoices.filter((i) => i.status === 'overdue').length;

  return {
    totalOutstanding,
    totalPaid,
    invoiceCount: invoices.length,
    overdueCount,
  };
};

const HomePage: FC = memo(function HomePage() {
  const [invoiceState, setInvoiceState] = useState<ApiState<InvoiceSummary[]>>({
    data: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchInvoices = async () => {
      // If Supabase env is missing, fall back to mock data without throwing
      if (
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ) {
        if (!isMounted) return;
        setInvoiceState({
          data: MOCK_INVOICES,
          error: 'Supabase not configured. Showing demo invoices.',
          loading: false,
        });
        return;
      }

      try {
        const supabase = createSupabaseBrowserClient();

        const { data, error } = await supabase
          .from('invoices')
          .select(
            `
              id,
              policy_number,
              customer_name,
              total_amount,
              status,
              created_at
            `
          )
          .order('created_at', { ascending: false })
          .limit(10);

        if (!isMounted) return;

        if (error) {
          setInvoiceState({
            data: MOCK_INVOICES,
            error: `Supabase error: ${error.message}. Showing demo invoices.`,
            loading: false,
          });
          return;
        }

        const mapped: InvoiceSummary[] =
          (data ?? []).map((row: unknown) => {
            const r = row as {
              id: string;
              policy_number: string | null;
              customer_name: string | null;
              total_amount: number | null;
              status: string | null;
              created_at: string | null;
            };

            const normalizedStatus: InvoiceStatus =
              r.status === 'paid'
                ? 'paid'
                : r.status === 'overdue'
                ? 'overdue'
                : 'pending';

            return {
              id: r.id,
              policyNumber: r.policy_number ?? 'N/A',
              customerName: r.customer_name ?? '—',
              totalAmount: r.total_amount ?? 0,
              status: normalizedStatus,
              createdAt: r.created_at ?? '',
            };
          }) || [];

        setInvoiceState({
          data: mapped.length > 0 ? mapped : MOCK_INVOICES,
          error:
            mapped.length > 0
              ? null
              : 'No invoices found in Supabase. Showing demo invoices.',
          loading: false,
        });
      } catch (err) {
        if (!isMounted) return;
        const msg =
          err instanceof Error ? err.message : 'Unknown Supabase client error';
        setInvoiceState({
          data: MOCK_INVOICES,
          error: `Supabase client error: ${msg}. Showing demo invoices.`,
          loading: false,
        });
      }
    };

    void fetchInvoices();

    return () => {
      isMounted = false;
    };
  }, []);

  const invoices: InvoiceSummary[] = invoiceState.data ?? MOCK_INVOICES;
  const stats: DashboardStats = computeStats(invoices);

  return (
    <main className="flex min-h-screen items-start justify-center bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex w-full max-w-6xl flex-col gap-6">
        <header className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-white p-6 shadow-md sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Motor Billing Dashboard
            </h1>
            <p className="text-sm text-gray-600">
              UAE motor policies · invoices · collections
            </p>
          </div>
          <div className="flex flex-col items-start gap-1 text-sm text-gray-700 sm:items-end">
            <span className="font-medium">
              {process.env.NEXT_PUBLIC_SUPABASE_URL
                ? 'Supabase Connected'
                : 'Demo Mode (No Supabase)'}
            </span>
            <span className="text-xs text-gray-500">
              {process.env.NEXT_PUBLIC_SUPABASE_URL
                ? 'Reading invoices from Supabase when available'
                : 'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable backend'}
            </span>
          </div>
        </header>

        <section
          aria-labelledby="stats-title"
          className="grid gap-4 md:grid-cols-4"
        >
          <h2 id="stats-title" className="sr-only">
            Billing statistics
          </h2>

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
              AED {stats.totalPaid.toFixed(2)}
            </p>
          </article>

          <article className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Invoices
            </p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {stats.invoiceCount}
            </p>
          </article>

          <article className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Overdue
            </p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {stats.overdueCount}
            </p>
          </article>
        </section>

        {invoiceState.error && (
          <section
            aria-label="Supabase status"
            className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
          >
            {invoiceState.error}
          </section>
        )}

        <section
          aria-labelledby="recent-invoices-title"
          className="rounded-2xl bg-white p-6 shadow-md"
        >
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2
              id="recent-invoices-title"
              className="text-lg font-semibold text-gray-900"
            >
              Recent Invoices
            </h2>
          </div>

          {invoiceState.loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                <span className="text-sm text-gray-600">Loading invoices…</span>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-100">
              <div className="grid grid-cols-4 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600">
                <div>Policy #</div>
                <div>Customer</div>
                <div className="text-right">Amount (AED)</div>
                <div className="text-right">Status</div>
              </div>
              {invoices.length === 0 ? (
                <div className="px-3 py-6 text-center text-xs text-gray-500">
                  No invoices found.
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {invoices.map((invoice) => (
                    <li
                      key={invoice.id}
                      className="grid grid-cols-4 items-center px-3 py-2 text-xs"
                    >
                      <div className="truncate font-mono text-gray-800">
                        {invoice.policyNumber || 'N/A'}
                      </div>
                      <div className="truncate text-gray-700">
                        {invoice.customerName || '—'}
                      </div>
                      <div className="text-right font-medium text-gray-900">
                        {invoice.totalAmount.toFixed(2)}
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-flex items-center justify-end rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            invoice.status === 'paid'
                              ? 'bg-green-50 text-green-700'
                              : invoice.status === 'overdue'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {invoice.status.toUpperCase()}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
});

export default HomePage;