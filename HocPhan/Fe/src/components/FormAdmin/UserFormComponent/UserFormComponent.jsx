import React from 'react';
import { Form, Button, Select } from 'antd';
import InputComponent from '../../InputComponent/InputComponent';
const { Option } = Select;

const UserFormComponent = ({ form, onFinish, isLoading, mode = 'create' }) => {
  
  return (
    <Form
      form={form}
      name={`${mode}_user_form`}
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      onFinish={onFinish}
      autoComplete="off"
    >
      <Form.Item
        label="Họ và tên"
        name="name"
        rules={[{ required: true, message: 'Vui lòng nhập Họ và tên' }]}
      >
        <InputComponent />
      </Form.Item>

      <Form.Item
        label="Email"
        name="email"
        rules={[
          { required: true, message: 'Vui lòng nhập Email' },
          { type: 'email', message: 'Email không hợp lệ' }
        ]}
      >
        <InputComponent disabled={mode === 'update'} />
      </Form.Item>

      {mode === 'create' && (
        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[
            { required: true, message: 'Vui lòng nhập Mật khẩu' },
            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
          ]}
        >
          <InputComponent type="password" />
        </Form.Item>
      )}

      {mode === 'update' && (
        <Form.Item
          label="Mật khẩu mới"
          name="password"
          rules={[
            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
          ]}
        >
          <InputComponent type="password" placeholder="Nhập mật khẩu mới nếu muốn đổi" />
        </Form.Item>
      )}

      <Form.Item
        label="Số điện thoại"
        name="phone"
      >
        <InputComponent type="number" />
      </Form.Item>

      <Form.Item
        label="Địa chỉ"
        name="address"
      >
        <InputComponent />
      </Form.Item>

      {mode === 'update' && (
        <>
          <Form.Item
            label="Quyền Admin"
            name="isAdmin"
          >
            <Select placeholder="Chọn quyền">
              <Option value={true}>Có</Option>
              <Option value={false}>Không</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="isActive"
          >
            <Select placeholder="Chọn trạng thái">
              <Option value={true}>Hoạt động</Option>
              <Option value={false}>Dừng hoạt động</Option>
            </Select>
          </Form.Item>
        </>
      )}

      <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
        <Button type="primary" htmlType="submit" loading={isLoading}>
          {mode === 'create' ? 'Thêm người dùng' : 'Cập nhật người dùng'}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default UserFormComponent;
