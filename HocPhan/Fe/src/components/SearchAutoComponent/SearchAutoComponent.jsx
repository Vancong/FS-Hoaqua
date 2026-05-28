import React, { useRef, useState } from 'react';
import { AutoComplete, Input } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { setSearch } from '../../redux/slices/ProductSlice';
import { useNavigate } from 'react-router-dom';
import * as ProductService from '../../services/Product.Services';
import { Fomater } from "../../utils/fomater";
import { debounce } from 'lodash';
import { SearchOutlined } from '@ant-design/icons';
import './SearchAutoComponent.scss';

const SearchAutoComponent = () => {
  const [options, setOptions] = useState([]);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const search = useSelector((state) => state.product.search);

  const handleSearch = debounce(async (value) => {
    if (!value.trim()) return setOptions([]);
    try {
      const res = await ProductService.getAllProduct({ search: value });
      const data = res.data?.map((item) => {
        const itemPrice = item?.price || 0;
        const itemImage = item?.image || (item?.images && item.images[0] ? item.images[0] : '');

        return {
          value: item.name,
          productId: item._id,
          label: (  
            <div className="search-option">
              <div className='search_left'>
                <img src={itemImage} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
              </div>
         
              <div className="search_right">
                <div className="name">
                  {item.name.split(new RegExp(`(${value})`, 'gi')).map((text, index) => {
                    const isMatch = text.toLowerCase() === value.toLowerCase();
                    if (isMatch) {
                      return <strong key={index} style={{ color: '#22c55e' }}>{text}</strong>; 
                    } else {
                      return <span key={index}>{text}</span>;     
                    }
                  })}
                </div>
                <div className="price" style={{ color: '#ef4444', fontSize: '15px', fontWeight: 'bold' }}>{Fomater(itemPrice)}</div>
              </div>
            </div>
          ),
        };
      });
      setOptions([
        {
          label: <strong style={{ color: '#1e3a1e' }}>Sản phẩm gợi ý</strong>,
          options: data,
        },
      ]);
    } catch {
      setOptions([]);
    }
  }, 300);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      // antd AutoComplete thường auto-select option đầu tiên khi Enter
      // => chặn mặc định để Enter luôn là "tìm theo từ khoá"
      e.preventDefault();
      e.stopPropagation();
      inputRef.current?.blur();
      if (!search.trim()) return;
      dispatch(setSearch(search.trim()));
      setOptions([]);
      navigate('/type/search');
    }
  };

  const handleSelect = (value, option) => {
    // Click gợi ý: vào chi tiết sản phẩm theo _id
    if (option?.productId) {
      navigate(`/product-details/${option.productId}`, { state: { product: option.value } });
      return;
    }

    // Fallback: tìm theo từ khoá
    dispatch(setSearch(String(value || '').trim()));
    setOptions([]);
    navigate('/type/search');
  };

  return (
    <AutoComplete
      value={search} 
      options={options}
      style={{ width: '100%' }}
      onSearch={handleSearch}
      onSelect={handleSelect}
      defaultActiveFirstOption={false}
      filterOption={false}
      dropdownStyle={{ marginTop: 14 }}
      dropdownAlign={{ offset: [0, 12] }}
      className="custom-auto-complete"
      popupClassName="custom-dropdown"
    >
      <Input
        ref={inputRef}
        id="product-search-input"
        name="product-search"
        type="search"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        size="large"
        placeholder="Tìm kiếm trái cây tươi sạch..."
        prefix={<SearchOutlined style={{ color: '#22c55e', fontSize: '18px', marginRight: '4px' }} />}
        onChange={(e) => {
          dispatch(setSearch(e.target.value))
        }}
        onKeyDown={handleKeyDown}
        onPressEnter={handleKeyDown}
        allowClear
        style={{ 
          borderRadius: '30px', 
          border: '1.5px solid #22c55e',
          padding: '8px 16px',
          boxShadow: '0 4px 12px rgba(34, 197, 94, 0.05)',
        }}
      />
    </AutoComplete>
  );
};

export default SearchAutoComponent;
