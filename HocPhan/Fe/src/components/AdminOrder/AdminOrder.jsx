import { DatePicker, Select } from 'antd';
import React, { useState } from 'react';
import { EyeOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import TableComponents from '../TableComponents/TableComponents';
import ButtonInputSearch from '../ButtonInputSearch/ButtonInputSearch';
import * as OrderService from '../../services/Order.Service';
import OrderDetailModal from './OrderDetailModal';
import { getStatusLabel } from '../../utils/orderStatus';
import './AdminOrder.scss';

const paymentLabel = (method, isPaid) => {
  if (method === 'cod') return 'COD';
  if (method === 'vnpay') return isPaid ? 'VNPay (đã TT)' : 'VNPay (chưa TT)';
  return method;
};

const AdminOrder = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const user = useSelector((state) => state.user);
  const [currentPage, setCurrentPage] = useState(1);
  const [orderDetail, setOrderDetail] = useState(null);
  const limit = 8;

  const [inputSearch, setInputSearch] = useState('');
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
    paymentMethod: '',
  });

  const { RangePicker } = DatePicker;

  const { isLoading: isLoadingOrder, data: ordersRes } = useQuery({
    queryKey: ['order-all', currentPage, searchText, filters],
    queryFn: () => OrderService.getAll(user?.access_token, currentPage, limit, searchText, filters),
    enabled: !!user?.access_token && !!user?.isAdmin,
    placeholderData: (prev) => prev,
  });

  const dataTable = (ordersRes?.data || []).map((order) => ({
    ...order,
    key: order._id,
  }));

  const handleDetailOrder = (record) => {
    setIsModalOpen(true);
    setOrderDetail(record);
  };

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'orderCode',
      render: (text) => <span className="order_code">{text}</span>,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'name',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      render: (text) => (text ? new Date(text).toLocaleDateString('vi-VN') : '—'),
    },
    {
      title: 'Thanh toán',
      dataIndex: 'paymentMethod',
      render: (_, record) => paymentLabel(record.paymentMethod, record.isPaid),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'finalPrice',
      render: (text) => `${Number(text).toLocaleString('vi-VN')}đ`,
      sorter: (a, b) => a.finalPrice - b.finalPrice,
    },
    {
      title: 'Trạng thái',
      align: 'center',
      dataIndex: 'status',
      render: (text) => (
        <span className={`status_badge ${text}`}>{getStatusLabel(text)}</span>
      ),
    },
    {
      title: 'Hành động',
      align: 'center',
      dataIndex: 'action',
      render: (_, record) => (
        <button type="button" className="btn_view_order" onClick={() => handleDetailOrder(record)}>
          <EyeOutlined /> Xem / cập nhật
        </button>
      ),
    },
  ];

  return (
    <div className="admin_order">
      <h1 className="title">Quản lý đơn hàng</h1>

      <div className="admin_order_filters">
        <ButtonInputSearch
          size="middle"
          placeholder="Mã đơn, tên hoặc SĐT..."
          textButton="Tìm"
          bgrColorInput="#fff"
          bgrColorButton="#1890ff"
          textColorButton="#fff"
          onChangeSearch={(e) => setInputSearch(e.target.value)}
          onClickSearch={() => {
            setCurrentPage(1);
            setSearchText(inputSearch);
          }}
          value={inputSearch}
        />

        <Select
          placeholder="Trạng thái"
          style={{ width: 180 }}
          allowClear
          value={filters.status || undefined}
          onChange={(value) => {
            setFilters((prev) => ({ ...prev, status: value || '' }));
            setCurrentPage(1);
          }}
          options={[
            { value: 'awaiting_payment', label: 'Chờ thanh toán' },
            { value: 'pending', label: 'Chờ xác nhận' },
            { value: 'confirmed', label: 'Đã xác nhận' },
            { value: 'shipping', label: 'Đang giao' },
            { value: 'delivered', label: 'Giao thành công' },
            { value: 'cancelled', label: 'Đã hủy' },
          ]}
        />

        <RangePicker style={{ width: 260 }} onChange={(dates) => {
          setFilters((prev) => ({
            ...prev,
            startDate: dates?.[0]?.format('YYYY-MM-DD') || '',
            endDate: dates?.[1]?.format('YYYY-MM-DD') || '',
          }));
          setCurrentPage(1);
        }} />

        <Select
          placeholder="Thanh toán"
          style={{ width: 180 }}
          allowClear
          value={filters.paymentMethod || undefined}
          onChange={(value) => {
            setFilters((prev) => ({ ...prev, paymentMethod: value || '' }));
            setCurrentPage(1);
          }}
          options={[
            { value: 'cod', label: 'COD' },
            { value: 'vnpay', label: 'VNPay' },
          ]}
        />
      </div>

      <OrderDetailModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        orderDetail={orderDetail}
      />

      <TableComponents
        type="adminOrder"
        data={dataTable}
        columns={columns}
        pagination={{
          current: currentPage,
          pageSize: limit,
          total: ordersRes?.total || 0,
          onChange: (page) => setCurrentPage(page),
          showSizeChanger: false,
        }}
        isLoading={isLoadingOrder}
      />
    </div>
  );
};

export default AdminOrder;
