import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';  // ✅ FIXED
import './OrdersAdmin.css';


export default function OrdersAdmin() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
const [dateFilter, setDateFilter] = useState('30d');

// Filtered orders
const filteredOrders = orders.filter(order => {
  if (statusFilter !== 'all' && order.status !== statusFilter) return false;
  
  // Show only last 30 days by default
  if (dateFilter === '30d') {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    if (new Date(order.createdAt) < thirtyDaysAgo) return false;
  }
  
  return true;
});

const handleClearOrders = async () => {
  if (!window.confirm("Delete ALL orders?")) return;

  const token = localStorage.getItem('token');

  await fetch(`${import.meta.env.VITE_API_URL}/api/orders/clear`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  setOrders([]); // clear UI
};

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
       // In your OrdersAdmin useEffect:
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/admin`, {
          headers: {
            'Authorization': `Bearer ${token}`  // ✅ Remove Content-Type for GET
          }
        });
        const data = await res.json();
        setOrders(data);  // ✅ Expects array directly

      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

 // Line 25:
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


  if (loading) {
    return (
      <main className="orders-admin-page">
        <div className="admin-container">
          <h1 className="orders-title">Admin Orders</h1>
          <div className="loading-spinner-large"></div>
          <p>Loading orders...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="orders-admin-page">
      <div className="admin-container">
       <div className="admin-header">
  <h1 className="orders-title">Recent Orders ({filteredOrders.length})</h1>
  
<div className="dropdown-pill">
  <select
    value={dateFilter}
    onChange={(e) => setDateFilter(e.target.value)}
  >
    <option value="30d">Last 30 Days</option>
    <option value="90d">Last 90 Days</option>
    <option value="365d">Last Year</option>
  </select>
</div>

<button onClick={handleClearOrders}>Clear All Orders</button>

</div>



        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h2>No orders found</h2>
            <p>No orders have been placed yet.</p>
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
                 {filteredOrders.map((order) => (
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
          <strong>{item.name}</strong><br/>
          {item.mlSize}ml × {item.quantity}
        </li>
      ))}
    </ul>
  </td>
  <td>₹{order.subtotal?.toLocaleString()}</td>
  <td>₹{order.shippingAmount || order.shippingInfo?.shippingCharge || 60}</td>
  <td className="total-col">
    <strong>₹{order.totalAmount?.toLocaleString()}</strong>
  </td>
  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
  <td>
    <span className={`status-badge status-${order.status}`}>
      {order.status}
    </span>
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
