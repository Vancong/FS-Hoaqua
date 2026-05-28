import React, { useEffect, useState } from 'react'
import { Badge, Col, Popover, Drawer } from 'antd';
import SearchAutoComponent from '../SearchAutoComponent/SearchAutoComponent';
import { UserOutlined, CaretDownOutlined, ShoppingCartOutlined, HeartOutlined, MenuOutlined } from '@ant-design/icons';
import "./header.scss";
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import * as UserService from "../../services/User.Service"
import { resetUser } from '../../redux/slices/UserSlice'
import CartDrawerComponent from '../CartDrawerComponent/CartDrawerComponent';
import { clearCart } from '../../redux/slices/CartSlice';
import { resetFavorite } from '../../redux/slices/FavoriteSlice';
import TypeProduct from "../TypeProduct/TypeProduct"
import MegaDropdownComponent from '../MegaDropdownComponent/MegaDropdownComponent';
import { setSearch } from "../../redux/slices/ProductSlice.js"
const HeaderCompoent = ({ isHiddenFavorite = false, isHiddenCart = false, isHiddenSearch = false, isHiddenMenu = false }) => {
  const user = useSelector((state) => state.user)
  const cart = useSelector((state) => state.cart)
  const favorite = useSelector((state) => state.favorite)


  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const dispatch = useDispatch();
  const [userName, setUserName] = useState('');
  const [userAvt, setUserAvt] = useState('');
  const [selected, setSelected] = useState(null);
  const websiteInfo = useSelector(state => state.websiteInfo)

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    if (path === '/') {
      setSelected('Trang chủ');
    } else if (path.includes('khuyen-mai')) {
      setSelected('Khuyến mãi');
    } else if (path.includes('trai-cay-noi-djia') || path.includes('trai-cay-noi-dia')) {
      setSelected('Trái cây nội địa');
    } else if (path.includes('trai-cay-nhap-khau')) {
      setSelected('Trái cây nhập khẩu');
    } else {
      setSelected(null);
    }
  }, [location.pathname]);

  const handleNavigateLogin = () => {
    navigate('/sign-in')
  }

  const handleLogout = async () => {
    localStorage.removeItem('access_token');
    dispatch(resetUser());
    dispatch(clearCart())
    dispatch(resetFavorite())
    await UserService.logoutUser();

  }

  useEffect(() => {
    setUserName(user?.name);
    setUserAvt(user?.avt);
  }, [user.name, user.avt]);


  const content = (
    <div>
      {user.isAdmin &&
        <p className='contentPopup' onClick={() => navigate('/admin/dashboard')}>Quản lý hệ thống</p>
      }
      <p className='contentPopup' onClick={() => navigate('/profile-user')}>Thông tin người dùng </p>
      <p className='contentPopup' onClick={() => navigate('/my-order')}>Đơn hàng của tôi </p>
      <p className='contentPopup' onClick={handleLogout}>Đăng xuất </p>
    </div>
  )
  const itemsMenu = ['Trang chủ', 'Khuyến mãi', 'Trái cây nội địa', 'Trái cây nhập khẩu'];




  return (
    <div className='header'>
      <div className='header_top'
        style={{ justifyContent: isHiddenSearch && isHiddenFavorite ? 'space-between' : 'unset' }}
      >
        <Col xs={24} sm={24} md={6} lg={6} className='header_logo'>
          <div className="header_logo_inner">
            <img
              src={websiteInfo?.logo || 'https://images.unsplash.com/photo-1610832958506-ee56336191d8?auto=format&fit=crop&q=80&w=100'}
              alt="logo"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1610832958506-ee56336191d8?auto=format&fit=crop&q=80&w=100';
              }}
              style={{ width: 44, height: 44, objectFit: 'cover', cursor: 'pointer', borderRadius: '10px' }}
              onClick={() => navigate('/')}
            />
            <h2 style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
              {websiteInfo?.name ? (
                <>
                  {websiteInfo.name.split(' ').slice(0, -1).join(' ')}{' '}
                  <span style={{ color: '#22c55e' }}>{websiteInfo.name.split(' ').slice(-1)}</span>
                </>
              ) : (
                <>
                  Cửa hàng <span style={{ color: '#22c55e' }}>Trái cây</span>
                </>
              )}
            </h2>
          </div>
        </Col>
        {!isHiddenSearch && (
          <Col xs={24} sm={24} md={14} lg={14} className='header_search'>
            <SearchAutoComponent />
          </Col>
        )}

        <Col xs={24} sm={24} md={6} lg={6} className='header_user'>

          <div className='user'>
            <div className="header_actions">
              {!isHiddenFavorite && user?.access_token && (
                <Badge count={favorite?.total || 0} size='small'
                  onClick={() => {
                    if (!user?.access_token) {
                      navigate('/login', { state: '/type/favorite' })
                    }
                    else {
                      navigate('/type/favorite')
                    }

                  }}
                >
                  <span className="header_action_icon" role="button" tabIndex={0}>
                    <HeartOutlined style={{ fontSize: '29px' }} />
                  </span>
                </Badge>
              )}
              {!isHiddenCart && user?.access_token && (
                <Badge count={cart?.total || 0} size='small' >
                  <span className="header_action_icon" role="button" tabIndex={0} onClick={() => setIsOpenDrawer(true)} >
                    <ShoppingCartOutlined style={{ fontSize: '28px' }} />
                  </span>
                </Badge>
              )}
            </div>

            <CartDrawerComponent open={isOpenDrawer} onClose={() => setIsOpenDrawer(false)} />

            {user?.access_token ? (
              <>
                <Popover content={content} trigger="click">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {userAvt ? (
                      <img className='avt-header' alt={user.avt} src={user.avt} />
                    ) : (
                      <UserOutlined style={{ fontSize: "28px", marginLeft: "7px" }} />
                    )
                    }
                    <div className='user_text'> {userName?.length ? userName : user?.email}</div>
                  </div>
                </Popover>
              </>
            ) : (
              <div onClick={handleNavigateLogin} style={{ cursor: 'pointer' }} className="account-login-container">
                <span className='user_text register-text'>Đăng nhập/Đăng ký</span>
                <div className="account-details">
                  <span className='user_text'>Tài khoản </span>
                  <CaretDownOutlined />
                </div>
              </div>
            )}

          </div>

        </Col>

        <div className="mobile-menu-toggle">
          <MenuOutlined className="hamburger_menu" onClick={() => setIsOpenMenu(true)} />
          <Drawer
            title="Danh mục"
            placement="left"
            onClose={() => setIsOpenMenu(false)}
            open={isOpenMenu}
            width="75%"
          >
            <ul className="menu_item_mobile">
              {itemsMenu.map((product, index) => (
                <li key={index} className={`menu_item_li ${selected === product ? 'active' : ''}`}
                  onClick={() => {
                    setSelected(product)
                    dispatch(setSearch(''))
                    setIsOpenMenu(false)
                  }}
                  style={product === 'Khuyến mãi' ? { color: '#f73123' } : {}}
                >
                  {product === 'Note hương' || product === 'Thương hiệu' ? (
                    <MegaDropdownComponent
                      title={product}
                      type={product === 'Thương hiệu' ? 'brands' : 'notes'}
                      selected={selected}
                      setSelected={setSelected}
                    />
                  ) : (
                    <TypeProduct name={product} />
                  )}
                </li>
              ))}
            </ul>
          </Drawer>
        </div>

      </div>

      {!isHiddenMenu && (
        <ul className="menu_item">
          {itemsMenu.map((product, index) => (
            <li key={index} className={`menu_item_li ${selected === product ? 'active' : ''}`}
              onClick={() => {
                setSelected(product)
                dispatch(setSearch(''))

              }}
              style={product === 'Khuyến mãi' ? { color: '#f73123' } : {}}
            >
              {product === 'Note hương' || product === 'Thương hiệu' ? (
                <MegaDropdownComponent
                  title={product}
                  type={product === 'Thương hiệu' ? 'brands' : 'notes'}
                  selected={selected}
                  setSelected={setSelected}
                />
              ) : (
                <TypeProduct name={product} />
              )}
            </li>
          ))}
        </ul>
      )}



    </div>
  )
}

export default HeaderCompoent