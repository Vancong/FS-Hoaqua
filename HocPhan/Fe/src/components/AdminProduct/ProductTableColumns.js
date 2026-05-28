import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Image, Tag } from 'antd';

export const getProductTableColumns = ({ onDetail, onDelete }) => [
  {
    title: 'Tên sản phẩm',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Hình ảnh',
    dataIndex: 'image',
    key: 'image',
    render: (image) => (
      <Image
        src={image}
        alt="thumbnail"
        width={60}
        height={60}
        style={{ objectFit: 'cover', borderRadius: 8 }}
      />
    ),
  },
  {
    title: 'Giá / kg',
    dataIndex: 'price',
    key: 'price',
    render: (price) => (price ? price.toLocaleString('vi-VN') + ' đ' : '0 đ'),
    sorter: (a, b) => a.price - b.price,
  },
  {
    title: 'Khuyến mãi',
    dataIndex: 'discount',
    key: 'discount',
    render: (discount) => (discount ? `${discount}%` : '0%'),
    sorter: (a, b) => (a.discount || 0) - (b.discount || 0),
  },
  {
    title: 'Tồn kho (kg)',
    dataIndex: 'stock',
    key: 'stock',
    sorter: (a, b) => a.stock - b.stock,
  },
  {
    title: 'Đã bán',
    dataIndex: 'sold',
    key: 'sold',
    sorter: (a, b) => a.sold - b.sold,
  },
  {
    title: 'Loại',
    dataIndex: 'type',
    key: 'type',
    render: (type) => (
      <Tag color={type === 'nhập khẩu' ? 'green' : 'cyan'}>
        {type === 'nhập khẩu' ? 'Nhập khẩu' : 'Nội địa'}
      </Tag>
    ),
  },
  {
    title: 'Nổi bật',
    dataIndex: 'isFeatured',
    key: 'isFeatured',
    render: (isFeatured) => (
      <Tag color={isFeatured ? 'gold' : 'blue'}>
        {isFeatured ? 'Nổi bật' : 'Thường'}
      </Tag>
    ),
  },
  {
    title: 'Hành động',
    key: 'actions',
    render: (_, record) => (
      <div style={{ fontSize: '20px' }}>
        <EditOutlined
          onClick={() => onDetail(record)}
          style={{ color: 'orange', cursor: 'pointer', marginRight: '10px' }}
        />
        <DeleteOutlined
          onClick={() => onDelete(record)}
          style={{ color: 'red', cursor: 'pointer' }}
        />
      </div>
    ),
  },
];
