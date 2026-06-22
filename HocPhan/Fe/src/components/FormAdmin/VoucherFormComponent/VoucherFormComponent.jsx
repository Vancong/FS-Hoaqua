import React, { useEffect, useState } from 'react';
import { Form, Button, Upload, Select ,DatePicker, InputNumber, Radio} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import InputComponent from '../../InputComponent/InputComponent';
const { Option } = Select;


const VoucherFormComponent = ({form,onFinish,isLoading,mode = 'create' }) => {

  const [discountType, setDiscountType] = useState(null);

  const handleDiscountTypeChange = (e) => {
    setDiscountType(e.target.value);
  };

  useEffect(() => {
    setDiscountType(form.getFieldValue('discountType'));
  },[]);

  const [startDate, setStartDate] =useState(null)
  const [endDate, setEndDate] = useState(null);

    const disabledStartDate = (current) => {
        if (!current) return false;
        if (endDate) {
        return current > endDate;
        }
        return false;
    };


   const disabledEndDate = (current) => {
        if (!current) return false;
        if (startDate) {
        return current < startDate;
        }
        return false;
    };

  return (
    <Form
      form={form}
      name={`${mode}_user_form`}
      labelCol={{ span: 12 }}
      wrapperCol={{ span: 20 }}
      onFinish={onFinish}
      autoComplete="off"
      initialValues
    >

      <Form.Item
        label="Mã giảm giá"
        name="code"
        rules={[
          { required: true, message: 'Vui lòng nhập mã giảm giá' }
        ]}
      >
        <InputComponent />
      </Form.Item>

      <Form.Item
        label="Giá trị giảm (%)"
        name="discountValue"
        rules={[
          { required: true, message: 'Vui lòng nhập phần trăm giảm giá' },
          { type: 'number', min: 1, max: 100, message: 'Phần trăm phải từ 1 đến 100' }
        ]}
      >
        <InputNumber
          style={{ width: 235 }}
          min={1}
          max={100}
          formatter={value => value ? `${value}%` : ''}
          parser={value => value ? value.replace('%', '') : ''}
        />
      </Form.Item>

      <Form.Item
        label="Giảm tối đa (VNĐ)"
        name="maxDiscountValue"
        extra="Để trống nếu không giới hạn số tiền giảm tối đa"
      >
        <InputNumber
          style={{ width: 235 }}
          min={0}
          placeholder="Không giới hạn"
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
        label="Giá trị đơn hàng tối thiểu"
        name="minOrderValue"
        rules={[
          { type: 'number', min: 0, message: 'Giá trị phải lớn hơn hoặc bằng 0' },
        ]}
        extra="Đơn hàng tối thiểu cần đạt để được áp dụng (để trống nếu áp dụng cho mọi đơn hàng)"
      >
        <InputNumber
            style={{ width: 235 }}
            min={0}
            placeholder="Áp dụng cho mọi đơn hàng"
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
        label="Tổng lượt sử dụng tối đa"
        name="usageLimit"   
        extra="Tổng số lần mã này có thể sử dụng (để trống nếu không giới hạn)"
      >
        <InputNumber 
          style={{ width: 235 }}
          min={0}
          placeholder="Không giới hạn"
        />
      </Form.Item>
     
     
     <Form.Item
        label="Số lượt đã sử dụng"
        name="usageCount"   
      >
        <InputNumber 
          style={{ width: 235 }}
          disabled 
          placeholder="0"
        />
      </Form.Item>
       
     <Form.Item
        label="Giới hạn sử dụng mỗi người"
        name="userLimit"   
        extra="Số lần tối đa mỗi tài khoản được dùng mã này (để trống nếu không giới hạn)"
      >
        <InputNumber 
          style={{ width: 235 }}
          min={0}
          placeholder="Không giới hạn"
        />
      </Form.Item>

        
    <Form.Item
        label="Ngày bắt đầu"
        name="startDate"
        rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
        
    >
        <DatePicker format="DD/MM/YYYY" 
            disabledDate={disabledStartDate}
            onChange={date => setStartDate(date)}
        />
    </Form.Item>

    <Form.Item
        label="Ngày kết thúc"
        name="endDate"
        rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc' }]}
    >
        <DatePicker format="DD/MM/YYYY" 
            disabledDate={disabledEndDate}
            onChange={(date)=> setEndDate(date)}
        />
    </Form.Item>


      {mode==='update' &&(
        <Form.Item
          label="Trạng thái"
          name="isActive"
        >
              <Select placeholder="Chọn trạng thái">
                    <Option value={true}>Hoạt động</Option>
                    <Option value={false}>Dừng hoạt động</Option>             
               </Select>
        </Form.Item>
      )}


      <Form.Item
          label="Mô tả"
          name="description"
      >
          <InputComponent />
      </Form.Item>

        
     

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit" loading={isLoading}>
                {mode === 'create' ? 'Thêm mã giảm giá' : 'Cập nhật mã giảm giá'}
            </Button>
        </Form.Item>
    </Form>
  );
};

export default VoucherFormComponent;
