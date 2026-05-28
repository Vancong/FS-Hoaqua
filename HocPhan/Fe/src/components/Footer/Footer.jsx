import React from 'react'
import './Footer.scss'
import { useSelector } from 'react-redux'
import {FacebookOutlined,TikTokOutlined} from '@ant-design/icons'
const Footer = () => {
  const websiteInfo=useSelector(state => state.websiteInfo);
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-col">
            <h4>Về chúng tôi</h4>
            <ul className="footer-info">
              <li>
                <span className="label">Địa chỉ</span>
                <span className="value">{websiteInfo?.address || '-'}</span>
              </li>
              <li>
                <span className="label">Số điện thoại</span>
                {websiteInfo?.phone ? (
                  <a className="value link" href={`tel:${websiteInfo.phone}`}>{websiteInfo.phone}</a>
                ) : (
                  <span className="value">-</span>
                )}
              </li>
              <li>
                <span className="label">Email</span>
                {websiteInfo?.email ? (
                  <a className="value link" href={`mailto:${websiteInfo.email}`}>{websiteInfo.email}</a>
                ) : (
                  <span className="value">-</span>
                )}
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Chính sách</h4>
            <ul className="footer-links">
              <li><span className="link-item">Chính sách đổi trả</span></li>
              <li><span className="link-item">Chính sách bảo mật</span></li>
              <li><span className="link-item">Điều khoản dịch vụ</span></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Hỗ trợ</h4>
            <ul className="footer-links">
              <li><span className="link-item">Hướng dẫn mua hàng</span></li>
              <li><span className="link-item">Câu hỏi thường gặp</span></li>
              <li><span className="link-item">Hỗ trợ khách hàng</span></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Kết nối</h4>
            <div className="social">
              <a
                href={websiteInfo?.socialLinks?.facebook || '#'}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
              >
                <FacebookOutlined />
              </a>
              <a
                href={websiteInfo?.socialLinks?.tiktok || '#'}
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok"
              >
                <TikTokOutlined />
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          © 2026 Cửa Hàng Trái Cây Sạch. {websiteInfo?.name || ''}
        </div>

      </div>
    </footer>
  )
}

export default Footer
