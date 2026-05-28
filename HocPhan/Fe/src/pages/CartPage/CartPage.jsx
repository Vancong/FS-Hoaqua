import CartTableComponent from '../../components/CartTableComponent/CartTableComponent';
import { useSelector } from 'react-redux';
import './CartPage.scss';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Footer from '../../components/Footer/Footer';
import ProductListSection from '../../components/ProductListSection/ProductListSection';
import NavigationPathComponent from '../../components/NavigationPathComponent/NavigationPathComponent';

const CartPage = () => {
  const cart = useSelector((state) => state.cart);
  const [cartTotalPrice, setCartTotalPrice] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const totalPrice = cart.items?.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    setCartTotalPrice(totalPrice || 0);
  }, [cart]);

  const handleCheckout = () => {
    if (!cart.items?.length) return;
    navigate('/checkout');
  };

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

                <div className="summary_row">
                  <span>Tổng tiền</span>
                  <span className="price">{cartTotalPrice?.toLocaleString()}₫</span>
                </div>
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
