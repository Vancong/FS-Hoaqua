  import React, { Fragment, useEffect, useState } from 'react'
  import {BrowserRouter as Router, Routes,Route, Navigate} from "react-router-dom";
  import { routes } from './routes';
  import DefaultComponent from './components/DefaultComponent/DefaultComponent';
  import { jwtDecode } from 'jwt-decode';
  import { useDispatch, useSelector } from 'react-redux';
  import { updateUser } from './redux/slices/UserSlice';
  import *as UserService  from "./services/User.Service";
  import LoadingComponent from './components/LoadingComponent/LoadingComponent';
  import *as CartService from './services/Cart.Service';
  import { setCart } from './redux/slices/CartSlice'; 
  import { setFavoriteIds } from './redux/slices/FavoriteSlice';
  import *as FavoriteService from "./services/Favorite.Service.js";
  import ScrollToTop  from "./components/ScrollToTop/ScrollToTop.jsx"
  import *as WebSiteInfoService from "./services/websiteInfo.Service.js";
  import { setInfo } from './redux/slices/WebSiteInfo.js';
  export function App() { 
    const dispatch=useDispatch();
    const user=useSelector((state =>state.user));
    const [isLoading,setIsLoading]=useState(false);
    useEffect(() => {
      handlDetailInfoWebSite();

      const { decode, storeData } = handleDecode() || {};
      if (decode?.id) {
        handlGetDetailUser(decode.id, storeData);
        handlDetailCart(decode.id, storeData);
        handleGetUserFavorites(decode.id, storeData);
      }

    },[])

    const handlDetailCart = async (id, access_token) => {
      try {
        const res = await CartService.getDetail(id, access_token);
        if (res && res.data) {
          const items = [...res.data];
          dispatch(setCart({ items, total: res.total }));
        }
      } catch (error) {
        console.warn('Giỏ hàng không khả dụng (404)');
      }
    }

    const handlDetailInfoWebSite = async () => {
      try {
        const res = await WebSiteInfoService.getInfo();
        if (res && res.data) {
          dispatch(setInfo(res.data));
        }
      } catch (error) {
        console.warn('Thông tin website không khả dụng (404)');
      }
    }
    
    const handleGetUserFavorites = async (id, access_token) => {
      try {
        const res = await FavoriteService.getUserFavorite(id, access_token);
        if (res && res.data) {
          const listId = res.data.filter(item => item?._id).map(item => item._id);
          dispatch(setFavoriteIds({ total: res?.total || 0, productIds: listId }));
        }
      } catch (error) {
        console.warn('Danh sách yêu thích không khả dụng (404)');
      }
    };

    const handleDecode = () => {
      let storeData = localStorage.getItem('access_token');
      if (!storeData) return {};
      try {
        const decode = jwtDecode(storeData);
        return { decode, storeData };
      } catch (err) {
        console.log('Token không hợp lệ hoặc hết hạn:', err);
        return {};
      }
    };

    const handlGetDetailUser = async (id, access_token) => {
      try {
        const res = await UserService.getDetailUser(id, access_token);
        dispatch(updateUser({ ...res?.data, access_token }))
      } catch (error) {
        console.error('Không thể lấy chi tiết người dùng:', error);
      }
    }



    if (isLoading) return <LoadingComponent isPending={true} />;
    
return (

      <div>
            <Router>
              <ScrollToTop />
              <Routes>
                {
                  routes.length>0&&routes.map(route =>{
                    const Page=route.page      
                    const Layout= route.isShowHeader? DefaultComponent: Fragment
                    const isUserLoggedIn = Boolean(user?.access_token);
                    const isUserAdmin = Boolean(user?.isAdmin);

                    let ischeckAuth = true;
                    if (route.isPrivate && !isUserLoggedIn) {
                      ischeckAuth = false;
                    }
                    
                    if (route.isAdminOnly && !isUserAdmin) {
                        ischeckAuth = false; 
                    }
                    return (
                      <Route key={route.path} path={route.path} element= {
                        ischeckAuth ? (
                            <Layout>
                              <Page />
                            </Layout>
                        ): (
                            <Navigate to="/" state={route.path} replace />
                        )
                      
                      } />
                    )
                  })
                }      
              </Routes>              
            </Router>

      </div>
      
    )
  }