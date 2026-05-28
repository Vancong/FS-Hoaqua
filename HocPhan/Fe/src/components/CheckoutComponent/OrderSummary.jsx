import React, { useEffect } from 'react';
import './CheckoutComponent.scss';
import { useNavigate } from 'react-router-dom';

const OrderSummary = ({
  cartItems,
  handleOrder,
  setOrderSummary,
  orderSummary,
  paymentMethod,
}) => {
  const navigate = useNavigate();

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

    const finalPrice = Math.max(0, Math.floor(total + shipping));

    setOrderSummary({
      totalPrice: total,
      shipping,
      discountCode: null,
      discountValue: 0,
      finalPrice,
    });
  }, [cartItems, setOrderSummary]);

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
