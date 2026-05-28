import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import "./NavigationPathComponent.scss"

const NavigationPathComponent = ({ category='', slugCt='', product='' }) => {
  const navigate = useNavigate();
  const {type}=useParams();
  const categoryMap = {
    'trai-cay-noi-dia': 'Trái cây nội địa',
    'trai-cay-noi-djia': 'Trái cây nội địa',
    'trai-cay-nhap-khau': 'Trái cây nhập khẩu',
    'khuyen-mai': 'Khuyến mãi'
  };
  const categoryName = category || categoryMap[type];

  return (
   <div className="navigation_path">
      <span onClick={() => navigate('/')}>Trang chủ</span>
      {categoryName && (
        <>
          <span> / </span>
          <span
            onClick={() => slugCt && navigate(slugCt)}
            className={!product ? 'active' : ''}
          >
            {categoryName}
          </span>
        </>
      )}
      {product && (
        <>
          <span> / </span>
          <span className="active">{product}</span>
        </>
      )}
    </div>
  );
};

export default NavigationPathComponent;
