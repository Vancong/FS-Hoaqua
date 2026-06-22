import { Button, Menu, Drawer } from 'antd'
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  UserOutlined, AppstoreOutlined, MenuOutlined, SettingOutlined, ShoppingOutlined, BarChartOutlined, TagOutlined
} from '@ant-design/icons';
import { getItem } from '../../utils/menuUtils';
import HeaderCompoent from '../../components/HeaderComponent/HeaderComponent';
import AdminUser from '../../components/AdminUser/AdminUser';
import AdminProduct from '../../components/AdminProduct/AdminProduct';
import AdminWebInfo from '../../components/AdminWebInfo/AdminWebInfo';
import AdminOrder from '../../components/AdminOrder/AdminOrder';
import AdminStats from '../../components/AdminStats/AdminStats';
import AdminVoucher from '../../components/AdminVoucher/AdminVoucher';
import "./AdminPage.scss"

const AdminPage = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const [open, setOpen] = useState(false);
  const [keySelected, setKeySelected] = useState(localStorage.getItem('adminKey') || 'stats');
  
  useEffect(() => {
    // Kiểm tra quyền admin - defense in depth
    if (!user?.access_token || !user?.isAdmin) {
      navigate('/');
    }
  }, [user, navigate]);
  
  const items = [
    getItem('Thống kê', 'stats', <BarChartOutlined />),
    getItem('Quản lý sản phẩm', 'product', <AppstoreOutlined />),
    getItem('Quản lý đơn hàng', 'order', <ShoppingOutlined />),
    getItem('Quản lý người dùng', 'user', <UserOutlined />),
    getItem('Quản lý mã giảm giá', 'voucher', <TagOutlined />),
    getItem('Cài đặt Website', 'webInfo', <SettingOutlined />),
  ]

  // Nếu không phải admin, không render gì cả
  if (!user?.access_token || !user?.isAdmin) {
    return null;
  }

  const renderPage = (key) => {
    switch (key) {
      case 'stats': return <AdminStats />
      case 'user': return <AdminUser />
      case 'product': return <AdminProduct />
      case 'order': return <AdminOrder />
      case 'voucher': return <AdminVoucher />
      case 'webInfo': return <AdminWebInfo />
      default: return <></>
    }
  }

  const handleOnclick = ({ key }) => {
    setKeySelected(key)
    localStorage.setItem('adminKey', key);
    setOpen(false); // Close drawer on selection
  }

  return (
    <>
      <HeaderCompoent isHiddenSearch={true} isHiddenCart={true} isHiddenMenu={true} isHiddenFavorite={true} />
      <div className='admin_page'>

        {/* Mobile Toggle Button */}
        <div className="mobile-menu-toggle-admin">
          <Button icon={<MenuOutlined />} onClick={() => setOpen(true)} type="primary" />
          <span style={{ marginLeft: 10, fontWeight: 'bold' }}>Menu Quản lý</span>
        </div>

        {/* Desktop Sidebar - Hidden on mobile via CSS */}
        <div className="desktop-sidebar">
          <Menu
            mode='inline'
            style={{
              width: 256,
              boxShadow: '1px 1px 2px #ccc',
              height: '100%',
            }}
            items={items}
            onClick={handleOnclick}
            selectedKeys={[keySelected]}
          />
        </div>

        {/* Mobile Drawer */}
        <Drawer
          title="Quản lý"
          placement="left"
          onClose={() => setOpen(false)}
          open={open}
          width={260}
          bodyStyle={{ padding: 0 }}
        >
          <Menu
            mode='inline'
            style={{ borderRight: 0 }}
            items={items}
            onClick={handleOnclick}
            selectedKeys={[keySelected]}
          />
        </Drawer>

        <div className='content' >
          {renderPage(keySelected)}
        </div>
      </div>
    </>
  )
}

export default AdminPage