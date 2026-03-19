import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from '../contexts/CartContext'; // ✅ ADD THIS
import axios from "axios";
import AddToCartButton from "./AddToCartButton";
import "./css/HeaderFooter.css";
import "./css/Category.css";
import whatsapp from "./img/wp.jpg";

const openExternalLink = (url) => {
  window.open(url, "_blank", "noopener,noreferrer");
};

export default function Category() {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortOption, setSortOption] = useState("featured");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // ✅ ADD THESE LINES (after const navigate = useNavigate();)
const { addToCart } = useCart();

const handleBuyNow = async (product) => {
  try {
    await addToCart(product._id, 1, 3); // default quantity 1, mlSize 3
    navigate('/checkout');
  } catch (error) {
    console.error('Buy Now error:', error);
  }
};


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
<<<<<<< HEAD
        const response = await axios.get("http://localhost:5000/api/products");
=======
        const response = await axios.get("import.meta.env.VITE_API_URL/api/products");
>>>>>>> 9a6e6a0cd91a21814504d1c7ca7d99642391e9b9
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
      case "nameAZ":
        return [...products].sort((a, b) => a.name.localeCompare(b.name));
      case "nameZA":
        return [...products].sort((a, b) => b.name.localeCompare(a.name));
      case "priceLowHigh":
        return [...products].sort((a, b) => a.price - b.price);
      case "priceHighLow":
        return [...products].sort((a, b) => b.price - a.price);
      case "bestSelling":
      case "featured":
      default:
        return products;
    }
  };

  useEffect(() => {
    let updated = [...allProducts];

    if (selectedCategory !== "All") {
      updated = updated.filter((product) => {
        const cat = product.category;

        if (!cat) return false;

        if (Array.isArray(cat)) {
          return cat.some(
            (c) => c.toLowerCase() === selectedCategory.toLowerCase()
          );
        }

        return cat.toLowerCase() === selectedCategory.toLowerCase();
      });
    }

    updated = sortProductsByOption(updated, sortOption);
    setFilteredProducts(updated);
  }, [selectedCategory, sortOption, allProducts]);

  const handleImageClick = (product) => {
    navigate(`/product/${product._id}`, { state: product });
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const categories = [
    "All",
    "Attars",
    "Perfume",
    "Premium",
    "Male",
    "Female",
    "Unisex",
    "Celebrity",
  ];

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
          <p className="hero-subtitle">
            Discover premium fragrances crafted for every occasion
          </p>
        </div>
      </section>

      {/* Filters Container */}
      <div className="filters-container">
        {/* Category Pills */}
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

        {/* Sort Dropdown */}
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
            state={product} // Pass product as state
          >
            <div className="category-card-media">
              <img
<<<<<<< HEAD
                src={`http://localhost:5000${product.imageUrl}`}
=======
                src={`import.meta.env.VITE_API_URL${product.imageUrl}`}
>>>>>>> 9a6e6a0cd91a21814504d1c7ca7d99642391e9b9
                alt={product.name}
                className="category-card-image"
              />
              <div className="product-overlay">
                <div className="overlay-content">
                  <h3>{product.name}</h3>
                  <span className="quick-action">View Details</span>
                </div>
              </div>
              <div className="product-badges">
                {Array.isArray(product.category) &&
                  product.category.includes("Premium") && (
                    <span className="badge premium">Premium</span>
                  )}
                {Array.isArray(product.category) &&
                  product.category.includes("Celebrity") && (
                    <span className="badge celebrity">Celebrity</span>
                  )}
              </div>
            </div>

            <div className="product-info">
              <h3 className="product-name">{product.name}</h3>
              <div className="product-categories">
                {Array.isArray(product.category)
                  ? product.category.slice(0, 2).join(" • ")
                  : product.category}
              </div>
              <div className="product-price">
                ₹{product.price.toLocaleString()}
              </div>

              {/* Actions INSIDE product-info, under price */}
              {/* Actions INSIDE product-info, under price */}
<div className="product-actions inline">
  <AddToCartButton product={product} size="small" />
  
  <button
    type="button"
    className="buy-now-small-btn"
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      handleBuyNow(product);
    }}
  >
    Buy Now
  </button>
  
  <button
    className="whatsapp-btn"
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      openExternalLink(
        "https://wa.me/917600935055?text=I'm%20interested%20in%20this%20product!"
      );
    }}
    title="WhatsApp Inquiry"
  >
    <img src={whatsapp} alt="WhatsApp" />
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
      <button
        className="empty-cta"
        onClick={() => handleCategoryChange("All")}
      >
        Show All Products
      </button>
    </div>
  )}
</section>

    </main>
  );
}

