import React, { useEffect } from 'react';
import Slider from "react-slick";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  CarOutlined, 
  SafetyCertificateOutlined, 
  CustomerServiceOutlined, 
  ArrowRightOutlined,
  StarFilled,
  MailOutlined
} from '@ant-design/icons';
import * as ProductService from "../../services/Product.Services";
import CardComponent from "../../components/CardComponent/CardComponent";
import * as WebSiteInfoService from "../../services/websiteInfo.Service";
import "./style.scss";
import { useDispatch } from "react-redux";
import { setInfo } from "../../redux/slices/WebSiteInfo";

const HomePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const websiteInfo = useSelector(state => state.websiteInfo);

  // Đảm bảo banner/logo được cập nhật ngay sau khi admin lưu
  const { data: websiteInfoRes } = useQuery({
    queryKey: ["websiteInfo"],
    queryFn: () => WebSiteInfoService.getInfo(),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (websiteInfoRes?.data) dispatch(setInfo(websiteInfoRes.data));
  }, [websiteInfoRes, dispatch]);

  // Fetch products once, then derive sections on FE side
  // (tránh trường hợp backend không hỗ trợ params isFeatured/hasDiscount -> trả rỗng)
  const { data: dbProductsAll } = useQuery({
    queryKey: ["homeProductsAll"],
    queryFn: () => ProductService.getAllProduct({ limit: 24 }),
  });

  const allProducts = dbProductsAll?.data || [];
  const featuredProducts = allProducts.filter((p) => p?.isFeatured === true);
  const saleProducts = allProducts.filter((p) => Number(p?.discount || 0) > 0);

  const displayProducts = (featuredProducts.length > 0 ? featuredProducts : allProducts).slice(0, 8);
  const discountProducts = saleProducts.slice(0, 8);



  // Settings for Testimonial Slider
  const testimonialSettings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    responsive: [
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
        }
      }
    ]
  };

  const bannerSettings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    fade: true,
    arrows: false
  };

  const handleCategoryNavigate = (catName) => {
    navigate(`/type/${catName === 'Trái cây nội địa' ? 'trai-cay-noi-dia' : 'trai-cay-nhap-khau'}`, { state: catName });
  };

  return (
    <>
      {/* Hero Banner Slider */}
      <div className="hero_banner_container">
        {websiteInfo?.banner && websiteInfo.banner.length > 0 ? (
          <Slider {...bannerSettings} className="hero_banner_slider hero_banner_slider--imageOnly">
            {websiteInfo.banner.map((imgUrl, index) => (
              <div key={index} className="hero_banner_image_slide">
                <img className="hero_banner_img" src={imgUrl} alt={`banner-${index + 1}`} />
              </div>
            ))}
          </Slider>
        ) : (
          <div className="hero_slide" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1610832958506-ee56336191d8?auto=format&fit=crop&q=80&w=1600')` }}>
            <div className="hero_content">
              <span className="hero_tag">100% Tươi sạch & An toàn</span>
              <h1>Trái cây tươi ngon <span>mỗi ngày</span></h1>
              <p>Cam kết cung cấp các loại trái cây nội địa và nhập khẩu đạt tiêu chuẩn chất lượng cao nhất, tươi sạch đến tay người tiêu dùng.</p>
              <div className="hero_buttons">
                <button className="btn_primary" onClick={() => navigate('/type/trai-cay-nhap-khau', { state: 'Trái cây nhập khẩu' })}>Mua ngay</button>
                <button className="btn_outline" onClick={() => navigate('/type/khuyen-mai', { state: 'Khuyến mãi' })}>Xem ưu đãi</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="container home_page">




        {/* Best Sellers Section */}
        <div className="product_list_section">
          <h1 className="title">Sản phẩm nổi bật</h1>
          <div className="card">
            {displayProducts.length > 0 ? (
              displayProducts.map((product) => (
                <CardComponent key={product._id} product={product} {...product} />
              ))
            ) : (
              <div style={{ padding: 16, color: '#64748b' }}>Chưa có sản phẩm để hiển thị.</div>
            )}
          </div>
        </div>

        {/* Hot Promotions Section */}
        {discountProducts.length > 0 && (
          <div className="product_list_section">
            <h1 className="title">Ưu đãi Khuyến mãi sốc</h1>
            <div className="card">
              {discountProducts.map((product) => (
                <CardComponent key={product._id} product={product} {...product} />
              ))}
            </div>
          </div>
        )}

        {/* Customer Feedbacks */}
        <div className="testimonials_section">
          <div className="section_header">
            <h2>Khách hàng nói gì về <span>chúng tôi</span></h2>
            <p>Sự hài lòng về độ tươi ngon và dịch vụ là tôn chỉ hoạt động hàng đầu của cửa hàng.</p>
          </div>
          <Slider {...testimonialSettings} className="testimonials_slider">
            <div className="testimonial_card">
              <div className="testimonial_inner">
                <div className="stars">
                  <StarFilled /><StarFilled /><StarFilled /><StarFilled /><StarFilled />
                </div>
                <p className="comment">"Trái cây ở đây cực kỳ tươi ngon, mình mua giỏ quà biếu đối tác ai cũng khen. Đặc biệt nho xanh Autumn Crisp giòn lịm ngọt ngào ăn đã miệng lắm luôn!"</p>
                <div className="user_info">
                  <img className="avatar" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100" alt="Avatar 1" />
                  <div className="meta">
                    <h4>Nguyễn Thuỳ Lâm</h4>
                    <p>Khách hàng thân thiết</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="testimonial_card">
              <div className="testimonial_inner">
                <div className="stars">
                  <StarFilled /><StarFilled /><StarFilled /><StarFilled /><StarFilled />
                </div>
                <p className="comment">"Ship hàng siêu tốc độ, mình đặt giao nội thành Hà Nội chỉ tầm hơn 1 tiếng là shipper giao đến giỏ dâu tây Hàn đỏ mọng nguyên cuống rất tươi, cực kỳ ưng ý."</p>
                <div className="user_info">
                  <img className="avatar" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100" alt="Avatar 2" />
                  <div className="meta">
                    <h4>Trần Minh Hoàng</h4>
                    <p>Khách hàng VIP</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="testimonial_card">
              <div className="testimonial_inner">
                <div className="stars">
                  <StarFilled /><StarFilled /><StarFilled /><StarFilled /><StarFilled />
                </div>
                <p className="comment">"Táo Envy Mỹ giòn đanh, ngọt lịm. Bé nhà mình chỉ thích ăn táo mua ở đây vì tươi sạch chất lượng. Dịch vụ đóng gói giỏ quà chu đáo nhiệt tình."</p>
                <div className="user_info">
                  <img className="avatar" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100" alt="Avatar 3" />
                  <div className="meta">
                    <h4>Phan Mỹ Linh</h4>
                    <p>Khách hàng</p>
                  </div>
                </div>
              </div>
            </div>
          </Slider>
        </div>

        {/* Core Benefits Section */}
        <div className="benefits_section">
          <div className="benefit_card">
            <div className="benefit_icon_wrapper">
              <CarOutlined />
            </div>
            <div className="benefit_info">
              <h3>Giao hàng siêu tốc</h3>
              <p>Miễn phí giao hàng hỏa tốc trong vòng 2h cho mọi đơn hàng giá trị từ 500k.</p>
            </div>
          </div>
          <div className="benefit_card">
            <div className="benefit_icon_wrapper">
              <SafetyCertificateOutlined />
            </div>
            <div className="benefit_info">
              <h3>An toàn hữu cơ 100%</h3>
              <p>Trái cây được kiểm định khắt khe đạt chuẩn vệ sinh an toàn thực phẩm VietGAP / GlobalGAP.</p>
            </div>
          </div>
          <div className="benefit_card">
            <div className="benefit_icon_wrapper">
              <CustomerServiceOutlined />
            </div>
            <div className="benefit_info">
              <h3>Chăm sóc tận tâm 24/7</h3>
              <p>Đội ngũ tư vấn viên nhiệt tình hỗ trợ gói quà tặng sang trọng, đổi trả 100% nếu dập nát.</p>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="newsletter_section">
          <div className="newsletter_left">
            <h2>Nhận ưu đãi <span>10% ngay hôm nay!</span></h2>
            <p>Đăng ký nhận bản tin khuyến mãi từ chúng tôi để không bỏ lỡ đợt trái cây tươi sạch nhập khẩu mới nhất kèm mã ưu đãi độc quyền.</p>
          </div>
          <div className="newsletter_right">
            <form onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Nhập địa chỉ email của bạn..." required />
              <button type="submit">Đăng ký <MailOutlined style={{ marginLeft: 5 }} /></button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;