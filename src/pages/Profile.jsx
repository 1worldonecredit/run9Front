import React, { useState, useEffect, useRef } from 'react';

import { User, Landmark, Phone, Mail, Calendar, MapPin, Store, PlusCircle, CheckCircle, ShieldCheck, LogOut, X, Camera, AlertCircle, MessageSquare } from 'lucide-react';



export default function Profile() {

  const [stats, setStats] = useState({ daysLeft: 0, isEligible: false, freeTicketsToday: 0, gameHistory: [] });

  const [profile, setProfile] = useState({ ProfileImageUrl: null, FirstName: '', LastName: '', PhoneNumber: '', IsPhoneVerified: false });



  const [activeBank, setActiveBank] = useState(null);

  const [bankMasterList, setBankMasterList] = useState([]);



  const [isBankModalOpen, setIsBankModalOpen] = useState(false);

  const [isNameModalOpen, setIsNameModalOpen] = useState(false);

  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);



  // 🌟 ตัวแปรรับค่าฟอร์มธนาคาร

  const [formBankCode, setFormBankCode] = useState('');

  const [formAccNumber, setFormAccountNumber] = useState('');

  const [formBankBook, setFormBankBook] = useState(null);



  const [phoneInput, setPhoneInput] = useState('');

  const [otpStep, setOtpStep] = useState(1);

  const [otpCode, setOtpCode] = useState('');



  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);



  const fileInputRef = useRef(null);

  const [previewImage, setPreviewImage] = useState(null);

  const [isUploadingImage, setIsUploadingImage] = useState(false);



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

        // 🌟 รับรายชื่อธนาคารที่ตรงกับประเทศแล้วมาเก็บไว้

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



  // ฟังก์ชันจัดการรูปโปรไฟล์

  const handleImageChange = (e) => {

    const file = e.target.files[0];

    if (file) {

      const reader = new FileReader();

      reader.onloadend = () => setPreviewImage(reader.result);

      reader.readAsDataURL(file);

    }

  };



  const handleCancelImage = () => {

    setPreviewImage(null);

    if (fileInputRef.current) fileInputRef.current.value = '';

  };



  const handleSaveImage = async () => {

    setIsUploadingImage(true);

    try {

      const res = await fetch('https://api.run9.app/api/user/update-profile', {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({

          username: username,

          imageBase64: previewImage,

          firstName: profile.FirstName,

          lastName: profile.LastName,

          phone: profile.PhoneNumber

        })

      });

      const data = await res.json();

      if (res.ok || data.success) {

        alert("อัปเดตโปรไฟล์สำเร็จ!");

        setPreviewImage(null);

        window.location.reload();

      } else alert('❌ เกิดข้อผิดพลาด: ' + (data.error || 'ไม่สามารถบันทึกได้'));

    } catch (err) {

      alert('⚠️ เกิดข้อผิดพลาดในการเชื่อมต่อ');

    }

    setIsUploadingImage(false);

  };



  // ฟังก์ชันบันทึกชื่อ-นามสกุล

  const saveProfileData = async (e) => {

    e.preventDefault();

    setSaving(true);

    try {

      const res = await fetch('https://api.run9.app/api/user/update-profile', {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({

          username: username,

          imageBase64: profile.ProfileImageUrl,

          firstName: profile.FirstName,

          lastName: profile.LastName,

          phone: profile.PhoneNumber

        })

      });

      const data = await res.json();

      if (res.ok || data.success) {

        alert("บันทึกชื่อ-นามสกุล สำเร็จ!");

        setIsNameModalOpen(false);

        fetchProfileData();

      } else alert('❌ เกิดข้อผิดพลาด: ' + (data.error || 'ไม่สามารถบันทึกได้'));

    } catch (err) {

      alert('⚠️ เกิดข้อผิดพลาดในการเชื่อมต่อเพื่อบันทึกข้อมูล');

    }

    setSaving(false);

  };



  // 🌟 ฟังก์ชันบันทึกบัญชีธนาคาร (อัปเดตส่งค่า bankCode แทนชื่อ)

  const handleSaveBankAccount = async (e) => {

    e.preventDefault();

    if (!formBankCode || !formAccNumber) return alert('กรุณากรอกข้อมูลให้ครบทุกช่องครับ');

    if (!formBankBook) return alert('กรุณาอัปโหลดภาพหน้าสมุดบัญชีด้วยครับ');



    setSaving(true);

    try {

      const res = await fetch('https://api.run9.app/api/user/bank', {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({

          username: username,

          bankCode: formBankCode, // 🌟 ส่ง BankCode ที่เลือกจาก Dropdown

          accNumber: formAccNumber,

          accName: fullName,

          bankBookImage: formBankBook

        })

      });

      const data = await res.json();



      if (data.success) {

        alert(data.message);

        setIsBankModalOpen(false);

        setFormBankCode('');

        setFormAccountNumber('');

        setFormBankBook(null);

        fetchProfileData();

      } else alert("❌ " + (data.error || data.message));

    } catch (err) {

      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');

    }

    setSaving(false);

  };



  // ระบบ OTP

  const requestOTP = async () => {

    if (!phoneInput || phoneInput.length < 8) return alert('กรุณากรอกเบอร์โทรที่ถูกต้อง');

    setSaving(true);

    try {

      const res = await fetch('https://api.run9.app/api/user/request-otp', {

        method: 'POST', headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({ username, phone: phoneInput })

      });

      const data = await res.json();

      if (data.success) {

        alert('ส่งรหัส OTP ไปยังเบอร์ของคุณแล้ว');

        setOtpStep(2);

      } else alert('❌ ส่ง OTP ล้มเหลว: ' + data.error);

    } catch (err) { alert('เชื่อมต่อ Gateway ไม่ได้'); }

    setSaving(false);

  };



  const verifyOTP = async () => {

    if (!otpCode || otpCode.length < 4) return alert('กรุณากรอก OTP ให้ครบ');

    setSaving(true);

    try {

      const res = await fetch('https://api.run9.app/api/user/verify-otp', {

        method: 'POST', headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({ username, phone: phoneInput, otp: otpCode })

      });

      const data = await res.json();

      if (data.success) {

        alert('✅ ยืนยันเบอร์โทรศัพท์สำเร็จ!');

        setIsPhoneModalOpen(false);

        fetchProfileData();

      } else alert('❌ รหัส OTP ไม่ถูกต้อง');

    } catch (err) { alert('เชื่อมต่อไม่สำเร็จ'); }

    setSaving(false);

  };



  const handleLogout = () => {

    if (window.confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {

      localStorage.removeItem('username');

      localStorage.removeItem('userProfile');

      window.location.href = './prelogin';

    }

  };



  const ListItem = ({ icon: Icon, title, value, isEmpty, onClickAdd, color, isVerified }) => (

    <div className="profile-list-item">

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>

        <div className="profile-list-icon" style={{ color: color || '#3B82F6' }}>

          <Icon size={20} />

        </div>

        <div>

          <div className="profile-list-title">{title}</div>

          <div className={`profile-list-value ${isEmpty ? 'empty' : ''}`}>

            {isEmpty ? 'ไม่พบข้อมูล' : value}

            {isVerified && <CheckCircle size={14} color="#10B981" style={{ marginLeft: '6px' }} />}

          </div>

        </div>

      </div>

      <div>

        {isEmpty ? (

          <button onClick={onClickAdd} className="profile-add-btn">

            <PlusCircle size={24} />

          </button>

        ) : (

          <div className="profile-badge-success">

            <CheckCircle size={12} color="#10B981" /> บันทึกแล้ว

          </div>

        )}

      </div>

    </div>

  );



  if (loading) return <div style={{ textAlign: 'center', padding: '50px', color: '#fff' }}>กำลังโหลดข้อมูลโปรไฟล์...</div>;



  return (

    <div style={{ padding: '15px', paddingBottom: '80px', fontFamily: "'Prompt', sans-serif", background: '#0B0E14', minHeight: '100vh' }}>



      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>

        <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#FFFFFF', fontWeight: 'bold' }}>โปรไฟล์ระบบ</h2>

        <span style={{ fontSize: '0.75rem', color: '#10B981', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold', border: '1px solid rgba(16, 185, 129, 0.2)' }}>

          <ShieldCheck size={14} /> ยืนยันตัวตนแล้ว

        </span>

      </div>



      <div className="profile-user-card">

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>

          <div onClick={() => !previewImage && fileInputRef.current.click()} className={`profile-image-container ${previewImage ? 'preview-mode' : ''}`}>

            {previewImage || profile.ProfileImageUrl ? (

              <img src={previewImage || profile.ProfileImageUrl} alt="Profile" className="profile-img" />

            ) : (

              <User size={35} color="#94A3B8" />

            )}

            {!previewImage && (

              <div className="profile-camera-overlay">

                <Camera size={14} color="#fff" />

              </div>

            )}

          </div>

          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }} />



          <div>

            <div style={{ color: '#3B82F6', fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '4px' }}>ACCOUNT USER</div>

            <div style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '4px' }}>{username}</div>

            <div style={{ color: '#94A3B8', fontSize: '0.8rem' }}>ID: {profile.Id || 'ไม่ระบุ'}</div>

          </div>

        </div>



        {previewImage && (

          <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '15px' }}>

            <button onClick={handleCancelImage} disabled={isUploadingImage} className="profile-btn-cancel">ยกเลิก</button>

            <button onClick={handleSaveImage} disabled={isUploadingImage} className="profile-btn-save">

              {isUploadingImage ? 'กำลังบันทึก...' : 'บันทึกรูปภาพ'}

            </button>

          </div>

        )}

      </div>



      <div className="profile-list-container">

        <ListItem icon={User} title="ชื่อ-นามสกุล" value={fullName} isEmpty={!fullName} onClickAdd={() => setIsNameModalOpen(true)} />

        <ListItem icon={Phone} title="เบอร์โทรศัพท์" value={profile.PhoneNumber} isEmpty={!profile.PhoneNumber} isVerified={profile.IsPhoneVerified} onClickAdd={() => { setOtpStep(1); setPhoneInput(''); setIsPhoneModalOpen(true); }} />

        <ListItem icon={Mail} title="อีเมล (Email)" value="" isEmpty={true} onClickAdd={() => { }} />

        <ListItem icon={Calendar} title="วันเกิด" value="" isEmpty={true} onClickAdd={() => { }} />

        <ListItem icon={MapPin} title="ที่อยู่จัดส่งสินค้า" value="" isEmpty={true} onClickAdd={() => { }} />



        <ListItem

          icon={Landmark} title="บัญชีธนาคารระบบ"

          value={activeBank ? `${activeBank.BankName} (${activeBank.AccountNumber.slice(-4)})` : ''}

          isEmpty={!activeBank}

          onClickAdd={() => {

            if (!fullName) return alert('กรุณาเพิ่มชื่อ-นามสกุลของคุณก่อนครับ');

            setIsBankModalOpen(true);

          }}

        />



        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>

            <div className="profile-list-icon" style={{ color: '#3B82F6' }}><Store size={20} /></div>

            <div>

              <div className="profile-list-title">ร้านค้าของฉัน</div>

              <div className="profile-list-value empty">ไม่พบข้อมูล</div>

            </div>

          </div>

          <button className="profile-add-btn"><PlusCircle size={24} /></button>

        </div>

      </div>



      <div style={{ marginTop: '25px' }}>

        <button onClick={handleLogout} className="profile-logout-btn">

          <LogOut size={20} /> ออกจากระบบ

        </button>

      </div>



      {/* ================= 🌟 POPUP: ยืนยันเบอร์โทร (OTP) ================= */}

      {isPhoneModalOpen && (

        <div className="profile-modal-overlay">

          <div className="profile-modal-content">

            <button onClick={() => setIsPhoneModalOpen(false)} className="profile-modal-close"><X size={22} /></button>

            <h3 className="profile-modal-title">ยืนยันเบอร์โทรศัพท์</h3>



            {otpStep === 1 ? (

              <div className="profile-form">

                <label className="profile-label">กรอกเบอร์โทรศัพท์มือถือ</label>

                <input type="tel" placeholder="เช่น 0812345678" value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} className="profile-input" required />

                <button onClick={requestOTP} disabled={saving} className="profile-btn-save mt-3">

                  {saving ? 'กำลังประมวลผล...' : 'ขอรับรหัส OTP'}

                </button>

              </div>

            ) : (

              <div className="profile-form">

                <div className="profile-warning-box bg-blue">

                  <MessageSquare size={16} />

                  <span>ระบบส่งรหัส OTP ไปที่ <b>{phoneInput}</b> แล้ว</span>

                </div>

                <label className="profile-label">รหัส OTP 6 หลัก</label>

                <input type="text" placeholder="กรอกรหัส OTP ที่ได้รับทาง SMS" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} className="profile-input" style={{ textAlign: 'center', letterSpacing: '3px', fontSize: '1.2rem', fontWeight: 'bold' }} required />

                <button onClick={verifyOTP} disabled={saving} className="profile-btn-save mt-3">

                  {saving ? 'กำลังตรวจสอบ...' : 'ยืนยันรหัส OTP'}

                </button>

                <button onClick={() => setOtpStep(1)} className="profile-btn-cancel mt-2">กลับไปแก้ไขเบอร์โทร</button>

              </div>

            )}

          </div>

        </div>

      )}



      {/* ================= 🌟 POPUP: เพิ่มชื่อ-นามสกุล ================= */}

      {isNameModalOpen && (

        <div className="profile-modal-overlay">

          <div className="profile-modal-content">

            <button onClick={() => setIsNameModalOpen(false)} className="profile-modal-close"><X size={22} /></button>

            <h3 className="profile-modal-title">เพิ่มชื่อ-นามสกุล</h3>



            <div className="profile-warning-box">

              <AlertCircle size={18} style={{ flexShrink: 0 }} />

              <span><strong>คำเตือน:</strong> ชื่อนี้ต้องตรงกับบัญชีธนาคาร หากบันทึกแล้วจะไม่สามารถแก้ไขได้</span>

            </div>



            <form onSubmit={saveProfileData} className="profile-form">

              <div>

                <label className="profile-label">ชื่อจริง</label>

                <input type="text" placeholder="กรอกชื่อจริง" value={profile.FirstName} onChange={(e) => setProfile({ ...profile, FirstName: e.target.value })} className="profile-input" required />

              </div>

              <div>

                <label className="profile-label">นามสกุล</label>

                <input type="text" placeholder="กรอกนามสกุล" value={profile.LastName} onChange={(e) => setProfile({ ...profile, LastName: e.target.value })} className="profile-input" required />

              </div>



              <button type="submit" disabled={saving} className="profile-btn-save mt-3">

                {saving ? 'กำลังบันทึก...' : 'ยืนยันการบันทึก'}

              </button>

            </form>

          </div>

        </div>

      )}



      {/* ================= 🌟 POPUP: เพิ่มบัญชีธนาคาร ================= */}

      {isBankModalOpen && (

        <div className="profile-modal-overlay">

          <div className="profile-modal-content" style={{ maxHeight: '90vh', overflowY: 'auto' }}>

            <button onClick={() => setIsBankModalOpen(false)} className="profile-modal-close"><X size={22} /></button>



            <h3 className="profile-modal-title">

              <span className="title-indicator"></span> เพิ่มบัญชีธนาคารใหม่

            </h3>



            <form onSubmit={handleSaveBankAccount} className="profile-form">

              <div>

                <label className="profile-label">ธนาคาร</label>

                {/* 🌟 แสดงธนาคารตามประเทศ ส่งค่า BankCode กลับไปหลังบ้าน */}

                <select value={formBankCode} onChange={(e) => setFormBankCode(e.target.value)} className="profile-select" required>

                  <option value="" style={{ color: '#000' }}>-- เลือกธนาคาร --</option>

                  {bankMasterList.map((b, idx) => (

                    <option key={idx} value={b.BankCode} style={{ color: '#000' }}>

                      🏛️ {b.BankName}

                    </option>

                  ))}

                </select>

              </div>



              <div>

                <label className="profile-label">ชื่อบัญชี</label>

                <input type="text" value={fullName} readOnly className="profile-input disabled" />

              </div>



              <div>

                <label className="profile-label">เลขที่บัญชี</label>

                <input type="text" placeholder="ระบุเลขบัญชีที่ถูกต้อง" value={formAccNumber} onChange={(e) => setFormAccountNumber(e.target.value)} className="profile-input" required />

              </div>



              <div>

                <label className="profile-label">อัปโหลดภาพหน้าสมุดบัญชี</label>

                <label className="profile-upload-box">

                  {formBankBook ? (

                    <img src={formBankBook} alt="Book Bank Preview" className="upload-preview" />

                  ) : (

                    <>

                      <div className="upload-icon"><Camera size={24} /></div>

                      <span className="upload-text">คลิกเพื่อเลือกรูปภาพหน้าสมุด</span>

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



              <div className="profile-warning-box bg-blue">

                <AlertCircle size={16} style={{ flexShrink: 0 }} />

                <span>ระบบจะตรวจสอบชื่อบัญชีกับเอกสาร KYC หากชื่อไม่ตรงกันจะไม่สามารถใช้งานได้</span>

              </div>



              <button type="submit" disabled={saving} className="profile-btn-save mt-2">

                {saving ? 'กำลังส่งข้อมูล...' : 'ส่งข้อมูลตรวจสอบบัญชี'}

              </button>

            </form>

          </div>

        </div>

      )}



    </div>

  );

}