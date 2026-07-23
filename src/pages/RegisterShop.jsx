import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
// นำเข้า Icon
import { MapPin, Camera, Store, AlertTriangle, Send, ImagePlus, CheckCircle2, Lock, AlertCircle } from 'lucide-react';
import './shop.css'; 

// ⚙️ ตั้งค่าขนาดแผนที่
const mapContainerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '12px',
  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
};

// 📍 พิกัดเริ่มต้น (กรุงเทพฯ)
const defaultCenter = { lat: 13.7563, lng: 100.5018 };

// 🔗 URL ของ Backend
const API_URL = import.meta.env.VITE_API_URL;

export default function RegisterShop() {
  const [categories, setCategories] = useState([]);
  const [isLocationVerified, setIsLocationVerified] = useState(false);
  
  // 🌟 State จัดการสถานะการตรวจสอบ (ใหม่)
  const [existingShopId, setExistingShopId] = useState(null);
  const [shopStatus, setShopStatus] = useState(null); // 'PENDING', 'REJECTED', 'ACTIVE'
  const [rejectionReasons, setRejectionReasons] = useState({});
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // 🌟 State ควบคุมหน้าต่างข้อมูล (InfoWindow)
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);
  
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

  const [imagePreviews, setImagePreviews] = useState({});
  const [markerPos, setMarkerPos] = useState(defaultCenter);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  // ดึงหมวดหมู่ และ ข้อมูลร้านค้าเดิม (ถ้ามี)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // 1. ดึงหมวดหมู่
        const catRes = await fetch(`${API_URL}/api/shop-categories`);
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData);
        }

        
        // 📍 ดึงข้อมูลจากกล่องความจำที่ชื่อว่า 'user' (หรือชื่อที่คุณตั้งไว้ตอนทำหน้า Login)
        const loggedInUser = JSON.parse(localStorage.getItem('user')); 
        
        // 📍 ถ้ามีคนล็อกอินอยู่ ให้เอา id มาใช้ แต่ถ้าไม่มีให้เป็น null
        const userId = loggedInUser ? loggedInUser.id : null;

        // 📍 ป้องกัน error: ถ้ายังไม่ได้ล็อกอิน ไม่ต้องทำคำสั่งดึงข้อมูลร้านค้าต่อ
        if (!userId) {
          console.log("ยังไม่ได้ล็อกอิน");
          setIsLoadingData(false);
          return; 
        }

        const shopRes = await fetch(`${API_URL}/api/shops/my-shop?user_id=${userId}`);
        
        if (shopRes.ok) {
          const shopData = await shopRes.json();
          if (shopData && shopData.id) {
            setExistingShopId(shopData.id);
            setShopStatus(shopData.status);
            
            // ตั้งค่าฟอร์มกลับไปเป็นข้อมูลเดิม
            setFormData({
              shopName: shopData.shop_name || '',
              categoryId: shopData.category_id || '',
              sellOnline: shopData.sell_online || false,
              sellAtStore: shopData.sell_at_shop || false,
              sellAtHome: shopData.sell_at_home || false,
              deliveryService: shopData.need_delivery || false,
              marketingSupport: shopData.need_marketing || false
            });

            // ตั้งค่าพิกัดเดิม
            if (shopData.latitude && shopData.longitude) {
              setMarkerPos({ lat: parseFloat(shopData.latitude), lng: parseFloat(shopData.longitude) });
              setIsLocationVerified(true);
            }

            // โหลดรูปภาพเดิมมาแสดง (ถ้ามี)
            setImagePreviews({
              imageOwner: shopData.img_owner ? `${API_URL}/${shopData.img_owner}` : null,
              imageLocation: shopData.img_location ? `${API_URL}/${shopData.img_location}` : null,
              imageProductReady: shopData.img_product_ready ? `${API_URL}/${shopData.img_product_ready}` : null,
              imagePackaging: shopData.img_packaging ? `${API_URL}/${shopData.img_packaging}` : null,
              imageReadyToShip: shopData.img_ready_to_ship ? `${API_URL}/${shopData.img_ready_to_ship}` : null,
              imageIdCard: shopData.img_id_card ? `${API_URL}/${shopData.img_id_card}` : null,
            });

            // ถ้าโดนปฏิเสธ ให้ดึงเหตุผลมา Mark ตัวแดง
            if (shopData.status === 'REJECTED' && shopData.rejection_reasons) {
              setRejectionReasons(JSON.parse(shopData.rejection_reasons));
            }
          }
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setIsLoadingData(false);
      }
    };
    
    fetchInitialData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e, fieldName) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImages(prev => ({ ...prev, [fieldName]: file }));
      setImagePreviews(prev => ({ ...prev, [fieldName]: URL.createObjectURL(file) }));
      
      // ล้างแจ้งเตือนตัวแดงถ้ายูสเซอร์อัปโหลดรูปใหม่แก้แล้ว
      if (rejectionReasons[fieldName]) {
        setRejectionReasons(prev => ({ ...prev, [fieldName]: false }));
      }
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
          setIsInfoOpen(true); 
          setIsInfoExpanded(false); 
          
          if (rejectionReasons.location_mismatch) {
            setRejectionReasons(prev => ({ ...prev, location_mismatch: false }));
          }
        },
        () => {
          alert("คุณไม่อนุญาตให้เข้าถึงตำแหน่ง เราไม่สามารถบันทึกร้านค้าได้ครับ");
          setIsLocationVerified(false); 
        }
      );
    }
  };

  const onMapClick = (e) => {
    // ล็อกไม่ให้จิ้มเปลี่ยนพิกัดถ้ารอตรวจ
    if (shopStatus === 'PENDING') return;

    setMarkerPos({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    setIsInfoOpen(true); 
    setIsInfoExpanded(false); 
    setIsLocationVerified(true);
    
    if (rejectionReasons.location_mismatch) {
      setRejectionReasons(prev => ({ ...prev, location_mismatch: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLocationVerified) {
        alert("กรุณากดปุ่ม '📍 ดึงพิกัดปัจจุบันของฉัน (GPS)' หรือปักหมุดบนแผนที่ ก่อนทำการบันทึกข้อมูลครับ");
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
      // 🌟 เลือกว่าจะส่งคำขอใหม่ (POST) หรืออัปเดตของเดิม (PUT)
      const url = existingShopId ? `${API_URL}/api/update-shop/${existingShopId}` : `${API_URL}/api/register-shop`;
      const method = existingShopId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        body: submitData
      });
      const result = await response.json();
      
      if (response.ok) {
        alert(existingShopId ? "ส่งข้อมูลแก้ไขสำเร็จ!" : "ส่งข้อมูลเปิดร้านสำเร็จ!");
        setShopStatus('PENDING'); // บังคับเปลี่ยนสถานะเป็นรอตรวจทันที
        setRejectionReasons({});
      } else {
        alert("เกิดข้อผิดพลาด: " + result.message);
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    }
  };

  // 🎨 Style
  const cardStyle = {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '20px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
    border: '1px solid #f3f4f6',
    position: 'relative'
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

  // เช็คว่ารอข้อมูลอยู่ไหม
  if (isLoadingData) {
    return <div style={{textAlign: 'center', padding: '50px'}}>กำลังโหลดข้อมูล...</div>;
  }

  // ตัวแปรเช็คว่าฟอร์มควรล็อกไหม
  const isLocked = shopStatus === 'PENDING';

  return (
    <div className="shop-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', background: '#f8fafc', borderRadius: '20px' }}>
      
      {/* 🌟 ป้ายแจ้งเตือนสถานะด้านบนสุด */}
      {shopStatus === 'PENDING' && (
        <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', color: '#b45309', padding: '16px', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' }}>
          <Lock size={24} /> ข้อมูลของคุณกำลังอยู่ระหว่างรอการตรวจสอบจากเจ้าหน้าที่ (ไม่สามารถแก้ไขได้ในขณะนี้)
        </div>
      )}

      {shopStatus === 'REJECTED' && (
        <div style={{ background: '#fef2f2', border: '1px solid #ef4444', color: '#b91c1c', padding: '16px', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' }}>
          <AlertCircle size={24} /> ข้อมูลบางส่วนไม่ถูกต้อง กรุณาตรวจสอบจุดที่มีกรอบสีแดง ทำการแก้ไข และกดส่งใหม่อีกครั้ง
        </div>
      )}

      <form onSubmit={handleSubmit}>
        
        {/* ส่วนที่ 1: ข้อมูลร้านค้า */}
        <div style={cardStyle}>
          {isLocked && <div style={{position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.6)', zIndex: 10, borderRadius: '16px'}} />}
          
          <h3 style={headerStyle}>
            <Store size={22} color="#3b82f6" /> ข้อมูลร้านค้าและรูปแบบการขาย
          </h3>
          
          <label style={{fontSize: '14px', fontWeight: 'bold', color: '#4b5563', display: 'block', marginBottom: '8px'}}>ชื่อร้านค้า (แสดงบนออนไลน์)</label>
          <input 
            type="text" 
            name="shopName"
            value={formData.shopName}
            onChange={handleChange}
            disabled={isLocked}
            className="shop-input" 
            placeholder="ตั้งชื่อร้านของคุณ..." 
            style={{
              width: '100%', 
              padding: '12px', 
              borderRadius: '8px', 
              border: '1px solid #d1d5db', 
              marginBottom: '16px', 
              outline: 'none', 
              backgroundColor: isLocked ? '#f3f4f6' : '#fff',
              color: '#1f2937' /* 🌟 เพิ่มบรรทัดนี้: บังคับตัวหนังสือสีเข้ม */
            }}
            required 
          />
          
          <label style={{fontSize: '14px', fontWeight: 'bold', color: '#4b5563', display: 'block', marginBottom: '8px'}}>ประเภทธุรกิจ / หมวดหมู่สินค้า</label>
          <select 
            name="categoryId" 
            value={formData.categoryId} 
            onChange={handleChange} 
            disabled={isLocked}
            style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: isLocked ? '#f3f4f6' : '#fff', outline: 'none'}}
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
              <label style={{display: 'flex', alignItems: 'center', gap: '5px', cursor: isLocked ? 'not-allowed' : 'pointer'}}><input type="checkbox" name="sellOnline" checked={formData.sellOnline} onChange={handleChange} disabled={isLocked} /> ขายออนไลน์</label>
              <label style={{display: 'flex', alignItems: 'center', gap: '5px', cursor: isLocked ? 'not-allowed' : 'pointer'}}><input type="checkbox" name="sellAtStore" checked={formData.sellAtStore} onChange={handleChange} disabled={isLocked} /> ขายที่ร้าน</label>
              <label style={{display: 'flex', alignItems: 'center', gap: '5px', cursor: isLocked ? 'not-allowed' : 'pointer'}}><input type="checkbox" name="sellAtHome" checked={formData.sellAtHome} onChange={handleChange} disabled={isLocked} /> ขายที่บ้าน</label>
              <label style={{display: 'flex', alignItems: 'center', gap: '5px', cursor: isLocked ? 'not-allowed' : 'pointer'}}><input type="checkbox" name="deliveryService" checked={formData.deliveryService} onChange={handleChange} disabled={isLocked} /> ต้องการบริการจัดส่ง</label>
              <label style={{display: 'flex', alignItems: 'center', gap: '5px', cursor: isLocked ? 'not-allowed' : 'pointer'}}><input type="checkbox" name="marketingSupport" checked={formData.marketingSupport} onChange={handleChange} disabled={isLocked} /> ให้สนับสนุนทางตลาด</label>
            </div>
          </div>
        </div>

        {/* ส่วนที่ 2: อัปโหลดรูปภาพ */}
        <div style={cardStyle}>
          <h3 style={headerStyle}>
            <Camera size={22} color="#ec4899" /> อัปโหลดภาพถ่าย
          </h3>
          
          <div style={{background: '#fef2f2', border: '1px solid #f87171', borderRadius: '8px', padding: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#b91c1c'}}>
            <AlertTriangle size={24} style={{flexShrink: 0}} />
            <span style={{fontSize: '14px', fontWeight: 'bold'}}>
              คำเตือน: ถ้ารูปไม่ตรงตามเงื่อนไข และไม่ครบ ร้านคุณจะไม่ได้รับการอนุมัติให้เปิด
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
            {[
              { id: 'img_owner', fieldKey: 'imageOwner', label: '1. ภาพเจ้าของสินค้า' },
              { id: 'img_location', fieldKey: 'imageLocation', label: '2. ภาพกำลังผลิต/สถานที่' },
              { id: 'img_product_ready', fieldKey: 'imageProductReady', label: '3. ภาพสินค้าพร้อมขาย' },
              { id: 'img_packaging', fieldKey: 'imagePackaging', label: '4. ภาพสินค้าบรรจุกล่อง' },
              { id: 'img_ready_to_ship', fieldKey: 'imageReadyToShip', label: '5. ภาพพร้อมจัดส่ง' },
              { id: 'img_id_card', fieldKey: 'imageIdCard', label: '6. เซลฟี่พร้อมบัตร ปชช.' }
            ].map((imgItem) => {
              // เช็คว่ารูปนี้โดนแจ้งให้แก้ไหม
              const hasError = rejectionReasons[imgItem.id];

              return (
                <div key={imgItem.id} style={{ position: 'relative', height: '140px', borderRadius: '12px', overflow: 'hidden', border: hasError ? '3px solid #ef4444' : (imagePreviews[imgItem.fieldKey] ? '2px solid #22c55e' : '2px dashed #cbd5e1'), backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease', cursor: isLocked ? 'not-allowed' : 'pointer', boxShadow: hasError ? '0 0 10px rgba(239, 68, 68, 0.3)' : 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
                  
                  {imagePreviews[imgItem.fieldKey] ? (
                    <>
                      <img src={imagePreviews[imgItem.fieldKey]} alt={imgItem.label} style={{width: '100%', height: '100%', objectFit: 'cover', opacity: isLocked ? 0.7 : 1}} />
                      <div style={{position: 'absolute', bottom: 0, width: '100%', background: hasError ? 'rgba(239, 68, 68, 0.9)' : 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '11px', padding: '6px', textAlign: 'center', backdropFilter: 'blur(2px)', fontWeight: hasError ? 'bold' : 'normal'}}>
                         {hasError ? '❌ ต้องแก้ไข' : imgItem.label}
                      </div>
                      {!hasError && <CheckCircle2 size={24} color="#22c55e" style={{position: 'absolute', top: '8px', right: '8px', background: '#fff', borderRadius: '50%'}} />}
                    </>
                  ) : (
                    <div style={{padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', color: hasError ? '#ef4444' : '#94a3b8'}}>
                      <ImagePlus size={32} style={{ marginBottom: '8px' }} /> 
                      <span style={{fontSize: '12px', textAlign: 'center', lineHeight: '1.4', fontWeight: hasError ? 'bold' : 'normal'}}>{imgItem.label}</span>
                    </div>
                  )}
                  
                  {!isLocked && (
                    <input 
                      type="file" 
                      accept="image/*"
                      style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} 
                      onChange={(e) => handleImageChange(e, imgItem.fieldKey)} 
                      required={!imagePreviews[imgItem.fieldKey]} 
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ส่วนที่ 3: แผนที่ */}
        <div style={{...cardStyle, border: rejectionReasons.location_mismatch ? '3px solid #ef4444' : cardStyle.border, boxShadow: rejectionReasons.location_mismatch ? '0 0 15px rgba(239, 68, 68, 0.2)' : cardStyle.boxShadow}}>
          {isLocked && <div style={{position: 'absolute', inset: 0, background: 'transparent', zIndex: 10}} />}
          
          <h3 style={headerStyle}>
            <MapPin size={22} color={rejectionReasons.location_mismatch ? "#ef4444" : "#10b981"} /> พิกัดร้านค้า / สถานที่ผลิตจริง
          </h3>
          
          {rejectionReasons.location_mismatch ? (
            <p style={{fontSize: '14px', color: '#ef4444', marginBottom: '16px', fontWeight: 'bold'}}>❌ พิกัดแผนที่ไม่ตรงกับภาพถ่าย กรุณาปักหมุดใหม่ให้ถูกต้อง</p>
          ) : (
            <p style={{fontSize: '13px', color: '#64748b', marginBottom: '16px'}}>📍 โปรดคลิกบนแผนที่เพื่อปักหมุดตำแหน่งที่ตั้งให้ตรงกับความจริง</p>
          )}

          <div style={{marginBottom: '20px', borderRadius: '12px', overflow: 'hidden'}}>
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={markerPos}
                zoom={14}
                onClick={onMapClick}
                options={{ disableDefaultUI: true, zoomControl: true }}
              >
                <Marker 
                  position={markerPos}
                  icon={{
                    url: '/IconApp.png',
                    scaledSize: window.google ? new window.google.maps.Size(60, 60) : null 
                  }}
                  onClick={() => {
                    setIsInfoOpen(true);
                    setIsInfoExpanded(false); 
                  }}
                >
                  {isInfoOpen && (
                    <InfoWindow position={markerPos} onCloseClick={() => setIsInfoOpen(false)}>
                      
                      {!isInfoExpanded ? (
                        <div 
                          onClick={() => setIsInfoExpanded(true)} 
                          style={{ padding: '4px 8px', cursor: 'pointer', textAlign: 'center', minWidth: '110px' }}
                        >
                          <h4 style={{ margin: 0, fontSize: '14px', color: '#1f2937', fontWeight: 'bold' }}>
                            {formData.shopName || 'ร้านค้าใหม่'}
                          </h4>
                          <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#3b82f6', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            👆 คลิ้กดูรายละเอียด
                          </p>
                        </div>
                      ) : (
                        <div style={{ padding: '5px', maxWidth: '220px', textAlign: 'center', fontFamily: 'sans-serif' }}>
                          
                          <div style={{ textAlign: 'left', marginBottom: '8px' }}>
                            <button 
                              type="button"
                              onClick={() => setIsInfoExpanded(false)}
                              style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
                            >
                              ⬅️ ย่อกลับ
                            </button>
                          </div>

                          <div style={{ width: '100%', height: '120px', borderRadius: '8px', overflow: 'hidden', marginBottom: '12px', background: '#f3f4f6' }}>
                            <img 
                              src={imagePreviews.imageOwner || 'https://via.placeholder.com/200?text=No+Image'} 
                              alt="Shop Preview" 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                          </div>

                          <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#1f2937', fontWeight: 'bold' }}>
                            {formData.shopName || 'กำลังตั้งชื่อร้าน...'}
                          </h4>

                          <p style={{ margin: '0 0 15px 0', fontSize: '13px', color: '#6b7280' }}>
                            {categories.find(c => String(c.id) === String(formData.categoryId))?.category_name || 'ยังไม่ได้เลือกประเภท'}
                          </p>

                          <a 
                            href={`https://www.google.com/maps/dir/?api=1&destination=${markerPos.lat},${markerPos.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              gap: '8px',
                              width: '100%', 
                              padding: '10px', 
                              background: '#3b82f6', 
                              color: '#fff', 
                              textDecoration: 'none', 
                              borderRadius: '8px', 
                              fontWeight: 'bold', 
                              fontSize: '14px',
                              boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
                            }}
                          >
                            🚗 นำทางไปที่ร้าน
                          </a>
                        </div>
                      )}

                    </InfoWindow>
                  )}
                </Marker>

              </GoogleMap>
            ) : (
              <p style={{textAlign: 'center', padding: '40px', background: '#f1f5f9', borderRadius: '12px', color: '#64748b'}}>กำลังโหลดแผนที่...</p>
            )}
          </div>
          
          <button 
            type="button" 
            onClick={handleGetLocation}
            disabled={isLocked}
            style={{width: '100%', padding: '14px', background: isLocationVerified ? (rejectionReasons.location_mismatch ? '#fef2f2' : '#dcfce7') : '#eff6ff', color: isLocationVerified ? (rejectionReasons.location_mismatch ? '#ef4444' : '#166534') : '#2563eb', borderRadius: '10px', border: isLocationVerified ? (rejectionReasons.location_mismatch ? '2px solid #ef4444' : '2px solid #22c55e') : '2px solid #3b82f6', cursor: isLocked ? 'not-allowed' : 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.3s', opacity: isLocked ? 0.7 : 1}}
          >
            {isLocationVerified ? (rejectionReasons.location_mismatch ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />) : <MapPin size={20} />} 
            {isLocationVerified ? (rejectionReasons.location_mismatch ? 'กรุณาดึงพิกัดใหม่' : 'ดึงพิกัดสำเร็จแล้ว') : 'ดึงพิกัดปัจจุบันของฉัน (GPS)'}
          </button>
        </div>

        {/* ปุ่ม Submit เปลี่ยนตามสถานะ */}
        {shopStatus === 'PENDING' ? (
          <button 
            type="button" 
            disabled 
            style={{width: '100%', padding: '16px', background: '#94a3b8', color: '#fff', fontWeight: 'bold', borderRadius: '12px', border: 'none', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'not-allowed'}}
          >
            <Lock size={24} /> ส่งข้อมูลแล้ว รอการตรวจสอบ
          </button>
        ) : shopStatus === 'REJECTED' ? (
          <button 
            type="submit" 
            style={{width: '100%', padding: '16px', background: 'linear-gradient(135deg, #ef4444, #b91c1c)', color: '#fff', fontWeight: 'bold', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)', transition: 'transform 0.2s'}}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Send size={24} /> ยืนยันส่งข้อมูลที่แก้ไขแล้ว
          </button>
        ) : (
          <button 
            type="submit" 
            style={{width: '100%', padding: '16px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', fontWeight: 'bold', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)', transition: 'transform 0.2s'}}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Send size={24} /> ส่งคำขอเปิดร้านค้า
          </button>
        )}

      </form>
    </div>
  );
}