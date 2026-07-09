import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css'; // ต้อง import ไฟล์ CSS ด้วยเพื่อให้ความสวยงามทำงาน

export default function Login({ onSwitchToRegister }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // 🟢 ฟังก์ชัน Handle Login ของคุณ (คงไว้เหมือนเดิม 100%)
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://api.run9.app/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      
      if (response.ok) {
        // เก็บข้อมูลลง LocalStorage
        localStorage.setItem('username', data.username);
        localStorage.setItem('country', data.country); 
        
        // ล็อกอินผ่านแล้วเด้งไปหน้า Profile
        navigate('/Dashboard'); 
      } else {
        alert('❌ ' + (data.error || 'ข้อมูลผิดพลาด'));
      }
    } catch (error) {
      alert('⚠️ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    }
  };

  return (
    <div className="login-wrapper">
      {/* 🟢 ปุ่มย้อนกลับ */}
      <button className="back-button" onClick={() => navigate(-1)}>
        &#8592; ย้อนกลับ
      </button>

      {/* 🟢 Card กระจกโลกอนาคต */}
      <div className="login-glass-card">
        <h2 className="login-title">Login</h2>
        
        {/* 🟢 Form ที่ผูกกับ handleLogin */}
        <form className="login-form" onSubmit={handleLogin}>
          
          {/* ช่อง Username */}
          <div className="input-group">
            <label>Username</label>
            <div className="input-wrapper">
              <span className="input-icon">@</span>
              <input 
                type="text" 
                placeholder="กรอกชื่อผู้ใช้งาน"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required 
              />
            </div>
          </div>

          {/* ช่อง Password */}
          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input 
                type="password" 
                placeholder="กรอกรหัสผ่าน"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
          </div>

          {/* 🟢 ปุ่ม Submit แสงวิ่ง */}
          <button type="submit" className="btn-futuristic">
            เข้าสู่ระบบ
          </button>
        </form>

        {/* 🟢 ลิงก์ไปหน้าสมัครสมาชิก */}
        <p className="register-link">
          ยังไม่มีบัญชี?{' '}
          <span onClick={() => {
            // รองรับทั้งการส่ง props หรือถ้าไม่ส่งมาก็จะวิ่งไป path /register
            if (onSwitchToRegister) {
              onSwitchToRegister();
            } else {
              navigate('/register');
            }
          }}>
            สมัครสมาชิก
          </span>
        </p>
      </div>
    </div>
  );
}