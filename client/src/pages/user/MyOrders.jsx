import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errorMessage } from '../../api/client';
import { PageShell, Spinner, EmptyState, ErrorState, StatusBadge } from '../../components/ui';
import { formatINR, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_TONE } from '../../lib/format';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await api.get('/api/orders/mine');
      setOrders(data.orders);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  if (loading) return <Spinner />;

  return (
    <PageShell title="Your orders" subtitle="Every event you've booked on Evently.">
      {error && <ErrorState message={error} onRetry={load} />}
      {!error && orders.length === 0 && (
        <EmptyState
          title="No orders yet"
          description="Book a vendor to see your orders here."
          action={<Link to="/" className="btn-primary">Browse services</Link>}
        />
      )}
      {!error && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map(o => (
            <Link key={o._id} to={`/orders/${o._id}`} className="card block p-5 transition-colors hover:border-ink-300">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-wider text-ink-500">
                    Order · {o._id.slice(-6)}
                  </div>
                  <div className="mt-1 font-display text-lg">{o.vendor?.businessName || o.vendor?.name}</div>
                  <div className="mt-0.5 text-sm text-ink-500">
                    Event on {formatDate(o.eventDate)} · {o.items.length} item{o.items.length === 1 ? '' : 's'}
                  </div>
                </div>
                <div className="text-right">
                  <StatusBadge status={o.status} labels={ORDER_STATUS_LABELS} tones={ORDER_STATUS_TONE} />
                  <div className="mt-1 font-display text-xl">{formatINR(o.total)}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  );
}
