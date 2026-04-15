import React, { useEffect, useState } from "react";
import "./ProductAdmin.css";
import axios from "axios";
import { apiUrl, assetUrl } from "../../utils/api";

const PRODUCT_CATEGORIES = [
  "Attars",
  "Perfume",
  "Premium",
  "Male",
  "Female",
  "Unisex",
  "Celebrity",
];

const NOTE_TYPES = [
  { key: "top", label: "Top Notes" },
  { key: "middle", label: "Middle Notes" },
  { key: "base", label: "Base Notes" },
];

const resolveImg = (url) => {
  if (!url) return null;
  return assetUrl(url);
};

const normalizeCategories = (category) => {
  if (Array.isArray(category)) {
    return category.filter(Boolean);
  }

  return [category].filter(Boolean);
};

const getCategorySummary = (category, limit = 2) => {
  const categories = normalizeCategories(category);

  if (categories.length === 0) {
    return "-";
  }

  if (categories.length <= limit) {
    return categories.join(", ");
  }

  return `${categories.slice(0, limit).join(", ")} +${categories.length - limit}`;
};

const getDescriptionPreview = (description, limit = 60) => {
  if (!description) return "No description added.";
  if (description.length <= limit) return description;

  return `${description.slice(0, limit).trimEnd()}...`;
};

const formatPrice = (price) => `Rs. ${Number(price || 0).toLocaleString()}`;

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

  const API_URL = apiUrl("/api/products");

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

  const resetForm = () => {
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
  };

  const closeProductModal = () => {
    setShowProductModal(false);
    setLoading(false);
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setSelectedProduct(null);
    resetForm();
    setShowProductModal(true);
  };

  const openEditModal = (product) => {
    setIsEditMode(true);
    setSelectedProduct(product);
    setFormData({
      name: product.name || "",
      category: normalizeCategories(product.category),
      price: product.price || "",
      description: product.description || "",
      image: null,
      notes: {
        top: (product.notes?.top || []).map((note) => ({
          name: note.name || "",
          image: null,
          imageUrl: note.imageUrl || "",
        })),
        middle: (product.notes?.middle || []).map((note) => ({
          name: note.name || "",
          image: null,
          imageUrl: note.imageUrl || "",
        })),
        base: (product.notes?.base || []).map((note) => ({
          name: note.name || "",
          image: null,
          imageUrl: note.imageUrl || "",
        })),
      },
    });
    setShowProductModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      setFormData((current) => ({ ...current, image: files[0] || null }));
      return;
    }

    setFormData((current) => ({ ...current, [name]: value }));
  };

  const toggleCategory = (category) => {
    setFormData((current) => {
      const hasCategory = current.category.includes(category);

      return {
        ...current,
        category: hasCategory
          ? current.category.filter((item) => item !== category)
          : [...current.category, category],
      };
    });
  };

  const handleNoteChange = (type, idx, value) => {
    setFormData((current) => ({
      ...current,
      notes: {
        ...current.notes,
        [type]: current.notes[type].map((note, noteIndex) =>
          noteIndex === idx ? { ...note, name: value } : note,
        ),
      },
    }));
  };

  const handleNoteImageChange = (type, idx, file) => {
    setFormData((current) => ({
      ...current,
      notes: {
        ...current.notes,
        [type]: current.notes[type].map((note, noteIndex) =>
          noteIndex === idx ? { ...note, image: file || null } : note,
        ),
      },
    }));
  };

  const addNoteField = (type) => {
    setFormData((current) => ({
      ...current,
      notes: {
        ...current.notes,
        [type]: [...current.notes[type], { name: "", image: null }],
      },
    }));
  };

  const removeNoteField = (type, idx) => {
    setFormData((current) => {
      const remainingNotes = current.notes[type].filter(
        (_, noteIndex) => noteIndex !== idx,
      );

      return {
        ...current,
        notes: {
          ...current.notes,
          [type]: remainingNotes.length
            ? remainingNotes
            : [{ name: "", image: null }],
        },
      };
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData();
    const notesPayload = {
      top: formData.notes.top.map((note) => ({
        name: note.name.trim(),
        imageUrl: note.imageUrl || "",
      })),
      middle: formData.notes.middle.map((note) => ({
        name: note.name.trim(),
        imageUrl: note.imageUrl || "",
      })),
      base: formData.notes.base.map((note) => ({
        name: note.name.trim(),
        imageUrl: note.imageUrl || "",
      })),
    };

    fd.append("notes", JSON.stringify(notesPayload));

    formData.notes.top.forEach((note) => {
      if (note.image) fd.append("topNotesImages", note.image);
    });

    formData.notes.middle.forEach((note) => {
      if (note.image) fd.append("middleNotesImages", note.image);
    });

    formData.notes.base.forEach((note) => {
      if (note.image) fd.append("baseNotesImages", note.image);
    });

    if (formData.image) {
      fd.append("image", formData.image);
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

      closeProductModal();
      fetchProducts();
    } catch (err) {
      console.error("Error saving product:", err.response?.data || err.message);
      alert("Error saving product");
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
    if (!url) return;

    setSelectedImage(url);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const normalizedCategory = categoryFilter.toLowerCase();

  const displayedProducts = products.filter((product) => {
    if (categoryFilter !== "All") {
      const categories = normalizeCategories(product.category);
      const matchesCategory = categories.some(
        (category) => category?.toLowerCase() === normalizedCategory,
      );

      if (!matchesCategory) return false;
    }

    if (!normalizedSearch) return true;

    const name = product.name?.toLowerCase() || "";
    const description = product.description?.toLowerCase() || "";
    const categories = normalizeCategories(product.category).join(" ").toLowerCase();

    return (
      name.includes(normalizedSearch) ||
      description.includes(normalizedSearch) ||
      categories.includes(normalizedSearch)
    );
  });

  const renderNoteSummary = (notes, compact = false) => {
    const validNotes = (notes || []).filter((note) => note?.name);
    const visibleNotes = validNotes.slice(0, compact ? 3 : 2);

    if (visibleNotes.length === 0) {
      return <span className="empty-note-copy">No notes added</span>;
    }

    return (
      <>
        {visibleNotes.map((note, index) => {
          const imageSrc = resolveImg(note.imageUrl);

          return (
            <div
              key={`${note.name}-${index}`}
              className={`note-item${compact ? " compact" : ""}`}
              title={note.name}
            >
              <div className="note-img-container">
                {imageSrc ? (
                  <img src={imageSrc} alt={note.name} className="note-img" />
                ) : (
                  <div className="note-placeholder">N</div>
                )}
              </div>
              <span className="note-name">{note.name}</span>
            </div>
          );
        })}
        {validNotes.length > visibleNotes.length && (
          <span className="more-notes">+{validNotes.length - visibleNotes.length} more</span>
        )}
      </>
    );
  };

  return (
    <main className="luxury-product-admin">
      <section className="admin-hero">
        <div className="hero-content">
          <h1 className="hero-title">Product Management</h1>
          <p className="hero-subtitle">Add, update, and remove products from any screen size.</p>
        </div>
      </section>

      <div className="admin-container">
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
                  placeholder="Search by name, description, or category"
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
                  {["All", ...PRODUCT_CATEGORIES].map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="top-right">
            <button
              type="button"
              className="luxury-btn primary large"
              onClick={openAddModal}
            >
              Add Product
            </button>
          </div>
        </div>

        <div className="table-container">
          {displayedProducts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">No products</div>
              <h3>{searchTerm || categoryFilter !== "All" ? "No matching products" : "No products yet"}</h3>
              <p>
                {searchTerm || categoryFilter !== "All"
                  ? "Try adjusting your search or category filter."
                  : "Get started by adding your first fragrance."}
              </p>
              <button type="button" className="luxury-btn primary" onClick={openAddModal}>
                Create Product
              </button>
            </div>
          ) : (
            <>
              <div className="table-wrapper desktop-table">
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
                      ].map((header) => (
                        <th key={header} className="table-header">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayedProducts.map((product) => {
                      const imageSrc = resolveImg(product.imageUrl);

                      return (
                        <tr key={product._id} className="table-row">
                          <td className="image-cell">
                            {imageSrc ? (
                              <button
                                type="button"
                                className="product-image-wrapper"
                                onClick={() => handleImageClick(imageSrc)}
                              >
                                <img
                                  src={imageSrc}
                                  alt={product.name}
                                  className="product-image"
                                />
                              </button>
                            ) : (
                              <div className="no-image">No image</div>
                            )}
                          </td>
                          <td className="name-cell">
                            <div className="product-name">{product.name}</div>
                          </td>
                          <td className="category-cell">{getCategorySummary(product.category)}</td>
                          <td className="price-cell">{formatPrice(product.price)}</td>
                          <td className="desc-cell" title={product.description || "No description added."}>
                            {getDescriptionPreview(product.description)}
                          </td>
                          {NOTE_TYPES.map(({ key }) => (
                            <td key={key} className="notes-cell">
                              {renderNoteSummary(product.notes?.[key] || [])}
                            </td>
                          ))}
                          <td className="actions-cell">
                            <div className="action-buttons">
                              <button
                                type="button"
                                className="luxury-btn secondary small"
                                onClick={() => openEditModal(product)}
                                title="Edit Product"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="luxury-btn danger small"
                                onClick={() => handleDelete(product._id)}
                                title="Delete Product"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mobile-products">
                {displayedProducts.map((product) => {
                  const imageSrc = resolveImg(product.imageUrl);
                  const productCategories = normalizeCategories(product.category);

                  return (
                    <article key={product._id} className="product-card">
                      <div className="product-card-header">
                        {imageSrc ? (
                          <button
                            type="button"
                            className="product-image-wrapper product-card-image-button"
                            onClick={() => handleImageClick(imageSrc)}
                          >
                            <img src={imageSrc} alt={product.name} className="product-image" />
                          </button>
                        ) : (
                          <div className="no-image product-card-image-fallback">No image</div>
                        )}

                        <div className="product-card-summary">
                          <div className="product-card-summary-top">
                            <h3 className="product-card-name">{product.name}</h3>
                            <span className="product-card-price">{formatPrice(product.price)}</span>
                          </div>

                          <div className="product-card-categories">
                            {(productCategories.length ? productCategories : ["Uncategorized"]).map(
                              (category) => (
                                <span key={`${product._id}-${category}`} className="category-pill">
                                  {category}
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                      </div>

                      <p className="product-card-description">{getDescriptionPreview(product.description, 140)}</p>

                      <div className="product-card-notes">
                        {NOTE_TYPES.map(({ key, label }) => (
                          <div key={key} className="product-card-note-group">
                            <span className="note-group-label">{label}</span>
                            <div className="note-summary compact">{renderNoteSummary(product.notes?.[key] || [], true)}</div>
                          </div>
                        ))}
                      </div>

                      <div className="product-card-actions">
                        <button
                          type="button"
                          className="luxury-btn secondary"
                          onClick={() => openEditModal(product)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="luxury-btn danger"
                          onClick={() => handleDelete(product._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {showProductModal && (
        <div className="luxury-modal" onClick={closeProductModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{isEditMode ? "Edit Product" : "Add Product"}</h3>
              <button type="button" className="modal-close" onClick={closeProductModal}>
                x
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
                  <label>Price (Rs.) *</label>
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
                  placeholder="Enter detailed product description"
                  maxLength={500}
                />
                <small>{formData.description.length}/500 characters</small>
              </div>

              <div className="form-group full">
                <label>Categories *</label>
                <p className="field-hint">Tap one or more categories to assign this product.</p>
                <div className="category-chip-grid">
                  {PRODUCT_CATEGORIES.map((category) => {
                    const selected = formData.category.includes(category);

                    return (
                      <label
                        key={category}
                        className={`category-chip${selected ? " active" : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleCategory(category)}
                        />
                        <span>{category}</span>
                      </label>
                    );
                  })}
                </div>
                <small>
                  {formData.category.length
                    ? `${formData.category.length} categor${formData.category.length === 1 ? "y" : "ies"} selected`
                    : "Select at least one category before saving."}
                </small>
              </div>

              <div className="form-group full">
                <label>{isEditMode ? "Update Image (optional)" : "Product Image"}</label>
                {isEditMode && selectedProduct?.imageUrl && (
                  <div className="current-image-preview">
                    <span>Current image</span>
                    <img src={resolveImg(selectedProduct.imageUrl)} alt="Current product" />
                  </div>
                )}
                <input
                  type="file"
                  name="image"
                  onChange={handleInputChange}
                  accept="image/*"
                />
                {formData.image && <small>Selected file: {formData.image.name}</small>}
              </div>

              <div className="notes-section">
                {NOTE_TYPES.map(({ key, label }) => (
                  <div key={key} className="notes-group">
                    <div className="notes-group-header">
                      <h4>{label}</h4>
                      <button
                        type="button"
                        className="add-note"
                        onClick={() => addNoteField(key)}
                      >
                        Add Note
                      </button>
                    </div>

                    {formData.notes[key].map((note, index) => (
                      <div key={`${key}-${index}`} className="note-editor">
                        <div className="note-editor-fields">
                          <input
                            type="text"
                            placeholder={`Enter ${label.toLowerCase()} name`}
                            value={note.name}
                            onChange={(e) => handleNoteChange(key, index, e.target.value)}
                            maxLength={50}
                          />

                          <div className="note-editor-upload">
                            {note.imageUrl && (
                              <img
                                src={resolveImg(note.imageUrl)}
                                alt="Current note"
                                className="note-preview"
                                title="Current image"
                              />
                            )}
                            <input
                              type="file"
                              onChange={(e) =>
                                handleNoteImageChange(key, index, e.target.files?.[0])
                              }
                              accept="image/*"
                            />
                          </div>
                          {note.image && <small>Selected file: {note.image.name}</small>}
                        </div>

                        <button
                          type="button"
                          className="remove-note"
                          onClick={() => removeNoteField(key, index)}
                          title="Remove this note"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="luxury-btn secondary"
                  onClick={closeProductModal}
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
                  {loading
                    ? isEditMode
                      ? "Updating..."
                      : "Creating..."
                    : isEditMode
                      ? "Update Product"
                      : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showImageModal && selectedImage && (
        <div className="luxury-modal" onClick={closeImageModal}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close" onClick={closeImageModal}>
              x
            </button>
            <img src={selectedImage} alt="Full size preview" />
          </div>
        </div>
      )}
    </main>
  );
}
