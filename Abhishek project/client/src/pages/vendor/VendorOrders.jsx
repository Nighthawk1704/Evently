import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errorMessage } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { PageShell, Spinner, EmptyState, ErrorState, StatusBadge } from '../../components/ui';
import { formatINR, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_TONE } from '../../lib/format';

// Mirrors server/lib/orderState
const TRANSITIONS = {
  received: ['ready_for_shipping', 'cancelled'],
  ready_for_shipping: ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['cancelled'],
  cancelled: [],
};

export default function VendorOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(null);
  const toast = useToast();

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await api.get('/api/orders/incoming');
      setOrders(data.orders);
    } catch (err) { setError(errorMessage(err)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    try {
      setPending(id);
      await api.put(`/api/orders/${id}/status`, { status });
      toast.success(`Marked as ${ORDER_STATUS_LABELS[status]}`);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setPending(null);
    }
  };

  if (loading) return <Spinner />;

  return (
    <PageShell title="Product Status" subtitle="Manage incoming requests and order delivery states.">
      {error && <ErrorState message={error} onRetry={load} />}
      {!error && orders.length === 0 && (
        <EmptyState title="No orders yet" description="Current orders will appear here." />
      )}
      {!error && orders.length > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-ink-500 font-bold uppercase tracking-tighter">
                  <th className="py-4 px-4 font-bold">Name</th>
                  <th className="py-4 px-4 font-bold">E-Mail</th>
                  <th className="py-4 px-4 font-bold">Address</th>
                  <th className="py-4 px-4 font-bold text-center">Status</th>
                  <th className="py-4 px-4 text-right font-bold pr-8">Update / Delete</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => {
                  const next = TRANSITIONS[o.status] || [];
                  return (
                    <tr key={o._id} className="border-b hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 font-medium">{o.customerName}</td>
                      <td className="py-4 px-4 font-book">{o.customerEmail}</td>
                      <td className="py-4 px-4 text-xs max-w-[200px] truncate">{o.address}, {o.city}</td>
                      <td className="py-4 px-4 text-center">
                        <StatusBadge status={o.status} labels={ORDER_STATUS_LABELS} tones={ORDER_STATUS_TONE} />
                      </td>
                      <td className="py-4 px-4 text-right space-x-2 whitespace-nowrap">
                         <div className="flex justify-end gap-1">
                          {next.map(s => (
                            <button
                              key={s}
                              disabled={pending === o._id}
                              onClick={() => updateStatus(o._id, s)}
                              className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${s === 'cancelled' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-primary text-white'}`}
                            >
                              {ORDER_STATUS_LABELS[s]}
                            </button>
                          ))}
                          <Link to={`/orders/${o._id}`} className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-[10px] font-bold uppercase border border-slate-200">Details</Link>
                         </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageShell>
  );
}
