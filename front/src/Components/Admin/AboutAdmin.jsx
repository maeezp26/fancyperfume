import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AboutAdmin.css";

export default function AboutAdmin() {
  const [sections, setSections] = useState([
    {
      title: "Introduction",
      content:
        "Welcome to Fancy Perfume, your destination for premium attars and fragrances crafted with care.",
      imageUrl: "",
    },
    {
      title: "Story",
      content:
        "Our journey began with a single scent and a vision to make luxury fragrances accessible to everyone.",
      imageUrl: "",
    },
    {
      title: "Products",
      content:
        "Explore our wide range of long-lasting, Arabic and Western inspired perfumes and attars.",
      imageUrl: "",
    },
    {
      title: "Values",
      content:
        "At Fancy Perfume, our values are anchored in quality, authenticity, and customer satisfaction.",
      imageUrl: "",
    },
    {
      title: "Contact",
      content:
        "Connect with us:\nPhone: 9081634004\nCity: Haldharu, India\nVisit our shop to experience the fragrances in person.",
      imageUrl: "",
    },
  ]);

  const [files, setFiles] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const res = await axios.get("process.env.VITE_API_URL/api/about");
        if (res.data && res.data.sections.length > 0) {
          setSections(res.data.sections);
        }
      } catch (error) {
        console.error("Error fetching about data:", error);
      }
    };
    fetchAboutData();
  }, []);

  const handleChange = (index, field, value) => {
    const updatedSections = [...sections];
    updatedSections[index][field] = value;
    setSections(updatedSections);
  };

  const handleFileChange = (index, file) => {
    setFiles((prev) => ({ ...prev, [index]: file }));

    const updatedSections = [...sections];
    updatedSections[index].imageUrl = URL.createObjectURL(file);
    setSections(updatedSections);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("data", JSON.stringify({ sections }));

      sections.forEach((section, index) => {
        if (files[index]) {
          formData.append("images", files[index]);
        }
      });

      await axios.put("process.env.VITE_API_URL/api/about", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("About page content saved successfully!");
    } catch (error) {
      console.error(error);
      alert("Error updating about page.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-about-container">
      <h2>About Page Settings</h2>

      {sections.map((section, index) => (
        <div key={index} className="admin-about-section">
          <h3>{section.title}</h3>

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

          {section.imageUrl && (
            <img
              src={
                section.imageUrl.startsWith("/uploads")
                  ? `process.env.VITE_API_URL${section.imageUrl}`
                  : section.imageUrl
              }
              alt={section.title}
              className="about-image-preview"
            />
          )}

          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(index, e.target.files[0])}
            className="about-file-input"
          />
        </div>
      ))}

      <button className="about-save-btn" onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
