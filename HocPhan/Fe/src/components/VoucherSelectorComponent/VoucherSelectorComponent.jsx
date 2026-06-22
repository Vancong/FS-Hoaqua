import { Modal, List, Tag, Button } from "antd";
import { useState, useEffect } from "react";
import * as VoucherService from "../../services/Voucher.Service";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";

const VoucherSelectorComponent = ({ cartTotal, onSelect }) => {
  const [visible, setVisible] = useState(false);
  const user=useSelector((state)=> state.user);

  const {isLoanding,data:voucherData} =useQuery({
    queryKey: ['voucher'],
    queryFn: ()=> VoucherService.getAll({userId:user?.id, access_token:user?.access_token}) ,
  })



  return (
    <>
      <button 
        style={{
          width: '100%',
          height: '38px',
          padding: '0 16px',
          borderRadius: '8px',
          border: '1.5px solid #22c55e',
          backgroundColor: 'white',
          color: '#22c55e',
          fontWeight: '600',
          fontSize: '14px',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
        }}
        onClick={() => setVisible(true)}
      >
        Chọn mã
      </button>
      <Modal
        title="Danh sách mã giảm giá"
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
      >
        <List
          dataSource={voucherData?.data}
          renderItem={(item) => {
             const isEligible = cartTotal >= item.minOrderValue&& new Date() >=new Date(item.startDate)
                                && new Date() <= new Date(item.endDate)
                                && (!item.userLimit || 
                                 item.usedBy?.some(us => us.userId === user.id && us.count < item.userLimit));
;
            return (
              <List.Item
                actions={[
                  <Button
                    type="primary"
                    disabled={!isEligible}
                    onClick={() => {
                      onSelect(item);
                      setVisible(false);
                    }}
                  >
                    {isEligible ? "Dùng" : "Chưa đủ điều kiện"}
                  </Button>
                ]}
              >
                <List.Item.Meta
                  title={
                    <>
                      {item.code}{" "}
                      <Tag color="blue">
                        {item.discountType === "percentage"
                          ? `Giảm ${item.discountValue}%`
                          : `Giảm ${item.discountValue?.toLocaleString()} đ`}
                      </Tag>
                    </>
                  }
                  description={
                    <>
                      {item?.minOrderValue>0&&(
                        <span>
                          Đơn tối thiểu: {item.minOrderValue.toLocaleString() } đ <br/>
                        </span>
                      )} 

                       <span>
                            Ngày bắt đầu: {new Date(item.startDate).toLocaleDateString() } <br/>
                       </span>

                       {item?.maxDiscountValue>0&&(
                        <span>
                          Giảm tối đa: {item.maxDiscountValue.toLocaleString()} đ <br/>
                        </span>
                      )} 
                      HSD: {new Date(item.endDate).toLocaleDateString()}
                    </>
                  }
                />
              </List.Item>
            );
          }}
        />
      </Modal>
    </>
  );
};

export default VoucherSelectorComponent;
