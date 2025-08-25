import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import ApplyVoucher from '../pages/ApplyVoucher';
import '../styles/Cart.css';

function Cart() {
    const {
        cartItems,
        cartNotifications,
        removeFromCart,
        updateQuantity,
        clearCart,
        updateCartItemAttributes,
        refreshCart,
        refreshStockOnly
    } = useContext(CartContext);
    const navigate = useNavigate();

    const [total, setTotal] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [selectedItems, setSelectedItems] = useState({});
    const [selectedVoucher, setSelectedVoucher] = useState(null);

    // Hủy áp dụng voucher
    const handleRemoveVoucher = () => {
        setDiscount(0);
        setSelectedVoucher(null);
    };

    // Helper to find matching variant (similar to ProductDetail)
    const findMatchingVariant = useCallback((productId, newColor, newSize) => {
        const productItem = cartItems.find(cartItem => cartItem.id === productId);
        if (!productItem || !productItem.variants) return null;

        return productItem.variants.find(v =>
            v.attributes.color === newColor &&
            v.attributes.size === newSize
        );
    }, [cartItems]);

    useEffect(() => {
        if (cartItems.length > 0) {
            const initialSelected = {};
            cartItems.forEach(item => {
                const itemId = `${item.id}-${item.color}-${item.size}`;
                // Chỉ chọn item nếu không bị ẩn và còn hàng
                if (item.isActive !== false && item.stock > 0) {
                    initialSelected[itemId] = true;
                }
            });
            setSelectedItems(initialSelected);
        } else {
            setSelectedItems({});
        }
    }, [cartItems]);

    // Effect để tự động bỏ chọn các item bị ẩn hoặc hết hàng
    useEffect(() => {
        if (cartItems.length > 0) {
            setSelectedItems(prevSelected => {
                const newSelected = { ...prevSelected };
                let hasChanges = false;

                cartItems.forEach(item => {
                    const itemId = `${item.id}-${item.color}-${item.size}`;
                    // Nếu item bị ẩn hoặc hết hàng và đang được chọn, bỏ chọn nó
                    if ((item.isActive === false || item.stock <= 0) && newSelected[itemId]) {
                        delete newSelected[itemId];
                        hasChanges = true;
                    }
                });

                if (hasChanges) {
                    toast.warning('Đã tự động bỏ chọn các sản phẩm bị ẩn hoặc hết hàng!');
                }

                return newSelected;
            });
        }
    }, [cartItems]);

    useEffect(() => {
        // Calculate total based on selected items
        const subtotal = cartItems.filter(item => selectedItems[`${item.id}-${item.color}-${item.size}`])
            .reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const totalAfterDiscount = Math.max(subtotal - discount, 0);
        setTotal(totalAfterDiscount);
    }, [cartItems, discount, selectedItems]);

    const handleItemSelection = (itemId, isSelected) => {
        setSelectedItems(prevSelected => ({
            ...prevSelected,
            [itemId]: isSelected
        }));
    };

    const handleUpdateQuantity = async (itemId, color, size, newQuantity) => {
        await updateQuantity(itemId, color, size, newQuantity);
    };

    const handleRemoveFromCart = async (itemId, color, size) => {
        await removeFromCart(itemId, color, size);
        setSelectedItems(prevSelected => {
            const newSelected = { ...prevSelected };
            delete newSelected[`${itemId}-${color}-${size}`];
            return newSelected;
        });
    };

    const handleAttributeChange = async (productId, oldColor, oldSize, attributeType, newValue) => {
        let newColor = oldColor;
        let newSize = oldSize;

        if (attributeType === 'color') {
            newColor = newValue;
        } else if (attributeType === 'size') {
            newSize = newValue;
        }

        await updateCartItemAttributes(productId, oldColor, oldSize, newColor, newSize);
    };

    const handleCheckout = async () => {
        console.log("🚀 handleCheckout được gọi");
        const selectedCartItems = cartItems.filter(item => selectedItems[`${item.id}-${item.color}-${item.size}`]);
        console.log("📦 Selected cart items:", selectedCartItems);

        if (selectedCartItems.length === 0) {
            toast.warning('Vui lòng chọn ít nhất 1 sản phẩm để thanh toán!');
            return;
        }

        // Kiểm tra xem có sản phẩm nào bị ẩn hoặc hết hàng trong selection không
        const invalidItems = selectedCartItems.filter(item =>
            item.isActive === false || item.stock <= 0
        );
        console.log("❌ Invalid items (isActive=false hoặc stock<=0):", invalidItems);

        if (invalidItems.length > 0) {
            // Refresh stock trước khi báo lỗi để đảm bảo thông tin mới nhất
            await refreshStockOnly();

            // Kiểm tra lại sau khi refresh
            const updatedSelectedItems = cartItems.filter(item => selectedItems[`${item.id}-${item.color}-${item.size}`]);
            const stillInvalidItems = updatedSelectedItems.filter(item =>
                item.isActive === false || item.stock <= 0
            );

            if (stillInvalidItems.length > 0) {
                const errorMessages = stillInvalidItems.map(item => {
                    if (item.isActive === false) {
                        return `"${item.name}" (${item.color} - ${item.size}) đã bị ẩn khỏi cửa hàng`;
                    } else {
                        return `"${item.name}" (${item.color} - ${item.size}) đã hết hàng (tồn kho: ${item.stock})`;
                    }
                });

                toast.error(`❌ ${errorMessages.join('\n')}`, {
                    autoClose: 8000,
                    style: { whiteSpace: 'pre-line' }
                });
                return;
            }
        }

        // Kiểm tra tồn kho từ server trước khi chuyển đến trang thanh toán
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Vui lòng đăng nhập để tiếp tục!");
                navigate("/login");
                return;
            }

            console.log("🔍 Bắt đầu kiểm tra tồn kho...");
            toast("Đang kiểm tra tồn kho...", { autoClose: 2000 });

            const stockCheckItems = selectedCartItems.map((item) => ({
                id: item.id,
                color: item.color,
                size: item.size,
                quantity: item.quantity,
            }));
            console.log("📋 Stock check items:", stockCheckItems);

            const stockCheckResponse = await axios.post(
                "http://localhost:5000/api/stock/check-stock",
                { items: stockCheckItems },
                {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 10000
                }
            );
            console.log("✅ Stock check response:", stockCheckResponse.data);

            if (!stockCheckResponse.data.success) {
                // Có sản phẩm hết hàng hoặc không khả dụng
                console.log("❌ Stock issues found:", stockCheckResponse.data.stockIssues);
                const errorMessages = stockCheckResponse.data.stockIssues.map(issue => issue.message);
                toast.error(`❌ ${errorMessages.join('\n')}`, {
                    autoClose: 8000,
                    style: { whiteSpace: 'pre-line' }
                });

                // Refresh cart để cập nhật tồn kho mới nhất
                refreshStockOnly();
                return;
            }

            console.log("✅ Tất cả sản phẩm có đủ hàng, chuyển đến checkout");
            toast.success("✅ Tất cả sản phẩm có đủ hàng!", { autoClose: 1500 });

            // Chuyển đến trang thanh toán sau khi kiểm tra thành công
            navigate('/checkout', { state: { selectedCartItems, discount, voucher: selectedVoucher } });

        } catch (stockError) {
            console.error("❌ Lỗi khi kiểm tra tồn kho:", stockError);
            if (stockError.response?.status === 400) {
                const errorData = stockError.response.data;
                console.log("❌ Stock error data:", errorData);
                if (errorData.stockIssues && errorData.stockIssues.length > 0) {
                    const errorMessages = errorData.stockIssues.map(issue => issue.message);
                    toast.error(`❌ ${errorMessages.join('\n')}`, {
                        autoClose: 8000,
                        style: { whiteSpace: 'pre-line' }
                    });
                } else {
                    toast.error(errorData.message || "Có sản phẩm không đủ hàng");
                }

                // Refresh cart để cập nhật tồn kho mới nhất
                refreshStockOnly();
            } else if (stockError.response?.status === 401) {
                toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
                navigate("/login");
            } else if (stockError.response?.status === 404) {
                console.error("❌ API endpoint không tồn tại - có thể server chưa restart");
                toast.error("Lỗi hệ thống: API kiểm tra tồn kho không khả dụng. Vui lòng thử lại sau!");
            } else {
                toast.error("Lỗi khi kiểm tra tồn kho, vui lòng thử lại");
            }
        }
    };

    return (
        <>
            <div className="page-title light-background" style={{ paddingTop: 100, marginBottom: 0 }}>
                <div className="container d-lg-flex justify-content-between align-items-center">
                    <h1 className="mb-2 mb-lg-0" style={{ fontWeight: 700, fontSize: 28, textTransform: 'none', letterSpacing: 0 }}>Giỏ hàng</h1>
                    <nav className="breadcrumbs">
                        <ol>
                            <li><a href="/">Home</a></li>
                            <li className="current">Cart</li>
                        </ol>
                    </nav>
                </div>
            </div>
            {cartItems.length === 0 ? (
                <div className="cart-empty py-5">
                    <i className="bi bi-cart-x" style={{ fontSize: '5rem' }}></i>
                    <h3 className="mt-4 mb-3" style={{ fontWeight: 600, color: '#374151' }}>Giỏ hàng trống</h3>
                    <p className="text-muted mb-4">Khám phá những sản phẩm tuyệt vời và thêm vào giỏ hàng của bạn</p>
                    <div className="mt-4">
                        <Link to="/category" className="btn btn-primary me-3 px-4 py-2" style={{ borderRadius: '8px', fontWeight: 500 }}>
                            <i className="bi bi-bag-plus me-2"></i>
                            Tiếp tục mua sắm
                        </Link>
                        <Link to="/orders" className="btn btn-outline-secondary px-4 py-2" style={{ borderRadius: '8px', fontWeight: 500 }}>
                            <i className="bi bi-clock-history me-2"></i>
                            Xem đơn hàng
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="cart-page-container py-5" style={{ maxWidth: '1400px', margin: '0 auto', background: '#fff', marginTop: 0 }}>
                    <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 32px' }}>
                        {/* Cart Notifications */}
                        {cartNotifications && cartNotifications.length > 0 && (
                            <div className="cart-notifications mb-4">
                                {cartNotifications.map((notification, index) => (
                                    <div
                                        key={index}
                                        className={`alert ${notification.type === 'product_hidden' ? 'alert-danger' :
                                            notification.type === 'out_of_stock' ? 'alert-warning' :
                                                'alert-info'
                                            } d-flex align-items-center`}
                                    >
                                        <i className={`bi ${notification.type === 'product_hidden' ? 'bi-eye-slash' :
                                            notification.type === 'out_of_stock' ? 'bi-exclamation-triangle' :
                                                'bi-info-circle'
                                            } me-2`}></i>
                                        <span>{notification.message}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="row justify-content-center" style={{ marginTop: '20px' }}>
                            {/* Cart Items */}
                            <div className="col-lg-8 mb-4">
                                <div className="card shadow-sm border-0">
                                    <div className="card-body p-4">
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <h4 className="mb-0" style={{ fontWeight: 600 }}>GIỎ HÀNG</h4>
                                            <div className="d-flex gap-2">
                                                <button
                                                    className="btn btn-outline-success btn-sm"
                                                    onClick={refreshStockOnly}
                                                    title="Cập nhật tồn kho"
                                                >
                                                    <i className="bi bi-arrow-repeat me-1"></i>
                                                    Cập nhật tồn kho
                                                </button>
                                                <button
                                                    className="btn btn-outline-primary btn-sm btn-refresh"
                                                    onClick={refreshCart}
                                                    title="Làm mới giỏ hàng"
                                                >
                                                    <i className="bi bi-arrow-clockwise me-1"></i>
                                                    Làm mới
                                                </button>
                                            </div>
                                        </div>
                                        {cartItems.map((item) => {
                                            const itemId = `${item.id}-${item.color}-${item.size}`;
                                            const isDisabled = item.isActive === false || item.stock <= 0;
                                            return (
                                                <div
                                                    key={itemId}
                                                    className={`cart-item-card mb-3 rounded-3 shadow-sm ${isDisabled ? 'disabled-item' : ''}`}
                                                    style={{
                                                        background: isDisabled ? '#fff5f5' : '#ffffff',
                                                        border: isDisabled ? '2px solid #fecaca' : '1px solid #e5e7eb',
                                                        opacity: isDisabled ? 0.8 : 1,
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                >
                                                    <div className="p-4">
                                                        {/* Header: Product name và status badges */}
                                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                                            <div className="d-flex align-items-center">
                                                                <input
                                                                    type="checkbox"
                                                                    className="form-check-input me-3"
                                                                    checked={selectedItems[itemId] || false}
                                                                    disabled={isDisabled}
                                                                    onChange={(e) => handleItemSelection(itemId, e.target.checked)}
                                                                    style={{ transform: 'scale(1.2)' }}
                                                                />
                                                                <h6 className={`mb-0 ${item.isActive === false ? 'text-muted text-decoration-line-through' : 'text-dark'}`}
                                                                    style={{ fontWeight: 600, fontSize: '16px' }}>
                                                                    {item.name}
                                                                </h6>
                                                            </div>
                                                            <div className="d-flex gap-2">
                                                                {item.isActive === false && (
                                                                    <span className="badge bg-danger">Đã ẩn</span>
                                                                )}
                                                                {item.isActive !== false && item.stock <= 0 && (
                                                                    <span className="badge bg-warning text-dark">Hết hàng</span>
                                                                )}
                                                                {item.isActive !== false && item.quantity > item.stock && item.stock > 0 && (
                                                                    <span className="badge bg-info">Vượt tồn kho</span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Main content: Image và details */}
                                                        <div className="row align-items-center">
                                                            {/* Product Image */}
                                                            <div className="col-md-2 col-3 mb-3 mb-md-0">
                                                                <div className="position-relative">
                                                                    <img
                                                                        src={item.image}
                                                                        alt={item.name}
                                                                        className="img-fluid rounded-2"
                                                                        style={{
                                                                            width: '100%',
                                                                            height: '80px',
                                                                            objectFit: 'cover',
                                                                            border: '1px solid #f1f5f9'
                                                                        }}
                                                                    />
                                                                    {isDisabled && (
                                                                        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-25 rounded-2">
                                                                            <i className="bi bi-ban text-white fs-4"></i>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Product Details */}
                                                            <div className="col-md-10 col-9">
                                                                <div className="row align-items-center">
                                                                    {/* Attributes */}
                                                                    <div className="col-lg-4 col-md-6 mb-2 mb-lg-0">
                                                                        <div className="d-flex flex-column gap-2">
                                                                            {/* Color */}
                                                                            {item.availableColors && item.availableColors.length > 0 && (
                                                                                <div className="d-flex align-items-center">
                                                                                    <small className="text-muted me-2" style={{ minWidth: '35px' }}>Màu:</small>
                                                                                    <select
                                                                                        className="form-select form-select-sm"
                                                                                        style={{ maxWidth: '120px' }}
                                                                                        value={item.color || ''}
                                                                                        disabled={isDisabled}
                                                                                        onChange={(e) => handleAttributeChange(item.id, item.color, item.size, 'color', e.target.value)}
                                                                                    >
                                                                                        {item.availableColors.map((colorOption) => (
                                                                                            <option key={colorOption} value={colorOption}>{colorOption}</option>
                                                                                        ))}
                                                                                    </select>
                                                                                </div>
                                                                            )}
                                                                            {/* Size */}
                                                                            {item.availableSizes && item.availableSizes.length > 0 && (
                                                                                <div className="d-flex align-items-center">
                                                                                    <small className="text-muted me-2" style={{ minWidth: '35px' }}>Size:</small>
                                                                                    <select
                                                                                        className="form-select form-select-sm"
                                                                                        style={{ maxWidth: '120px' }}
                                                                                        value={item.size || ''}
                                                                                        disabled={isDisabled}
                                                                                        onChange={(e) => handleAttributeChange(item.id, item.color, item.size, 'size', e.target.value)}
                                                                                    >
                                                                                        {item.availableSizes.map((sizeOption) => (
                                                                                            <option key={sizeOption} value={sizeOption}>{sizeOption}</option>
                                                                                        ))}
                                                                                    </select>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    {/* Price */}
                                                                    <div className="col-lg-2 col-md-3 col-6 mb-2 mb-lg-0 text-center">
                                                                        <div className="text-muted small mb-1">Đơn giá</div>
                                                                        <div className="fw-bold text-primary">
                                                                            {item.price.toLocaleString('vi-VN')}₫
                                                                        </div>
                                                                    </div>

                                                                    {/* Quantity */}
                                                                    <div className="col-lg-3 col-md-3 col-6 mb-2 mb-lg-0">
                                                                        <div className="text-muted small mb-1 text-center">Số lượng</div>
                                                                        <div className="d-flex align-items-center justify-content-center">
                                                                            <button
                                                                                className="btn btn-outline-secondary btn-sm"
                                                                                style={{ width: '32px', height: '32px' }}
                                                                                disabled={isDisabled}
                                                                                onClick={() => handleUpdateQuantity(item.id, item.color, item.size, Math.max(1, item.quantity - 1))}
                                                                            >
                                                                                <i className="bi bi-dash"></i>
                                                                            </button>
                                                                            <input
                                                                                type="number"
                                                                                className="form-control text-center mx-2"
                                                                                style={{ width: '60px', height: '32px' }}
                                                                                value={item.quantity}
                                                                                min="1"
                                                                                max={item.stock}
                                                                                disabled={isDisabled}
                                                                                onChange={e => {
                                                                                    const rawValue = parseInt(e.target.value, 10);
                                                                                    const newQuantity = isNaN(rawValue) ? 1 : Math.max(1, Math.min(item.stock, rawValue));
                                                                                    if (newQuantity !== item.quantity) {
                                                                                        handleUpdateQuantity(item.id, item.color, item.size, newQuantity);
                                                                                    }
                                                                                }}
                                                                            />
                                                                            <button
                                                                                className="btn btn-outline-secondary btn-sm"
                                                                                style={{ width: '32px', height: '32px' }}
                                                                                disabled={isDisabled}
                                                                                onClick={() => {
                                                                                    const newQuantity = item.quantity + 1;
                                                                                    if (newQuantity <= item.stock) {
                                                                                        handleUpdateQuantity(item.id, item.color, item.size, newQuantity);
                                                                                    } else {
                                                                                        toast.warning(`Số lượng đã đạt tối đa! Tồn kho hiện tại: ${item.stock}`);
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <i className="bi bi-plus"></i>
                                                                            </button>
                                                                        </div>
                                                                        <div className="text-center mt-1">
                                                                            <small className="text-muted">Kho: {item.stock}</small>
                                                                        </div>
                                                                    </div>

                                                                    {/* Total & Actions */}
                                                                    <div className="col-lg-3 col-md-12">
                                                                        <div className="d-flex align-items-center justify-content-between">
                                                                            <div className="text-center">
                                                                                <div className="text-muted small mb-1">Thành tiền</div>
                                                                                <div className="fw-bold text-success fs-6">
                                                                                    {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                                                                                </div>
                                                                            </div>
                                                                            <button
                                                                                className="btn btn-outline-danger btn-sm"
                                                                                onClick={() => handleRemoveFromCart(item.id, item.color, item.size)}
                                                                                title="Xóa sản phẩm"
                                                                            >
                                                                                <i className="bi bi-trash3"></i>
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {/* Coupon and actions */}
                                        <div className="d-flex justify-content-between align-items-center mt-4">
                                            <ApplyVoucher
                                                cartTotal={cartItems.filter(item => selectedItems[`${item.id}-${item.color}-${item.size}`])
                                                    .reduce((acc, item) => acc + (item.price * item.quantity), 0)}
                                                onDiscountApplied={(discountAmount, voucher) => {
                                                    setDiscount(discountAmount);
                                                    setSelectedVoucher(voucher);
                                                }}
                                                onRemoveVoucher={handleRemoveVoucher}
                                            />
                                            <div>
                                                <button className="btn btn-outline-primary me-2" type="button">Cập nhật</button>
                                                <button className="btn btn-outline-danger" type="button" onClick={clearCart}>Xóa hết</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Order Summary */}
                            <div className="col-lg-4">
                                <div className="card shadow-sm border-0">
                                    <div className="card-body p-4" style={{ textAlign: 'left' }}>
                                        <h5 className="mb-4" style={{ fontWeight: 600 }}>Thông tin đơn hàng</h5>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Tạm tính</span>
                                            <span>{cartItems.filter(item => selectedItems[`${item.id}-${item.color}-${item.size}`]).reduce((acc, item) => acc + (item.price * item.quantity), 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Phí vận chuyển</span>
                                            <span>{(30000).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Giảm giá</span>
                                            <span className="text-success">-{discount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
                                        </div>
                                        <hr />
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <span style={{ fontWeight: 600, fontSize: 18 }}>Tổng cộng</span>
                                            <span style={{ fontWeight: 700, fontSize: 22 }}>
                                                {(
                                                    cartItems.filter(item => selectedItems[`${item.id}-${item.color}-${item.size}`]).reduce((acc, item) => acc + (item.price * item.quantity), 0)
                                                    + 30000
                                                    - discount
                                                ).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                            </span>
                                        </div>
                                        <button className="btn btn-primary w-100 mb-2" style={{ fontWeight: 600, fontSize: 16 }} onClick={handleCheckout}>
                                            Thanh toán &rarr;
                                        </button>
                                        <Link to="/category" className="btn btn-link w-100">&larr; Tiếp tục mua sắm</Link>
                                        <div className="mt-4">
                                            <span className="text-muted">Chấp nhận thanh toán</span>
                                            <div className="d-flex gap-2 mt-2">
                                                <i className="bi bi-credit-card-2-front" style={{ fontSize: 24 }}></i>
                                                <i className="bi bi-paypal" style={{ fontSize: 24 }}></i>
                                                <i className="bi bi-wallet2" style={{ fontSize: 24 }}></i>
                                                <i className="bi bi-apple" style={{ fontSize: 24 }}></i>
                                                <i className="bi bi-google" style={{ fontSize: 24 }}></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Cart; 