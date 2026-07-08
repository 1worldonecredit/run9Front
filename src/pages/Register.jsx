import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// เปลี่ยนจากบรรทัดแรกทำให้หน้า register อยู่ใต้ Top NavBar Prelogin
export default function Register({ onSwitchToLogin }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); 
  
  // --- ตัวแปรเก็บข้อมูล ---
  const [country, setCountry] = useState('Thailand (+66)');
  // 🌟 ดึงค่า ref จาก URL มาใส่เป็นค่าเริ่มต้นให้ referral เลย
  const [referral, setReferral] = useState(searchParams.get('ref') || '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // --- ตัวแปรเก็บข้อความแจ้งเตือน (Real-time) ---
  const [referralMessage, setReferralMessage] = useState('');
  const [isReferralFound, setIsReferralFound] = useState(null);
  
  const [usernameMessage, setUsernameMessage] = useState('');
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(null);

  // 🌟 เพิ่ม useEffect: ถ้ามีรหัสคนชวนมาจาก URL ให้จำลองการพิมพ์เพื่อเช็คชื่อทันที!
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

    // ดักไว้ก่อน: ถ้าหาผู้แนะนำไม่เจอ หรือ ชื่อซ้ำ จะไม่ยอมให้สมัคร
    if (isReferralFound === false) {
      alert('กรุณาตรวจสอบรหัสผู้แนะนำให้ถูกต้อง');
      return;
    }
    if (isUsernameAvailable === false) {
      alert('ชื่อผู้ใช้งานนี้มีคนใช้แล้ว กรุณาเปลี่ยนชื่อใหม่');
      return;
    }

    try {
      // 🌟 ส่งค่า referral เข้าไปให้ API เพื่อบันทึกเป็นคนชวน
      const response = await fetch('https://api.run9.app/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referredBy: referral, country, username, password })
      });
      const data = await response.json();
      
      if (response.ok || data.success) {
        alert('✅ สมัครสมาชิกสำเร็จ!'); 
        onSwitchToLogin();    // ✅ ใช้คำสั่งนี้เพื่อสลับการ์ดกลับไปหน้า Login แบบสมูทๆ
      } else {
        alert('❌ ไม่สามารถสมัครได้: ' + data.error);
      }
    } catch (error) {
      alert('⚠️ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    }
  };

  return (
    <div className="page-content" style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '350px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--primary-color)' }}>Register</h2>
        
        <form onSubmit={handleRegister}>
          
          <div className="input-group">
            <label>ประเทศ (สกุลเงิน)</label>
            <select 
              value={country} 
              onChange={(e) => setCountry(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
            >
              <option value="Thailand (+66)">Thailand (+66)</option>
              <option value="Laos (+856)">Laos (+856)</option>
            </select>
          </div>

          <div className="input-group">
            <label>รหัสผู้แนะนำ (Referral Username)</label>
            <div className="input-field-wrapper">
              <span className="input-icon">#</span>
              <input 
                type="text" 
                value={referral}
                onChange={handleCheckReferral} 
                placeholder="กรอกรหัสผู้แนะนำ (ถ้ามี)"
                readOnly={!!searchParams.get('ref')} // 🌟 ถ้ามีรหัสมาจากลิงก์ ให้ล็อกช่องนี้ไว้พิมพ์แก้ไม่ได้
                style={{ 
                  background: searchParams.get('ref') ? '#f0f0f0' : 'transparent', // 🌟 เปลี่ยนสีพื้นหลังนิดหน่อยให้รู้ว่าล็อกอยู่
                  color: searchParams.get('ref') ? '#666' : 'inherit',
                  width: '100%', 
                  border: 'none', 
                  outline: 'none' 
                }}
              />
            </div>
            {/* โชว์ข้อความเขียว-แดง */}
            {referralMessage && <p style={{ fontSize: '0.75rem', marginTop: '4px', color: isReferralFound ? 'green' : 'red' }}>{referralMessage}</p>}
          </div>

          <div className="input-group">
            <label>Username (4-15 ตัวอักษร)</label>
            <div className="input-field-wrapper">
              <span className="input-icon">@</span>
              <input 
                type="text" 
                value={username}
                onChange={handleCheckUsername} 
                placeholder="ตั้ง Username"
                required
                style={{ width: '100%', border: 'none', outline: 'none' }}
              />
            </div>
            {/* โชว์ข้อความเขียว-แดง */}
            {usernameMessage && <p style={{ fontSize: '0.75rem', marginTop: '4px', color: isUsernameAvailable ? 'green' : 'red' }}>{usernameMessage}</p>}
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-field-wrapper">
              <span className="input-icon">🔒</span>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="ตั้งรหัสผ่าน"
                required
                style={{ width: '100%', border: 'none', outline: 'none' }}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '10px', width: '100%' }}>
            ยืนยันการลงทะเบียน
          </button>
        </form>

       <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.875rem' }}>
       กลับสู่หน้า <span style={{ color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 'bold' }} onClick={onSwitchToLogin}>Login</span>
      </p>
      </div>
    </div>
  );
}