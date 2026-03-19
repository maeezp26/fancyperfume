import React, { useState, useEffect } from "react";

import "./HomeAdmin.css";
import axios from "axios";

export default function HomeAdmin() {
  const [formData, setFormData] = useState({
    bannerHeading: "Welcome to",
    bannerSubHeading: "Fancy Perfume",
    tagline: "The Royalty of fragrance",
    latestProducts: [{name:"Abeer",image:""},{name:"White Oudh",image:""},{name:"Shanaya",image:""},{name:"Shabaya",image:""},{name:"Purple Oudh",image:""}],
    occasions: [{name:"Office Wear",image:""},{name:"Date Wear",image:""},{name:"Party & Night Wear",image:""},{name:"Gym Wear",image:""},{name:"Sports Wear",image:""}],
    bottomDescription: "Welcome to our exclusive collection..."
  });

  const [imagePreviews, setImagePreviews] = useState({
    bannerImage: null,
    latestProducts: [null,null,null,null,null],
    occasions: [null,null,null,null,null]
  });

  const [currentImages, setCurrentImages] = useState({
    bannerImage: "",
    latestProducts: ["","","","",""],
    occasions: ["","","","",""]
  });

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchHomeData();
  }, []);

  // Replace your fetchHomeData function in HomeAdmin.jsx
const fetchHomeData = async () => {
  try {
    setLoading(true);
<<<<<<< HEAD
    const response = await axios.get("http://localhost:5000/api/home");
=======
    const response = await axios.get("import.meta.env.VITE_API_URL/api/home");
>>>>>>> 9a6e6a0cd91a21814504d1c7ca7d99642391e9b9
    const data = response.data || {};
    
    // Fix: Always exactly 5 items with proper numbering
    const latestProducts = (data.latestProducts || []).slice(0,5).map((p,i) => ({
      name: p?.name || `Product ${i+1}`,
      image: p?.image || ""
    })).concat(Array(Math.max(0,5-(data.latestProducts?.length||0))).fill(null).map((_,i) => ({
      name: `Product ${((data.latestProducts?.length||0) + i + 1)}`,
      image: ""
    })));

    const occasions = (data.occasions || []).slice(0,5).map((o,i) => ({
      name: o?.name || `Occasion ${i+1}`,
      image: o?.image || ""
    })).concat(Array(Math.max(0,5-(data.occasions?.length||0))).fill(null).map((_,i) => ({
      name: `Occasion ${((data.occasions?.length||0) + i + 1)}`,
      image: ""
    })));

    setFormData({
      bannerHeading: "Welcome to", // STATIC
      bannerSubHeading: "Fancy Perfume", // STATIC
      tagline: "The Royalty of fragrance", // STATIC
      latestProducts: latestProducts,
      occasions: occasions,
      bottomDescription: "Welcome to our exclusive collection..." // STATIC
    });

    setCurrentImages({
      bannerImage: "", // STATIC - no preview needed
<<<<<<< HEAD
      latestProducts: (data.latestProducts || []).slice(0,5).map(p => p?.image ? `http://localhost:5000/${p.image}` : ""),
      occasions: (data.occasions || []).slice(0,5).map(o => o?.image ? `http://localhost:5000/${o.image}` : "")
=======
      latestProducts: (data.latestProducts || []).slice(0,5).map(p => p?.image ? `import.meta.env.VITE_API_URL/${p.image}` : ""),
      occasions: (data.occasions || []).slice(0,5).map(o => o?.image ? `import.meta.env.VITE_API_URL/${o.image}` : "")
>>>>>>> 9a6e6a0cd91a21814504d1c7ca7d99642391e9b9
    });
    
  } catch (err) {
    console.error("Fetch error:", err);
    // Set default 5 items even if API fails
    setFormData({
      bannerHeading: "Welcome to",
      bannerSubHeading: "Fancy Perfume", 
      tagline: "The Royalty of fragrance",
      latestProducts: Array(5).fill(null).map((_,i) => ({name: `Product ${i+1}`, image: ""})),
      occasions: Array(5).fill(null).map((_,i) => ({name: `Occasion ${i+1}`, image: ""})),
      bottomDescription: "Welcome to our exclusive collection..."
    });
  } finally {
    setLoading(false);
  }
};


  const handleInputChange = (section, index, field, value) => {
    setFormData(prev => {
      if (index !== undefined) {
        const updatedSection = [...prev[section]];
        updatedSection[index] = { ...updatedSection[index], [field]: value };
        return { ...prev, [section]: updatedSection };
      } else {
        return { ...prev, [section]: value };
      }
    });
  };

  const handleImageChange = (section, index, file) => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    
    if (section === "bannerImage") {
      setImagePreviews(prev => ({ ...prev, bannerImage: previewUrl }));
      setFormData(prev => ({ 
        ...prev, 
        bannerHeadingImage: file
      }));
    } else {
      setImagePreviews(prev => ({
        ...prev,
        [section]: prev[section].map((p,i) => i === index ? previewUrl : p)
      }));
      setFormData(prev => {
        const updatedSection = [...prev[section]];
        updatedSection[index].image = file;
        return { ...prev, [section]: updatedSection };
      });
    }
  };

const handleSave = async () => {
  try {
    setSaving(true);
    setError("");
    
    const formDataToSend = new FormData();
    formDataToSend.append("data", JSON.stringify(formData));

    // Latest Products images
    formData.latestProducts.forEach((product, index) => {
      if (product.image instanceof File) {
        formDataToSend.append(`latestProducts[${index}]`, product.image); // FIXED FIELD NAME
      }
    });
    
    // Occasions images  
    formData.occasions.forEach((occasion, index) => {
      if (occasion.image instanceof File) {
        formDataToSend.append(`occasions[${index}]`, occasion.image); // FIXED FIELD NAME
      }
    });

<<<<<<< HEAD
    const response = await axios.post("http://localhost:5000/api/home", formDataToSend, {
=======
    const response = await axios.post("import.meta.env.VITE_API_URL/api/home", formDataToSend, {
>>>>>>> 9a6e6a0cd91a21814504d1c7ca7d99642391e9b9
      headers: { "Content-Type": "multipart/form-data" }
    });

    alert("✅ Saved successfully!");
    fetchHomeData(); // Refresh data
  } catch (err) {
    setError(err.response?.data?.error || err.message);
  } finally {
    setSaving(false);
  }
};


  if (loading) return (
    <div className="luxury-admin-loading">
      <div className="loading-spinner"></div>
      <p>Loading admin panel...</p>
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
        {error && (
          <div className="admin-error">
            <span className="error-icon">❌</span>
            {error}
          </div>
        )}

     
        {/* Latest Products */}
        <div className="admin-card">
          <div className="card-header">
            <h3 className="card-title">⭐ Latest Products (5)</h3>
          </div>
          <div className="products-grid">
            {formData.latestProducts.map((product, i) => (
              <div key={i} className="product-editor">
                <div className="form-group">
                  <label>Product {i+1} Name</label>
                  <input 
                    type="text" 
                    value={product.name} 
                    onChange={(e) => handleInputChange("latestProducts", i, "name", e.target.value)}
                    placeholder={`Product ${i+1}`}
                  />
                </div>
                <div className="image-section">
                  <label>Image</label>
                  <div className="image-preview-container small">
                    {currentImages.latestProducts[i] && (
                      <img src={currentImages.latestProducts[i]} alt="Current" className="current-image small" />
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleImageChange("latestProducts", i, e.target.files[0])}
                    />
                    {imagePreviews.latestProducts[i] && (
                      <img src={imagePreviews.latestProducts[i]} alt="Preview" className="preview-image small" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Occasions */}
        <div className="admin-card">
          <div className="card-header">
            <h3 className="card-title">🎉 Shop by Occasion (5)</h3>
          </div>
          <div className="products-grid">
            {formData.occasions.map((occasion, i) => (
              <div key={i} className="product-editor">
                <div className="form-group">
                  <label>Occasion {i+1} Name</label>
                  <input 
                    type="text" 
                    value={occasion.name} 
                    onChange={(e) => handleInputChange("occasions", i, "name", e.target.value)}
                    placeholder={`Occasion ${i+1}`}
                  />
                </div>
                <div className="image-section">
                  <label>Image</label>
                  <div className="image-preview-container small">
                    {currentImages.occasions[i] && (
                      <img src={currentImages.occasions[i]} alt="Current" className="current-image small" />
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleImageChange("occasions", i, e.target.files[0])}
                    />
                    {imagePreviews.occasions[i] && (
                      <img src={imagePreviews.occasions[i]} alt="Preview" className="preview-image small" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

  

        {/* Save Button */}
        <div className="admin-actions">
          <button className="luxury-btn primary large" onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <span className="spinner"></span>
                Saving Changes...
              </>
            ) : (
              '💾 Update Home Page'
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
