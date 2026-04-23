import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, errorMessage } from '../../api/client';
import { PageShell, Spinner, ErrorState, StatusBadge } from '../../components/ui';
import { formatINR, formatDate, formatDateTime, ORDER_STATUS_LABELS, ORDER_STATUS_TONE } from '../../lib/format';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await api.get(`/api/orders/${id}`);
      setOrder(data.order);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  if (loading) return <Spinner />;
  if (error) return <PageShell><ErrorState message={error} onRetry={load} /></PageShell>;
  if (!order) return null;

  return (
    <PageShell>
      <Link to="/orders" className="text-sm text-ink-500 hover:text-ink-900">← Back to orders</Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-ink-500">
            Order · {order._id.slice(-6)}
          </div>
          <h1 className="mt-1 font-display text-3xl">{order.vendor?.businessName || order.vendor?.name}</h1>
          <div className="text-sm text-ink-500">
            Placed {formatDateTime(order.createdAt)}
          </div>
        </div>
        <StatusBadge status={order.status} labels={ORDER_STATUS_LABELS} tones={ORDER_STATUS_TONE} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="card p-6">
            <h2 className="font-display text-lg">Items</h2>
            <ul className="mt-3 divide-y divide-ink-100">
              {order.items.map((it, idx) => (
                <li key={idx} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <div className="font-medium">{it.name}</div>
                    <div className="text-xs text-ink-500">{formatINR(it.price)} × {it.quantity}</div>
                  </div>
                  <div className="whitespace-nowrap">{formatINR(it.price * it.quantity)}</div>
                </li>
              ))}
            </ul>
            <div className="mt-4 border-t border-ink-100 pt-4 flex items-center justify-between">
              <span className="font-display text-lg">Total</span>
              <span className="font-display text-2xl">{formatINR(order.total)}</span>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-display text-lg">Status timeline</h2>
            <ol className="mt-4 space-y-3">
              {order.statusHistory?.length
                ? order.statusHistory.map((s, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-ink-900" />
                      <span className="text-sm font-medium">{ORDER_STATUS_LABELS[s.status]}</span>
                      <span className="ml-auto text-xs text-ink-500">{formatDateTime(s.at)}</span>
                    </li>
                  ))
                : <li className="text-sm text-ink-500">No history yet.</li>}
            </ol>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="card p-6">
            <h2 className="font-display text-lg">Event</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <Row label="Date" value={formatDate(order.eventDate)} />
              <Row label="Address" value={order.eventAddress} />
              <Row label="Contact" value={order.contactPhone} />
              <Row label="Payment" value={order.paymentMode === 'upi' ? 'UPI' : 'Cash'} />
              {order.notes && <Row label="Notes" value={order.notes} />}
            </dl>
          </div>
          <div className="card p-6">
            <h2 className="font-display text-lg">Vendor</h2>
            <div className="mt-3 text-sm">
              <div className="font-medium">{order.vendor?.businessName || order.vendor?.name}</div>
              {order.vendor?.category && (
                <div className="text-xs uppercase tracking-wider text-ink-500">{order.vendor.category}</div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-ink-500">{label}</dt>
      <dd className="text-right text-ink-900">{value}</dd>
    </div>
  );
}
