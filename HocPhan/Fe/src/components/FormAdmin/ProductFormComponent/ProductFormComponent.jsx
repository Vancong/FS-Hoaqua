import React from 'react';
import { Form, Button, Upload, Select, InputNumber } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import InputComponent from '../../InputComponent/InputComponent';

const { Option } = Select;

const ProductForm = ({
  form,
  fileList,
  setFileList,
  onFinish,
  isLoading,
  isFormSubmit,
  mode = 'create',
  initialValues
}) => {

  const handleOnchangeImage = ({ fileList }) => {
    // Only keep the most recent uploaded image file (single image)
    setFileList(fileList.slice(-1));
  };

  const handleRemoveImage = () => {
    setFileList([]);
  };

  return (
    <Form
      form={form}
      name={`${mode}_product_form`}
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      onFinish={onFinish}
      autoComplete="off"
      initialValues={initialValues || {
        price: 0,
        stock: 0,
        discount: 0,
        isFeatured: false,
        type: 'nội địa',
      }}
    >
      <Form.Item
        label="Tên sản phẩm"
        name="name"
        rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
      >
        <InputComponent />
      </Form.Item>

      <Form.Item
        label="Giá tiền (VNĐ / kg)"
        name="price"
        rules={[{ required: true, message: 'Vui lòng nhập giá tiền!' }]}
      >
        <InputNumber
          style={{ width: '100%' }}
          placeholder="Giá (VNĐ)"
          min={0}
          formatter={value => {
            if (!value) return '';
            const num = Number(value.toString().replace(/,/g, ''));
            if (isNaN(num)) return '';
            return num.toLocaleString('vi-VN');
          }}
          parser={value => {
            if (!value) return '';
            return value.replace(/[,.\s]/g, '');
          }}
        />
      </Form.Item>

      <Form.Item
        label="Khuyến mãi (%)"
        name="discount"
        rules={[
          {
            type: 'number',
            min: 0,
            max: 100,
            message: 'Khuyến mãi phải từ 0% đến 100%!',
          },
        ]}
      >
        <InputNumber
          style={{ width: '100%' }}
          placeholder="Ví dụ: 10 (giảm 10%)"
          min={0}
          max={100}
          addonAfter="%"
        />
      </Form.Item>

      <Form.Item
        label="Tồn kho (kg)"
        name="stock"
        rules={[{ required: true, message: 'Vui lòng nhập số kg tồn kho!' }]}
      >
        <InputNumber style={{ width: '100%' }} min={0} step={1} precision={0} placeholder="Ví dụ: 100" addonAfter="kg" />
      </Form.Item>

      {mode === 'update' && (
        <Form.Item
          label="Số lượng đã bán"
          name="sold"
        >
          <InputNumber style={{ width: '100%' }} min={0} disabled placeholder="Đã bán" />
        </Form.Item>
      )}

      <Form.Item
        label="Sản phẩm nổi bật"
        name="isFeatured"
      >
        <Select placeholder="Chọn trạng thái nổi bật">
          <Option value={true}>Có (Nổi bật)</Option>
          <Option value={false}>Không (Thường)</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Loại trái cây"
        name="type"
        rules={[{ required: true, message: 'Vui lòng chọn loại trái cây!' }]}
      >
        <Select placeholder="Chọn loại trái cây">
          <Option value="nội địa">Trái cây nội địa</Option>
          <Option value="nhập khẩu">Trái cây nhập khẩu</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label={
          <span>
            <span style={{ color: 'red', fontSize: '18px' }}>*</span> Hình ảnh
          </span>
        }
      >
        <Upload
          listType="picture-card"
          fileList={fileList}
          onChange={handleOnchangeImage}
          onRemove={handleRemoveImage}
          beforeUpload={() => false}
          accept="image/*"
          maxCount={1}
        >
          {fileList.length < 1 && '+ Tải ảnh'}
        </Upload>
        {isFormSubmit && fileList.length === 0 && (
          <div style={{ color: 'red', marginTop: 4 }}>Vui lòng chọn ảnh!</div>
        )}
      </Form.Item>

      <Form.Item
        label="Mô tả"
        name="description"
      >
        <InputComponent />
      </Form.Item>

      <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
        <Button type="primary" htmlType="submit" loading={isLoading}>
          {mode === 'create' ? 'Tạo sản phẩm' : 'Cập nhật sản phẩm'}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ProductForm;
