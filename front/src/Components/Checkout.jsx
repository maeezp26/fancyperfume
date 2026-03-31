import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import './css/HeaderFooter.css';
import './css/Checkout.css';
import { toast } from 'react-toastify';
import { getIndiaCitiesOfState, getIndiaStates } from '../utils/indiaLocations';
import SearchableSelect from './common/SearchableSelect';
import {
  isValidEmail,
  isValidPhone,
  validateRequiredAlphaText,
  validateRequiredDigits,
  validateRequiredText,
} from '../utils/validation';

// ---- STATE ↔ PINCODE RULES ----
const STATE_PIN_RANGES = {
  // 28 STATES + 8 UTs of India (PINCODE FIRST DIGIT → STATE MAPPING)
  
  // NORTH (1xxx, 2xxx)
  'delhi': /^110\d{3}$/,                    
  'haryana': /^12[0-9]\d{3}$/,              
  'punjab': /^14[0-4]\d{3}$/,               
  'chandigarh': /^160\d{3}$/,               
  'uttar pradesh': /^20|22[0-9]\d{3}$/,     
  'uttarakhand': /^24[6-9]\d{3}$/,          
  'himachal pradesh': /^17[0-7]\d{3}$/,     
  'jammu-kashmir': /^18[0-9]\d{3}|19[0-1]\d{3}$/, 
  
  // WEST (3xxx, 4xxx)
  'rajasthan': /^3[0-4]\d{3}$/,             
  'gujarat': /^3[6-9]\d{3}|40\d{3}$/,       
  'maharashtra': /^4[1-4]\d{3}$/,           
  'dadra-nagar-haveli': /^396\d{3}$/,       
  'daman-diu': /^396\d{3}$/,                
  
  // SOUTH (5xxx, 6xxx)
  'andhra pradesh': /^5[0-3]\d{3}$/,        
  'karnataka': /^5[6-8]\d{3}$/,             
  'kerala': /^68[8-9]\d{3}|695\d{3}$/,      
  'tamil nadu': /^6[0-4]\d{3}$/,            
  'telangana': /^5[0-9]\d{3}|50[0-9]\d{3}$/, 
  'puducherry': /^605\d{3}$/,               
  
  // EAST (7xxx, 8xxx)
  'west bengal': /^7[0-1]\d{3}$/,           
  'odisha': /^75[4-9]\d{3}|76[0-6]\d{3}$/,  
  'jharkhand': /^82[7-9]\d{3}|83[0-1]\d{3}$/, 
  'bihar': /^8[0-2]\d{3}$/,                 
  
  // NORTH EAST (78xxx, 79xxx)
  'assam': /^78[1-3]\d{3}|78[6-9]\d{3}$/,   
  'arunachal pradesh': /^792\d{3}$/,        
  'nagaland': /^797\d{3}$/,                 
  'manipur': /^795\d{3}$/,                  
  'mizoram': /^796\d{3}$/,                  
  'tripura': /^799\d{3}$/,                  
  'meghalaya': /^793\d{3}$/,                
  'sikkim': /^737\d{3}$/,                   
  
  // CENTRAL (48xxx)
  'madhya pradesh': /^45[8-9]\d{3}|46[0-9]\d{3}$/, 
  'chhattisgarh': /^49[0-3]\d{3}$/,         
  'goa': /^403\d{3}$/,                      
  'lakshadweep': /^682\d{3}$/               
};

const normalizeStateKey = (state = '') =>
  state.trim().toLowerCase().replace(/\s+/g, ' ');

const validatePincodeState = (state, pincode) => {
  if (!state) return 'Please enter state';
  if (!pincode || !/^\d{6}$/.test(pincode)) {
    return 'Enter a valid 6-digit PIN code';
  }

  const key = normalizeStateKey(state);
  const pinRegex = STATE_PIN_RANGES[key];

  if (pinRegex && !pinRegex.test(pincode)) {
    return `PIN code ${pincode} does not belong to ${state}`;
  }

  return '';
};

const getShippingCharge = (state) => {
  const stateLower = state?.trim().toLowerCase();
  return stateLower === 'gujarat' ? 50 : 80;
};

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: user?.city || '',
    state: '',
    zipCode: '',
  });

  const [states, setStates] = useState([]);
  const [selectedStateIso, setSelectedStateIso] = useState('');
  const [stateCities, setStateCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');

  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [pinError, setPinError] = useState('');
  
  const shippingCharge = getShippingCharge(formData.state);
  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const computedTotal = subtotal + shippingCharge;

  useEffect(() => {
    setStates(getIndiaStates());
  }, []);

  useEffect(() => {
    if (!selectedStateIso) {
      setStateCities([]);
      return;
    }
    setStateCities(getIndiaCitiesOfState(selectedStateIso));
  }, [selectedStateIso]);

  const stateOptions = useMemo(
    () =>
      (states ?? []).map((s) => ({
        label: s.name,
        value: s.isoCode,
      })),
    [states]
  );

  const cityOptions = useMemo(
    () =>
      (stateCities ?? []).map((c) => ({
        label: c.name,
        value: c.name,
      })),
    [stateCities]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);

    if (name === 'zipCode') {
      const err = validatePincodeState(updated.state, updated.zipCode);
      setPinError(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Required field validations (before payment setup)
    const firstErr = validateRequiredAlphaText('First name', formData.firstName, { min: 2 });
    if (firstErr) return toast.error(firstErr);
    const lastErr = validateRequiredAlphaText('Last name', formData.lastName, { min: 1 });
    if (lastErr) return toast.error(lastErr);
    if (!isValidEmail(formData.email)) return toast.error('Please enter a valid email address');
    if (!isValidPhone(formData.phone)) return toast.error('Please enter a valid 10-digit phone number');
    const addrErr = validateRequiredText('Address', formData.address, { min: 5 });
    if (addrErr) return toast.error(addrErr);
    if (!selectedStateIso) return toast.error('State is required');
    const stateErr = validateRequiredAlphaText('State', formData.state, { min: 2 });
    if (stateErr) return toast.error(stateErr);

    const cityErr = validateRequiredAlphaText('City', selectedCity, { min: 2 });
    if (cityErr) return toast.error(cityErr);
    if (stateCities.length > 0) {
      const cityLower = selectedCity.trim().toLowerCase();
      const match = stateCities.some((c) => c?.name?.toLowerCase() === cityLower);
      if (!match) return toast.error('Please select a valid city for the selected state');
    }

    const zipDigitsErr = validateRequiredDigits('ZIP code', formData.zipCode, { length: 6 });
    if (zipDigitsErr) return toast.error(zipDigitsErr);

    const err = validatePincodeState(formData.state, formData.zipCode);
    if (err) {
      setPinError(err);
      toast.error(err);
      return;
    }

    setLoading(true);

    try {
      const ok = await loadRazorpay();
      if (!ok) throw new Error('Razorpay load failed');

      const token = localStorage.getItem('token');
      if (!token) throw new Error('Please login again');

      const orderRes = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: computedTotal,
          orderData: {
            items: cart.items.map((item) => ({
              productId: item.product._id,
              name: item.product.name,
              mlSize: item.mlSize,
              quantity: item.quantity,
              price: item.price,
            })),
            shippingInfo: formData,
          },
        }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error(orderData.message || 'Order failed');

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Fancy Perfume',
        description: 'Premium Fragrances',
        order_id: orderData.orderId,
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: '#D4AF37' },
        handler: async function (response) {
          try {
            const verifyRes = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                ...response,
                orderData: {
                  items: cart.items.map((item) => ({
                    productId: item.product._id,
                    name: item.product.name,
                    mlSize: item.mlSize,
                    quantity: item.quantity,
                    price: item.price,
                  })),
                  shippingInfo: { ...formData, shippingCharge },
                },
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setOrderPlaced(true);
              clearCart();
              toast.success('Payment successful. Order confirmed!');
            } else {
              throw new Error(verifyData.message || 'Verify failed');
            }
          } catch (err) {
            toast.error('Payment failed: ' + err.message);
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error('Payment setup failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Guards
  if (!user) {
    return (
      <main className="luxury-checkout">
        <section className="checkout-hero">
          <div className="hero-content">
            <h1 className="hero-title">Checkout</h1>
          </div>
        </section>
        <div className="empty-state">
          <div className="empty-icon">🔒</div>
          <h2>Login Required</h2>
          <p>You need to be logged in to complete your purchase.</p>
          <div className="action-buttons">
            <button type="button" onClick={() => navigate('/login')} className="luxury-btn primary">
              Login
            </button>
            <button type="button" onClick={() => navigate('/register')} className="luxury-btn secondary">
              Create Account
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (cart.items.length === 0) {
    return (
      <main className="luxury-checkout">
        <section className="checkout-hero">
          <div className="hero-content">
            <h1 className="hero-title">Checkout</h1>
          </div>
        </section>
        <div className="empty-state">
          <div className="empty-icon">🛍️</div>
          <h2>Cart is Empty</h2>
          <p>Add some fragrances to complete your purchase.</p>
          <button type="button" onClick={() => navigate('/category')} className="luxury-btn primary large">
            Continue Shopping
          </button>
        </div>
      </main>
    );
  }

  if (orderPlaced) {
    return (
      <main className="luxury-checkout">
        <section className="success-hero">
          <div className="hero-content">
            <div className="success-icon">✅</div>
            <h1 className="hero-title">Order Confirmed!</h1>
          </div>
        </section>
        <div className="success-state">
          <h2>Thank You for Your Purchase</h2>
          <p className="success-message">
            Your order has been confirmed and will be processed within 24 hours.
          </p>
          <div className="order-details">
            <div className="detail-row">
              <span>Total Amount:</span>
              <strong>₹{computedTotal.toLocaleString()}</strong>
            </div>
            <div className="detail-row">
              <span>Shipping:</span>
              <strong>₹{shippingCharge}</strong>
            </div>
          </div>
          <div className="success-actions">
            <button type="button" onClick={() => navigate('/')} className="luxury-btn primary">
              Continue Shopping
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Main UI
  return (
    <main className="luxury-checkout">
      <section className="checkout-hero">
        <div className="hero-content">
          <h1 className="hero-title">Checkout</h1>
        </div>
      </section>

      <div className="checkout-container">
        <div className="checkout-layout">
          {/* Left: Shipping Form */}
          <div className="checkout-form-section">
            <form onSubmit={handleSubmit} className="luxury-checkout-form">
              <h3 className="step-title">Shipping Information</h3>

              <div className="form-grid">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group full">
                <label>Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="House number, street, area"
                  required
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>State *</label>
                  <SearchableSelect
                    name="state"
                    value={selectedStateIso}
                    onChange={(iso) => {
                      const st = states.find((s) => s.isoCode === iso);
                      setSelectedStateIso(iso);
                      setSelectedCity('');
                      setPinError('');
                      setFormData((prev) => ({
                        ...prev,
                        state: st?.name ?? '',
                        city: '',
                        zipCode: '',
                      }));
                    }}
                    options={stateOptions}
                    placeholder="Select State"
                    searchPlaceholder="Type state name..."
                    required
                  />
                </div>
                <div className="form-group">
                  <label>City *</label>
                  <SearchableSelect
                    name="city"
                    value={selectedCity}
                    onChange={(city) => {
                      setSelectedCity(city);
                      setFormData((prev) => ({ ...prev, city }));
                    }}
                    options={cityOptions}
                    placeholder={selectedStateIso ? 'Select City' : 'Select State first'}
                    searchPlaceholder="Type city name..."
                    disabled={!selectedStateIso}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>ZIP Code *</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    maxLength="6"
                    pattern="\d{6}"
                    required
                  />
                  {pinError && (
                    <p className="error-text" style={{ color: '#ff6b6b' }}>
                      {pinError}
                    </p>
                  )}
                </div>
              </div>

              <div className="step-actions">
                <button
                  type="submit"
                  className="luxury-btn primary large"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Pay ₹{computedTotal.toLocaleString()}
                    </>
                  ) : (
                    `Pay ₹${computedTotal.toLocaleString()}`
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right: Order Summary */}
          <div className="order-summary-panel">
            <h3 className="summary-title">Order Summary</h3>

            <div className="summary-items">
              {cart.items.map((item) => (
                <div key={item._id} className="summary-item">
                  <div className="item-preview">
                    <img
                      src={
                        item.product.imageUrl.startsWith('http')
                          ? item.product.imageUrl
                          : `/uploads${item.product.imageUrl}` // ✅ Proxy path
                      }
                      alt={item.product.name}
                    />
                    <div>
                      <h4>{item.product.name}</h4>
                      <p>{item.mlSize}ml × {item.quantity}</p>
                    </div>
                  </div>
                  <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="summary-totals">
              <div className="total-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="total-row">
                <span>
                  Shipping {formData.state ? `( ${formData.state.trim()} )` : '(Outside Gujarat)'}
                </span>
                <span>₹{shippingCharge}</span>
              </div>
              <hr />
              <div className="total-row final">
                <span>Total</span>
                <strong>₹{computedTotal.toLocaleString()}</strong>
              </div>
            </div>

            <div className="security-badges">
              <div className="badge">🔒 Razorpay Secure</div>
              <div className="badge">🛡️ SSL Encrypted</div>
              <div className="badge">⚡ Instant Confirmation</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
