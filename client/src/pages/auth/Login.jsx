import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { loginSchema } from '../../lib/schemas';
import { errorMessage } from '../../api/client';
import { FieldError } from '../../components/ui';

const DEFAULT_PATH_BY_ROLE = {
  user: '/',
  vendor: '/vendor',
  admin: '/admin',
};

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async values => {
    try {
      setSubmitting(true);
      const user = await login(values.email, values.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}`);
      const from = location.state?.from?.pathname;
      navigate(from || DEFAULT_PATH_BY_ROLE[user.role] || '/', { replace: true });
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto grid min-h-[calc(100vh-3.5rem)] max-w-md place-items-center px-4 py-12">
      <div className="w-full">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl text-ink-900">Welcome back</h1>
          <p className="mt-1 text-sm text-ink-500">Sign in to continue.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4 p-8 border-t-4 border-primary">
          <div className="mb-4 text-center text-[10px] font-bold uppercase tracking-widest text-primary">Login Screen</div>
          <div>
            <label className="label font-bold" htmlFor="email">User Id</label>
            <input id="email" type="email" placeholder="Enter your ID/Email" className="input bg-slate-50" {...register('email')} />
            <FieldError>{errors.email?.message}</FieldError>
          </div>

          <div>
            <label className="label font-bold" htmlFor="password">Password</label>
            <input id="password" type="password" placeholder="••••••••" className="input bg-slate-50" {...register('password')} />
            <FieldError>{errors.password?.message}</FieldError>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <button type="submit" disabled={submitting} className="button button-primary w-full py-3 font-bold uppercase tracking-tighter">
              {submitting ? 'Please wait...' : 'Login'}
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/')} 
              className="button bg-slate-100 text-slate-700 w-full py-3 font-bold uppercase tracking-tighter border border-slate-300"
            >
              Cancel
            </button>
          </div>

          <p className="pt-4 text-center text-xs text-ink-500">
            Need an account?{' '}
            <Link to="/signup" className="font-bold text-accent underline underline-offset-4">
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
