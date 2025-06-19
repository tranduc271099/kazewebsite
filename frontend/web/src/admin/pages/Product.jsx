import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../ProductLayout.module.css';

const Product = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
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
        <div>
            <div className={styles.card}>
                <div className={styles.header}>Thêm sản phẩm mới</div>
                <form onSubmit={handleSubmit}>
                    <div className={styles.sectionTitle}>Thông tin cơ bản</div>
                    <div className={styles.formGrid3}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Tên sản phẩm</label>
                            <input className={styles.input} type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Nhập tên sản phẩm" />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Thương hiệu</label>
                            <input className={styles.input} type="text" name="brand" value={formData.brand} onChange={handleChange} placeholder="Nhập thương hiệu" />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Giá niêm yết</label>
                            <input className={styles.input} type="number" name="price" value={formData.price} onChange={handleChange} placeholder="Nhập giá sản phẩm" />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Tồn kho</label>
                            <input className={styles.input} type="number" name="stock" value={formData.stock} onChange={handleChange} placeholder="Nhập tồn kho" />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Danh mục</label>
                            <select className={styles.select} name="category" value={formData.category} onChange={handleChange} required>
                                <option value="">Chọn danh mục</option>
                                {categories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Công khai</label>
                            <select className={styles.select} name="isActive" value={formData.isActive} onChange={handleChange}>
                                <option value={true}>Có</option>
                                <option value={false}>Không</option>
                            </select>
                        </div>
                    </div>
                    <div className={styles.sectionTitle}>Ảnh sản phẩm</div>
                    <div className={styles.formGrid2}>
                        <div className={styles.formGroup}>
                            <input className={styles.input} type="file" multiple onChange={handleImageChange} />
                        </div>
                    </div>
                    <div className={styles.sectionTitle}>Thuộc tính sản phẩm</div>
                    <div className={styles.formGrid2}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Size (cách nhau bởi dấu phẩy)</label>
                            <input className={styles.input} type="text" name="attributes.sizes" value={formData.attributes.sizes.join(', ')} onChange={handleChange} placeholder="VD: S, M, L, XL" />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Màu sắc (cách nhau bởi dấu phẩy)</label>
                            <input className={styles.input} type="text" name="attributes.colors" value={formData.attributes.colors.join(', ')} onChange={handleChange} placeholder="VD: Đỏ, Xanh, Đen" />
                        </div>
                    </div>
                    <div className={styles.sectionTitle}>Biến thể sản phẩm</div>
                    <div className={styles.formGrid2}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Size</label>
                            <input className={styles.input} type="text" name="attributes.size" value={currentVariant.attributes.size} onChange={handleVariantChange} placeholder="Nhập size" />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Màu</label>
                            <input className={styles.input} type="text" name="attributes.color" value={currentVariant.attributes.color} onChange={handleVariantChange} placeholder="Nhập màu" />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Tồn kho</label>
                            <input className={styles.input} type="number" name="stock" value={currentVariant.stock} onChange={handleVariantChange} placeholder="Tồn kho" />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Giá</label>
                            <input className={styles.input} type="number" name="price" value={currentVariant.price} onChange={handleVariantChange} placeholder="Giá" />
                        </div>
                        <div className={styles.formGroup}>
                            <input className={styles.input} type="file" multiple onChange={handleVariantImageChange} />
                        </div>
                        <div className={styles.formGroup}>
                            <button type="button" className={styles.btnPrimary} onClick={addVariant}>Thêm biến thể</button>
                        </div>
                    </div>
                    <div className={styles.formGrid}>
                        {formData.variants.length > 0 && (
                            <div className={styles.formGroup} style={{ width: '100%' }}>
                                <div>Danh sách biến thể:</div>
                                <ul>
                                    {formData.variants.map((v, idx) => (
                                        <li key={idx} style={{ marginBottom: 4 }}>
                                            Size: {v.attributes.size}, Màu: {v.attributes.color}, Giá: {v.price}, Tồn kho: {v.stock}
                                            <button type="button" className={styles.actionBtn + ' ' + styles.deleteBtn} onClick={() => removeVariant(idx)}>Xóa</button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                    <div className={styles.btnRow}>
                        <button type="submit" className={styles.btnPrimary} disabled={loading}>
                            {loading ? 'Đang xử lý...' : editingId ? 'Cập nhật' : 'Lưu sản phẩm'}
                        </button>
                    </div>
                </form>
            </div>
            <div className={styles.tableCard}>
                <div className={styles.tableTitle}>Danh sách sản phẩm</div>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Ảnh</th>
                            <th>Tên sản phẩm</th>
                            <th>Thương hiệu</th>
                            <th>Mô tả</th>
                            <th>Danh mục</th>
                            <th>Giá</th>
                            <th>Tồn kho</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product._id}>
                                <td>
                                    {product.images && product.images.length > 0 && (
                                        <img src={product.images[0]} alt="Ảnh" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} />
                                    )}
                                </td>
                                <td>{product.name}</td>
                                <td>{product.brand}</td>
                                <td>{product.description}</td>
                                <td>{categories.find(c => c._id === product.category)?.name || ''}</td>
                                <td>{product.price}</td>
                                <td>{product.stock}</td>
                                <td>{product.isActive ? 'Công khai' : 'Ẩn'}</td>
                                <td>
                                    <button className={styles.actionBtn + ' ' + styles.editBtn} onClick={() => handleEdit(product)}>Sửa</button>
                                    <button className={styles.actionBtn + ' ' + styles.deleteBtn} onClick={() => handleDelete(product._id)}>Xóa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Product; 