import React, { useEffect, useState } from 'react';
import "./FilterSidebarComponent.scss";
import { useLocation, useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { FilterOutlined, DollarOutlined, AppstoreOutlined } from '@ant-design/icons';

const FilterSidebarComponent = ({ setCurrentPage, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [tmpPrice, setTmpPrice] = useState('');
  const [tmpCategory, setTmpCategory] = useState('');

  useEffect(() => {
    setTmpPrice(searchParams.get('price') || '');
    
    const path = location.pathname;
    if (path.includes('trai-cay-noi-dia') || path.includes('trai-cay-noi-djia')) {
      setTmpCategory('Trái cây nội địa');
    } else if (path.includes('trai-cay-nhap-khau')) {
      setTmpCategory('Trái cây nhập khẩu');
    } else {
      setTmpCategory(searchParams.get('category') || '');
    }
  }, [location.pathname, location.search, searchParams]);

  const handleReset = () => {
    setTmpPrice('');
    setTmpCategory('');
    setCurrentPage(1);
    navigate('/type/trai-cay-noi-dia', { state: 'Trái cây nội địa' });
    if (onClose) onClose();
  };

  const priceRanges = ['< 100.000đ', '100.000đ - 300.000đ', '> 300.000đ'];
  const categories = ['Trái cây nội địa', 'Trái cây nhập khẩu'];

  const handlePriceClick = (price) => {
    setTmpPrice(tmpPrice === price ? '' : price);
  };

  const handleCategoryClick = (cat) => {
    setTmpCategory(tmpCategory === cat ? '' : cat);
  };

  const handleFilterClick = () => {
    const queryParams = new URLSearchParams();
    if (tmpPrice) queryParams.set('price', tmpPrice);
    if (tmpCategory) queryParams.set('category', tmpCategory);

    const qs = queryParams.toString();
    navigate(qs ? `/type/loc-san-pham?${qs}` : '/type/trai-cay-noi-dia', {
      state: qs ? 'Lọc Sản Phẩm' : 'Trái cây nội địa',
    });
    setCurrentPage(1);
    if (onClose) onClose();
  };

  const activeCount = [tmpPrice, tmpCategory].filter(Boolean).length;

  return (
    <div className="filter_sidebar">
      <div className="filter_sidebar_header">
        <FilterOutlined className="filter_header_icon" />
        <div>
          <h3>Bộ lọc</h3>
          {activeCount > 0 && (
            <span className="filter_active_badge">{activeCount} đang chọn</span>
          )}
        </div>
      </div>

      <div className="filter_buttons">
        <button type="button" className="clear_btn" onClick={handleReset}>
          Xoá tất cả
        </button>
        <button type="button" className="filter_btn" onClick={handleFilterClick}>
          Áp dụng
        </button>
      </div>

      <div className="filter_group">
        <h4>
          <DollarOutlined /> Khoảng giá
        </h4>
        <div className="filter_options">
          {priceRanges.map((price) => (
            <button
              type="button"
              key={price}
              className={`filter_item ${tmpPrice === price ? 'active' : ''}`}
              onClick={() => handlePriceClick(price)}
            >
              <span className="filter_dot" aria-hidden />
              <span className="filter_label">{price}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="filter_group">
        <h4>
          <AppstoreOutlined /> Phân loại
        </h4>
        <div className="filter_options">
          {categories.map((cat) => (
            <button
              type="button"
              key={cat}
              className={`filter_item ${tmpCategory === cat ? 'active' : ''}`}
              onClick={() => handleCategoryClick(cat)}
            >
              <span className="filter_dot" aria-hidden />
              <span className="filter_label">{cat}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebarComponent;
