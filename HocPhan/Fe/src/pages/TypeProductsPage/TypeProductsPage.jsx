import React, { useState } from 'react'
import FilterSidebarComponent from '../../components/FilterSidebarComponent/FilterSidebarComponent'
import CardComponent from '../../components/CardComponent/CardComponent'
import { Row, Col, Pagination, Drawer, Button, Select, Empty } from "antd";
import { FilterOutlined, AppstoreOutlined, SortAscendingOutlined } from '@ant-design/icons';
import './TypeProductsPage.scss';
import { useLocation, useParams } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import * as ProductService from "../../services/Product.Services"
import LoadingComponent from '../../components/LoadingComponent/LoadingComponent';
import NavigationPathComponent from '../../components/NavigationPathComponent/NavigationPathComponent';
import * as FavoriteService from "../../services/Favorite.Service"
import { useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ProductListSection from '../../components/ProductListSection/ProductListSection';

const CATEGORY_BANNERS = {
  'Trái cây nội địa': {
    image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&q=80&w=1600',
    tag: 'Tươi mỗi ngày',
    desc: 'Trái cây Việt Nam chọn lọc, giao tận tay trong ngày',
  },
  'Trái cây nhập khẩu': {
    image: 'https://images.unsplash.com/photo-1595475207225-428b62bda831?auto=format&fit=crop&q=80&w=1600',
    tag: 'Chất lượng cao cấp',
    desc: 'Cherry, Kiwi, Nho... nhập khẩu chính hãng, chất lượng cao cấp',
  },
  'Khuyến mãi': {
    image: 'https://images.unsplash.com/photo-1464965911861-746a04a4b936?auto=format&fit=crop&q=80&w=1600',
    tag: 'Ưu đãi hot',
    desc: 'Giảm giá sốc — mua ngay kẻo lỡ',
  },
};

const DEFAULT_BANNER = {
  image: 'https://images.unsplash.com/photo-1610832958506-ee56336191d8?auto=format&fit=crop&q=80&w=1600',
  tag: 'Cửa hàng trái cây',
  desc: 'Trái cây tươi sạch, an toàn cho sức khỏe',
};

const TypeProductsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  let { state } = location;
  const [searchParams] = useSearchParams();
  const { type: slug } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 12;
  const [keyValue, setKeyValue] = useState({ key: 'createdAt', value: -1 })
  const [sortValue, setSortValue] = useState('newest')
  const searchKeyword = useSelector(state => state.product.search);
  const user = useSelector((state) => state.user)
  const [isOpenFilter, setIsOpenFilter] = useState(false);

  // Restore category state title from slug if state is lost on page reload
  if (!state) {
    if (slug === 'trai-cay-noi-dia' || slug === 'trai-cay-noi-djia') {
      state = 'Trái cây nội địa';
    } else if (slug === 'trai-cay-nhap-khau') {
      state = 'Trái cây nhập khẩu';
    } else if (slug === 'khuyen-mai') {
      state = 'Khuyến mãi';
    }
  }

  const categoryMap = {
    'Trái cây nội địa': 'nội địa',
    'Trái cây nhập khẩu': 'nhập khẩu',
    'trai-cay-noi-dia': 'nội địa',
    'trai-cay-noi-djia': 'nội địa',
    'trai-cay-nhap-khau': 'nhập khẩu',
  };

  let apiSearch = searchKeyword || '';
  const selectedCat = searchParams.get('category') || slug;
  if (selectedCat && categoryMap[selectedCat]) {
    apiSearch = categoryMap[selectedCat];
  }

  let { data: products, isLoading } = useQuery({
    queryKey: ['products-type', slug, currentPage, limit, apiSearch, keyValue],
    queryFn: () => ProductService.getAllProduct({
      page: currentPage,
      limit,
      search: apiSearch,
      key: keyValue.key,
      value: keyValue.value,
      hasDiscount: slug === 'khuyen-mai'
    }),
    placeholderData: keepPreviousData,
    enabled: slug !== 'favorite'
  });

  const { data: productsFavorite, isLoadingFavorite, isError: isErrorFavorite, error: errorFavorite, isFetching: isFetchingFavorite } = useQuery({
    queryKey: ['products-favorite', slug, user?.id],
    queryFn: async () => {
      const result = await FavoriteService.getUserFavorite(user?.id, user.access_token);
      return result;
    },
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    enabled: slug === 'favorite' && !!user?.id && !!user?.access_token,
    retry: false,
    refetchOnWindowFocus: false,
  });

  let productDataRender = products?.data;

  if (productDataRender) {
    const priceFilter = searchParams.get('price');
    if (priceFilter) {
      if (priceFilter === '< 100.000đ') {
        productDataRender = productDataRender.filter(p => p.price < 100000);
      } else if (priceFilter === '100.000đ - 300.000đ') {
        productDataRender = productDataRender.filter(p => p.price >= 100000 && p.price <= 300000);
      } else if (priceFilter === '> 300.000đ') {
        productDataRender = productDataRender.filter(p => p.price > 300000);
      }
    }
  }

  if (!state && slug === 'search') {
    state = `Kết quả tìm kiếm của "${searchKeyword}"`
  }
  else if (!state && slug === 'favorite') {
    state = `Sản phẩm yêu thích`
    if (productsFavorite && !isLoadingFavorite) {
      productDataRender = productsFavorite?.data || [];
      productDataRender = productDataRender.filter(item => item !== null && item !== undefined);
    } else if (!isLoadingFavorite && !isFetchingFavorite) {
      productDataRender = [];
    } else {
      productDataRender = productsFavorite?.data || [];
    }
  }

  const isPageLoading = slug === 'favorite'
    ? ((isLoadingFavorite || isFetchingFavorite) && !isErrorFavorite && !productsFavorite)
    : isLoading;

  const pageTitle = slug === 'loc-san-pham'
    ? 'Kết quả lọc sản phẩm'
    : state || 'Sản phẩm';

  const bannerInfo = CATEGORY_BANNERS[state] || DEFAULT_BANNER;
  const productCount = productDataRender?.length || 0;
  const showFilter = slug !== 'search' && slug !== 'favorite';

  const handleSortChange = (value) => {
    const sortMap = {
      newest: { key: 'createdAt', value: -1 },
      priceAsc: { key: 'price', value: 1 },
      priceDesc: { key: 'price', value: -1 },
      sold: { key: 'sold', value: -1 },
      discount: { key: 'discount', value: -1 },
    };
    setSortValue(value);
    setKeyValue(sortMap[value] || sortMap.newest);
    setCurrentPage(1);
  };

  if (slug === 'favorite' && !user?.id) {
    return (
      <div className='type_page_wrapper'>
        <div className='container'>
          <div className='type_product'>
            <div className="category_header_banner category_header_banner--simple">
              <NavigationPathComponent category="Sản phẩm yêu thích" />
              <h1 className="category_title">Sản phẩm yêu thích</h1>
            </div>
            <Empty
              className="type_empty_state"
              description="Vui lòng đăng nhập để xem sản phẩm yêu thích"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button type="primary" className="empty_cta_btn" onClick={() => navigate('/sign-in')}>
                Đăng nhập ngay
              </Button>
            </Empty>
          </div>
        </div>
      </div>
    );
  }

  if (slug === 'favorite' && isErrorFavorite) {
    return (
      <div className='type_page_wrapper'>
        <div className='container'>
          <div className='type_product'>
            <div className="category_header_banner category_header_banner--simple">
              <NavigationPathComponent category="Sản phẩm yêu thích" />
              <h1 className="category_title">Sản phẩm yêu thích</h1>
            </div>
            <Empty
              className="type_empty_state"
              description={errorFavorite?.message || 'Có lỗi xảy ra khi tải danh sách yêu thích'}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <LoadingComponent isPending={isPageLoading}>
      <div className='type_page_wrapper'>
        <div className='container'>
          <div className='type_product'>
            <div
              className="category_header_banner"
              style={{ backgroundImage: `url(${bannerInfo.image})` }}
            >
              <div className="category_header_overlay" />
              <div className="category_header_content">
                <NavigationPathComponent category={state} />
                <span className="category_tag">{bannerInfo.tag}</span>
                <h1 className="category_title">{pageTitle}</h1>
                <p className="category_desc">{bannerInfo.desc}</p>
                {!isPageLoading && (
                  <div className="category_stats">
                    <span className="stat_chip">
                      <AppstoreOutlined /> {productCount} sản phẩm
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="type_main_layout">
              <Button
                className="mobile-filter-btn"
                icon={<FilterOutlined />}
                onClick={() => setIsOpenFilter(true)}
              >
                Bộ lọc
              </Button>

              <Drawer
                title="Bộ lọc sản phẩm"
                placement="left"
                onClose={() => setIsOpenFilter(false)}
                open={isOpenFilter}
                width="85%"
                className="filter_drawer"
              >
                <FilterSidebarComponent
                  setCurrentPage={setCurrentPage}
                  onClose={() => setIsOpenFilter(false)}
                />
              </Drawer>

              <Row gutter={[24, 24]}>
                {showFilter && (
                  <Col xs={0} sm={0} md={7} lg={6} xl={6} className='col_navbar'>
                    <div className="filter_sticky_wrap">
                      <FilterSidebarComponent setCurrentPage={setCurrentPage} />
                    </div>
                  </Col>
                )}
                <Col
                  xs={24}
                  sm={24}
                  md={showFilter ? 17 : 24}
                  lg={showFilter ? 18 : 24}
                  xl={showFilter ? 18 : 24}
                >
                  <div className="products_panel">
                    <div className="products_toolbar">
                      <p className="products_count">
                        Hiển thị <strong>{productCount}</strong> sản phẩm
                      </p>
                      {slug !== 'favorite' && (
                        <div className="sort_wrap">
                          <SortAscendingOutlined className="sort_icon" />
                          <Select
                            value={sortValue}
                            className="sort_select"
                            onChange={handleSortChange}
                            options={[
                              { value: 'newest', label: 'Mới nhất' },
                              { value: 'priceAsc', label: 'Giá thấp → cao' },
                              { value: 'priceDesc', label: 'Giá cao → thấp' },
                              { value: 'sold', label: 'Bán chạy' },
                              { value: 'discount', label: 'Giảm giá nhiều' },
                            ]}
                          />
                        </div>
                      )}
                    </div>

                    {productCount === 0 && !isPageLoading ? (
                      <Empty
                        className="type_empty_state"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                          slug === 'search'
                            ? `Không tìm thấy sản phẩm cho "${searchKeyword}"`
                            : 'Không có sản phẩm phù hợp với bộ lọc'
                        }
                      >
                        <Button
                          type="primary"
                          className="empty_cta_btn"
                          onClick={() => navigate('/')}
                        >
                          Về trang chủ
                        </Button>
                      </Empty>
                    ) : (
                      <>
                        <div className="products_grid">
                          {productDataRender?.map(product => (
                            <CardComponent
                              key={product._id}
                              images={product.images}
                              name={product.name}
                              description={product.description}
                              selled={product.selled}
                              slug={product.slug}
                              state={state}
                              product={product}
                            />
                          ))}
                        </div>

                        {productCount > 0 && slug !== 'favorite' && (
                          <div className='pagination-wrapper'>
                            <Pagination
                              total={products?.total}
                              current={currentPage}
                              pageSize={limit}
                              onChange={(page) => setCurrentPage(page)}
                              showSizeChanger={false}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </Col>
              </Row>
            </div>
          </div>

          <ProductListSection
            title="Sản phẩm khác"
            queryKey="saleProducts"
            keySort="discount"
            valueSort={-1}
          />
        </div>
      </div>
    </LoadingComponent>
  )
}

export default TypeProductsPage
