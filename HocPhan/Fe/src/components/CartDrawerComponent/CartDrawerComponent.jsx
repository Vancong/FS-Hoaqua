
import { Drawer } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import './CartDrawerComponent.scss'
import { useNavigate } from 'react-router-dom';
import { increaseQuantity, decreaseQuantity, removeCart } from '../../redux/slices/CartSlice';
import *as CartService from "../../services/Cart.Service"
import { useQueryClient } from '@tanstack/react-query';
import { alertError } from "../../utils/alert"
import { getFruitImage } from '../../utils/getFruitImage';

const CartDrawerComponent = ({ open, onClose }) => {
  const cartItems = useSelector(state => state.cart.items);
  const total = useSelector((state) => state.cart.total);
  const totalPrice = useSelector((state) => state.cart.totalPrice);
  const user = useSelector((state) => state.user)
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleNatvigate = (slug) => {
    navigate(`/product-details/${slug}`);
    onClose();
  }

  const handleIncrease = async (productId) => {
    const data = { productId, userId: user?.id }
    try {
      await CartService.increaseQuantity(user?.id, user?.access_token, data);
      dispatch(increaseQuantity({ productId }));
      queryClient.invalidateQueries(['cart']);
    } catch (err) {
      alertError("Thất bại", err.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleDecrease = async (productId) => {
    const items = cartItems.find((item) => item.product._id === productId);
    if (items.quantity <= 1) {
      handleRemove(productId);
      return;
    }
    const data = { productId, userId: user?.id }
    await CartService.decreaseQuantity(user?.id, user?.access_token, data);
    dispatch(decreaseQuantity({ productId }));
    queryClient.invalidateQueries(['cart']);
  };

  const handleRemove = async (productId) => {
    const data = { productId, userId: user?.id }
    await CartService.deleteProductInCart(user?.id, user?.access_token, data);
    dispatch(removeCart({ productId }));
    queryClient.invalidateQueries(['cart']);
  };

  return (
    <Drawer title={`Giỏ hàng của bạn -  Có ${total} sản phẩm `}
      width={window.innerWidth <= 768 ? '100%' : 500}
      placement="right" onClose={onClose} open={open}
      bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      <div className='cart_body'>
        {cartItems.length === 0 ? (
          <p>Giỏ hàng trống.</p>
        ) : (
          cartItems.map((item) => (
            <div key={item.product._id} className='cart_drawer'>
              <div className='cart_img'>
                <img
                  src={getFruitImage(item.product?.name, item.product?.images?.[0] || item.product?.image || '')}
                  alt={item.product?.name}
                />
              </div>
              <div className='info_product'>
                <h2 className='title_product' onClick={() => handleNatvigate(item.product._id)}>
                  {item.product.name}
                </h2>
                <p className='button_remove' onClick={() => handleRemove(item.product._id)}>x</p>
                <div className='controls'>
                  <span className='button_quantity' onClick={() => handleDecrease(item.product._id)}>-</span>
                  <span>{item.quantity} kg</span>
                  <span className='button_quantity' onClick={() => handleIncrease(item.product._id)}>+</span>
                  <span className='quantiy_price'> {item.quantity} kg × {item.price.toLocaleString()}₫/kg</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className='cart_footer'>
        <div className='free_ship'>MIỄN PHÍ VẬN CHUYỂN CHO ĐƠN HÀNG TRÊN 1.000.000₫</div>
        <div className='btn_click_cart' onClick={() => { navigate('/cart'); onClose(); }}> Xem giỏ hàng</div>
        <div className='total_cart'>
          <span>Tổng cộng:</span>
          <span>{totalPrice.toLocaleString()}₫</span>
        </div>
        <div className='checkout_btn' onClick={() => { navigate('/checkout'); onClose(); }}>Thanh toán</div>
      </div>
    </Drawer>
  );
};

export default CartDrawerComponent;
