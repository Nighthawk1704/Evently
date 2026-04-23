import { PageShell } from '../../components/ui';

export default function FlowChart() {
  const screens = [
    { id: 1, name: 'Index Page', detail: 'Public landing page' },
    { id: 2, name: 'Search Result', detail: 'Vendor search results' },
    { id: 3, name: 'User Login', detail: 'Login for Buyers' },
    { id: 4, name: 'Admin Login', detail: 'Login for Management' },
    { id: 5, name: 'Admin Signup', detail: 'Add Vendor profile (Integrated in Maintenance)' },
    { id: 6, name: 'Vendor Login', detail: 'Login for Service Providers' },
    { id: 7, name: 'Vendor Dashboard', detail: 'Your Item / Add New Item / Transection' },
    { id: 8, name: 'Add New Item', detail: 'Vendor product creation form' },
    { id: 9, name: 'Your Item', detail: 'Vendor product management table' },
    { id: 10, name: 'User Portal', detail: 'Browse items by category' },
    { id: 11, name: 'Product Detail', detail: 'View specific service details' },
    { id: 12, name: 'Vendor Detail', detail: 'View vendor profile' },
    { id: 13, name: 'Cart Page', detail: 'Qty dropdowns and total calculation' },
    { id: 14, name: 'Checkout Page', detail: 'Billing details and payment mode dropdown' },
    { id: 15, name: 'Order Success', detail: 'THANK YOU screen' },
    { id: 16, name: 'Status Selection', detail: 'Vendor status update popup' },
    { id: 17, name: 'Product Status', detail: 'Vendor order tracking table' },
    { id: 18, name: 'Add Request Item', detail: 'User custom quote request' },
    { id: 19, name: 'User Request List', detail: 'View history of custom requests' },
    { id: 20, name: 'Admin Home', detail: 'Reports and Maintenance Hub' },
    { id: 21, name: 'Maintain User', detail: 'Membership management for users/vendors' },
    { id: 22, name: 'Maintain Vendor', detail: 'Business and membership management' }
  ];

  return (
    <PageShell title="Project Flow Chart" subtitle="22-Screen Specification Alignment Chart">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6 border-l-4 border-primary">
          <h2 className="text-xl font-bold mb-4 uppercase">System Logic Flow</h2>
          <div className="space-y-4">
            <div className="flex gap-4 items-center">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">1</div>
              <div className="flex-1 p-3 bg-slate-50 rounded font-medium">Public Browsing → Login Requirement</div>
            </div>
            <div className="flex gap-4 items-center">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">2</div>
              <div className="flex-1 p-3 bg-slate-50 rounded font-medium text-emerald-700">Admin Path → Maintenance & Reports</div>
            </div>
            <div className="flex gap-4 items-center">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">3</div>
              <div className="flex-1 p-3 bg-slate-50 rounded font-medium text-blue-700">Vendor Path → Resource & Order Management</div>
            </div>
            <div className="flex gap-4 items-center">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">4</div>
              <div className="flex-1 p-3 bg-slate-50 rounded font-medium text-purple-700">User Path → Shop, Request & Track</div>
            </div>
          </div>
        </div>

        <div className="card p-6 overflow-hidden">
          <h2 className="text-xl font-bold mb-4 uppercase">Screen Map</h2>
          <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
            {screens.map(s => (
              <div key={s.id} className="flex justify-between items-center p-2 border-b text-sm">
                <span className="font-bold text-primary w-8">#{s.id}</span>
                <span className="flex-1 font-medium">{s.name}</span>
                <span className="text-[10px] text-slate-400 italic">{s.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
        <p className="font-bold mb-2 uppercase">Developer Note:</p>
        <p>This page acts as the "Navigation Aid" required by the specification. In a production environment, this link and page would be removed as per the instruction sheet.</p>
      </div>
    </PageShell>
  );
}
