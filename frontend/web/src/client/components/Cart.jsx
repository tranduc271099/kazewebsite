import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CartContext } from '../context/CartContext';
import ApplyVoucher from '../pages/ApplyVoucher';

function Cart() {
    const { cartItems, removeFromCart, updateQuantity, clearCart, updateCartItemAttributes } = useContext(CartContext);
    const navigate = useNavigate();

    const [total, setTotal] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [selectedItems, setSelectedItems] = useState({});
    const [selectedVoucher, setSelectedVoucher] = useState(null);

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
                initialSelected[`${item.id}-${item.color}-${item.size}`] = true;
            });
            setSelectedItems(initialSelected);
        } else {
            setSelectedItems({});
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

    const handleCheckout = () => {
        const selectedCartItems = cartItems.filter(item => selectedItems[`${item.id}-${item.color}-${item.size}`]);
        if (selectedCartItems.length === 0) {
            toast.warning('Vui lòng chọn ít nhất 1 sản phẩm để thanh toán!');
            return;
        }
        navigate('/checkout', { state: { selectedCartItems, discount, voucher: selectedVoucher } });
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
                <div className="empty-cart text-center py-5">
                    <i className="bi bi-cart-x" style={{ fontSize: '4rem', color: '#ccc' }}></i>
                    <h3 className="mt-3">Giỏ hàng trống</h3>
                    <p className="text-muted">Thêm sản phẩm vào giỏ hàng để xem ở đây</p>
                    <div className="mt-3">
                        <Link to="/category" className="btn btn-primary me-2">
                            Tiếp tục mua sắm
                        </Link>
                        <Link to="/orders" className="btn btn-outline-primary">
                            Xem đơn hàng của tôi
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="cart-page-container py-5" style={{ maxWidth: '1400px', margin: '0 auto', background: '#fff', marginTop: 0 }}>
                    <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 32px' }}>
                        <div className="row justify-content-center" style={{ marginTop: '20px' }}>
                            {/* Cart Items */}
                            <div className="col-lg-8 mb-4">
                                <div className="card shadow-sm border-0">
                                    <div className="card-body p-4">
                                        <h4 className="mb-4" style={{ fontWeight: 600 }}>GIỎ HÀNG</h4>
                                        {cartItems.map((item) => {
                                            const itemId = `${item.id}-${item.color}-${item.size}`;
                                            return (
                                                <div key={itemId} className="cart-item-row d-flex flex-column mb-3 p-3 rounded" style={{ background: '#fafbfc', border: '1px solid #e5e7eb', minHeight: 110 }}>
                                                    {/* Tên sản phẩm */}
                                                    <div
                                                        className="cart-col cart-col-name d-flex align-items-center"
                                                        style={{
                                                            flex: 2,
                                                            minWidth: 0,
                                                            fontWeight: 500,
                                                            fontSize: 17,
                                                            whiteSpace: 'normal',
                                                            wordBreak: 'break-word',
                                                            overflow: 'hidden',
                                                            textAlign: 'left'
                                                        }}
                                                    >
                                                        {item.name}
                                                    </div>
                                                    {/* Hàng thuộc tính và thao tác */}
                                                    <div className="d-flex align-items-center w-100">
                                                        {/* Checkbox */}
                                                        <div className="cart-col cart-col-checkbox d-flex align-items-center justify-content-center" style={{ width: 48, minWidth: 48 }}>
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                checked={selectedItems[itemId] || false}
                                                                onChange={(e) => handleItemSelection(itemId, e.target.checked)}
                                                                style={{ transform: 'scale(1.3)' }}
                                                            />
                                                        </div>
                                                        {/* Ảnh sản phẩm */}
                                                        <div className="cart-col cart-col-image d-flex align-items-center justify-content-center" style={{ width: 90, minWidth: 90, margin: '0 4px' }}>
                                                            <img src={item.image} alt={item.name} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, background: '#fff', border: '1px solid #eee' }} />
                                                        </div>
                                                        {/* Màu sắc */}
                                                        <div className="cart-col cart-col-color d-flex align-items-center" style={{ width: 120, minWidth: 120 }}>
                                                            {item.availableColors && item.availableColors.length > 0 && (
                                                                <>
                                                                    <span className="me-2">Màu:</span>
                                                                    <select
                                                                        className="form-select form-select-sm"
                                                                        style={{ width: 'auto', minWidth: 60 }}
                                                                        value={item.color || ''}
                                                                        onChange={(e) => handleAttributeChange(item.id, item.color, item.size, 'color', e.target.value)}
                                                                    >
                                                                        {item.availableColors.map((colorOption) => (
                                                                            <option key={colorOption} value={colorOption}>{colorOption}</option>
                                                                        ))}
                                                                    </select>
                                                                </>
                                                            )}
                                                        </div>
                                                        {/* Kích thước */}
                                                        <div className="cart-col cart-col-size d-flex align-items-center" style={{ width: 120, minWidth: 120 }}>
                                                            {item.availableSizes && item.availableSizes.length > 0 && (
                                                                <>
                                                                    <span className="me-2">Kích thước:</span>
                                                                    <select
                                                                        className="form-select form-select-sm"
                                                                        style={{ width: 'auto', minWidth: 60 }}
                                                                        value={item.size || ''}
                                                                        onChange={(e) => handleAttributeChange(item.id, item.color, item.size, 'size', e.target.value)}
                                                                    >
                                                                        {item.availableSizes.map((sizeOption) => (
                                                                            <option key={sizeOption} value={sizeOption}>{sizeOption}</option>
                                                                        ))}
                                                                    </select>
                                                                </>
                                                            )}
                                                        </div>
                                                        {/* Giá */}
                                                        <div className="cart-col cart-col-price d-flex align-items-center justify-content-end" style={{ width: 120, minWidth: 120, textAlign: 'right', fontWeight: 600, fontSize: 16, color: '#222' }}>
                                                            {item.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                                        </div>
                                                        {/* Số lượng */}
                                                        <div className="cart-col cart-col-qty d-flex align-items-center justify-content-center" style={{ width: 130, minWidth: 130 }}>
                                                            <button className="btn btn-outline-secondary btn-sm me-1" onClick={() => handleUpdateQuantity(item.id, item.color, item.size, Math.max(1, item.quantity - 1))}>
                                                                <i className="bi bi-dash"></i>
                                                            </button>
                                                            <input
                                                                type="number"
                                                                className="form-control text-center"
                                                                style={{ width: 50 }}
                                                                value={item.quantity}
                                                                min="1"
                                                                max={item.stock}
                                                                onChange={e => {
                                                                    const rawValue = parseInt(e.target.value, 10);
                                                                    const newQuantity = isNaN(rawValue) ? 1 : Math.max(1, Math.min(item.stock, rawValue));
                                                                    if (newQuantity !== item.quantity) {
                                                                        handleUpdateQuantity(item.id, item.color, item.size, newQuantity);
                                                                    }
                                                                }}
                                                            />
                                                            <button
                                                                className="btn btn-outline-secondary btn-sm ms-1"
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
                                                        {/* Tổng tiền */}
                                                        <div className="cart-col cart-col-total d-flex align-items-center justify-content-end" style={{ width: 120, minWidth: 120, textAlign: 'right', fontWeight: 600, fontSize: 16, color: '#e53935' }}>
                                                            {(item.price * item.quantity).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                                        </div>
                                                        {/* Nút xóa */}
                                                        <div className="cart-col cart-col-remove d-flex align-items-center justify-content-center" style={{ width: 70, minWidth: 70, textAlign: 'center' }}>
                                                            <button className="btn btn-link text-danger p-0" style={{ fontSize: 15 }} onClick={() => handleRemoveFromCart(item.id, item.color, item.size)}>
                                                                Xóa
                                                            </button>
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