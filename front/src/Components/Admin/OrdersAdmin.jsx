import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './OrdersAdmin.css';

export default function OrdersAdmin() {
  const { user } = useAuth();
  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter]   = useState('30d');

  // FIX: Admin guard FIRST — before any data fetch
  if (!user || user.role !== 'admin') {
    return (
      <main className="orders-admin-page">
        <div className="admin-container">
          <h1 className="orders-title">Admin Orders</h1>
          <p className="admin-denied">❌ You must be an admin to view this page.</p>
        </div>
      </main>
    );
  }

  // FIX: complete dateFilter logic — old code only handled '30d', rest showed ALL orders
  const filteredOrders = orders.filter(order => {
    if (statusFilter !== 'all' && order.status !== statusFilter) return false;

    const daysMap = { '7d': 7, '30d': 30, '90d': 90, '365d': 365 };
    const days = daysMap[dateFilter];
    if (days) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      if (new Date(order.createdAt) < cutoff) return false;
    }
    // 'all' → no date filter
    return true;
  });

  const handleClearOrders = async () => {
    if (!window.confirm('Delete ALL orders permanently? This cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/clear`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setOrders([]);
      else console.error('Failed to clear orders');
    } catch (err) {
      console.error('Clear orders error:', err);
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/admin`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <main className="orders-admin-page">
        <div className="admin-container">
          <h1 className="orders-title">Admin Orders</h1>
          <div className="loading-spinner-large"></div>
          <p>Loading orders…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="orders-admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <h1 className="orders-title">Recent Orders ({filteredOrders.length})</h1>
          <div className="admin-actions">
            <button className="admin-btn admin-btn-danger" onClick={handleClearOrders}>
              🗑 Clear All Orders
            </button>
            <div className="dropdown-pill">
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div className="dropdown-pill">
              <select value={dateFilter} onChange={e => setDateFilter(e.target.value)}>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="365d">Last Year</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h2>No orders found</h2>
            <p>Try changing the filters above.</p>
          </div>
        ) : (
          <div className="orders-table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Address</th>
                  <th>Contact</th>
                  <th>Items</th>
                  <th>Subtotal</th>
                  <th>Shipping</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order._id}>
                    <td className="order-id">{order._id.slice(-8)}</td>
                    <td>
                      <div>{order.shippingInfo?.firstName} {order.shippingInfo?.lastName}</div>
                      <div className="orders-email">{order.shippingInfo?.email}</div>
                    </td>
                    <td className="address-cell">
                      <div>{order.shippingInfo?.address}</div>
                      <div>{order.shippingInfo?.city}, {order.shippingInfo?.state}</div>
                      <div>Pin: {order.shippingInfo?.zipCode}</div>
                    </td>
                    <td>{order.shippingInfo?.phone}</td>
                    <td>
                      <ul className="orders-items">
                        {order.items.map((item, idx) => (
                          <li key={idx}>
                            <strong>{item.name || 'Product'}</strong><br />
                            {item.mlSize}ml × {item.quantity}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td>₹{order.subtotal?.toLocaleString()}</td>
                    <td>₹{order.shippingAmount || 60}</td>
                    <td className="total-col"><strong>₹{order.totalAmount?.toLocaleString()}</strong></td>
                    <td>{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <span className={`status-badge status-${order.status}`}>{order.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
