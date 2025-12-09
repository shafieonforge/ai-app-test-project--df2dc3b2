'use client';

import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import type { FC } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type PolicyStatus = 'active' | 'cancelled' | 'expired';
type InvoiceStatus = 'pending' | 'paid' | 'overdue';

interface Policy {
  id: string;
  policyNumber: string;
  insuredName: string;
  vehiclePlate: string;
  emirate: string;
  inceptionDate: string;
  expiryDate: string;
  premium: number;
  status: PolicyStatus;
}

interface Invoice {
  id: string;
  policyId: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  status: InvoiceStatus;
}

interface BillingStats {
  totalPremium: number;
  totalOutstanding: number;
  totalCollected: number;
  activePolicies: number;
  overdueInvoices: number;
}

interface ApiState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

const MOCK_POLICIES: Policy[] = [
  {
    id: 'pol-1',
    policyNumber: 'DXB-MTR-2025-0101',
    insuredName: 'Emirates Auto Brokers LLC',
    vehiclePlate: 'D 12345',
    emirate: 'Dubai',
    inceptionDate: '2025-01-01',
    expiryDate: '2025-12-31',
    premium: 12500,
    status: 'active',
  },
  {
    id: 'pol-2',
    policyNumber: 'AUH-MTR-2024-2201',
    insuredName: 'Gulf Motor Leasing FZ-LLC',
    vehiclePlate: 'AD 90876',
    emirate: 'Abu Dhabi',
    inceptionDate: '2024-06-15',
    expiryDate: '2025-06-14',
    premium: 18900,
    status: 'active',
  },
  {
    id: 'pol-3',
    policyNumber: 'SHJ-MTR-2024-0912',
    insuredName: 'Sharjah Cargo Transport',
    vehiclePlate: 'S 55432',
    emirate: 'Sharjah',
    inceptionDate: '2024-01-10',
    expiryDate: '2025-01-09',
    premium: 9800,
    status: 'expired',
  },
];

const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    policyId: 'pol-1',
    invoiceNumber: 'INV-UAE-2001',
    issueDate: '2025-01-05',
    dueDate: '2025-01-20',
    amount: 6250,
    status: 'pending',
  },
  {
    id: 'inv-2',
    policyId: 'pol-1',
    invoiceNumber: 'INV-UAE-2002',
    issueDate: '2024-12-10',
    dueDate: '2024-12-25',
    amount: 6250,
    status: 'paid',
  },
  {
    id: 'inv-3',
    policyId: 'pol-2',
    invoiceNumber: 'INV-UAE-2003',
    issueDate: '2024-12-01',
    dueDate: '2024-12-20',
    amount: 9450,
    status: 'overdue',
  },
];

const computeStats = (policies: Policy[], invoices: Invoice[]): BillingStats => {
  const totalPremium = policies.reduce((sum, p) => sum + p.premium, 0);
  const totalCollected = invoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + i.amount, 0);
  const totalOutstanding = invoices
    .filter((i) => i.status !== 'paid')
    .reduce((sum, i) => sum + i.amount, 0);
  const activePolicies = policies.filter((p) => p.status === 'active').length;
  const overdueInvoices = invoices.filter((i) => i.status === 'overdue').length;

  return {
    totalPremium,
    totalOutstanding,
    totalCollected,
    activePolicies,
    overdueInvoices,
  };
};

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

  useEffect(() => {
    let isMounted = true;

    const hasSupabaseEnv =
      Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    if (!hasSupabaseEnv) {
      if (!isMounted) return;
      setPolicyState({
        data: MOCK_POLICIES,
        error: 'Supabase not configured. Showing demo policies.',
        loading: false,
      });
      setInvoiceState({
        data: MOCK_INVOICES,
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
            .limit(20),
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
            .limit(50),
        ]);

        if (!isMounted) {
          return;
        }

        const policiesData = policiesRes.data ?? [];
        const invoicesData = invoicesRes.data ?? [];

        const mappedPolicies: Policy[] =
          policiesData.map((row: unknown) => {
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

            const normalizedStatus: PolicyStatus =
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
              status: normalizedStatus,
            };
          }) || [];

        const mappedInvoices: Invoice[] =
          invoicesData.map((row: unknown) => {
            const r = row as {
              id: string;
              policy_id: string | null;
              invoice_number: string | null;
              issue_date: string | null;
              due_date: string | null;
              amount: number | null;
              status: string | null;
            };

            const normalizedStatus: InvoiceStatus =
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
              status: normalizedStatus,
            };
          }) || [];

        setPolicyState({
          data: mappedPolicies.length > 0 ? mappedPolicies : MOCK_POLICIES,
          error:
            mappedPolicies.length > 0
              ? null
              : 'No policies found in Supabase. Showing demo policies.',
          loading: false,
        });

        setInvoiceState({
          data: mappedInvoices.length > 0 ? mappedInvoices : MOCK_INVOICES,
          error:
            mappedInvoices.length > 0
              ? null
              : 'No invoices found in Supabase. Showing demo invoices.',
          loading: false,
        });
      } catch (err) {
        if (!isMounted) return;
        const msg =
          err instanceof Error ? err.message : 'Unknown Supabase client error';
        setPolicyState({
          data: MOCK_POLICIES,
          error: `Supabase client error: ${msg}. Showing demo policies.`,
          loading: false,
        });
        setInvoiceState({
          data: MOCK_INVOICES,
          error: `Supabase client error: ${msg}. Showing demo invoices.`,
          loading: false,
        });
      }
    };

    void fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const policies: Policy[] = policyState.data ?? MOCK_POLICIES;
  const invoices: Invoice[] = invoiceState.data ?? MOCK_INVOICES;

  const stats: BillingStats = useMemo(
    () => computeStats(policies, invoices),
    [policies, invoices]
  );

  const getPolicyById = useCallback(
    (id: string): Policy | undefined => policies.find((p) => p.id === id),
    [policies]
  );

  const hasSupabaseEnv =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return (
    <main className="flex min-h-screen items-start justify-center bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex w-full max-w-6xl flex-col gap-6">
        <header className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-white p-6 shadow-md sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Motor Billing · UAE
            </h1>
            <p className="text-sm text-gray-600">
              Policies, invoices and collections for motor insurance.
            </p>
          </div>
          <div className="flex flex-col items-start gap-1 text-sm text-gray-700 sm:items-end">
            <span className="font-medium">
              {hasSupabaseEnv ? 'Supabase Connected' : 'Demo Mode (No Supabase)'}
            </span>
            <span className="text-xs text-gray-500">
              {hasSupabaseEnv
                ? 'Reading policies and invoices from Supabase when available'
                : 'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local to enable backend.'}
            </span>
          </div>
        </header>

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
                  ? 'Loading...'
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
            ) : policies.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-500">
                No policies found.
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-100">
                <div className="grid grid-cols-5 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600">
                  <div>Policy #</div>
                  <div>Insured</div>
                  <div className="hidden sm:block">Vehicle</div>
                  <div className="text-right">Premium</div>
                  <div className="text-right">Status</div>
                </div>
                <ul className="divide-y divide-gray-100">
                  {policies.map((policy) => (
                    <li
                      key={policy.id}
                      className="grid grid-cols-5 items-center px-3 py-2 text-xs"
                    >
                      <div className="truncate font-mono text-gray-800">
                        {policy.policyNumber}
                      </div>
                      <div className="truncate text-gray-700">
                        {policy.insuredName}
                      </div>
                      <div className="hidden truncate text-gray-600 sm:block">
                        {policy.vehiclePlate} · {policy.emirate}
                      </div>
                      <div className="text-right text-gray-900">
                        {policy.premium.toFixed(2)}
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-flex items-center justify-end rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            policy.status === 'active'
                              ? 'bg-green-50 text-green-700'
                              : policy.status === 'expired'
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {policy.status.toUpperCase()}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
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
                  ? 'Loading...'
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
            ) : invoices.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-500">
                No invoices found.
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-100">
                <div className="grid grid-cols-5 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600">
                  <div>Invoice #</div>
                  <div>Policy #</div>
                  <div className="hidden sm:block">Insured</div>
                  <div className="text-right">Amount</div>
                  <div className="text-right">Status</div>
                </div>
                <ul className="divide-y divide-gray-100">
                  {invoices.map((invoice) => {
                    const policy = getPolicyById(invoice.policyId);
                    return (
                      <li
                        key={invoice.id}
                        className="grid grid-cols-5 items-center px-3 py-2 text-xs"
                      >
                        <div className="truncate font-mono text-gray-800">
                          {invoice.invoiceNumber}
                        </div>
                        <div className="truncate font-mono text-gray-700">
                          {policy?.policyNumber ?? '—'}
                        </div>
                        <div className="hidden truncate text-gray-600 sm:block">
                          {policy?.insuredName ?? '—'}
                        </div>
                        <div className="text-right text-gray-900">
                          {invoice.amount.toFixed(2)}
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
                    );
                  })}
                </ul>
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
});

export default HomePage;