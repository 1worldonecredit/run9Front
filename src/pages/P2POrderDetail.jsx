import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle, Clock, Image as ImageIcon, AlertTriangle, Calendar, Key } from 'lucide-react';

export default function P2POrderDetail() {
  const { id } = useParams(); 
  const orderId = id; 

  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myUsername, setMyUsername] = useState('');
  const [slipImage, setSlipImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // 🌟 ฟังก์ชันดึงวันที่และเวลาปัจจุบัน (Local Time)
  const getCurrentDate = () => {
    const now = new Date();
    return new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  };
  const getCurrentTime = () => {
    return new Date().toTimeString().slice(0, 5);
  };

  // 🌟 State สำหรับฟอร์ม พร้อมกำหนดค่า Default เป็นปัจจุบัน
  const [transferAmount, setTransferAmount] = useState('');
  const [transferDate, setTransferDate] = useState(getCurrentDate());
  //const [transferTime, setTransferTime] = useState(getCurrentTime());
  const [transferTime, setTransferTime] = useState('');
  
  // 🌟 State สำหรับรหัสยืนยัน
  const [confirmCodeInput, setConfirmCodeInput] = useState('');

  useEffect(() => {
    const profileStr = localStorage.getItem('userProfile');
    if (profileStr) {
      setMyUsername(JSON.parse(profileStr).username);
    }
    fetchOrderDetail();
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      const res = await fetch(`https://api.run9.app/api/p2p/order/${orderId}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
      }
    } catch (err) {
      console.error("Error:", err);
    }
    setLoading(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSlipImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSlip = async () => {
    // 1. ตรวจสอบสลิป
    if (!slipImage) return alert("กรุณาเลือกรูปสลิปก่อนครับ");
    
    // 2. ตรวจสอบรหัสยืนยัน (Double Check)
    if (confirmCodeInput.trim().toUpperCase() !== order.ConfirmationCode) {
        return alert(`รหัสยืนยันไม่ถูกต้อง! กรุณากรอกรหัสรับงาน (${order.ConfirmationCode}) ให้ตรงกันเพื่อยืนยันรายการครับ`);
    }

    // 3. ตรวจสอบยอดเงิน
    if (!transferAmount || parseFloat(transferAmount) !== parseFloat(order.Amount)) {
        return alert(`กรุณาระบุยอดเงินให้ตรงกับคำขอ (${new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2 }).format(order.Amount)}) เพื่อการตรวจสอบที่ถูกต้องครับ`);
    }

    // 4. ตรวจสอบวันและเวลา
    if (!transferDate || !transferTime) {
        return alert("กรุณาระบุวันที่และเวลาที่โอนเงินตามสลิปครับ");
    }

    setIsProcessing(true);
    try {
      const res = await fetch('https://api.run9.app/api/p2p/upload-slip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            orderId: order.Id, 
            slipImageBase64: slipImage,
            transferDate: transferDate,
            transferTime: transferTime
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("ส่งสลิปและข้อมูลเรียบร้อย รอผู้รับงานตรวจสอบครับ");
        fetchOrderDetail(); 
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
    setIsProcessing(false);
  };

  const handleConfirmReceipt = async () => {
    if (!window.confirm("คุณยืนยันว่าได้รับยอดเงินเข้าบัญชีจริงใช่หรือไม่? (การกระทำนี้ไม่สามารถยกเลิกได้)")) return;
    
    setIsProcessing(true);
    try {
      const res = await fetch('https://api.run9.app/api/p2p/confirm-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.Id })
      });
      const data = await res.json();
      if (data.success) {
        alert("ทำรายการสำเร็จ! ระบบได้จัดการยอดเงินเรียบร้อยแล้ว");
        navigate('/assets');
      } else {
        alert(data.error || data.message);
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
    setIsProcessing(false);
  };

  if (loading) return <div style={{ padding: '20px', color: '#fff', textAlign: 'center' }}>กำลังโหลด...</div>;
  if (!order) return <div style={{ padding: '20px', color: '#fff', textAlign: 'center' }}>ไม่พบรายการ</div>;

  const isRequester = myUsername === order.RequesterUsername;
  const isMatcher = myUsername === order.MatchedUsername;
  const currency = order.Currency || 'THB';

  return (
    <div style={{ background: '#0B0E14', minHeight: '100vh', color: '#fff', fontFamily: "'Prompt', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '15px', background: '#12161F', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#fff', display: 'flex', cursor: 'pointer' }}>
          <ChevronLeft size={24} />
        </button>
        <h3 style={{ margin: '0 auto', fontSize: '1rem', fontWeight: '500' }}>รายละเอียดคำขอ P2P</h3>
        <div style={{ width: '24px' }}></div>
      </div>

      <div style={{ padding: '15px', paddingBottom: '40px' }}>
        
        {/* Status Card */}
        <div style={{ background: 'linear-gradient(180deg, #1A1F2B 0%, #12161F 100%)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.2)', marginBottom: '15px', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 5px 0', color: '#3B82F6', fontSize: '1.5rem' }}>
            {new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2 }).format(order.Amount)} {currency}
          </h2>
          <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem' }}>
            สถานะ: 
            <span style={{ 
              color: order.Status === 'COMPLETED' ? '#10B981' : (order.Status === 'SLIP_UPLOADED' ? '#F59E0B' : '#60A5FA'), 
              fontWeight: 'bold', marginLeft: '5px' 
            }}>
              {order.Status === 'MATCHED' ? 'รอผู้ฝากโอนเงิน' : (order.Status === 'SLIP_UPLOADED' ? 'รอตรวจสอบสลิป' : 'สำเร็จ')}
            </span>
          </p>
          {order.ConfirmationCode && (
            <div style={{ display: 'inline-block', marginTop: '10px', padding: '6px 12px', background: 'rgba(250, 204, 21, 0.1)', borderRadius: '8px', border: '1px dashed rgba(250, 204, 21, 0.4)' }}>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#E2E8F0' }}>รหัสรับงาน: <span style={{ color: '#FACC15', fontWeight: 'bold', letterSpacing: '1px' }}>{order.ConfirmationCode}</span></p>
            </div>
          )}
        </div>

        {/* 🌟 มุมมองของผู้ฝากเงิน (Requester) */}
        {isRequester && order.Status !== 'COMPLETED' && (
          <div style={{ background: '#12161F', padding: '15px', borderRadius: '12px', marginBottom: '15px' }}>
            
            {/* กล่องแจ้งเตือนยอดเงิน */}
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', borderLeft: '4px solid #F59E0B', padding: '12px', borderRadius: '4px', marginBottom: '15px', display: 'flex', gap: '10px' }}>
                <AlertTriangle size={20} color="#F59E0B" style={{ flexShrink: 0 }} />
                <div>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#F59E0B', fontWeight: 'bold' }}>ข้อควรระวัง</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: '#E2E8F0', lineHeight: '1.4' }}>
                        กรุณาโอนเงินให้ตรงกับยอดคำขอ <strong style={{ color: '#fff' }}>{new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2 }).format(order.Amount)} {currency}</strong> เท่านั้น หากโอนผิดยอดระบบจะไม่สามารถกระทบยอดได้
                    </p>
                </div>
            </div>

            <h4 style={{ color: '#E2E8F0', marginTop: 0, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>โอนเงินไปยังบัญชี:</h4>
            <div style={{ marginBottom: '20px' }}>
                <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '4px 0' }}>ธนาคาร: <span style={{color: '#fff'}}>{order.BankName}</span></p>
                <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '4px 0' }}>เลขบัญชี: <span style={{color: '#3B82F6', fontWeight: 'bold', fontSize: '1.1rem'}}>{order.AccountNumber}</span></p>
                <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '4px 0' }}>ชื่อบัญชี: <span style={{color: '#fff'}}>{order.AccountName}</span></p>
            </div>

            {order.Status === 'MATCHED' && (
              <div>
                <h4 style={{ color: '#E2E8F0', marginTop: 0, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '15px' }}>แจ้งยืนยันการโอนเงิน</h4>
                
                {/* 🌟 ฟอร์มกรอกรหัสยืนยัน (Double Check) */}
                <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#94A3B8', marginBottom: '5px' }}>
                        <Key size={14} color="#FACC15" /> กรอกรหัสรับงานเพื่อยืนยัน <span style={{color: '#FACC15', fontWeight: 'bold'}}>({order.ConfirmationCode})</span>
                    </label>
                    <input 
                        type="text" 
                        value={confirmCodeInput}
                        onChange={(e) => setConfirmCodeInput(e.target.value.toUpperCase())}
                        placeholder="พิมพ์รหัสรับงานให้ตรงกัน"
                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', color: '#FACC15', outline: 'none', letterSpacing: '1px', fontWeight: 'bold' }}
                    />
                </div>

                {/* 🌟 ฟอร์มกรอกยอดเงิน */}
                <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94A3B8', marginBottom: '5px' }}>ยอดเงินที่โอนจริง (ตามสลิป)</label>
                    <input 
                        type="number" 
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        placeholder={`เช่น ${order.Amount}`}
                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', color: '#fff', outline: 'none' }}
                    />
                </div>

               {/* 🌟 ฟอร์มกรอกวันที่และเวลา (แบบไม่ล้นกรอบ 100%) */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', width: '100%' }}>
                    
                    <div style={{ flex: 1, minWidth: 0 }}> {/* 🌟 เพิ่ม minWidth: 0 กันกล่องล้น */}
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#94A3B8', marginBottom: '5px' }}>วันที่โอน</label>
                        <div style={{ position: 'relative' }}>
                            <Calendar size={16} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                            <input 
                                type="date" 
                                value={transferDate}
                                onChange={(e) => setTransferDate(e.target.value)}
                                style={{ 
                                    boxSizing: 'border-box', /* 🌟 หัวใจสำคัญ: สั่งให้นับ Padding รวมใน 100% เลย */
                                    width: '100%', 
                                    background: 'rgba(255,255,255,0.05)', 
                                    border: '1px solid rgba(255,255,255,0.1)', 
                                    borderRadius: '8px', 
                                    padding: '10px 10px 10px 35px', 
                                    color: '#fff', 
                                    outline: 'none', 
                                    fontSize: '0.8rem' 
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}> {/* 🌟 เพิ่ม minWidth: 0 กันกล่องล้น */}
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#94A3B8', marginBottom: '5px' }}>เวลาที่โอน</label>
                        <div style={{ position: 'relative' }}>
                            <Clock size={16} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                            <input 
                                type="time" 
                                value={transferTime}
                                onChange={(e) => setTransferTime(e.target.value)}
                                style={{ 
                                    boxSizing: 'border-box', /* 🌟 หัวใจสำคัญ: สั่งให้นับ Padding รวมใน 100% เลย */
                                    width: '100%', 
                                    background: 'rgba(255,255,255,0.05)', 
                                    border: '1px solid rgba(255,255,255,0.1)', 
                                    borderRadius: '8px', 
                                    padding: '10px 10px 10px 35px', 
                                    color: '#fff', 
                                    outline: 'none', 
                                    fontSize: '0.8rem' 
                                }}
                            />
                        </div>
                    </div> 
                </div>
                {/* 🌟 อัปโหลดสลิป */}
                <input type="file" accept="image/*" id="slipUpload" style={{ display: 'none' }} onChange={handleImageChange} />
                <label htmlFor="slipUpload" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '12px', background: 'rgba(59, 130, 246, 0.1)', border: '1px dashed #3B82F6', borderRadius: '8px', color: '#3B82F6', cursor: 'pointer', marginBottom: '15px', transition: '0.3s' }}>
                  <ImageIcon size={18} /> {slipImage ? 'เปลี่ยนรูปสลิป' : 'อัปโหลดสลิปโอนเงิน'}
                </label>
                {slipImage && <img src={slipImage} alt="Slip" style={{ width: '100%', borderRadius: '8px', marginBottom: '15px' }} />}
                
                <button onClick={handleUploadSlip} disabled={isProcessing} style={{ width: '100%', padding: '14px', background: '#3B82F6', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: isProcessing ? 'not-allowed' : 'pointer', opacity: isProcessing ? 0.7 : 1 }}>
                  ยืนยันการโอนเงิน (ส่งสลิป)
                </button>
              </div>
            )}
          </div>
        )}

        {/* 🌟 มุมมองของผู้รับงาน (Matcher) */}
        {isMatcher && order.Status !== 'COMPLETED' && (
          <div style={{ background: '#12161F', padding: '15px', borderRadius: '12px', marginBottom: '15px' }}>
            <h4 style={{ color: '#E2E8F0', marginTop: 0, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>ตรวจสอบการรับเงิน</h4>
            
            {order.Status === 'MATCHED' ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Clock size={40} color="#F59E0B" style={{ marginBottom: '10px' }} />
                <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>กำลังรอผู้ฝากโอนเงินและแนบสลิป...</p>
              </div>
            ) : (
              <div style={{ marginTop: '10px' }}>
                <p style={{ color: '#10B981', fontSize: '0.85rem', textAlign: 'center', marginBottom: '10px' }}>ผู้ฝากอัปโหลดสลิปแล้ว กรุณาตรวจสอบยอดเงินในบัญชีของคุณ</p>
                {order.SlipUrl && <img src={order.SlipUrl} alt="Slip" style={{ width: '100%', borderRadius: '8px', marginBottom: '15px', border: '1px solid rgba(255,255,255,0.1)' }} />}
                
                <button onClick={handleConfirmReceipt} disabled={isProcessing} style={{ width: '100%', padding: '14px', background: '#10B981', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: isProcessing ? 'not-allowed' : 'pointer', opacity: isProcessing ? 0.7 : 1 }}>
                  ฉันได้รับเงินแล้ว (อนุมัติรายการ)
                </button>
              </div>
            )}
          </div>
        )}

        {order.Status === 'COMPLETED' && (
          <div style={{ textAlign: 'center', padding: '30px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <CheckCircle size={50} color="#10B981" style={{ marginBottom: '10px' }} />
            <h3 style={{ color: '#10B981', margin: 0 }}>รายการสำเร็จเรียบร้อย</h3>
            <p style={{ color: '#94A3B8', fontSize: '0.8rem', marginTop: '10px' }}>ขอบคุณที่ใช้บริการระบบ P2P</p>
          </div>
        )}

      </div>
    </div>
  );
}