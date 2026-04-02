// front/src/Components/About.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./css/HeaderFooter.css";
import "./css/About.css";

import p2 from "./img/p2.jpg";
import p3 from "./img/p3.jpg";
import p4 from "./img/p4.jpg";
import p5 from "./img/p5.jpg";
import p6 from "./img/p6.jpg";

const API = import.meta.env.VITE_API_URL;

/**
 * Resolves any stored image URL to a displayable src:
 *  - Cloudinary  https://res.cloudinary.com/...  → use as-is
 *  - Legacy      /uploads/about/xxx.jpg          → prepend API base
 *  - Blob URL    blob:http://...                 → preview only, use as-is
 *  - Empty / null → use provided fallback
 */
const resolveImg = (url, fallback) => {
  if (!url) return fallback;
  if (url.startsWith('http') || url.startsWith('blob:')) return url;
  return `${API}${url.startsWith('/') ? '' : '/'}${url}`;
};

const defaultSections = [
  {
    title: "Our Legacy",
    content:
      "Fancy Perfume was born from a passion for exquisite fragrances. We curate the finest attars and perfumes inspired by luxury designer scents, making premium fragrances accessible to everyone.",
  },
  {
    title: "Craftsmanship",
    content:
      "Each fragrance is meticulously crafted by master perfumers using the highest quality ingredients. We blend traditional attar techniques with modern perfumery to create scents that captivate and endure.",
  },
  {
    title: "Our Promise",
    content:
      "100% authentic, long-lasting fragrances at unbeatable prices. Every bottle carries our commitment to quality, ensuring you experience luxury without compromise.",
  },
];

const fallbackImages = [p2, p3, p5, p6, p4];

export default function About() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchAboutData = async () => {
      try {
        setLoading(true);
        // FIX: was literal string "import.meta.env.VITE_API_URL/api/about"
        const res = await axios.get(`${API}/api/about`);
        if (!cancelled && res.data?.sections?.length > 0) {
          setSections(res.data.sections);
        }
      } catch (error) {
        console.error("Error fetching about data:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchAboutData();
    return () => { cancelled = true; };
  }, []);

  const displaySections = sections.length > 0 ? sections : defaultSections;

  return (
    <main className="luxury-about">
      {/* Hero */}
      <section className="about-hero">
        <div className="hero-content">
          <h1 className="hero-title">About Fancy Perfume</h1>
          <p className="hero-subtitle">Where luxury meets accessibility in every fragrance</p>
        </div>
      </section>

      {/* Stats */}
      <section className="about-stats">
        <div className="stats-container">
          <div className="stat-item"><div className="stat-number">10+</div><div className="stat-label">Years of Excellence</div></div>
          <div className="stat-item"><div className="stat-number">500+</div><div className="stat-label">Premium Scents</div></div>
          <div className="stat-item"><div className="stat-number">50K+</div><div className="stat-label">Happy Customers</div></div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="about-content">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Discovering our story…</p>
          </div>
        ) : (
          displaySections.map((section, index) => {
            // FIX: resolveImg handles Cloudinary https:// URLs AND old /uploads/ paths
            const imgSrc = resolveImg(section.imageUrl, fallbackImages[index % fallbackImages.length]);
            const isEven = index % 2 === 0;

            const TextBlock = () => (
              <div className="section-text">
                <div className="section-badge">0{index + 1}</div>
                <h2 className="section-title">{section.title}</h2>
                <div className="section-description">{section.content}</div>
              </div>
            );

            const ImageBlock = () => (
              <div className="section-image">
                <div className="image-container">
                  <img
                    src={imgSrc}
                    alt={section.title}
                    onError={(e) => { e.target.onerror = null; e.target.src = fallbackImages[index % fallbackImages.length]; }}
                  />
                  <div className="image-overlay"></div>
                </div>
              </div>
            );

            return (
              <div className="about-section" key={index}>
                {isEven ? <><ImageBlock /><TextBlock /></> : <><TextBlock /><ImageBlock /></>}
              </div>
            );
          })
        )}
      </section>

      {/* CTA */}
      <section className="about-cta">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Experience Luxury?</h2>
          <p className="cta-subtitle">Discover our exquisite collection of premium fragrances</p>
          <a href="/category" className="cta-button">Explore Collection</a>
        </div>
      </section>
    </main>
  );
}
