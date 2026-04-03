// front/src/Components/About.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./css/HeaderFooter.css";
import "./css/About.css";

const API = import.meta.env.VITE_API_URL;

// No local image imports needed — use inline SVG placeholder
const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect fill='%231a1a2e' width='600' height='400'/%3E%3Ctext x='50%25' y='45%25' dominant-baseline='middle' text-anchor='middle' fill='%23d4af37' font-size='64' opacity='0.3'%3E%F0%9F%8C%BF%3C/text%3E%3Ctext x='50%25' y='65%25' dominant-baseline='middle' text-anchor='middle' fill='%23d4af37' font-size='16' opacity='0.4' letter-spacing='4'%3EFANCY PERFUME%3C/text%3E%3C/svg%3E";

const resolveImg = (url, fallback = PLACEHOLDER) => {
  if (!url) return fallback;
  if (url.startsWith('http') || url.startsWith('blob:')) return url;
  return `${API}${url.startsWith('/') ? '' : '/'}${url}`;
};

const defaultSections = [
  { title: "Our Legacy",      content: "Fancy Perfume was born from a passion for exquisite fragrances. We curate the finest attars and perfumes inspired by luxury designer scents, making premium fragrances accessible to everyone." },
  { title: "Craftsmanship",   content: "Each fragrance is meticulously crafted by master perfumers using the highest quality ingredients. We blend traditional attar techniques with modern perfumery to create scents that captivate and endure." },
  { title: "Our Promise",     content: "100% authentic, long-lasting fragrances at unbeatable prices. Every bottle carries our commitment to quality, ensuring you experience luxury without compromise." },
];

export default function About() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    let cancelled = false;
    axios.get(`${API}/api/about`).then(res => {
      if (!cancelled && res.data?.sections?.length > 0) setSections(res.data.sections);
    }).catch(e => console.error("About fetch error:", e))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const displaySections = sections.length > 0 ? sections : defaultSections;

  const TextBlock = ({ section, index }) => (
    <div className="section-text">
      <div className="section-badge">0{index + 1}</div>
      <h2 className="section-title">{section.title}</h2>
      <div className="section-description">{section.content}</div>
    </div>
  );

  const ImageBlock = ({ section, index }) => (
    <div className="section-image">
      <div className="image-container">
        <img
          src={resolveImg(section.imageUrl)}
          alt={section.title}
          onError={e => { e.target.onerror = null; e.target.src = PLACEHOLDER; }}
        />
        <div className="image-overlay"></div>
      </div>
    </div>
  );

  return (
    <main className="luxury-about">
      <section className="about-hero">
        <div className="hero-content">
          <h1 className="hero-title">About Fancy Perfume</h1>
          <p className="hero-subtitle">Where luxury meets accessibility in every fragrance</p>
        </div>
      </section>

      <section className="about-stats">
        <div className="stats-container">
          <div className="stat-item"><div className="stat-number">10+</div><div className="stat-label">Years of Excellence</div></div>
          <div className="stat-item"><div className="stat-number">500+</div><div className="stat-label">Premium Scents</div></div>
          <div className="stat-item"><div className="stat-number">50K+</div><div className="stat-label">Happy Customers</div></div>
        </div>
      </section>

      <section className="about-content">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Discovering our story…</p>
          </div>
        ) : (
          displaySections.map((section, index) => (
            <div className="about-section" key={index}>
              {index % 2 === 0
                ? <><ImageBlock section={section} index={index} /><TextBlock section={section} index={index} /></>
                : <><TextBlock section={section} index={index} /><ImageBlock section={section} index={index} /></>
              }
            </div>
          ))
        )}
      </section>

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
