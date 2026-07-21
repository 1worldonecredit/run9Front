import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { MapPin, Camera } from 'lucide-react';
import './shop.css'; // เรียกใช้ CSS ที่เราเพิ่งสร้าง

// ⚙️ ตั้งค่าขนาดแผนที่
const mapContainerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '8px'
};

// 📍 พิกัดเริ่มต้น (กรุงเทพฯ)
const defaultCenter = {
  lat: 13.7563,
  lng: 100.5018
};

// 🔗 URL ของ Backend (ดึงจาก Railway ของคุณ)
const API_URL = import.meta.env.VITE_API_URL;
// 3. State เช็กว่าผู้ใช้ให้พิกัด GPS จริงๆ แล้วหรือยัง (เริ่มต้นคือ false = ยังไม่ให้)
const [isLocationVerified, setIsLocationVerified] = useState(false);
export default function RegisterShop() {
  // 1. State หมวดหมู่ร้านค้า
  const [categories, setCategories] = useState([]);
  
  // 2. State ฟอร์มข้อมูล Text
  const [formData, setFormData] = useState({
    shopName: '',
    categoryId: '',
    sellOnline: false,
    sellAtStore: false,
    sellAtHome: false,
    deliveryService: false,
    marketingSupport: false
  });

  // 3. State รูปภาพ (6 ช่อง)
  const [images, setImages] = useState({
    imageOwner: null,
    imageLocation: null,
    imageProductReady: null,
    imagePackaging: null,
    imageReadyToShip: null,
    imageIdCard: null
  });

  // 4. State แผนที่
  const [markerPos, setMarkerPos] = useState(defaultCenter);

  // 🗺️ โหลด API แผนที่
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    // ดึงคีย์จากไฟล์ .env
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  // 🔄 ดึงข้อมูลหมวดหมู่เมื่อเปิดหน้าเว็บ
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

  // 📝 จัดการเมื่อพิมพ์หรือคลิก Checkbox
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // 📸 จัดการเมื่ออัปโหลดรูป
  const handleImageChange = (e, fieldName) => {
    if (e.target.files && e.target.files[0]) {
      setImages(prev => ({
        ...prev,
        [fieldName]: e.target.files[0]
      }));
    }
  };

  // 📍 ดึงพิกัด GPS ปัจจุบัน
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // ถ้าผู้ใช้อนุญาตและดึงพิกัดสำเร็จ
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setMarkerPos(pos); // ขยับหมุดไปที่ใหม่
          setIsLocationVerified(true); // ✅ ยืนยันว่าได้พิกัดจริงแล้ว!
        },
        () => {
          // ถ้าผู้ใช้กด Block (ไม่อนุญาต)
          alert("คุณไม่อนุญาตให้เข้าถึงตำแหน่ง เราไม่สามารถบันทึกร้านค้าได้ครับ");
          setIsLocationVerified(false); // ❌ ไม่อนุญาต
        }
      );
    }
  };

  // 📍 คลิกลากหมุดบนแผนที่
  const onMapClick = (e) => {
    setMarkerPos({
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    });
  };

  // 🚀 กดส่งข้อมูลฟอร์ม
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // สร้างกล่องบรรจุข้อมูลแบบ FormData (เพื่อส่งไฟล์ภาพได้)
    const submitData = new FormData();
    
    // ใส่ข้อมูลข้อความ
    Object.keys(formData).forEach(key => submitData.append(key, formData[key]));
    
    // ใส่พิกัด Latitude, Longitude
    submitData.append('lat', markerPos.lat);
    submitData.append('lng', markerPos.lng);
    
    // ใส่ไฟล์ภาพทั้ง 6 ไฟล์
    Object.keys(images).forEach(key => {
      if (images[key]) {
        submitData.append(key, images[key]);
      }
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

  return (
    <div className="shop-container">
      <form onSubmit={handleSubmit}>
        
        {/* ส่วนที่ 1: ข้อมูลร้านค้า */}
        <div className="shop-card">
          <h3 style={{marginTop: 0}}>📄 ข้อมูลร้านค้าและรูปแบบการขาย</h3>
          
          <label style={{fontSize: '14px'}}>ชื่อร้านค้า (แสดงบนออนไลน์)</label>
          <input 
            type="text" 
            name="shopName"
            value={formData.shopName}
            onChange={handleChange}
            className="shop-input" 
            placeholder="ตั้งชื่อร้านของคุณ..." 
            required 
          />
          
          <label style={{fontSize: '14px'}}>ประเภทธุรกิจ / หมวดหมู่สินค้า</label>
          <select 
            name="categoryId" 
            value={formData.categoryId} 
            onChange={handleChange} 
            className="shop-dropdown" 
            required
          >
            <option value="">-- เลือกประเภทร้านค้า --</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.category_name}</option>
            ))}
          </select>

          <div style={{marginTop: '15px', fontSize: '14px'}}>
            <label style={{fontWeight: 'bold', marginBottom: '8px', display: 'block'}}>รูปแบบการขายและบริการเสริม:</label>
            <div style={{display: 'flex', gap: '15px', flexWrap: 'wrap'}}>
              <label><input type="checkbox" name="sellOnline" checked={formData.sellOnline} onChange={handleChange} /> ขายออนไลน์</label>
              <label><input type="checkbox" name="sellAtStore" checked={formData.sellAtStore} onChange={handleChange} /> ขายที่ร้าน</label>
              <label><input type="checkbox" name="sellAtHome" checked={formData.sellAtHome} onChange={handleChange} /> ขายที่บ้าน</label>
              <label><input type="checkbox" name="deliveryService" checked={formData.deliveryService} onChange={handleChange} /> ต้องการบริการจัดส่ง</label>
              <label><input type="checkbox" name="marketingSupport" checked={formData.marketingSupport} onChange={handleChange} /> ให้สนับสนุนทางตลาด</label>
            </div>
          </div>
        </div>

        {/* ส่วนที่ 2: อัปโหลดรูปภาพ */}
        <div className="shop-card">
          <h3 style={{marginTop: 0}}>📸 อัปโหลดภาพถ่าย (อย่างน้อย 6 ภาพ)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            
            {[
              { id: 'imageOwner', label: '1. ภาพเจ้าของสินค้า' },
              { id: 'imageLocation', label: '2. ภาพกำลังผลิต/สถานที่' },
              { id: 'imageProductReady', label: '3. ภาพสินค้าพร้อมขาย' },
              { id: 'imagePackaging', label: '4. ภาพสินค้าบรรจุกล่อง' },
              { id: 'imageReadyToShip', label: '5. ภาพพร้อมจัดส่ง' },
              { id: 'imageIdCard', label: '6. เซลฟี่พร้อมบัตร ปชช.' }
            ].map((imgField) => (
              <label key={imgField.id} style={{ border: '1px dashed #666', padding: '10px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', fontSize: '12px' }}>
                <Camera size={24} style={{ display: 'block', margin: '0 auto 5px', color: '#999' }} /> 
                <span>{imgField.label}</span>
                <input type="file" style={{ display: 'none' }} onChange={(e) => handleImageChange(e, imgField.id)} required />
                {images[imgField.id] && <div style={{color: '#4ade80', marginTop: '5px', fontWeight: 'bold'}}>✔️ อัปโหลดแล้ว</div>}
              </label>
            ))}

          </div>
        </div>

        {/* ส่วนที่ 3: แผนที่ */}
        <div className="shop-card">
          <h3 style={{marginTop: 0, display: 'flex', alignItems: 'center', gap: '5px'}}>
            <MapPin size={20} /> พิกัดร้านค้า / สถานที่ผลิตจริง
          </h3>
          <p style={{fontSize: '12px', color: '#aaa', marginBottom: '15px'}}>โปรดคลิกบนแผนที่เพื่อปักหมุดตำแหน่งที่ตั้งให้ตรงกับความจริง</p>
          
          <div className="map-wrapper" style={{marginBottom: '15px'}}>
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
              <p style={{textAlign: 'center', padding: '20px'}}>กำลังโหลดแผนที่...</p>
            )}
          </div>
          
          <button 
            type="button" 
            onClick={getCurrentLocation} 
            style={{width: '100%', padding: '12px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '8px', border: '1px solid #3b82f6', cursor: 'pointer', fontWeight: 'bold'}}
          >
            📍 ดึงพิกัดปัจจุบันของฉัน (GPS)
          </button>
        </div>

        <button 
          type="submit" 
          style={{width: '100%', padding: '15px', background: '#eab308', color: '#000', fontWeight: 'bold', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '16px', marginBottom: '40px'}}
        >
          ✔️ ส่งคำขอเปิดร้านค้า
        </button>

      </form>
    </div>
  );
}