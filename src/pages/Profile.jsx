import React, { useState, useEffect, useRef } from 'react';
import { User, Landmark, Phone, Mail, Calendar, MapPin, Store, PlusCircle, CheckCircle, ShieldCheck, LogOut, X, Camera, AlertCircle } from 'lucide-react';

export default function Profile() {
  const [stats, setStats] = useState({ daysLeft: 0, isEligible: false, freeTicketsToday: 0, gameHistory: [] });
  const [profile, setProfile] = useState({ ProfileImageUrl: null, FirstName: '', LastName: '', PhoneNumber: '', IsPhoneVerified: false });
  
  const [activeBank, setActiveBank] = useState(null); 
  const [bankMasterList, setBankMasterList] = useState([]); 
  
  // ควบคุมการเปิด/ปิด Popup
  const [isBankModalOpen, setIsBankModalOpen] = useState(false); 
  const [isNameModalOpen, setIsNameModalOpen] = useState(false); 
  
  const [formBankCode, setFormBankCode] = useState('');
  const [formAccNumber, setFormAccountNumber] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);
  const [formBankBook, setFormBankBook] = useState(null); // สำหรับเก็บรูปสมุดบัญชี Base64

 // const username = localStorage.getItem('username') || 'Admin';
  // ลองกำหนดค่าชั่วคราวเพื่อทดสอบระบบ (Hardcode)
  // ดึงชื่อคนที่ล็อกอินอยู่จากระบบ
const username = localStorage.getItem('username');

  // ดึงชื่อ-นามสกุลแบบอัตโนมัติ
  const fullName = `${profile.FirstName || ''} ${profile.LastName || ''}`.trim();

  const fetchProfileData = () => {
    fetch(`https://api.run9.app/api/user/profile-stats?username=${username}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats(data.stats);
          if (data.profile) setProfile(data.profile);
          if (data.bank && data.bank.AccountNumber) setActiveBank(data.bank);
          else setActiveBank(null);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching profile stats:", err);
        setLoading(false);
      });
  };

  const fetchSystemBanks = () => {
    fetch(`https://api.run9.app/api/system/banks?username=${username}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setBankMasterList(data.banks);
      })
      .catch(err => console.error("Error fetching system banks:", err));
  };

useEffect(() => {
  // ดักไว้ก่อนว่าต้องมีตัวแปร username และต้องไม่ใช่คำว่า 'undefined'
  if (username && username !== 'undefined') {
    fetchProfileData();
    fetchSystemBanks();
  }
}, [username]);


// --- ฟังก์ชันบันทึกข้อมูลส่วนตัว (ชื่อ-นามสกุล) ---
const saveProfileData = async (e, newImage = profile.ProfileImageUrl) => {
  if(e) e.preventDefault();
  setSaving(true);
  try {
    // 🟢 แก้ไข URL ตรงนี้ให้ตรงกับ Backend ที่มีคำสั่ง SQL ของตาราง UserNames
    const res = await fetch('https://api.run9.app/update-name', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username, // ต้องมั่นใจว่าตัวแปร username นี้มีค่า ไม่เป็น undefined
        firstName: profile.FirstName, 
        lastName: profile.LastName 
      })
    });
    const data = await res.json();
    
    // สมมติว่า Backend ส่ง { message: "..." } กลับมาเมื่อสำเร็จ
    if(res.ok) {
      alert("บันทึกชื่อ-นามสกุล สำเร็จ!");
      setIsNameModalOpen(false); 
      fetchProfileData();
    }
  } catch (err) {
    alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
  }
  setSaving(false);
};

  // --- ฟังก์ชันอัปโหลดรูปภาพ ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, ProfileImageUrl: reader.result }));
        saveProfileData(null, reader.result); // บันทึกรูปลงฐานข้อมูลทันที
      };
      reader.readAsDataURL(file);
    }
  };

  // --- ฟังก์ชันบันทึกธนาคาร ---
  const handleSaveBankAccount = async (e) => {
    e.preventDefault(); 
    if (!formBankCode || !formAccNumber) return alert('กรุณากรอกข้อมูลให้ครบทุกช่องครับ');
    
    setSaving(true);
    try {
      const res = await fetch('https://api.run9.app/api/user/bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, bankCode: formBankCode, accNumber: formAccNumber, accName: fullName })
      });
      const data = await res.json();
      
      if (data.success) {
        alert(data.message);
        setIsBankModalOpen(false); 
        setFormBankCode('');
        setFormAccountNumber('');
        fetchProfileData(); 
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    }
    setSaving(false);
  };

  const handleLogout = () => {
    if(window.confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
      localStorage.removeItem('username');
      localStorage.removeItem('user');
      window.location.href = './prelogin'; 
    }
  };

  // --- Component สร้างรายการแถว (List Item) สไตล์ Visual Bank ---
  const ListItem = ({ icon: Icon, title, value, isEmpty, onClickAdd, color }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #F1F5F9' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ background: '#F8FAFC', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: color || '#94A3B8' }}>
          <Icon size={20} />
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '2px' }}>{title}</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: isEmpty ? '#94A3B8' : '#0F172A' }}>
            {isEmpty ? 'ไม่พบข้อมูล' : value}
          </div>
        </div>
      </div>
      <div>
        {isEmpty ? (
          <button onClick={onClickAdd} style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <PlusCircle size={24} />
          </button>
        ) : (
          <div style={{ fontSize: '0.75rem', background: '#F1F5F9', color: '#64748B', padding: '4px 10px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
            <CheckCircle size={12} color="#10B981" /> บันทึกแล้ว
          </div>
        )}
      </div>
    </div>
  );

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>กำลังโหลดข้อมูลโปรไฟล์...</div>;

  return (
    <div style={{ padding: '15px', paddingBottom: '80px', fontFamily: "'Prompt', sans-serif", background: '#F8FAFC', minHeight: '100vh' }}>
      
      {/* ================= 1. ส่วนหัวโปรไฟล์ระบบ (Visual Bank Style) ================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#0F172A', fontWeight: 'bold' }}>โปรไฟล์ระบบ</h2>
        <span style={{ fontSize: '0.75rem', color: '#10B981', background: '#DEF7EC', padding: '4px 10px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
          <ShieldCheck size={14} /> ยืนยันตัวตนแล้ว
        </span>
      </div>

      {/* ================= 2. การ์ดผู้ใช้งานสีดำ ================= */}
      <div style={{ background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', borderRadius: '20px', padding: '20px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', marginBottom: '25px', position: 'relative' }}>
        
        {/* กล่องอัปโหลดรูป */}
        <div onClick={() => fileInputRef.current.click()} style={{ width: '80px', height: '80px', background: '#334155', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', overflow: 'hidden', position: 'relative', border: '2px solid #475569' }}>
          {profile.ProfileImageUrl ? (
            <img src={profile.ProfileImageUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <User size={35} color="#CBD5E1" />
          )}
          <div style={{ position: 'absolute', bottom: 0, right: 0, background: 'rgba(0,0,0,0.6)', width: '100%', height: '30%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Camera size={12} color="#fff" />
          </div>
        </div>
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }} />

        <div>
          <div style={{ color: '#FACC15', fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '4px' }}>ACCOUNT USER</div>
          <div style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '4px' }}>{username}</div>
          <div style={{ color: '#94A3B8', fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '8px', display: 'inline-block' }}>ID: 1111</div>
        </div>
      </div>

      {/* ================= 3. รายการข้อมูล (List View) ================= */}
      <div style={{ background: '#fff', borderRadius: '20px', padding: '0 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        
        {/* ข้อมูลชื่อ-นามสกุล */}
        <ListItem 
          icon={User} title="ชื่อ-นามสกุล" 
          value={fullName} isEmpty={!fullName} 
          color="#F59E0B"
          onClickAdd={() => setIsNameModalOpen(true)} 
        />

        {/* ข้อมูลเบอร์โทรศัพท์ */}
        <ListItem 
          icon={Phone} title="เบอร์โทรศัพท์" 
          value={profile.PhoneNumber} isEmpty={!profile.PhoneNumber} 
          color="#F59E0B"
          onClickAdd={() => alert("ระบบกำลังเปิดให้เพิ่มเบอร์ในภายหลัง")} 
        />

        {/* ข้อมูลอีเมล (Mockup ให้เหมือนภาพ) */}
        <ListItem 
          icon={Mail} title="อีเมล (Email)" 
          value="" isEmpty={true} 
          onClickAdd={() => {}} 
        />

        {/* วันเกิด (Mockup ให้เหมือนภาพ) */}
        <ListItem 
          icon={Calendar} title="วันเกิด" 
          value="" isEmpty={true} 
          onClickAdd={() => {}} 
        />

        {/* ที่อยู่จัดส่งสินค้า (Mockup ให้เหมือนภาพ) */}
        <ListItem 
          icon={MapPin} title="ที่อยู่จัดส่งสินค้า" 
          value="" isEmpty={true} 
          onClickAdd={() => {}} 
        />

        {/* บัญชีธนาคาร */}
        <ListItem 
          icon={Landmark} title="บัญชีธนาคารระบบ" 
          value={activeBank ? `${activeBank.BankName} (${activeBank.AccountNumber.slice(-4)})` : ''} 
          isEmpty={!activeBank} 
          onClickAdd={() => {
            if(!fullName) return alert('กรุณาเพิ่มชื่อ-นามสกุลของคุณก่อนครับ');
            setIsBankModalOpen(true);
          }} 
        />

        {/* ร้านค้าของฉัน (Mockup ให้เหมือนภาพ) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ background: '#F8FAFC', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#94A3B8' }}><Store size={20} /></div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '2px' }}>ร้านค้าของฉัน</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#94A3B8' }}>ไม่พบข้อมูล</div>
            </div>
          </div>
          <button style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer' }}><PlusCircle size={24} /></button>
        </div>
      </div>

      {/* ปุ่ม Logout */}
      <div style={{ marginTop: '25px' }}>
        <button onClick={handleLogout} style={{ width: '100%', padding: '15px', background: '#FEE2E2', color: '#EF4444', border: 'none', borderRadius: '16px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
          <LogOut size={20} /> ออกจากระบบ
        </button>
      </div>

      {/* ================= 🌟 POPUP: เพิ่มชื่อ-นามสกุล ================= */}
      {isNameModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px', boxSizing: 'border-box' }}>
          <div style={{ background: '#fff', padding: '25px', borderRadius: '24px', width: '100%', maxWidth: '400px', position: 'relative', animation: 'slideUp 0.2s ease-out' }}>
            <button onClick={() => { setIsNameModalOpen(false); fetchProfileData(); }} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><X size={22} /></button>
            <h3 style={{ margin: '0 0 10px 0', color: '#0F172A', fontSize: '1.2rem' }}>เพิ่มชื่อ-นามสกุล</h3>
            
            {/* คำเตือนสีแดงตามที่คุณต้องการ */}
            <div style={{ background: '#FEE2E2', color: '#EF4444', padding: '12px', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '20px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong>คำเตือน:</strong> ชื่อนี้เป็นชื่อที่ต้องตรงกับชื่อบัญชีธนาคารที่คุณจะใช้ในการถอนเงิน หากบันทึกแล้วจะไม่สามารถแก้ไขได้อีก</span>
            </div>

            <form onSubmit={saveProfileData} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '5px', fontWeight: 'bold' }}>ชื่อจริง</label>
                <input type="text" placeholder="กรอกชื่อจริง" value={profile.FirstName} onChange={(e) => setProfile({...profile, FirstName: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '0.95rem', boxSizing: 'border-box' }} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '5px', fontWeight: 'bold' }}>นามสกุล</label>
                <input type="text" placeholder="กรอกนามสกุล" value={profile.LastName} onChange={(e) => setProfile({...profile, LastName: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '0.95rem', boxSizing: 'border-box' }} required />
              </div>

              <button type="submit" disabled={saving} style={{ width: '100%', padding: '14px', background: '#0F172A', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', marginTop: '10px' }}>
                {saving ? 'กำลังบันทึก...' : 'ยืนยันการบันทึก'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= 🌟 POPUP: เพิ่มบัญชีธนาคาร (ระบบ KYC สมุดบัญชี) ================= */}
      {isBankModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px', boxSizing: 'border-box' }}>
          <div style={{ background: '#fff', padding: '25px', borderRadius: '24px', width: '100%', maxWidth: '400px', position: 'relative', animation: 'slideUp 0.2s ease-out', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setIsBankModalOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><X size={22} /></button>
            
            <h3 style={{ margin: '0 0 5px 0', color: '#0F172A', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '4px', height: '20px', background: '#FACC15', borderRadius: '4px' }}></span>
              เพิ่มบัญชีธนาคารใหม่
            </h3>

            <form onSubmit={async (e) => {
                e.preventDefault(); 
                // เช็คว่าอัปโหลดรูปหรือยัง (formBankBook คือ state ที่เราจะเพิ่ม)
                if (!formBankCode || !formAccNumber) return alert('กรุณากรอกข้อมูลให้ครบทุกช่องครับ');
                if (!formBankBook) return alert('กรุณาอัปโหลดภาพหน้าสมุดบัญชีด้วยครับ');
                
                setSaving(true);
                try {
                  const res = await fetch('https://api.run9.app/api/user/bank', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, bankCode: formBankCode, accNumber: formAccNumber, accName: fullName, bankBookImage: formBankBook })
                  });
                  const data = await res.json();
                  
                  if (data.success) {
                    alert(data.message);
                    setIsBankModalOpen(false); 
                    setFormBankCode('');
                    setFormAccountNumber('');
                    setFormBankBook(null); // ล้างรูปภาพ
                    fetchProfileData(); 
                  } else {
                    alert("❌ " + data.error);
                  }
                } catch (err) {
                  alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
                }
                setSaving(false);
            }} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '5px', fontWeight: 'bold' }}>ธนาคาร</label>
                <select value={formBankCode} onChange={(e) => setFormBankCode(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.95rem', background: '#F8FAFC' }} required>
                  <option value="">-- เลือกธนาคาร --</option>
                  {bankMasterList.map((b, idx) => (<option key={idx} value={b.BankCode}>🏛️ {b.BankName}</option>))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '5px', fontWeight: 'bold' }}>ชื่อบัญชี (ดึงจากข้อมูลยืนยันตัวตนอัตโนมัติ)</label>
                <input type="text" value={fullName} readOnly style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.95rem', boxSizing: 'border-box', background: '#F1F5F9', color: '#64748B', cursor: 'not-allowed' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '5px', fontWeight: 'bold' }}>เลขที่บัญชี</label>
                <input type="text" placeholder="ระบุเลขบัญชีที่ถูกต้อง" value={formAccNumber} onChange={(e) => setFormAccountNumber(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.95rem', boxSizing: 'border-box', background: '#F8FAFC' }} required />
              </div>

              {/* 🌟 กล่องอัปโหลดรูปภาพหน้าสมุดบัญชี (ดีไซน์ตามภาพเป๊ะ) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '5px', fontWeight: 'bold' }}>อัปโหลดภาพหน้าสมุดบัญชี (Book Bank)</label>
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '120px', border: '2px dashed #CBD5E1', borderRadius: '8px', cursor: 'pointer', background: '#F8FAFC', position: 'relative', overflow: 'hidden' }}>
                  {formBankBook ? (
                    <img src={formBankBook} alt="Book Bank Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <>
                      <div style={{ color: '#94A3B8', marginBottom: '8px' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#64748B' }}>คลิกเพื่อเลือกรูปภาพหน้าสมุด</span>
                    </>
                  )}
                  {/* ซ่อน input file ไว้ใต้ label */}
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setFormBankBook(reader.result);
                      reader.readAsDataURL(file);
                    }
                  }} />
                </label>
              </div>

              {/* คำเตือนความปลอดภัย (สีฟ้า) */}
              <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '12px', borderRadius: '8px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <AlertCircle size={16} color="#3B82F6" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '0.75rem', color: '#1D4ED8', lineHeight: '1.4' }}>
                  เพื่อความปลอดภัย ระบบจะตรวจสอบชื่อบัญชีกับเอกสาร KYC หากชื่อไม่ตรงกันจะไม่สามารถใช้งานบัญชีนี้ได้
                </span>
              </div>

              <button type="submit" disabled={saving} style={{ width: '100%', padding: '14px', background: '#0F172A', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', marginTop: '5px' }}>
                {saving ? 'กำลังบันทึก...' : 'ส่งข้อมูลตรวจสอบบัญชี'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}