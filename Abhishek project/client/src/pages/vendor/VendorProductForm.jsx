import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { api, errorMessage } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { productSchema } from '../../lib/schemas';
import { PageShell, Spinner, FieldError } from '../../components/ui';
import { CATEGORY_LABELS, UNIT_LABELS } from '../../lib/format';

export default function VendorProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '', description: '', category: 'Catering', price: 0, unit: 'per_event',
      imageUrl: '', isAvailable: true,
    },
  });

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const { data } = await api.get(`/api/products/${id}`);
        reset({
          name: data.product.name,
          description: data.product.description,
          category: data.product.category,
          price: data.product.price,
          unit: data.product.unit,
          imageUrl: data.product.imageUrl || '',
          isAvailable: data.product.isAvailable,
        });
      } catch (err) {
        toast.error(errorMessage(err));
        navigate('/vendor/products');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit, reset, toast, navigate]);

  const onSubmit = async values => {
    try {
      setSubmitting(true);
      if (isEdit) {
        await api.put(`/api/products/${id}`, values);
        toast.success('Product updated');
      } else {
        await api.post('/api/products', values);
        toast.success('Product created');
      }
      navigate('/vendor/products');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <PageShell title={isEdit ? 'Edit Item' : 'Add New Item'}>
      <Link to="/vendor/products" className="text-sm text-ink-500 hover:text-ink-900">← Back to Your Item</Link>
      <form onSubmit={handleSubmit(onSubmit)} className="card mt-4 max-w-2xl space-y-4 p-6 border-t-4 border-primary">
        <div>
          <label className="label font-bold">Item Name</label>
          <input className="input" {...register('name')} />
          <FieldError>{errors.name?.message}</FieldError>
        </div>

        <div>
          <label className="label font-bold">Item Description</label>
          <textarea rows={4} className="input" {...register('description')} />
          <FieldError>{errors.description?.message}</FieldError>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label font-bold">Category</label>
            <select className="input" {...register('category')}>
              {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <FieldError>{errors.category?.message}</FieldError>
          </div>
          <div>
            <label className="label font-bold">Price Unit</label>
            <select className="input" {...register('unit')}>
              {Object.entries(UNIT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="label font-bold">Price (₹)</label>
          <input type="number" min={0} step="1" className="input" {...register('price')} />
          <FieldError>{errors.price?.message}</FieldError>
        </div>

        <label className="flex items-center gap-2 text-sm font-bold">
          <input type="checkbox" {...register('isAvailable')} />
          <span>Active / Available for booking</span>
        </label>

        <div className="flex gap-2 pt-4">
          <button type="submit" disabled={submitting} className="button button-primary py-2 px-6 uppercase font-bold text-xs tracking-widest">
            {submitting ? 'Please wait...' : isEdit ? 'Update Item' : 'Insert Item'}
          </button>
          <Link to="/vendor/products" className="button bg-slate-100 text-slate-700 py-2 px-6 uppercase font-bold text-xs tracking-widest border border-slate-200">Cancel</Link>
        </div>
      </form>
    </PageShell>
  );
}
