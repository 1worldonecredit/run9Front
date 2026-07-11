import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Download, Upload, Wallet, Star, Heart } from 'lucide-react';

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

  // 📦 ข้อมูลจำลองสำหรับ "ร้านค้ายอดนิยม" (เลื่อนซ้าย-ขวา)
  const popularShops = [
    { id: 1, name: 'The Burger House', type: 'American, Fast Food', rating: 4.8, time: '30-40 min', img: 'https://images.unsplash.com/photo-1550547660-d9450f859349?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60' },
    { id: 2, name: 'Pizza Mania', type: 'Italian, Pizza', rating: 4.6, time: '25-35 min', img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60' },
    { id: 3, name: 'Sushi Master', type: 'Japanese, Sushi', rating: 4.9, time: '40-50 min', img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60' },
  ];

  // 📦 ข้อมูลจำลองสำหรับ "สินค้าแนะนำ" (Grid 2 คอลัมน์)
  const recommendedProducts = [
    { id: 1, name: 'Classic Royale', desc: 'Burger with cheese', price: '159 ฿', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=60' },
    { id: 2, name: 'Spicy Inferno', desc: 'Loaded with jalapeños', price: '189 ฿', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=60' },
    { id: 3, name: 'Crispy Fries', desc: 'Golden crunch fries', price: '69 ฿', img: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=60' },
    { id: 4, name: 'Chicken Paneer', desc: 'Smoky grilled chicken', price: '120 ฿', img: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=60' },
  ];

  return (
    <div className="dashboard-container">
      
      {/* 🌟 ส่วนค้นหาและพิกัด */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <div style={{ background: '#1C1F26', padding: '10px', borderRadius: '50%', display: 'flex' }}>
          <MapPin size={20} color="#FF8A00" />
        </div>
        <div>
          <p style={{ margin: 0, fontSize: '0.7rem', color: '#94A3B8' }}>ตำแหน่งปัจจุบัน</p>
          <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#fff' }}>Indiranagar 1st Stage</h4>
        </div>
      </div>

      {/* 🌟 Hero Banner */}
      <div className="dash-hero-banner">
        <div style={{ zIndex: 1 }}>
          <h2 style={{ margin: '0 0 5px 0', fontSize: '1.4rem', fontWeight: 'bold' }}>Special Offer<br/>For March</h2>
          <p style={{ margin: '0 0 15px 0', fontSize: '0.75rem', opacity: 0.9 }}>ลดสูงสุด 50% สำหรับสมาชิก 9 Plus</p>
          <button style={{ background: '#fff', color: '#FF8A00', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            สั่งเลยตอนนี้
          </button>
        </div>
        <img 
          src="https://images.unsplash.com/photo-1550547660-d9450f859349?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" 
          alt="Burger" 
          style={{ position: 'absolute', right: '-30px', top: '10px', width: '160px', height: '160px', objectFit: 'cover', borderRadius: '50%', boxShadow: '-5px 5px 15px rgba(0,0,0,0.3)' }}
        />
      </div>

      {/* 🌟 Quick Actions (ไอคอนเมนูลัด) */}
      <div className="dash-quick-actions">
        <div className="dash-action-btn" onClick={() => navigate('/topup')}>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '12px', borderRadius: '12px' }}>
            <Download size={24} color="#3B82F6" />
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#E2E8F0' }}>เติมเงิน</span>
        </div>
        
        <div className="dash-action-btn" onClick={() => navigate('/withdraw')}>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '12px' }}>
            <Upload size={24} color="#EF4444" />
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#E2E8F0' }}>ถอนเงิน</span>
        </div>

        <div className="dash-action-btn" onClick={() => navigate('/assets')}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '12px' }}>
            <Wallet size={24} color="#10B981" />
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#E2E8F0' }}>กระเป๋า</span>
        </div>
      </div>

      {/* 🌟 ร้านค้ายอดนิยม (Horizontal Scroll) */}
      <div className="dash-section-header">
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>ร้านค้ายอดนิยม</h3>
        <span style={{ fontSize: '0.75rem', color: '#FF8A00', cursor: 'pointer', fontWeight: 'bold' }}>ดูทั้งหมด</span>
      </div>
      
      <div className="shop-horizontal-list">
        {popularShops.map(shop => (
          <div key={shop.id} className="shop-card">
            <img src={shop.img} alt={shop.name} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
            <div style={{ padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#fff' }}>{shop.name}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,138,0,0.1)', padding: '2px 6px', borderRadius: '6px' }}>
                  <Star size={12} color="#FF8A00" fill="#FF8A00" />
                  <span style={{ fontSize: '0.7rem', color: '#FF8A00', fontWeight: 'bold' }}>{shop.rating}</span>
                </div>
              </div>
              <p style={{ margin: '0 0 8px 0', fontSize: '0.7rem', color: '#94A3B8' }}>{shop.type}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.7rem', color: '#64748B' }}>
                <span>⏱ {shop.time}</span>
                <span>🛵 ค่าส่ง 10฿</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 🌟 สินค้าแนะนำ (Grid 2 แถว) */}
      <div className="dash-section-header" style={{ marginTop: '10px' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>แนะนำสำหรับคุณ</h3>
        <span style={{ fontSize: '0.75rem', color: '#FF8A00', cursor: 'pointer', fontWeight: 'bold' }}>ดูทั้งหมด</span>
      </div>

      <div className="product-grid">
        {recommendedProducts.map(product => (
          <div key={product.id} className="product-card">
            <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', padding: '6px', borderRadius: '50%', zIndex: 2, cursor: 'pointer' }}>
              <Heart size={16} color="#fff" />
            </div>
            <img 
              src={product.img} 
              alt={product.name} 
              style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '10px', marginBottom: '10px' }} 
            />
            <h4 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: '#fff' }}>{product.name}</h4>
            <p style={{ margin: '0 0 8px 0', fontSize: '0.65rem', color: '#94A3B8', lineHeight: '1.4' }}>{product.desc}</p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '10px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#FF8A00' }}>{product.price}</span>
            </div>
            <button className="btn-add-cart" style={{ marginTop: '10px' }}>
              Add To Cart
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}