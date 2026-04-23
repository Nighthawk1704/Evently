import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errorMessage } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { PageShell, Spinner, EmptyState, ErrorState } from '../../components/ui';
import { CATEGORY_LABELS, UNIT_LABELS, formatINR } from '../../lib/format';

export default function VendorProducts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await api.get('/api/products/mine/list');
      setItems(data.items);
    } catch (err) { setError(errorMessage(err)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const onDelete = async id => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/api/products/${id}`);
      toast.success('Product deleted');
      load();
    } catch (err) { toast.error(errorMessage(err)); }
  };

  if (loading) return <Spinner />;

  return (
    <PageShell
      title="Your Item"
      subtitle="Manage your listed items and services."
      actions={<Link to="/vendor/products/new" className="button button-primary py-2 px-4 uppercase font-bold text-xs">Add New Item</Link>}
    >
      {error && <ErrorState message={error} onRetry={load} />}
      {!error && items.length === 0 && (
        <EmptyState
          title="No items found"
          description="Click Add New Item to begin."
          action={<Link to="/vendor/products/new" className="button button-primary py-2 px-4 uppercase font-bold text-xs">Add New Item</Link>}
        />
      )}
      {!error && items.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-ink-200 text-left text-[11px] uppercase tracking-wider text-ink-500">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Category</th>
                <th className="py-2 pr-4">Price</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.map(p => (
                <tr key={p._id} className="border-b border-ink-100 text-sm">
                  <td className="py-3 pr-4">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-ink-500 line-clamp-1">{p.description}</div>
                  </td>
                  <td className="py-3 pr-4">{CATEGORY_LABELS[p.category]}</td>
                  <td className="py-3 pr-4">
                    {formatINR(p.price)}
                    <div className="text-xs text-ink-500">{UNIT_LABELS[p.unit]}</div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={'badge ' + (p.isAvailable ? 'bg-emerald-50 text-emerald-800' : 'bg-ink-100 text-ink-600')}>
                      {p.isAvailable ? 'Available' : 'Hidden'}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <Link to={`/vendor/products/${p._id}/edit`} className="text-sm font-medium hover:underline">Edit</Link>
                    <button onClick={() => onDelete(p._id)} className="ml-3 text-sm text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
}
