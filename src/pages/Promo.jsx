import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, Globe, ArrowRight } from 'lucide-react';

export default function Promo() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referrer = searchParams.get('ref') || ''; // ดึงรหัส/ชื่อคนชวนจาก URL
  
  const [lang, setLang] = useState('TH'); // State เปลี่ยนภาษา

  // ข้อมูลภาษา (ไทย / ลาว)
  const content = {
    TH: {
      title: "โอกาสเปลี่ยนชีวิตมาถึงแล้ว!",
      subtitle: "เกมสอยดาวพารวย 🌟",
      description: "ลงทะเบียนวันนี้ รับสิทธิ์สอยดาว ฟรี! ทุกวัน ตลอด 1 เดือนเต็ม ลุ้นรับเงินรางวัลแจ็คพ็อตมากมายตั้งแต่ 500,000 กีบ จนถึง 40,000,000 กีบ!",
      cta: "ลงทะเบียนรับสิทธิ์ฟรีเลย!",
      login: "มีบัญชีอยู่แล้ว? เข้าสู่ระบบ",
      invitedBy: "คุณได้รับคำเชิญพิเศษจาก:"
    },
    LA: {
      title: "ໂອກາດປ່ຽນຊີວິດມາເຖິງແລ້ວ!",
      subtitle: "ເກມສອຍດາວພາດີ 🌟",
      description: "ລົງທະບຽນມື້ນີ້ ຮັບສິດສອຍດາວ ຟຣີ! ທຸກມື້ ຕະຫຼອດ 1 ເດືອນເຕັມ ລຸ້ນຮັບເງິນລາງວັນແຈັກພອດຫຼວງຫຼາຍຕັ້ງແຕ່ 500,000 ກີບ ຈົນເຖິງ 40,000,000 ກີບ!",
      cta: "ລົງທະບຽນຮັບສິດຟຣີເລີຍ!",
      login: "ມີບັນຊີແລ້ວບໍ? ເຂົ້າສູ່ລະບົບ",
      invitedBy: "ທ່ານໄດ້ຮັບຄຳເຊີນພິເສດຈາກ:"
    }
  };

  const handleRegister = () => {
    // ส่งผู้ใช้ไปหน้าสมัครสมาชิก พร้อมแนบรหัสคนชวนไปด้วย
    navigate(`/register?ref=${referrer}`);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#000', // พื้นหลังสีดำตัดทอง
      color: 'white',
      fontFamily: 'sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* 🌟 ส่วนภาพพื้นหลัง AI (ดึงภาพจากโฟลเดอร์ public) */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'url("/luxury-promo.jpg")', // ใส่รูปที่สร้างมาตรงนี้
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.4, // ดรอปความสว่างภาพลงเพื่อให้ตัวหนังสือเด่น
        zIndex: 0
      }} />

      {/* 🌟 ส่วนเนื้อหา (Content) */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '500px', margin: '0 auto', padding: '30px 20px', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        
        {/* ปุ่มเปลี่ยนภาษา */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
          <button 
            onClick={() => setLang(lang === 'TH' ? 'LA' : 'TH')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.2)', border: '1px solid #D4AF37', color: 'white', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', backdropFilter: 'blur(5px)' }}
          >
            <Globe size={16} /> {lang === 'TH' ? 'ພາສາລາວ' : 'ภาษาไทย'}
          </button>
        </div>

        {/* ข้อความโฆษณา */}
        <div style={{ marginTop: 'auto', marginBottom: 'auto', textAlign: 'center' }}>
          <h1 style={{ color: '#FFD700', fontSize: '2.5rem', marginBottom: '10px', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
            {content[lang].title}
          </h1>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '20px' }}>{content[lang].subtitle}</h2>
          
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '40px', background: 'rgba(0,0,0,0.6)', padding: '20px', borderRadius: '12px', border: '1px solid #D4AF37' }}>
            {content[lang].description}
          </p>

          {/* แสดงชื่อคนชวน (ถ้ามี) */}
          {referrer && (
            <div style={{ marginBottom: '20px', color: '#ccc', fontSize: '0.9rem' }}>
              {content[lang].invitedBy} <strong style={{ color: '#FFD700', fontSize: '1.1rem' }}>{referrer}</strong>
            </div>
          )}

          {/* ปุ่ม Call to Action */}
          <button 
            onClick={handleRegister}
            style={{ width: '100%', padding: '18px', fontSize: '1.2rem', fontWeight: 'bold', borderRadius: '30px', border: 'none', background: 'linear-gradient(90deg, #D4AF37, #FFA500)', color: 'black', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)' }}
          >
            <Sparkles size={24} /> {content[lang].cta} <ArrowRight size={20} />
          </button>

          <div 
            onClick={() => navigate('/login')}
            style={{ marginTop: '20px', color: '#ccc', textDecoration: 'underline', cursor: 'pointer' }}
          >
            {content[lang].login}
          </div>
        </div>
      </div>
    </div>
  );
}