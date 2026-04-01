import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from '../contexts/CartContext';
import axios from "axios";
import AddToCartButton from "./AddToCartButton";
import "./css/HeaderFooter.css";
import "./css/Category.css";

const API = import.meta.env.VITE_API_URL;

const PLACEHOLDER = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400' viewBox='0 0 300 400'%3E%3Crect fill='%231a1a2e' width='300' height='400'/%3E%3Ctext x='50%25' y='45%25' dominant-baseline='middle' text-anchor='middle' fill='%23d4af37' font-size='60'%3E%F0%9F%8C%BF%3C/text%3E%3Ctext x='50%25' y='65%25' dominant-baseline='middle' text-anchor='middle' fill='%23d4af37' font-size='14' opacity='0.6'%3ENo Image%3C/text%3E%3C/svg%3E`;

/**
 * Smart image URL resolver:
 * - Cloudinary URLs (start with https://) → use directly
 * - Legacy relative paths (/uploads/...) → prepend API base
 * - Empty / null → placeholder
 */
const resolveImg = (url) => {
  if (!url) return PLACEHOLDER;
  if (url.startsWith('http')) return url;        // Cloudinary or external
  return `${API}${url.startsWith('/') ? '' : '/'}${url}`; // legacy Render path
};

const openExternalLink = (url) => {
  window.open(url, "_blank", "noopener,noreferrer");
};

export default function Category() {
  const [allProducts, setAllProducts]         = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortOption, setSortOption]           = useState("featured");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading]                 = useState(true);

  const navigate = useNavigate();
  const { addToCart } = useCart();

  const handleBuyNow = async (product) => {
    try {
      await addToCart(product._id, 1, 3);
      navigate('/checkout');
    } catch (error) {
      console.error('Buy Now error:', error);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API}/api/products`);
        setAllProducts(response.data);
        setFilteredProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const sortProductsByOption = (products, option) => {
    switch (option) {
      case "nameAZ":       return [...products].sort((a, b) => a.name.localeCompare(b.name));
      case "nameZA":       return [...products].sort((a, b) => b.name.localeCompare(a.name));
      case "priceLowHigh": return [...products].sort((a, b) => a.price - b.price);
      case "priceHighLow": return [...products].sort((a, b) => b.price - a.price);
      default:             return products;
    }
  };

  useEffect(() => {
    let updated = [...allProducts];
    if (selectedCategory !== "All") {
      updated = updated.filter((product) => {
        const cat = product.category;
        if (!cat) return false;
        if (Array.isArray(cat)) return cat.some((c) => c.toLowerCase() === selectedCategory.toLowerCase());
        return cat.toLowerCase() === selectedCategory.toLowerCase();
      });
    }
    updated = sortProductsByOption(updated, sortOption);
    setFilteredProducts(updated);
  }, [selectedCategory, sortOption, allProducts]);

  const handleCategoryChange = (category) => setSelectedCategory(category);
  const handleSortChange     = (e) => setSortOption(e.target.value);

  const categories = ["All", "Attars", "Perfume", "Premium", "Male", "Female", "Unisex", "Celebrity"];

  if (loading) {
    return (
      <div className="category-loading">
        <div className="loading-spinner"></div>
        <p>Loading luxury collection...</p>
      </div>
    );
  }

  return (
    <main className="luxury-category">
      {/* Hero Header */}
      <section className="category-hero">
        <div className="hero-content">
          <h1 className="hero-title">Our Collection</h1>
          <p className="hero-subtitle">Discover premium fragrances crafted for every occasion</p>
        </div>
      </section>

      {/* Filters */}
      <div className="filters-container">
        <div className="category-pills">
          {categories.map((category) => (
            <button
              key={category}
              className={`pill-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => handleCategoryChange(category)}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="sort-container">
          <div className="sort-dropdown">
            <label>Sort by</label>
            <select value={sortOption} onChange={handleSortChange}>
              <option value="featured">Featured</option>
              <option value="bestSelling">Best Selling</option>
              <option value="nameAZ">A–Z</option>
              <option value="nameZA">Z–A</option>
              <option value="priceLowHigh">Price: Low to High</option>
              <option value="priceHighLow">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <section className="products-grid-section">
        {filteredProducts.length > 0 ? (
          <div className="luxury-products-grid">
            {filteredProducts.map((product, index) => (
              <div className="product-wrapper" key={product._id || index}>
                <Link
                  to={`/product/${product._id}`}
                  className="luxury-product-card"
                  state={product}
                >
                  <div className="category-card-media">
                    {/* FIX: resolveImg handles Cloudinary https:// URLs AND old /uploads/ paths */}
                    <img
                      src={resolveImg(product.imageUrl)}
                      alt={product.name}
                      className="category-card-image"
                      loading="lazy"
                      onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER; }}
                    />
                    <div className="product-overlay">
                      <div className="overlay-content">
                        <h3>{product.name}</h3>
                        <span className="quick-action">View Details</span>
                      </div>
                    </div>
                    <div className="product-badges">
                      {Array.isArray(product.category) && product.category.includes("Premium") && (
                        <span className="badge premium">Premium</span>
                      )}
                      {Array.isArray(product.category) && product.category.includes("Celebrity") && (
                        <span className="badge celebrity">Celebrity</span>
                      )}
                    </div>
                  </div>

                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <div className="product-categories">
                      {Array.isArray(product.category) ? product.category.slice(0, 2).join(" • ") : product.category}
                    </div>
                    <div className="product-price">₹{product.price.toLocaleString()}</div>

                    <div className="product-actions inline">
                      <AddToCartButton product={product} size="small" />
                      <button
                        type="button"
                        className="buy-now-small-btn"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleBuyNow(product); }}
                      >
                        Buy Now
                      </button>
                      <button
                        className="whatsapp-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const categories = Array.isArray(product.category) ? product.category.join(', ') : product.category;
                          const msg =
                            `Hi! I want more information about this product.%0A%0A` +
                            `*Product:* ${product.name}%0A` +
                            `*Category:* ${categories}%0A` +
                            `*Price:* ₹${product.price} (per 3ml)%0A` +
                            `*Available Sizes:* 3ml, 6ml, 12ml%0A%0A` +
                            `Please share more details about availability and delivery.`;
                          openExternalLink(`https://wa.me/917600935055?text=${msg}`);
                        }}
                        title="WhatsApp Inquiry"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🎁</div>
            <h2>No products found</h2>
            <p>Try adjusting your filters or check back later</p>
            <button className="empty-cta" onClick={() => handleCategoryChange("All")}>
              Show All Products
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
