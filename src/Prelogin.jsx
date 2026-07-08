import React, { useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';

export default function Prelogin() {
  // สร้าง State เพื่อจำว่าตอนนี้กำลังดูหน้าไหนอยู่ ('welcome', 'login', หรือ 'register')
  const [currentView, setCurrentView] = useState('welcome');

  return (
    <>
      {/* Navbar ด้านบน จะอยู่คงที่ตลอดเวลา */}
      <div className="top-navbar">
        <div className="brand-title">9 Plus</div>
        <div className="nav-actions">
          {/* ถ้าไม่ได้อยู่หน้าแรกสุด ให้มีปุ่ม 'ย้อนกลับ' */}
          {currentView !== 'welcome' && (
            <span 
              style={{ cursor: 'pointer', fontSize: '0.875rem', color: 'var(--primary-color)', fontWeight: 'bold' }} 
              onClick={() => setCurrentView('welcome')}
            >
              ย้อนกลับ
            </span>
          )}
        </div>
      </div>

      {/* 1. แสดงหน้าต้อนรับ (เมื่อ currentView = 'welcome') */}
      {currentView === 'welcome' && (
        <div className="page-content" style={{ textAlign: 'center', marginTop: '60px' }}>
          <div style={{ marginBottom: '40px' }}>
            <h1 style={{ color: 'var(--primary-color)', fontSize: '2.5rem', marginBottom: '10px' }}>9 Plus</h1>
            <p style={{ color: 'var(--text-secondary)' }}>แพลตฟอร์มการเงินแห่งอนาคตของคุณ</p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
            <button 
              className="btn-primary" 
              style={{ maxWidth: '250px' }} 
              onClick={() => setCurrentView('login')}
            >
              เข้าสู่ระบบ (Login)
            </button>
            <button 
              className="btn-primary" 
              style={{ maxWidth: '250px', background: 'var(--surface-color)', color: 'var(--primary-color)', border: '2px solid var(--primary-color)' }} 
              onClick={() => setCurrentView('register')}
            >
              สร้างบัญชีใหม่ (Register)
            </button>
          </div>
        </div>
      )}

      {/* 2. แสดงหน้า Login (เมื่อ currentView = 'login') */}
      {currentView === 'login' && (
        // ส่งฟังก์ชัน onSwitch ไปให้หน้า Login เพื่อให้มันสั่งเปลี่ยนไปหน้า Register ได้
        <Login onSwitchToRegister={() => setCurrentView('register')} />
      )}

      {/* 3. แสดงหน้า Register (เมื่อ currentView = 'register') */}
      {currentView === 'register' && (
        // ส่งฟังก์ชัน onSwitch ไปให้หน้า Register เพื่อให้มันสั่งเปลี่ยนกลับมาหน้า Login ได้
        <Register onSwitchToLogin={() => setCurrentView('login')} />
      )}
    </>
  );
}