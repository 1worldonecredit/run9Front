import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, MapPin, Download, Upload, Wallet, Star, Heart, 
  CheckCircle2, Package, ShoppingBag, Store, Info, SlidersHorizontal, 
  Globe, TrendingUp, ShieldCheck
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('ผู้ใช้งาน');

  useEffect(() => {
    const savedProfileStr = localStorage.getItem('userProfile');
    if (savedProfileStr) {
      try {
        const parsed = JSON.parse(savedProfileStr);
        setUsername(parsed.username);
      } catch (e) {}
    }
  }, []);

  // 📦 ข้อมูลจำลองสำหรับ "ร้านค้ายอดนิยม"
  const popularShops = [
    { 
      id: 1, 
      name: 'Gadget Maste', 
      type: 'อุปกรณ์ไอที, อิเล็กทรอนิกส์', 
      rating: 4.8, 
      verified: true,
      productCount: 1250,
      location: 'กรุงเทพมหานคร',
      coverImg: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      profileImg: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
    },
    { 
      id: 2, 
      name: 'Sneaker Head', 
      type: 'รองเท้า, แฟชั่นผู้ชาย', 
      rating: 4.9, 
      verified: true,
      productCount: 340,
      location: 'เชียงใหม่',
      coverImg: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      profileImg: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
    },
    { 
      id: 3, 
      name: 'Organic Life', 
      type: 'อาหารเสริม, สุขภาพ', 
      rating: 4.6, 
      verified: false,
      productCount: 85,
      location: 'ขอนแก่น',
      coverImg: 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      profileImg: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
    },
  ];

  // 📦 ข้อมูลจำลองสำหรับ "สินค้าแนะนำ"
  const recommendedProducts = [
    { 
      id: 1, 
      name: 'Mechanical Keyboard Pro K8', 
      shopName: 'Gadget Master', 
      origin: 'China',
      sold: '1.2k',
      stock: 45,
      price: '2,590 ฿', 
      img: 'https://images.unsplash.com/photo-1595225476474-87563907a212?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' 
    },
    { 
      id: 2, 
      name: 'Nike Air Force 1 Premium', 
      shopName: 'Sneaker Head', 
      origin: 'Vietnam',
      sold: '850',
      stock: 12,
      price: '3,500 ฿', 
      img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' 
    },
    { 
      id: 3, 
      name: 'Whey Protein Isolate 5lbs', 
      shopName: 'Organic Life', 
      origin: 'USA',
      sold: '3k',
      stock: 0,
      price: '1,890 ฿', 
      img: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' 
    },
    { 
      id: 4, 
      name: 'Sony WH-1000XM5', 
      shopName: 'Gadget Master', 
      origin: 'Japan',
      sold: '420',
      stock: 5,
      price: '12,990 ฿', 
      img: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' 
    },
  ];

  return (
    <div className="dashboard-container">
      
      {/* 🌟 1. ส่วนหัว: พิกัด และ แถบค้นหา */}
      <div className="dash-header-top">
        <div className="dash-location">
          <div className="location-icon">
            <MapPin size={18} color="#FF8A00" />
          </div>
          <div>
            <p className="location-label">ตำแหน่งปัจจุบัน</p>
            <h4 className="location-text">Indiranagar 1st Stage</h4>
          </div>
        </div>

        <div className="dash-search-wrapper">
          <div className="dash-search-box">
            <Search size={18} color="#94A3B8" />
            <input type="text" placeholder="ค้นหาสินค้า, ร้านค้า, หรือแบรนด์..." className="dash-search-input" />
          </div>
          <button className="dash-filter-btn">
            <SlidersHorizontal size={18} color="#fff" />
          </button>
        </div>
      </div>

      {/* 🌟 2. Hero Banner */}
      <div className="dash-hero-banner">
        <div style={{ zIndex: 1 }}>
          <h2 className="hero-title">Special Offer<br/>For March</h2>
          <p className="hero-subtitle">ลดสูงสุด 50% สำหรับสมาชิก 9 Plus</p>
          <button className="hero-btn">สั่งเลยตอนนี้</button>
        </div>
      </div>

      {/* 🌟 3. Quick Actions (เมนูลัด - เล็กลง มีมิติ) */}
      <div className="dash-quick-actions">
        <div className="dash-action-btn" onClick={() => navigate('/topup')}>
          <div className="action-icon-wrapper topup-glow">
            <Download size={20} color="#3B82F6" />
          </div>
          <span className="action-text">เติมเงิน</span>
        </div>
        
        <div className="dash-action-btn" onClick={() => navigate('/withdraw')}>
          <div className="action-icon-wrapper withdraw-glow">
            <Upload size={20} color="#EF4444" />
          </div>
          <span className="action-text">ถอนเงิน</span>
        </div>

        <div className="dash-action-btn" onClick={() => navigate('/assets')}>
          <div className="action-icon-wrapper wallet-glow">
            <Wallet size={20} color="#10B981" />
          </div>
          <span className="action-text">กระเป๋า</span>
        </div>
      </div>

      {/* 🌟 4. ร้านค้ายอดนิยม */}
      <div className="dash-section-header">
        <h3 className="section-title">ร้านค้ายอดนิยม</h3>
        <span className="see-all-btn">ดูทั้งหมด</span>
      </div>
      
      <div className="shop-horizontal-list">
        {popularShops.map(shop => (
          <div key={shop.id} className="shop-card">
            {/* รูปร้านและรูปโปรไฟล์ */}
            <div className="shop-image-container">
              <img src={shop.coverImg} alt="Cover" className="shop-cover" />
              <div className="shop-profile-wrapper">
                <img src={shop.profileImg} alt={shop.name} className="shop-profile" />
                {shop.verified && (
                  <div className="verified-badge" title="ร้านค้าผ่านการตรวจสอบ">
                    <ShieldCheck size={14} color="#fff" />
                  </div>
                )}
              </div>
            </div>

            {/* ข้อมูลร้าน */}
            <div className="shop-info">
              <div className="shop-info-top">
                <h4 className="shop-name">{shop.name}</h4>
                <div className="shop-rating">
                  <Star size={12} color="#FACC15" fill="#FACC15" />
                  <span>{shop.rating}</span>
                </div>
              </div>
              
              <p className="shop-type"><Store size={12} color="#94A3B8"/> {shop.type}</p>
              
              <div className="shop-stats">
                <span className="stat-badge bg-blue"><ShoppingBag size={10} /> สินค้า {shop.productCount} รายการ</span>
                <span className="stat-badge bg-orange"><MapPin size={10} /> {shop.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 🌟 5. สินค้าแนะนำ */}
      <div className="dash-section-header" style={{ marginTop: '25px' }}>
        <h3 className="section-title">สินค้าแนะนำสำหรับคุณ</h3>
        <span className="see-all-btn">ดูทั้งหมด</span>
      </div>

      <div className="product-grid">
        {recommendedProducts.map(product => (
          <div key={product.id} className="product-card">
            <div className="wishlist-btn">
              <Heart size={16} color="#94A3B8" />
            </div>
            
            <img src={product.img} alt={product.name} className="product-img" />
            
            <div className="product-content">
              <div className="product-shop-name"><Store size={10}/> {product.shopName}</div>
              <h4 className="product-name">{product.name}</h4>
              
              <div className="product-meta">
                <span className="meta-item text-blue"><Globe size={12}/> นำเข้าจาก: {product.origin}</span>
                <div className="meta-row">
                  <span className="meta-item text-green"><TrendingUp size={12}/> ขายแล้ว {product.sold}</span>
                  <span className={`meta-item ${product.stock > 0 ? 'text-orange' : 'text-red'}`}>
                    <Package size={12}/> {product.stock > 0 ? `เหลือ ${product.stock} ชิ้น` : 'สินค้าหมด'}
                  </span>
                </div>
              </div>
              
              <div className="product-bottom">
                <span className="product-price">{product.price}</span>
              </div>

              <button className="btn-details">
                <Info size={16} /> ดูรายละเอียด
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}