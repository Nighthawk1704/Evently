import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { userSignupSchema, vendorSignupSchema } from '../../lib/schemas';
import { errorMessage } from '../../api/client';
import { FieldError } from '../../components/ui';
import { CATEGORY_LABELS } from '../../lib/format';

export default function Signup() {
  const [role, setRole] = useState('user');

  return (
    <div className="mx-auto grid min-h-[calc(100vh-3.5rem)] max-w-xl place-items-center px-4 py-12">
      <div className="w-full">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl text-ink-900">Create your account</h1>
          <p className="mt-1 text-sm text-ink-500">Book services, or list your own.</p>
        </div>

        <div className="mb-4 inline-flex rounded-md border border-ink-200 bg-white p-0.5 text-sm shadow-card">
          <button
            className={'rounded-[5px] px-4 py-1.5 font-medium transition-colors ' +
              (role === 'user' ? 'bg-ink-900 text-white' : 'text-ink-600 hover:text-ink-900')}
            onClick={() => setRole('user')}
          >I'm booking</button>
          <button
            className={'rounded-[5px] px-4 py-1.5 font-medium transition-colors ' +
              (role === 'vendor' ? 'bg-ink-900 text-white' : 'text-ink-600 hover:text-ink-900')}
            onClick={() => setRole('vendor')}
          >I'm a vendor</button>
        </div>

        {role === 'user' ? <UserForm /> : <VendorForm />}

        <p className="mt-4 text-center text-xs text-ink-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-ink-900 underline underline-offset-2">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

function UserForm() {
  const { signup } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(userSignupSchema),
  });

  const onSubmit = async values => {
    try {
      setSubmitting(true);
      await signup({ ...values, role: 'user' });
      toast.success('Welcome to Evently');
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4 p-6">
      <Field label="Full name" error={errors.name?.message}>
        <input className="input" autoComplete="name" {...register('name')} />
      </Field>
      <Field label="Email" error={errors.email?.message}>
        <input type="email" className="input" autoComplete="email" {...register('email')} />
      </Field>
      <Field label="Password" error={errors.password?.message}>
        <input type="password" className="input" autoComplete="new-password" {...register('password')} />
      </Field>
      <Field label="Phone (optional)" error={errors.phone?.message}>
        <input className="input" autoComplete="tel" {...register('phone')} />
      </Field>

      <button type="submit" disabled={submitting} className="btn-primary w-full">
        {submitting ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  );
}

function VendorForm() {
  const { signup } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(vendorSignupSchema),
  });

  const onSubmit = async values => {
    try {
      setSubmitting(true);
      await signup({ ...values, role: 'vendor' });
      toast.success('Vendor account created');
      navigate('/vendor', { replace: true });
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4 p-6">
      <Field label="Your name" error={errors.name?.message}>
        <input className="input" autoComplete="name" {...register('name')} />
      </Field>
      <Field label="Business name" error={errors.businessName?.message}>
        <input className="input" {...register('businessName')} />
      </Field>
      <Field label="Category" error={errors.category?.message}>
        <select className="input" defaultValue="" {...register('category')}>
          <option value="" disabled>Pick a category</option>
          {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </Field>
      <Field label="Description" error={errors.description?.message}>
        <textarea rows={3} className="input" {...register('description')} />
      </Field>
      <Field label="Email" error={errors.email?.message}>
        <input type="email" className="input" autoComplete="email" {...register('email')} />
      </Field>
      <Field label="Password" error={errors.password?.message}>
        <input type="password" className="input" autoComplete="new-password" {...register('password')} />
      </Field>
      <Field label="Phone (optional)" error={errors.phone?.message}>
        <input className="input" autoComplete="tel" {...register('phone')} />
      </Field>

      <button type="submit" disabled={submitting} className="btn-primary w-full">
        {submitting ? 'Creating account…' : 'Create vendor account'}
      </button>
    </form>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      <FieldError>{error}</FieldError>
    </div>
  );
}
