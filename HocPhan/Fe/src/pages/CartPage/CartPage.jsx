import CartTableComponent from '../../components/CartTableComponent/CartTableComponent';
import { useSelector, useDispatch } from 'react-redux';
import './CartPage.scss';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Footer from '../../components/Footer/Footer';
import ProductListSection from '../../components/ProductListSection/ProductListSection';
import NavigationPathComponent from '../../components/NavigationPathComponent/NavigationPathComponent';
import { alertError } from '../../utils/alert';
import * as VoucherService from '../../services/Voucher.Service';
import VoucherSelectorComponent from '../../components/VoucherSelectorComponent/VoucherSelectorComponent';
import { applyVoucher, removeVoucher } from '../../redux/slices/CartSlice';

const CartPage = () => {
  const cart = useSelector((state) => state.cart);
  const user = useSelector((state) => state.user);
  const appliedVoucher = useSelector((state) => state.cart.appliedVoucher);
  const dispatch = useDispatch();

  const [cartTotalPrice, setCartTotalPrice] = useState(0);
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const totalPrice = cart.items?.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    setCartTotalPrice(totalPrice || 0);
  }, [cart]);

  useEffect(() => {
    if (appliedVoucher) {
      setCouponInput(appliedVoucher.code);
    } else {
      setCouponInput('');
    }
  }, [appliedVoucher]);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      setCouponError('Vui lòng nhập mã giảm giá');
      return;
    }
    setIsCheckingCoupon(true);
    setCouponError('');
    try {
      const res = await VoucherService.check(
        { code: couponInput.trim(), cartTotal: cartTotalPrice },
        user?.id,
        user?.access_token
      );
      if (res?.status === 'OK' && res?.data) {
        dispatch(applyVoucher(res.data));
        setCouponError('');
      } else {
        setCouponError(res?.message || 'Áp dụng mã thất bại');
      }
    } catch (err) {
      setCouponError(err.message || 'Mã giảm giá không hợp lệ hoặc đã hết hạn');
      dispatch(removeVoucher());
    } finally {
      setIsCheckingCoupon(false);
    }
  };

  const handleSelectVoucher = (voucher) => {
    dispatch(applyVoucher(voucher));
    setCouponError('');
  };

  const handleRemoveCoupon = () => {
    dispatch(removeVoucher());
    setCouponError('');
  };

  const handleCheckout = () => {
    if (!cart.items?.length) return;
    for (const item of cart.items) {
      const stock = item.product?.stock || 0;
      if (item.quantity > stock) {
        alertError("Thất bại", `Sản phẩm ${item.product?.name || 'không xác định'} vượt quá số lượng tồn kho (chỉ còn ${stock} kg)`);
        return;
      }
    }
    navigate('/checkout');
  };

  let discount = 0;
  if (appliedVoucher) {
    discount = (cartTotalPrice * appliedVoucher.discountValue) / 100;
    if (appliedVoucher.maxDiscountValue > 0 && discount > appliedVoucher.maxDiscountValue) {
      discount = appliedVoucher.maxDiscountValue;
    }
  }
  const finalPrice = Math.max(0, Math.floor(cartTotalPrice - discount));

  return (
    <div className="container">
      <NavigationPathComponent category="Giỏ hàng" />
      <div className="cart_page">
        {cart?.items?.length > 0 ? (
          <>
            <div>
              <CartTableComponent cartItems={cart.items} />
            </div>
            <div className="cart_btn">
              <div className="order_summary">
                <div className="summary_row">
                  <span>Tạm tính ({cart.total} sản phẩm)</span>
                  <span className="price">{cartTotalPrice?.toLocaleString()}₫</span>
                </div>

                {discount > 0 && (
                  <div className="summary_row" style={{ color: '#ff4d4f' }}>
                    <span>Giảm giá ({appliedVoucher.code})</span>
                    <span className="price">-{discount.toLocaleString()}₫</span>
                  </div>
                )}

                <div className="summary_row">
                  <span>Tổng tiền</span>
                  <span className="price">{finalPrice?.toLocaleString()}₫</span>
                </div>
              </div>

              {/* Coupon section */}
              <div className="coupon_section" style={{ margin: '15px 0', border: '1px dashed #22c55e', padding: '12px', borderRadius: '12px', backgroundColor: '#f8fafc' }}>
                {/* Row 1: Input */}
                <div style={{ marginBottom: '8px' }}>
                  <input
                    type="text"
                    placeholder="Nhập mã giảm giá..."
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    disabled={!!appliedVoucher}
                    style={{
                      width: '100%',
                      height: '38px',
                      boxSizing: 'border-box',
                      padding: '8px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>
                {/* Row 2: Buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  {appliedVoucher ? (
                    <button 
                      onClick={handleRemoveCoupon}
                      style={{
                        flex: 1,
                        height: '38px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '14px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      Hủy mã
                    </button>
                  ) : (
                    <button 
                      onClick={handleApplyCoupon} 
                      disabled={isCheckingCoupon}
                      style={{
                        flex: 1,
                        height: '38px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: '#22c55e',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '14px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isCheckingCoupon ? 'Đang check...' : 'Áp dụng'}
                    </button>
                  )}
                  <div style={{ flex: 1 }}>
                    <VoucherSelectorComponent
                      cartTotal={cartTotalPrice}
                      onSelect={handleSelectVoucher}
                    />
                  </div>
                </div>
                {couponError && <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px', fontWeight: 500 }}>{couponError}</div>}
                {appliedVoucher && (
                  <div style={{ color: '#16a34a', fontSize: '13px', marginTop: '6px', fontWeight: 500 }}>
                    Đã áp dụng mã <strong>{appliedVoucher.code}</strong> (Giảm {appliedVoucher.discountValue}%)
                  </div>
                )}
              </div>

              <div className="btn_checkout" onClick={handleCheckout}>
                Tiến hành thanh toán
              </div>

              <div className="btn_home" onClick={() => navigate('/')}>
                Tiếp tục mua hàng
              </div>
            </div>
          </>
        ) : (
          <div className="btn_home" onClick={() => navigate('/')}>
            Tiếp tục mua hàng
          </div>
        )}
      </div>
      <ProductListSection
        title="Sản phẩm đang trong thời gian khuyến mãi"
        queryKey="saleProducts"
        keySort="discount"
        valueSort={-1}
      />

      <ProductListSection
        title="Sản phẩm mới nhất"
        queryKey="newProducts"
        keySort="createdAt"
        valueSort={-1}
      />
    </div>
  );
};

export default CartPage;
