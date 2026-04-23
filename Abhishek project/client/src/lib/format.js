export const CATEGORY_LABELS = {
  Catering: 'Catering',
  Florist: 'Florist',
  Decoration: 'Decoration',
  Lighting: 'Lighting',
};

export const UNIT_LABELS = {
  per_event: 'per event',
  per_person: 'per person',
  per_hour: 'per hour',
  per_day: 'per day',
};

export const ORDER_STATUS_LABELS = {
  received: 'Received',
  ready_for_shipping: 'Ready for Shipping',
  out_for_delivery: 'Out for Delivery',
  cancelled: 'Cancelled',
};

export const ORDER_STATUS_TONE = {
  received: 'bg-indigo-100 text-indigo-700 font-bold',
  ready_for_shipping: 'bg-blue-100 text-blue-700 font-bold',
  out_for_delivery: 'bg-green-100 text-green-700 font-bold',
  cancelled: 'bg-red-100 text-red-700 font-bold',
};

export function formatINR(n) {
  if (typeof n !== 'number') n = Number(n) || 0;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

export function formatDate(input) {
  if (!input) return '-';
  const d = new Date(input);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(input) {
  if (!input) return '-';
  const d = new Date(input);
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/** Next N days in YYYY-MM-DD, useful for min-date inputs. */
export function todayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}
