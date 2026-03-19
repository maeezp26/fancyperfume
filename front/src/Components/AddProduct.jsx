import React, { useState } from "react";
import axios from 'axios';
import './css/AddProduct.css'; // Assuming you will style this form

const AddProduct = () => {
  const [product, setProduct] = useState({
    name: '',
    category: '',
    price: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', product.name);
    formData.append('category', product.category);
    formData.append('price', product.price);
    formData.append('image', selectedFile);

<<<<<<< HEAD
    axios.post('http://localhost:5000/addProduct', formData)
=======
    axios.post('import.meta.env.VITE_API_URL/addProduct', formData)
>>>>>>> 9a6e6a0cd91a21814504d1c7ca7d99642391e9b9
      .then(response => {
        console.log("Product added successfully", response);
        alert("Product Added");
        // Optionally reset the form here
      })
      .catch(error => {
        console.log("Error adding product", error);
      });
  };

  return (
    <div className="add-product-container">
      <h2>Add New Perfume</h2>
      <form onSubmit={handleSubmit} className="add-product-form">
        <label>Perfume Name:</label>
        <input type="text" name="name" value={product.name} onChange={handleChange} required />

        <label>Category:</label>
        <input type="text" name="category" value={product.category} onChange={handleChange} required />

        <label>Price:</label>
        <input type="number" name="price" value={product.price} onChange={handleChange} required />

        <label>Image:</label>
        <input type="file" onChange={handleFileChange} required />

        <button type="submit">Add Perfume</button>
      </form>
    </div>
  );
};

export default AddProduct;
