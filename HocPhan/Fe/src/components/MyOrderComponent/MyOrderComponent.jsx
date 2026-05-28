import React, { useState } from 'react'
import *as OrderService from "../../services/Order.Service"
import * as PaymentService from '../../services/Payment.Service'
import { useSelector } from 'react-redux';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Pagination, Select } from 'antd';
import "./MyOrderComponent.scss"
import { useNavigate } from 'react-router-dom';
import { getStatusLabel } from '../../utils/orderStatus';
import NavigationPathComponent from '../NavigationPathComponent/NavigationPathComponent';
import LoadingComponent from '../LoadingComponent/LoadingComponent';
import { alertError } from '../../utils/alert';

const canRetryVnpay = (order) =>
  order.paymentMethod === 'vnpay' && !order.isPaid && order.status === 'awaiting_payment';

const MyOrderComponent = () => {
  const user = useSelector((state) => state.user)
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [payingCode, setPayingCode] = useState('');
  const limit = 5;
  const navigate = useNavigate();
  const { isLoading, data, isError } = useQuery({
    queryKey: ['my-order', user?.id, page, status],
    queryFn: () => OrderService.getMyOrder(user?.id, user?.access_token, page, limit, status),
    enabled: !!user?.id,
    placeholderData: keepPreviousData,
  });

  const orders = Array.isArray(data?.data) ? data.data : [];
  const total = data?.total || 0;

  const orderStatusOptions = [
    { value: "", label: "Tất cả" },
    { value: "awaiting_payment", label: "Chờ thanh toán" },
    { value: "pending", label: "Chờ xử lý" },
    { value: "confirmed", label: "Đã xác nhận" },
    { value: "shipping", label: "Đang giao" },
    { value: "completed", label: "Giao thành công" },
    { value: "cancelled", label: "Đã hủy" },
    { value: "refund_pending", label: "Chờ hoàn tiền" },
    { value: "refunded", label: "Đã hoàn tiền" },
  ];

  const handleRetryVnpay = async (orderCode) => {
    try {
      setPayingCode(orderCode);
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
      setPayingCode('');
    }
  };

  const handleStatusChange = (value) => {
    setStatus(value);
    setPage(1)
  };

  return (
    <LoadingComponent isPending={isLoading}>
      <div className='my_order'>

        <NavigationPathComponent category="Danh sách đơn hàng" />
        <h1 className='title'>Danh sách đơn hàng</h1>
        <Select
          style={{ width: 220 }}
          placeholder="Chọn trạng thái"
          value={status}
          onChange={handleStatusChange}
          options={orderStatusOptions}
        />
        {isError ? (
          <p style={{ color: 'red', marginTop: 20 }}>Không tải được danh sách đơn hàng. Vui lòng đăng nhập lại.</p>
        ) : orders.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Mã đơn hàng</th>
                  <th>Tên khách hàng</th>
                  <th>Ngày đặt hàng</th>
                  <th>Thanh toán</th>
                  <th>Trạng thái</th>
                  <th>Tổng tiền</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((item) => (
                    <tr key={item.orderCode}>
                      <td data-label="Mã đơn hàng">{item.orderCode}</td>
                      <td data-label="Tên khách hàng">{item.name}</td>
                      <td data-label="Ngày đặt hàng">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td data-label="Thanh toán">
                        {item.paymentMethod === 'vnpay'
                          ? item.isPaid
                            ? 'VNPay (đã thanh toán)'
                            : 'VNPay (chưa thanh toán)'
                          : item.paymentMethod === 'cod'
                            ? 'COD'
                            : item.paymentMethod}
                      </td>
                      <td data-label="Trạng thái">
                        <span className={`status_badge ${item.status}`}>{getStatusLabel(item.status)}</span>
                      </td>
                      <td data-label="Tổng tiền">{Number(item.finalPrice).toLocaleString('vi-VN')}₫</td>
                      <td data-label="Hành động">
                        <div className="action_buttons">
                          <button
                            type="button"
                            className="btn_view"
                            onClick={() => navigate(`/my-order/detail/${item.orderCode}`)}
                          >
                            Xem chi tiết
                          </button>
                          {canRetryVnpay(item) && (
                            <button
                              type="button"
                              className="btn_pay_again"
                              disabled={payingCode === item.orderCode}
                              onClick={() => handleRetryVnpay(item.orderCode)}
                            >
                              {payingCode === item.orderCode ? 'Đang chuyển...' : 'Thanh toán lại'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              current={page}
              total={total}
              pageSize={limit}
              onChange={(p) => setPage(p)}
              style={{ marginTop: 20, textAlign: 'center' }}
            />
          </div>
        ) : (
          !isLoading && <p style={{ color: 'red', marginTop: 20 }}>Không có đơn hàng nào</p>
        )}


      </div>
    </LoadingComponent>
  )
}

export default MyOrderComponent