import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { api, errorMessage } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { PageShell, Spinner, EmptyState, ErrorState, FieldError, StatusBadge } from '../../components/ui';
import { requestItemSchema } from '../../lib/schemas';
import { CATEGORY_LABELS, formatDate, formatINR, todayISO } from '../../lib/format';

const REQ_STATUS_TONE = {
  pending: 'bg-ink-100 text-ink-700',
  accepted: 'bg-emerald-50 text-emerald-800',
  rejected: 'bg-red-50 text-red-800',
};

export default function RequestItem() {
  const toast = useToast();
  const [vendors, setVendors] = useState([]);
  const [mine, setMine] = useState([]);
  const [vloading, setVLoading] = useState(true);
  const [mloading, setMLoading] = useState(true);
  const [verror, setVError] = useState(null);
  const [merror, setMError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(requestItemSchema),
  });

  const loadVendors = async () => {
    setVLoading(true); setVError(null);
    try {
      const { data } = await api.get('/api/vendors');
      setVendors(data.vendors);
    } catch (err) { setVError(errorMessage(err)); }
    finally { setVLoading(false); }
  };
  const loadMine = async () => {
    setMLoading(true); setMError(null);
    try {
      const { data } = await api.get('/api/requests/mine');
      setMine(data.items);
    } catch (err) { setMError(errorMessage(err)); }
    finally { setMLoading(false); }
  };
  useEffect(() => { loadVendors(); loadMine(); }, []);

  const onSubmit = async values => {
    try {
      setSubmitting(true);
      const payload = { ...values };
      if (payload.budget === '' || payload.budget == null) delete payload.budget;
      else payload.budget = Number(payload.budget);
      await api.post('/api/requests', payload);
      toast.success('Request sent');
      reset();
      loadMine();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell
      title="User Request"
      subtitle="Request custom items from vendors (Drawing 19)."
    >
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <h2 className="mb-4 font-bold text-xl uppercase tracking-tighter text-primary">Add Request Item (Drawing 18)</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4 p-6 border-l-4 border-primary">
            <div>
              <label className="label font-bold">Pick Vendor</label>
              {vloading ? (
                <div className="text-sm text-ink-500">Loading vendors…</div>
              ) : verror ? (
                <ErrorState message={verror} onRetry={loadVendors} />
              ) : (
                <select className="input" defaultValue="" {...register('vendor')}>
                  <option value="" disabled>Choose a vendor</option>
                  {vendors.map(v => (
                    <option key={v._id} value={v._id}>
                      {v.businessName || v.name}
                    </option>
                  ))}
                </select>
              )}
              <FieldError>{errors.vendor?.message}</FieldError>
            </div>

            <div>
              <label className="label font-bold">Request Title</label>
              <input className="input" placeholder="e.g. Flower Decoration" {...register('title')} />
              <FieldError>{errors.title?.message}</FieldError>
            </div>

            <div>
              <label className="label font-bold">Details</label>
              <textarea rows={4} className="input" placeholder="Describe your request..." {...register('details')} />
              <FieldError>{errors.details?.message}</FieldError>
            </div>

            <button type="submit" disabled={submitting} className="button button-primary w-full py-3 font-bold uppercase tracking-widest text-sm">
              {submitting ? 'Sending...' : 'Add Request Item'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-3">
          <h2 className="mb-4 font-bold text-xl uppercase tracking-tighter text-primary">User Request List (Drawing 19)</h2>
          {mloading && <Spinner />}
          {merror && <ErrorState message={merror} onRetry={loadMine} />}
          {!mloading && !merror && mine.length === 0 && (
            <EmptyState title="No requests yet" description="Your requests will appear here." />
          )}
          {!mloading && !merror && mine.length > 0 && (
            <div className="card overflow-hidden">
               <table className="w-full text-left text-sm">
                 <thead>
                   <tr className="bg-slate-50 border-b">
                     <th className="p-4 font-bold uppercase text-[10px] tracking-widest">Request Item</th>
                     <th className="p-4 font-bold uppercase text-[10px] tracking-widest text-center">Vendor</th>
                     <th className="p-4 font-bold uppercase text-[10px] tracking-widest text-right">Status</th>
                   </tr>
                 </thead>
                 <tbody>
                   {mine.map(r => (
                     <tr key={r._id} className="border-b hover:bg-slate-50 transition-colors">
                       <td className="p-4">
                         <div className="font-bold text-ink-900">{r.title}</div>
                         <div className="text-[10px] text-ink-400 font-book uppercase">{formatDate(r.createdAt)}</div>
                       </td>
                       <td className="p-4 text-center">
                         <div className="text-sm font-medium">{r.vendor?.businessName || r.vendor?.name}</div>
                       </td>
                       <td className="p-4 text-right">
                          <StatusBadge status={r.status} labels={{ pending: 'Pending', accepted: 'Accepted', rejected: 'Rejected' }} tones={REQ_STATUS_TONE} />
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
