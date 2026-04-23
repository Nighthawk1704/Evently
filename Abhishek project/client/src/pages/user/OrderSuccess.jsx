import { Link, useParams } from 'react-router-dom';
import { PageShell } from '../../components/ui';

export default function OrderSuccess() {
  const { id } = useParams();
  return (
    <PageShell>
      <div className="mx-auto mt-8 max-w-md text-center card p-8 shadow-xl border-accent border-2">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-accent text-white shadow-lg">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="mt-6 font-display text-4xl text-ink-900 tracking-tighter uppercase font-bold text-accent">THANK YOU</h1>
        <p className="mt-4 text-ink-600 font-book">
          Your order has been placed successfully. The vendor is processing your request.
        </p>
        <div className="mt-10 flex flex-col gap-3">
          <Link to="/" className="btn-primary py-4 text-lg font-bold uppercase tracking-widest">Continue Shopping</Link>
          <Link to="/orders" className="text- ink-500 underline text-sm">View My Order Status</Link>
        </div>
      </div>
    </PageShell>
  );
}
