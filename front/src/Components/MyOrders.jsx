import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "./css/MyOrders.css";
import { apiUrl, assetUrl } from "../utils/api";

const PLACEHOLDER = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect fill='%231a1a2e' width='120' height='120'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23d4af37' font-size='40'%3E%F0%9F%8C%BF%3C/text%3E%3C/svg%3E`;

const imgSrc = (url) => {
  if (!url) return PLACEHOLDER;
  return assetUrl(url);
};

const statusConfig = {
  paid:    { label: 'Paid',    color: '#2ecc71', bg: 'rgba(46,204,113,0.12)',  icon: '✅' },
  pending: { label: 'Pending', color: '#f1c40f', bg: 'rgba(241,196,15,0.12)', icon: '⏳' },
  failed:  { label: 'Failed',  color: '#e74c3c', bg: 'rgba(231,76,60,0.12)',  icon: '❌' },
};

export default function MyOrders() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    if (!token) { setLoading(false); return; }

    const fetchOrders = async () => {
      try {
        // FIX: was literal string "import.meta.env.VITE_API_URL/api/orders" — never worked
        const res = await axios.get(apiUrl("/api/orders"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data);
        // Auto-expand the most recent order
        if (res.data.length > 0) {
          setExpanded({ [res.data[0]._id]: true });
        }
      } catch (err) {
        console.error("Failed to fetch orders", err.response?.data || err.message);
        setError(err.response?.data?.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  const toggleExpand = (id) =>
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  // ── Not logged in ────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <main className="myorders-page">
        <div className="myorders-lock">
          <div className="lock-icon">🔒</div>
          <h2>Login Required</h2>
          <p>You need to be logged in to view your orders.</p>
          <div className="lock-actions">
            <button onClick={() => navigate("/login")} className="mo-btn primary">Login</button>
            <button onClick={() => navigate("/register")} className="mo-btn secondary">Create Account</button>
          </div>
        </div>
      </main>
    );
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="myorders-page">
        <div className="myorders-loading">
          <div className="mo-spinner"></div>
          <p>Loading your orders…</p>
        </div>
      </main>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────────────
  return (
    <main className="myorders-page">
      {/* Header */}
      <div className="myorders-header">
        <h1 className="myorders-title">My Orders</h1>
        <p className="myorders-subtitle">
          {orders.length === 0
            ? "No orders yet"
            : `${orders.length} order${orders.length > 1 ? 's' : ''} placed`}
        </p>
      </div>

      {error && <div className="mo-error">{error}</div>}

      {orders.length === 0 ? (
        <div className="mo-empty">
          <div className="mo-empty-icon">🛍️</div>
          <h2>No orders yet</h2>
          <p>Your fragrance journey starts here.</p>
          <button className="mo-btn primary" onClick={() => navigate("/category")}>
            Shop Now
          </button>
        </div>
      ) : (
        <div className="mo-orders-list">
          {orders.map(order => {
            const st = statusConfig[order.status] || statusConfig.pending;
            const isOpen = !!expanded[order._id];

            return (
              <div className="mo-card" key={order._id}>
                {/* Card Header — always visible */}
                <div className="mo-card-header" onClick={() => toggleExpand(order._id)}>
                  <div className="mo-card-left">
                    <div className="mo-order-meta">
                      <span className="mo-order-id">Order #{order._id.slice(-8).toUpperCase()}</span>
                      <span className="mo-order-date">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </span>
                    </div>

                    {/* Product image strip — thumbnail row */}
                    <div className="mo-thumb-strip">
                      {order.items.slice(0, 4).map((item, idx) => (
                        <div className="mo-thumb-wrap" key={idx}>
                          <img
                            src={imgSrc(item.product?.imageUrl)}
                            alt={item.name || item.product?.name || 'Product'}
                            className="mo-thumb"
                            onError={e => { e.target.onerror = null; e.target.src = PLACEHOLDER; }}
                          />
                        </div>
                      ))}
                      {order.items.length > 4 && (
                        <div className="mo-thumb-more">+{order.items.length - 4}</div>
                      )}
                    </div>
                  </div>

                  <div className="mo-card-right">
                    <span
                      className="mo-status-badge"
                      style={{ color: st.color, background: st.bg }}
                    >
                      {st.icon} {st.label}
                    </span>
                    <div className="mo-total-display">₹{order.totalAmount?.toLocaleString('en-IN')}</div>
                    <div className={`mo-chevron ${isOpen ? 'open' : ''}`}>▾</div>
                  </div>
                </div>

                {/* Expanded Detail Panel */}
                {isOpen && (
                  <div className="mo-card-body">
                    {/* Items */}
                    <div className="mo-items-section">
                      <h4 className="mo-section-label">Items Ordered</h4>
                      <div className="mo-items-list">
                        {order.items.map((item, idx) => (
                          <div className="mo-item-row" key={idx}>
                            <div className="mo-item-img-wrap">
                              <img
                                src={imgSrc(item.product?.imageUrl)}
                                alt={item.name || item.product?.name || 'Product'}
                                className="mo-item-img"
                                onError={e => { e.target.onerror = null; e.target.src = PLACEHOLDER; }}
                              />
                            </div>
                            <div className="mo-item-details">
                              <p className="mo-item-name">
                                {item.name || item.product?.name || 'Perfume'}
                              </p>
                              <p className="mo-item-meta">{item.mlSize}ml × {item.quantity}</p>
                            </div>
                            <div className="mo-item-price">
                              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping + Totals — two column */}
                    <div className="mo-bottom-grid">
                      <div className="mo-shipping-section">
                        <h4 className="mo-section-label">Shipping To</h4>
                        <div className="mo-address">
                          <p className="mo-address-name">
                            {order.shippingInfo?.firstName} {order.shippingInfo?.lastName}
                          </p>
                          <p>{order.shippingInfo?.address}</p>
                          <p>{order.shippingInfo?.city}, {order.shippingInfo?.state}</p>
                          <p>PIN: {order.shippingInfo?.zipCode}</p>
                          <p className="mo-phone">📞 {order.shippingInfo?.phone}</p>
                        </div>
                      </div>

                      <div className="mo-totals-section">
                        <h4 className="mo-section-label">Price Breakdown</h4>
                        <div className="mo-price-rows">
                          <div className="mo-price-row">
                            <span>Subtotal</span>
                            <span>₹{order.subtotal?.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="mo-price-row">
                            <span>Shipping ({order.shippingInfo?.state})</span>
                            <span>₹{order.shippingAmount}</span>
                          </div>
                          <div className="mo-price-row mo-grand-total">
                            <span>Total Paid</span>
                            <span>₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
