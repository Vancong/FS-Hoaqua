import React, { useEffect, useState } from 'react';
import './CheckoutComponent.scss';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import * as VoucherService from '../../services/Voucher.Service';
import VoucherSelectorComponent from '../VoucherSelectorComponent/VoucherSelectorComponent';
import { applyVoucher, removeVoucher } from '../../redux/slices/CartSlice';

const OrderSummary = ({
  cartItems,
  handleOrder,
  setOrderSummary,
  orderSummary,
  paymentMethod,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const appliedVoucher = useSelector((state) => state.cart.appliedVoucher);

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);

  useEffect(() => {
    if (appliedVoucher) {
      setCouponInput(appliedVoucher.code);
    } else {
      setCouponInput('');
    }
  }, [appliedVoucher]);

  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      setOrderSummary({
        totalPrice: 0,
        shipping: 0,
        discountCode: null,
        discountValue: 0,
        finalPrice: 0,
      });
      return;
    }

    const total = cartItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    let shipping = 28000;
    if (total >= 1000000) {
      shipping = 0;
    }

    let discount = 0;
    if (appliedVoucher) {
      discount = (total * appliedVoucher.discountValue) / 100;
      if (appliedVoucher.maxDiscountValue > 0 && discount > appliedVoucher.maxDiscountValue) {
        discount = appliedVoucher.maxDiscountValue;
      }
    }

    const finalPrice = Math.max(0, Math.floor(total + shipping - discount));

    setOrderSummary({
      totalPrice: total,
      shipping,
      discountCode: appliedVoucher ? appliedVoucher.code : null,
      discountValue: discount,
      finalPrice,
    });
  }, [cartItems, appliedVoucher, setOrderSummary]);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      setCouponError('Vui lòng nhập mã giảm giá');
      return;
    }
    setIsCheckingCoupon(true);
    setCouponError('');
    try {
      const total = cartItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
      const res = await VoucherService.check(
        { code: couponInput.trim(), cartTotal: total },
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

  const totalPrice = cartItems?.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  ) || 0;

  return (
    <div className="checkout_right">
      <h2>Đặt hàng</h2>
      <table className="order_summary_table">
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>Sản phẩm</th>
            <th style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>Tổng cộng</th>
          </tr>
        </thead>
        <tbody>
          {cartItems?.length > 0 ? (
            cartItems.map((item) => (
              <tr key={item.product._id}>
                <td style={{ display: 'flex', alignItems: 'center' }}>
                  <img
                    src={item.product?.images?.[0] || item.product?.image || ''}
                    alt={item.product?.name}
                    style={{
                      width: '60px',
                      marginRight: '8px',
                      verticalAlign: 'middle',
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 500 }}>{item.product.name}</div>
                    <div style={{ fontSize: '14px', color: '#555' }}>
                      {item.quantity} kg × {item.price?.toLocaleString()}₫/kg
                    </div>
                  </div>
                </td>
                <td
                  style={{
                    textAlign: 'right',
                    fontWeight: 600,
                    verticalAlign: 'middle',
                    fontSize: '18px',
                  }}
                >
                  {(item.quantity * item.price).toLocaleString()}₫
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={2} style={{ textAlign: 'center', padding: '16px', color: '#888' }}>
                Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi thanh toán.
              </td>
            </tr>
          )}

          <tr>
            <td>
              <strong>Tổng cộng</strong>
            </td>
            <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
              {orderSummary?.totalPrice?.toLocaleString()}₫
            </td>
          </tr>

          {orderSummary?.discountValue > 0 && (
            <tr>
              <td>
                <strong>Giảm giá ({orderSummary?.discountCode})</strong>
              </td>
              <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#ff4d4f' }}>
                -{orderSummary?.discountValue?.toLocaleString()}₫
              </td>
            </tr>
          )}

          <tr>
            <td>
              <strong>Phí ship</strong>
            </td>
            <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
              {orderSummary?.shipping?.toLocaleString()}₫
            </td>
          </tr>

          <tr>
            <td>
              <strong>Tổng tiền</strong>
            </td>
            <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
              {orderSummary?.finalPrice?.toLocaleString()}₫
            </td>
          </tr>
        </tbody>
      </table>

      {/* Coupon input section */}
      <div className="coupon_section">
        {/* Row 1: Input */}
        <div style={{ marginBottom: '8px' }}>
          <input
            type="text"
            placeholder="Nhập mã giảm giá..."
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value)}
            disabled={!!appliedVoucher}
            className="coupon_input"
            style={{ width: '100%', height: '38px', boxSizing: 'border-box' }}
          />
        </div>
        {/* Row 2: Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {appliedVoucher ? (
            <button 
              className="coupon_btn_remove" 
              onClick={handleRemoveCoupon}
              style={{ flex: 1, height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              Hủy mã
            </button>
          ) : (
            <button 
              className="coupon_btn_apply" 
              onClick={handleApplyCoupon} 
              disabled={isCheckingCoupon}
              style={{ flex: 1, height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap' }}
            >
              {isCheckingCoupon ? 'Đang check...' : 'Áp dụng'}
            </button>
          )}
          <div style={{ flex: 1 }}>
            <VoucherSelectorComponent
              cartTotal={totalPrice}
              onSelect={handleSelectVoucher}
            />
          </div>
        </div>
        {couponError && <div className="coupon_error">{couponError}</div>}
        {appliedVoucher && (
          <div className="coupon_success">
            Đã áp dụng mã <strong>{appliedVoucher.code}</strong> (Giảm {appliedVoucher.discountValue}%)
          </div>
        )}
      </div>

      <p className="privacy_note">
        Thông tin cá nhân của bạn sẽ được sử dụng để xử lý đơn hàng theo{' '}
        <a href="#">chính sách bảo mật</a>.
      </p>

      {(paymentMethod === 'cod' || paymentMethod === 'vnpay') && (
        <div className="order_btn" onClick={() => handleOrder()}>
          {paymentMethod === 'vnpay' ? 'Thanh toán VNPay' : 'Đặt hàng'}
        </div>
      )}

      <div className="cart_btn" onClick={() => navigate('/cart')}>
        Quay lại giỏ hàng
      </div>
    </div>
  );
};

export default OrderSummary;
