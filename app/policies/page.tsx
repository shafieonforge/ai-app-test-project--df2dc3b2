'use client';

import type { FC } from 'react';
import { memo, useEffect, useState } from 'react';
import type { Policy } from '@/lib/billing/types';
import type { ApiState } from '@/lib/billing/types';
import { DEMO_POLICIES } from '@/lib/billing/demoData';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import PolicyTable from '@/app/components/PolicyTable';

const PoliciesPage: FC = memo(function PoliciesPage() {
  const [state, setState] = useState<ApiState<Policy[]>>({
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
        data: DEMO_POLICIES,
        error: 'Supabase not configured. Showing demo policies.',
        loading: false,
      });
      return;
    }

    const fetchPolicies = async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const res = await supabase
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
          .order('inception_date', { ascending: false });

        if (!isMounted) return;

        const rows = res.data ?? [];

        const policies: Policy[] = rows.map((row: unknown) => {
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

        setState({
          data: policies.length ? policies : DEMO_POLICIES,
          error: policies.length ? null : 'No policies found. Showing demo data.',
          loading: false,
        });
      } catch (err) {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : 'Unknown Supabase error';
        setState({
          data: DEMO_POLICIES,
          error: `Supabase error: ${msg}. Showing demo policies.`,
          loading: false,
        });
      }
    };

    void fetchPolicies();

    return () => {
      isMounted = false;
    };
  }, [hasSupabaseEnv]);

  const policies = state.data ?? DEMO_POLICIES;

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Policies</h1>
          <p className="text-sm text-slate-600">
            Full portfolio view with premium, plate and emirate details.
          </p>
        </div>
        <span className="text-xs text-slate-500">
          {state.loading ? 'Loading…' : `${policies.length} policies`}
        </span>
      </header>

      {state.error && (
        <section
          aria-label="Policies warning"
          className="mb-4 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-xs text-amber-900"
        >
          {state.error}
        </section>
      )}

      {state.loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            <span className="text-sm text-slate-600">Loading policies…</span>
          </div>
        </div>
      ) : (
        <PolicyTable policies={policies} />
      )}
    </main>
  );
});

export default PoliciesPage;