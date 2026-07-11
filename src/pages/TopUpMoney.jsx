import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wallet, ShieldCheck, Users } from 'lucide-react';

export default function TopUpMoney() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [currencySymbol, setCurrencySymbol] = useState('฿');
  const [myUsername, setMyUsername] = useState('');
  
  const [bankInfo, setBankInfo] = useState({ name: 'กำลังโหลด...', account: '' });

  useEffect(() => {
    const savedProfileStr = localStorage.getItem('userProfile');
    let currentUsername = '';
    
    if (savedProfileStr) {
      try {
        const parsed = JSON.parse(savedProfileStr);
        if (parsed.currencySymbol) setCurrencySymbol(parsed.currencySymbol);
        if (parsed.username) {
          currentUsername = parsed.username;
          setMyUsername(parsed.username);
        }
      } catch (e) {}
    }

    // 🌟 ดึงข้อมูลบัญชีธนาคารจากฐานข้อมูล (ของจริง)
    if (currentUsername) {
      fetch(`https://api.run9.app/api/user/bank-account/${currentUsername}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.bank) {
            setBankInfo({ 
              name: data.bank.BankName, 
              account: data.bank.AccountNumber 
            });
          } else {
            setBankInfo({ name: 'ยังไม่ได้ผูกบัญชี', account: 'กรุณาเพิ่มบัญชีที่หน้าโปรไฟล์' });
          }
        })
        .catch(err => {
          console.error("Error fetching bank:", err);
          setBankInfo({ name: 'ไม่สามารถดึงข้อมูลได้', account: '-' });
        });
    }
  }, []);

  const handleSubmitTopUp = async (e) => {
    e.preventDefault();
    
    const depositAmount = parseFloat(amount);
    if (!depositAmount || depositAmount <= 0) {
      alert("กรุณาระบุจำนวนเงินให้ถูกต้อง");
      return;
    }
    if (!myUsername) {
      alert("ไม่พบชื่อผู้ใช้งาน กรุณาล็อกอินใหม่");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://api.run9.app/api/p2p/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: myUsername, 
          amount: depositAmount, 
          orderType: 'DEPOSIT' 
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`✅ สร้างคำขอเติมเงิน P2P สำเร็จ!\nระบบได้ส่งคำขอไปให้ผู้ให้บริการแล้ว`);
        navigate('/my-p2p'); // 🌟 เปลี่ยนให้เด้งไปหน้า "รายการของฉัน" แทนหน้า Market
      } else {
        alert(`❌ เกิดข้อผิดพลาด: ${data.message}`);
      }
    } catch (error) {
      alert("⚠️ เชื่อมต่อเซิร์ฟเวอร์ล้มเหลว");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="topup-container" style={{ padding: '20px 15px', paddingBottom: '90px', fontFamily: "'Prompt', sans-serif", background: '#0B0E14', minHeight: '100vh', color: '#fff' }}>
      
      <div className="topup-header" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', padding: '8px', borderRadius: '10px', color: '#94A3B8', cursor: 'pointer' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#E2E8F0' }}>เติมเงิน (P2P)</h2>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.7rem', color: '#64748B' }}>ผ่านผู้ให้บริการในระบบ</p>
        </div>
      </div>

      <div className="topup-info-card" style={{ background: 'linear-gradient(145deg, #1A1F2B 0%, #12161F 100%)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255, 138, 0, 0.15)', marginBottom: '20px', position: 'relative', overflow: 'hidden' }}>
        <h4 style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: '#FF8A00', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} /> ข้อมูลบัญชีรับเงินของคุณ
        </h4>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>ธนาคาร</span>
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{bankInfo.name}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>เลขบัญชี</span>
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '1px' }}>{bankInfo.account}</span>
        </div>
      </div>

      <form onSubmit={handleSubmitTopUp} className="topup-form-box" style={{ background: '#1C1F26', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.85rem', color: '#E2E8F0' }}>ระบุจำนวนเงินที่ต้องการเติม ({currencySymbol})</label>
        
        <div className="topup-input-wrapper" style={{ position: 'relative', marginBottom: '25px' }}>
          <Wallet size={20} color="#FF8A00" style={{ position: 'absolute', left: '15px', top: '15px' }} />
          <input 
            type="number" 
            placeholder="เช่น 1500"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="topup-input"
            style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '15px 15px 15px 45px', color: '#fff', fontSize: '1.2rem', fontWeight: 'bold', outline: 'none', boxSizing: 'border-box' }}
            required
            min="100"
          />
        </div>

        <button type="submit" disabled={loading} className="btn-submit-topup" style={{ width: '100%', background: loading ? '#64748B' : 'linear-gradient(90deg, #FF8A00 0%, #E52E71 100%)', color: '#fff', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
          {loading ? 'กำลังดำเนินการ...' : (
            <>ส่งคำขอเติมเงิน <Users size={20} /></>
          )}
        </button>
      </form>

    </div>
  );
}