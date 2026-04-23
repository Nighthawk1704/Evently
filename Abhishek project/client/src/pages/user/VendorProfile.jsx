import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, errorMessage } from '../../api/client';
import { PageShell, Spinner, ErrorState } from '../../components/ui';

export default function VendorProfile() {
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/api/vendors/${id}`);
        setVendor(data.vendor);
      } catch (err) {
        setError(errorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <Spinner />;
  if (error) return <PageShell><ErrorState message={error} /></PageShell>;
  if (!vendor) return null;

  return (
    <PageShell title={vendor.businessName || vendor.name} subtitle={vendor.category}>
      <Link to="/" className="text-sm text-ink-500 hover:text-ink-900">← Back to gallery</Link>
      <div className="mt-8 card p-8 max-w-2xl">
        <h2 className="text-2xl font-bold mb-4 uppercase tracking-tighter">Business Profile</h2>
        <p className="text-ink-700 whitespace-pre-line leading-relaxed mb-6">
          {vendor.description || 'No description provided for this vendor.'}
        </p>
        <div className="pt-6 border-t border-slate-100 flex gap-4">
           <Link to="/" className="button button-primary uppercase font-bold py-2 px-6">View All Items</Link>
        </div>
      </div>
    </PageShell>
  );
}
