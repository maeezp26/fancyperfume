import React, { useState, useEffect, useCallback } from "react";
import "./css/Home.css";
import "./css/HeaderFooter.css";
import { Link } from "react-router-dom";
import axios from "axios";

import home1Fallback from "./img/home1.webp";
import home2Fallback from "./img/home2.webp";
import gymFallback    from "./img/travel.jpg";
import officeFallback from "./img/office.jpg";
import dateFallback   from "./img/datewear.jpg";
import partyFallback  from "./img/party.jpg";
import sportsFallback from "./img/sports.jpg";
import LP1Fallback    from "./img/sports.jpg";
import LP2Fallback    from "./img/sports.jpg";
import LP3Fallback    from "./img/sports.jpg";
import LP4Fallback    from "./img/sports.jpg";
import LP5Fallback    from "./img/sports.jpg";

const DEFAULT_LATEST = [
  { name: "Abeer",       image: LP1Fallback },
  { name: "White Oudh",  image: LP2Fallback },
  { name: "Shanaya",     image: LP3Fallback },
  { name: "Shabaya",     image: LP4Fallback },
  { name: "Purple Oudh", image: LP5Fallback },
];

const DEFAULT_OCCASIONS = [
  { name: "Office Wear",        image: officeFallback },
  { name: "Date Wear",          image: dateFallback   },
  { name: "Party & Night Wear", image: partyFallback  },
  { name: "Gym Wear",           image: gymFallback    },
  { name: "Sports Wear",        image: sportsFallback },
];

export default function Home() {
  const [homeData, setHomeData] = useState({
    bannerHeading:    "Welcome to",
    bannerSubHeading: "Fancy Perfume",
    tagline:          "The Royalty of fragrance",
    latestProducts:   DEFAULT_LATEST,
    occasions:        DEFAULT_OCCASIONS,
    bottomDescription:
      "Welcome to our exclusive collection of luxurious perfumes, where every scent tells a story. Explore a range of fragrances crafted to inspire, enchant, and captivate.",
  });
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchHomeData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/home`);
        if (cancelled) return;
        const data = response.data;
        if (!data) return;

        setHomeData(prev => ({
          bannerHeading:    data.bannerHeading    || prev.bannerHeading,
          bannerSubHeading: data.bannerSubHeading || prev.bannerSubHeading,
          tagline:          data.tagline          || prev.tagline,
          latestProducts: Array.isArray(data.latestProducts) && data.latestProducts.length
            ? data.latestProducts.map((p, idx) => ({
                name:  p.name  || prev.latestProducts[idx]?.name  || `Product ${idx + 1}`,
                image: p.image ? `${import.meta.env.VITE_API_URL}/${p.image}` : prev.latestProducts[idx]?.image || LP1Fallback,
              }))
            : prev.latestProducts,
          occasions: Array.isArray(data.occasions) && data.occasions.length
            ? data.occasions.map((o, idx) => ({
                name:  o.name  || prev.occasions[idx]?.name  || `Occasion ${idx + 1}`,
                image: o.image ? `${import.meta.env.VITE_API_URL}/${o.image}` : prev.occasions[idx]?.image || officeFallback,
              }))
            : prev.occasions,
          bottomDescription: data.bottomDescription || prev.bottomDescription,
        }));
      } catch {
        // silently fall back to defaults (already set)
      } finally {
        if (!cancelled) setDataLoaded(true);
      }
    };
    fetchHomeData();
    return () => { cancelled = true; };
  }, []);

  return (
    <main className="luxury-home">
      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="hero-bg">
          {/* PERFORMANCE: eager load hero image (above fold) */}
          <img src={home1Fallback} alt="Luxury Fragrances" className="hero-image" fetchpriority="high" />
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

      {/* Stats Section */}
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

      {/* Latest Products */}
      <section className="products-section">
        <div className="section-header">
          <h2 className="section-title">Latest Products</h2>
          <p className="section-subtitle">Discover our newest fragrance masterpieces</p>
        </div>
        <div className="products-grid">
          {homeData.latestProducts.map((product, index) => (
            <Link to="/category" className="product-card luxury-card" key={index}>
              <div className="card-media">
                {/* PERFORMANCE: lazy load below-fold images */}
                <img src={product.image || LP1Fallback} alt={product.name} loading="lazy" />
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

      {/* Shop by Occasion */}
      <section className="occasions-section">
        <div className="section-header">
          <h2 className="section-title">Shop By Occasion</h2>
          <p className="section-subtitle">Find your perfect scent for every moment</p>
        </div>
        <div className="occasions-grid">
          {homeData.occasions.map((occasion, index) => (
            <Link to="/category" className="occasion-card luxury-card" key={index}>
              <div className="card-media occasion-media">
                <img src={occasion.image || officeFallback} alt={occasion.name} loading="lazy" />
              </div>
              <div className="card-content"><h3 className="card-title">{occasion.name}</h3></div>
            </Link>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="cta-section">
        <div className="cta-content">
          <div className="cta-text">
            <h2 className="cta-title">Fragrances crafted to inspire</h2>
            <p className="cta-subtitle">{homeData.bottomDescription}</p>
          </div>
          <div className="cta-visual">
            <img src={home2Fallback} alt="Perfume Collection" className="cta-image" loading="lazy" />
          </div>
          <div className="cta-action">
            <Link to="/category" className="cta-button primary">Start Shopping</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
