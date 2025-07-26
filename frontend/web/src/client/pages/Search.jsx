import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';

const Search = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const searchTerm = params.get('q') || '';
    const category = params.get('category') || '';
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError('');
            try {
                const query = [];
                if (searchTerm) query.push(`search=${encodeURIComponent(searchTerm)}`);
                if (category) query.push(`category=${category}`);
                const res = await axios.get(`http://localhost:5000/api/products?${query.join('&')}`);
                setProducts(res.data);
            } catch (err) {
                setError('Lỗi khi tải sản phẩm');
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [searchTerm, category]);

    return (
        <div className="container" style={{ minHeight: 400, padding: '32px 0' }}>
            <h2 style={{ marginBottom: 24 }}>Kết quả tìm kiếm</h2>
            {loading ? (
                <div>Đang tải sản phẩm...</div>
            ) : error ? (
                <div style={{ color: 'red' }}>{error}</div>
            ) : products.length === 0 ? (
                <div>Không tìm thấy sản phẩm phù hợp.</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24 }}>
                    {products.map(product => (
                        <Link to={`/products/${product._id}`} key={product._id} style={{ textDecoration: 'none', color: '#222', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee', padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <img src={product.images?.[0]?.url || product.images?.[0] || '/assets/img/no-image.png'} alt={product.name} style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 6, marginBottom: 12, background: '#f5f5f5' }} />
                            <div style={{ fontWeight: 500, marginBottom: 6, textAlign: 'center' }}>{product.name}</div>
                            <div style={{ color: '#1976d2', fontWeight: 600 }}>{product.price?.toLocaleString('vi-VN')}₫</div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Search; 