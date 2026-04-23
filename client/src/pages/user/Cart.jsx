import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../lib/cart';
import { PageShell, EmptyState } from '../../components/ui';
import { formatINR, UNIT_LABELS } from '../../lib/format';

export default function Cart() {
  const { cart, setQuantity, remove, clear, total, count } = useCart();
  const navigate = useNavigate();

  if (count === 0) {
    return (
      <PageShell title="Your cart">
        <EmptyState
          title="Your cart is empty"
          description="Browse services and add items to build an order."
          action={<Link to="/" className="btn-primary">Browse services</Link>}
        />
      </PageShell>
    );
  }

  return (
    <PageShell title="Your cart" subtitle={`${count} item${count === 1 ? '' : 's'}`}>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {cart.items.map(({ product, quantity }) => (
            <div key={product._id} className="card flex flex-wrap items-start justify-between gap-4 p-4">
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-lg text-ink-900">{product.name}</h3>
                <div className="text-xs text-ink-500">
                  {formatINR(product.price)} · {UNIT_LABELS[product.unit]}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-ink-400 mb-1">Qty (Drop Down)</span>
                  <select 
                    value={quantity} 
                    onChange={e => setQuantity(product._id, Number(e.target.value))}
                    className="input py-1 px-2 pr-8 text-sm"
                  >
                    {[1, 2, 3, 4, 5, 10, 20, 50, 100].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div className="w-28 text-right flex flex-col">
                   <span className="text-[10px] uppercase font-bold text-ink-400 mb-1 text-right">Total Price</span>
                   <div className="font-medium">{formatINR(product.price * quantity)}</div>
                </div>
                <button onClick={() => remove(product._id)} className="text-sm text-red-600 hover:underline">
                  Remove
                </button>
              </div>
            </div>
          ))}
          <div className="flex justify-start">
            <button onClick={clear} className="text-sm font-bold text-red-500 hover:text-red-700 uppercase tracking-tighter">Delete All</button>
          </div>
        </div>

        <aside>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-500 font-bold uppercase">Subtotal</span>
              <span className="font-medium">{formatINR(total)}</span>
            </div>
            <div className="mt-4 border-t border-ink-100 pt-4 flex items-center justify-between">
              <span className="font-display text-lg">Grand Total</span>
              <span className="font-display text-2xl">{formatINR(total)}</span>
            </div>
            <button onClick={() => navigate('/checkout')} className="btn-primary mt-5 w-full uppercase tracking-wide font-bold">
              Proceed to Check Out
            </button>
            <p className="mt-3 text-center text-xs text-ink-500 italic">
              All items in an order must be from one vendor.
            </p>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
