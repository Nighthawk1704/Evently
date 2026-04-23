import { Link, useLocation } from 'react-router-dom';

export default function DevFloatingNav() {
  const location = useLocation();
  const hideOn = ['/login', '/signup', '/unauthorized'];

  if (hideOn.includes(location.pathname)) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Link
        to="/flowchart"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-900 text-white shadow-lg shadow-ink-900/20 transition-all hover:scale-110 hover:bg-ink-800 active:scale-95 group"
        title="Project Flow Chart"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform group-hover:rotate-12"
        >
          <path d="M12 2v20" />
          <path d="m17 7-5-5-5 5" />
          <path d="m17 17-5 5-5-5" />
          <path d="M22 12H2" />
        </svg>
        <span className="absolute right-full mr-3 whitespace-nowrap rounded bg-ink-900 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white opacity-0 transition-opacity group-hover:opacity-100">
          Project Flow Chart
        </span>
      </Link>
    </div>
  );
}
