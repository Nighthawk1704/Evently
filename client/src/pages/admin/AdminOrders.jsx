import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errorMessage } from '../../api/client';
import { PageShell, Spinner, ErrorState, EmptyState, StatusBadge } from '../../components/ui';
import { formatINR, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_TONE } from '../../lib/format';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await api.get('/api/admin/orders', { params: status ? { status } : {} });
      setOrders(data.orders);
    } catch (err) { setError(errorMessage(err)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [status]);

  if (loading) return <Spinner />;

  return (
    <PageShell title="Transactions" subtitle="Comprehensive report of all marketplace activity.">
      <div className="mb-6 flex flex-wrap gap-2">
        <Chip active={!status} onClick={() => setStatus('')}>All Transactions</Chip>
        {Object.entries(ORDER_STATUS_LABELS).map(([v, l]) => (
          <Chip key={v} active={status === v} onClick={() => setStatus(v)}>{l}</Chip>
        ))}
      </div>
      {error && <ErrorState message={error} onRetry={load} />}
      {!error && orders.length === 0 && <EmptyState title="No transactions found" />}
      {!error && orders.length > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 border-b text-ink-500 font-bold uppercase text-[10px] tracking-widest">
                  <th className="p-4">Reference</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Vendor</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o._id} className="border-b hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono text-xs text-ink-400">#{o._id.slice(-8).toUpperCase()}</td>
                    <td className="p-4">
                      <div className="font-bold">{o.customerName}</div>
                      <div className="text-[10px] text-ink-400">{o.customerEmail}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-primary">{o.vendor?.businessName || o.vendor?.name}</div>
                    </td>
                     <td className="p-4 text-ink-500">{formatDate(o.createdAt)}</td>
                    <td className="p-4 text-center">
                      <StatusBadge status={o.status} labels={ORDER_STATUS_LABELS} tones={ORDER_STATUS_TONE} />
                    </td>
                    <td className="p-4 text-right font-bold text-ink-900 pr-6">{formatINR(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageShell>
  );
}

function Chip({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={
        'rounded-full border px-3 py-1 text-xs font-medium transition-colors ' +
        (active ? 'border-ink-900 bg-ink-900 text-white' : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300')
      }
    >
      {children}
    </button>
  );
}
