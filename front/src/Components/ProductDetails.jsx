import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import AddToCartButton from "./AddToCartButton";
import { useCart } from '../contexts/CartContext';
import "./css/ProductDetails.css";
import axios from "axios";

const PLACEHOLDER = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect fill='%231a1a2e' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23d4af37' font-size='72'%3E🌿%3C/text%3E%3C/svg%3E`;

const imgSrc = (url) => {
  if (!url) return PLACEHOLDER;
  if (url.startsWith('http')) return url;
  return `${import.meta.env.VITE_API_URL}${url}`;
};

const ProductDetails = () => {
  const { state: locationProduct } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct]               = useState(locationProduct || null);
  const [fetchLoading, setFetchLoading]     = useState(!locationProduct);
  const [quantity, setQuantity]             = useState(1);
  const [mlSize, setMlSize]                 = useState(3);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { addToCart } = useCart();

  // FIX: If product not in state (direct URL access), fetch it from API
  useEffect(() => {
    if (!locationProduct && id) {
      setFetchLoading(true);
      axios.get(`${import.meta.env.VITE_API_URL}/api/products/${id}`)
        .then(res => setProduct(res.data))
        .catch(() => setProduct(null))
        .finally(() => setFetchLoading(false));
    }
  }, [id, locationProduct]);

  if (fetchLoading) {
    return (
      <div className="product-details-page">
        <div className="empty-state">
          <div className="empty-icon">⏳</div>
          <h2>Loading product…</h2>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-details-page">
        <div className="empty-state">
          <div className="empty-icon">🎁</div>
          <h2>Product not found</h2>
          <p>Please go back to the catalog to explore our collection.</p>
          <button className="back-btn" onClick={() => navigate('/category')}>← Back to Catalog</button>
        </div>
      </div>
    );
  }

  const handleQuantityChange = (change) =>
    setQuantity(prev => Math.max(1, prev + change));

  const handleMlChange = (size) => setMlSize(size);

  const adjustedPrice = (product.price * quantity * mlSize) / 3;

  const handleBuyNow = async () => {
    try {
      await addToCart(product._id, quantity, mlSize);
      navigate('/checkout');
    } catch (error) {
      console.error('Error with Buy Now:', error);
    }
  };

  const galleryImages = [product.imageUrl, ...(product.additionalImages || [])];

  const renderNotes = (noteType, label) => (
    <div className="note-group" key={noteType}>
      <div className="note-header">
        <h3>{label}</h3>
        <div className={`note-icon ${noteType}`}></div>
      </div>
      <div className="notes-images">
        {product.notes?.[noteType]?.map((note, index) => (
          <div className="note-item" key={index}>
            <div className="note-image-wrapper">
              <img
                src={imgSrc(note.imageUrl)}
                alt={note.name}
                className="note-image"
                onError={e => { e.target.onerror = null; e.target.src = PLACEHOLDER; }}
              />
            </div>
            <p className="note-name">{note.name}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="product-details-page">
      <div className="product-breadcrumb">
        <button onClick={() => navigate('/category')} className="breadcrumb-link">Catalog</button>
        {' / '}
        <span>{product.name}</span>
      </div>

      <div className="product-main-container">
        {/* Gallery */}
        <div className="product-gallery">
          <div className="main-image-container">
            <img
              src={imgSrc(galleryImages[currentImageIndex])}
              alt={product.name}
              className="main-product-image"
              onError={e => { e.target.onerror = null; e.target.src = PLACEHOLDER; }}
            />
            {galleryImages.length > 1 && (
              <div className="image-nav">
                <button className="nav-btn prev" onClick={() =>
                  setCurrentImageIndex(prev => prev === 0 ? galleryImages.length - 1 : prev - 1)
                }>‹</button>
                <button className="nav-btn next" onClick={() =>
                  setCurrentImageIndex(prev => prev === galleryImages.length - 1 ? 0 : prev + 1)
                }>›</button>
              </div>
            )}
          </div>
          {galleryImages.length > 1 && (
            <div className="thumbnail-gallery">
              {galleryImages.map((img, idx) => (
                <img
                  key={idx}
                  src={imgSrc(img)}
                  alt={`View ${idx + 1}`}
                  className={`thumbnail ${idx === currentImageIndex ? 'active' : ''}`}
                  onClick={() => setCurrentImageIndex(idx)}
                  onError={e => { e.target.onerror = null; e.target.src = PLACEHOLDER; }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="product-info-section">
          <h1 className="product-title">{product.name}</h1>

          <div className="product-rating">
            {'★★★★★'.split('').map((s, i) => (
              <span key={i} className="star filled">{s}</span>
            ))}
            <span className="review-count">(128 reviews)</span>
          </div>

          {Array.isArray(product.category) && product.category.length > 0 && (
            <div className="product-tags">
              {product.category.map((cat, i) => (
                <span key={i} className="product-tag">
                  {cat === 'Premium' ? 'Inspired by Premium Designers' : cat}
                </span>
              ))}
            </div>
          )}

          <p className="product-description">{product.description}</p>

          <div className="price-section">
            <span className="current-price">₹{adjustedPrice.toFixed(2)}</span>
            <span className="price-per-ml">(₹{(product.price / 3).toFixed(2)}/ml)</span>
            <div className="price-meta">
              <span className="original-price">MRP: ₹{(product.price * quantity * mlSize).toFixed(0)}</span>
              <span className="discount-badge">Save 33%</span>
            </div>
          </div>

          {/* Size Selector */}
          <div className="size-section">
            <h3 className="section-label">SIZE</h3>
            <div className="size-buttons">
              {[3, 6, 12].map(size => (
                <button
                  key={size}
                  className={`size-btn ${mlSize === size ? 'active' : ''}`}
                  onClick={() => handleMlChange(size)}
                >
                  {size}ml
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="quantity-section">
            <h3 className="section-label">QUANTITY</h3>
            <div className="quantity-controls">
              <button className="qty-btn" onClick={() => handleQuantityChange(-1)}>-</button>
              <span className="qty-value">{quantity}</span>
              <button className="qty-btn" onClick={() => handleQuantityChange(1)}>+</button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <AddToCartButton product={product} quantity={quantity} mlSize={mlSize} />
            <button className="buy-now-btn" onClick={handleBuyNow}>Buy Now</button>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      {product.notes && (
        <div className="notes-section">
          <h2 className="notes-title">Fragrance Notes</h2>
          <div className="notes-grid">
            {renderNotes('top', 'Top Notes')}
            {renderNotes('middle', 'Heart Notes')}
            {renderNotes('base', 'Base Notes')}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
