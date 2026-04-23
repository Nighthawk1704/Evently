import { useEffect, useState } from 'react';
import { api, errorMessage } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { PageShell, Spinner, EmptyState, ErrorState, StatusBadge } from '../../components/ui';
import { formatDate, formatINR } from '../../lib/format';

const REQ_TONE = {
  pending: 'bg-ink-100 text-ink-700',
  accepted: 'bg-emerald-50 text-emerald-800',
  rejected: 'bg-red-50 text-red-800',
};

export default function VendorRequests() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [draft, setDraft] = useState({}); // id -> response text
  const [pending, setPending] = useState(null);
  const toast = useToast();

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await api.get('/api/requests/incoming');
      setItems(data.items);
    } catch (err) { setError(errorMessage(err)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const respond = async (id, status) => {
    try {
      setPending(id);
      await api.put(`/api/requests/${id}/respond`, { status, vendorResponse: draft[id] || '' });
      toast.success(`Request ${status}`);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setPending(null);
    }
  };

  if (loading) return <Spinner />;

  return (
    <PageShell title="Custom requests" subtitle="Users who need something custom from you.">
      {error && <ErrorState message={error} onRetry={load} />}
      {!error && items.length === 0 && (
        <EmptyState title="No requests yet" description="Custom requests from customers appear here." />
      )}
      {!error && items.length > 0 && (
        <div className="space-y-3">
          {items.map(r => (
            <div key={r._id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-display text-lg">{r.title}</div>
                  <div className="text-sm text-ink-500">
                    {r.user?.name} · Event on {formatDate(r.eventDate)}
                    {r.budget ? ` · Budget ${formatINR(r.budget)}` : ''}
                  </div>
                  <p className="mt-2 whitespace-pre-line text-sm text-ink-700">{r.details}</p>
                  {r.status !== 'pending' && r.vendorResponse && (
                    <div className="mt-3 rounded-md bg-ink-50 p-2 text-xs text-ink-700">
                      <span className="font-medium">Your response:</span> {r.vendorResponse}
                    </div>
                  )}
                </div>
                <StatusBadge status={r.status} labels={{ pending: 'Pending', accepted: 'Accepted', rejected: 'Rejected' }} tones={REQ_TONE} />
              </div>

              {r.status === 'pending' && (
                <div className="mt-4 border-t border-ink-100 pt-4">
                  <label className="label">Reply (optional)</label>
                  <textarea
                    rows={2}
                    className="input"
                    value={draft[r._id] || ''}
                    onChange={e => setDraft(d => ({ ...d, [r._id]: e.target.value }))}
                    placeholder="E.g., 'Available, lead time is 5 days. Estimate: ₹55,000.'"
                  />
                  <div className="mt-2 flex flex-wrap justify-end gap-2">
                    <button
                      disabled={pending === r._id}
                      onClick={() => respond(r._id, 'rejected')}
                      className="btn-danger text-sm"
                    >Decline</button>
                    <button
                      disabled={pending === r._id}
                      onClick={() => respond(r._id, 'accepted')}
                      className="btn-primary text-sm"
                    >Accept</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
