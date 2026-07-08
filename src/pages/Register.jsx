import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';


export default function Register({ onSwitchToLogin }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); 
  
  // --- ตัวแปรเก็บข้อมูล ---
  const [country, setCountry] = useState('Thailand (+66)');
  const [referral, setReferral] = useState(searchParams.get('ref') || '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // --- ตัวแปรเก็บข้อความแจ้งเตือน (Real-time) ---
  const [referralMessage, setReferralMessage] = useState('');
  const [isReferralFound, setIsReferralFound] = useState(null);
  
  const [usernameMessage, setUsernameMessage] = useState('');
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(null);

  // 🌟 พิมพ์จำลองการเช็คชื่อผู้แนะนำทันที ถ้ามี ref มาจาก URL
  useEffect(() => {
    const refFromUrl = searchParams.get('ref');
    if (refFromUrl) {
      handleCheckReferral({ target: { value: refFromUrl } });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // -------------------------------------------------------------
  // ฟังก์ชัน 1: เช็คผู้แนะนำ (พิมพ์ปุ๊บ เช็คปั๊บ)
  // -------------------------------------------------------------
  const handleCheckReferral = async (e) => {
    const typedName = e.target.value;
    setReferral(typedName);

    if (typedName.length >= 3) {
      try {
        const response = await fetch('https://api.run9.app/check-referral', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ referralUsername: typedName })
        });
        const data = await response.json();
        if (data.found) {
          setReferralMessage('✅ ' + data.message);
          setIsReferralFound(true);
        } else {
          setReferralMessage('❌ ' + data.message);
          setIsReferralFound(false);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    } else {
      setReferralMessage('');
      setIsReferralFound(null);
    }
  };

  // -------------------------------------------------------------
  // ฟังก์ชัน 2: เช็ค Username ซ้ำ (พิมพ์ปุ๊บ เช็คปั๊บ)
  // -------------------------------------------------------------
  const handleCheckUsername = async (e) => {
    const typedUsername = e.target.value;
    setUsername(typedUsername);

    if (typedUsername.length >= 4) {
      try {
        const response = await fetch('https://api.run9.app/check-username', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: typedUsername })
        });
        const data = await response.json();
        if (data.available) {
          setUsernameMessage('✅ ' + data.message);
          setIsUsernameAvailable(true);
        } else {
          setUsernameMessage('❌ ' + data.message);
          setIsUsernameAvailable(false);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    } else {
      setUsernameMessage('');
      setIsUsernameAvailable(null);
    }
  };

  // -------------------------------------------------------------
  // ฟังก์ชัน 3: กดปุ่มสมัครสมาชิก
  // -------------------------------------------------------------
  const handleRegister = async (e) => {
    e.preventDefault();

    if (isReferralFound === false) {
      alert('กรุณาตรวจสอบรหัสผู้แนะนำให้ถูกต้อง');
      return;
    }
    if (isUsernameAvailable === false) {
      alert('ชื่อผู้ใช้งานนี้มีคนใช้แล้ว กรุณาเปลี่ยนชื่อใหม่');
      return;
    }

    try {
      const response = await fetch('https://api.run9.app/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referredBy: referral, country, username, password })
      });
      const data = await response.json();
      
      if (response.ok || data.success) {
        alert('✅ สมัครสมาชิกสำเร็จ!'); 
        if (onSwitchToLogin) {
          onSwitchToLogin();
        } else {
          navigate('/login');
        }
      } else {
        alert('❌ ไม่สามารถสมัครได้: ' + data.error);
      }
    } catch (error) {
      alert('⚠️ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    }
  };

  return (
    <div className="login-wrapper">
      {/* 🌟 ปุ่มย้อนกลับ */}
      <button className="back-button" onClick={() => navigate(-1)}>
        &#8592; ย้อนกลับ
      </button>

      <div className="login-glass-card">
        <h2 className="login-title">Register</h2>
        
        <form className="login-form" onSubmit={handleRegister}>
          
          {/* ช่องเลือกประเทศ */}
          <div className="input-group">
            <label>ประเทศ (สกุลเงิน)</label>
            <div className="input-wrapper">
              <span className="input-icon">🌍</span>
              <select 
                value={country} 
                onChange={(e) => setCountry(e.target.value)}
                style={{ 
                  background: 'transparent', 
                  color: '#fff', 
                  width: '100%', 
                  border: 'none', 
                  outline: 'none',
                  padding: '15px 0',
                  fontFamily: 'inherit',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  appearance: 'none'
                }}
              >
                {/* สี option เป็นสีดำเผื่อในมือถือมองไม่เห็น */}
                <option value="Thailand (+66)" style={{ color: '#000' }}>Thailand (+66)</option>
                <option value="Laos (+856)" style={{ color: '#000' }}>Laos (+856)</option>
              </select>
            </div>
          </div>

          {/* ช่องรหัสผู้แนะนำ */}
          <div className="input-group">
            <label>รหัสผู้แนะนำ (Referral Username)</label>
            {/* 🌟 ถ้าโดนล็อกด้วย URL จะให้พื้นหลังสว่างขึ้นนิดนึงเพื่อบอกใบ้ว่าพิมพ์แก้ไม่ได้ */}
            <div className="input-wrapper" style={{ background: searchParams.get('ref') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.4)' }}>
              <span className="input-icon">#</span>
              <input 
                type="text" 
                value={referral}
                onChange={handleCheckReferral} 
                placeholder="กรอกรหัสผู้แนะนำ (ถ้ามี)"
                readOnly={!!searchParams.get('ref')} 
              />
            </div>
            {referralMessage && (
              <p style={{ fontSize: '0.8rem', marginTop: '5px', color: isReferralFound ? '#00E676' : '#FF4C4C' }}>
                {referralMessage}
              </p>
            )}
          </div>

          {/* ช่อง Username */}
          <div className="input-group">
            <label>Username (4-15 ตัวอักษร)</label>
            <div className="input-wrapper">
              <span className="input-icon">@</span>
              <input 
                type="text" 
                value={username}
                onChange={handleCheckUsername} 
                placeholder="ตั้ง Username"
                required
              />
            </div>
            {usernameMessage && (
              <p style={{ fontSize: '0.8rem', marginTop: '5px', color: isUsernameAvailable ? '#00E676' : '#FF4C4C' }}>
                {usernameMessage}
              </p>
            )}
          </div>

          {/* ช่อง Password */}
          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="ตั้งรหัสผ่าน"
                required
              />
            </div>
          </div>

          {/* ปุ่ม Submit แสงวิ่ง */}
          <button type="submit" className="btn-futuristic">
            ยืนยันการลงทะเบียน
          </button>
        </form>

        {/* ลิงก์กลับไปหน้า Login */}
        <p className="register-link">
          มีบัญชีอยู่แล้ว?{' '}
          <span onClick={() => {
            if (onSwitchToLogin) {
              onSwitchToLogin();
            } else {
              navigate('/login');
            }
          }}>
            เข้าสู่ระบบ
          </span>
        </p>
      </div>
    </div>
  );
}