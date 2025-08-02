import React, { useEffect, useState } from "react";
import axios from "axios";

const ProductTest = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                console.log('Fetching products...');
                const response = await axios.get('http://localhost:5000/api/products?activeOnly=true');
                console.log('Products response:', response.data);
                setProducts(response.data);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h2>Product Debug Test</h2>
            <p>Found {products.length} products</p>
            {products.slice(0, 3).map(product => (
                <div key={product._id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
                    <h3>{product.name}</h3>
                    <p>Price: {product.price}</p>
                    <p>Rating: {product.rating || 'No rating'}</p>
                    <p>Review Count: {product.reviewCount || 0}</p>
                    <p>Active: {product.isActive ? 'Yes' : 'No'}</p>
                    {product.images && product.images.length > 0 && (
                        <img src={product.images[0]} alt={product.name} style={{ width: '100px', height: '100px' }} />
                    )}
                </div>
            ))}
        </div>
    );
};

export default ProductTest;
