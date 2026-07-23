import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { MapPin, Camera, Store, AlertTriangle, Send, ImagePlus, CheckCircle2, Lock, AlertCircle } from 'lucide-react';
import './shop.css'; 

const mapContainerStyle = { width: '100%', height: '300px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' };
const defaultCenter = { lat: 13.7563, lng: 100.5018 };
const API_URL = import.meta.env.VITE_API_URL;

export default function RegisterShop() {
  const [categories, setCategories] = useState([]);
  const [isLocationVerified, setIsLocationVerified] = useState(false);
  
  const [existingShopId, setExistingShopId] = useState(null);
  const [shopStatus, setShopStatus] = useState(null); 
  const [rejectionReasons, setRejectionReasons] = useState({});
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);
  
  // 🌟 State สำหรับเก็บที่อยู่ที่ดึงมาจาก Google Maps (ไม่แสดงเป็นช่องกรอก)
  const [addressData, setAddressData] = useState({
    full: '', subDistrict: '', district: '', province: '', postalCode: ''
  });

  const [formData, setFormData] = useState({
    shopName: '', categoryId: '', businessType: 'individual',
    sellOnline: false, sellAtStore: false, sellAtHome: false,
    deliveryService: false, marketingSupport: false, hasBranches: false
  });

  const [images, setImages] = useState({
    imageOwner: null, imageLocation: null, imageProductReady: null,
    imagePackaging: null, imageReadyToShip: null, imageIdCard: null
  });

  const [imagePreviews, setImagePreviews] = useState({});
  const [markerPos, setMarkerPos] = useState(defaultCenter);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const catRes = await fetch(`${API_URL}/api/shop-categories`);
        if (catRes.ok) setCategories(await catRes.json());

        const loggedInUser = JSON.parse(localStorage.getItem('user')); 
        const userId = loggedInUser ? loggedInUser.id : null;
        if (!userId) { setIsLoadingData(false); return; }

        const shopRes = await fetch(`${API_URL}/api/shops/my-shop?user_id=${userId}`);
        
        if (shopRes.ok) {
          const shopData = await shopRes.json();
          if (shopData && shopData.id) {
            setExistingShopId(shopData.id);
            setShopStatus(shopData.status);
            
            setFormData({
              shopName: shopData.shop_name || '', categoryId: shopData.category_id || '',
              businessType: shopData.business_type || 'individual',
              sellOnline: shopData.sell_online || false, sellAtStore: shopData.sell_at_shop || false,
              sellAtHome: shopData.sell_at_home || false, deliveryService: shopData.need_delivery || false,
              marketingSupport: shopData.need_marketing || false, hasBranches: shopData.has_branches || false
            });

            if (shopData.latitude && shopData.longitude) {
              setMarkerPos({ lat: parseFloat(shopData.latitude), lng: parseFloat(shopData.longitude) });
              setIsLocationVerified(true);
            }

            // ถ้ามีที่อยู่เก่า ก็ดึงมาโชว์
            if (shopData.address_full) {
              setAddressData(prev => ({ ...prev, full: shopData.address_full }));
            }

            setImagePreviews({
              imageOwner: shopData.img_owner ? `${API_URL}/${shopData.img_owner}` : null,
              imageLocation: shopData.img_location ? `${API_URL}/${shopData.img_location}` : null,
              imageProductReady: shopData.img_product_ready ? `${API_URL}/${shopData.img_product_ready}` : null,
              imagePackaging: shopData.img_packaging ? `${API_URL}/${shopData.img_packaging}` : null,
              imageReadyToShip: shopData.img_ready_to_ship ? `${API_URL}/${shopData.img_ready_to_ship}` : null,
              imageIdCard: shopData.img_id_card ? `${API_URL}/${shopData.img_id_card}` : null,
            });

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
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = (e, fieldName) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImages(prev => ({ ...prev, [fieldName]: file }));
      setImagePreviews(prev => ({ ...prev, [fieldName]: URL.createObjectURL(file) }));
      if (rejectionReasons[fieldName]) setRejectionReasons(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  // 🌟 ฟังก์ชันดึงที่อยู่จาก Google Map อัตโนมัติ
  const getAddressFromLatLng = (lat, lng) => {
    if (!window.google || !window.google.maps) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng }, language: 'th' }, (results, status) => {
      if (status === 'OK' && results[0]) {
        let sub = '', dist = '', prov = '', post = '';
        
        results[0].address_components.forEach(comp => {
          const types = comp.types;
          // หาส่วนประกอบที่อยู่
          if (types.includes('sublocality_level_2') || types.includes('sublocality')) sub = comp.long_name;
          if (types.includes('locality') || types.includes('sublocality_level_1') || types.includes('administrative_area_level_2')) dist = comp.long_name;
          if (types.includes('administrative_area_level_1')) prov = comp.long_name;
          if (types.includes('postal_code')) post = comp.long_name;
        });

        // ตัดคำว่า ตำบล/อำเภอ/จังหวัด ออกเพื่อให้ฐานข้อมูลสะอาด
        sub = sub.replace(/^ตำบล/, '').replace(/^แขวง/, '').trim();
        dist = dist.replace(/^อำเภอ/, '').replace(/^เขต/, '').trim();
        prov = prov.replace(/^จังหวัด/, '').replace(/^จ\./, '').trim();

        // เก็บลง State
        setAddressData({
          full: results[0].formatted_address,
          subDistrict: sub,
          district: dist,
          province: prov,
          postalCode: post
        });
      } else {
        setAddressData(prev => ({ ...prev, full: `พิกัด: ${lat}, ${lng}` }));
      }
    });
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setMarkerPos({ lat, lng });
          setIsLocationVerified(true); 
          setIsInfoOpen(true); 
          setIsInfoExpanded(false);
          getAddressFromLatLng(lat, lng); // 🌟 เรียกใช้ฟังชันแปลพิกัด
          if (rejectionReasons.location_mismatch) setRejectionReasons(prev => ({ ...prev, location_mismatch: false }));
        },
        () => { alert("คุณไม่อนุญาตให้เข้าถึงตำแหน่ง เราไม่สามารถบันทึกร้านค้าได้ครับ"); setIsLocationVerified(false); }
      );
    }
  };

  const onMapClick = (e) => {
    if (shopStatus === 'PENDING') return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMarkerPos({ lat, lng });
    setIsLocationVerified(true);
    setIsInfoOpen(true); 
    setIsInfoExpanded(false);
    getAddressFromLatLng(lat, lng); // 🌟 เรียกใช้ฟังชันแปลพิกัด
    if (rejectionReasons.location_mismatch) setRejectionReasons(prev => ({ ...prev, location_mismatch: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLocationVerified) {
        alert("กรุณากดดึงพิกัดปัจจุบัน หรือปักหมุดบนแผนที่ ก่อนทำการบันทึกข้อมูลครับ");
        return; 
    }
    
    const submitData = new FormData();
    Object.keys(formData).forEach(key => submitData.append(key, formData[key]));
    
    // 🌟 แนบพิกัดและที่อยู่ลงไปกับฟอร์ม
    submitData.append('lat', markerPos.lat);
    submitData.append('lng', markerPos.lng);
    submitData.append('addressFull', addressData.full);
    submitData.append('subDistrict', addressData.subDistrict);
    submitData.append('district', addressData.district);
    submitData.append('province', addressData.province);
    submitData.append('postalCode', addressData.postalCode);
    
    const loggedInUser = JSON.parse(localStorage.getItem('user')); 
    submitData.append('userId', loggedInUser ? loggedInUser.id : '');

    Object.keys(images).forEach(key => {
      if (images[key]) submitData.append(key, images[key]);
    });

    try {
      const url = existingShopId ? `${API_URL}/api/update-shop/${existingShopId}` : `${API_URL}/api/register-shop`;
      const method = existingShopId ? 'PUT' : 'POST';
      const response = await fetch(url, { method: method, body: submitData });
      const result = await response.json();
      
      if (response.ok) {
        alert(existingShopId ? "ส่งข้อมูลแก้ไขสำเร็จ!" : "ส่งข้อมูลเปิดร้านสำเร็จ!");
        setShopStatus('PENDING'); 
        setRejectionReasons({});
      } else alert("เกิดข้อผิดพลาด: " + result.message);
    } catch (error) {
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    }
  };

  const cardStyle = { background: '#ffffff', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)', border: '1px solid #f3f4f6', position: 'relative' };
  const headerStyle = { marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#1f2937', borderBottom: '2px solid #f3f4f6', paddingBottom: '12px', marginBottom: '20px' };
  
  if (isLoadingData) return <div style={{textAlign: 'center', padding: '50px'}}>กำลังโหลดข้อมูล...</div>;
  const isLocked = shopStatus === 'PENDING';

  return (
    <div className="shop-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', background: '#f8fafc', borderRadius: '20px' }}>
      
      {shopStatus === 'PENDING' && (
        <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', color: '#b45309', padding: '16px', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' }}>
          <Lock size={24} /> ข้อมูลอยู่ระหว่างรอการตรวจสอบจากเจ้าหน้าที่ (ไม่สามารถแก้ไขได้)
        </div>
      )}

      {shopStatus === 'REJECTED' && (
        <div style={{ background: '#fef2f2', border: '1px solid #ef4444', color: '#b91c1c', padding: '16px', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' }}>
          <AlertCircle size={24} /> กรุณาตรวจสอบจุดที่มีกรอบสีแดง ทำการแก้ไข และกดส่งใหม่อีกครั้ง
        </div>
      )}

      <form onSubmit={handleSubmit}>
        
        {/* ============================================== */}
        {/* ส่วนที่ 1: ข้อมูลร้านค้า */}
        {/* ============================================== */}
        <div style={cardStyle}>
          {isLocked && <div style={{position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.6)', zIndex: 10, borderRadius: '16px'}} />}
          <h3 style={headerStyle}><Store size={22} color="#3b82f6" /> ข้อมูลร้านค้า</h3>
          
          <label style={{fontSize: '13px', fontWeight: 'bold', color: '#4b5563', display: 'block', marginBottom: '6px'}}>ชื่อร้านค้า</label>
          <input type="text" name="shopName" value={formData.shopName} onChange={handleChange} disabled={isLocked} style={{width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', marginBottom: '16px', outline: 'none', backgroundColor: isLocked ? '#f3f4f6' : '#fff'}} required />
          
          <label style={{fontSize: '13px', fontWeight: 'bold', color: '#4b5563', display: 'block', marginBottom: '6px'}}>หมวดหมู่สินค้า</label>
          <select name="categoryId" value={formData.categoryId} onChange={handleChange} disabled={isLocked} style={{width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', backgroundColor: isLocked ? '#f3f4f6' : '#fff'}} required>
            <option value="">-- เลือกหมวดหมู่ --</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.category_name}</option>)}
          </select>

          <div style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <label style={{fontSize: '13px', fontWeight: 'bold', color: '#4b5563', display: 'block', marginBottom: '12px'}}>รูปแบบการจดทะเบียน:</label>
            <div style={{ display: 'flex', gap: '25px', color: '#334155', fontSize: '15px' }}>
              <label><input type="radio" name="businessType" value="individual" checked={formData.businessType === 'individual'} onChange={handleChange} disabled={isLocked} /> บุคคลธรรมดา</label>
              <label><input type="radio" name="businessType" value="corporate" checked={formData.businessType === 'corporate'} onChange={handleChange} disabled={isLocked} /> นิติบุคคล</label>
            </div>
          </div>

          <div style={{marginTop: '20px', background: '#f0f9ff', padding: '16px', borderRadius: '8px', border: '1px solid #bae6fd'}}>
            <label style={{fontWeight: 'bold', marginBottom: '12px', display: 'block', color: '#0369a1'}}>รูปแบบการขาย:</label>
            <div style={{display: 'flex', gap: '15px', flexWrap: 'wrap', fontSize: '14px', color: '#334155'}}>
              <label><input type="checkbox" name="sellOnline" checked={formData.sellOnline} onChange={handleChange} disabled={isLocked} /> ออนไลน์</label>
              <label><input type="checkbox" name="sellAtStore" checked={formData.sellAtStore} onChange={handleChange} disabled={isLocked} /> หน้าร้าน</label>
              <label><input type="checkbox" name="sellAtHome" checked={formData.sellAtHome} onChange={handleChange} disabled={isLocked} /> ที่บ้าน</label>
              <label><input type="checkbox" name="deliveryService" checked={formData.deliveryService} onChange={handleChange} disabled={isLocked} /> บริการส่ง</label>
            </div>
          </div>

          {formData.sellAtStore && (
            <div style={{ marginTop: '20px', padding: '16px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' }}>
              <label style={{ fontWeight: 'bold', color: '#b45309', display: 'block', marginBottom: '12px' }}>จำนวนสาขา:</label>
              <div style={{ display: 'flex', gap: '25px', color: '#92400e', fontSize: '15px', paddingLeft: '10px' }}>
                <label><input type="radio" name="hasBranches" value="false" checked={String(formData.hasBranches) === 'false'} onChange={() => setFormData(prev => ({ ...prev, hasBranches: false }))} disabled={isLocked} /> 1 สาขา</label>
                <label><input type="radio" name="hasBranches" value="true" checked={String(formData.hasBranches) === 'true'} onChange={() => setFormData(prev => ({ ...prev, hasBranches: true }))} disabled={isLocked} /> มากกว่า 1 สาขา</label>
              </div>
            </div>
          )}
        </div>

        {/* ============================================== */}
        {/* ส่วนที่ 2: รูปภาพ */}
        {/* ============================================== */}
        <div style={cardStyle}>
          <h3 style={headerStyle}><Camera size={22} color="#ec4899" /> อัปโหลดภาพถ่าย</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
            {[
              { id: 'img_owner', fieldKey: 'imageOwner', label: '1. เจ้าของ' },
              { id: 'img_location', fieldKey: 'imageLocation', label: '2. สถานที่' },
              { id: 'img_product_ready', fieldKey: 'imageProductReady', label: '3. สินค้า' },
              { id: 'img_packaging', fieldKey: 'imagePackaging', label: '4. แพ็คกิ้ง' },
              { id: 'img_ready_to_ship', fieldKey: 'imageReadyToShip', label: '5. พร้อมส่ง' },
              { id: 'img_id_card', fieldKey: 'imageIdCard', label: '6. บัตร ปชช.' }
            ].map((imgItem) => {
              const hasError = rejectionReasons[imgItem.id];
              return (
                <div key={imgItem.id} style={{ position: 'relative', height: '140px', borderRadius: '12px', overflow: 'hidden', border: hasError ? '3px solid #ef4444' : (imagePreviews[imgItem.fieldKey] ? '2px solid #22c55e' : '2px dashed #cbd5e1'), backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: isLocked ? 'not-allowed' : 'pointer' }}>
                  {imagePreviews[imgItem.fieldKey] ? (
                    <>
                      <img src={imagePreviews[imgItem.fieldKey]} style={{width: '100%', height: '100%', objectFit: 'cover', opacity: isLocked ? 0.7 : 1}} />
                      <div style={{position: 'absolute', bottom: 0, width: '100%', background: hasError ? 'rgba(239, 68, 68, 0.9)' : 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '11px', padding: '6px', textAlign: 'center', fontWeight: hasError ? 'bold' : 'normal'}}>{hasError ? '❌ ต้องแก้ไข' : imgItem.label}</div>
                    </>
                  ) : (
                    <div style={{padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', color: hasError ? '#ef4444' : '#94a3b8'}}><ImagePlus size={32} style={{ marginBottom: '8px' }} /> <span style={{fontSize: '12px'}}>{imgItem.label}</span></div>
                  )}
                  {!isLocked && <input type="file" accept="image/*" style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} onChange={(e) => handleImageChange(e, imgItem.fieldKey)} required={!imagePreviews[imgItem.fieldKey]} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* ============================================== */}
        {/* ส่วนที่ 3: แผนที่ (อยู่ด้านล่างสุด และมีปุ่มดึงพิกัด) */}
        {/* ============================================== */}
        <div style={{...cardStyle, border: rejectionReasons.location_mismatch ? '3px solid #ef4444' : cardStyle.border}}>
          {isLocked && <div style={{position: 'absolute', inset: 0, background: 'transparent', zIndex: 10}} />}
          <h3 style={headerStyle}><MapPin size={22} color={rejectionReasons.location_mismatch ? "#ef4444" : "#10b981"} /> พิกัดร้านค้า / สถานที่ผลิตจริง</h3>
          
          {rejectionReasons.location_mismatch ? (
            <p style={{fontSize: '14px', color: '#ef4444', marginBottom: '16px', fontWeight: 'bold'}}>❌ พิกัดแผนที่ไม่ตรงกับภาพถ่าย กรุณาปักหมุดใหม่ให้ถูกต้อง</p>
          ) : (
            <p style={{fontSize: '13px', color: '#64748b', marginBottom: '16px'}}>📍 โปรดคลิกบนแผนที่หรือกดปุ่มด้านล่างเพื่อปักหมุด</p>
          )}

          {/* 🌟 แสดงข้อความที่อยู่แบบ Text ล้วนๆ ไม่มีกรอบ Input */}
          {addressData.full && (
            <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px', fontSize: '14px', color: '#1e293b' }}>
              <span style={{fontWeight: 'bold', color: '#3b82f6'}}>ที่อยู่ของพิกัดนี้:</span> {addressData.full}
            </div>
          )}

          <div style={{marginBottom: '20px', borderRadius: '12px', overflow: 'hidden'}}>
            {isLoaded ? (
              <GoogleMap mapContainerStyle={mapContainerStyle} center={markerPos} zoom={14} onClick={onMapClick} options={{ disableDefaultUI: true, zoomControl: true }}>
                <Marker position={markerPos} icon={{ url: '/IconApp.png', scaledSize: window.google ? new window.google.maps.Size(60, 60) : null }} onClick={() => { setIsInfoOpen(true); setIsInfoExpanded(false); }}>
                  {isInfoOpen && (
                    <InfoWindow position={markerPos} onCloseClick={() => setIsInfoOpen(false)}>
                      {!isInfoExpanded ? (
                        <div onClick={() => setIsInfoExpanded(true)} style={{ padding: '4px 8px', cursor: 'pointer', textAlign: 'center', minWidth: '110px' }}>
                          <h4 style={{ margin: 0, fontSize: '14px', color: '#1f2937', fontWeight: 'bold' }}>{formData.shopName || 'ร้านค้าใหม่'}</h4>
                          <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#3b82f6', fontWeight: 'bold' }}>👆 คลิ้กดูรายละเอียด</p>
                        </div>
                      ) : (
                        <div style={{ padding: '5px', maxWidth: '220px', textAlign: 'center', fontFamily: 'sans-serif' }}>
                          <button type="button" onClick={() => setIsInfoExpanded(false)} style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '12px', cursor: 'pointer', marginBottom: '8px' }}>⬅️ ย่อกลับ</button>
                          <div style={{ width: '100%', height: '120px', borderRadius: '8px', overflow: 'hidden', marginBottom: '12px', background: '#f3f4f6' }}>
                            <img src={imagePreviews.imageOwner || 'https://via.placeholder.com/200?text=No+Image'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#1f2937' }}>{formData.shopName || 'กำลังตั้งชื่อร้าน...'}</h4>
                          <a href={`https://www.google.com/maps/dir/?api=1&destination=${markerPos.lat},${markerPos.lng}`} target="_blank" rel="noopener noreferrer" style={{ display: 'block', padding: '10px', background: '#3b82f6', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px' }}>🚗 นำทางไปที่ร้าน</a>
                        </div>
                      )}
                    </InfoWindow>
                  )}
                </Marker>
              </GoogleMap>
            ) : <p style={{textAlign: 'center', padding: '40px', background: '#f1f5f9', borderRadius: '12px', color: '#64748b'}}>กำลังโหลดแผนที่...</p>}
          </div>
          
          {/* 🌟 ปุ่มดึงพิกัด GPS */}
          <button type="button" onClick={handleGetLocation} disabled={isLocked} style={{width: '100%', padding: '14px', background: isLocationVerified ? (rejectionReasons.location_mismatch ? '#fef2f2' : '#dcfce7') : '#eff6ff', color: isLocationVerified ? (rejectionReasons.location_mismatch ? '#ef4444' : '#166534') : '#2563eb', borderRadius: '10px', border: isLocationVerified ? (rejectionReasons.location_mismatch ? '2px solid #ef4444' : '2px solid #22c55e') : '2px solid #3b82f6', cursor: isLocked ? 'not-allowed' : 'pointer', fontWeight: 'bold'}}>
            {isLocationVerified ? (rejectionReasons.location_mismatch ? '❌ กรุณาดึงพิกัดใหม่' : '✅ ดึงพิกัดสำเร็จแล้ว') : '📍 ดึงพิกัดปัจจุบันของฉัน (GPS)'}
          </button>
        </div>

        {/* ปุ่ม Submit */}
        {shopStatus === 'PENDING' ? (
          <button type="button" disabled style={{width: '100%', padding: '16px', background: '#94a3b8', color: '#fff', fontWeight: 'bold', borderRadius: '12px', border: 'none', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'not-allowed'}}>
            <Lock size={24} /> ส่งข้อมูลแล้ว รอการตรวจสอบ
          </button>
        ) : shopStatus === 'REJECTED' ? (
          <button type="submit" style={{width: '100%', padding: '16px', background: 'linear-gradient(135deg, #ef4444, #b91c1c)', color: '#fff', fontWeight: 'bold', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}>
            <Send size={24} /> ยืนยันส่งข้อมูลที่แก้ไขแล้ว
          </button>
        ) : (
          <button type="submit" style={{width: '100%', padding: '16px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', fontWeight: 'bold', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}>
            <Send size={24} /> ส่งคำขอเปิดร้านค้า
          </button>
        )}

      </form>
    </div>
  );
}