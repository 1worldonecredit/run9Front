import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { Gamepad, ShoppingCart, Bell, Home, Briefcase, TrendingUp, MessageCircle } from 'lucide-react';

export default function Layout({ userProfile }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { path: '/dashboard', icon: <Home size={24} />, label: 'Home' },
    { path: '/assets', icon: <Briefcase size={24} />, label: 'Assets' },
    { path: '/market', icon: <TrendingUp size={24} />, label: 'Market' },
    { path: '/chat', icon: <MessageCircle size={24} />, label: 'Chat' },
  ];

  return (
    <div className="frontend-layout-container">
      
      {/* 🌟 1. Sidebar (แสดงเฉพาะบน Desktop) */}
      {!isMobile && (
        <div className="desktop-sidebar">
          <div className="sidebar-brand">9 Plus</div>
          
          {/* พื้นที่เมนู (จะดันให้ตัวเองยืดสุด เพื่อผลัก Profile ลงไปข้างล่าง) */}
          <div className="sidebar-menu">
            {navItems.map(item => (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
              >
                {item.icon} <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* 🌟 พื้นที่ Profile ด้านล่างสุดของ Sidebar */}
          <div className="sidebar-profile" onClick={() => navigate('/profile')}>
            <img 
              src={userProfile?.image || 'https://via.placeholder.com/40'} 
              alt="Profile" 
              className="sidebar-profile-img"
            />
            <div className="sidebar-profile-info">
              <p className="sidebar-profile-name">{userProfile?.name || 'ยังไม่ได้ระบุชื่อ'}</p>
              <p className="sidebar-profile-sub">{userProfile?.phone || 'ยังไม่ได้ระบุเบอร์โทร'}</p>
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
          
            {/* 🌟 NEW: เพิ่มปุ่มจอยเกมเข้าสู่ 9 PLUS SLOTS ให้โดดเด่นสะดุดตา */}
            <Gamepad 
              className="nav-icon" 
              color="#FFD700" 
              style={{ 
                cursor: 'pointer', 
                filter: 'drop-shadow(0 0 5px rgba(255,215,0,0.5))',
                marginRight: '5px'
              }} 
              onClick={() => navigate('/game')} 
            />

            <ShoppingCart className="nav-icon" onClick={() => navigate('/cart')} />
            <Bell className="nav-icon" onClick={() => navigate('/notifications')} />
            
            {/* 🌟 อัปเดต: โชว์รูปโปรไฟล์ด้านบน "เฉพาะในมือถือ" เท่านั้น */}
            {isMobile && (
              <img 
                src={userProfile?.image || 'https://via.placeholder.com/35'} 
                alt="Profile" 
                style={{ width: '35px', height: '35px', borderRadius: '50%', cursor: 'pointer', objectFit: 'cover', border: '2px solid var(--earth-primary)' }}
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