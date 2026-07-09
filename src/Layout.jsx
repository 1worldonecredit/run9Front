import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { Gamepad, ShoppingCart, Bell, Home, Briefcase, TrendingUp, MessageCircle, Users, Menu, X, LogOut } from 'lucide-react';
import './layout.css'; 

export default function Layout({ userProfile }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 🌟 State ใหม่สำหรับเก็บข้อมูลโปรไฟล์ที่ดึงมาจาก API โดยตรง
  const [localProfile, setLocalProfile] = useState(null);
  const username = localStorage.getItem('username');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // 🌟 ดึงข้อมูลโปรไฟล์ล่าสุดแบบ Real-time เพื่อให้รูปและชื่ออัปเดตตรงกับหน้า Profile
  useEffect(() => {
    if (username && username !== 'undefined') {
      fetch(`https://api.run9.app/api/user/profile-stats?username=${username}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.profile) {
            setLocalProfile(data.profile); // เก็บข้อมูลลง State
          }
        })
        .catch(err => console.error("Error fetching profile for layout:", err));
    }
  }, [username]);

  const handleLogout = () => {
    if(window.confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
      localStorage.removeItem('username');
      localStorage.removeItem('user');
      window.location.href = '/prelogin'; 
    }
  };

  const navItems = [
    { path: '/dashboard', icon: <Home size={22} color="#3B82F6" />, label: 'Home' },
    { path: '/assets', icon: <Briefcase size={22} color="#10B981" />, label: 'Assets' },
    { path: '/market', icon: <TrendingUp size={22} color="#F59E0B" />, label: 'Market' },
    { path: '/team', icon: <Users size={22} color="#8B5CF6" />, label: 'Team' },
    { path: '/chat', icon: <MessageCircle size={22} color="#EC4899" />, label: 'Chat' },
  ];

  // 🌟 เตรียมตัวแปรสำหรับแสดงข้อมูล (เอาจาก API ก่อน ถ้าไม่มีค่อยดึงจาก Props หรือ LocalStorage)
  const displayImage = localProfile?.ProfileImageUrl || userProfile?.image || 'https://via.placeholder.com/40';
  const displayName = localProfile?.FirstName ? `${localProfile.FirstName} ${localProfile.LastName}`.trim() : (userProfile?.name || username || 'ยังไม่ได้ระบุชื่อ');
  const displayPhone = localProfile?.PhoneNumber || userProfile?.phone || 'ยังไม่ได้ระบุเบอร์โทร';

  return (
    <div className="frontend-layout-container">
      
      {isMobile && isMobileMenuOpen && (
        <div className="sidebar-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* 🌟 1. Sidebar */}
      <div className={`sidebar-wrapper ${isMobile ? (isMobileMenuOpen ? 'mobile-open' : 'mobile-closed') : 'desktop-open'}`}>
        
        {isMobile && (
          <button className="close-menu-btn" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        )}

        <div className="sidebar-brand" style={{ padding: '20px', fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>9 Plus</div>
        
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
          
          <div className="sidebar-divider"></div>

          <button className="sidebar-item logout-btn" onClick={handleLogout}>
             <LogOut size={22} color="#EF4444" /> <span>ออกจากระบบ</span>
          </button>
        </div>

        {/* 🌟 ข้อมูล Profile ด้านล่าง Sidebar (ดึงค่าล่าสุดมาโชว์) */}
        <div className="sidebar-profile" onClick={() => navigate('/profile')}>
          <img 
            src={displayImage} 
            alt="Profile" 
            className="sidebar-profile-img"
          />
          <div className="sidebar-profile-info">
            <p className="sidebar-profile-name">{displayName}</p>
            <p className="sidebar-profile-sub">{displayPhone}</p>
          </div>
        </div>
      </div>

      {/* 🌟 2. พื้นที่เนื้อหาหลัก (ฝั่งขวา) */}
      <div className="main-content-wrapper">
        
        {/* Top Navbar */}
        <div className="top-navbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {isMobile && (
              <Menu size={28} color="#A0A0B0" style={{ cursor: 'pointer' }} onClick={() => setIsMobileMenuOpen(true)} />
            )}
            <div className="brand-title">{isMobile ? '9 Plus' : 'Dashboard'}</div>
          </div>
          
          <div className="nav-actions">
            <Gamepad size={32} className="nav-icon game-icon-glow" onClick={() => navigate('/game')} />
            <ShoppingCart size={24} className="nav-icon" onClick={() => navigate('/cart')} />
            <Bell size={24} className="nav-icon" onClick={() => navigate('/notifications')} />
            
            {/* 🌟 โชว์รูปโปรไฟล์ด้านบน (เอาเงื่อนไข isMobile ออก เพื่อให้โชว์ทั้งในคอมและมือถือ) */}
            <img 
              src={displayImage} 
              alt="Profile" 
              style={{ width: '35px', height: '35px', borderRadius: '50%', cursor: 'pointer', objectFit: 'cover', border: '2px solid #3B82F6' }}
              onClick={() => navigate('/profile')}
            />
          </div>
        </div>

        {/* รูตรงกลางสำหรับเสียบเนื้อหาหน้าต่างๆ */}
        <div className="page-content">
          <Outlet /> 
        </div>

        {/* 🌟 3. Bottom Navbar (สำหรับมือถือ) */}
        {isMobile && (
          <div className="bottom-navbar">
            {navItems.map(item => (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`bottom-nav-item ${location.pathname === item.path ? 'active' : ''}`}
              >
                {React.cloneElement(item.icon, { color: location.pathname === item.path ? item.icon.props.color : '#6C7280' })}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}