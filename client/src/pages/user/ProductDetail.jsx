import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, errorMessage } from '../../api/client';
import { PageShell, Spinner, ErrorState } from '../../components/ui';
import { CATEGORY_LABELS, UNIT_LABELS, formatINR } from '../../lib/format';
import { useCart } from '../../lib/cart';
import { useToast } from '../../context/ToastContext';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { add } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true); setError(null);
      try {
        const { data } = await api.get(`/api/products/${id}`);
        if (!cancelled) setProduct(data.product);
      } catch (err) {
        if (!cancelled) setError(errorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const onAdd = () => {
    if (add(product, quantity)) {
      toast.success(`Added ${quantity} × ${product.name}`);
      navigate('/cart');
    }
  };

  if (loading) return <Spinner />;
  if (error) return <PageShell><ErrorState message={error} /></PageShell>;
  if (!product) return null;

  return (
    <PageShell>
      <Link to="/" className="text-sm text-ink-500 hover:text-ink-900">← Back to browse</Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="text-[11px] font-medium uppercase tracking-wider text-ink-500">
            {CATEGORY_LABELS[product.category]}
          </div>
          <h1 className="mt-1 font-display text-4xl text-ink-900">{product.name}</h1>
          <div className="mt-1 text-sm text-ink-500">
            by {product.vendor?.businessName || product.vendor?.name}
          </div>
          <div className="flex gap-4 mt-6">
             <Link to={`/vendor/${product.vendor?._id}`} className="text-secondary text-sm font-bold uppercase underline">View Vendor</Link>
             <Link to="/" className="text-secondary text-sm font-bold uppercase underline">Browse Items</Link>
          </div>
          <p className="mt-6 whitespace-pre-line text-ink-700">{product.description}</p>

          {product.vendor?.description && (
            <div className="mt-8 rounded-lg border border-ink-100 bg-ink-50/40 p-4">
              <div className="text-[11px] font-medium uppercase tracking-wider text-ink-500">About the vendor</div>
              <p className="mt-1 text-sm text-ink-700">{product.vendor.description}</p>
            </div>
          )}
        </div>

        <aside className="lg:col-span-2">
          <div className="card sticky top-20 p-6">
            <div className="font-display text-3xl text-ink-900">{formatINR(product.price)}</div>
            <div className="mt-0.5 text-xs uppercase tracking-wider text-ink-500">{UNIT_LABELS[product.unit]}</div>

            <div className="mt-6">
              <label className="label">Quantity</label>
              <input
                type="number" min={1} max={1000}
                value={quantity}
                onChange={e => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                className="input"
              />
            </div>

            <button onClick={onAdd} className="btn-primary mt-4 w-full">Add to cart</button>
            <p className="mt-3 text-center text-xs text-ink-500">
              You'll confirm event details at checkout.
            </p>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
