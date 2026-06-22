import React, { useState, useEffect } from 'react';
import { Table, Image } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { Fomater } from '../../utils/fomater';
import *as CartService from "../../services/Cart.Service";
import { increaseQuantity, decreaseQuantity, updateQuantity, removeCart } from '../../redux/slices/CartSlice';
import "./CartTableComponent.scss"
import { useDispatch, useSelector } from 'react-redux';
import { alertError } from "../../utils/alert"
import { useNavigate } from 'react-router-dom';
import { getFruitImage } from '../../utils/getFruitImage';

const QuantityControl = ({ record, handleDecrease, handleIncrease, onQuantityChange }) => {
  const [localVal, setLocalVal] = useState(record.quantity);

  useEffect(() => {
    setLocalVal(record.quantity);
  }, [record.quantity]);

  const handleChange = (e) => {
    setLocalVal(e.target.value);
  };

  const handleBlur = () => {
    let parsed = parseFloat(localVal);
    const stock = record.product?.stock || 0;
    
    if (Number.isNaN(parsed) || parsed <= 0) {
      setLocalVal(record.quantity);
      return;
    }
    
    if (parsed > stock) {
      alertError("Thất bại", `Sản phẩm chỉ còn ${stock} kg trong kho`);
      setLocalVal(record.quantity);
      return;
    }
    
    onQuantityChange(record.product._id, parsed);
  };

  const isMax = record.quantity >= (record.product?.stock || 0);

  return (
    <div className='controls'>
      <span className='button_quantity' onClick={() => handleDecrease(record.product._id)}>-</span>
      <input
        type="number"
        className="quantity_input"
        value={localVal}
        min="0.1"
        step="any"
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleBlur();
          }
        }}
      />
      <span style={{ paddingLeft: 4, paddingRight: 8 }}>kg</span>
      <span 
        className={`button_quantity ${isMax ? 'disabled' : ''}`} 
        onClick={() => !isMax && handleIncrease(record.product._id)}
      >+</span>
    </div>
  );
};

const CartTableComponent = ({ cartItems }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user)
  const navigate = useNavigate();

  const handleIncrease = async (productId) => {
    const item = cartItems.find((i) => i.product?._id === productId);
    if (item) {
      const stock = item.product?.stock || 0;
      if (item.quantity >= stock) {
        alertError("Thất bại", `Sản phẩm chỉ còn ${stock} kg trong kho`);
        return;
      }
    }
    const data = { productId, userId: user?.id }
    try {
      await CartService.increaseQuantity(user?.id, user?.access_token, data);
      dispatch(increaseQuantity({ productId }));
    } catch (err) {
      alertError("Thất bại", err.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleQuantityChange = async (productId, newQty) => {
    const data = { productId, userId: user?.id, quantity: newQty }
    try {
      await CartService.updateQuantity(user?.id, user?.access_token, data);
      dispatch(updateQuantity({ productId, quantity: newQty }));
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
        <QuantityControl
          record={record}
          handleDecrease={handleDecrease}
          handleIncrease={handleIncrease}
          onQuantityChange={handleQuantityChange}
        />
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
