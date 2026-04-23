import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center px-4 py-12">
      <div className="max-w-md text-center">
        <h1 className="font-display text-4xl text-ink-900">403</h1>
        <p className="mt-2 text-sm text-ink-500">You don't have access to this page.</p>
        <Link to="/" className="btn-secondary mt-6 inline-flex">Back to browse</Link>
      </div>
    </div>
  );
}
