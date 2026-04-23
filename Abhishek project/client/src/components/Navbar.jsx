import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../lib/cart';

const linkCls = ({ isActive }) =>
  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors ' +
  (isActive ? 'bg-ink-100 text-ink-900' : 'text-ink-600 hover:text-ink-900 hover:bg-ink-50');

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-container items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded bg-ink-900 font-bold text-white text-xs">E</span>
          <span className="font-display text-xl tracking-tight">Evently</span>
        </Link>
        <a href="https://shorturl.at/fghsw" target="_blank" rel="noreferrer" className="text-[10px] bg-yellow-100 px-2 py-0.5 rounded border border-yellow-300 font-bold ml-2">Chart Link</a>

        <nav className="hidden items-center gap-1 sm:flex">
          {(!user || user.role === 'user') && (
            <>
              <NavLink to="/" end className={linkCls}>Vendor</NavLink>
              <NavLink to="/orders" className={linkCls}>Order Status</NavLink>
              <NavLink to="/guest-list" className={linkCls}>Guest List</NavLink>
            </>
          )}
          {user?.role === 'vendor' && (
            <>
              <NavLink to="/vendor" end className={linkCls}>Welcome</NavLink>
              <NavLink to="/vendor/products" className={linkCls}>Your Item</NavLink>
              <NavLink to="/vendor/orders" className={linkCls}>Transection</NavLink>
            </>
          )}
          {user?.role === 'admin' && (
            <>
              <NavLink to="/admin" end className={linkCls}>Welcome Admin</NavLink>
              <NavLink to="/admin/maintain-users" className={linkCls}>Maintain User</NavLink>
              <NavLink to="/admin/maintain-vendors" className={linkCls}>Maintain Vendor</NavLink>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {(!user || user.role === 'user') && (
            <Link
              to="/cart"
              className="relative rounded-md p-2 text-ink-600 hover:bg-ink-50 hover:text-ink-900"
              aria-label="Cart"
            >
              <span className="text-xs font-bold uppercase mr-1">Cart</span>
              <svg width="18" height="18" className="inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>
              </svg>
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white">
                  {count}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden text-[10px] text-ink-500 sm:inline uppercase font-bold tracking-widest">
                {user.name}
              </span>
              <button onClick={logout} className="px-3 py-1 bg-ink-900 text-white rounded text-[10px] font-bold uppercase tracking-widest">LogOut</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-secondary">Login</Link>
              <Link to="/signup" className="btn-primary">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
