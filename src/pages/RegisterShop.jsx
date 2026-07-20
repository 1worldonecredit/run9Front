import React, { useState, useEffect, useCallback } from 'react';
import { Camera, MapPin, Store, FileText, CheckCircle } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import './shop.css';

// 🌟 ตั้งค่าขนาดแผนที่
const mapContainerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.1)'
};

const defaultCenter = { lat: 13.7563, lng: 100.5018 };

export default function RegisterShop() {
  // State สำหรับเก็บข้อมูลฟอร์ม
  const [formData, setFormData] = useState({
    shopName: '',
    category: '',
    otherCategory: '',
    latitude: null,  
    longitude: null, 
    options: {
      sellOnline: false,
      sellAtShop: false,
      sellAtHome: false,
      needDelivery: false,
      needMarketing: false,
    }
  });

  // 🌟 State สำหรับเก็บไฟล์รูปภาพทั้ง 6
  const [files, setFiles] = useState({
    imageOwner: null,
    imageLocation: null,
    imageProductReady: null,
    imagePackaging: null,
    imageReadyToShip: null,
    imageIdCard: null
  });

  // State สำหรับหมวดหมู่ที่ดึงจาก DB
  const [categories, setCategories] = useState([]);
  const [markerPos, setMarkerPos] = useState(defaultCenter);
  const [isLoading, setIsLoading] = useState(false);

  // โหลด Google Maps API
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY 
  });

  // 🌟 ดึงหมวดหมู่จาก API เมื่อเปิดหน้านี้
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      // ⚠️ ต้องมี API ตัวนี้ที่หลังบ้านเพื่อดึงข้อมูลจากตาราง shop_categories
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/shop-categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      options: { ...prev.options, [name]: checked }
    }));
  };

  // 🌟 จัดการเมื่อลูกค้าเลือกไฟล์รูปภาพ
  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setFiles(prev => ({ ...prev, [fieldName]: file }));
    }
  };

  const onMarkerDragEnd = (e) => {
    const newLat = e.latLng.lat();
    const newLng = e.latLng.lng();
    setMarkerPos({ lat: newLat, lng: newLng });
    setFormData(prev => ({ ...prev, latitude: newLat, longitude: newLng }));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setMarkerPos(pos);
          setFormData(prev => ({ ...prev, latitude: pos.lat, longitude: pos.lng }));
        },
        (error) => {
          alert("ไม่สามารถดึงตำแหน่งได้ กรุณาอนุญาตการเข้าถึงตำแหน่ง (Location)");
        }
      );
    } else {
      alert("บราวเซอร์ของคุณไม่รองรับการดึงพิกัด GPS ครับ");
    }
  };

  // 🌟 ฟังก์ชันส่งข้อมูลไปยัง API
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.latitude || !formData.longitude) {
      alert("กรุณาปักหมุดตำแหน่งร้านค้าบนแผนที่ก่อนครับ");
      return;
    }

    setIsLoading(true);

    try {
      // ใช้ FormData เพราะมีการส่งไฟล์รูปภาพ
      const dataToSend = new FormData();
      
      // ใส่ข้อมูล Text
      dataToSend.append('userId', 1); // เปลี่ยนเป็น User ID จริงในอนาคต
      dataToSend.append('shopName', formData.shopName);
      dataToSend.append('categoryId', formData.category);
      if (formData.category === 'other') dataToSend.append('otherCategory', formData.otherCategory);
      
      dataToSend.append('sellOnline', formData.options.sellOnline);
      dataToSend.append('sellAtShop', formData.options.sellAtShop);
      dataToSend.append('sellAtHome', formData.options.sellAtHome);
      dataToSend.append('needDelivery', formData.options.needDelivery);
      dataToSend.append('needMarketing', formData.options.needMarketing);
      
      dataToSend.append('latitude', formData.latitude);
      dataToSend.append('longitude', formData.longitude);

      // ใส่ข้อมูลไฟล์รูปภาพ
      if (files.imageOwner) dataToSend.append('imageOwner', files.imageOwner);
      if (files.imageLocation) dataToSend.append('imageLocation', files.imageLocation);
      if (files.imageProductReady) dataToSend.append('imageProductReady', files.imageProductReady);
      if (files.imagePackaging) dataToSend.append('imagePackaging', files.imagePackaging);
      if (files.imageReadyToShip) dataToSend.append('imageReadyToShip', files.imageReadyToShip);
      if (files.imageIdCard) dataToSend.append('imageIdCard', files.imageIdCard);

      // ยิง API
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/register-shop`, {
        method: 'POST',
        body: dataToSend, // ไม่ต้องตั้ง Headers Content-Type เพราะ Browser จะจัดการให้สำหรับ FormData
      });

      const result = await response.json();
      if (response.ok && result.success) {
        alert('ส่งคำขอเปิดร้านค้าเรียบร้อยแล้ว รอแอดมินตรวจสอบครับ');
        // อาจจะ Redirect ไปหน้าอื่นที่นี่
      } else {
        alert(result.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล');
      }

    } catch (error) {
      console.error("Submit Error:", error);
      alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    } finally {
      setIsLoading(false);
    }
  };

  // กำหนดฟิลด์รูปภาพเพื่อให้ loop สร้าง UI ได้ง่ายขึ้น
  const imageUploadFields = [
    { name: 'imageOwner', label: '1. ภาพเจ้าของสินค้า' },
    { name: 'imageLocation', label: '2. ภาพกำลังผลิต/สถานที่ผลิต' },
    { name: 'imageProductReady', label: '3. ภาพสินค้าพร้อมขาย' },
    { name: 'imagePackaging', label: '4. ภาพสินค้าบรรจุกล่องก่อนปิดกล่อง' },
    { name: 'imageReadyToShip', label: '5. ภาพสินค้าบรรจุพร้อมส่ง' },
    { name: 'imageIdCard', label: '6. เซลฟี่พร้อมบัตรประชาชน' },
  ];

  return (
    <div className="shop-container">
      <h2 className="shop-header-title">
        <Store size={28} /> สมัครเปิดร้านค้า (Vendor)
      </h2>
      <p className="shop-header-subtitle">
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
              {/* ดึงข้อมูลจากฐานข้อมูลมาแสดง */}
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.category_name}</option>
              ))}
              <option value="other">อื่นๆ (โปรดระบุ)</option>
            </select>
          </div>

          {formData.category === 'other' && (
            <div className="form-group">
              <input type="text" name="otherCategory" className="form-control" placeholder="ระบุประเภทร้านค้าของคุณ..." required onChange={handleInputChange} />
            </div>
          )}

          <div className="checkbox-group-container">
            <label className="form-label checkbox-group-label">รูปแบบการขายและบริการเสริม <span>(เลือกได้มากกว่า 1 ข้อ)</span></label>
            
            <div className="checkbox-list">
              <label className="checkbox-item">
                <input type="checkbox" name="sellOnline" checked={formData.options.sellOnline} onChange={handleCheckboxChange} /> ขายออนไลน์
              </label>
              <label className="checkbox-item">
                <input type="checkbox" name="sellAtShop" checked={formData.options.sellAtShop} onChange={handleCheckboxChange} /> ขายที่ร้าน
              </label>
              <label className="checkbox-item">
                <input type="checkbox" name="sellAtHome" checked={formData.options.sellAtHome} onChange={handleCheckboxChange} /> ขายที่บ้าน
              </label>
              
              <div className="checkbox-divider"></div>
              
              <label className="checkbox-item">
                <input type="checkbox" name="needDelivery" checked={formData.options.needDelivery} onChange={handleCheckboxChange} /> ต้องการบริการจัดส่ง
              </label>
              <label className="checkbox-item">
                <input type="checkbox" name="needMarketing" checked={formData.options.needMarketing} onChange={handleCheckboxChange} /> ต้องการให้สนับสนุนทางการตลาด
              </label>
            </div>
          </div>
        </div>

        {/* ส่วนที่ 2: อัปโหลดรูปภาพ 6 รูป */}
        <div className="shop-card">
          <h3 className="shop-card-title"><Camera size={20} /> อัปโหลดภาพถ่าย (อย่างน้อย 6 ภาพ)</h3>
          
          <div className="image-upload-grid">
            {imageUploadFields.map((field) => (
              <label key={field.name} className={`upload-box ${files[field.name] ? 'has-file' : ''}`}>
                <input 
                  type="file" 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  onChange={(e) => handleFileChange(e, field.name)} 
                />
                <Camera size={30} color={files[field.name] ? "#CFA348" : "#64748B"} />
                <span className="upload-text">
                  {files[field.name] ? 'เลือกไฟล์แล้ว ✔️' : field.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* ส่วนที่ 3: แผนที่ปักหมุด */}
        <div className="shop-card">
          <h3 className="shop-card-title"><MapPin size={20} /> พิกัดร้านค้า / สถานที่ผลิตจริง</h3>
          <p className="map-subtitle">
            โปรดปักหมุดตำแหน่งที่ตั้งให้ตรงกับความจริง (คุณสามารถลากหมุดสีแดงเพื่อเปลี่ยนตำแหน่งได้)
          </p>
          
          <div className="map-wrapper">
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={markerPos}
                zoom={14}
                options={{ disableDefaultUI: true, zoomControl: true }}
              >
                <Marker 
                  position={markerPos} 
                  draggable={true} 
                  onDragEnd={onMarkerDragEnd} 
                />
              </GoogleMap>
            ) : (
              <div className="map-placeholder">
                <p>กำลังโหลดแผนที่...</p>
              </div>
            )}
          </div>
          
          <button type="button" onClick={getCurrentLocation} className="gps-btn">
             <MapPin size={18} className="icon-inline" /> ดึงพิกัดปัจจุบันของฉัน (GPS)
          </button>
        </div>

        <button type="submit" className="shop-submit-btn" disabled={isLoading}>
          <CheckCircle size={20} className="icon-inline" />
          {isLoading ? 'กำลังส่งข้อมูล...' : 'ส่งคำขอเปิดร้านค้า'}
        </button>

      </form>
    </div>
  );
}