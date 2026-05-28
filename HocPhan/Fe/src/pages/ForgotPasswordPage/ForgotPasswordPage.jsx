import React, { useState, useEffect } from 'react';
import InputFormComponent from '../../components/InputFormComponent/InputFormComponent';
import ButtonComponent from '../../components/ButtonComponent/ButtonComponent';
import * as UserService from '../../services/User.Service';
import { useMutationHook } from '../../hooks/useMutationHook';
import './ForgotPasswordPage.scss';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setSearch } from '../../redux/slices/ProductSlice';
import { MailOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [canSend, setCanSend] = useState(true);
  const [timer, setTimer] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setSearch(''));
  }, [dispatch]);

  const sendOtpMutation = useMutationHook((emailValue) => UserService.sendOtp(emailValue));
  const verifyOtpMutation = useMutationHook((data) => UserService.verifyOtp(data));

  const { data: dataVeri, isSuccess: isSuccessVeri } = verifyOtpMutation;

  useEffect(() => {
    if (dataVeri?.status === 'OK') {
      dispatch(setSearch(''));
      sessionStorage.setItem('userId', dataVeri.userId);
      sessionStorage.setItem('access_token', dataVeri.access_token);
      navigate('/reset-password', {
        state: { userId: dataVeri.userId, access_token: dataVeri.access_token },
      });
    } else if (dataVeri?.status === 'ERR') {
      setErrorMsg(dataVeri.message);
    }
  }, [dataVeri, isSuccessVeri, navigate, dispatch]);

  useEffect(() => {
    if (sendOtpMutation.data?.status === 'OK') {
      setSuccessMsg(sendOtpMutation.data.message || 'Đã gửi mã OTP');
      setErrorMsg('');
    } else if (sendOtpMutation.data?.status === 'ERR') {
      setErrorMsg(sendOtpMutation.data.message);
      setCanSend(true);
      setTimer(0);
    }
  }, [sendOtpMutation.data]);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setTimeout(() => setTimer(timer - 1), 1000);
    } else {
      setCanSend(true);
    }
    return () => clearTimeout(interval);
  }, [timer]);

  const handleSendOtp = () => {
    if (!email.trim()) return;
    setErrorMsg('');
    setSuccessMsg('');
    sendOtpMutation.mutate(email.trim());
    setCanSend(false);
    setTimer(60);
  };

  const handleVerifyOtp = () => {
    if (!email.trim() || !otp.trim()) return;
    setErrorMsg('');
    verifyOtpMutation.mutate({ email: email.trim(), otp: otp.trim() });
  };

  return (
    <div className="auth_page forgot_password_page">
      <div className="auth_card">
        <div className="auth_icon_wrap">
          <MailOutlined />
        </div>
        <h2>Quên mật khẩu</h2>
        <p className="auth_subtitle">Nhập email để nhận mã OTP, sau đó xác nhận để đặt mật khẩu mới</p>

        <div className="otp_row">
          <InputFormComponent
            placeholder="Nhập email đăng ký"
            value={email}
            onChange={setEmail}
            autoComplete="email"
            name="forgot-password-email"
            style={{ flex: 1 }}
          />
          <ButtonComponent
            disabled={!canSend || !email.trim() || sendOtpMutation.isPending}
            onClick={handleSendOtp}
            textButton={
              sendOtpMutation.isPending
                ? 'Đang gửi...'
                : canSend
                  ? 'Gửi mã'
                  : `Gửi lại (${timer}s)`
            }
            styleButton={{ padding: '10px 14px', minWidth: 110, whiteSpace: 'nowrap' }}
          />
        </div>

        {successMsg && <p className="auth_success">{successMsg}</p>}

        <div className="otp_input_wrap">
          <SafetyCertificateOutlined className="field_icon" />
          <InputFormComponent
            placeholder="Nhập mã OTP (4 số)"
            value={otp}
            onChange={setOtp}
            autoComplete="one-time-code"
            name="forgot-password-otp"
            inputMode="numeric"
            maxLength={4}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && email && otp) handleVerifyOtp();
            }}
          />
        </div>

        {errorMsg && <p className="auth_error">{errorMsg}</p>}
        {verifyOtpMutation.isPending && <p className="auth_hint">Đang xác nhận mã OTP...</p>}

        <ButtonComponent
          disabled={!email.trim() || !otp.trim() || verifyOtpMutation.isPending}
          onClick={handleVerifyOtp}
          textButton={verifyOtpMutation.isPending ? 'Đang xác nhận...' : 'Xác nhận OTP'}
          styleButton={{
            width: '100%',
            padding: '14px',
            marginTop: 8,
            background: '#22c55e',
            border: 'none',
            borderRadius: 10,
          }}
          styleTextButton={{ color: '#fff', fontWeight: 700 }}
        />

        <p className="auth_back">
          <Link to="/sign-in">← Quay lại đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
