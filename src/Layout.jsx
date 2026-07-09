import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
// 🌟 นำเข้า Users เพิ่มเติมสำหรับเมนูทีมงาน
import { Gamepad, ShoppingCart, Bell, Home, Briefcase, TrendingUp, MessageCircle, Users } from 'lucide-react';
// 🌟 นำเข้า CSS ใหม่ที่เพิ่งสร้าง
import './layout.css'; 

export default function Layout({ userProfile }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 🌟 อัปเดต: เพิ่มเมนู Team เข้าไปแล้ว
  const navItems = [
    { path: '/dashboard', icon: <Home size={22} />, label: 'Home' },
    { path: '/assets', icon: <Briefcase size={22} />, label: 'Assets' },
    { path: '/market', icon: <TrendingUp size={22} />, label: 'Market' },
    { path: '/team', icon: <Users size={22} />, label: 'Team' },
    { path: '/chat', icon: <MessageCircle size={22} />, label: 'Chat' },
  ];

  return (
    <div className="frontend-layout-container">
      
      {/* 🌟 1. Sidebar (แสดงเฉพาะบน Desktop) */}
      {!isMobile && (
        <div className="desktop-sidebar" style={{ width: '250px', background: '#12161F', borderRight: '1px solid rgba(50, 100, 255, 0.2)' }}>
          <div className="sidebar-brand" style={{ padding: '20px', fontSize: '1.5rem', fontWeight: 'bold' }}>9 Plus</div>
          
          <div className="sidebar-menu" style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '0 15px' }}>
            {navItems.map(item => (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', 
                  color: location.pathname === item.path ? '#3B82F6' : '#6C7280',
                  textDecoration: 'none', borderRadius: '8px',
                  background: location.pathname === item.path ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
                }}
              >
                {item.icon} <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="sidebar-profile" onClick={() => navigate('/profile')} style={{ marginTop: 'auto', padding: '20px', display: 'flex', gap: '10px', cursor: 'pointer', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <img 
              src={userProfile?.image || 'https://via.placeholder.com/40'} 
              alt="Profile" 
              style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div className="sidebar-profile-info">
              <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold' }}>{userProfile?.name || 'ยังไม่ได้ระบุชื่อ'}</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#A0A0B0' }}>{userProfile?.phone || 'ยังไม่ได้ระบุเบอร์โทร'}</p>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 2. พื้นที่เนื้อหาหลัก */}
      <div className="main-content-wrapper">
        
        {/* Top Navbar */}
        <div className="top-navbar">
          <div className="brand-title">{isMobile ? '9 Plus' : ''}</div>
          
          <div className="nav-actions">
          
            {/* 🌟 ปรับปรุง: เกมสอยดาว (เพิ่มคลาส game-icon-glow และปรับ size=32 ให้เด่นสุดๆ) */}
            <Gamepad 
              size={32}
              className="nav-icon game-icon-glow" 
              onClick={() => navigate('/game')} 
            />

            <ShoppingCart size={24} className="nav-icon" onClick={() => navigate('/cart')} />
            <Bell size={24} className="nav-icon" onClick={() => navigate('/notifications')} />
            
            {/* โชว์รูปโปรไฟล์ด้านบน "เฉพาะในมือถือ" เท่านั้น */}
            {isMobile && (
              <img 
                src={userProfile?.image || 'https://via.placeholder.com/35'} 
                alt="Profile" 
                style={{ width: '35px', height: '35px', borderRadius: '50%', cursor: 'pointer', objectFit: 'cover', border: '2px solid #3B82F6' }}
                onClick={() => navigate('/profile')}
              />
            )}
          </div>
        </div>

        {/* รูตรงกลางสำหรับเสียบเนื้อหาหน้าต่างๆ */}
        <div className="page-content">
          <Outlet /> 
        </div>

        {/* 🌟 3. Bottom Navbar (แสดงเฉพาะมือถือ) */}
        {isMobile && (
          <div className="bottom-navbar">
            {navItems.map(item => (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`bottom-nav-item ${location.pathname === item.path ? 'active' : ''}`}
              >
                {item.icon} <span>{item.label}</span>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}