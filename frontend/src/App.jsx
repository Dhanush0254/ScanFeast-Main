import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout'; // The new responsive fixer
import ProtectedRoute from './components/ProtectedRoute'; // Your auth guard

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import TableSelection from './pages/TableSelection';
import NotFound404 from './pages/NotFound404';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import FakePayment from './pages/FakePayment';
import Kitchen from './pages/Kitchen';
import AdminDashboard from './pages/AdminDashboard';
import FAQ from './pages/FAQ';
import AdminItems from './pages/AdminItems';
import AdminFAQ from './pages/AdminFAQ';
import Server from './pages/Server';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Layout>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/table-selection" element={<TableSelection />} />

          {/* Customer Routes */}
          <Route path="/home" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/payment" element={<FakePayment />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/faq" element={<FAQ />} />

          {/* Protected Routes */}
          <Route path="/kitchen" element={<ProtectedRoute role="KITCHEN"><Kitchen /></ProtectedRoute>} />
          <Route path="/server" element={<ProtectedRoute role="SERVER"><Server /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/items" element={<ProtectedRoute role="ADMIN"><AdminItems /></ProtectedRoute>} />
          <Route path="/admin/faq" element={<ProtectedRoute role="ADMIN"><AdminFAQ /></ProtectedRoute>} />

          {/* Catch-all 404 route - MUST BE LAST */}
          <Route path="*" element={<NotFound404 />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
export default App;