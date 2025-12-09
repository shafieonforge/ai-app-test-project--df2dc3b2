'use client';

import { memo, useMemo } from 'react';
import type { FC } from 'react';

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
  const invoices: InvoiceSummary[] = MOCK_INVOICES;

  const stats: DashboardStats = useMemo(
    () => computeStats(invoices),
    [invoices]
  );

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
            <span className="font-medium">Demo Mode</span>
            <span className="text-xs text-gray-500">
              Auth and Supabase disabled · Static sample data only
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

        <section
          aria-labelledby="new-policy-title"
          className="grid gap-6 lg:grid-cols-2"
        >
          <article className="rounded-2xl bg-white p-6 shadow-md">
            <h2
              id="new-policy-title"
              className="mb-4 text-lg font-semibold text-gray-900"
            >
              New Motor Policy &amp; Invoice (Demo)
            </h2>
            <p className="mb-4 text-sm text-gray-600">
              In this demo build, the form is read-only and does not save to a
              backend. It shows the fields you&apos;ll capture when we re‑enable
              Supabase.
            </p>

            <form
              className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2"
              aria-disabled="true"
            >
              <div className="md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Customer
                </p>
              </div>
              <div>
                <label
                  htmlFor="customerName"
                  className="mb-1 block text-xs font-medium text-gray-700"
                >
                  Full Name
                </label>
                <input
                  id="customerName"
                  type="text"
                  disabled
                  placeholder="e.g. Ahmed Al Farsi"
                  className="w-full cursor-not-allowed rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-500"
                />
              </div>
              <div>
                <label
                  htmlFor="customerEmail"
                  className="mb-1 block text-xs font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  id="customerEmail"
                  type="email"
                  disabled
                  placeholder="e.g. ahmed@example.com"
                  className="w-full cursor-not-allowed rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-500"
                />
              </div>
              <div>
                <label
                  htmlFor="customerPhone"
                  className="mb-1 block text-xs font-medium text-gray-700"
                >
                  Mobile
                </label>
                <input
                  id="customerPhone"
                  type="tel"
                  disabled
                  placeholder="+971 50 123 4567"
                  className="w-full cursor-not-allowed rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-500"
                />
              </div>

              <div className="md:col-span-2 mt-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Vehicle &amp; Cover
                </p>
              </div>
              <div>
                <label
                  htmlFor="vehicleMake"
                  className="mb-1 block text-xs font-medium text-gray-700"
                >
                  Make
                </label>
                <input
                  id="vehicleMake"
                  type="text"
                  disabled
                  placeholder="Toyota"
                  className="w-full cursor-not-allowed rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-500"
                />
              </div>
              <div>
                <label
                  htmlFor="vehicleModel"
                  className="mb-1 block text-xs font-medium text-gray-700"
                >
                  Model
                </label>
                <input
                  id="vehicleModel"
                  type="text"
                  disabled
                  placeholder="Land Cruiser"
                  className="w-full cursor-not-allowed rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-500"
                />
              </div>
              <div>
                <label
                  htmlFor="vehicleYear"
                  className="mb-1 block text-xs font-medium text-gray-700"
                >
                  Year
                </label>
                <input
                  id="vehicleYear"
                  type="number"
                  disabled
                  placeholder="2022"
                  className="w-full cursor-not-allowed rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-500"
                />
              </div>
              <div>
                <label
                  htmlFor="coverType"
                  className="mb-1 block text-xs font-medium text-gray-700"
                >
                  Cover Type
                </label>
                <select
                  id="coverType"
                  disabled
                  className="w-full cursor-not-allowed rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-500"
                >
                  <option>Comprehensive</option>
                  <option>Third Party Liability</option>
                </select>
              </div>

              <div className="md:col-span-2 mt-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Premium &amp; VAT
                </p>
              </div>
              <div>
                <label
                  htmlFor="basePremium"
                  className="mb-1 block text-xs font-medium text-gray-700"
                >
                  Base Premium (AED)
                </label>
                <input
                  id="basePremium"
                  type="number"
                  disabled
                  placeholder="1500.00"
                  className="w-full cursor-not-allowed rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-500"
                />
              </div>
              <div>
                <label
                  htmlFor="brokerFee"
                  className="mb-1 block text-xs font-medium text-gray-700"
                >
                  Broker/Admin Fee (AED)
                </label>
                <input
                  id="brokerFee"
                  type="number"
                  disabled
                  placeholder="250.00"
                  className="w-full cursor-not-allowed rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-500"
                />
              </div>
              <div>
                <label
                  htmlFor="vatRate"
                  className="mb-1 block text-xs font-medium text-gray-700"
                >
                  VAT Rate (%)
                </label>
                <input
                  id="vatRate"
                  type="number"
                  disabled
                  placeholder="5"
                  className="w-full cursor-not-allowed rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-500"
                />
              </div>
              <div>
                <label
                  htmlFor="policyStartDate"
                  className="mb-1 block text-xs font-medium text-gray-700"
                >
                  Start Date
                </label>
                <input
                  id="policyStartDate"
                  type="date"
                  disabled
                  className="w-full cursor-not-allowed rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-500"
                />
              </div>
              <div>
                <label
                  htmlFor="policyEndDate"
                  className="mb-1 block text-xs font-medium text-gray-700"
                >
                  End Date
                </label>
                <input
                  id="policyEndDate"
                  type="date"
                  disabled
                  className="w-full cursor-not-allowed rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-500"
                />
              </div>

              <div className="md:col-span-2 flex flex-col items-start gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-gray-500">
                  When Supabase is re‑enabled, this button will create the
                  customer, policy, and invoice in your database.
                </p>
                <button
                  type="button"
                  disabled
                  className="cursor-not-allowed rounded-lg bg-gray-300 px-4 py-2 text-xs font-semibold text-gray-600"
                >
                  Create Policy &amp; Invoice (Disabled in demo)
                </button>
              </div>
            </form>
          </article>

          <article
            aria-labelledby="recent-invoices-title"
            className="rounded-2xl bg-white p-6 shadow-md"
          >
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2
                id="recent-invoices-title"
                className="text-lg font-semibold text-gray-900"
              >
                Recent Invoices (Sample Data)
              </h2>
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-100">
              <div className="grid grid-cols-4 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600">
                <div>Policy #</div>
                <div>Customer</div>
                <div className="text-right">Amount (AED)</div>
                <div className="text-right">Status</div>
              </div>
              {invoices.length === 0 ? (
                <div className="px-3 py-6 text-center text-xs text-gray-500">
                  No invoices in demo dataset.
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
          </article>
        </section>
      </div>
    </main>
  );
});

export default HomePage;