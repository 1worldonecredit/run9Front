import React, { useState } from 'react';
import { Camera, MapPin, Store, FileText, CheckCircle } from 'lucide-react';
import './shop.css';

export default function RegisterShop() {
  const [formData, setFormData] = useState({
    shopName: '',
    category: '',
    otherCategory: '',
    // 🌟 เปลี่ยนมาใช้ Object เก็บค่า Checkbox เพื่อให้เลือกได้หลายข้อ
    options: {
      sellOnline: false,
      sellAtShop: false,
      sellAtHome: false,
      needDelivery: false,
      needMarketing: false,
    }
  });

  // จัดการพิมพ์ข้อความทั่วไป
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🌟 ฟังก์ชันจัดการ Checkbox โดยเฉพาะ
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      options: {
        ...prev.options,
        [name]: checked
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Data to send:", formData); // พิมพ์ดูค่าที่เลือกใน Console
    alert('ส่งข้อมูลสมัครเปิดร้านเรียบร้อยแล้ว รอแอดมินตรวจสอบครับ');
  };

  return (
    <div className="shop-container">
      <h2 style={{ color: '#CFA348', marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Store size={28} /> สมัครเปิดร้านค้า (Vendor)
      </h2>
      <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '30px' }}>
        กรุณากรอกข้อมูลและอัปโหลดรูปภาพให้ครบถ้วน เพื่อใช้ในการพิจารณาอนุมัติเปิดร้าน
      </p>

      <form onSubmit={handleSubmit}>
        
        {/* ส่วนที่ 1: ข้อมูลทั่วไป */}
        <div className="shop-card">
          <h3 className="shop-card-title"><FileText size={20} /> ข้อมูลร้านค้าและรูปแบบการขาย</h3>
          
          <div className="form-group">
            <label className="form-label">ชื่อร้านค้า (แสดงบนออนไลน์)</label>
            <input type="text" name="shopName" className="form-control" placeholder="ตั้งชื่อร้านของคุณ..." required onChange={handleInputChange} />
          </div>

          <div className="form-group">
            <label className="form-label">ประเภทร้านค้า / หมวดหมู่สินค้า</label>
            <select name="category" className="form-control" required onChange={handleInputChange}>
              <option value="">-- เลือกประเภทร้านค้า --</option>
              <option value="เครื่องดื่ม">ร้านเครื่องดื่ม</option>
              <option value="อาหารและเครื่องดื่ม">ร้านอาหาร และเครื่องดื่ม</option>
              <option value="สะดวกซื้อ">ร้านสะดวกซื้อ</option>
              <option value="สินค้าแฟชั่น">ร้านสินค้าแฟชั่น</option>
              <option value="เครื่องประดับ_แฟชั่น">ร้านเครื่องประดับ (ไม่ใช่ทองแท้)</option>
              <option value="เครื่องประดับ_แท้">ร้านเครื่องประดับที่เป็น ทองเป็นเพชร แท้</option>
              <option value="เครื่องสำอาง">ร้านเครื่องสำอาง</option>
              <option value="IT">ร้าน IT</option>
              <option value="อาหารสัตว์">ร้านอาหารสัตว์ และสัตว์เลี้ยง</option>
              <option value="รถจักรยานยนต์">ร้านขายรถจักรยานยนต์</option>
              <option value="วัสดุก่อสร้าง">ร้านขายวัสดุก่อสร้าง</option>
              <option value="other">อื่นๆ (โปรดระบุ)</option>
            </select>
          </div>

          {formData.category === 'other' && (
            <div className="form-group">
              <input type="text" name="otherCategory" className="form-control" placeholder="ระบุประเภทร้านค้าของคุณ..." required onChange={handleInputChange} />
            </div>
          )}

          {/* 🌟 ปรับปรุงใหม่: Checkbox เลือกรูปแบบการขายและบริการ (เลือกได้หลายข้อ) */}
          <div className="form-group" style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginTop: '25px' }}>
            <label className="form-label" style={{ marginBottom: '15px', color: '#fff', fontSize: '1rem' }}>รูปแบบการขายและบริการเสริม <span style={{ color: '#CFA348', fontSize: '0.8rem' }}>(เลือกได้มากกว่า 1 ข้อ)</span></label>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#94A3B8', cursor: 'pointer' }}>
                <input type="checkbox" name="sellOnline" checked={formData.options.sellOnline} onChange={handleCheckboxChange} style={{ width: '20px', height: '20px', accentColor: '#CFA348', cursor: 'pointer' }} />
                ขายออนไลน์
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#94A3B8', cursor: 'pointer' }}>
                <input type="checkbox" name="sellAtShop" checked={formData.options.sellAtShop} onChange={handleCheckboxChange} style={{ width: '20px', height: '20px', accentColor: '#CFA348', cursor: 'pointer' }} />
                ขายที่ร้าน
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#94A3B8', cursor: 'pointer' }}>
                <input type="checkbox" name="sellAtHome" checked={formData.options.sellAtHome} onChange={handleCheckboxChange} style={{ width: '20px', height: '20px', accentColor: '#CFA348', cursor: 'pointer' }} />
                ขายที่บ้าน
              </label>
              
              <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', margin: '5px 0' }}></div>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#94A3B8', cursor: 'pointer' }}>
                <input type="checkbox" name="needDelivery" checked={formData.options.needDelivery} onChange={handleCheckboxChange} style={{ width: '20px', height: '20px', accentColor: '#CFA348', cursor: 'pointer' }} />
                ต้องการบริการจัดส่ง
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#94A3B8', cursor: 'pointer' }}>
                <input type="checkbox" name="needMarketing" checked={formData.options.needMarketing} onChange={handleCheckboxChange} style={{ width: '20px', height: '20px', accentColor: '#CFA348', cursor: 'pointer' }} />
                ต้องการให้สนับสนุนทางการตลาด
              </label>
            </div>
          </div>

        </div>

        {/* ส่วนที่ 2: อัปโหลดรูปภาพ 6 รูป */}
        <div className="shop-card">
          <h3 className="shop-card-title"><Camera size={20} /> อัปโหลดภาพถ่าย (อย่างน้อย 6 ภาพ)</h3>
          
          <div className="image-upload-grid">
            {[
              { id: 'img1', label: '1. ภาพเจ้าของสินค้า' },
              { id: 'img2', label: '2. ภาพกำลังผลิต/สถานที่ผลิต' },
              { id: 'img3', label: '3. ภาพสินค้าพร้อมขาย' },
              { id: 'img4', label: '4. ภาพสินค้าบรรจุกล่องก่อนปิดกล่อง' },
              { id: 'img5', label: '5. ภาพสินค้าบรรจุพร้อมส่ง' },
              { id: 'img6', label: '6. เซลฟี่พร้อมบัตรประชาชน' },
            ].map((img) => (
              <label key={img.id} className="upload-box">
                <input type="file" accept="image/*" style={{ display: 'none' }} />
                <Camera size={30} color="#64748B" />
                <span className="upload-text">{img.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* ส่วนที่ 3: แผนที่ปักหมุด */}
        <div className="shop-card">
          <h3 className="shop-card-title"><MapPin size={20} /> พิกัดร้านค้า / สถานที่ผลิตจริง</h3>
          <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>โปรดปักหมุดตำแหน่งที่ตั้งให้ตรงกับความจริง เพื่อความสะดวกในการตรวจสอบและขนส่ง</p>
          
          <div className="map-placeholder">
            <MapPin size={40} color="#64748B" style={{ marginBottom: '10px' }} />
            <p>แผนที่ Google Maps จะแสดงตรงนี้ (รอใส่โค้ด API)</p>
          </div>
          
          <button type="button" style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', cursor: 'pointer' }}>
             ดึงพิกัดปัจจุบันของฉัน (GPS)
          </button>
        </div>

        <button type="submit" className="shop-submit-btn">
          <CheckCircle size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '5px' }} />
          ส่งคำขอเปิดร้านค้า
        </button>

      </form>
    </div>
  );
}