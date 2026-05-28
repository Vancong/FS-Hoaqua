import React, { useEffect, useState } from 'react'
import "./OrderDetailComponent.scss"
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import *as OrderService from "../../services/Order.Service"
import * as PaymentService from '../../services/Payment.Service'
import { useQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import LoadingComponent from "../LoadingComponent/LoadingComponent"
import { useMutationHook } from '../../hooks/useMutationHook'
import { useQueryClient } from '@tanstack/react-query';
import { getStatusLabel } from '../../utils/orderStatus'
import { alertError } from '../../utils/alert'

const OrderDetailComponent = () => {
    const user = useSelector((state) => state.user)
    const { orderCode } = useParams();
    const queryClient = useQueryClient()
    const navigate = useNavigate();
    const location = useLocation();
    const [isRetryingPay, setIsRetryingPay] = useState(false);
    const { isLoading, data } = useQuery({
        queryKey: ['order-detail', orderCode],
        queryFn: () => OrderService.getDetail(user?.id, user?.access_token, orderCode),
        enabled: !!orderCode && !!user?.id,
    });
    const orderDeatil = data?.data;
    const addres = `${orderDeatil?.address?.ward}, ${orderDeatil?.address?.district},
    ${orderDeatil?.address?.province}`;

    const mutationCancelled = useMutationHook(async ({ id, access_token, data }) => {
        console.log(id, access_token, data)
        return await OrderService.cancelled(id, access_token, data)
    })
    const { isPending: isPendingCancelled, isSuccess: isSuccessCancelled, data: dataCancelled } = mutationCancelled;

    useEffect(() => {
        if (dataCancelled?.status === 'OK' && isSuccessCancelled) {
            queryClient.invalidateQueries({ queryKey: ['order-detail', orderCode] });
            queryClient.invalidateQueries({ queryKey: ['my-order'] });
        }
    }, [isSuccessCancelled, dataCancelled, queryClient, orderCode]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('payment') === 'failed') {
            alertError(decodeURIComponent(params.get('message') || 'Thanh toán thất bại'));
            queryClient.invalidateQueries({ queryKey: ['order-detail', orderCode] });
            navigate(`/my-order/detail/${orderCode}`, { replace: true });
        }
    }, [location.search, orderCode, navigate, queryClient]);
    const canCancel =
        orderDeatil?.status === 'confirmed' ||
        orderDeatil?.status === 'pending' ||
        orderDeatil?.status === 'awaiting_payment';
    const canRetryVnpay =
        orderDeatil?.paymentMethod === 'vnpay' &&
        !orderDeatil?.isPaid &&
        orderDeatil?.status === 'awaiting_payment';

    const handleRetryVnpay = async () => {
        try {
            setIsRetryingPay(true);
            const payRes = await PaymentService.createVnpayUrl(
                user.id,
                user.access_token,
                orderCode
            );
            if (payRes?.data?.paymentUrl) {
                window.location.href = payRes.data.paymentUrl;
                return;
            }
            alertError('Không tạo được link VNPay.');
        } catch (err) {
            alertError(err?.response?.data?.message || err.message || 'Lỗi VNPay');
        } finally {
            setIsRetryingPay(false);
        }
    };

    const handleCancel = () => {
        let status = 'cancelled'
        if (orderDeatil.isPaid) {
            status = 'refund_pending';
        }
        const data = {
            orderCode,
            status
        }
        mutationCancelled.mutate({ id: user?.id, access_token: user?.access_token, data });

    }


    return (
        <LoadingComponent isPending={isLoading}>
            {orderDeatil && (
                <div className='order_detail'>
                    <h2>Đơn hàng {orderCode}</h2>

                    {canRetryVnpay && (
                        <p style={{ color: '#e67e22', marginBottom: 16 }}>
                            Đơn hàng đang chờ thanh toán VNPay. Bấm &quot;Thanh toán lại VNPay&quot; bên dưới để thử lại.
                        </p>
                    )}

                    <div className="order_info">
                        <div className="left">
                            <p><strong>Ngày đặt hàng:</strong>{new Date(orderDeatil.createdAt).toLocaleDateString('vi-VN')}</p>
                            <p><strong>Trạng thái:</strong> <span className={`status_badge ${orderDeatil.status}`}>
                                {getStatusLabel(orderDeatil.status)} </span>
                            </p>
                            <p><strong>Thanh toán:</strong> <span className="payment_method">{orderDeatil.paymentMethod}</span></p>
                            {orderDeatil?.paidAt && (
                                <p><strong>Thanh toán vào lúc:</strong>
                                    <span> {new Date(orderDeatil.paidAt).toLocaleString("vi-VN")}</span></p>
                            )}
                        </div>
                        <div className="right">
                            <p><strong>Khách hàng:</strong> {orderDeatil.name}</p>
                            <p><strong>Điện thoại:</strong> {orderDeatil.phone}</p>
                            <p><strong>Email:</strong> {orderDeatil.email || "Không có"} </p>
                            <p><strong>Địa chỉ: </strong>{addres}</p>
                        </div>
                    </div>

                    <table className="product_table">
                        <thead>
                            <tr>
                                <th>Sản phẩm</th>
                                <th>Đơn giá</th>
                                <th>Số kg</th>
                                <th>Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orderDeatil.items.length > 0 && orderDeatil.items.map((item, index) => {
                                const product = item.product;
                                const isProductDeleted = !product || product === null;
                                const isProductInactive = product && product.isActive === false;
                                const canNavigate = !isProductDeleted && !isProductInactive && product?.slug;
                                const productName = isProductDeleted 
                                    ? 'Sản phẩm đã bị xóa' 
                                    : (isProductInactive ? `${product.name} (Đã dừng hoạt động)` : product.name);
                                const productImage = isProductDeleted ? '/placeholder-image.png' : (product.images?.[0] || '/placeholder-image.png');
                                const productSlug = product?.slug;
                                
                                return (
                                    <tr key={item.orderCode || index}>
                                        <td data-label="Sản phẩm">
                                            <div 
                                                onClick={() => {
                                                    if (canNavigate) {
                                                        navigate(`/product-details/${productSlug}`);
                                                    } else if (isProductInactive) {
                                                        alertError('Sản phẩm này đã dừng hoạt động');
                                                    }
                                                }}
                                                style={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    cursor: canNavigate ? 'pointer' : 'default',
                                                    opacity: (isProductDeleted || isProductInactive) ? 0.6 : 1
                                                }}
                                            >
                                                <img 
                                                    width={60} 
                                                    height={60} 
                                                    style={{ marginRight: 10, objectFit: 'cover' }}
                                                    src={productImage}
                                                    alt={productName}
                                                />
                                                <div>
                                                    <p style={{ margin: 0 }}>{productName}</p>
                                                    {isProductDeleted && (
                                                        <span style={{ fontSize: '12px', color: '#999' }}>
                                                            (Sản phẩm không còn tồn tại)
                                                        </span>
                                                    )}
                                                    {isProductInactive && !isProductDeleted && (
                                                        <span style={{ fontSize: '12px', color: '#ff9800' }}>
                                                            (Đã dừng hoạt động)
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td data-label="Đơn giá">{item.price.toLocaleString()}₫/kg</td>
                                        <td data-label="Số kg">{item.quantity} kg</td>
                                        <td data-label="Thành tiền"> {(item.price * item.quantity).toLocaleString()}₫</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>

                    <div className="total_summary">
                        <h2>Tổng kết đơn hàng</h2>
                        <div className="row"><span>Tạm tính:</span>
                            <span className='price'>{(orderDeatil.totalPrice).toLocaleString()}₫</span>
                        </div>
                        <div className="row"><span>Giảm giá:</span> <span className='price'>-{(orderDeatil.discountValue).toLocaleString()}</span></div>
                        <div className="row" ><span>Phí vận chuyển:</span>
                            <span className='price'>{(orderDeatil.shipping).toLocaleString()}₫</span>
                        </div>
                        <div className="row total"><span>Tổng cộng:</span>
                            <span > {(orderDeatil.finalPrice).toLocaleString()}₫</span>
                        </div>
                    </div>

                    <div className='btn_action'>
                        {canRetryVnpay && (
                            <button
                                type="button"
                                className={`btn pay_again ${isRetryingPay ? 'disabled' : ''}`}
                                disabled={isRetryingPay}
                                onClick={handleRetryVnpay}
                            >
                                {isRetryingPay ? 'Đang chuyển...' : 'Thanh toán lại VNPay'}
                            </button>
                        )}
                        <button
                            type="button"
                            className={`btn cancel ${(isPendingCancelled || !canCancel) ? 'disabled' : ''}`}
                            disabled={isPendingCancelled || !canCancel}
                            onClick={() => {
                                if (canCancel) handleCancel();
                            }}
                        >
                            {isPendingCancelled ? 'Đang hủy...' : 'Hủy đơn hàng'}
                        </button>
                        <button type="button" className='btn contact'>
                            Liên hệ hỗ trợ
                        </button>
                    </div>
                </div>
            )}
        </LoadingComponent>
    )
}

export default OrderDetailComponent