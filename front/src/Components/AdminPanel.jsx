import React, { useState, useEffect } from 'react';
import './css/AdminPanel.css';

export default function AdminPanel() {
  const [selectedSection, setSelectedSection] = useState('home');
  const [feedbackData, setFeedbackData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', image: null });

  useEffect(() => {
    // Fetch Feedback Data
<<<<<<< HEAD
    fetch('import.meta.env.VITE_API_URL/api/feedback')
=======
    fetch('import.meta.env.VITE_API_URL/api/feedback')
>>>>>>> 9a6e6a0cd91a21814504d1c7ca7d99642391e9b9
      .then((response) => response.json())
      .then((data) => setFeedbackData(data))
      .catch((error) => console.error(error));

    // Fetch Product Data (latest products)
<<<<<<< HEAD
    fetch('import.meta.env.VITE_API_URL/api/products')
=======
    fetch('import.meta.env.VITE_API_URL/api/products')
>>>>>>> 9a6e6a0cd91a21814504d1c7ca7d99642391e9b9
      .then((response) => response.json())
      .then((data) => setProductData(data))
      .catch((error) => console.error(error));
  }, []);

  const handleFileChange = (e) => {
    setNewProduct({ ...newProduct, image: e.target.files[0] });
  };

  const handleProductSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', newProduct.name);
    formData.append('image', newProduct.image);

<<<<<<< HEAD
    fetch('import.meta.env.VITE_API_URL/api/products', {
=======
    fetch('import.meta.env.VITE_API_URL/api/products', {
>>>>>>> 9a6e6a0cd91a21814504d1c7ca7d99642391e9b9
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((product) => {
        setProductData([...productData, product]); // Add the new product to the list
        setNewProduct({ name: '', image: null });
      })
      .catch((error) => console.error(error));
  };

  const handleDeleteProduct = (id) => {
<<<<<<< HEAD
    fetch(`import.meta.env.VITE_API_URL/api/products/${id}`, {
=======
    fetch(`import.meta.env.VITE_API_URL/api/products/${id}`, {
>>>>>>> 9a6e6a0cd91a21814504d1c7ca7d99642391e9b9
      method: 'DELETE',
    })
      .then(() => setProductData(productData.filter((product) => product._id !== id)))
      .catch((error) => console.error(error));
  };

  return (
    <div className="admin-fancy-panel">
      <div className="sidebar-fancy">
        <button className="sidebar-button-fancy" onClick={() => setSelectedSection('home')}>Home Page Data</button>
        <button className="sidebar-button-fancy" onClick={() => setSelectedSection('feedback')}>Feedback Data</button>
      </div>

      <div className="content-fancy">
        {selectedSection === 'home' && (
          <div id="home-data-fancy">
            <h3 className="header-fancy">Manage Home Page Data</h3>

            <form className="form-fancy" onSubmit={handleProductSubmit}>
              <label>
                Product Name:
                <input
                  className="input-fancy"
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  required
                />
              </label>

              <label>
                Product Image:
                <input className="input-fancy" type="file" onChange={handleFileChange} required />
              </label>

              <button className="button-fancy" type="submit">Add Product</button>
            </form>

            <table className="table-fancy">
              <thead>
                <tr>
                  <th className="table-header-fancy">Product Name</th>
                  <th className="table-header-fancy">Product Image</th>
                  <th className="table-header-fancy">Actions</th>
                </tr>
              </thead>
              <tbody>
                {productData.map((product) => (
                  <tr key={product._id}>
                    <td className="table-cell-fancy">{product.name}</td>
                    <td className="table-cell-fancy">
                      <img
                        className="image-fancy"
<<<<<<< HEAD
                        src={`import.meta.env.VITE_API_URL/uploads/${product.image}`}
=======
                        src={`import.meta.env.VITE_API_URL/uploads/${product.image}`}
>>>>>>> 9a6e6a0cd91a21814504d1c7ca7d99642391e9b9
                        alt={product.name}
                      />
                    </td>
                    <td className="table-cell-fancy">
                      <button className="button-fancy" onClick={() => handleDeleteProduct(product._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedSection === 'feedback' && (
          <div id="feedback-data-fancy">
            <h3 className="header-fancy">Feedback Data</h3>
            <table className="table-fancy">
              <thead>
                <tr>
                  <th className="table-header-fancy">Name</th>
                  <th className="table-header-fancy">Email/Phone</th>
                  <th className="table-header-fancy">City</th>
                  <th className="table-header-fancy">Feedback</th>
                  <th className="table-header-fancy">Rating</th>
                </tr>
              </thead>
              <tbody>
                {feedbackData.map((feedback) => (
                  <tr key={feedback._id}>
                    <td className="table-cell-fancy">{feedback.name}</td>
                    <td className="table-cell-fancy">{feedback.emailPhone}</td>
                    <td className="table-cell-fancy">{feedback.city}</td>
                    <td className="table-cell-fancy">{feedback.message}</td>
                    <td className="table-cell-fancy">{'★'.repeat(feedback.rating)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
