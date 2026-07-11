import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css'; // ต้อง import ไฟล์ CSS ด้วยเพื่อให้ความสวยงามทำงาน

export default function Login({ onSwitchToRegister }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // 🟢 ฟังก์ชัน Handle Login (อัปเกรดระบบ Session และรองรับสกุลเงิน)
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
        // 🌟 1. ตรวจสอบประเทศเพื่อกำหนด "สกุลเงิน" และ "สัญลักษณ์"
        let currencySymbol = '฿'; // ค่าเริ่มต้นเป็นบาท
        let currencyCode = 'THB';
        
        if (data.country && data.country.toLowerCase().includes('laos')) {
          currencySymbol = '₭';
          currencyCode = 'LAK';
        }

        // 🌟 2. แพ็กข้อมูลทั้งหมดเป็นก้อน JSON เพื่อความปลอดภัยและเป็นระเบียบ
        const userProfile = {
          id: data.id,
          username: data.username,
          country: data.country,
          currencySymbol: currencySymbol,
          currencyCode: currencyCode
        };

        // 🌟 3. เคลียร์ข้อมูลเก่าที่ค้างอยู่ (สำคัญมาก ป้องกัน Session ชนกัน!)
        localStorage.clear(); 
        
        // 🌟 4. บันทึกก้อนข้อมูลลงไปใหม่ (แปลงเป็น String ก่อนเซฟ)
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        // แถมเซฟแยกไว้เผื่อระบบเก่าเรียกใช้ (กันพัง)
        localStorage.setItem('username', data.username);
        
        // ล็อกอินผ่านแล้วเด้งไปหน้า Dashboard
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