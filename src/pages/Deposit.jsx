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

// ตั้งค่าเริ่มต้นให้เป็นวันที่และเวลาปัจจุบัน
const now = new Date();
const defaultDate = now.toISOString().split('T')[0];
const defaultTime = now.toTimeString().split(' ')[0].substring(0, 5);

const [transferDate, setTransferDate] = useState(defaultDate);
const [transferTime, setTransferTime] = useState(defaultTime);

// 🌟 ดึงข้อมูล Username จากระบบ Login จริง
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

// ดึงข้อมูลธนาคารจาก Backend
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

return (
<div style={{ maxWidth: '480px', margin: '0 auto', background: '#f4f5f8', minHeight: '100vh', color: '#333', fontFamily: 'sans-serif', paddingBottom: '30px' }}>

  <div style={{ background: '#fff', padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 10 }}>
    <ArrowLeft size={22} color="#444" style={{ cursor: 'pointer' }} onClick={() => navigate(-1)} />
    <h3 style={{ margin: 0, color: '#333', fontSize: '1rem', fontWeight: 'bold' }}>เติมเงินเข้ากระเป๋า</h3>
  </div>

  <div style={{ padding: '20px' }}>
    <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
      <Landmark size={16} /> 1. เลือกบัญชีธนาคารสำหรับโอนเงิน
    </p>
    
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', marginBottom: '25px' }}>
      {systemBanks.length === 0 ? (
        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#999' }}>กำลังโหลดข้อมูลธนาคาร...</div>
      ) : (
        systemBanks.map(bank => {
          const isSelected = selectedBankId === bank.Id;

          return (
            <div 
              key={bank.Id}
              onClick={() => setSelectedBankId(bank.Id)}
              style={{ 
                background: '#fff', padding: '12px 15px', borderRadius: '12px', cursor: 'pointer',
                border: isSelected ? '2px solid #9D8667' : '1px solid #e2e8f0',
                boxShadow: isSelected ? '0 4px 12px rgba(157,134,103,0.15)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* 🌟 ดึงรูปโลโก้จาก Backend ถ้าไม่มีให้โชว์ไอคอนธนาคารแทน */}
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f8fafc', border: '1px solid #eee' }}>
                  {bank.BankLogo ? (
                    <img src={bank.BankLogo} alt={bank.BankName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <Landmark size={20} color="#94a3b8" />
                  )}
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#222' }}>{bank.BankName}</div>
                  <div style={{ fontSize: '0.75rem', color: '#888' }}>รองรับผู้เล่นจาก: {bank.Country === 'Thailand' ? 'ไทย 🇹🇭' : 'ลาว 🇱🇦'}</div>
                </div>
              </div>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: isSelected ? 'none' : '2px solid #ddd', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {isSelected && <CheckCircle2 size={24} color="#9D8667" />}
              </div>
            </div>
          );
        })
      )}
    </div>

    {selectedBank && (
      <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
        <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Wallet size={16} /> 2. คัดลอกเลขบัญชี และระบุข้อมูลตามสลิป
        </p>
        
        <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
          
          <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', marginBottom: '20px', border: '1px dashed #cbd5e1' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>ชื่อบัญชี: {selectedBank.AccountName}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#0f172a', letterSpacing: '1px' }}>
                {selectedBank.AccountNumber}
              </span>
              <button 
                type="button"
                onClick={() => handleCopy(selectedBank.AccountNumber, selectedBank.Id)}
                style={{ background: 'transparent', border: 'none', color: copiedId === selectedBank.Id ? '#10b981' : '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 'bold', padding: '5px' }}
              >
                {copiedId === selectedBank.Id ? <><CheckCircle2 size={16}/> คัดลอกแล้ว</> : <><Copy size={16}/> คัดลอก</>}
              </button>
            </div>
          </div>

          <form onSubmit={handleDeposit}>
            
            <div style={{ position: 'relative', marginBottom: '15px' }}>
              <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '1.1rem', fontWeight: 'bold' }}>฿</span>
              <input 
                type="number" 
                placeholder="ระบุจำนวนเงินที่โอน" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ width: '100%', padding: '15px 15px 15px 35px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff', color: '#0f172a', fontSize: '1.1rem', fontWeight: 'bold', boxSizing: 'border-box', outlineColor: '#9D8667' }}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}><Calendar size={14}/> วันที่โอน</label>
                <input 
                  type="date" 
                  value={transferDate}
                  onChange={(e) => setTransferDate(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#333', outlineColor: '#9D8667', boxSizing: 'border-box' }}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}><Clock size={14}/> เวลา</label>
                <input 
                  type="time" 
                  value={transferTime}
                  onChange={(e) => setTransferTime(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#333', outlineColor: '#9D8667', boxSizing: 'border-box' }}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '8px', fontWeight: 'bold' }}>แนบหลักฐานการโอนเงิน (สลิป)</p>
              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', border: '2px dashed #cbd5e1', borderRadius: '12px', cursor: 'pointer', background: slipImage ? '#fff' : '#f8fafc', transition: 'all 0.2s' }}>
                {slipImage ? (
                  <img src={slipImage} alt="Slip" style={{ maxHeight: '150px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                ) : (
                  <>
                    <UploadCloud size={30} color="#94a3b8" style={{ marginBottom: '10px' }} />
                    <span style={{ fontSize: '0.9rem', color: '#64748b' }}>คลิกเพื่อเลือกรูปภาพสลิป</span>
                  </>
                )}
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} required />
              </label>
            </div>

            <button 
              type="submit" 
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: '#9D8667', color: '#fff', fontSize: '0.95rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', boxShadow: '0 4px 10px rgba(157,134,103,0.3)' }}
            >
              <Send size={18} /> ยืนยันการโอนเงิน
            </button>
          </form>
          
        </div>
      </div>
    )}
  </div>
</div>


);
}