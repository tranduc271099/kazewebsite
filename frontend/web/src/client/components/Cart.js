import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CartContext } from '../context/CartContext';
import ApplyVoucher from '../pages/ApplyVoucher';

function Cart() {
    const { cartItems, removeFromCart, updateQuantity, clearCart, updateCartItemAttributes } = useContext(CartContext);

    const [total, setTotal] = useState(0);
    const [shipping, setShipping] = useState(4990);
    const [tax, setTax] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [selectedItems, setSelectedItems] = useState({});
    const [selectAll, setSelectAll] = useState(true);
    const [voucherModalOpen, setVoucherModalOpen] = useState(false);
    const [selectedVoucher, setSelectedVoucher] = useState('');
    const [voucherDiscount, setVoucherDiscount] = useState(0);

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
        <div className="cart-main-container">
            <div className="cart-kaze-container" style={{ background: '#f5f5f5', minHeight: '100vh', padding: '30px 0' }}>
                <div className="cart-promo-box" style={{ background: '#fffbe7', border: '1px solid #ffe58f', padding: 16, marginBottom: 16, borderRadius: 4 }}>
                    <span className="cart-promo-label" style={{ color: '#ee4d2d', fontWeight: 600, border: '1px solid #ee4d2d', borderRadius: 2, padding: '2px 8px', marginRight: 8, background: '#fff' }}>Combo khuyến mãi</span>
                    Mua thêm <b>2 sản phẩm</b> để giảm <b>₫5.000</b>
                </div>
                <div className="cart-main-box" style={{ background: '#fff', borderRadius: 4, boxShadow: '0 1px 2px rgba(0,0,0,0.03)', padding: 0 }}>
                    {/* Header */}
                    <div className="cart-header-row" style={{ display: 'flex', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #f0f0f0' }}>
                        <input type="checkbox" checked={selectAll} onChange={e => {
                            setSelectAll(e.target.checked);
                            const newSelected = {};
                            if (e.target.checked) {
                                cartItems.forEach(item => {
                                    newSelected[`${item.id}-${item.color}-${item.size}`] = true;
                                });
                            }
                            setSelectedItems(newSelected);
                        }} style={{ marginRight: 16 }} />
                        <span style={{ flex: 1.2 }}>Sản phẩm</span>
                        <span style={{ flex: 0.7, textAlign: 'center' }}>Đơn giá</span>
                        <span style={{ flex: 0.7, textAlign: 'center' }}>Số lượng</span>
                        <span style={{ flex: 0.7, textAlign: 'center' }}>Thành tiền</span>
                        <span style={{ width: 70, textAlign: 'center' }}>Thao tác</span>
                    </div>
                    {/* Cart Items */}
                    {cartItems.map((item) => {
                        const itemId = `${item.id}-${item.color}-${item.size}`;
                        return (
                            <div key={itemId} className="cart-item-row" style={{ display: 'flex', alignItems: 'center', padding: '24px', borderBottom: '1px solid #f0f0f0', background: '#fff' }}>
                                <input
                                    type="checkbox"
                                    checked={selectedItems[itemId] || false}
                                    onChange={e => setSelectedItems(prev => ({ ...prev, [itemId]: e.target.checked }))}
                                    style={{ marginRight: 16 }}
                                />
                                <div style={{ flex: 2, display: 'flex', alignItems: 'center' }}>
                                    <img src={item.image} alt={item.name} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4, border: '1px solid #eee', marginRight: 16 }} />
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{item.name}</div>
                                        <div style={{ fontSize: 13, color: '#888', margin: '4px 0' }}>Phân Loại Hàng: <b>{item.color}, size {item.size}</b></div>
                                        <div style={{ display: 'flex', gap: 8, margin: '4px 0' }}>
                                            <img src="https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/cart/9c49e1e2e6e7b1e7b6e2b7e7b7e7b7e7.png" alt="Voucher" style={{ height: 18 }} />
                                            <img src="https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/cart/2e49e1e2e6e7b1e7b6e2b7e7b7e7b7e7.png" alt="Kaze Siêu Rẻ" style={{ height: 18 }} />
                                        </div>
                                    </div>
                                </div>
                                <div style={{ flex: 1, textAlign: 'center' }}>
                                    <span style={{ color: '#888', textDecoration: 'line-through', marginRight: 4 }}>{getOldPrice(item.price).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
                                    <span style={{ color: '#ee4d2d', fontWeight: 600 }}>{item.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
                                </div>
                                <div style={{ flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <button className="btn btn-outline-secondary btn-sm me-1" onClick={() => handleUpdateQuantity(item.id, item.color, item.size, Math.max(1, item.quantity - 1))}>-</button>
                                    <input type="number" className="form-control text-center" style={{ width: 60, display: 'inline-block' }} value={item.quantity} min="1" max={item.stock} onChange={e => {
                                        const rawValue = parseInt(e.target.value, 10);
                                        const newQuantity = isNaN(rawValue) ? 1 : Math.max(1, Math.min(item.stock, rawValue));
                                        if (newQuantity !== item.quantity) {
                                            handleUpdateQuantity(item.id, item.color, item.size, newQuantity);
                                        }
                                    }} />
                                    <button className="btn btn-outline-secondary btn-sm ms-1" onClick={() => handleUpdateQuantity(item.id, item.color, item.size, Math.min(item.stock, item.quantity + 1))}>+</button>
                                </div>
                                <div style={{ flex: 1, textAlign: 'center', color: '#ee4d2d', fontWeight: 600 }}>
                                    {(item.price * item.quantity).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                </div>
                                <div style={{ width: 70, textAlign: 'center' }}>
                                    <button className="btn btn-link text-danger p-0" style={{ fontSize: 15 }} onClick={() => handleRemoveFromCart(item.id, item.color, item.size)}>Xóa</button>
                                    <div style={{ fontSize: 13, color: '#ee4d2d', cursor: 'pointer' }}>Tìm sản phẩm tương tự</div>
                                </div>
                            </div>
                        );
                    })}
                    {/* Vận chuyển */}
                    <div className="cart-shipping-info" style={{ background: '#fafdff', borderTop: '1px solid #f0f0f0', padding: 16, color: '#222', fontSize: 15 }}>
                        <span style={{ color: '#26aa99', fontWeight: 500 }}>Giảm ₫700.000 phí vận chuyển đơn tối thiểu ₫0; Giảm ₫1.000.000 phí vận chuyển đơn tối thiểu ₫500.000 </span>
                        <Link to="#" style={{ marginLeft: 8, color: '#05a', textDecoration: 'underline' }}>Tìm hiểu thêm</Link>
                    </div>
                </div>
                {/* Footer: Chọn tất cả, xóa, lưu, voucher, tổng tiền, mua hàng */}
                <div className="cart-footer-bar" style={{ background: '#fff', borderRadius: 4, marginTop: 16, padding: '24px', display: 'flex', alignItems: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
                    <input type="checkbox" checked={selectAll} onChange={e => {
                        setSelectAll(e.target.checked);
                        const newSelected = {};
                        if (e.target.checked) {
                            cartItems.forEach(item => {
                                newSelected[`${item.id}-${item.color}-${item.size}`] = true;
                            });
                        }
                        setSelectedItems(newSelected);
                    }} style={{ marginRight: 16 }} />
                    <span style={{ marginRight: 16 }}>Chọn Tất Cả ({cartItems.length})</span>
                    <button className="btn btn-link text-danger p-0 me-3" onClick={clearCart}>Xóa</button>
                    <span className="me-3" style={{ color: '#ee4d2d', cursor: 'pointer' }}>Lưu vào mục Đã thích</span>
                    <div style={{ flex: 1 }}></div>
                    <div className="cart-voucher-box me-4">
                        <span style={{ color: '#ee4d2d', fontWeight: 500, marginRight: 8 }}><i className="bi bi-ticket"></i> Kaze Voucher</span>
                        <ApplyVoucher
                            cartTotal={subtotalDisplay}
                            onDiscountApplied={(discountValue) => setVoucherDiscount(discountValue)}
                            voucherCode={selectedVoucher}
                        />
                    </div>
                    <div className="cart-total-box me-4" style={{ fontSize: 18, fontWeight: 600, color: '#ee4d2d' }}>
                        Tổng cộng ({Object.values(selectedItems).filter(Boolean).length} Sản phẩm): 
                        <span style={{ fontSize: 22 }}>
                            {(subtotalDisplay - voucherDiscount > 0 ? subtotalDisplay - voucherDiscount : 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                        </span>
                        {voucherDiscount > 0 && (
                            <div style={{ fontSize: 15, color: '#16a34a', fontWeight: 400 }}>
                                Đã giảm: -{voucherDiscount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                            </div>
                        )}
                    </div>
                    <button className="btn btn-danger btn-lg" style={{ minWidth: 140 }}>Mua Hàng</button>
                </div>
            </div>
        </div>
    );
}

export default Cart; 