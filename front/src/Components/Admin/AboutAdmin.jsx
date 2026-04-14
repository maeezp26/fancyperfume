// front/src/Components/Admin/AboutAdmin.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AboutAdmin.css";
import { apiUrl, assetUrl } from "../../utils/api";

// Resolve stored URL (Cloudinary https:// or legacy /uploads/) for display
const resolveImg = (url) => {
  if (!url) return null;
  return assetUrl(url);
};

const DEFAULT_SECTIONS = [
  { title: "Introduction", content: "Welcome to Fancy Perfume, your destination for premium attars and fragrances crafted with care.", imageUrl: "" },
  { title: "Story",        content: "Our journey began with a single scent and a vision to make luxury fragrances accessible to everyone.", imageUrl: "" },
  { title: "Products",     content: "Explore our wide range of long-lasting, Arabic and Western inspired perfumes and attars.", imageUrl: "" },
  { title: "Values",       content: "At Fancy Perfume, our values are anchored in quality, authenticity, and customer satisfaction.", imageUrl: "" },
  { title: "Contact",      content: "Phone: 9081634004\nCity: Haldharu, India\nVisit our shop to experience the fragrances in person.", imageUrl: "" },
];

export default function AboutAdmin() {
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [newFiles, setNewFiles] = useState({}); // index → File
  const [previews, setPreviews] = useState({}); // index → blob URL
  const [saving,   setSaving]   = useState(false);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        setLoading(true);
        // FIX: was literal string "import.meta.env.VITE_API_URL/api/about"
        const res = await axios.get(apiUrl("/api/about"));
        if (res.data?.sections?.length > 0) {
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

  const handleChange = (index, field, value) => {
    setSections(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleFileChange = (index, file) => {
    if (!file) return;
    const blobUrl = URL.createObjectURL(file);
    setNewFiles(prev  => ({ ...prev, [index]: file }));
    setPreviews(prev  => ({ ...prev, [index]: blobUrl }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const formData = new FormData();

      // Mark sections that have a new file with _replaceImage flag
      // so the backend knows to consume the next uploaded file for that section
      const sectionsForApi = sections.map((s, i) => ({
        title:         s.title,
        content:       s.content,
        imageUrl:      s.imageUrl || '',
        _replaceImage: !!newFiles[i],
      }));

      formData.append("data", JSON.stringify({ sections: sectionsForApi }));

      // Append files in section order (only those sections that have a new file)
      sections.forEach((_, index) => {
        if (newFiles[index]) {
          formData.append("images", newFiles[index]);
        }
      });

      // FIX: was literal string "import.meta.env.VITE_API_URL/api/about"
      await axios.put(apiUrl("/api/about"), formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("✅ About page saved successfully!");
      setNewFiles({});
      setPreviews({});

      // Refresh from server
      const res = await axios.get(apiUrl("/api/about"));
      if (res.data?.sections?.length > 0) setSections(res.data.sections);
    } catch (error) {
      console.error("Save error:", error);
      alert("❌ Error saving about page: " + (error.response?.data?.error || error.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="admin-about-container"><p>Loading…</p></div>;

  return (
    <div className="admin-about-container">
      <h2>About Page Settings</h2>
      <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        Images are uploaded to Cloudinary CDN — they persist permanently across all deploys.
      </p>

      {sections.map((section, index) => (
        <div key={index} className="admin-about-section">
          <h3>Section {index + 1}</h3>

          <input
            type="text"
            placeholder="Section Title"
            value={section.title}
            onChange={(e) => handleChange(index, "title", e.target.value)}
            className="about-input"
          />

          <textarea
            rows={4}
            placeholder="Section Content"
            value={section.content}
            onChange={(e) => handleChange(index, "content", e.target.value)}
            className="about-textarea"
          />

          <div className="about-image-row">
            {/* Show current saved image */}
            {section.imageUrl && !previews[index] && (
              <div className="about-img-wrap">
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>Current image:</p>
                <img
                  src={resolveImg(section.imageUrl)}
                  alt={section.title}
                  className="about-image-preview"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}

            {/* Show new file preview */}
            {previews[index] && (
              <div className="about-img-wrap">
                <p style={{ fontSize: '0.75rem', color: '#d4af37', marginBottom: '4px' }}>New image (not saved yet):</p>
                <img src={previews[index]} alt="Preview" className="about-image-preview" />
              </div>
            )}

            <div>
              <label className="about-file-label">
                {section.imageUrl || previews[index] ? "Replace Image" : "Upload Image"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(index, e.target.files[0])}
                  className="about-file-input"
                />
              </label>
            </div>
          </div>
        </div>
      ))}

      <button className="about-save-btn" onClick={handleSave} disabled={saving}>
        {saving ? "Saving to Cloudinary…" : "💾 Save About Page"}
      </button>
    </div>
  );
}
