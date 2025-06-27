import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/ProductLayout.module.css';
import toast from 'react-hot-toast';

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
    const [currentVariant, setCurrentVariant] = useState({
        attributes: { size: '', color: '' },
        stock: '',
        price: '',
        images: []
    });
    const [editingVariantIdx, setEditingVariantIdx] = useState(null);
    const [editingVariant, setEditingVariant] = useState(null);
    const [selectedImage, setSelectedImage] = useState('');
    const [showImageModal, setShowImageModal] = useState(false);

    const getImageUrl = (imgData) => {
        if (!imgData) return '/assets/img/no-image.png';

        // Handle both string URLs and object structures
        const imgUrl = typeof imgData === 'string' ? imgData : imgData.url;

        if (!imgUrl) return '/assets/img/no-image.png';
        if (imgUrl.startsWith('http') || imgUrl.startsWith('blob:')) {
            return imgUrl;
        }
        if (imgUrl.startsWith('/uploads/')) return `http://localhost:5000${imgUrl}`;
        return `http://localhost:5000/uploads/${imgUrl}`;
    };

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
        const { name, value, type, checked } = e.target;

        if (name === 'stock') {
            const newStock = Number(value);
            const totalVariantStock = formData.variants.reduce((acc, v) => acc + Number(v.stock || 0), 0);
            if (newStock < totalVariantStock) {
                toast.error('Tồn kho sản phẩm gốc không thể nhỏ hơn tổng tồn kho của các biến thể.');
                return;
            }
        }

        if (name.startsWith('attributes.')) {
            const attribute = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                attributes: {
                    ...prev.attributes,
                    [attribute]: value.split(',').map(item => item.trim())
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleVariantChange = (e) => {
        const { name, value } = e.target;

        if (name === 'stock') {
            const newVariantStock = Number(value);
            const otherVariantsStock = formData.variants
                .filter((_, i) => i !== editingVariantIdx)
                .reduce((acc, v) => acc + Number(v.stock || 0), 0);

            const totalStock = Number(formData.stock || 0);

            if (newVariantStock + otherVariantsStock > totalStock) {
                toast.error('Tổng tồn kho các biến thể không được vượt quá tồn kho sản phẩm gốc.');
                const availableStock = totalStock - otherVariantsStock;
                setCurrentVariant(prev => ({
                    ...prev,
                    [name]: availableStock > 0 ? availableStock : 0
                }));
                return;
            }
        }

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

    const handleVariantImageChange = (e) => {
        const files = Array.from(e.target.files);
        const newImageObjects = files.map(file => ({
            url: URL.createObjectURL(file),
            file: file,
            id: Date.now() + Math.random()
        }));

        // Thêm ảnh vào biến thể hiện tại
        setCurrentVariant(prev => ({
            ...prev,
            images: [...(prev.images || []), ...newImageObjects]
        }));

        // Thêm ảnh vào main images nếu chưa có, chỉ thêm file thực sự hoặc url thực tế, không thêm blob
        setFormData(prev => {
            const newMainImages = newImageObjects.filter(newImg =>
                (newImg.file && newImg.file instanceof File)
            ).filter(newImg =>
                !prev.images.some(img =>
                    (img.file && newImg.file && img.file === newImg.file)
                )
            );
            // Gộp và loại trùng lặp
            const allImages = [...newMainImages, ...prev.images];
            const uniqueImages = [];
            for (const img of allImages) {
                if (!uniqueImages.some(uImg =>
                    (uImg.file && img.file && uImg.file === img.file) ||
                    (uImg.url && img.url && uImg.url === img.url)
                )) {
                    uniqueImages.push(img);
                }
            }
            return {
                ...prev,
                images: uniqueImages
            };
        });
    };

    const addVariant = () => {
        if (!currentVariant.attributes.size || !currentVariant.attributes.color || !currentVariant.stock) {
            toast.error('Vui lòng điền đủ thông tin size, màu và tồn kho cho biến thể.');
            return;
        }

        const newStock = Number(currentVariant.stock);
        const otherVariantsStock = formData.variants
            .filter((_, i) => i !== editingVariantIdx)
            .reduce((acc, v) => acc + Number(v.stock || 0), 0);

        const totalProductStock = Number(formData.stock || 0);

        if (newStock + otherVariantsStock > totalProductStock) {
            toast.error('Thêm/cập nhật thất bại: Tổng tồn kho các biến thể vượt quá tồn kho sản phẩm gốc.');
            return;
        }

        const isDuplicate = formData.variants.some(
            (v, i) =>
                i !== editingVariantIdx &&
                v.attributes.size === currentVariant.attributes.size &&
                v.attributes.color === currentVariant.attributes.color
        );

        if (isDuplicate) {
            toast.error('Biến thể đã tồn tại.');
            return;
        }

        // Nếu biến thể có ảnh, thêm ảnh đầu tiên vào main images nếu chưa có, chỉ thêm file thực sự hoặc url thực tế
        let updatedImages = [...formData.images];
        if (currentVariant.images && currentVariant.images.length > 0) {
            const firstVariantImg = currentVariant.images[0];
            const isValidImg = (firstVariantImg.file && firstVariantImg.file instanceof File) || (typeof firstVariantImg.url === 'string' && !firstVariantImg.url.startsWith('blob:'));
            if (isValidImg) {
                const exists = updatedImages.some(img => (img.file && firstVariantImg.file && img.file === firstVariantImg.file) || (img.url && firstVariantImg.url && img.url === firstVariantImg.url));
                if (!exists) {
                    updatedImages = [firstVariantImg, ...updatedImages]; // Thêm lên đầu
                }
            }
        }

        if (editingVariantIdx !== null) {
            // Update existing variant
            const updatedVariants = [...formData.variants];
            updatedVariants[editingVariantIdx] = { ...currentVariant };
            setFormData(prev => ({
                ...prev,
                variants: updatedVariants,
                images: updatedImages
            }));
        } else {
            // Add new variant
            const newVariant = {
                ...currentVariant,
                price: currentVariant.price || formData.price,
                stock: Number(currentVariant.stock),
                images: [...currentVariant.images]
            };
            setFormData(prev => ({
                ...prev,
                variants: [...prev.variants, newVariant],
                images: updatedImages
            }));
        }

        // Reset form
        cancelEditVariant();
    };

    const handleEditVariant = (index) => {
        setEditingVariantIdx(index);
        const variantToEdit = { ...formData.variants[index] };
        setCurrentVariant(variantToEdit);

        // Scroll to the variant edit form for better UX
        const variantCard = document.querySelector(`.${styles.card}:has(h2[innerHTML='Biến thể sản phẩm'])`);
        if (variantCard) {
            variantCard.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const cancelEditVariant = () => {
        setEditingVariantIdx(null);
        setCurrentVariant({
            attributes: { size: '', color: '' },
            stock: '',
            price: '',
            images: []
        });
        setError('');
    };

    const removeVariant = (index) => {
        if (editingVariantIdx === index) {
            cancelEditVariant();
        }
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index)
        }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const newImageObjects = files.map(file => ({
            url: URL.createObjectURL(file),
            file: file,
            id: Date.now() + Math.random() // Add a unique ID for the key prop
        }));

        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...newImageObjects]
        }));
    };

    const handleRemoveImage = (index) => {
        let updatedImages = [...formData.images];
        updatedImages.splice(index, 1);
        // Sau khi xóa, chỉ giữ lại object có file thực sự hoặc url thực tế (không blob)
        updatedImages = updatedImages.filter(img =>
            (img.file && img.file instanceof File) || (typeof img.url === 'string' && !img.url.startsWith('blob:'))
        );
        setFormData(prev => ({ ...prev, images: updatedImages }));
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            name: '',
            description: '',
            brand: '',
            category: '',
            price: '',
            stock: '',
            isActive: true,
            attributes: { sizes: [], colors: [] },
            variants: [],
            images: []
        });
        setCurrentVariant({
            attributes: { size: '', color: '' },
            stock: '',
            price: '',
            images: []
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Lọc lại images trước khi submit
        const validImages = formData.images.filter(img =>
            (img.file && img.file instanceof File) || (typeof img.url === 'string' && !img.url.startsWith('blob:'))
        );

        const formDataToSend = new FormData();
        const simpleFields = ['name', 'description', 'brand', 'category', 'price', 'stock', 'isActive'];
        simpleFields.forEach(key => {
            if (formData[key] !== undefined && formData[key] !== null) {
                formDataToSend.append(key, formData[key]);
            }
        });

        // 1. Handle Main Images
        const existingMainImageUrls = validImages.filter(img => !img.file && typeof img.url === 'string' && !img.url.startsWith('blob:')).map(img => img.url);
        const newMainImageFiles = validImages.filter(img => !!img.file && img.file instanceof File).map(img => img.file);

        if (existingMainImageUrls.length > 0) {
            existingMainImageUrls.forEach(url => formDataToSend.append('existingImages', url));
        }
        if (newMainImageFiles.length > 0) {
            newMainImageFiles.forEach(file => formDataToSend.append('images', file));
        }

        // 2. Handle Variants and their images
        const variantsForUpload = formData.variants.map(variant => {
            const existingVariantImages = (variant.images || []).filter(img => !img.file && typeof img.url === 'string' && !img.url.startsWith('blob:')).map(img => img.url);
            const newVariantImageFiles = (variant.images || []).filter(img => !!img.file && img.file instanceof File).map(img => img.file);

            if (newVariantImageFiles.length > 0) {
                newVariantImageFiles.forEach(file => {
                    formDataToSend.append('variantImages', file);
                });
            }

            return {
                ...variant,
                images: existingVariantImages,
                newImageCount: newVariantImageFiles.length
            };
        });

        formDataToSend.append('attributes', JSON.stringify(formData.attributes));
        formDataToSend.append('variants', JSON.stringify(variantsForUpload));

        try {
            const token = localStorage.getItem('token');
            const url = editingId ? `http://localhost:5000/api/products/${editingId}` : 'http://localhost:5000/api/products';
            const method = editingId ? 'put' : 'post';

            await axios[method](url, formDataToSend, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            fetchProducts();
            resetForm();
        } catch (error) {
            alert(error.response?.data?.message || 'Lỗi khi lưu sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product) => {
        setEditingId(product._id);
        setFormData({
            ...product,
            category: product.category?._id || '',
            attributes: product.attributes || { sizes: [], colors: [] },
            images: product.images ? product.images.map(url => ({ url, file: null, id: url })) : [],
            variants: product.variants ? product.variants.map(v => ({
                ...v,
                images: v.images ? v.images.map(url => ({ url, file: null, id: url })) : []
            })) : [],
        });

        setCurrentVariant({
            attributes: { size: '', color: '' },
            stock: '',
            price: '',
            images: []
        });
        window.scrollTo(0, 0);
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

    // Thêm hàm xoá ảnh biến thể
    const handleRemoveVariantImage = (idx) => {
        setCurrentVariant(prev => {
            const newImages = [...(prev.images || [])];
            newImages.splice(idx, 1);
            return {
                ...prev,
                images: newImages
            };
        });
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>{editingId ? 'Chỉnh sửa sản phẩm' : 'Tạo sản phẩm mới'}</h1>
            {error && <div className="error-banner">{error}</div>}

            <form onSubmit={handleSubmit} className={styles.formContainer}>
                {/* Main Content */}
                <div className={styles.mainContent}>
                    {/* Basic Info Card */}
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>Thông tin cơ bản</h2>
                        <div className={`${styles.formGrid} ${styles.gridCol2}`}>
                            <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                                <label className={styles.label} htmlFor="name">Tên sản phẩm</label>
                                <input id="name" name="name" type="text" className={styles.input} value={formData.name} onChange={handleChange} />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label} htmlFor="price">Giá</label>
                                <input id="price" name="price" type="number" className={styles.input} value={formData.price} onChange={handleChange} />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label} htmlFor="stock">Tồn kho</label>
                                <input id="stock" name="stock" type="number" className={styles.input} value={formData.stock} onChange={handleChange} />
                            </div>
                            <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                                <label className={styles.label} htmlFor="description">Mô tả</label>
                                <textarea id="description" name="description" className={styles.textarea} value={formData.description} onChange={handleChange}></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Image Upload Card */}
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>Hình ảnh</h2>
                        <input type="file" multiple onChange={handleImageChange} className={styles.input} />
                        <div className={styles.imagePreviewContainer} style={{ marginTop: '20px' }}>
                            {formData.images.map((img, index) => (
                                <div key={img.id || index} className={styles.imagePreviewWrapper}>
                                    <img src={img.url} alt="Preview" className={styles.imagePreview} />
                                    <button type="button" className={styles.removeImageBtn} onClick={() => handleRemoveImage(index)}>&times;</button>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Attributes Card */}
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>Thuộc tính</h2>
                        <div className={`${styles.formGrid} ${styles.gridCol2}`}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Size (cách nhau bởi dấu phẩy)</label>
                                <input className={styles.input} type="text" name="attributes.sizes" value={formData.attributes.sizes.join(', ')} onChange={handleChange} placeholder="VD: S, M, L, XL" />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Màu sắc (cách nhau bởi dấu phẩy)</label>
                                <input className={styles.input} type="text" name="attributes.colors" value={formData.attributes.colors.join(', ')} onChange={handleChange} placeholder="VD: Đỏ, Xanh, Đen" />
                            </div>
                        </div>
                    </div>

                    {/* Variants Card */}
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>Biến thể sản phẩm</h2>
                        {/* Form to add a new variant */}
                        <div className={styles.formGrid} style={{ alignItems: 'flex-end', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', marginBottom: '20px' }}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Size</label>
                                <select name="attributes.size" value={currentVariant.attributes.size} onChange={handleVariantChange} className={styles.select}>
                                    <option value="">Chọn size</option>
                                    {formData.attributes.sizes.map((size, idx) => <option key={idx} value={size}>{size}</option>)}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Màu</label>
                                <select name="attributes.color" value={currentVariant.attributes.color} onChange={handleVariantChange} className={styles.select}>
                                    <option value="">Chọn màu</option>
                                    {formData.attributes.colors.map((color, idx) => <option key={idx} value={color}>{color}</option>)}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Tồn kho</label>
                                <input type="number" name="stock" value={currentVariant.stock} onChange={handleVariantChange} className={styles.input} placeholder="Số lượng" />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Giá</label>
                                <input type="number" name="price" value={currentVariant.price} onChange={handleVariantChange} className={styles.input} placeholder="Giá biến thể" />
                            </div>
                            <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                                <button
                                    type="button"
                                    className={`${styles.btn} ${styles.btnSecondary}`}
                                    onClick={addVariant}
                                    style={{ whiteSpace: 'nowrap' }}
                                >
                                    {editingVariantIdx !== null ? 'Cập nhật biến thể' : 'Thêm'}
                                </button>
                                {editingVariantIdx !== null && (
                                    <button type="button" className={`${styles.btn} ${styles.btnLink}`} onClick={cancelEditVariant}>
                                        Hủy
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Variant Image Upload with Preview */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Ảnh biến thể</label>
                            <div className={styles.dropZone} onClick={() => document.getElementById('variant-image-input').click()}>
                                <div className={styles.dropZoneContent}>
                                    <i className="bi bi-cloud-upload" style={{ fontSize: '2rem', color: '#666' }}></i>
                                    <p>Kéo thả ảnh vào đây hoặc click để chọn</p>
                                    <small>Có thể chọn nhiều ảnh. Hỗ trợ: JPG, PNG, GIF</small>
                                </div>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleVariantImageChange}
                                    className={styles.hiddenInput}
                                    id="variant-image-input"
                                />
                            </div>
                        </div>

                        {currentVariant.images && currentVariant.images.length > 0 && (
                            <div className={styles.imagePreviewContainer} style={{ marginTop: '20px' }}>
                                {currentVariant.images.map((img, idx) => (
                                    <div
                                        key={img.id || idx}
                                        className={styles.imagePreviewWrapper}
                                        draggable
                                        onDragStart={(e) => {
                                            e.dataTransfer.setData('variantImageIndex', idx);
                                        }}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            const fromIndex = parseInt(e.dataTransfer.getData('variantImageIndex'));
                                            const toIndex = idx;
                                            if (fromIndex !== toIndex) {
                                                const newImages = [...currentVariant.images];
                                                const [movedImage] = newImages.splice(fromIndex, 1);
                                                newImages.splice(toIndex, 0, movedImage);
                                                setCurrentVariant(prev => ({ ...prev, images: newImages }));
                                            }
                                        }}
                                    >
                                        <img src={img.url} alt={`Variant ${idx + 1}`} className={styles.imagePreview} />
                                        <button type="button" onClick={() => handleRemoveVariantImage(idx)} className={styles.removeImageBtn}>&times;</button>
                                        <div className={styles.imageOrder}>{idx + 1}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {currentVariant.images && currentVariant.images.length > 0 && (
                            <small className={styles.helpText} style={{ marginTop: '8px', display: 'block' }}>
                                Kéo thả để sắp xếp lại thứ tự ảnh
                            </small>
                        )}

                        {formData.variants.length > 0 && (
                            <table className={styles.variantTable}>
                                <thead>
                                    <tr>
                                        <th>Size</th>
                                        <th>Màu</th>
                                        <th>Tồn kho</th>
                                        <th>Giá</th>
                                        <th>Ảnh</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.variants.map((v, idx) => (
                                        <tr key={idx}>
                                            <td>{v.attributes.size}</td>
                                            <td>{v.attributes.color}</td>
                                            <td>{v.stock}</td>
                                            <td>{v.price}</td>
                                            <td>
                                                {v.images && v.images.length > 0 ? (
                                                    <img
                                                        src={getImageUrl(v.images[0])}
                                                        alt={`Variant ${idx + 1}`}
                                                        className={styles.variantThumbnail}
                                                        style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }}
                                                        onClick={() => {
                                                            setSelectedImage(getImageUrl(v.images[0]));
                                                            setShowImageModal(true);
                                                        }}
                                                    />
                                                ) : (
                                                    <span className={styles.noImage}>Không có ảnh</span>
                                                )}
                                            </td>
                                            <td>
                                                <button type="button" onClick={() => handleEditVariant(idx)} className={`${styles.actionBtn} ${styles.editBtn}`}>
                                                    Sửa
                                                </button>
                                                <button type="button" onClick={() => removeVariant(idx)} className={`${styles.actionBtn} ${styles.deleteBtn}`}>
                                                    Xóa
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className={styles.sidebar}>
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>Tổ chức</h2>
                        <div className={styles.formGroup}>
                            <label className={styles.label} htmlFor="brand">Thương hiệu</label>
                            <input id="brand" name="brand" type="text" className={styles.input} value={formData.brand} onChange={handleChange} />
                        </div>
                        <div className={styles.formGroup} style={{ marginTop: '16px' }}>
                            <label className={styles.label} htmlFor="category">Danh mục</label>
                            <select id="category" name="category" className={styles.select} value={formData.category} onChange={handleChange}>
                                <option value="">Chọn danh mục</option>
                                {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                            </select>
                        </div>
                        <div className={styles.formGroup} style={{ marginTop: '16px' }}>
                            <label className={styles.label}>Trạng thái</label>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} />
                                <label htmlFor="isActive" style={{ marginLeft: '8px' }}>Công khai sản phẩm</label>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.btnGroup} style={{ gridColumn: '1 / -1', marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={resetForm}>Hủy</button>
                    <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={loading}>
                        {loading ? 'Đang lưu...' : (editingId ? 'Cập nhật' : 'Lưu sản phẩm')}
                    </button>
                </div>
            </form>

            {/* Product List */}
            <div className={styles.card} style={{ marginTop: '24px' }}>
                <h2 className={styles.cardTitle}>Danh sách sản phẩm</h2>
                <table className={styles.productTable + ' customProductTable'}>
                    <thead>
                        <tr>
                            <th>Ảnh</th>
                            <th>Tên sản phẩm</th>
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
                                <td>{product.category?.name || categories.find(c => c._id === (product.category?._id || product.category))?.name || ''}</td>
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

            {/* Image Modal */}
            {showImageModal && (
                <div className={styles.imageModal}>
                    <div className={styles.imageModalContent}>
                        <span className={styles.close} onClick={() => setShowImageModal(false)}>&times;</span>
                        <img src={selectedImage} alt="Full Size" className={styles.fullImage} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Product;
