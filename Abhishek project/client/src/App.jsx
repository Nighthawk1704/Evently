import { Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Unauthorized from './pages/Unauthorized';

import Browse from './pages/user/Browse';
import ProductDetail from './pages/user/ProductDetail';
import Cart from './pages/user/Cart';
import Checkout from './pages/user/Checkout';
import OrderSuccess from './pages/user/OrderSuccess';
import MyOrders from './pages/user/MyOrders';
import OrderDetail from './pages/user/OrderDetail';
import RequestItem from './pages/user/RequestItem';

import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorProducts from './pages/vendor/VendorProducts';
import VendorProductForm from './pages/vendor/VendorProductForm';
import VendorOrders from './pages/vendor/VendorOrders';
import VendorRequests from './pages/vendor/VendorRequests';

import AdminOverview from './pages/admin/AdminOverview';
import AdminUsersList from './pages/admin/AdminUsersList';
import AdminOrders from './pages/admin/AdminOrders';
import MaintainUsers from './pages/admin/MaintainUsers';
import MaintainVendors from './pages/admin/MaintainVendors';
import GuestList from './pages/user/GuestList';
import VendorProfile from './pages/user/VendorProfile';

export default function App() {
  return (
    <div className="min-h-full">
      <Navbar />
      <Routes>
        {/* Public browse */}
        <Route path="/" element={<Browse />} />
        <Route path="/products/:id" element={<ProductDetail />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* User */}
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<ProtectedRoute role="user"><Checkout /></ProtectedRoute>} />
        <Route path="/orders/success/:id" element={<ProtectedRoute role="user"><OrderSuccess /></ProtectedRoute>} />
        <Route path="/vendor/:id" element={<VendorProfile />} />
        <Route path="/guest-list" element={<ProtectedRoute role="user"><GuestList /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute role="user"><MyOrders /></ProtectedRoute>} />
        <Route path="/orders/:id" element={<ProtectedRoute role={['user', 'vendor', 'admin']}><OrderDetail /></ProtectedRoute>} />
        <Route path="/request-item" element={<ProtectedRoute role="user"><RequestItem /></ProtectedRoute>} />

        {/* Vendor */}
        <Route path="/vendor" element={<ProtectedRoute role="vendor"><VendorDashboard /></ProtectedRoute>} />
        <Route path="/vendor/products" element={<ProtectedRoute role="vendor"><VendorProducts /></ProtectedRoute>} />
        <Route path="/vendor/products/new" element={<ProtectedRoute role="vendor"><VendorProductForm /></ProtectedRoute>} />
        <Route path="/vendor/products/:id/edit" element={<ProtectedRoute role="vendor"><VendorProductForm /></ProtectedRoute>} />
        <Route path="/vendor/orders" element={<ProtectedRoute role="vendor"><VendorOrders /></ProtectedRoute>} />
        <Route path="/vendor/requests" element={<ProtectedRoute role="vendor"><VendorRequests /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminOverview /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute role="admin"><AdminUsersList role="user" title="Users" subtitle="All customer accounts." /></ProtectedRoute>} />
        <Route path="/admin/vendors" element={<ProtectedRoute role="admin"><AdminUsersList role="vendor" title="Vendors" subtitle="All vendor accounts." /></ProtectedRoute>} />
        <Route path="/admin/maintain-users" element={<ProtectedRoute role="admin"><MaintainUsers /></ProtectedRoute>} />
        <Route path="/admin/maintain-vendors" element={<ProtectedRoute role="admin"><MaintainVendors /></ProtectedRoute>} />
        <Route path="/admin/orders" element={<ProtectedRoute role="admin"><AdminOrders /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
