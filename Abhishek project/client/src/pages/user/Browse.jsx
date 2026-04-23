import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errorMessage } from '../../api/client';
import { PageShell, Spinner, EmptyState, ErrorState } from '../../components/ui';
import { CATEGORY_LABELS, UNIT_LABELS, formatINR } from '../../lib/format';
import { useCart } from '../../lib/cart';
import { useToast } from '../../context/ToastContext';

export default function Browse() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('');
  const [q, setQ] = useState('');
  const { add } = useCart();
  const toast = useToast();

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const params = {};
      if (category) params.category = category;
      if (q) params.q = q;
      const { data } = await api.get('/api/products', { params });
      setItems(data.items);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [category]);

  const onAdd = (product) => {
    if (add(product, 1)) toast.success(`Added ${product.name}`);
  };

  return (
    <PageShell
      title="Book vendors for your event"
      subtitle="Catering, decor, photography, venues - curated vendors, transparent pricing."
    >
      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <FilterChip active={!category} onClick={() => setCategory('')}>All</FilterChip>
        {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
          <FilterChip key={val} active={category === val} onClick={() => setCategory(val)}>
            {label}
          </FilterChip>
        ))}
        <form
          className="ml-auto flex items-center gap-2"
          onSubmit={e => { e.preventDefault(); load(); }}
        >
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search…"
            className="input max-w-[220px]"
          />
          <button type="submit" className="btn-secondary">Search</button>
        </form>
      </div>

      {loading && <Spinner />}
      {error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && items.length === 0 && (
        <EmptyState
          title="No services found"
          description="Try a different category or clear your search."
        />
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(p => (
            <article key={p._id} className="card flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-wider text-ink-500">
                    {CATEGORY_LABELS[p.category]}
                  </div>
                  <h3 className="mt-1 font-display text-xl text-ink-900">{p.name}</h3>
                  <div className="mt-0.5 text-sm text-ink-500">
                    by {p.vendor?.businessName || p.vendor?.name}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-xl text-ink-900">{formatINR(p.price)}</div>
                  <div className="text-[11px] uppercase tracking-wider text-ink-500">{UNIT_LABELS[p.unit]}</div>
                </div>
              </div>

              <p className="mt-3 line-clamp-3 text-sm text-ink-600">{p.description}</p>

              <div className="mt-auto flex items-center justify-between pt-4">
                <Link to={`/products/${p._id}`} className="text-sm font-medium text-ink-900 underline-offset-2 hover:underline">
                  View details
                </Link>
                <button onClick={() => onAdd(p)} className="btn-primary">Add to cart</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </PageShell>
  );
}

function FilterChip({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={
        'rounded-full border px-3 py-1 text-sm transition-colors ' +
        (active
          ? 'border-ink-900 bg-ink-900 text-white'
          : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300')
      }
    >
      {children}
    </button>
  );
}
