import { useState, useEffect } from 'react';
import { api, errorMessage } from '../../api/client';
import { PageShell } from '../../components/ui';
import { useToast } from '../../context/ToastContext';

export default function MaintainUsers() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const toast = useToast();

  // Add Membership State
  const [vendorId, setVendorId] = useState('');
  const [addPlan, setAddPlan] = useState('6 months');
  
  const [membershipNum, setMembershipNum] = useState('');
  const [membershipData, setMembershipData] = useState(null);
  const [action, setAction] = useState('extend');
  const [updatePlan, setUpdatePlan] = useState('6 months');

  const fetchMembership = async (num) => {
     if (num.length < 5) return;
     try {
       const { data } = await api.get(`/api/admin/memberships/${num}`);
       setMembershipData(data);
       toast.success(`Found membership for ${data.vendor?.businessName || data.vendor?.name}`);
     } catch (err) {
       setMembershipData(null);
     }
  };

  // Lists
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);

  const load = async () => {
    try {
      const [{ data: u }, { data: v }] = await Promise.all([
        api.get('/api/admin/users?role=user'),
        api.get('/api/admin/users?role=vendor')
      ]);
      setUsers(u.items);
      setVendors(v.items);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAddMembership = async (e) => {
    e.preventDefault();
    setLoading(true); setSuccess(null); setError(null);
    try {
      const { data } = await api.post('/api/admin/memberships', { vendorId, plan: addPlan });
      setSuccess(`Membership ${data.membershipNumber} created successfully!`);
      setVendorId('');
    } catch (err) { setError(errorMessage(err)); }
    finally { setLoading(false); }
  };

  const handleUpdateMembership = async (e) => {
    e.preventDefault();
    setLoading(true); setSuccess(null); setError(null);
    try {
      const { data } = await api.put(`/api/admin/memberships/${membershipNum}`, { action, plan: updatePlan });
      setSuccess(`Membership ${data.membershipNumber} updated successfully!`);
      setMembershipNum('');
    } catch (err) { setError(errorMessage(err)); }
    finally { setLoading(false); }
  };

  return (
    <PageShell title="Maintain User" subtitle="Manage memberships and user accounts.">
      {success && <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">{success}</div>}
      {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">{error}</div>}

      <div className="grid gap-8 lg:grid-cols-2">
        {/* --- Add Membership Section --- */}
        <section className="card p-6">
          <h3 className="text-lg font-bold mb-6 pb-2 border-b">Add Membership</h3>
          <form onSubmit={handleAddMembership} className="space-y-4">
            <div>
              <label className="label">Select Vendor (Mandatory)</label>
              <select 
                className="input" 
                required 
                value={vendorId} 
                onChange={e => setVendorId(e.target.value)}
              >
                <option value="">Select a vendor...</option>
                {vendors.map(v => (
                  <option key={v._id} value={v._id}>{v.businessName || v.name} ({v.email})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label mb-2">Duration (Default: 6 months)</label>
              <div className="flex gap-6">
                {['6 months', '1 year', '2 years'].map(p => (
                  <label key={p} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="addPlan" 
                      value={p} 
                      checked={addPlan === p} 
                      onChange={e => setAddPlan(e.target.value)}
                    />
                    <span className="text-sm">{p}</span>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className="button button-primary w-full mt-4">
              {loading ? 'Processing...' : 'Add Membership'}
            </button>
          </form>
        </section>

        {/* --- Update Membership Section --- */}
        <section className="card p-6">
          <h3 className="text-lg font-bold mb-6 pb-2 border-b">Update Membership</h3>
          <form onSubmit={handleUpdateMembership} className="space-y-4">
            <div>
              <label className="label">Membership Number (Mandatory)</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  className="input" 
                  placeholder="e.g. MEM-ABC123" 
                  required 
                  value={membershipNum}
                  onChange={e => {
                    const val = e.target.value.toUpperCase();
                    setMembershipNum(val);
                    if (val.length >= 10) fetchMembership(val);
                  }}
                />
                <button type="button" onClick={() => fetchMembership(membershipNum)} className="button bg-slate-100 text-[10px] px-2 font-bold border border-slate-200">Fetch</button>
              </div>
            </div>

            {membershipData && (
              <div className="p-3 bg-slate-50 rounded border border-dashed border-slate-300 text-xs">
                <div className="font-bold text-primary mb-1">Membership Details:</div>
                <div>Vendor: <span className="font-bold">{membershipData.vendor?.businessName || membershipData.vendor?.name}</span></div>
                <div>Expires: <span className="font-bold text-red-500">{new Date(membershipData.expiresAt).toLocaleDateString()}</span></div>
                <div>Plan: <span className="font-bold">{membershipData.plan}</span></div>
              </div>
            )}

            <div>
              <label className="label mb-2">Action</label>
              <div className="flex gap-6">
                {[
                  { id: 'extend', label: 'Extend (6 mos default)' }, 
                  { id: 'cancel', label: 'Cancel Membership' }
                ].map(a => (
                  <label key={a.id} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="action" 
                      value={a.id} 
                      checked={action === a.id} 
                      onChange={e => setAction(e.target.value)}
                    />
                    <span className="text-sm">{a.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {action === 'extend' && (
              <div>
                <label className="label mb-2">Extension Period</label>
                <div className="flex gap-6">
                  {['6 months', '1 year', '2 years'].map(p => (
                    <label key={p} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="updatePlan" 
                        value={p} 
                        checked={updatePlan === p} 
                        onChange={e => setUpdatePlan(e.target.value)}
                      />
                      <span className="text-sm">{p}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="button button-primary w-full mt-4">
              {loading ? 'Processing...' : 'Update Membership'}
            </button>
          </form>
        </section>

        {/* --- Add Counter Section --- */}
        <section className="card p-6 lg:col-span-2">
          <h3 className="text-lg font-bold mb-4 pb-2 border-b">Add New Customer</h3>
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={async e => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const payload = Object.fromEntries(formData);
            payload.role = 'user';
            try {
              setLoading(true);
              await api.post('/api/auth/register', payload);
              toast.success('User created');
              e.target.reset();
              load();
            } catch (err) { setError(errorMessage(err)); }
            finally { setLoading(false); }
          }}>
            <div>
              <label className="label">Name</label>
              <input name="name" className="input" required />
            </div>
            <div>
              <label className="label">Email</label>
              <input name="email" type="email" className="input" required />
            </div>
            <div>
              <label className="label">Password</label>
              <input name="password" type="password" className="input" required minLength={8} />
            </div>
            <div className="flex items-end">
               <button type="submit" disabled={loading} className="button button-primary w-full uppercase font-bold">Create Account</button>
            </div>
          </form>
        </section>

        {/* --- User List --- */}
        <section className="card p-6 lg:col-span-2">
          <h3 className="text-lg font-bold mb-4 pb-2 border-b">User Directory</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-ink-500 font-medium">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} className="border-b hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium">{u.name}</td>
                    <td className="py-3 px-4">{u.email}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {u.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
