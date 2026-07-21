import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
// นำเข้า Icon สวยๆ เพิ่มเติม
import { MapPin, Camera, Store, AlertTriangle, Send, ImagePlus, CheckCircle2 } from 'lucide-react';
import './shop.css'; 

// ⚙️ ตั้งค่าขนาดแผนที่
const mapContainerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '12px', // โค้งมนขึ้น
  boxShadow: '0 4px 10px rgba(0,0,0,0.1)' // เพิ่มมิติให้แผนที่
};

// 📍 พิกัดเริ่มต้น (กรุงเทพฯ)
const defaultCenter = { lat: 13.7563, lng: 100.5018 };

// 🔗 URL ของ Backend
const API_URL = import.meta.env.VITE_API_URL;

export default function RegisterShop() {
  const [categories, setCategories] = useState([]);
  const [isLocationVerified, setIsLocationVerified] = useState(false);
  
  const [formData, setFormData] = useState({
    shopName: '',
    categoryId: '',
    sellOnline: false,
    sellAtStore: false,
    sellAtHome: false,
    deliveryService: false,
    marketingSupport: false
  });

  const [images, setImages] = useState({
    imageOwner: null,
    imageLocation: null,
    imageProductReady: null,
    imagePackaging: null,
    imageReadyToShip: null,
    imageIdCard: null
  });

  // 🌟 State ใหม่: สำหรับเก็บลิงก์รูป Preview
  const [imagePreviews, setImagePreviews] = useState({});

  const [markerPos, setMarkerPos] = useState(defaultCenter);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/api/shop-categories`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // 📸 อัปเดตฟังก์ชันรูปภาพ ให้สร้าง Preview URL
  const handleImageChange = (e, fieldName) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImages(prev => ({ ...prev, [fieldName]: file }));
      
      // สร้าง URL ชั่วคราวเพื่อแสดงภาพ Preview
      setImagePreviews(prev => ({ ...prev, [fieldName]: URL.createObjectURL(file) }));
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setMarkerPos(pos); 
          setIsLocationVerified(true); 
        },
        () => {
          alert("คุณไม่อนุญาตให้เข้าถึงตำแหน่ง เราไม่สามารถบันทึกร้านค้าได้ครับ");
          setIsLocationVerified(false); 
        }
      );
    }
  };

  const onMapClick = (e) => {
    setMarkerPos({ lat: e.latLng.lat(), lng: e.latLng.lng() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLocationVerified) {
        alert("กรุณากดปุ่ม '📍 ดึงพิกัดปัจจุบันของฉัน (GPS)' และกดอนุญาต ก่อนทำการบันทึกข้อมูลครับ");
        return; 
    }
    
    const submitData = new FormData();
    Object.keys(formData).forEach(key => submitData.append(key, formData[key]));
    submitData.append('lat', markerPos.lat);
    submitData.append('lng', markerPos.lng);
    
    Object.keys(images).forEach(key => {
      if (images[key]) submitData.append(key, images[key]);
    });

    try {
      const response = await fetch(`${API_URL}/api/register-shop`, {
        method: 'POST',
        body: submitData
      });
      const result = await response.json();
      if (response.ok) {
        alert("ส่งข้อมูลเปิดร้านสำเร็จ!");
      } else {
        alert("เกิดข้อผิดพลาด: " + result.error);
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    }
  };

  // 🎨 ตั้งค่า Style ที่ใช้ซ้ำ
  const cardStyle = {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '20px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
    border: '1px solid #f3f4f6'
  };

  const headerStyle = {
    marginTop: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#1f2937',
    borderBottom: '2px solid #f3f4f6',
    paddingBottom: '12px',
    marginBottom: '20px'
  };

  return (
    <div className="shop-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', background: '#f8fafc', borderRadius: '20px' }}>
      <form onSubmit={handleSubmit}>
        
        {/* ส่วนที่ 1: ข้อมูลร้านค้า */}
        <div style={cardStyle}>
          <h3 style={headerStyle}>
            <Store size={22} color="#3b82f6" /> ข้อมูลร้านค้าและรูปแบบการขาย
          </h3>
          
          <label style={{fontSize: '14px', fontWeight: 'bold', color: '#4b5563', display: 'block', marginBottom: '8px'}}>ชื่อร้านค้า (แสดงบนออนไลน์)</label>
          <input 
            type="text" 
            name="shopName"
            value={formData.shopName}
            onChange={handleChange}
            className="shop-input" 
            placeholder="ตั้งชื่อร้านของคุณ..." 
            style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', marginBottom: '16px', outline: 'none', transition: 'border 0.3s'}}
            required 
          />
          
          <label style={{fontSize: '14px', fontWeight: 'bold', color: '#4b5563', display: 'block', marginBottom: '8px'}}>ประเภทธุรกิจ / หมวดหมู่สินค้า</label>
          <select 
            name="categoryId" 
            value={formData.categoryId} 
            onChange={handleChange} 
            style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#fff', outline: 'none'}}
            required
          >
            <option value="">-- เลือกประเภทร้านค้า --</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.category_name}</option>
            ))}
          </select>

          <div style={{marginTop: '20px', background: '#f0f9ff', padding: '16px', borderRadius: '8px', border: '1px solid #bae6fd'}}>
            <label style={{fontWeight: 'bold', marginBottom: '12px', display: 'block', color: '#0369a1'}}>รูปแบบการขายและบริการเสริม:</label>
            <div style={{display: 'flex', gap: '15px', flexWrap: 'wrap', fontSize: '14px', color: '#334155'}}>
              <label style={{display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer'}}><input type="checkbox" name="sellOnline" checked={formData.sellOnline} onChange={handleChange} /> ขายออนไลน์</label>
              <label style={{display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer'}}><input type="checkbox" name="sellAtStore" checked={formData.sellAtStore} onChange={handleChange} /> ขายที่ร้าน</label>
              <label style={{display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer'}}><input type="checkbox" name="sellAtHome" checked={formData.sellAtHome} onChange={handleChange} /> ขายที่บ้าน</label>
              <label style={{display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer'}}><input type="checkbox" name="deliveryService" checked={formData.deliveryService} onChange={handleChange} /> ต้องการบริการจัดส่ง</label>
              <label style={{display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer'}}><input type="checkbox" name="marketingSupport" checked={formData.marketingSupport} onChange={handleChange} /> ให้สนับสนุนทางตลาด</label>
            </div>
          </div>
        </div>

        {/* ส่วนที่ 2: อัปโหลดรูปภาพ พร้อม Preview */}
        <div style={cardStyle}>
          <h3 style={headerStyle}>
            <Camera size={22} color="#ec4899" /> อัปโหลดภาพถ่าย
          </h3>
          
          {/* 🛑 ป้ายเตือนเงื่อนไข */}
          <div style={{background: '#fef2f2', border: '1px solid #f87171', borderRadius: '8px', padding: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#b91c1c'}}>
            <AlertTriangle size={24} style={{flexShrink: 0}} />
            <span style={{fontSize: '14px', fontWeight: 'bold'}}>
              คำเตือน: ถ้ารูปไม่ตรงตามเงื่อนไข และไม่ครบ ร้านคุณจะไม่ได้รับการอนุมัติให้เปิด
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
            {[
              { id: 'imageOwner', label: '1. ภาพเจ้าของสินค้า' },
              { id: 'imageLocation', label: '2. ภาพกำลังผลิต/สถานที่' },
              { id: 'imageProductReady', label: '3. ภาพสินค้าพร้อมขาย' },
              { id: 'imagePackaging', label: '4. ภาพสินค้าบรรจุกล่อง' },
              { id: 'imageReadyToShip', label: '5. ภาพพร้อมจัดส่ง' },
              { id: 'imageIdCard', label: '6. เซลฟี่พร้อมบัตร ปชช.' }
            ].map((imgField) => (
              <div key={imgField.id} style={{ position: 'relative', height: '140px', borderRadius: '12px', overflow: 'hidden', border: imagePreviews[imgField.id] ? '2px solid #22c55e' : '2px dashed #cbd5e1', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease', cursor: 'pointer', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
                
                {imagePreviews[imgField.id] ? (
                  // ✅ แสดงภาพ Preview
                  <>
                    <img src={imagePreviews[imgField.id]} alt={imgField.label} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                    <div style={{position: 'absolute', bottom: 0, width: '100%', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '11px', padding: '6px', textAlign: 'center', backdropFilter: 'blur(2px)'}}>
                       {imgField.label}
                    </div>
                    <CheckCircle2 size={24} color="#22c55e" style={{position: 'absolute', top: '8px', right: '8px', background: '#fff', borderRadius: '50%'}} />
                  </>
                ) : (
                  // ❌ กรณีภาพว่างเปล่า
                  <div style={{padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#94a3b8'}}>
                    <ImagePlus size={32} style={{ marginBottom: '8px' }} /> 
                    <span style={{fontSize: '12px', textAlign: 'center', lineHeight: '1.4'}}>{imgField.label}</span>
                  </div>
                )}
                
                <input 
                  type="file" 
                  accept="image/*"
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} 
                  onChange={(e) => handleImageChange(e, imgField.id)} 
                  required 
                />
              </div>
            ))}
          </div>
        </div>

        {/* ส่วนที่ 3: แผนที่ */}
        <div style={cardStyle}>
          <h3 style={headerStyle}>
            <MapPin size={22} color="#10b981" /> พิกัดร้านค้า / สถานที่ผลิตจริง
          </h3>
          <p style={{fontSize: '13px', color: '#64748b', marginBottom: '16px'}}>📍 โปรดคลิกบนแผนที่เพื่อปักหมุดตำแหน่งที่ตั้งให้ตรงกับความจริง</p>
          
          <div style={{marginBottom: '20px', borderRadius: '12px', overflow: 'hidden'}}>
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={markerPos}
                zoom={14}
                onClick={onMapClick}
                options={{ disableDefaultUI: true, zoomControl: true }}
              >
                <Marker position={markerPos} />
              </GoogleMap>
            ) : (
              <p style={{textAlign: 'center', padding: '40px', background: '#f1f5f9', borderRadius: '12px', color: '#64748b'}}>กำลังโหลดแผนที่...</p>
            )}
          </div>
          
          <button 
            type="button" 
            onClick={handleGetLocation} 
            style={{width: '100%', padding: '14px', background: isLocationVerified ? '#dcfce7' : '#eff6ff', color: isLocationVerified ? '#166534' : '#2563eb', borderRadius: '10px', border: isLocationVerified ? '2px solid #22c55e' : '2px solid #3b82f6', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.3s'}}
          >
            {isLocationVerified ? <CheckCircle2 size={20} /> : <MapPin size={20} />} 
            {isLocationVerified ? 'ดึงพิกัดสำเร็จแล้ว' : 'ดึงพิกัดปัจจุบันของฉัน (GPS)'}
          </button>
        </div>

        <button 
          type="submit" 
          style={{width: '100%', padding: '16px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', fontWeight: 'bold', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)', transition: 'transform 0.2s'}}
          onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Send size={24} /> ส่งคำขอเปิดร้านค้า
        </button>

      </form>
    </div>
  );
}