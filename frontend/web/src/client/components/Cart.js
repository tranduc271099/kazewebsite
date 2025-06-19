import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CartContext } from '../context/CartContext';

function Cart() {
    const { cartItems, removeFromCart, updateQuantity, clearCart, updateCartItemAttributes } = useContext(CartContext);

    const [total, setTotal] = useState(0);
    const [shipping, setShipping] = useState(4990);
    const [tax, setTax] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [selectedItems, setSelectedItems] = useState({});

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
        const subtotal = cartItems.reduce((acc, item) => {
            const itemId = `${item.id}-${item.color}-${item.size}`;
            if (selectedItems[itemId]) {
                return acc + (item.price * item.quantity);
            }
            return acc;
        }, 0);
        const taxValue = Math.round(subtotal * 0.1);
        setTax(taxValue);
        setTotal(subtotal + shipping + taxValue - discount);

        // Ensure free shipping is only selected if subtotal is over 300,000
        if (shipping === 0 && subtotal < 300000) {
            setShipping(4990); // Default back to standard shipping
        }

    }, [cartItems, shipping, tax, discount, selectedItems]);

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

    const handleShippingChange = (value) => {
        setShipping(value);
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

    if (cartItems.length === 0) {
        return (
            <div className="empty-cart text-center py-5">
                <i className="bi bi-cart-x" style={{ fontSize: '4rem', color: '#ccc' }}></i>
                <h3 className="mt-3">Giỏ hàng trống</h3>
                <p className="text-muted">Thêm sản phẩm vào giỏ hàng để xem ở đây</p>
                <Link to="/category" className="btn btn-primary mt-3">
                    Tiếp tục mua sắm
                </Link>
            </div>
        );
    }

    // Calculate subtotal for display, chỉ tính sản phẩm được chọn
    const subtotalDisplay = cartItems.reduce((acc, item) => {
        const itemId = `${item.id}-${item.color}-${item.size}`;
        if (selectedItems[itemId]) {
            return acc + (item.price * item.quantity);
        }
        return acc;
    }, 0);

    // Giả lập giá gốc cao hơn 1% để hiển thị giá gạch ngang
    const getOldPrice = (price) => Math.round(price * 1.01);

    return (
        <div className="container py-5" style={{ paddingBottom: '100px' }}>
            <div className="row justify-content-center" style={{ marginTop: '20px' }}>
                {/* Cart Items */}
                <div className="col-lg-8 mb-4">
                    <div className="card shadow-sm border-0">
                        <div className="card-body p-4">
                            <h4 className="mb-4" style={{ fontWeight: 600 }}>GIỎ HÀNG</h4>
                            {cartItems.map((item) => {
                                const itemId = `${item.id}-${item.color}-${item.size}`;
                                return (
                                    <div key={itemId} className="d-flex align-items-center mb-4 p-3 rounded" style={{ background: '#fafbfc', border: '1px solid #e5e7eb' }}>
                                        <input
                                            type="checkbox"
                                            className="form-check-input me-3"
                                            checked={selectedItems[itemId] || false}
                                            onChange={(e) => handleItemSelection(itemId, e.target.checked)}
                                            style={{ transform: 'scale(1.5)' }}
                                        />
                                        <img src={item.image} alt={item.name} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, background: '#fff', border: '1px solid #eee' }} />
                                        <div className="flex-grow-1 ms-3">
                                            <div style={{ fontWeight: 500, fontSize: 18 }}>{item.name}</div>
                                            <div className="d-flex gap-3 mt-1 mb-2">
                                                {/* Color Dropdown */}
                                                {item.availableColors && item.availableColors.length > 0 && (
                                                    <div className="d-flex align-items-center">
                                                        <span className="me-2">Màu:</span>
                                                        <select
                                                            className="form-select form-select-sm"
                                                            style={{ width: 'auto' }}
                                                            value={item.color || ''}
                                                            onChange={(e) => handleAttributeChange(item.id, item.color, item.size, 'color', e.target.value)}
                                                        >
                                                            {item.availableColors.map((colorOption) => (
                                                                <option key={colorOption} value={colorOption}>{colorOption}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}

                                                {/* Size Dropdown */}
                                                {item.availableSizes && item.availableSizes.length > 0 && (
                                                    <div className="d-flex align-items-center ms-3">
                                                        <span className="me-2">Kích thước:</span>
                                                        <select
                                                            className="form-select form-select-sm"
                                                            style={{ width: 'auto' }}
                                                            value={item.size || ''}
                                                            onChange={(e) => handleAttributeChange(item.id, item.color, item.size, 'size', e.target.value)}
                                                        >
                                                            {item.availableSizes.map((sizeOption) => (
                                                                <option key={sizeOption} value={sizeOption}>{sizeOption}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}
                                            </div>
                                            <button className="btn btn-link text-danger p-0" style={{ fontSize: 15 }} onClick={() => handleRemoveFromCart(item.id, item.color, item.size)}>
                                                <i className="bi bi-trash"></i> Xóa
                                            </button>
                                        </div>
                                        <div className="text-center me-3">
                                            <div style={{ fontWeight: 600, fontSize: 18 }}>{getOldPrice(item.price).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</div>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <button className="btn btn-outline-secondary btn-sm me-1" onClick={() => handleUpdateQuantity(item.id, item.color, item.size, Math.max(1, item.quantity - 1))}>
                                                <i className="bi bi-dash"></i>
                                            </button>
                                            <input
                                                type="number"
                                                className="form-control text-center"
                                                style={{ width: 80 }}
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
                                        <div className="text-end ms-3">
                                            {(item.price * item.quantity).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                        </div>
                                    </div>
                                );
                            })}
                            {/* Coupon and actions */}
                            <div className="d-flex justify-content-between align-items-center mt-4">
                                <div className="input-group" style={{ maxWidth: 300 }}>
                                    <input type="text" className="form-control" placeholder="Mã giảm giá" />
                                    <button className="btn btn-primary" type="button">Áp dụng</button>
                                </div>
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
                        <div className="card-body p-4">
                            <h5 className="mb-4" style={{ fontWeight: 600 }}>Thông tin đơn hàng</h5>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Tạm tính</span>
                                <span>{subtotalDisplay.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
                            </div>
                            <div className="mb-2">
                                <span>Vận chuyển</span>
                                <div className="form-check mt-2">
                                    <input className="form-check-input" type="radio" name="shipping" id="standard" checked={shipping === 4990} onChange={() => setShipping(4990)} />
                                    <label className="form-check-label" htmlFor="standard">Giao hàng tiêu chuẩn - {(4990).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</label>
                                </div>
                                <div className="form-check">
                                    <input className="form-check-input" type="radio" name="shipping" id="express" checked={shipping === 12990} onChange={() => setShipping(12990)} />
                                    <label className="form-check-label" htmlFor="express">Giao hàng nhanh - {(12990).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</label>
                                </div>
                                <div className="form-check">
                                    <input className="form-check-input" type="radio" name="shipping" id="free" checked={shipping === 0} onChange={() => setShipping(0)} disabled={total < 300000} />
                                    <label className="form-check-label" htmlFor="free">Miễn phí vận chuyển (Đơn trên {(300000).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })})</label>
                                </div>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Thuế</span>
                                <span>{tax.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Giảm giá</span>
                                <span className="text-success">-{discount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span style={{ fontWeight: 600, fontSize: 18 }}>Tổng cộng</span>
                                <span style={{ fontWeight: 700, fontSize: 22 }}>{total.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
                            </div>
                            <button className="btn btn-primary w-100 mb-2" style={{ fontWeight: 600, fontSize: 16 }}>Thanh toán &rarr;</button>
                            <Link to="/products" className="btn btn-link w-100">&larr; Tiếp tục mua sắm</Link>
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
    );
}

export default Cart; 