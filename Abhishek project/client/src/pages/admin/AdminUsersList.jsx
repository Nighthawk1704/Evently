import { useEffect, useState } from 'react';
import { api, errorMessage } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { PageShell, Spinner, ErrorState, EmptyState } from '../../components/ui';
import { CATEGORY_LABELS, formatDate } from '../../lib/format';

export default function AdminUsersList({ role = 'user', title, subtitle }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(null);
  const toast = useToast();

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await api.get('/api/admin/users', { params: { role, limit: 50 } });
      setItems(data.items);
    } catch (err) { setError(errorMessage(err)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [role]);

  const toggle = async u => {
    try {
      setPending(u._id);
      await api.put(`/api/admin/users/${u._id}/active`, { isActive: !u.isActive });
      toast.success(`${u.name} ${u.isActive ? 'deactivated' : 'reactivated'}`);
      load();
    } catch (err) { toast.error(errorMessage(err)); }
    finally { setPending(null); }
  };

  if (loading) return <Spinner />;

  return (
    <PageShell title={title} subtitle={subtitle}>
      {error && <ErrorState message={error} onRetry={load} />}
      {!error && items.length === 0 && <EmptyState title={`No ${role}s yet`} />}
      {!error && items.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-ink-200 text-left text-[11px] uppercase tracking-wider text-ink-500">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                {role === 'vendor' && <th className="py-2 pr-4">Business</th>}
                {role === 'vendor' && <th className="py-2 pr-4">Category</th>}
                <th className="py-2 pr-4">Joined</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.map(u => (
                <tr key={u._id} className="border-b border-ink-100 text-sm">
                  <td className="py-3 pr-4 font-medium">{u.name}</td>
                  <td className="py-3 pr-4 text-ink-600">{u.email}</td>
                  {role === 'vendor' && <td className="py-3 pr-4">{u.businessName || '-'}</td>}
                  {role === 'vendor' && <td className="py-3 pr-4">{CATEGORY_LABELS[u.category] || '-'}</td>}
                  <td className="py-3 pr-4 text-ink-500">{formatDate(u.createdAt)}</td>
                  <td className="py-3 pr-4">
                    <span className={'badge ' + (u.isActive ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700')}>
                      {u.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      disabled={pending === u._id}
                      onClick={() => toggle(u)}
                      className={u.isActive ? 'btn-danger text-xs px-3 py-1.5' : 'btn-secondary text-xs px-3 py-1.5'}
                    >
                      {u.isActive ? 'Deactivate' : 'Reactivate'}
                    </button>
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
