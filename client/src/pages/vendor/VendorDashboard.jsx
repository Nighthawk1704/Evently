import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errorMessage } from '../../api/client';
import { PageShell, Spinner, ErrorState, StatusBadge } from '../../components/ui';
import { formatINR, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_TONE } from '../../lib/format';

export default function VendorDashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [o, p, r] = await Promise.all([
        api.get('/api/orders/incoming'),
        api.get('/api/products/mine/list'),
        api.get('/api/requests/incoming'),
      ]);
      setOrders(o.data.orders);
      setProducts(p.data.items);
      setRequests(r.data.items);
    } catch (err) { setError(errorMessage(err)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  if (loading) return <Spinner />;
  if (error) return <PageShell><ErrorState message={error} onRetry={load} /></PageShell>;

  const open = orders.filter(o => ['placed', 'accepted', 'out_for_delivery'].includes(o.status));
  const revenue = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.total, 0);
  const pendingReq = requests.filter(r => r.status === 'pending').length;

  return (
    <PageShell title="Welcome">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <KPI label="Your Item" value={products.length} to="/vendor/products" />
        <KPI label="Add New Item" value="+" to="/vendor/products/new" />
        <KPI label="Transection" value={orders.length} to="/vendor/orders" />
      </div>

      <h2 className="mt-10 font-display text-xl">Recent orders</h2>
      <div className="mt-3 space-y-3">
        {orders.slice(0, 5).map(o => (
          <Link key={o._id} to={`/orders/${o._id}`} className="card block p-4 transition-colors hover:border-ink-300">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wider text-ink-500">
                  Order · {o._id.slice(-6)}
                </div>
                <div className="mt-0.5 text-sm">
                  {o.user?.name} · Event on {formatDate(o.eventDate)}
                </div>
              </div>
              <div className="text-right">
                <StatusBadge status={o.status} labels={ORDER_STATUS_LABELS} tones={ORDER_STATUS_TONE} />
                <div className="mt-1 text-sm font-medium">{formatINR(o.total)}</div>
              </div>
            </div>
          </Link>
        ))}
        {orders.length === 0 && <div className="text-sm text-ink-500">No orders yet.</div>}
      </div>
    </PageShell>
  );
}

function KPI({ label, value, to }) {
  const body = (
    <div className="card p-5">
      <div className="text-[11px] font-medium uppercase tracking-wider text-ink-500">{label}</div>
      <div className="mt-2 font-display text-3xl text-ink-900">{value}</div>
    </div>
  );
  return to ? <Link to={to} className="block transition-colors hover:[&>*]:border-ink-300">{body}</Link> : body;
}
