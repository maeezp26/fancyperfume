// front/src/Components/Admin/HomeAdmin.jsx
import React, { useState, useEffect } from "react";
import "./HomeAdmin.css";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

/**
 * Resolves any stored image URL for display:
 *  - Cloudinary https://... → use as-is (already a full CDN URL)
 *  - Legacy /uploads/...   → prepend API base
 *  - blob: preview         → use as-is
 *  - empty/null            → return ''
 */
const resolveImg = (url) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('blob:')) return url;
  return `${API}${url.startsWith('/') ? '' : '/'}${url}`;
};

const emptyProduct  = (i) => ({ name: `Product ${i + 1}`,  image: '' });
const emptyOccasion = (i) => ({ name: `Occasion ${i + 1}`, image: '' });

export default function HomeAdmin() {
  const [formData, setFormData] = useState({
    latestProducts: Array.from({ length: 5 }, (_, i) => emptyProduct(i)),
    occasions:      Array.from({ length: 5 }, (_, i) => emptyOccasion(i)),
  });

  const [previews, setPreviews] = useState({
    latestProducts: Array(5).fill(''),
    occasions:      Array(5).fill(''),
  });

  const [saving,  setSaving]  = useState(false);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { fetchHomeData(); }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/api/home`);
      const data     = response.data || {};

      const pad = (arr, empty, n = 5) => {
        const filled = (arr || []).slice(0, n).map((x, i) => ({ name: x?.name || `Item ${i+1}`, image: x?.image || '' }));
        while (filled.length < n) filled.push(empty(filled.length));
        return filled;
      };

      setFormData({
        latestProducts: pad(data.latestProducts, emptyProduct),
        occasions:      pad(data.occasions,      emptyOccasion),
      });

      // FIX: resolveImg handles Cloudinary URLs (already https://) vs legacy /uploads/ paths
      setPreviews({
        latestProducts: (data.latestProducts || []).slice(0, 5).map(p => resolveImg(p?.image)).concat(Array(Math.max(0, 5 - (data.latestProducts?.length || 0))).fill('')),
        occasions:      (data.occasions      || []).slice(0, 5).map(o => resolveImg(o?.image)).concat(Array(Math.max(0, 5 - (data.occasions?.length      || 0))).fill('')),
      });
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load current data");
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (section, index, value) => {
    setFormData(prev => {
      const updated = [...prev[section]];
      updated[index] = { ...updated[index], name: value };
      return { ...prev, [section]: updated };
    });
  };

  const handleImageChange = (section, index, file) => {
    if (!file) return;

    // Blob preview immediately
    const blobUrl = URL.createObjectURL(file);
    setPreviews(prev => {
      const updated = [...prev[section]];
      updated[index] = blobUrl;
      return { ...prev, [section]: updated };
    });

    // Store File object in formData.image
    setFormData(prev => {
      const updated = [...prev[section]];
      updated[index] = { ...updated[index], image: file };
      return { ...prev, [section]: updated };
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const formDataToSend = new FormData();

      // Serialize names and existing image URLs (strings only)
      const dataPayload = {
        latestProducts: formData.latestProducts.map(p => ({
          name:  p.name,
          image: p.image instanceof File ? '' : (p.image || ''),
        })),
        occasions: formData.occasions.map(o => ({
          name:  o.name,
          image: o.image instanceof File ? '' : (o.image || ''),
        })),
      };
      formDataToSend.append("data", JSON.stringify(dataPayload));

      // Append new File objects
      formData.latestProducts.forEach((product, index) => {
        if (product.image instanceof File) {
          formDataToSend.append(`latestProducts[${index}]`, product.image);
        }
      });
      formData.occasions.forEach((occasion, index) => {
        if (occasion.image instanceof File) {
          formDataToSend.append(`occasions[${index}]`, occasion.image);
        }
      });

      await axios.post(`${API}/api/home`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("✅ Home page updated successfully!");
      fetchHomeData(); // Refresh with saved Cloudinary URLs
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="luxury-admin-loading">
      <div className="loading-spinner"></div>
      <p>Loading admin panel…</p>
    </div>
  );

  const renderSection = (key, label, emptyFn) => (
    <div className="admin-card">
      <div className="card-header">
        <h3 className="card-title">{label}</h3>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', margin: 0 }}>
          Images upload to Cloudinary CDN — permanent storage
        </p>
      </div>
      <div className="products-grid">
        {formData[key].map((item, i) => (
          <div key={i} className="product-editor">
            <div className="form-group">
              <label>{key === 'latestProducts' ? `Product ${i+1}` : `Occasion ${i+1}`} Name</label>
              <input
                type="text"
                value={item.name}
                onChange={(e) => handleNameChange(key, i, e.target.value)}
                placeholder={`Enter name`}
              />
            </div>
            <div className="image-section">
              <label>Image {previews[key][i] ? '(saved ✓)' : '(none)'}</label>
              <div className="image-preview-container small">
                {previews[key][i] && (
                  <img
                    src={previews[key][i]}
                    alt="preview"
                    className="current-image small"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(key, i, e.target.files[0])}
                />
                {item.image instanceof File && (
                  <p style={{ color: '#d4af37', fontSize: '0.7rem', margin: '4px 0 0' }}>
                    New file selected — will upload on save
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <main className="luxury-admin-panel">
      <section className="admin-hero">
        <div className="hero-content">
          <h1 className="hero-title">Admin Control Panel</h1>
          <p className="hero-subtitle">Manage Home Page Content</p>
        </div>
      </section>

      <div className="admin-container">
        {error   && <div className="admin-error"><span className="error-icon">❌</span> {error}</div>}
        {success && <div className="admin-success"><span>✅</span> {success}</div>}

        {renderSection('latestProducts', '⭐ Latest Products (5)', emptyProduct)}
        {renderSection('occasions',      '🎉 Shop by Occasion (5)', emptyOccasion)}

        <div className="admin-actions">
          <button className="luxury-btn primary large" onClick={handleSave} disabled={saving}>
            {saving ? <><span className="spinner"></span> Uploading to Cloudinary…</> : '💾 Save Home Page'}
          </button>
        </div>
      </div>
    </main>
  );
}
