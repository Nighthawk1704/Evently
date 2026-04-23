import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errorMessage } from '../../api/client';
import { PageShell, Spinner, ErrorState } from '../../components/ui';
import { formatINR } from '../../lib/format';

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await api.get('/api/admin/stats');
      setStats(data);
    } catch (err) { setError(errorMessage(err)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  if (loading) return <Spinner />;
  if (error) return <PageShell><ErrorState message={error} onRetry={load} /></PageShell>;

  return (
    <PageShell title="Welcome Admin" subtitle="Event Management System Control Panel">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="card p-6 flex flex-col items-center text-center">
          <div className="text-xl font-bold mb-4">Maintain User</div>
          <p className="text-ink-500 mb-6 font-book">Add or update membership, users, and account statuses.</p>
          <Link to="/admin/maintain-users" className="button button-primary w-full">Access Maintenance</Link>
        </div>
        
        <div className="card p-6 flex flex-col items-center text-center">
          <div className="text-xl font-bold mb-4">Maintain Vendor</div>
          <p className="text-ink-500 mb-6 font-book">Add or update membership, vendors, and business details.</p>
          <Link to="/admin/maintain-vendors" className="button button-primary w-full">Access Maintenance</Link>
        </div>

        <div className="card p-6 sm:col-span-2">
          <div className="text-lg font-bold mb-4">Quick Stats (Reports)</div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <KPI label="Total Orders" value={stats.orders} />
            <KPI label="Received" value={stats.received} />
            <KPI label="Out for Delivery" value={stats.delivered} />
            <KPI label="Total Revenue" value={formatINR(stats.revenue)} />
          </div>
          <div className="mt-6 flex justify-end">
            <Link to="/admin/orders" className="text-accent underline underline-offset-4">View All Transactions</Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function KPI({ label, value }) {
  return (
    <div className="card p-5">
      <div className="text-[11px] font-medium uppercase tracking-wider text-ink-500">{label}</div>
      <div className="mt-2 font-display text-3xl">{value}</div>
    </div>
  );
}
