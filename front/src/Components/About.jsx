import React, { useEffect, useState } from "react";
import axios from "axios";
import "./css/HeaderFooter.css";
import "./css/About.css";

// Fallback images
import p2 from "./img/p2.jpg";
import p3 from "./img/p3.jpg";
import p4 from "./img/p4.jpg";
import p5 from "./img/p5.jpg";
import p6 from "./img/p6.jpg";

export default function About() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const fallbackImages = [p2, p3, p5, p6, p4];

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        setLoading(true);
        const res = await axios.get("process.env.VITE_API_URL/api/about");
        if (res.data && res.data.sections && res.data.sections.length > 0) {
          setSections(res.data.sections);
        }
      } catch (error) {
        console.error("Error fetching about data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAboutData();
  }, []);

  const defaultSections = [
    {
      title: "Our Legacy",
      content: "Fancy Perfume was born from a passion for exquisite fragrances. For over a decade, we've curated the finest attars and perfumes inspired by luxury designer scents, making premium fragrances accessible to everyone."
    },
    {
      title: "Craftsmanship",
      content: "Each fragrance is meticulously crafted by master perfumers using the highest quality ingredients. We blend traditional attar techniques with modern perfumery to create scents that captivate and endure."
    },
    {
      title: "Our Promise",
      content: "100% authentic, long-lasting fragrances at unbeatable prices. Every bottle carries our commitment to quality, ensuring you experience luxury without compromise."
    }
  ];

  return (
    <main className="luxury-about">
      {/* Hero Header */}
      <section className="about-hero">
        <div className="hero-content">
          <h1 className="hero-title">About Fancy Perfume</h1>
          <p className="hero-subtitle">
            Where luxury meets accessibility in every fragrance
          </p>
        </div>
      </section>

      {/* Stats Row */}
      <section className="about-stats">
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-number">10+</div>
            <div className="stat-label">Years of Excellence</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">500+</div>
            <div className="stat-label">Premium Scents</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">50K+</div>
            <div className="stat-label">Happy Customers</div>
          </div>
        </div>
      </section>

      {/* About Content */}
      <section className="about-content">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Discovering our story...</p>
          </div>
        ) : sections.length > 0 ? (
          sections.map((section, index) => {
            const imgSrc = section.imageUrl
              ? `process.env.VITE_API_URL${section.imageUrl}`
              : fallbackImages[index] || fallbackImages[0];
            const isEven = index % 2 === 0;

            return (
              <div className="about-section" key={index}>
                {isEven ? (
                  <>
                    <div className="section-image">
                      <div className="image-container">
                        <img src={imgSrc} alt={section.title} />
                        <div className="image-overlay"></div>
                      </div>
                    </div>
                    <div className="section-text">
                      <div className="section-badge">0{index + 1}</div>
                      <h2 className="section-title">{section.title}</h2>
                      <div className="section-description">{section.content}</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="section-text">
                      <div className="section-badge">0{index + 1}</div>
                      <h2 className="section-title">{section.title}</h2>
                      <div className="section-description">{section.content}</div>
                    </div>
                    <div className="section-image">
                      <div className="image-container">
                        <img src={imgSrc} alt={section.title} />
                        <div className="image-overlay"></div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })
        ) : (
          defaultSections.map((section, index) => {
            const imgSrc = fallbackImages[index] || fallbackImages[0];
            const isEven = index % 2 === 0;

            return (
              <div className="about-section" key={`default-${index}`}>
                {isEven ? (
                  <>
                    <div className="section-image">
                      <div className="image-container">
                        <img src={imgSrc} alt={section.title} />
                        <div className="image-overlay"></div>
                      </div>
                    </div>
                    <div className="section-text">
                      <div className="section-badge">0{index + 1}</div>
                      <h2 className="section-title">{section.title}</h2>
                      <div className="section-description">{section.content}</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="section-text">
                      <div className="section-badge">0{index + 1}</div>
                      <h2 className="section-title">{section.title}</h2>
                      <div className="section-description">{section.content}</div>
                    </div>
                    <div className="section-image">
                      <div className="image-container">
                        <img src={imgSrc} alt={section.title} />
                        <div className="image-overlay"></div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Experience Luxury?</h2>
          <p className="cta-subtitle">
            Discover our exquisite collection of premium fragrances
          </p>
          <a href="/category" className="cta-button">Explore Collection</a>
        </div>
      </section>
    </main>
  );
}
