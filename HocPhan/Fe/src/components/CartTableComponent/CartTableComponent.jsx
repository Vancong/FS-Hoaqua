import { Table, Image } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { Fomater } from '../../utils/fomater';
import *as CartService from "../../services/Cart.Service";
import { increaseQuantity, decreaseQuantity, removeCart } from '../../redux/slices/CartSlice';
import "./CartTableComponent.scss"
import { useDispatch, useSelector } from 'react-redux';
import { alertError } from "../../utils/alert"
import { useNavigate } from 'react-router-dom';
import { getFruitImage } from '../../utils/getFruitImage';

const CartTableComponent = ({ cartItems }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user)
  const navigate = useNavigate();

  const handleIncrease = async (productId) => {
    const data = { productId, userId: user?.id }
    try {
      await CartService.increaseQuantity(user?.id, user?.access_token, data);
      dispatch(increaseQuantity({ productId }));
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
  };

  const handleRemove = async (productId) => {
    const data = { productId, userId: user?.id }
    await CartService.deleteProductInCart(user?.id, user?.access_token, data);
    dispatch(removeCart({ productId }));
  };

  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'product',
      key: 'product',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Image 
            src={getFruitImage(record.product?.name, record.product?.images?.[0] || record.product?.image || '')} 
            width={60} 
            height={60} 
          />
          <div>
            <div onClick={() => navigate(`/product-details/${record.product?._id || record.product?.slug}`)}
              className='title_product_cart'>{record.product.name}
            </div>
            <div className='btn_delete_cart' onClick={() => handleRemove(record.product._id)}>
              <DeleteOutlined />
              <span style={{ paddingLeft: 8 }}>Xóa</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Giá / kg',
      dataIndex: 'price',
      key: 'price',
      render: (price) => (
        <span className="price_cart">{Fomater(price)}</span>
      )
    },
    {
      title: 'Số kg',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (_, record) => (
        <div className='controls'>
          <span className='button_quantity' onClick={() => handleDecrease(record.product._id)}>-</span>
          <span>{record.quantity} kg</span>
          <span className='button_quantity' onClick={() => handleIncrease(record.product._id)}>+</span>
        </div>
      )
    },
    {
      title: 'Tổng',
      key: 'total',
      render: (_, record) => (
        <span className="total_cart">{Fomater(record.quantity * record.price)}</span>
      )
    }
  ];

  return (
    <div className="cart-table-wrapper">
      <Table
        className="cart-table"
        columns={columns}
        dataSource={cartItems}
        rowKey={(record) => record.product._id}
        pagination={false}
      />
    </div>
  );
};

export default CartTableComponent;
