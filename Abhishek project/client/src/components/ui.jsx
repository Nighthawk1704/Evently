export function PageShell({ title, subtitle, actions, children }) {
  return (
    <main className="mx-auto max-w-container px-4 py-8 sm:px-6">
      {(title || actions) && (
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            {title && <h1 className="font-display text-3xl text-ink-900">{title}</h1>}
            {subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </main>
  );
}

export function Spinner({ label = 'Loading…' }) {
  return (
    <div className="grid place-items-center py-16">
      <div className="flex items-center gap-3 text-sm text-ink-500">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink-200 border-t-ink-800" />
        {label}
      </div>
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="grid place-items-center rounded-lg border border-dashed border-ink-200 bg-ink-50/50 py-16 px-6 text-center">
      <div className="font-display text-xl text-ink-900">{title}</div>
      {description && <p className="mt-1 max-w-md text-sm text-ink-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">
      <div className="font-medium">Something went wrong</div>
      <div className="mt-0.5 text-red-800/90">{message}</div>
      {onRetry && (
        <button onClick={onRetry} className="mt-2 text-sm font-medium text-red-900 underline underline-offset-2">
          Try again
        </button>
      )}
    </div>
  );
}

export function StatusBadge({ status, labels, tones }) {
  return (
    <span className={`badge ${tones?.[status] || 'bg-ink-100 text-ink-700'}`}>
      {labels?.[status] || status}
    </span>
  );
}

export function FieldError({ children }) {
  if (!children) return null;
  return <p className="mt-1 text-xs text-red-600">{children}</p>;
}
