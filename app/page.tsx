'use client';

import { useEffect, useState, useCallback, FormEvent, ChangeEvent, memo } from 'react';
import type { FC } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

interface AuthFormState {
  email: string;
  password: string;
  isSignUp: boolean;
  message: string;
}

interface MotorPolicyFormState {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  coverType: 'comprehensive' | 'tpl';
  basePremium: string;
  brokerFee: string;
  vatRate: string;
  policyStartDate: string;
  policyEndDate: string;
}

interface InvoiceSummary {
  id: string;
  policyNumber: string;
  customerName: string;
  totalAmount: number;
  status: 'pending' | 'paid' | 'overdue';
  createdAt: string;
}

interface DashboardStats {
  totalOutstanding: number;
  totalPaid: number;
  invoiceCount: number;
  overdueCount: number;
}

type ApiStatus = 'idle' | 'loading' | 'success' | 'error';

const initialAuthState: AuthFormState = {
  email: '',
  password: '',
  isSignUp: false,
  message: '',
};

const initialPolicyForm: MotorPolicyFormState = {
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  vehicleMake: '',
  vehicleModel: '',
  vehicleYear: '',
  coverType: 'comprehensive',
  basePremium: '',
  brokerFee: '',
  vatRate: '5',
  policyStartDate: '',
  policyEndDate: '',
};

const Home: FC = memo(function Home() {
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [authState, setAuthState] = useState<AuthFormState>(initialAuthState);
  const [authStatus, setAuthStatus] = useState<ApiStatus>('idle');

  const [policyForm, setPolicyForm] = useState<MotorPolicyFormState>(initialPolicyForm);
  const [policyStatus, setPolicyStatus] = useState<ApiStatus>('idle');
  const [policyError, setPolicyError] = useState<string | null>(null);

  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [dashboardStatus, setDashboardStatus] = useState<ApiStatus>('idle');

  // Load current user and dashboard on mount
  useEffect(() => {
    let isMounted = true;

    const loadUserAndData = async () => {
      setDashboardStatus('loading');
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!isMounted) return;

      setUser(currentUser);
      setDashboardStatus('idle');

      if (currentUser) {
        void fetchDashboard();
      }
    };

    void loadUserAndData();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        void fetchDashboard();
      } else {
        setInvoices([]);
        setStats(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboard = useCallback(async () => {
    setDashboardStatus('loading');
    try {
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
        .limit(20);

      if (error) {
        throw error;
      }

      const mapped: InvoiceSummary[] =
        data?.map((row) => ({
          id: String(row.id),
          policyNumber: String(row.policy_number ?? ''),
          customerName: String(row.customer_name ?? ''),
          totalAmount: Number(row.total_amount ?? 0),
          status: (row.status as InvoiceSummary['status']) ?? 'pending',
          createdAt: String(row.created_at ?? ''),
        })) ?? [];

      setInvoices(mapped);

      const totalOutstanding = mapped
        .filter((i) => i.status !== 'paid')
        .reduce((sum, i) => sum + i.totalAmount, 0);

      const totalPaid = mapped
        .filter((i) => i.status === 'paid')
        .reduce((sum, i) => sum + i.totalAmount, 0);

      const overdueCount = mapped.filter((i) => i.status === 'overdue').length;

      setStats({
        totalOutstanding,
        totalPaid,
        invoiceCount: mapped.length,
        overdueCount,
      });
      setDashboardStatus('success');
    } catch (err: unknown) {
      setDashboardStatus('error');
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (err instanceof Error) {
        // displayable error could be added here if needed
        // but we keep UI simple for now
      }
    }
  }, [supabase]);

  const handleAuthInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setAuthState((prev) => ({
        ...prev,
        [name]: value,
        message: '',
      }));
    },
    []
  );

  const toggleAuthMode = useCallback(() => {
    setAuthState((prev) => ({
      ...prev,
      isSignUp: !prev.isSignUp,
      message: '',
    }));
  }, []);

  const handleAuthSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setAuthStatus('loading');
      setAuthState((prev) => ({ ...prev, message: '' }));

      try {
        if (authState.isSignUp) {
          const { error } = await supabase.auth.signUp({
            email: authState.email,
            password: authState.password,
          });
          if (error) throw error;
          setAuthState((prev) => ({
            ...prev,
            message: 'Check your email for the confirmation link.',
          }));
        } else {
          const { error } = await supabase.auth.signInWithPassword({
            email: authState.email,
            password: authState.password,
          });
          if (error) throw error;
        }
        setAuthStatus('success');
      } catch (error: unknown) {
        setAuthStatus('error');
        setAuthState((prev) => ({
          ...prev,
          message:
            error instanceof Error ? error.message : 'Authentication failed',
        }));
      }
    },
    [authState.email, authState.isSignUp, authState.password, supabase.auth]
  );

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, [supabase.auth]);

  const handlePolicyInputChange = useCallback(
    (
      e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
      const { name, value } = e.target;
      setPolicyForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    []
  );

  const handleCreatePolicyAndInvoice = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!user) return;

      setPolicyStatus('loading');
      setPolicyError(null);

      try {
        const basePremiumNumber = Number(policyForm.basePremium || '0');
        const brokerFeeNumber = Number(policyForm.brokerFee || '0');
        const vatRateNumber = Number(policyForm.vatRate || '0');

        if (Number.isNaN(basePremiumNumber) || Number.isNaN(brokerFeeNumber) || Number.isNaN(vatRateNumber)) {
          throw new Error('Premium, fee, or VAT rate is invalid.');
        }

        const taxableAmount = basePremiumNumber + brokerFeeNumber;
        const vatAmount = (taxableAmount * vatRateNumber) / 100;
        const totalAmount = taxableAmount + vatAmount;

        // 1) Insert customer
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .insert({
            name: policyForm.customerName,
            email: policyForm.customerEmail,
            phone: policyForm.customerPhone,
          })
          .select('id')
          .single();

        if (customerError || !customerData) {
          throw customerError ?? new Error('Failed to create customer');
        }

        const customerId: string | number = customerData.id;

        // 2) Insert policy
        const { data: policyData, error: policyError } = await supabase
          .from('policies')
          .insert({
            customer_id: customerId,
            vehicle_make: policyForm.vehicleMake,
            vehicle_model: policyForm.vehicleModel,
            vehicle_year: policyForm.vehicleYear,
            cover_type: policyForm.coverType,
            base_premium: basePremiumNumber,
            broker_fee: brokerFeeNumber,
            vat_rate: vatRateNumber,
            policy_start_date: policyForm.policyStartDate,
            policy_end_date: policyForm.policyEndDate,
            status: 'pending_payment',
          })
          .select('id, policy_number')
          .single();

        if (policyError || !policyData) {
          throw policyError ?? new Error('Failed to create policy');
        }

        const policyId: string | number = policyData.id;
        const policyNumber: string = String(
          policyData.policy_number ?? `POL-${policyId}`
        );

        // 3) Insert invoice
        const { data: invoiceData, error: invoiceError } = await supabase
          .from('invoices')
          .insert({
            policy_id: policyId,
            policy_number: policyNumber,
            customer_id: customerId,
            customer_name: policyForm.customerName,
            total_amount: totalAmount,
            taxable_amount: taxableAmount,
            vat_amount: vatAmount,
            vat_rate: vatRateNumber,
            status: 'pending',
            currency: 'AED',
          })
          .select('id, created_at')
          .single();

        if (invoiceError || !invoiceData) {
          throw invoiceError ?? new Error('Failed to create invoice');
        }

        setPolicyStatus('success');
        setPolicyForm(initialPolicyForm);
        void fetchDashboard();
      } catch (err: unknown) {
        setPolicyStatus('error');
        setPolicyError(
          err instanceof Error ? err.message : 'Failed to create policy and invoice.'
        );
      }
    },
    [fetchDashboard, policyForm, supabase, user]
  );

  const renderAuthSection = () => (
    <section
      aria-labelledby="auth-section-title"
      className="w-full max-w-md rounded-2xl bg-white p-6 shadow-md"
    >
      <h2
        id="auth-section-title"
        className="mb-4 text-xl font-semibold text-gray-900"
      >
        Broker Access
      </h2>
      <form
        onSubmit={handleAuthSubmit}
        className="space-y-4"
        aria-label={authState.isSignUp ? 'Sign up form' : 'Sign in form'}
      >
        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={authState.email}
            onChange={handleAuthInputChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={authState.isSignUp ? 'new-password' : 'current-password'}
            required
            minLength={6}
            value={authState.password}
            onChange={handleAuthInputChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {authState.message && (
          <div
            role="alert"
            className={`rounded-lg px-3 py-2 text-sm ${
              authStatus === 'error'
                ? 'bg-red-50 text-red-700'
                : 'bg-green-50 text-green-700'
            }`}
          >
            {authState.message}
          </div>
        )}
        <button
          type="submit"
          disabled={authStatus === 'loading'}
          className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {authStatus === 'loading'
            ? 'Processing...'
            : authState.isSignUp
            ? 'Sign Up'
            : 'Sign In'}
        </button>
        <button
          type="button"
          onClick={toggleAuthMode}
          className="w-full text-center text-sm font-medium text-blue-600 hover:underline"
        >
          {authState.isSignUp
            ? 'Already have an account? Sign in'
            : "Don't have an account? Sign up"}
        </button>
      </form>
    </section>
  );

  const renderDashboard = () => (
    <section
      aria-labelledby="dashboard-title"
      className="w-full max-w-6xl space-y-6"
    >
      <header className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-white p-6 shadow-md sm:flex-row sm:items-center">
        <div>
          <h1
            id="dashboard-title"
            className="text-2xl font-semibold text-gray-900"
          >
            Motor Billing Dashboard
          </h1>
          <p className="text-sm text-gray-600">
            UAE motor policies · invoices · collections
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-700">
            Signed in as <span className="font-semibold">{user?.email}</span>
          </span>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Outstanding
          </p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            AED {stats ? stats.totalOutstanding.toFixed(2) : '0.00'}
          </p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Collected
          </p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            AED {stats ? stats.totalPaid.toFixed(2) : '0.00'}
          </p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Invoices
          </p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {stats ? stats.invoiceCount : 0}
          </p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Overdue
          </p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {stats ? stats.overdueCount : 0}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section
          aria-labelledby="new-policy-title"
          className="rounded-2xl bg-white p-6 shadow-md"
        >
          <h2
            id="new-policy-title"
            className="mb-4 text-lg font-semibold text-gray-900"
          >
            New Motor Policy & Invoice
          </h2>
          {policyError && (
            <div
              role="alert"
              className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {policyError}
            </div>
          )}
          <form
            onSubmit={handleCreatePolicyAndInvoice}
            className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2"
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
                name="customerName"
                type="text"
                required
                value={policyForm.customerName}
                onChange={handlePolicyInputChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                name="customerEmail"
                type="email"
                required
                value={policyForm.customerEmail}
                onChange={handlePolicyInputChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                name="customerPhone"
                type="tel"
                required
                value={policyForm.customerPhone}
                onChange={handlePolicyInputChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2 mt-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Vehicle & Cover
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
                name="vehicleMake"
                type="text"
                required
                value={policyForm.vehicleMake}
                onChange={handlePolicyInputChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                name="vehicleModel"
                type="text"
                required
                value={policyForm.vehicleModel}
                onChange={handlePolicyInputChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                name="vehicleYear"
                type="number"
                min={1980}
                max={2100}
                required
                value={policyForm.vehicleYear}
                onChange={handlePolicyInputChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                name="coverType"
                value={policyForm.coverType}
                onChange={handlePolicyInputChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="comprehensive">Comprehensive</option>
                <option value="tpl">Third Party Liability</option>
              </select>
            </div>

            <div className="md:col-span-2 mt-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Premium & VAT
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
                name="basePremium"
                type="number"
                min={0}
                step="0.01"
                required
                value={policyForm.basePremium}
                onChange={handlePolicyInputChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                name="brokerFee"
                type="number"
                min={0}
                step="0.01"
                value={policyForm.brokerFee}
                onChange={handlePolicyInputChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                name="vatRate"
                type="number"
                min={0}
                max={100}
                step="0.1"
                required
                value={policyForm.vatRate}
                onChange={handlePolicyInputChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                name="policyStartDate"
                type="date"
                required
                value={policyForm.policyStartDate}
                onChange={handlePolicyInputChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                name="policyEndDate"
                type="date"
                required
                value={policyForm.policyEndDate}
                onChange={handlePolicyInputChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2 flex justify-end pt-2">
              <button
                type="submit"
                disabled={policyStatus === 'loading'}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-all duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {policyStatus === 'loading'
                  ? 'Creating...'
                  : 'Create Policy & Invoice'}
              </button>
            </div>
          </form>
        </section>

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
            <button
              type="button"
              onClick={() => void fetchDashboard()}
              disabled={dashboardStatus === 'loading'}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-all duration-200 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Refresh
            </button>
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-100">
            <div className="grid grid-cols-4 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600">
              <div>Policy #</div>
              <div>Customer</div>
              <div className="text-right">Amount (AED)</div>
              <div className="text-right">Status</div>
            </div>
            {dashboardStatus === 'loading' ? (
              <div className="flex items-center justify-center px-3 py-6">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                <span className="ml-2 text-xs text-gray-600">
                  Loading invoices...
                </span>
              </div>
            ) : invoices.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-gray-500">
                No invoices yet. Create your first motor policy invoice on the left.
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
        </section>
      </div>
    </section>
  );

  return (
    <main className="flex min-h-screen items-start justify-center bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex w-full max-w-6xl flex-col gap-6">
        {!user ? renderAuthSection() : renderDashboard()}
      </div>
    </main>
  );
});

export default Home;