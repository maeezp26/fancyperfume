import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
<<<<<<< HEAD
import { useNavigate } from "react-router-dom";
import "./css/MyOrders.css";

export default function MyOrders() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
=======
import "./css/MyOrders.css";

export default function MyOrders() {
  const { token } = useAuth();
>>>>>>> 9a6e6a0cd91a21814504d1c7ca7d99642391e9b9
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");



useEffect(() => {
<<<<<<< HEAD
  if (!token) {
    setLoading(false);
    return;
  }
=======
  if (!token) return;
>>>>>>> 9a6e6a0cd91a21814504d1c7ca7d99642391e9b9

  const fetchOrders = async () => {
    try {
      const res = await axios.get(
<<<<<<< HEAD
        "import.meta.env.VITE_API_URL/api/orders",
=======
        "import.meta.env.VITE_API_URL/api/orders",
>>>>>>> 9a6e6a0cd91a21814504d1c7ca7d99642391e9b9
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setOrders(res.data);
    } catch (err) {
      console.error(
        "Failed to fetch orders",
        err.response?.data || err.message
      );
<<<<<<< HEAD
      setError(err.response?.data?.message || "Failed to load orders");
=======
>>>>>>> 9a6e6a0cd91a21814504d1c7ca7d99642391e9b9
    } finally {
      setLoading(false);
    }
  };

  fetchOrders();
}, [token]);



<<<<<<< HEAD
  if (!user) {
    return (
      <main className="luxury-checkout">
        <section className="checkout-hero">
          <div className="hero-content">
            <h1 className="hero-title">My Orders</h1>
          </div>
        </section>
        <div className="empty-state">
          <div className="empty-icon">🔒</div>
          <h2>Login Required</h2>
          <p>You need to be logged in to view your orders.</p>
          <div className="action-buttons">
            <button type="button" onClick={() => navigate("/login")} className="luxury-btn primary">
              Login
            </button>
            <button type="button" onClick={() => navigate("/register")} className="luxury-btn secondary">
              Create Account
            </button>
          </div>
        </div>
      </main>
    );
  }

=======
>>>>>>> 9a6e6a0cd91a21814504d1c7ca7d99642391e9b9
  if (loading) {
    return <div className="orders-loading">Loading your orders...</div>;
  }

  return (
    <div className="my-orders-page">
      <div className="orders-header">
        <h1 className="orders-title">My Orders</h1>
        <p className="orders-subtitle">
          Track and review your perfume purchases
        </p>
      </div>

<<<<<<< HEAD
      {error && <div className="no-orders">{error}</div>}

=======
>>>>>>> 9a6e6a0cd91a21814504d1c7ca7d99642391e9b9
      {orders.length === 0 ? (
        <div className="no-orders">
          You haven’t placed any orders yet.
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div className="order-card" key={order._id}>
              <div className="order-top">
                <div>
                  <span className="order-id">
                    Order #{order._id.slice(-6)}
                  </span>
                  <span className="order-date">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <span className={`order-status ${order.status}`}>
                  {order.status}
                </span>
              </div>

              <div className="order-items">
                {order.items.map((item, idx) => (
                  <div className="order-item" key={idx}>
                     {item.product?.image && (
        <img
<<<<<<< HEAD
          src={`import.meta.env.VITE_API_URL/uploads/${item.product.image}`}
=======
          src={`import.meta.env.VITE_API_URL/uploads/${item.product.image}`}
>>>>>>> 9a6e6a0cd91a21814504d1c7ca7d99642391e9b9
          alt={item.product.name}
          className="order-item-img"
        />
      )}
                    <div>
                     <p className="item-name">
                        {item.product?.name || "Perfume"}
                        </p>

                      <p className="item-meta">
                        {item.mlSize}ml × {item.quantity}
                      </p>
                    </div>
                    <span className="item-price">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="order-summary">
                <div>
                  <span>Subtotal</span>
                  <span>₹{order.subtotal}</span>
                </div>
                <div>
                  <span>Shipping</span>
                  <span>₹{order.shippingAmount}</span>
                </div>
                <div className="order-total">
                  <span>Total</span>
                  <span>₹{order.totalAmount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
