import React, { useState } from 'react'
import { Row, Col } from "antd";
import SliderComponent from '../SliderComponent/SliderComponent';
import ButtonComponent from '../ButtonComponent/ButtonComponent';
import { HeartOutlined } from '@ant-design/icons';
import { Fomater } from '../../utils/fomater';
import "./ProductDetailsCompoent.scss"
import * as ProductService from "../../services/Product.Services"
import { useQuery } from '@tanstack/react-query';
import LoadingComponent from "../../components/LoadingComponent/LoadingComponent"
import { useSelector } from 'react-redux';
import ProductTabsComponent from './ProductTabsComponent/ProductTabsComponent';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import *as CartService from '../../services/Cart.Service'
import { useMutationHook } from "../../hooks/useMutationHook"
import { useDispatch } from 'react-redux';
import { addToCart } from '../../redux/slices/CartSlice';
import CartDrawerComponent from '../CartDrawerComponent/CartDrawerComponent';
import *as FavoriteService from "../../services/Favorite.Service"
import { toggleFavorite } from "../../redux/slices/FavoriteSlice"
import { alertError } from "../../utils/alert"
import getDiscountPrice from '../../utils/getDiscountPrice';
import { getProductStock } from '../../utils/getProductStock';
import ProductListSection from '../ProductListSection/ProductListSection';
import { getFruitImage } from '../../utils/getFruitImage';

const ProductDetailsCompoent = ({ slug }) => {
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const user = useSelector(state => state.user);
  const productFavorites = useSelector(state => state.favorite);
  const cart = useSelector(state => state.cart)
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const fetchGetDetailProduct = async (slug) => {
    const res = await ProductService.getDetailProduct(slug)
    return res.data;
  }

  const { isLoading, data: product } = useQuery({
    queryKey: ['product-detail', slug],
    queryFn: () => fetchGetDetailProduct(slug),
    enabled: !!slug
  });

  const mutationAddCart = useMutationHook(async ({ id, access_token, data }) => {
    return await CartService.create(id, access_token, data);
  })

  const handlAddCart = (type = '') => {
    if (!user.access_token) {
      navigate('/sign-in', { state: location.pathname })
      return;
    }

    if (product?.isActive === false) {
      alertError('Sản phẩm này đã dừng hoạt động và không thể mua');
      return;
    }

    const stockKg = getProductStock(product);
    const productCart = cart?.items?.find((item) => item.product._id === product._id);
    const cartQty = productCart?.quantity || 0;

    if (stockKg === 0 || cartQty + quantity > stockKg) {
      alertError(`Chỉ còn ${stockKg} kg trong kho`);
      return;
    }

    const price = getDiscountPrice(product.price, product.discount || 0);

    const data = {
      userId: user.id,
      productId: product._id,
      price: product.price,
      quantity: Number(quantity),
    }
    mutationAddCart.mutate({ id: user?.id, access_token: user.access_token, data });

    dispatch(addToCart({
      product: product,
      quantity: Number(quantity),
      price: price,
    }));

    if (type === 'navigate_cart') {
      navigate('/cart')
    } else {
      setIsOpenDrawer(true);
    }
  }

  const handleFavorite = async () => {
    if (!user.access_token) {
      navigate('/sign-in', { state: location.pathname })
      return
    }
    const data = {
      userId: user?.id,
      productId: product._id
    }

    await FavoriteService.toggle(data, user?.access_token);
    dispatch(toggleFavorite(product._id))
  }

  const checkFavorite = productFavorites?.productIds?.length > 0 &&
    productFavorites?.productIds.includes(product?._id);

  const displayPrice = product
    ? getDiscountPrice(product.price, product.discount || 0)
    : 0;

  const productImages = product?.images?.length > 0
    ? product.images.map(img => getFruitImage(product.name, img))
    : (product?.image ? [getFruitImage(product.name, product.image)] : []);

  return (
    <LoadingComponent isPending={isLoading}>
      <Row gutter={[48, 24]}>
        <CartDrawerComponent open={isOpenDrawer} onClose={() => setIsOpenDrawer(false)} />
        <Col span={24} md={9} className="product-image-col">
          <SliderComponent arrImages={productImages} autoplay={false} />
        </Col>
        <Col span={24} md={15}>
          <div className='content_productDetail'>
            <h1 className='title_productDetail'>{product?.name}</h1>

            <div className='product-info-row'>
              <span className="price_new">
                {product ? (
                  product?.discount > 0 ? (
                    <>
                      <span className="new_price">{Fomater(displayPrice)} <span className='unit'>/ kg</span></span>
                      <span className="old_price">{Fomater(product.price)} / kg</span>
                    </>
                  ) : (
                    <span className="normal_price">{Fomater(product.price)} <span className='unit'>/ kg</span></span>
                  )
                ) : null}
              </span>
              <span className="stock_badge">Còn {getProductStock(product)} kg</span>
            </div>

            <div className='quantity'>
              <div>Số lượng (kg)</div>
              <div className="quantity_selector_wrapper">
                <input type="button" value="-" className="minus" onClick={() => setQuantity((q) => Math.max(1, Number(q) - 1))} />
                <input
                  type="number"
                  className="quantity_text"
                  name="quantity"
                  value={quantity}
                  min="1"
                  step="1"
                  inputMode="numeric"
                  onChange={(e) => setQuantity(e.target.value)}
                  onBlur={() => {
                    const v = parseInt(quantity, 10);
                    setQuantity(Number.isFinite(v) && v >= 1 ? v : 1);
                  }}
                />
                <input type="button" value="+" className="plus" onClick={() => setQuantity((q) => Number(q) + 1)} />
                <span className="unit_label">kg</span>
              </div>
            </div>
            <div className='btn-shopping'>
              {product?.isActive === false ? (
                <div style={{
                  padding: '12px',
                  background: '#fff3cd',
                  border: '1px solid #ffc107',
                  borderRadius: '4px',
                  textAlign: 'center',
                  color: '#856404',
                  width: '100%'
                }}>
                  Sản phẩm này đã dừng hoạt động
                </div>
              ) : (
                <>
                  <ButtonComponent
                    className="btn-add-cart"
                    onClick={handlAddCart}
                    textButton={'Thêm vào giỏ hàng'}
                  />

                  <ButtonComponent
                    className="btn-buy-now"
                    onClick={() => handlAddCart('navigate_cart')}
                    textButton={'Mua ngay'}
                  />
                </>
              )}
            </div>
            <div className={checkFavorite ? 'btn-icon active' : 'btn-icon'} >
              <ButtonComponent
                className="btn-fav"
                textButton={'Yêu thích'}
                icon={<HeartOutlined />}
                onClick={handleFavorite}
              />
            </div>
          </div>
        </Col>
      </Row>
      {product && <ProductTabsComponent product={product} />}

      <ProductListSection
        title="Sản phẩm đang trong thời gian khuyến mãi"
        queryKey="saleProducts"
        keySort="discount"
        valueSort={-1}
      />

      <ProductListSection
        title="Sản phẩm mới nhất"
        queryKey="newProducts"
        keySort="createdAt"
        valueSort={-1}
      />

    </LoadingComponent>
  );
};

export default ProductDetailsCompoent;
