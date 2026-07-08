import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login({ onSwitchToRegister }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

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
        // 🟢 ตอนนี้ data.username และ data.country มีค่าส่งมาจาก Backend แล้ว
        localStorage.setItem('username', data.username);
        localStorage.setItem('country', data.country); 
        
        // 🟢 ใช้คำสั่ง navigate ของ React-Router เพื่อเปลี่ยนหน้า (ลบ window.location.href ออก)
        // ถ้าอยากให้ล็อกอินแล้วไปหน้า Profile เลย ให้เปลี่ยนเป็น navigate('/profile');
        navigate('/profile'); 
      } else {
        alert('❌ ' + (data.error || 'ข้อมูลผิดพลาด'));
      }
    } catch (error) {
      alert('⚠️ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    }
};

  return (
    <div className="page-content" style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '350px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--primary-color)' }}>Login</h2>
        
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Username</label>
            <div className="input-field-wrapper">
              <span className="input-icon">@</span>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)} 
                placeholder="กรอกชื่อผู้ใช้งาน"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-field-wrapper">
              <span className="input-icon">🔒</span>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="กรอกรหัสผ่าน"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
            เข้าสู่ระบบ
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.875rem' }}>
          ยังไม่มีบัญชี? <span style={{ color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 'bold' }} onClick={onSwitchToRegister}>สมัครสมาชิก</span>
        </p>
      </div>
    </div>
  );
}