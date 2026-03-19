import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import AddToCartButton from "./AddToCartButton";
import { useCart } from '../contexts/CartContext';
import { useNavigate } from "react-router-dom"; // ✅ Change this line
import "./css/ProductDetails.css";

const ProductDetails = () => {
  const { state: product } = useLocation();
  const [quantity, setQuantity] = useState(1);
  const [mlSize, setMlSize] = useState(3);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate(); // ✅ Add this line (line 8ish)


  if (!product) {
    return (
      <div className="product-details-page">
        <div className="empty-state">
          <div className="empty-icon">🎁</div>
          <h2>Product not found</h2>
          <p>Please go back to the catalog to explore our collection.</p>
        </div>
      </div>
    );
  }

  const handleQuantityChange = (change) => {
    setQuantity((prev) => Math.max(1, prev + change));
  };

  const handleMlChange = (size) => {
    setMlSize(size);
  };

  const adjustedPrice = (product.price * quantity * mlSize) / 3;

  const { addToCart } = useCart();

const handleBuyNow = async () => {
  try {
    // Add current product to cart with selected quantity/mlSize
    await addToCart(product._id, quantity, mlSize);
    // Go directly to checkout
    navigate('/checkout');
  } catch (error) {
    console.error('Error with Buy Now:', error);
  }
};

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
<<<<<<< HEAD
                src={`http://localhost:5000${note.imageUrl}`}
=======
                src={`import.meta.env.VITE_API_URL${note.imageUrl}`}
>>>>>>> 9a6e6a0cd91a21814504d1c7ca7d99642391e9b9
                alt={note.name}
                className="note-image"
                onError={(e) => (e.target.style.display = "none")}
              />
            </div>
            <p className="note-name">{note.name}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const getGalleryImages = () => {
    const images = [product.imageUrl];
    if (product.additionalImages) {
      images.push(...product.additionalImages);
    }
    return images;
  };

  const galleryImages = getGalleryImages();

  return (
    <div className="product-details-page">
      <div className="product-breadcrumb">
        <a href="/catalog">Catalog</a> / <span>{product.name}</span>
      </div>
      
      <div className="product-main-container">
        <div className="product-gallery">
          <div className="main-image-container">
            <img
<<<<<<< HEAD
              src={`http://localhost:5000${galleryImages[currentImageIndex]}`}
=======
              src={`import.meta.env.VITE_API_URL${galleryImages[currentImageIndex]}`}
>>>>>>> 9a6e6a0cd91a21814504d1c7ca7d99642391e9b9
              alt={product.name}
              className="main-product-image"
            />
            <div className="image-nav">
              <button 
                className="nav-btn prev" 
                onClick={() => setCurrentImageIndex((prev) => 
                  prev === 0 ? galleryImages.length - 1 : prev - 1
                )}
              >
                ‹
              </button>
              <button 
                className="nav-btn next" 
                onClick={() => setCurrentImageIndex((prev) => 
                  prev === galleryImages.length - 1 ? 0 : prev + 1
                )}
              >
                ›
              </button>
            </div>
          </div>
          
          {galleryImages.length > 1 && (
            <div className="thumbnail-gallery">
              {galleryImages.map((img, index) => (
                <div
                  key={index}
                  className={`thumbnail ${currentImageIndex === index ? 'active' : ''}`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <img
<<<<<<< HEAD
                    src={`http://localhost:5000${img}`}
=======
                    src={`import.meta.env.VITE_API_URL${img}`}
>>>>>>> 9a6e6a0cd91a21814504d1c7ca7d99642391e9b9
                    alt={`${product.name} ${index + 1}`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="product-info">
          <div className="product-header">
            <h1 className="product-title">{product.name}</h1>
            <div className="rating">
              <span className="stars">★★★★★</span>
              <span className="reviews">(128 reviews)</span>
            </div>
          </div>

          <div className="product-badge">Inspired by Premium Designers</div>

          <p className="product-description">
            {product.description || 
              "A rich blend of oriental and western notes crafted for long-lasting elegance. Experience luxury in every spray."
            }
          </p>

          <div className="price-section">
            <div className="current-price">
              ₹{adjustedPrice.toFixed(2)}
              <span className="price-per-ml">
                (₹{(adjustedPrice / mlSize).toFixed(2)}/ml)
              </span>
            </div>
            <div className="original-price">
              MRP: ₹{(product.price * quantity * 3).toFixed(2)}
              <span className="savings">
                Save {(adjustedPrice / (product.price * quantity * 3) * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          <div className="size-selector">
            <label className="selector-label">Size</label>
            <div className="size-buttons">
              {[3, 6, 12].map((size) => (
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

          <div className="quantity-selector">
            <label className="selector-label">Quantity</label>
            <div className="quantity-controls">
              <button 
                className="qty-btn" 
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity === 1}
              >
                -
              </button>
              <span className="qty-display">{quantity}</span>
              <button 
                className="qty-btn" 
                onClick={() => handleQuantityChange(1)}
              >
                +
              </button>
            </div>
          </div>

          <div className="action-buttons">
           <button 
                type="button"
                className="buy-now-btn"
                onClick={handleBuyNow}  // ✅ Add this
              >
  <span>Buy Now</span>
  <span className="price-tag">₹{adjustedPrice.toFixed(2)}</span>
</button>

            <AddToCartButton 
  product={product} 
  size="large" 
  quantity={quantity}      
  mlSize={mlSize}          
/>
          </div>

          <div className="product-features">
            <div className="feature">
              <div className="feature-icon">🚚</div>
              <span>Free Shipping over ₹999</span>
            </div>
            <div className="feature">
              <div className="feature-icon">🛡️</div>
              <span>7 Day Return</span>
            </div>
            <div className="feature">
              <div className="feature-icon">⭐</div>
              <span>100% Authentic</span>
            </div>
          </div>
        </div>
      </div>

      <div className="perfume-pyramid">
        <div className="pyramid-header">
          <h2>Perfume Pyramid</h2>
          <p>Discover the layered fragrance journey</p>
        </div>
        <div className="pyramid-container">
          <div className="pyramid-visual">
            <div className="pyramid-shape">
              <div className="pyramid-tier top-tier">
                {renderNotes("top", "Top Notes")}
              </div>
              <div className="pyramid-tier middle-tier">
                {renderNotes("middle", "Middle (Heart) Notes")}
              </div>
              <div className="pyramid-tier base-tier">
                {renderNotes("base", "Base Notes")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
