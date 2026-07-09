import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, CheckCircle2, Send, Wallet, Landmark, UploadCloud, Calendar, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Deposit() {
  const navigate = useNavigate();
  const [systemBanks, setSystemBanks] = useState([]);
  const [selectedBankId, setSelectedBankId] = useState(null);
  const [amount, setAmount] = useState('');
  const [slipImage, setSlipImage] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // ตั้งค่าวันที่และเวลาให้ตรงกับ Local Time (ไทย/ลาว)
  const now = new Date();
  const defaultDate = now.toLocaleDateString('en-CA'); 
  const defaultTime = now.toTimeString().split(' ')[0].substring(0, 5);

  const [transferDate, setTransferDate] = useState(defaultDate);
  const [transferTime, setTransferTime] = useState(defaultTime);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  let username = '';
  const userStr = localStorage.getItem('user') || localStorage.getItem('userProfile');
  if (userStr) {
    try {
      const parsed = JSON.parse(userStr);
      username = parsed.Username || parsed.username || parsed.id || '';
    } catch (e) {
      username = userStr;
    }
  }
  if (!username) {
    username = localStorage.getItem('username') || localStorage.getItem('Username') || '';
  }

  // 🌟 ดึงข้อมูลธนาคารจาก Backend (สมมติว่า Backend ส่ง Currency ของแต่ละบัญชีมาด้วย)
  useEffect(() => {
    fetch('https://api.run9.app/api/admin/system-banks')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSystemBanks(data.banks.filter(b => b.IsActive));
        }
      })
      .catch(err => console.error(err));
  }, []);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if(file) {
      const reader = new FileReader();
      reader.onloadend = () => setSlipImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!username) return alert("กรุณาล็อกอินก่อน");
    if (!selectedBankId) return alert("กรุณาเลือกบัญชีธนาคารที่ต้องการโอน");
    if (!amount || amount <= 0) return alert("กรุณากรอกจำนวนเงินให้ถูกต้อง");
    if (!transferDate || !transferTime) return alert("กรุณาระบุวันที่และเวลาที่โอนให้ครบถ้วน");
    if (!slipImage) return alert("กรุณาแนบรูปภาพสลิปโอนเงิน");

    try {
      const response = await fetch('https://api.run9.app/api/wallet/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username, 
          amount: parseFloat(amount), 
          type: 'DEPOSIT',
          systemBankId: selectedBankId,
          slipImage: slipImage,
          transferDate,
          transferTime
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('✅ แจ้งโอนเงินสำเร็จ รอระบบกระทบยอดสักครู่');
        navigate('/assets'); 
      } else {
        alert('❌ ' + data.error);
      }
    } catch (err) {
      alert('❌ เชื่อมต่อเซิร์ฟเวอร์ไม่ได้');
    }
  };

  const selectedBank = systemBanks.find(b => b.Id === selectedBankId);
  const isMobile = windowWidth <= 400; // ตรวจสอบมือถือจอเล็กมากๆ

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', background: '#0B0E14', minHeight: '100vh', color: '#fff', fontFamily: "'Prompt', sans-serif", paddingBottom: '30px' }}>

      {/* 🌟 Top Navbar: ทำให้ปุ่ม Back เล็กๆ เนียนๆ */}
      <div style={{ padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '15px', position: 'sticky', top: 0, zIndex: 10, background: '#0B0E14' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: '35px', height: '35px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
          <ArrowLeft size={18} color="#94A3B8" />
        </button>
        <h3 style={{ margin: 0, color: '#E2E8F0', fontSize: '1rem', fontWeight: 'bold' }}>เติมเงินเข้ากระเป๋า</h3>
      </div>

      <div style={{ padding: '0 20px 20px 20px' }}>
        
        <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Landmark size={14} color="#3B82F6" /> 1. เลือกบัญชีธนาคารสำหรับโอนเงิน
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', marginBottom: '20px' }}>
          {systemBanks.length === 0 ? (
            <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#64748B', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>กำลังโหลดข้อมูลธนาคาร...</div>
          ) : (
            systemBanks.map(bank => {
              const isSelected = selectedBankId === bank.Id;
              // 🌟 สมมติว่าใน DB มีคอลัมน์ Currency เพื่อเอามาเช็กสกุลเงิน
              const currency = bank.Currency || (bank.Country === 'Thailand' ? 'THB' : 'LAK'); 
              const currencyColor = currency === 'THB' ? '#3B82F6' : '#EF4444'; // ไทยสีฟ้า ลาวสีแดง

              return (
                <div 
                  key={bank.Id}
                  onClick={() => setSelectedBankId(bank.Id)}
                  style={{ 
                    background: isSelected ? 'rgba(59, 130, 246, 0.05)' : 'rgba(255, 255, 255, 0.02)', 
                    padding: '12px', 
                    borderRadius: '12px', 
                    cursor: 'pointer',
                    border: isSelected ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '35px', height: '35px', borderRadius: '50%', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {bank.BankLogo ? (
                        <img src={bank.BankLogo} alt={bank.BankName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      ) : (
                        <Landmark size={18} color="#94A3B8" />
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: isSelected ? '#fff' : '#E2E8F0' }}>{bank.BankName}</div>
                      <div style={{ fontSize: '0.65rem', color: '#64748B', display: 'flex', gap: '5px' }}>
                        <span>ประเทศ: {bank.Country === 'Thailand' ? '🇹🇭' : '🇱🇦'}</span>
                        <span style={{ color: currencyColor, fontWeight: 'bold' }}>({currency})</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: isSelected ? 'none' : '2px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', background: isSelected ? '#3B82F6' : 'transparent' }}>
                    {isSelected && <CheckCircle2 size={14} color="#fff" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {selectedBank && (
          <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
            <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Wallet size={14} color="#3B82F6" /> 2. โอนเงินและแนบหลักฐาน
            </p>
            
            <div style={{ background: 'linear-gradient(180deg, #1A1F2B 0%, #12161F 100%)', padding: '15px', borderRadius: '16px', border: '1px solid rgba(50, 100, 255, 0.2)' }}>
              
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '12px', marginBottom: '15px', border: '1px dashed rgba(255, 255, 255, 0.1)' }}>
                <div style={{ fontSize: '0.65rem', color: '#94A3B8', marginBottom: '2px' }}>ชื่อบัญชี: <span style={{ color: '#E2E8F0' }}>{selectedBank.AccountName}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#60A5FA', letterSpacing: '1px' }}>
                    {selectedBank.AccountNumber}
                  </span>
                  <button 
                    type="button"
                    onClick={() => handleCopy(selectedBank.AccountNumber, selectedBank.Id)}
                    style={{ background: copiedId === selectedBank.Id ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)', border: 'none', borderRadius: '6px', color: copiedId === selectedBank.Id ? '#10B981' : '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem', padding: '4px 8px' }}
                  >
                    {copiedId === selectedBank.Id ? <><CheckCircle2 size={12}/> คัดลอกแล้ว</> : <><Copy size={12}/> คัดลอก</>}
                  </button>
                </div>
              </div>

              <form onSubmit={handleDeposit}>
                
                <div style={{ position: 'relative', marginBottom: '15px' }}>
                  <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#3B82F6', fontSize: '1rem', fontWeight: 'bold' }}>
                    {selectedBank.Currency === 'LAK' ? '₭' : '฿'}
                  </span>
                  <input 
                    type="number" 
                    placeholder="ระบุจำนวนเงินที่โอน" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    style={{ width: '100%', padding: '12px 12px 12px 35px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: '#0B0E14', color: '#fff', fontSize: '1rem', fontWeight: 'bold', boxSizing: 'border-box', outline: 'none' }}
                    required
                  />
                </div>

                {/* 🌟 แก้ปัญหาช่องเวลาล้นในมือถือ: ถ้าจอเล็กมากให้หุบเป็นแนวตั้ง */}
                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '10px', marginBottom: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.65rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}><Calendar size={12} color="#64748B" /> วันที่โอน</label>
                    <input 
                      type="date" 
                      value={transferDate}
                      onChange={(e) => setTransferDate(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#0B0E14', color: '#fff', outline: 'none', boxSizing: 'border-box', fontSize: '0.85rem', colorScheme: 'dark' }}
                      required
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.65rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}><Clock size={12} color="#64748B" /> เวลา</label>
                    <input 
                      type="time" 
                      value={transferTime}
                      onChange={(e) => setTransferTime(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#0B0E14', color: '#fff', outline: 'none', boxSizing: 'border-box', fontSize: '0.85rem', colorScheme: 'dark' }}
                      required
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', border: '1px dashed rgba(59, 130, 246, 0.3)', borderRadius: '12px', cursor: 'pointer', background: slipImage ? '#0B0E14' : 'rgba(255,255,255,0.02)' }}>
                    {slipImage ? (
                      <img src={slipImage} alt="Slip" style={{ maxHeight: '150px', borderRadius: '8px' }} />
                    ) : (
                      <>
                        <UploadCloud size={24} color="#3B82F6" style={{ marginBottom: '8px' }} />
                        <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>คลิกเพื่อเลือกรูปภาพสลิป</span>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} required />
                  </label>
                </div>

                <button 
                  type="submit" 
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: 'linear-gradient(90deg, #3B82F6, #2563EB)', color: '#fff', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                >
                  <Send size={16} /> ยืนยันการโอนเงิน
                </button>
              </form>
              
            </div>
          </div>
        )}
      </div>
    </div>
  );
}