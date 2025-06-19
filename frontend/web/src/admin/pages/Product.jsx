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
    const [editingVariantIdx, setEditingVariantIdx] = useState(null);
    const [editingVariant, setEditingVariant] = useState(null);

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

    // Hàm upload ảnh lên server
    const uploadImage = async (file) => {
        const formData = new FormData();
        formData.append('images', file);
        const token = localStorage.getItem('token');
        const res = await axios.post('http://localhost:5000/api/products/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`
            }
        });
        return res.data.urls[0];
    };

    // Khi thêm biến thể mới
    const handleVariantImageChange = async (e) => {
        const files = Array.from(e.target.files);
        const uploadedUrls = [];
        for (const file of files) {
            const url = await uploadImage(file);
            uploadedUrls.push(url);
        }
        setCurrentVariant(prev => ({
            ...prev,
            images: uploadedUrls.length > 0 ? uploadedUrls : []
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validate tất cả biến thể
        for (const v of formData.variants) {
            if (!v.attributes.size || !v.attributes.color || !v.stock || !v.price) {
                setError('Tất cả biến thể phải có đủ size, màu, tồn kho, giá!');
                setLoading(false);
                return;
            }
        }

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

    // Hàm bắt đầu sửa biến thể
    const handleEditVariant = (idx) => {
        setEditingVariantIdx(idx);
        setEditingVariant({ ...formData.variants[idx] });
    };

    // Hàm lưu biến thể đã sửa
    const handleSaveVariant = (idx) => {
        setFormData(prev => {
            const newVariants = [...prev.variants];
            newVariants[idx] = editingVariant;
            return { ...prev, variants: newVariants };
        });
        setEditingVariantIdx(null);
        setEditingVariant(null);
    };

    // Hàm hủy sửa biến thể
    const handleCancelEditVariant = () => {
        setEditingVariantIdx(null);
        setEditingVariant(null);
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
                        <div className={styles.formGroup} style={{ gridColumn: '1 / span 3' }}>
                            <label className={styles.label}>Mô tả</label>
                            <textarea className={styles.input} name="description" value={formData.description} onChange={handleChange} placeholder="Nhập mô tả" />
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
                            <select
                                className={styles.input}
                                name="attributes.size"
                                value={currentVariant.attributes.size}
                                onChange={handleVariantChange}
                            >
                                <option value="">Chọn size</option>
                                {formData.attributes.sizes.map((size, idx) => (
                                    <option key={idx} value={size}>{size}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Màu</label>
                            <select
                                className={styles.input}
                                name="attributes.color"
                                value={currentVariant.attributes.color}
                                onChange={handleVariantChange}
                            >
                                <option value="">Chọn màu</option>
                                {formData.attributes.colors.map((color, idx) => (
                                    <option key={idx} value={color}>{color}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Tồn kho</label>
                            <input
                                className={styles.input}
                                type="number"
                                name="stock"
                                value={currentVariant.stock}
                                onChange={e => {
                                    let value = Number(e.target.value);
                                    if (formData.stock && value > Number(formData.stock)) value = Number(formData.stock);
                                    handleVariantChange({ target: { name: 'stock', value } });
                                }}
                                placeholder="Tồn kho"
                                min={0}
                                max={formData.stock || ''}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Giá</label>
                            <input
                                className={styles.input}
                                type="number"
                                name="price"
                                value={currentVariant.price}
                                onChange={handleVariantChange}
                                placeholder="Giá"
                                min={0}
                            />
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
                            <div className={styles.tableCard} style={{ marginTop: 16 }}>
                                <div className={styles.tableTitle}>Danh sách biến thể</div>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Ảnh</th>
                                            <th>Size</th>
                                            <th>Màu</th>
                                            <th>Giá</th>
                                            <th>Tồn kho</th>
                                            <th>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData.variants.map((v, idx) => (
                                            <tr key={idx}>
                                                <td>
                                                    {editingVariantIdx === idx ? (
                                                        <>
                                                            {editingVariant.images && editingVariant.images.length > 0 && (
                                                                <img
                                                                    src={editingVariant.images[0]}
                                                                    alt="Ảnh biến thể"
                                                                    style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, marginBottom: 4 }}
                                                                />
                                                            )}
                                                            <input
                                                                type="file"
                                                                multiple
                                                                onChange={async e => {
                                                                    const files = Array.from(e.target.files);
                                                                    const uploadedUrls = [];
                                                                    for (const file of files) {
                                                                        const url = await uploadImage(file);
                                                                        uploadedUrls.push(url);
                                                                    }
                                                                    setEditingVariant({
                                                                        ...editingVariant,
                                                                        images: uploadedUrls.length > 0 ? uploadedUrls : []
                                                                    });
                                                                }}
                                                            />
                                                        </>
                                                    ) : (
                                                        v.images && v.images.length > 0 && (
                                                            <img
                                                                src={v.images[0]}
                                                                alt="Ảnh biến thể"
                                                                style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }}
                                                            />
                                                        )
                                                    )}
                                                </td>
                                                <td>
                                                    {editingVariantIdx === idx ? (
                                                        <select
                                                            value={editingVariant.attributes.size}
                                                            onChange={e => setEditingVariant({ ...editingVariant, attributes: { ...editingVariant.attributes, size: e.target.value } })}
                                                        >
                                                            <option value="">Chọn size</option>
                                                            {formData.attributes.sizes.map((size, i) => (
                                                                <option key={i} value={size}>{size}</option>
                                                            ))}
                                                        </select>
                                                    ) : v.attributes.size}
                                                </td>
                                                <td>
                                                    {editingVariantIdx === idx ? (
                                                        <select
                                                            value={editingVariant.attributes.color}
                                                            onChange={e => setEditingVariant({ ...editingVariant, attributes: { ...editingVariant.attributes, color: e.target.value } })}
                                                        >
                                                            <option value="">Chọn màu</option>
                                                            {formData.attributes.colors.map((color, i) => (
                                                                <option key={i} value={color}>{color}</option>
                                                            ))}
                                                        </select>
                                                    ) : v.attributes.color}
                                                </td>
                                                <td>
                                                    {editingVariantIdx === idx ? (
                                                        <input
                                                            type="number"
                                                            value={editingVariant.price}
                                                            min={0}
                                                            onChange={e => setEditingVariant({ ...editingVariant, price: e.target.value })}
                                                        />
                                                    ) : v.price}
                                                </td>
                                                <td>
                                                    {editingVariantIdx === idx ? (
                                                        <input
                                                            type="number"
                                                            value={editingVariant.stock}
                                                            min={0}
                                                            max={formData.stock || ''}
                                                            onChange={e => {
                                                                let value = Number(e.target.value);
                                                                if (formData.stock && value > Number(formData.stock)) value = Number(formData.stock);
                                                                setEditingVariant({ ...editingVariant, stock: value });
                                                            }}
                                                        />
                                                    ) : v.stock}
                                                </td>
                                                <td>
                                                    {editingVariantIdx === idx ? (
                                                        <>
                                                            <button type="button" className={styles.actionBtn + ' ' + styles.editBtn} onClick={() => handleSaveVariant(idx)}>Lưu</button>
                                                            <button type="button" className={styles.actionBtn + ' ' + styles.deleteBtn} onClick={handleCancelEditVariant}>Hủy</button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button type="button" className={styles.actionBtn + ' ' + styles.editBtn} onClick={() => handleEditVariant(idx)}>Sửa</button>
                                                            <button type="button" className={styles.actionBtn + ' ' + styles.deleteBtn} onClick={() => removeVariant(idx)}>Xóa</button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <button className={styles.actionBtn + ' ' + styles.editBtn} onClick={() => handleEdit(product)}>Sửa</button>
                                        <button className={styles.actionBtn + ' ' + styles.deleteBtn} onClick={() => handleDelete(product._id)}>Xóa</button>
                                    </div>
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