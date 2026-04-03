import React, { useState, useEffect } from "react";
import "./css/Home.css";
import "./css/HeaderFooter.css";
import { Link } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

// ── Inline SVG placeholders (no local image files needed) ──────────────────
const PLACEHOLDER_HERO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1920' height='800' viewBox='0 0 1920 800'%3E%3Crect fill='%230f0f23' width='1920' height='800'/%3E%3Ctext x='50%25' y='48%25' dominant-baseline='middle' text-anchor='middle' fill='%23d4af37' font-size='80' font-family='serif' opacity='0.25'%3E%F0%9F%8C%BF%3C/text%3E%3Ctext x='50%25' y='62%25' dominant-baseline='middle' text-anchor='middle' fill='%23d4af37' font-size='24' font-family='serif' opacity='0.4' letter-spacing='6'%3EFANCY PERFUME%3C/text%3E%3C/svg%3E";
const PLACEHOLDER_CARD = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500'%3E%3Crect fill='%231a1a2e' width='400' height='500'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23d4af37' font-size='72' opacity='0.3'%3E%F0%9F%8C%BF%3C/text%3E%3C/svg%3E";

const resolveImg = (url, fallback = PLACEHOLDER_CARD) => {
  if (!url) return fallback;
  if (url.startsWith('http') || url.startsWith('blob:')) return url;
  return `${API}${url.startsWith('/') ? '' : '/'}${url}`;
};

const DEFAULT_LATEST = [
  { name: "Abeer" }, { name: "White Oudh" }, { name: "Shanaya" },
  { name: "Shabaya" }, { name: "Purple Oudh" },
];

const DEFAULT_OCCASIONS = [
  { name: "Office Wear" }, { name: "Date Wear" }, { name: "Party & Night Wear" },
  { name: "Gym Wear" }, { name: "Sports Wear" },
];

export default function Home() {
  const [homeData, setHomeData] = useState({
    bannerHeading: "Welcome to",
    bannerSubHeading: "Fancy Perfume",
    tagline: "The Royalty of fragrance",
    latestProducts: DEFAULT_LATEST,
    occasions: DEFAULT_OCCASIONS,
    bottomDescription: "Welcome to our exclusive collection of luxurious perfumes, where every scent tells a story. Explore a range of fragrances crafted to inspire, enchant, and captivate.",
  });

  useEffect(() => {
    let cancelled = false;
    axios.get(`${API}/api/home`).then(res => {
      if (cancelled || !res.data) return;
      const data = res.data;
      setHomeData(prev => ({
        bannerHeading:    data.bannerHeading    || prev.bannerHeading,
        bannerSubHeading: data.bannerSubHeading || prev.bannerSubHeading,
        tagline:          data.tagline          || prev.tagline,
        latestProducts: Array.isArray(data.latestProducts) && data.latestProducts.length
          ? data.latestProducts.map((p, idx) => ({
              name:  p.name  || prev.latestProducts[idx]?.name  || `Product ${idx + 1}`,
              image: resolveImg(p.image),
            }))
          : prev.latestProducts,
        occasions: Array.isArray(data.occasions) && data.occasions.length
          ? data.occasions.map((o, idx) => ({
              name:  o.name  || prev.occasions[idx]?.name  || `Occasion ${idx + 1}`,
              image: resolveImg(o.image),
            }))
          : prev.occasions,
        bottomDescription: data.bottomDescription || prev.bottomDescription,
      }));
    }).catch(() => {}).finally(() => { if (!cancelled) {} });
    return () => { cancelled = true; };
  }, []);

  return (
    <main className="luxury-home">
      <section className="hero-banner">
        <div className="hero-bg">
          <img src={PLACEHOLDER_HERO} alt="Luxury Fragrances" className="hero-image" />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <div className="hero-badge">New Collection</div>
          <h1 className="hero-title-main">{homeData.bannerHeading}</h1>
          <h1 className="hero-title-sub">{homeData.bannerSubHeading}</h1>
          <p className="hero-tagline">{homeData.tagline}</p>
          <Link to="/category" className="hero-cta">Explore Collection</Link>
        </div>
      </section>

      <section className="stats-section">
        <div className="stats-container">
          {[["10K+","Happy Customers"],["500+","Premium Scents"],["99%","Authenticity"],["24/7","Support"]].map(([num,label]) => (
            <div className="stat-item" key={label}>
              <div className="stat-number">{num}</div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="products-section">
        <div className="section-header">
          <h2 className="section-title">Latest Products</h2>
          <p className="section-subtitle">Discover our newest fragrance masterpieces</p>
        </div>
        <div className="products-grid">
          {homeData.latestProducts.map((product, index) => (
            <Link to="/category" className="product-card luxury-card" key={index}>
              <div className="card-media">
                <img
                  src={product.image || PLACEHOLDER_CARD}
                  alt={product.name}
                  loading="lazy"
                  onError={e => { e.target.onerror = null; e.target.src = PLACEHOLDER_CARD; }}
                />
                <div className="card-overlay"><span className="card-badge">New</span></div>
              </div>
              <div className="card-content">
                <h3 className="card-title">{product.name}</h3>
                <div className="card-action"><span>Shop Now</span><span className="arrow">→</span></div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="occasions-section">
        <div className="section-header">
          <h2 className="section-title">Shop By Occasion</h2>
          <p className="section-subtitle">Find your perfect scent for every moment</p>
        </div>
        <div className="occasions-grid">
          {homeData.occasions.map((occasion, index) => (
            <Link to="/category" className="occasion-card luxury-card" key={index}>
              <div className="card-media occasion-media">
                <img
                  src={occasion.image || PLACEHOLDER_CARD}
                  alt={occasion.name}
                  loading="lazy"
                  onError={e => { e.target.onerror = null; e.target.src = PLACEHOLDER_CARD; }}
                />
              </div>
              <div className="card-content"><h3 className="card-title">{occasion.name}</h3></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <div className="cta-text">
            <h2 className="cta-title">Fragrances crafted to inspire</h2>
            <p className="cta-subtitle">{homeData.bottomDescription}</p>
          </div>
          <div className="cta-action">
            <Link to="/category" className="cta-button primary">Start Shopping</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
