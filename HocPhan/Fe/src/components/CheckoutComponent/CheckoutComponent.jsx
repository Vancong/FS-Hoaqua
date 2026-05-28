import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import LoadingComponent from '../LoadingComponent/LoadingComponent';
import * as CartService from '../../services/Cart.Service';
import './CheckoutComponent.scss';
import InputInfo from './InputInfo';
import OrderSummary from './OrderSummary';
import { useMutationHook } from '../../hooks/useMutationHook';
import * as OrderService from '../../services/Order.Service';
import { clearCart, setCart } from '../../redux/slices/CartSlice';
import { useNavigate } from 'react-router-dom';
import { alertError } from '../../utils/alert';
import * as PaymentService from '../../services/Payment.Service';
import { getProductStock } from '../../utils/getProductStock';

const CheckoutComponent = () => {
  const user = useSelector((state) => state.user);
  const reduxCart = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [cartState, setCartState] = useState([]);
  const [fullAddress, setFullAddress] = useState({
    province: null,
    district: null,
    ward: null,
    detail: null,
  });
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    note: '',
  });

  const [orderSummary, setOrderSummary] = useState({
    shipping: 0,
    totalPrice: 0,
    finalPrice: 0,
    discountCode: null,
    discountValue: 0,
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [errors, setErrors] = useState({});
  const processedOrderRef = useRef(null);

  const { isLoading: isCartLoading } = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: async () => {
      const res = await CartService.getDetail(user?.id, user?.access_token);
      const apiItems = res?.data || [];

      if (apiItems.length > 0) {
        dispatch(setCart({ items: apiItems, total: res.total || apiItems.length }));
        return res;
      }

      // API trống nhưng Redux còn hàng → giữ Redux, đồng bộ lên server
      const localItems = reduxCart.items || [];
      if (localItems.length > 0) {
        for (const item of localItems) {
          try {
            await CartService.create(user.id, user.access_token, {
              productId: item.product._id,
              price: item.price,
              quantity: item.quantity,
            });
          } catch (e) {
            console.warn('Đồng bộ giỏ hàng:', e?.message);
          }
        }
        const synced = await CartService.getDetail(user.id, user.access_token);
        if (synced?.data?.length) {
          dispatch(setCart({ items: synced.data, total: synced.total }));
          return synced;
        }
        return { ...res, data: localItems, total: localItems.length };
      }

      return res;
    },
    enabled: !!user?.id && !!user?.access_token,
  });

  const mutationOrder = useMutationHook(async ({ id, access_token, data }) => {
    return await OrderService.create(id, access_token, data);
  });

  const {
    isError: isErrorOrder,
    isPending: isOrdering,
    error: orderError,
    reset: resetOrderMutation,
  } = mutationOrder;

  useEffect(() => {
    const sourceItems =
      reduxCart.items?.length > 0 ? reduxCart.items : [];

    if (!sourceItems.length) {
      setCartState([]);
      return;
    }

    setCartState([...sourceItems]);
  }, [reduxCart.items]);

  const validateForm = () => {
    const { name, phone } = formData;
    const newErrors = {};

    if (!name) newErrors.name = 'Vui lòng nhập họ tên.';
    if (!phone) newErrors.phone = 'Vui lòng nhập số điện thoại.';
    else if (!/^0\d{9}$/.test(phone)) newErrors.phone = 'Số điện thoại không hợp lệ.';
    if (!fullAddress.province || !fullAddress.district || !fullAddress.ward) {
      newErrors.fullAddress = 'Vui lòng chọn đầy đủ tỉnh, huyện, xã.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Reset trạng thái đặt hàng cũ khi vào trang (tránh xử lý lại đơn cũ)
  useEffect(() => {
    resetOrderMutation();
    processedOrderRef.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isErrorOrder) {
      alertError(orderError?.message || 'Đặt hàng thất bại!');
      resetOrderMutation();
    }
  }, [isErrorOrder, orderError, resetOrderMutation]);

  const handleOrderSuccess = async (dataOrder) => {
    if (dataOrder?.status !== 'OK') return;

    const orderCode = dataOrder.data?.orderCode;
    if (!orderCode || processedOrderRef.current === orderCode) return;
    processedOrderRef.current = orderCode;

    const access_token = user?.access_token;
    const userId = user?.id;
    const { finalPrice, isPaid } = dataOrder.data;

    if (paymentMethod === 'vnpay' && !isPaid) {
      try {
        const payRes = await PaymentService.createVnpayUrl(
          userId,
          access_token,
          orderCode
        );
        if (payRes?.data?.paymentUrl) {
          sessionStorage.setItem('pending_vnpay_order', orderCode);
          // Đơn đã tạo — xóa giỏ, thanh toán lại từ trang chi tiết đơn nếu thất bại
          try {
            await CartService.clearCart(userId, access_token);
            dispatch(clearCart());
          } catch (err) {
            console.warn('Xóa giỏ hàng khi chuyển VNPay:', err);
          }
          window.location.href = payRes.data.paymentUrl;
          return;
        }
        alertError('Không tạo được link VNPay. Kiểm tra cấu hình VNPay trên server.');
      } catch (err) {
        alertError(err?.response?.data?.message || err.message || 'Lỗi VNPay');
      }
      return;
    }

    navigate(
      `/order-success?orderCode=${orderCode}&finalPrice=${finalPrice}&isPaid=${isPaid}`
    );
    try {
      await CartService.clearCart(userId, access_token);
      dispatch(clearCart());
    } catch (err) {
      console.error('Xoá giỏ hàng thất bại:', err);
    }
  };

  const handleOrder = (updateDataPay = null) => {
    if (!validateForm()) return;
    if (!cartState || cartState.length === 0) {
      return alertError('Giỏ hàng trống');
    }

    for (const item of cartState) {
      const stock = getProductStock(item.product);
      if (stock < item.quantity) {
        return alertError(
          `Sản phẩm ${item.product?.name} chỉ còn ${stock} kg trong kho`
        );
      }
    }

    const orderItems = cartState.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.price,
    }));

    const data = {
      user: user?.id,
      ...formData,
      address: fullAddress,
      items: orderItems,
      ...orderSummary,
      paymentMethod,
      ...updateDataPay,
    };

    mutationOrder.mutate(
      { id: user?.id, access_token: user?.access_token, data },
      { onSuccess: handleOrderSuccess }
    );
  };

  return (
    <div>
      <LoadingComponent isPending={isCartLoading || isOrdering}>
        <div className="checkout_page">
          <InputInfo
            formData={formData}
            setFormData={setFormData}
            fullAddress={fullAddress}
            setFullAddress={setFullAddress}
            errors={errors}
            setErrors={setErrors}
          />

          <div className="checkout_middle">
            <h2>Phương thức thanh toán</h2>
            <div className="payment_methods">
              <label>
                <input
                  type="radio"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                Thanh toán khi nhận hàng (COD)
              </label>

              <label>
                <input
                  type="radio"
                  value="vnpay"
                  checked={paymentMethod === 'vnpay'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                Thanh toán VNPay (thẻ / ví / QR)
              </label>
            </div>
          </div>

          <OrderSummary
            cartItems={cartState}
            handleOrder={handleOrder}
            setOrderSummary={setOrderSummary}
            orderSummary={orderSummary}
            paymentMethod={paymentMethod}
          />
        </div>
      </LoadingComponent>
    </div>
  );
};

export default CheckoutComponent;
