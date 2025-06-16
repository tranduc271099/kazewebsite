import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Product.css';

const Product = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        brand: '',
        category: '',
        price: '',
        stock: '',
        isActive: true,
        attributes: {
            sizes: [],
            colors: []
        },
        variants: [],
        images: []
    });
    const [imageFiles, setImageFiles] = useState([]);
    const [currentVariant, setCurrentVariant] = useState({
        attributes: { size: '', color: '' },
        stock: '',
        price: '',
        images: []
    });

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/products', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProducts(response.data);
        } catch (error) {
            setError('Lỗi khi tải danh sách sản phẩm');
        }
    };

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/categories', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCategories(response.data);
        } catch (error) {
            setError('Lỗi khi tải danh mục');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value.split(',').map(item => item.trim())
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleVariantChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('attributes.')) {
            const attrKey = name.split('.')[1];
            setCurrentVariant(prev => ({
                ...prev,
                attributes: {
                    ...prev.attributes,
                    [attrKey]: value
                }
            }));
        } else {
            setCurrentVariant(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const addVariant = () => {
        if (!currentVariant.attributes.color || !currentVariant.attributes.size || !currentVariant.stock || !currentVariant.price) {
            setError('Vui lòng điền đầy đủ thông tin biến thể');
            return;
        }
        setFormData(prev => ({
            ...prev,
            variants: [...prev.variants, currentVariant]
        }));
        setCurrentVariant({
            attributes: { size: '', color: '' },
            stock: '',
            price: '',
            images: []
        });
    };

    const removeVariant = (index) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index)
        }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImageFiles(files);
        setFormData(prev => ({
            ...prev,
            images: files.map(file => URL.createObjectURL(file))
        }));
    };

    const handleRemoveImage = (idx) => {
        if (imageFiles.length > 0) {
            setImageFiles(prev => prev.filter((_, i) => i !== idx));
            setFormData(prev => ({
                ...prev,
                images: prev.images.filter((_, i) => i !== idx)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                images: prev.images.filter((_, i) => i !== idx)
            }));
        }
    };

    const handleVariantImageChange = (e) => {
        const files = Array.from(e.target.files);
        setCurrentVariant(prev => ({
            ...prev,
            images: files.map(file => URL.createObjectURL(file))
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const formDataToSend = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'attributes' || key === 'variants') {
                    formDataToSend.append(key, JSON.stringify(formData[key]));
                } else {
                    formDataToSend.append(key, formData[key]);
                }
            });

            imageFiles.forEach(file => {
                formDataToSend.append('images', file);
            });

            if (editingId) {
                await axios.put(`http://localhost:5000/api/products/${editingId}`, formDataToSend, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post('http://localhost:5000/api/products', formDataToSend, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            fetchProducts();
            resetForm();
        } catch (error) {
            setError(error.response?.data?.message || 'Lỗi khi lưu sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product) => {
        setEditingId(product._id);
        setFormData({
            name: product.name,
            description: product.description,
            brand: product.brand,
            category: product.category?._id || '',
            attributes: {
                sizes: product.attributes?.sizes || [],
                colors: product.attributes?.colors || []
            },
            variants: product.variants || [],
            images: product.images || [],
            price: product.price,
            stock: product.stock,
            isActive: product.isActive
        });
        setImageFiles([]);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5000/api/products/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchProducts();
            } catch (error) {
                setError('Lỗi khi xóa sản phẩm');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            brand: '',
            category: '',
            price: '',
            stock: '',
            isActive: true,
            attributes: {
                sizes: [],
                colors: []
            },
            variants: [],
            images: []
        });
        setEditingId(null);
        setImageFiles([]);
    };

    // Hàm tạo tất cả biến thể dựa trên attributes
    const generateAllVariants = () => {
        const sizes = formData.attributes.sizes || [];
        const colors = formData.attributes.colors || [];
        const newVariants = [];
        sizes.forEach(size => {
            colors.forEach(color => {
                newVariants.push({
                    attributes: { size, color },
                    stock: 10, // mặc định
                    price: formData.price || 0, // mặc định lấy giá chung
                    images: []
                });
            });
        });
        setFormData(prev => ({
            ...prev,
            variants: newVariants
        }));
    };

    return (
        <div className="content-inner">
            <div className="product-container">
                <h2>{editingId ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
                {error && <div className="product-error">{error}</div>}

                <form onSubmit={handleSubmit} className="product-form">
                    <h3>Thông tin cơ bản</h3>
                    <div className="form-group">
                        <label>Tên sản phẩm</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Nhập tên sản phẩm" />
                    </div>
                    <div className="form-group">
                        <label>Thương hiệu</label>
                        <input type="text" name="brand" value={formData.brand} onChange={handleChange} placeholder="Nhập thương hiệu sản phẩm" />
                    </div>
                    <div className="form-group">
                        <label>Mô tả</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Nhập mô tả sản phẩm" />
                    </div>
                    <div className="form-group">
                        <label>Danh mục</label>
                        <select name="category" value={formData.category} onChange={handleChange}>
                            <option value="">Chọn danh mục</option>
                            {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Giá mặc định</label>
                        <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="Nhập giá sản phẩm" />
                    </div>
                    <div className="form-group">
                        <label>Tồn kho tổng</label>
                        <input type="number" name="stock" value={formData.stock} onChange={handleChange} placeholder="Nhập tồn kho tổng" />
                    </div>
                    <div className="form-group">
                        <label>Đang bán</label>
                        <input type="checkbox" name="isActive" checked={formData.isActive} onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked }))} />
                    </div>

                    <h3>Ảnh sản phẩm</h3>
                    <div className="form-group">
                        <input type="file" multiple accept="image/*" onChange={handleImageChange} />
                        {formData.images && formData.images.length > 0 && (
                            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                {formData.images.map((img, idx) => (
                                    <img key={idx} src={img} alt="product" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />
                                ))}
                            </div>
                        )}
                    </div>

                    <h3>Thuộc tính sản phẩm</h3>
                    <div className="form-group">
                        <label>Size (VD: S, M, L, XL)</label>
                        <input type="text" name="attributes.sizes" value={formData.attributes.sizes.join(', ')} onChange={handleChange} placeholder="Nhập các size, cách nhau bởi dấu phẩy" />
                    </div>
                    <div className="form-group">
                        <label>Màu sắc (VD: Đỏ, Xanh, Đen)</label>
                        <input type="text" name="attributes.colors" value={formData.attributes.colors.join(', ')} onChange={handleChange} placeholder="Nhập các màu, cách nhau bởi dấu phẩy" />
                    </div>
                    <button type="button" onClick={generateAllVariants} style={{ marginBottom: 10 }}>Tạo tất cả biến thể</button>

                    <h3>Biến thể sản phẩm</h3>
                    <table className="variant-table">
                        <thead>
                            <tr>
                                <th>Size</th>
                                <th>Màu</th>
                                <th>Giá</th>
                                <th>Tồn kho</th>
                                <th>Ảnh</th>
                                <th>Xóa</th>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.variants.map((variant, index) => (
                                <tr key={index}>
                                    <td>{variant.attributes.size}</td>
                                    <td>{variant.attributes.color}</td>
                                    <td><input type="number" value={variant.price} onChange={e => {
                                        const value = e.target.value;
                                        setFormData(prev => {
                                            const newVariants = [...prev.variants];
                                            newVariants[index].price = value;
                                            return { ...prev, variants: newVariants };
                                        });
                                    }} style={{ width: 80 }} /></td>
                                    <td><input type="number" value={variant.stock} onChange={e => {
                                        const value = e.target.value;
                                        setFormData(prev => {
                                            const newVariants = [...prev.variants];
                                            newVariants[index].stock = value;
                                            return { ...prev, variants: newVariants };
                                        });
                                    }} style={{ width: 60 }} /></td>
                                    <td>{variant.images && variant.images.length > 0 && (
                                        <div style={{ display: 'flex', gap: 4 }}>
                                            {variant.images.map((img, idx) => (
                                                <img key={idx} src={img} alt="variant" style={{ width: 24, height: 24, objectFit: 'cover', borderRadius: 4 }} />
                                            ))}
                                        </div>
                                    )}</td>
                                    <td><button type="button" onClick={() => removeVariant(index)}>Xóa</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ display: 'flex', gap: 8, marginTop: 16, alignItems: 'center' }}>
                        <input type="text" name="attributes.size" value={currentVariant.attributes.size} onChange={handleVariantChange} placeholder="Size" style={{ width: 60 }} />
                        <input type="text" name="attributes.color" value={currentVariant.attributes.color} onChange={handleVariantChange} placeholder="Màu" style={{ width: 80 }} />
                        <input type="number" name="price" value={currentVariant.price} onChange={handleVariantChange} placeholder="Giá" style={{ width: 80 }} />
                        <input type="number" name="stock" value={currentVariant.stock} onChange={handleVariantChange} placeholder="Tồn kho" style={{ width: 60 }} />
                        <input type="file" multiple accept="image/*" onChange={handleVariantImageChange} />
                        <button type="button" onClick={addVariant}>Thêm biến thể</button>
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 24 }}>Lưu sản phẩm</button>
                </form>

                <div className="product-list">
                    <h3>Danh sách sản phẩm</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Ảnh</th>
                                <th>Tên sản phẩm</th>
                                <th>Thương hiệu</th>
                                <th>Danh mục</th>
                                <th>Giá</th>
                                <th>Tồn kho</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product._id}>
                                    <td>
                                        {product.images && product.images.length > 0 && (
                                            <img
                                                src={product.images[0]}
                                                alt="Ảnh"
                                                style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 6 }}
                                            />
                                        )}
                                    </td>
                                    <td>{product.name}</td>
                                    <td>{product.brand}</td>
                                    <td>{product.category?.name}</td>
                                    <td>{product.price}</td>
                                    <td>{product.stock}</td>
                                    <td>{product.isActive ? 'Đang bán' : 'Ngừng bán'}</td>
                                    <td>
                                        <button
                                            className="btn-edit"
                                            onClick={() => handleEdit(product)}
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            className="btn-delete"
                                            onClick={() => handleDelete(product._id)}
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Product; 