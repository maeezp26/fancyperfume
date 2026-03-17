import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import "./css/MyOrders.css";

export default function MyOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");



useEffect(() => {
  if (!token) return;

  const fetchOrders = async () => {
    try {
      const res = await axios.get(
        "import.meta.env.VITE_API_URL/api/orders",
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
    } finally {
      setLoading(false);
    }
  };

  fetchOrders();
}, [token]);



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
          src={`import.meta.env.VITE_API_URL/uploads/${item.product.image}`}
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
