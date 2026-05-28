import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import InputFormComponent from '../../components/InputFormComponent/InputFormComponent';
import ButtonComponent from '../../components/ButtonComponent/ButtonComponent';
import LoadingComponent from '../../components/LoadingComponent/LoadingComponent';
import * as UserService from '../../services/User.Service';
import * as CartService from '../../services/Cart.Service';
import * as FavoriteService from '../../services/Favorite.Service';
import { useMutationHook } from '../../hooks/useMutationHook';
import { jwtDecode } from 'jwt-decode';
import { useDispatch } from 'react-redux';
import { updateUser } from '../../redux/slices/UserSlice';
import { setSearch } from '../../redux/slices/ProductSlice';
import { setCart } from '../../redux/slices/CartSlice';
import { setFavoriteIds } from '../../redux/slices/FavoriteSlice';
import './ResetPasswordPage.scss';
import { LockOutlined } from '@ant-design/icons';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const userId = location.state?.userId || sessionStorage.getItem('userId');
  const access_token = location.state?.access_token || sessionStorage.getItem('access_token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    dispatch(setSearch(''));
  }, [dispatch]);

  useEffect(() => {
    if (!userId || !access_token) {
      navigate('/forgot-password');
    }
  }, [userId, access_token, navigate]);

  const mutation = useMutationHook((data) => UserService.resetPassword(data, access_token));
  const { data, isSuccess, isPending } = mutation;

  const loginAfterReset = async (token) => {
    const cleanToken = String(token).replace(/^"(.*)"$/, '$1').trim();
    localStorage.setItem('access_token', JSON.stringify(cleanToken));

    const decode = jwtDecode(cleanToken);
    if (!decode?.id) {
      throw new Error('Token không hợp lệ');
    }

    const userRes = await UserService.getDetailUser(decode.id, cleanToken);
    dispatch(updateUser({ access_token: cleanToken, ...userRes?.data }));

    try {
      const cartRes = await CartService.getDetail(decode.id, cleanToken);
      if (cartRes?.data) {
        dispatch(setCart({ items: [...cartRes.data], total: cartRes?.total || 0 }));
      }
    } catch {
      // Giỏ hàng có thể trống hoặc API lỗi — không chặn đăng nhập
    }

    try {
      const favRes = await FavoriteService.getUserFavorite(decode.id, cleanToken);
      if (favRes?.data) {
        const listId = favRes.data.filter((item) => item?._id).map((item) => item._id);
        dispatch(setFavoriteIds({ total: favRes?.total || 0, productIds: listId }));
      }
    } catch {
      // API yêu thích có thể chưa có — bỏ qua
    }
  };

  const handleResetPassword = () => {
    if (!password || !confirmPassword) {
      setErrorMessage('Vui lòng nhập đầy đủ mật khẩu');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp');
      return;
    }
    if (!userId) return;
    mutation.mutate({ userId, password });
  };

  useEffect(() => {
    if (data?.status === 'ERR') {
      setErrorMessage(data.message);
    } else if (data?.status === 'OK') {
      setErrorMessage('');
    }
  }, [data]);

  useEffect(() => {
    const finishReset = async () => {
      if (data?.status === 'OK' && isSuccess && access_token) {
        try {
          await loginAfterReset(access_token);
          sessionStorage.removeItem('access_token');
          sessionStorage.removeItem('userId');
          navigate('/');
        } catch {
          setErrorMessage('Đặt mật khẩu thành công nhưng không tải được thông tin. Vui lòng đăng nhập lại.');
        }
      }
    };
    finishReset();
  }, [data, isSuccess, access_token, navigate, dispatch]);

  return (
    <div className="auth_page reset_password_page">
      <LoadingComponent isPending={isPending}>
        <div className="auth_card">
          <div className="auth_icon_wrap">
            <LockOutlined />
          </div>
          <h2>Đặt lại mật khẩu</h2>
          <p className="auth_subtitle">Tạo mật khẩu mới cho tài khoản của bạn</p>

          <InputFormComponent
            placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            name="new-password"
          />
          <InputFormComponent
            placeholder="Xác nhận mật khẩu mới"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            name="confirm-new-password"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleResetPassword();
            }}
          />

          <label className="show_pass_label">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            Hiện mật khẩu
          </label>

          {errorMessage && <p className="auth_error">{errorMessage}</p>}

          <ButtonComponent
            onClick={handleResetPassword}
            disabled={!password || !confirmPassword || isPending}
            textButton={isPending ? 'Đang xử lý...' : 'Xác nhận đặt lại'}
            styleButton={{
              width: '100%',
              padding: '14px',
              marginTop: 12,
              background: '#22c55e',
              border: 'none',
              borderRadius: 10,
            }}
            styleTextButton={{ color: '#fff', fontWeight: 700 }}
          />
        </div>
      </LoadingComponent>
    </div>
  );
};

export default ResetPasswordPage;
