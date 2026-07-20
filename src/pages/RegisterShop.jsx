import React, { useState } from 'react';
import { Camera, MapPin, Store, FileText, CheckCircle, Upload } from 'lucide-react';
import './shop.css'; // นำเข้า CSS ที่เราเพิ่งสร้าง

export default function RegisterShop() {
  const [formData, setFormData] = useState({
    shopName: '',
    platform: '',
    category: '',
    otherCategory: '',
    vendorType: '',
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('ส่งข้อมูลสมัครเปิดร้านเรียบร้อยแล้ว รอแอดมินตรวจสอบครับ');
    // โค้ดส่งเข้า Backend จะทำในสเต็ปต่อไป
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
          <h3 className="shop-card-title"><FileText size={20} /> ข้อมูลร้านค้าและแพลตฟอร์ม</h3>
          
          <div className="form-group">
            <label className="form-label">ชื่อร้านค้า (แสดงบนออนไลน์)</label>
            <input type="text" name="shopName" className="form-control" placeholder="ตั้งชื่อร้านของคุณ..." required onChange={handleInputChange} />
          </div>

          <div className="form-group">
            <label className="form-label">รูปแบบ/แพลตฟอร์มการขาย</label>
            <select name="platform" className="form-control" required onChange={handleInputChange}>
              <option value="">-- เลือกแพลตฟอร์ม --</option>
              <option value="ขายออนไลน์">ขายออนไลน์ (มีชื่อร้าน/โลโก้)</option>
              <option value="ขายที่ร้าน">ขายที่ร้าน (มีหน้าร้าน)</option>
              <option value="ขายที่บ้าน">ขายที่บ้าน</option>
              <option value="ขายออนไลน์_ไม่มีร้าน">ขายสินค้าออนไลน์ ไม่มีร้านค้า</option>
              <option value="สินค้าเกษตร">สินค้าเกษตร ผลิตเองจากฟาร์ม จากสวน</option>
              <option value="สินค้าแปรรูปเกษตร">สินค้าแปรรูปเกษตร</option>
              <option value="สินค้า_OTOP">สินค้า OTOP</option>
              <option value="สินค้ากลุ่มแม่บ้าน">สินค้า กลุ่มแม่บ้าน</option>
              <option value="งานฝีมือ_หัตถกรรม">สินค้า งานฝีมือ หัตถกรรม</option>
              <option value="ขนมไทย_อาหารไทย">ขนมไทย อาหารไทย</option>
            </select>
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

          <div className="form-group">
            <label className="form-label">ประเภทเจ้าของสินค้า (ต้องแนบเอกสารใบอนุญาต)</label>
            <select name="vendorType" className="form-control" required onChange={handleInputChange}>
              <option value="">-- เลือกประเภท --</option>
              <option value="SME">เจ้าของสินค้า SME</option>
              <option value="Industry">เจ้าของสินค้า อุตสาหกรรม</option>
              <option value="Importer">สินค้านำเข้า</option>
              <option value="Distributor">ตัวแทนจำหน่าย</option>
            </select>
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

          {/* อัปโหลดเอกสารสำหรับประเภทเจ้าของสินค้า */}
          {formData.vendorType !== '' && (
            <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(239, 68, 68, 0.1)', border: '1px dashed #EF4444', borderRadius: '12px' }}>
               <label className="form-label" style={{ color: '#EF4444' }}>เอกสารประกอบ: ใบอนุญาตสำหรับ {formData.vendorType}</label>
               <input type="file" className="form-control" />
            </div>
          )}
        </div>

        {/* ส่วนที่ 3: แผนที่ปักหมุด */}
        <div className="shop-card">
          <h3 className="shop-card-title"><MapPin size={20} /> พิกัดร้านค้า / สถานที่ผลิตจริง</h3>
          <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>โปรดปักหมุดตำแหน่งที่ตั้งให้ตรงกับความจริง เพื่อความสะดวกในการตรวจสอบและขนส่ง</p>
          
          {/* 🌟 พื้นที่เตรียมต่อ Google Maps API */}
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