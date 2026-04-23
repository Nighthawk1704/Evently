import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useCart } from '../../lib/cart';
import { api, errorMessage } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { PageShell, EmptyState, FieldError } from '../../components/ui';
import { checkoutSchema } from '../../lib/schemas';
import { formatINR, todayISO } from '../../lib/format';

export default function Checkout() {
  const { cart, total, count, clear } = useCart();
  const navigate = useNavigate();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { paymentMode: 'upi' },
  });

  if (count === 0) {
    return (
      <PageShell title="Checkout">
        <EmptyState title="Your cart is empty" description="Add items to your cart before checking out." />
      </PageShell>
    );
  }

  const onSubmit = async values => {
    try {
      setSubmitting(true);
      const payload = {
        items: cart.items.map(i => ({ product: i.product._id, quantity: i.quantity })),
        paymentMode: values.paymentMode,
        customerName: values.customerName,
        customerEmail: values.customerEmail,
        address: values.address,
        city: values.city,
        state: values.state,
        pincode: values.pincode,
        number: values.number,
        notes: values.notes || '',
      };
      const { data } = await api.post('/api/orders', payload);
      clear();
      toast.success('Order placed');
      navigate(`/orders/success/${data.order._id}`);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell title="Checkout">
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="card p-6">
            <h2 className="font-display text-lg">Billing Details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <label className="label">Name</label>
                <input className="input" placeholder="Full name" {...register('customerName')} />
                <FieldError>{errors.customerName?.message}</FieldError>
              </div>
              <div className="sm:col-span-1">
                <label className="label">E-mail</label>
                <input className="input" placeholder="example@email.com" {...register('customerEmail')} />
                <FieldError>{errors.customerEmail?.message}</FieldError>
              </div>
              <div className="sm:col-span-2">
                <label className="label">Address</label>
                <input className="input" placeholder="Street address, house no." {...register('address')} />
                <FieldError>{errors.address?.message}</FieldError>
              </div>
              <div className="sm:col-span-1">
                <label className="label">City</label>
                <input className="input" {...register('city')} />
                <FieldError>{errors.city?.message}</FieldError>
              </div>
              <div className="sm:col-span-1">
                <label className="label">State</label>
                <input className="input" {...register('state')} />
                <FieldError>{errors.state?.message}</FieldError>
              </div>
              <div className="sm:col-span-1">
                <label className="label">Pin Code</label>
                <input className="input" placeholder="6-digit code" {...register('pincode')} />
                <FieldError>{errors.pincode?.message}</FieldError>
              </div>
              <div className="sm:col-span-1">
                <label className="label">Number</label>
                <input className="input" placeholder="Mobile number" {...register('number')} />
                <FieldError>{errors.number?.message}</FieldError>
              </div>
              <div className="sm:col-span-2">
                <label className="label">Notes (optional)</label>
                <textarea rows={3} className="input" {...register('notes')} />
                <FieldError>{errors.notes?.message}</FieldError>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-display text-lg">Payment Method (Drop Down)</h2>
            <div className="mt-4">
              <select className="input" {...register('paymentMode')}>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
              </select>
            </div>
            <FieldError>{errors.paymentMode?.message}</FieldError>
          </div>
        </div>

        <aside>
          <div className="card p-6">
            <h2 className="font-display text-lg">Order summary</h2>
            <ul className="mt-4 divide-y divide-ink-100">
              {cart.items.map(({ product, quantity }) => (
                <li key={product._id} className="flex items-start justify-between gap-3 py-2 text-sm">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{product.name}</div>
                    <div className="text-xs text-ink-500">× {quantity}</div>
                  </div>
                  <div className="whitespace-nowrap">{formatINR(product.price * quantity)}</div>
                </li>
              ))}
            </ul>
            <div className="mt-4 border-t border-ink-100 pt-4 flex items-center justify-between">
              <span className="font-display text-lg">Grand Total</span>
              <span className="font-display text-2xl">{formatINR(total)}</span>
            </div>
            <button type="submit" disabled={submitting} className="btn-primary mt-5 w-full">
              {submitting ? 'Placing order…' : 'Order Now'}
            </button>
          </div>
        </aside>
      </form>
    </PageShell>
  );
}
