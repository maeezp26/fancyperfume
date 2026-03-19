import React, { useState, useEffect } from "react";
import "./ProductAdmin.css";
import axios from "axios";

export default function ProductAdmin() {
  const [products, setProducts] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [formData, setFormData] = useState({
    name: "",
    category: [],
    price: "",
    description: "",
    image: null,
    notes: {
      top: [{ name: "", image: null }],
      middle: [{ name: "", image: null }],
      base: [{ name: "", image: null }],
    },
  });

  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_URL = "http://localhost:5000/api/products";

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(API_URL);
      setProducts(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setSelectedProduct(null);
    setFormData({
      name: "",
      category: [],
      price: "",
      description: "",
      image: null,
      notes: {
        top: [{ name: "", image: null }],
        middle: [{ name: "", image: null }],
        base: [{ name: "", image: null }],
      },
    });
    setShowProductModal(true);
  };

  const openEditModal = (product) => {
    setIsEditMode(true);
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      category: Array.isArray(product.category) ? product.category : [],
      price: product.price || "",
      description: product.description || "",
      image: null,
      notes: {
        top: (product.notes?.top || []).map((n) => ({
          name: n.name || "",
          image: null,
          imageUrl: n.imageUrl || "",
        })),
        middle: (product.notes?.middle || []).map((n) => ({
          name: n.name || "",
          image: null,
          imageUrl: n.imageUrl || "",
        })),
        base: (product.notes?.base || []).map((n) => ({
          name: n.name || "",
          image: null,
          imageUrl: n.imageUrl || "",
        })),
      },
    });
    setShowProductModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      setFormData((f) => ({ ...f, image: files[0] || null }));
    } else if (name === "category") {
      const options = e.target.selectedOptions;
      const values = Array.from(options, (option) => option.value);
      setFormData((f) => ({ ...f, category: values }));
    } else {
      setFormData((f) => ({ ...f, [name]: value }));
    }
  };

  const handleNoteChange = (type, idx, value) => {
    setFormData((f) => {
      const updated = { ...f.notes };
      updated[type][idx].name = value;
      return { ...f, notes: updated };
    });
  };

  const handleNoteImageChange = (type, idx, file) => {
    setFormData((f) => {
      const updated = { ...f.notes };
      updated[type][idx].image = file || null;
      return { ...f, notes: updated };
    });
  };

  const addNoteField = (type) => {
    setFormData((f) => {
      const updated = { ...f.notes };
      updated[type].push({ name: "", image: null });
      return { ...f, notes: updated };
    });
  };

  const removeNoteField = (type, idx) => {
    setFormData((f) => {
      const updated = { ...f.notes };
      updated[type].splice(idx, 1);
      if (updated[type].length === 0) {
        updated[type] = [{ name: "", image: null }];
      }
      return { ...f, notes: updated };
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData();

    const notesPayload = {
      top: formData.notes.top.map((n) => ({
        name: n.name.trim(),
        imageUrl: n.imageUrl || "",
      })),
      middle: formData.notes.middle.map((n) => ({
        name: n.name.trim(),
        imageUrl: n.imageUrl || "",
      })),
      base: formData.notes.base.map((n) => ({
        name: n.name.trim(),
        imageUrl: n.imageUrl || "",
      })),
    };
    fd.append("notes", JSON.stringify(notesPayload));

  formData.notes.top.forEach((n) => {
  if (n.image) fd.append("topNotesImages", n.image);
});

formData.notes.middle.forEach((n) => {
  if (n.image) fd.append("middleNotesImages", n.image);
});

formData.notes.base.forEach((n) => {
  if (n.image) fd.append("baseNotesImages", n.image);
});


    if (formData.image) {
      fd.append("imageUrl", formData.image);
    }

    fd.append("name", formData.name.trim());
    fd.append("category", JSON.stringify(formData.category));
    fd.append("price", formData.price);
    fd.append("description", formData.description.trim());

    try {
      if (isEditMode && selectedProduct?._id) {
        await axios.put(`${API_URL}/${selectedProduct._id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post(API_URL, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      setShowProductModal(false);
      setFormData({
        name: "",
        category: [],
        price: "",
        description: "",
        image: null,
        notes: {
          top: [{ name: "", image: null }],
          middle: [{ name: "", image: null }],
          base: [{ name: "", image: null }],
        },
      });
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Error saving product. Please check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product permanently?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Error deleting product.");
    }
  };

  const handleImageClick = (url) => {
    setSelectedImage(url);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const normalizedCategory = categoryFilter.toLowerCase();

  const displayedProducts = products.filter((prod) => {
    if (categoryFilter !== "All") {
      const cat = Array.isArray(prod.category)
        ? prod.category
        : [prod.category].filter(Boolean);
      const matchesCategory = cat.some(
        (c) => c?.toLowerCase() === normalizedCategory
      );
      if (!matchesCategory) return false;
    }

    if (!normalizedSearch) return true;

    const name = prod.name?.toLowerCase() || "";
    const desc = prod.description?.toLowerCase() || "";
    const cats = Array.isArray(prod.category)
      ? prod.category.join(" ").toLowerCase()
      : (prod.category || "").toLowerCase();

    return (
      name.includes(normalizedSearch) ||
      desc.includes(normalizedSearch) ||
      cats.includes(normalizedSearch)
    );
  });

  return (
    <main className="luxury-product-admin">
      <section className="admin-hero">
        <div className="hero-content">
          <h1 className="hero-title">Product Management</h1>
          <p className="hero-subtitle">Control your fragrance catalog</p>
        </div>
      </section>

      <div className="admin-container">
        {/* TOP BAR: search + filter + count + add button */}
        <div className="admin-top-bar">
          <div className="top-left">
            <div className="products-count">
              <span className="count-number">{displayedProducts.length}</span>
              <span className="count-of">of</span>
              <span className="count-total">{products.length}</span>
              <span className="count-label">Products</span>
            </div>

            <div className="filters-inline">
              <div className="search-filter">
                <input
                  type="text"
                  placeholder="🔍 Search by name, description, category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="luxury-input"
                />
              </div>
              <div className="category-filter">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="luxury-select"
                >
                  {[
                    "All",
                    "Attars",
                    "Perfume",
                    "Premium",
                    "Male",
                    "Female",
                    "Unisex",
                    "Celebrity",
                  ].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="top-right">
            <button className="luxury-btn primary large" onClick={openAddModal}>
              ➕ Add New Product
            </button>
          </div>
        </div>

        {/* TABLE CARD */}
        <div className="table-container">
          {displayedProducts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>
                No Products{" "}
                {searchTerm || categoryFilter !== "All" ? "Match" : "Yet"}
              </h3>
              <p>
                {searchTerm || categoryFilter !== "All"
                  ? "Try adjusting your search or filters"
                  : "Get started by adding your first luxury fragrance"}
              </p>
              <button className="luxury-btn primary" onClick={openAddModal}>
                ➕ Create First Product
              </button>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="luxury-table">
                <thead>
                  <tr>
                    {[
                      "Preview",
                      "Name",
                      "Categories",
                      "Price",
                      "Description",
                      "Top Notes",
                      "Middle Notes",
                      "Base Notes",
                      "Actions",
                    ].map((h) => (
                      <th key={h} className="table-header">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayedProducts.map((prod) => (
                    <tr key={prod._id} className="table-row">
                      <td className="image-cell">
                        {prod.imageUrl ? (
                          <div
                            className="product-image-wrapper"
                            onClick={() =>
                              handleImageClick(
                                `http://localhost:5000${prod.imageUrl}`
                              )
                            }
                          >
                            <img
                              src={`http://localhost:5000${prod.imageUrl}`}
                              alt={prod.name}
                              className="product-image"
                            />
                          </div>
                        ) : (
                          <div className="no-image">No Image</div>
                        )}
                      </td>
                      <td className="name-cell">
                        <div className="product-name">{prod.name}</div>
                      </td>
                      <td className="category-cell">
                        {Array.isArray(prod.category)
                          ? prod.category.slice(0, 2).join(", ") +
                            (prod.category.length > 2
                              ? ` +${prod.category.length - 2}`
                              : "")
                          : prod.category || "—"}
                      </td>
                      <td className="price-cell">
                        ₹{Number(prod.price || 0).toLocaleString()}
                      </td>
                      <td className="desc-cell" title={prod.description}>
                        {(prod.description || "—").substring(0, 60)}...
                      </td>
                      {["top", "middle", "base"].map((type) => (
                        <td key={type} className="notes-cell">
                          {(prod.notes?.[type] || [])
                            .slice(0, 2)
                            .map((n, i) => (
                              <div
                                key={i}
                                className="note-item"
                                title={n.name}
                              >
                                <div className="note-img-container">
                                  {n.imageUrl ? (
                                    <img
                                      src={`http://localhost:5000${n.imageUrl}`}
                                      alt={n.name}
                                      className="note-img"
                                    />
                                  ) : (
                                    <div className="note-placeholder">📄</div>
                                  )}
                                </div>
                                <span className="note-name">{n.name}</span>
                              </div>
                            ))}
                          {(prod.notes?.[type] || []).length > 2 && (
                            <span className="more-notes">
                              +{prod.notes[type].length - 2} more
                            </span>
                          )}
                        </td>
                      ))}
                      <td className="actions-cell">
                        <div className="action-buttons">
                          <button
                            className="luxury-btn secondary small"
                            onClick={() => openEditModal(prod)}
                            title="Edit Product"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="luxury-btn danger small"
                            onClick={() => handleDelete(prod._id)}
                            title="Delete Product"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <div className="luxury-modal" onClick={() => setShowProductModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{isEditMode ? "✏️ Edit Product" : "➕ Add New Product"}</h3>
              <button
                className="modal-close"
                onClick={() => setShowProductModal(false)}
              >
                ×
              </button>
            </div>

            <form className="luxury-form" onSubmit={handleFormSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="form-group full">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Enter detailed product description..."
                  maxLength={500}
                />
                <small>{formData.description.length}/500 characters</small>
              </div>

              <div className="form-group">
                <label>Categories * (Hold Ctrl/Cmd to select multiple)</label>
                <select
                  name="category"
                  multiple
                  value={formData.category}
                  onChange={handleInputChange}
                  size="6"
                  required
                >
                  {[
                    "Attars",
                    "Perfume",
                    "Premium",
                    "Male",
                    "Female",
                    "Unisex",
                    "Celebrity",
                  ].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>
                  {isEditMode ? "Update Image (optional)" : "Product Image"}
                </label>
                {isEditMode && selectedProduct?.imageUrl && (
                  <div className="current-image-preview">
                    <span>Current Image:</span>
                    <img
                      src={`http://localhost:5000${selectedProduct.imageUrl}`}
                      alt="Current"
                    />
                  </div>
                )}
                <input
                  type="file"
                  name="image"
                  onChange={handleInputChange}
                  accept="image/*"
                />
              </div>

              <div className="notes-section">
                {["top", "middle", "base"].map((type) => (
                  <div key={type} className="notes-group">
                    <h4>{type.charAt(0).toUpperCase() + type.slice(1)} Notes</h4>
                    {formData.notes[type].map((n, i) => (
                      <div key={i} className="note-editor">
                        <input
                          type="text"
                          placeholder={`Enter ${type} note name`}
                          value={n.name}
                          onChange={(e) =>
                            handleNoteChange(type, i, e.target.value)
                          }
                          maxLength={50}
                        />
                        {n.imageUrl && (
                          <img
                            src={`http://localhost:5000${n.imageUrl}`}
                            alt="Current note"
                            className="note-preview"
                            title="Current image"
                          />
                        )}
                        <input
                          type="file"
                          onChange={(e) =>
                            handleNoteImageChange(
                              type,
                              i,
                              e.target.files[0]
                            )
                          }
                          accept="image/*"
                        />
                        <button
                          type="button"
                          className="remove-note"
                          onClick={() => removeNoteField(type, i)}
                          title="Remove this note"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="add-note"
                      onClick={() => addNoteField(type)}
                    >
                      ➕ Add {type.charAt(0).toUpperCase() + type.slice(1)} Note
                    </button>
                  </div>
                ))}
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="luxury-btn secondary"
                  onClick={() => setShowProductModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="luxury-btn primary large"
                  disabled={
                    loading ||
                    !formData.name ||
                    !formData.price ||
                    formData.category.length === 0
                  }
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      {isEditMode ? "Updating..." : "Creating..."}
                    </>
                  ) : isEditMode ? (
                    "✅ Update Product"
                  ) : (
                    "➕ Create Product"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showImageModal && selectedImage && (
        <div className="luxury-modal" onClick={closeImageModal}>
          <div
            className="image-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={closeImageModal}>
              ×
            </button>
            <img src={selectedImage} alt="Full size preview" />
          </div>
        </div>
      )}
    </main>
  );
}
