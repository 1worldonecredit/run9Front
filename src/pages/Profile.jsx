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
  
  // 🌟 State ใหม่สำหรับจัดการรูปภาพชั่วคราวก่อนบันทึก
  const fileInputRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null); 
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [formBankBook, setFormBankBook] = useState(null); 

  // ดึงชื่อคนที่ล็อกอินอยู่จากระบบ
  const username = localStorage.getItem('username');
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
    if (username && username !== 'undefined') {
      fetchProfileData();
      fetchSystemBanks();
    }
  }, [username]);

  // --- ฟังก์ชันบันทึกข้อมูลส่วนตัว (เรียก API ตัวเดิมที่คุณมี) ---
  const saveProfileData = async (e, newImage = profile.ProfileImageUrl) => {
    if(e) e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('https://api.run9.app/api/user/update-profile', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: username,
          imageBase64: newImage,
          firstName: profile.FirstName, 
          lastName: profile.LastName,
          phone: profile.PhoneNumber
        })
      });
      const data = await res.json();
      
      if(res.ok || data.success) {
        if (e) {
          alert("บันทึกชื่อ-นามสกุล สำเร็จ!");
          setIsNameModalOpen(false); 
        }
        
        fetchProfileData(); 

        // 🌟 ถ้านี่คือการบันทึกรูปภาพ ให้รีโหลดหน้าเพื่อให้ Top Navbar เปลี่ยนรูปทันที
        if (!e && newImage) {
          window.location.reload(); 
        }
      } else {
        alert('❌ เกิดข้อผิดพลาด: ' + (data.error || 'ไม่สามารถบันทึกได้'));
      }
    } catch (err) {
      alert('⚠️ เกิดข้อผิดพลาดในการเชื่อมต่อเพื่อบันทึกข้อมูล');
    }
    setSaving(false);
  };

  // --- 🌟 1. ฟังก์ชันเมื่อเลือกรูป (ให้โชว์ Preview แต่ยังไม่บันทึก) ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result); // เก็บรูปลง Preview State จะทำให้ปุ่มโผล่มา
      };
      reader.readAsDataURL(file);
    }
  };

  // --- 🌟 2. ฟังก์ชันกดยกเลิกรูปภาพ ---
  const handleCancelImage = () => {
    setPreviewImage(null); // ล้างค่า Preview ปุ่มจะหายไป รูปจะกลับไปเป็นอันเดิม
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- 🌟 3. ฟังก์ชันกดบันทึกรูปภาพ ---
  const handleSaveImage = async () => {
    setIsUploadingImage(true);
    await saveProfileData(null, previewImage); // เรียก API ตัวเดิมเพื่อส่งรูปไปบันทึก
    setIsUploadingImage(false);
    setPreviewImage(null); // เคลียร์ Preview
  };

  const handleSaveBankAccount = async (e) => {
    e.preventDefault(); 
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
        setFormBankBook(null);
        fetchProfileData(); 
      } else {
        alert("❌ " + data.error);
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

  const ListItem = ({ icon: Icon, title, value, isEmpty, onClickAdd, color }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ background: 'rgba(50, 100, 255, 0.1)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: color || '#3B82F6' }}>
          <Icon size={20} />
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '2px' }}>{title}</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: isEmpty ? '#64748B' : '#E2E8F0' }}>
            {isEmpty ? 'ไม่พบข้อมูล' : value}
          </div>
        </div>
      </div>
      <div>
        {isEmpty ? (
          <button onClick={onClickAdd} style={{ background: 'transparent', border: 'none', color: '#3B82F6', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <PlusCircle size={24} />
          </button>
        ) : (
          <div style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', padding: '4px 10px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
            <CheckCircle size={12} color="#10B981" /> บันทึกแล้ว
          </div>
        )}
      </div>
    </div>
  );

  if (loading) return <div style={{ textAlign: 'center', padding: '50px', color: '#fff' }}>กำลังโหลดข้อมูลโปรไฟล์...</div>;

  return (
    <div style={{ padding: '15px', paddingBottom: '80px', fontFamily: "'Prompt', sans-serif", background: '#0B0E14', minHeight: '100vh' }}>
      
      {/* ================= 1. ส่วนหัวโปรไฟล์ระบบ ================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#FFFFFF', fontWeight: 'bold' }}>โปรไฟล์ระบบ</h2>
        <span style={{ fontSize: '0.75rem', color: '#10B981', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <ShieldCheck size={14} /> ยืนยันตัวตนแล้ว
        </span>
      </div>

      {/* ================= 2. การ์ดผู้ใช้งาน (พร้อมปุ่มบันทึก/ยกเลิกรูปภาพ) ================= */}
      <div style={{ background: 'linear-gradient(180deg, #1A1F2B 0%, #12161F 100%)', border: '1px solid rgba(50, 100, 255, 0.3)', borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', marginBottom: '25px', position: 'relative' }}>
        
        {/* แถวข้อมูล + รูปโปรไฟล์ */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* กล่องรูปภาพ */}
          <div onClick={() => !previewImage && fileInputRef.current.click()} style={{ width: '80px', height: '80px', background: '#1E293B', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: previewImage ? 'default' : 'pointer', overflow: 'hidden', position: 'relative', border: '2px solid rgba(50, 100, 255, 0.5)' }}>
            {previewImage || profile.ProfileImageUrl ? (
              <img src={previewImage || profile.ProfileImageUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <User size={35} color="#94A3B8" />
            )}
            {!previewImage && (
              <div style={{ position: 'absolute', bottom: 0, right: 0, background: 'rgba(0,0,0,0.7)', width: '100%', height: '30%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Camera size={12} color="#fff" />
              </div>
            )}
          </div>
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }} />

          <div>
            <div style={{ color: '#3B82F6', fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '4px' }}>ACCOUNT USER</div>
            <div style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '4px' }}>{username}</div>
            <div style={{ color: '#94A3B8', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '8px', display: 'inline-block' }}>ID: 1111</div>
          </div>
        </div>

        {/* 🌟 แถวปุ่ม บันทึก/ยกเลิก (แสดงเฉพาะตอนที่เลือกรูปใหม่มา Preview) */}
        {previewImage && (
          <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '5px' }}>
            <button onClick={handleCancelImage} disabled={isUploadingImage} style={{ flex: 1, padding: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s' }}>
              ยกเลิก
            </button>
            <button onClick={handleSaveImage} disabled={isUploadingImage} style={{ flex: 1, padding: '10px', background: 'linear-gradient(90deg, #3B82F6, #2563EB)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)', transition: 'all 0.3s' }}>
              {isUploadingImage ? 'กำลังบันทึก...' : 'บันทึกรูปภาพ'}
            </button>
          </div>
        )}

      </div>

      {/* ================= 3. รายการข้อมูล (List View) ================= */}
      <div style={{ background: 'linear-gradient(180deg, #1A1F2B 0%, #12161F 100%)', borderRadius: '20px', padding: '0 20px', border: '1px solid rgba(50, 100, 255, 0.2)', boxShadow: '0 4px 15px rgba(0,0,0,0.4)' }}>
        
        <ListItem icon={User} title="ชื่อ-นามสกุล" value={fullName} isEmpty={!fullName} onClickAdd={() => setIsNameModalOpen(true)} />
        <ListItem icon={Phone} title="เบอร์โทรศัพท์" value={profile.PhoneNumber} isEmpty={!profile.PhoneNumber} onClickAdd={() => alert("ระบบกำลังเปิดให้เพิ่มเบอร์ในภายหลัง")} />
        <ListItem icon={Mail} title="อีเมล (Email)" value="" isEmpty={true} onClickAdd={() => {}} />
        <ListItem icon={Calendar} title="วันเกิด" value="" isEmpty={true} onClickAdd={() => {}} />
        <ListItem icon={MapPin} title="ที่อยู่จัดส่งสินค้า" value="" isEmpty={true} onClickAdd={() => {}} />
        
        <ListItem 
          icon={Landmark} title="บัญชีธนาคารระบบ" 
          value={activeBank ? `${activeBank.BankName} (${activeBank.AccountNumber.slice(-4)})` : ''} 
          isEmpty={!activeBank} 
          onClickAdd={() => {
            if(!fullName) return alert('กรุณาเพิ่มชื่อ-นามสกุลของคุณก่อนครับ');
            setIsBankModalOpen(true);
          }} 
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ background: 'rgba(50, 100, 255, 0.1)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#3B82F6' }}><Store size={20} /></div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '2px' }}>ร้านค้าของฉัน</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#64748B' }}>ไม่พบข้อมูล</div>
            </div>
          </div>
          <button style={{ background: 'transparent', border: 'none', color: '#3B82F6', cursor: 'pointer' }}><PlusCircle size={24} /></button>
        </div>
      </div>

      <div style={{ marginTop: '25px' }}>
        <button onClick={handleLogout} style={{ width: '100%', padding: '15px', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '16px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'all 0.3s' }}>
          <LogOut size={20} /> ออกจากระบบ
        </button>
      </div>

      {/* ================= 🌟 POPUP: เพิ่มชื่อ-นามสกุล ================= */}
      {isNameModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(11, 14, 20, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px', boxSizing: 'border-box' }}>
          <div style={{ background: 'linear-gradient(180deg, #1A1F2B 0%, #12161F 100%)', border: '1px solid rgba(50, 100, 255, 0.3)', padding: '25px', borderRadius: '24px', width: '100%', maxWidth: '400px', position: 'relative', animation: 'slideUp 0.2s ease-out' }}>
            <button onClick={() => { setIsNameModalOpen(false); fetchProfileData(); }} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><X size={22} /></button>
            <h3 style={{ margin: '0 0 10px 0', color: '#FFFFFF', fontSize: '1.2rem' }}>เพิ่มชื่อ-นามสกุล</h3>
            
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#EF4444', padding: '12px', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '20px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong>คำเตือน:</strong> ชื่อนี้ต้องตรงกับบัญชีธนาคาร หากบันทึกแล้วจะไม่สามารถแก้ไขได้</span>
            </div>

            <form onSubmit={saveProfileData} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94A3B8', marginBottom: '5px' }}>ชื่อจริง</label>
                <input type="text" placeholder="กรอกชื่อจริง" value={profile.FirstName} onChange={(e) => setProfile({...profile, FirstName: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#0B0E14', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none' }} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94A3B8', marginBottom: '5px' }}>นามสกุล</label>
                <input type="text" placeholder="กรอกนามสกุล" value={profile.LastName} onChange={(e) => setProfile({...profile, LastName: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#0B0E14', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none' }} required />
              </div>

              <button type="submit" disabled={saving} style={{ width: '100%', padding: '14px', background: 'linear-gradient(90deg, #3B82F6, #2563EB)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', marginTop: '10px', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)' }}>
                {saving ? 'กำลังบันทึก...' : 'ยืนยันการบันทึก'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= 🌟 POPUP: เพิ่มบัญชีธนาคาร ================= */}
      {isBankModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(11, 14, 20, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px', boxSizing: 'border-box' }}>
          <div style={{ background: 'linear-gradient(180deg, #1A1F2B 0%, #12161F 100%)', border: '1px solid rgba(50, 100, 255, 0.3)', padding: '25px', borderRadius: '24px', width: '100%', maxWidth: '400px', position: 'relative', animation: 'slideUp 0.2s ease-out', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setIsBankModalOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><X size={22} /></button>
            
            <h3 style={{ margin: '0 0 15px 0', color: '#FFFFFF', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '4px', height: '20px', background: '#3B82F6', borderRadius: '4px', boxShadow: '0 0 8px rgba(59,130,246,0.5)' }}></span>
              เพิ่มบัญชีธนาคารใหม่
            </h3>

            <form onSubmit={handleSaveBankAccount} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94A3B8', marginBottom: '5px' }}>ธนาคาร</label>
                <select value={formBankCode} onChange={(e) => setFormBankCode(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#0B0E14', color: '#fff', fontSize: '0.95rem', outline: 'none' }} required>
                  <option value="" style={{color: '#000'}}>-- เลือกธนาคาร --</option>
                  {bankMasterList.map((b, idx) => (<option key={idx} value={b.BankCode} style={{color: '#000'}}>🏛️ {b.BankName}</option>))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94A3B8', marginBottom: '5px' }}>ชื่อบัญชี</label>
                <input type="text" value={fullName} readOnly style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.95rem', boxSizing: 'border-box', background: 'rgba(255,255,255,0.02)', color: '#64748B', cursor: 'not-allowed', outline: 'none' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94A3B8', marginBottom: '5px' }}>เลขที่บัญชี</label>
                <input type="text" placeholder="ระบุเลขบัญชีที่ถูกต้อง" value={formAccNumber} onChange={(e) => setFormAccountNumber(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#0B0E14', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none' }} required />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94A3B8', marginBottom: '5px' }}>อัปโหลดภาพหน้าสมุดบัญชี</label>
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '120px', border: '2px dashed rgba(50, 100, 255, 0.4)', borderRadius: '8px', cursor: 'pointer', background: 'rgba(50, 100, 255, 0.05)', position: 'relative', overflow: 'hidden' }}>
                  {formBankBook ? (
                    <img src={formBankBook} alt="Book Bank Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <>
                      <div style={{ color: '#3B82F6', marginBottom: '8px' }}>
                        <Camera size={24} />
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>คลิกเพื่อเลือกรูปภาพหน้าสมุด</span>
                    </>
                  )}
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

              <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '12px', borderRadius: '8px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <AlertCircle size={16} color="#3B82F6" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '0.75rem', color: '#93C5FD', lineHeight: '1.4' }}>
                  ระบบจะตรวจสอบชื่อบัญชีกับเอกสาร KYC หากชื่อไม่ตรงกันจะไม่สามารถใช้งานได้
                </span>
              </div>

              <button type="submit" disabled={saving} style={{ width: '100%', padding: '14px', background: 'linear-gradient(90deg, #3B82F6, #2563EB)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', marginTop: '5px', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)' }}>
                {saving ? 'กำลังบันทึก...' : 'ส่งข้อมูลตรวจสอบบัญชี'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}