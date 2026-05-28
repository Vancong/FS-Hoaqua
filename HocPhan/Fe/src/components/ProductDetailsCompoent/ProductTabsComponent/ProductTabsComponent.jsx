import React from 'react';
import "./ProductTabsComponent.scss"
import { Tabs } from 'antd';
const { TabPane } = Tabs;

const ProductTabsComponent = ({ product }) => {
  const { brand, description } = product;

  return (
    <div style={{ marginTop: 40 }}>
      <Tabs defaultActiveKey="1">
        <TabPane className='tab_title' tab="Mô tả sản phẩm" key="1">
          <div className='product-tab-content'>
            {brand?.name && <p><b>Thương hiệu:</b> {brand.name}</p>}
            <p>{description || 'Sản phẩm trái cây tươi sạch được chọn lọc kỹ càng, đảm bảo tiêu chuẩn chất lượng cao và an toàn vệ sinh thực phẩm cho gia đình bạn.'}</p>
          </div>
        </TabPane>

        <TabPane className='tab_title' tab="Bảo quản & Sử dụng" key="2">
          <div className='product-tab-content'>
            <p>• Rửa sạch bằng nước sạch (hoặc nước muối loãng) trước khi ăn.</p>
            <p>• Bảo quản trong ngăn mát tủ lạnh (ở nhiệt độ từ 2°C - 5°C) để giữ trái cây luôn tươi ngon, mọng nước và giữ được trọn vẹn dinh dưỡng.</p>
            <p>• Tránh để trái cây tiếp xúc trực tiếp dưới ánh nắng mặt trời hoặc nguồn nhiệt cao.</p>
          </div>
        </TabPane>

        <TabPane className='tab_title' tab="Giao hàng & Đổi trả" key="3">
          <div className='product-tab-content'>
            <p>• <b>Giao hàng hỏa tốc:</b> Nhận hàng nhanh trong 2 giờ đối với các đơn hàng khu vực nội thành.</p>
            <p>• <b>Kiểm tra hàng trước:</b> Khách hàng được quyền mở hộp kiểm tra độ tươi ngon của sản phẩm trước khi thanh toán.</p>
            <p>• <b>Chính sách đổi trả:</b> Cam kết 1 đổi 1 hoặc hoàn tiền nhanh trong 24 giờ nếu trái cây gặp vấn đề dập nát, hư hỏng hoặc không đạt chất lượng cam kết.</p>
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ProductTabsComponent;
