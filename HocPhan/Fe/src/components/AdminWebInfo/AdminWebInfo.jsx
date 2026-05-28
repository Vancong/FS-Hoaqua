import { Form, Input, Button, Upload, message, Row, Col } from "antd";
import { useEffect, useState } from "react";
import * as websiteInfoService from "../../services/websiteInfo.Service";
import { useMutationHook } from "../../hooks/useMutationHook.js"
import './AdminWebInfo.scss';
import { useDispatch, useSelector } from "react-redux";
import { alertError, alertSuccess } from "../../utils/alert.js";
import { useQuery } from "@tanstack/react-query";
import LoadingComponent from "../LoadingComponent/LoadingComponent.jsx"
import { setInfo } from "../../redux/slices/WebSiteInfo.js";
const AdminWebInfo = () => {
  const [form] = Form.useForm();
  const user = useSelector(state => state.user)
  const dispatch = useDispatch();
  const [fileListUpdate, setFileListUpdate] = useState([]);
  const [fileLogoUpdate, setFileLogoUpdate] = useState([]);
  const { isLoading, data: dataGetInfo } = useQuery({
    queryKey: ['get-info'],
    queryFn: () => websiteInfoService.getInfo(),
  })

  useEffect(() => {
    if (dataGetInfo) {
      form.setFieldsValue({
        name: dataGetInfo.data.name || '',
        email: dataGetInfo.data.email || '',
        phone: dataGetInfo.data.phone || '',
        address: dataGetInfo.data.address || '',
        socialLinks: {
          facebook: dataGetInfo.data.socialLinks?.facebook || '',
          tiktok: dataGetInfo.data.socialLinks?.tiktok || '',
          zalo: dataGetInfo.data.socialLinks?.zalo || '',
        }
      });
      if (dataGetInfo.data?.banner?.length > 0) {
        const url = dataGetInfo.data.banner[0];
        const imageList = [
          {
            uid: url,
            name: url.substring(url.lastIndexOf('/') + 1),
            status: 'done',
            url,
          },
        ];
        setFileListUpdate(imageList);
      }
      else {
        setFileListUpdate([]);
      }
      if (dataGetInfo.data.logo) {
        const logo = [{
          uid: dataGetInfo.data.logo,
          name: dataGetInfo.data.logo.substring(dataGetInfo.data.logo.lastIndexOf('/') + 1),
          status: 'done',
          url: dataGetInfo.data.logo,
        }];
        setFileLogoUpdate(logo)
      }
      else {
        setFileLogoUpdate([])
      }
    }
  }, [dataGetInfo, form]);
  const mutationUpdate = useMutationHook(async ({ data, access_token }) => {
    return await websiteInfoService.update(data, access_token)
  })

  const { isPending: isPendingUpdate, isSuccess, isError, error, data } = mutationUpdate;
  useEffect(() => {
    if (data?.status === 'OK' && isSuccess) {
      alertSuccess('Cập nhật thông tin thành công')
      // cập nhật ngay websiteInfo ở FE để trang chủ/ header hiển thị logo/banner mới
      if (data?.data) {
        dispatch(setInfo(data.data));
      }
    }
    else if (isError) {
      alertError(`${error.message}`)
    }
  }, [isSuccess, isError, data, dispatch])




  const onFinish = async (values) => {
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("email", values.email || '');
    formData.append("phone", values.phone || '');
    formData.append("address", values.address || '');
    formData.append("updateBy", user?.name || user?.email);

    // Upload của antd không phải lúc nào cũng nằm trong `values` của Form
    // => dùng state `fileLogoUpdate` / `fileListUpdate` để đảm bảo luôn gửi đúng 1 logo + 1 banner
    if (fileLogoUpdate?.length > 0) {
      const file = fileLogoUpdate[0];
      if (file?.originFileObj) {
        formData.append('logo', file.originFileObj);
      } else if (file?.url) {
        formData.append('oldImglogo', file.url);
      }
    }

    // Banner: chỉ 1 ảnh (upload mới sẽ thay ảnh cũ)
    let oldImgBanner = [];
    if (fileListUpdate?.length > 0) {
      const bannerFile = fileListUpdate[0];
      if (bannerFile?.originFileObj) {
        formData.append('banner', bannerFile.originFileObj);
      } else if (bannerFile?.url) {
        oldImgBanner = [bannerFile.url];
      }
    }
    formData.append('oldImgBanner', JSON.stringify(oldImgBanner));


    const socialLinks = {
      facebook: values.socialLinks.facebook,
      tiktok: values.socialLinks.tiktok,
      zalo: values.socialLinks.zalo,
    };
    formData.append("socialLinks", JSON.stringify(socialLinks));
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }


    mutationUpdate.mutate({ data: formData, access_token: user?.access_token })

  };


  return (
    <LoadingComponent isPending={isLoading}>
      <div className="admin_websiteInfo">
        <h1>Quản lý thông tin Website</h1>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Tên Website"
            name="name"
            rules={[{ required: true, message: 'Không được bỏ trống' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Logo" name="logo"   >
            <Upload listType="picture-card" fileList={fileLogoUpdate} maxCount={1}
              beforeUpload={() => false}
              onChange={({ file, fileList }) => {
                // chỉ giữ 1 ảnh (ảnh mới sẽ thay ảnh cũ)
                setFileLogoUpdate(fileList.slice(-1));
              }}
            >
              {fileLogoUpdate.length >= 1 ? null : <div>Tải ảnh</div>}
            </Upload>
          </Form.Item>

          <Form.Item label="Banner" name="banner"  >
            <Upload listType="picture-card" fileList={fileListUpdate} maxCount={1}
              beforeUpload={() => false}
              onChange={({ fileList }) => setFileListUpdate(fileList.slice(-1))}
            >
              {fileListUpdate.length >= 1 ? null : <div>Tải ảnh</div>}
            </Upload>
          </Form.Item>

          <h2 >Thông tin liên hệ</h2>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Email" name="email">
                <Input type="email" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Số điện thoại" name="phone">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Địa chỉ" name="address">
            <Input />
          </Form.Item>

          <h2 >Mạng xã hội</h2>
          <Form.Item label="Facebook" name={["socialLinks", "facebook"]}>
            <Input />
          </Form.Item>
          <Form.Item label="TikTok" name={["socialLinks", "tiktok"]}>
            <Input />
          </Form.Item>
          <Form.Item label="Zalo" name={["socialLinks", "zalo"]}>
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isPendingUpdate} >
              Lưu
            </Button>
          </Form.Item>
        </Form>
      </div>
    </LoadingComponent>
  );
};

export default AdminWebInfo;
