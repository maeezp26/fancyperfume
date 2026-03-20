import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const UpdateProduct = () => {
    const { id } = useParams(); // Get the product ID from the URL
    const [product, setProduct] = useState({
        name: '',
        category: '',
        price: '',
        image: null,
    });

    useEffect(() => {
        // Fetch the product details
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/products/${id}`);
                setProduct(response.data);
            } catch (error) {
                console.error("Error fetching product:", error);
            }
        };

        fetchProduct();
    }, [id]); // Dependency on 'id' to fetch when it changes

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', product.name);
        formData.append('category', product.category);
        formData.append('price', product.price);
        if (product.image) {
            formData.append('image', product.image); // Include image if it is uploaded
        }
    
        try {
            const response = await axios.put(`${import.meta.env.VITE_API_URL}/products/update/${id}`, formData);
            alert('Product updated successfully!');
        } catch (error) {
            console.error("Error updating product:", error);
        }
    };
    

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={product.name}
                onChange={(e) => setProduct({ ...product, name: e.target.value })}
                placeholder="Product Name"
                required
            />
            <input
                type="text"
                value={product.category}
                onChange={(e) => setProduct({ ...product, category: e.target.value })}
                placeholder="Category"
                required
            />
            <input
                type="number"
                value={product.price}
                onChange={(e) => setProduct({ ...product, price: e.target.value })}
                placeholder="Price"
                required
            />
            <input
                type="file"
                onChange={(e) => setProduct({ ...product, image: e.target.files[0] })}
            />
            <button type="submit">Update Product</button>
        </form>
    );
};

export default UpdateProduct;
