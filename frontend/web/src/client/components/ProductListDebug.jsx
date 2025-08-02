import React, { useEffect, useState } from "react";
import axios from "axios";

const ProductListDebug = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [debugInfo, setDebugInfo] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log('🔄 Starting fetch...');
                setDebugInfo(prev => ({ ...prev, fetchStart: new Date().toISOString() }));

                const response = await axios.get('http://localhost:5000/api/products?activeOnly=true');

                console.log('✅ API Response:', response.status);
                console.log('📦 Products received:', response.data.length);

                setProducts(response.data);
                setDebugInfo(prev => ({
                    ...prev,
                    fetchEnd: new Date().toISOString(),
                    productsCount: response.data.length,
                    apiStatus: response.status
                }));

            } catch (err) {
                console.error('❌ Fetch error:', err);
                setError(err.message);
                setDebugInfo(prev => ({
                    ...prev,
                    fetchEnd: new Date().toISOString(),
                    error: err.message,
                    errorDetails: err.response?.data || 'No response data'
                }));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div style={{ padding: '20px', fontFamily: 'monospace' }}>
            <h2>🔧 ProductList Debug Panel</h2>

            <div style={{ background: '#f0f0f0', padding: '15px', marginBottom: '20px', borderRadius: '5px' }}>
                <h3>Debug Info:</h3>
                <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>

            <div style={{ background: loading ? '#fff3cd' : error ? '#f8d7da' : '#d4edda', padding: '10px', marginBottom: '20px', borderRadius: '5px' }}>
                <h3>Status:</h3>
                <p>Loading: {loading ? 'Yes' : 'No'}</p>
                <p>Error: {error || 'None'}</p>
                <p>Products loaded: {products.length}</p>
            </div>

            {loading && <div>⏳ Loading products...</div>}
            {error && <div style={{ color: 'red' }}>❌ Error: {error}</div>}

            {!loading && !error && (
                <>
                    <h3>📦 Products ({products.length}):</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
                        {products.slice(0, 8).map((product, index) => (
                            <div key={product._id} style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '5px' }}>
                                <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>{product.name}</h4>
                                <p><strong>Price:</strong> {product.price?.toLocaleString()} ₫</p>
                                <p><strong>Rating:</strong> {product.rating || 'None'} ({product.reviewCount || 0} reviews)</p>
                                <p><strong>Active:</strong> {product.isActive ? '✅' : '❌'}</p>
                                <p><strong>Images:</strong> {product.images?.length || 0}</p>
                                <p><strong>Category:</strong> {product.category?.name || 'None'}</p>
                                {product.images && product.images[0] && (
                                    <img
                                        src={product.images[0].startsWith('/uploads/')
                                            ? `http://localhost:5000${product.images[0]}`
                                            : product.images[0]
                                        }
                                        alt={product.name}
                                        style={{ width: '60px', height: '60px', objectFit: 'cover', marginTop: '8px' }}
                                        onError={(e) => {
                                            console.log('Image error for:', product.name, e.target.src);
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default ProductListDebug;
