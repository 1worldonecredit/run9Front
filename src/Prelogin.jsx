import React, { useState } from 'react';
// แก้จากบรรทัดเดิมที่หาไฟล์ไม่เจอ เป็นบรรทัดนี้ครับ:
import Login from './pages/Login'; 
import Register from './pages/Register';
import './index.css';

function Prelogin() {
  // 🟢 สร้างตัวแปร state เพื่อเก็บว่าตอนนี้จะแสดงหน้าไหน ('home', 'login', 'register')
  const [activeView, setActiveView] = useState('home');

  return (
    <div className="prelogin-wrapper">
      {/* Top Navbar */}
      <nav className="top-navbar">
        <div className="navbar-logo" onClick={() => setActiveView('home')}>9 Plus</div>
        
        {activeView === 'home' && (
          <button className="navbar-login-icon" onClick={() => setActiveView('login')}>
            {/* ไอคอน Login */}
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
              <polyline points="10 17 15 12 10 7"></polyline>
              <line x1="15" y1="12" x2="3" y2="12"></line>
            </svg>
          </button>
        )}
      </nav>

      {/* Main Content (แสดงผลตาม activeView) */}
      <div className="prelogin-content">
        {activeView === 'home' && (
           <div className="welcome-screen">
             {/* ใส่เนื้อหาหน้าแรกของคุณที่นี่ถ้ามี */}
           </div>
        )}

        {/* 🟢 ถ้า activeView เป็น 'login' ให้แสดงหน้า Login */}
        {activeView === 'login' && (
          <Login onSwitchToRegister={() => setActiveView('register')} />
        )}

        {/* 🟢 ถ้า activeView เป็น 'register' ให้แสดงหน้า Register */}
        {activeView === 'register' && (
          <Register onSwitchToLogin={() => setActiveView('login')} />
        )}
      </div>
    </div>
  );
}

export default Prelogin;