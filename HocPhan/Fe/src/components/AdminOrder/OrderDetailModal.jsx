import { Modal, Table, Descriptions, Select } from 'antd';
import { useState, useEffect } from 'react';
import { getStatusLabel } from '../../utils/orderStatus';
import { useMutationHook } from '../../hooks/useMutationHook';
import { useSelector } from 'react-redux';
import * as OrderService from '../../services/Order.Service';
import { alertError, alertSuccess } from '../../utils/alert';
import { useQueryClient } from '@tanstack/react-query';

const statusOptions = {
  pending: [
    { label: 'Đã xác nhận', value: 'confirmed' },
    { label: 'Đã hủy', value: 'cancelled' },
  ],
  awaiting_payment: [{ label: 'Đã hủy', value: 'cancelled' }],
  confirmed: [
    { label: 'Đang giao', value: 'shipping' },
    { label: 'Đã hủy', value: 'cancelled' },
  ],
  shipping: [{ label: 'Giao hàng thành công', value: 'delivered' }],
  delivered: [],
  cancelled: [],
};

const paymentLabel = (method, isPaid) => {
  if (method === 'cod') return 'Thanh toán khi nhận hàng (COD)';
  if (method === 'vnpay') return isPaid ? 'VNPay — đã thanh toán' : 'VNPay — chưa thanh toán';
  return method;
};

const OrderDetailModal = ({ isModalOpen, orderDetail, setIsModalOpen }) => {
  const [order, setOrder] = useState(orderDetail);
  const queryClient = useQueryClient();
  const user = useSelector((state) => state.user);

  useEffect(() => {
    setOrder(orderDetail);
  }, [orderDetail]);

  const mutationUpdate = useMutationHook(async ({ data, access_token }) => {
    return await OrderService.updateStatus(data, access_token);
  });

  const { isPending, isSuccess, error, isError, data } = mutationUpdate;

  useEffect(() => {
    if (data?.status === 'OK' && isSuccess) {
      alertSuccess('Cập nhật trạng thái thành công');
      setOrder(data.data);
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['order-all'] });
    } else if (isError) {
      alertError(error?.message || 'Cập nhật thất bại');
    }
  }, [isError, isSuccess, data, error, queryClient, setIsModalOpen]);

  const handleStatusChange = (value) => {
    if (!value || !orderDetail) return;
    mutationUpdate.mutate({
      data: { status: value, orderCode: orderDetail.orderCode },
      access_token: user?.access_token,
    });
  };

  const nextStatusOptions = order ? statusOptions[order.status] || [] : [];

  return (
    <Modal
      title={`Chi tiết đơn hàng ${order?.orderCode || ''}`}
      footer={null}
      open={isModalOpen}
      onCancel={() => setIsModalOpen(false)}
      width={860}
    >
      {order ? (
        <>
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Mã đơn">{order.orderCode}</Descriptions.Item>
            <Descriptions.Item label="Ngày đặt">
              {new Date(order.createdAt).toLocaleString('vi-VN')}
            </Descriptions.Item>
            <Descriptions.Item label="Khách hàng">{order.name}</Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">{order.phone}</Descriptions.Item>
            <Descriptions.Item label="Email">{order.email || '—'}</Descriptions.Item>
            <Descriptions.Item label="Thanh toán">
              {paymentLabel(order.paymentMethod, order.isPaid)}
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ" span={2}>
              {[order.address?.detail, order.address?.ward, order.address?.district, order.address?.province]
                .filter(Boolean)
                .join(', ') || '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú" span={2}>
              {order.note || '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <span className={`status_badge ${order.status}`} style={{ marginRight: 12 }}>
                {getStatusLabel(order.status)}
              </span>
              {nextStatusOptions.length > 0 && (
                <Select
                  placeholder="Chuyển trạng thái..."
                  style={{ width: 200 }}
                  onChange={handleStatusChange}
                  loading={isPending}
                  options={nextStatusOptions}
                  value={undefined}
                />
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Tổng tiền">
              <strong>{Number(order.finalPrice).toLocaleString('vi-VN')}đ</strong>
            </Descriptions.Item>
          </Descriptions>

          <h4 style={{ marginTop: 16 }}>Sản phẩm</h4>
          <Table
            dataSource={order.items.map((item, index) => {
              const product = item?.product;
              const productName =
                product?.name || item.name || 'Sản phẩm đã bị xóa';
              return {
                key: index,
                name: productName,
                quantityKg: `${item.quantity} kg`,
                price: `${Number(item.price).toLocaleString('vi-VN')}đ/kg`,
                total: `${Number(item.quantity * item.price).toLocaleString('vi-VN')}đ`,
              };
            })}
            columns={[
              { title: 'Tên sản phẩm', dataIndex: 'name' },
              { title: 'Số kg', dataIndex: 'quantityKg' },
              { title: 'Giá', dataIndex: 'price' },
              { title: 'Thành tiền', dataIndex: 'total' },
            ]}
            pagination={false}
            size="small"
          />

          <div style={{ marginTop: 12, textAlign: 'right' }}>
            <div>Tạm tính: {Number(order.totalPrice).toLocaleString('vi-VN')}đ</div>
            <div>Phí ship: {Number(order.shipping || 0).toLocaleString('vi-VN')}đ</div>
            <div>Giảm giá: -{Number(order.discountValue || 0).toLocaleString('vi-VN')}đ</div>
            <div>
              <strong>Tổng cộng: {Number(order.finalPrice).toLocaleString('vi-VN')}đ</strong>
            </div>
          </div>
        </>
      ) : (
        <p>Không có dữ liệu đơn hàng</p>
      )}
    </Modal>
  );
};

export default OrderDetailModal;
