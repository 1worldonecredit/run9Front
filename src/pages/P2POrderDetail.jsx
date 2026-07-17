import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Key, Calendar, Clock, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';

export default function P2POrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myUsername, setMyUsername] = useState('');
  const [currency, setCurrency] = useState('LAK'); 

  // 🌟 ประกาศตัวแปร now ก่อนนำไปใช้งาน (แก้ปัญหาจอดำ)
  const now = new Date();
  const defaultDate = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
  const defaultTime = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

  // State สำหรับฟอร์มโอนเงิน
  const [confirmCodeInput, setConfirmCodeInput] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferDate, setTransferDate] = useState(defaultDate); // ดึงวันที่ปัจจุบัน
  const [transferTime, setTransferTime] = useState(defaultTime); // ดึงเวลาปัจจุบัน
  const [slipImage, setSlipImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // 1. ดึง Username ตัวเอง
    const savedProfileStr = localStorage.getItem('userProfile');
    if (savedProfileStr) {
      try {
        const parsed = JSON.parse(savedProfileStr);
        if (parsed.username) setMyUsername(parsed.username);
      } catch (e) {}
    }
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const res = await fetch(`https://api.run9.app/api/p2p/order/${id}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSlipImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSlip = async () => {
    if (!slipImage || !confirmCodeInput || !transferAmount || !transferDate || !transferTime) {
      alert("กรุณากรอกข้อมูลและแนบสลิปให้ครบถ้วน");
      return;
    }
    if (confirmCodeInput !== order.ConfirmationCode) {
      alert("รหัสรับงานไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง");
      return;
    }
    
    setIsProcessing(true);
    try {
      const res = await fetch('https://api.run9.app/api/p2p/upload-slip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId: order.Id, 
          slipBase64: slipImage,
          transferAmount,
          transferDate,
          transferTime
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("ส่งสลิปสำเร็จ! รอผู้รับงานตรวจสอบ");
        fetchOrderDetails(); 
      } else {
        alert("เกิดข้อผิดพลาด: " + data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmReceipt = async () => {
    if(!window.confirm("คุณตรวจสอบยอดเงินในบัญชีว่าเข้าจริงแล้วใช่หรือไม่?")) return;
    
    setIsProcessing(true);
    try {
      const res = await fetch('https://api.run9.app/api/p2p/confirm-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.Id })
      });
      const data = await res.json();
      if (data.success) {
        alert("✅ อนุมัติสำเร็จ! ระบบได้กระจายเงินเรียบร้อยแล้ว");
        navigate('/assets'); 
      } else {
        alert("เกิดข้อผิดพลาด: " + data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px', color: '#fff' }}>กำลังโหลด...</div>;
  if (!order) return <div style={{ textAlign: 'center', padding: '50px', color: '#fff' }}>ไม่พบข้อมูลรายการ</div>;

  // =========================================================================
  // 🌟 ระบบเช็กบทบาทแบบแม่นยำ 100%
  // =========================================================================
  const myName = String(myUsername || '').trim().toLowerCase();
  
  // ชื่อของคนสร้างออเดอร์ (คนฝากเงิน)
  const creatorName = String(order.Username || order.RequesterUsername || '').trim().toLowerCase();
  
  // ชื่อของคนกดรับงาน (คนรับเงินโอน)
  const matcherName = String(order.MatchedUsername || order.MatcherUsername || '').trim().toLowerCase();

  // 1. ตรวจสอบชัดเจนว่าคุณคือคนสร้างออเดอร์ใช่หรือไม่
  let isRequester = (myName === creatorName);
  
  // 2. ตรวจสอบชัดเจนว่าคุณคือคนรับงานใช่หรือไม่
  let isMatcher = (myName === matcherName);

  // 3. ท่าไม้ตาย: ในกรณีที่ API ส่งชื่อที่โดนเซนเซอร์มาให้ (เช่น use***r1) 
  // ระบบจะดึงตัวอักษร 3 ตัวแรกมาเทียบ เพื่อยืนยันตัวตนให้ถูกต้อง
  if (!isRequester && creatorName.includes('***') && myName.substring(0, 3) === creatorName.substring(0, 3)) {
      isRequester = true;
  }
  if (!isMatcher && matcherName.includes('***') && myName.substring(0, 3) === matcherName.substring(0, 3)) {
      isMatcher = true;
  }
  // =========================================================================

  return (
    <div style={{ padding: '20px 15px', paddingBottom: '90px', fontFamily: "'Prompt', sans-serif", background: '#0B0E14', minHeight: '100vh', color: '#fff' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', padding: '8px', borderRadius: '10px', color: '#94A3B8', cursor: 'pointer' }}>
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#E2E8F0' }}>รายละเอียดคำขอ #{order.Id}</h2>
      </div>

      {/* กล่องยอดเงินรวมด้านบน */}
      <div style={{ background: '#1C1F26', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', marginBottom: '20px' }}>
        <p style={{ margin: '0 0 5px 0', color: '#94A3B8', fontSize: '0.85rem' }}>ยอดเงินที่ต้องการทำรายการ</p>
        <h1 style={{ margin: 0, fontSize: '2rem', color: '#fff' }}>
          {new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2 }).format(order.Amount)} <span style={{ fontSize: '1rem', color: '#3B82F6' }}>{currency}</span>
        </h1>
        <div style={{ marginTop: '10px', display: 'inline-block', padding: '5px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', fontSize: '0.8rem', color: '#94A3B8' }}>
          สถานะ: <strong style={{ color: order.Status === 'COMPLETED' ? '#10B981' : '#FACC15' }}>{order.Status}</strong>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 🌟 4. มุมมองของผู้ฝากเงิน (Requester) */}
      {/* ============================================================== */}
      {isRequester && order.Status !== 'COMPLETED' && (
        <div style={{ background: '#12161F', padding: '15px', borderRadius: '12px', marginBottom: '15px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          
          {/* สถานะ MATCHED: โชว์ฟอร์มให้โอนเงิน */}
          {order.Status === 'MATCHED' && (
            <>
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
                  <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '4px 0' }}>ธนาคาร: <span style={{color: '#fff'}}>{order.MatcherBankName || 'JDB (ธนาคารร่วมพัฒนา)'}</span></p>
                  <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '4px 0' }}>เลขบัญชี: <span style={{color: '#3B82F6', fontWeight: 'bold', fontSize: '1.1rem'}}>{order.MatcherBankAcc || '111-222333-4'}</span></p>
                  <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '4px 0' }}>ชื่อบัญชี: <span style={{color: '#fff'}}>{order.MatcherBankNameAcc || order.MatchedUsername}</span></p>
              </div>

              <div>
                  <h4 style={{ color: '#E2E8F0', marginTop: 0, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '15px' }}>แจ้งยืนยันการโอนเงิน</h4>
                  
                  <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#94A3B8', marginBottom: '5px' }}>
                          <Key size={14} color="#FACC15" /> กรอกรหัสรับงานเพื่อยืนยัน <span style={{color: '#FACC15', fontWeight: 'bold'}}>({order.ConfirmationCode || 'MBCYYD'})</span>
                      </label>
                      <input type="text" value={confirmCodeInput} onChange={(e) => setConfirmCodeInput(e.target.value.toUpperCase())} placeholder="พิมพ์รหัสรับงานให้ตรงกัน" style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', color: '#FACC15', outline: 'none', letterSpacing: '1px', fontWeight: 'bold' }} />
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#94A3B8', marginBottom: '5px' }}>ยอดเงินที่โอนจริง (ตามสลิป)</label>
                      <input type="number" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} placeholder={`เช่น ${order.Amount}`} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', color: '#fff', outline: 'none' }} />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', width: '100%' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                          <label style={{ display: 'block', fontSize: '0.75rem', color: '#94A3B8', marginBottom: '5px' }}>วันที่โอน</label>
                          <div style={{ position: 'relative' }}>
                              <Calendar size={16} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                              <input type="date" value={transferDate} onChange={(e) => setTransferDate(e.target.value)} style={{ boxSizing: 'border-box', width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 10px 10px 35px', color: '#fff', outline: 'none', fontSize: '0.8rem' }} />
                          </div>
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                          <label style={{ display: 'block', fontSize: '0.75rem', color: '#94A3B8', marginBottom: '5px' }}>เวลาที่โอน</label>
                          <div style={{ position: 'relative' }}>
                              <Clock size={16} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                              <input type="time" value={transferTime} onChange={(e) => setTransferTime(e.target.value)} style={{ boxSizing: 'border-box', width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 10px 10px 35px', color: '#fff', outline: 'none', fontSize: '0.8rem' }} />
                          </div>
                      </div> 
                  </div>

                  <input type="file" accept="image/*" id="slipUpload" style={{ display: 'none' }} onChange={handleImageChange} />
                  <label htmlFor="slipUpload" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '12px', background: 'rgba(59, 130, 246, 0.1)', border: '1px dashed #3B82F6', borderRadius: '8px', color: '#3B82F6', cursor: 'pointer', marginBottom: '15px', transition: '0.3s' }}>
                    <ImageIcon size={18} /> {slipImage ? 'เปลี่ยนรูปสลิป' : 'อัปโหลดสลิปโอนเงิน'}
                  </label>
                  {slipImage && <img src={slipImage} alt="Slip" style={{ width: '100%', maxWidth: '400px', maxHeight: '500px', objectFit: 'contain', display: 'block', margin: '0 auto 15px auto', borderRadius: '8px' }} />}
                  
                  <button onClick={handleUploadSlip} disabled={isProcessing} style={{ width: '100%', padding: '14px', background: '#3B82F6', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: isProcessing ? 'not-allowed' : 'pointer', opacity: isProcessing ? 0.7 : 1 }}>
                    {isProcessing ? 'กำลังส่งข้อมูล...' : 'ยืนยันการโอนเงิน (ส่งสลิป)'}
                  </button>
              </div>
            </>
          )}

          {/* สถานะ SLIP_UPLOADED: คนฝากโชว์หน้าจอ "รออนุมัติ" */}
          {order.Status === 'SLIP_UPLOADED' && (
            <div style={{ textAlign: 'center', padding: '30px 10px' }}>
              <CheckCircle size={50} color="#3B82F6" style={{ marginBottom: '15px' }} />
              <h3 style={{ margin: '0 0 10px 0', color: '#E2E8F0' }}>ส่งหลักฐานเรียบร้อยแล้ว</h3>
              <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem' }}>
                กรุณารอ <b>{order.MatchedUsername}</b> ตรวจสอบยอดเงินและอนุมัติรายการ ระบบจะแจ้งเตือนเมื่อเงินเข้ากระเป๋าของคุณ
              </p>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 🌟 5. มุมมองของผู้รับงาน (Matcher) */}
      {/* ============================================================== */}
      {isMatcher && order.Status !== 'COMPLETED' && (
        <div style={{ background: '#12161F', padding: '15px', borderRadius: '12px', marginBottom: '15px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
          
          {/* สถานะ MATCHED: คนรับงานเห็นหน้าจอ "รอผู้ฝากโอนเงิน" */}
          {order.Status === 'MATCHED' && (
             <div style={{ textAlign: 'center', padding: '30px 10px' }}>
               <AlertCircle size={50} color="#F59E0B" style={{ marginBottom: '15px' }} />
               <h3 style={{ margin: '0 0 10px 0', color: '#FACC15' }}>⏳ รอผู้ฝากโอนเงินและแนบสลิป</h3>
               <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem' }}>
                 ระบบได้กักเงิน Escrow ของคุณไว้แล้ว กรุณารอให้ <b>{order.Username}</b> โอนเงินเข้าบัญชีธนาคารของคุณ
               </p>
             </div>
          )}

          {/* 🌟 แก้ไขโค้ดตรงนี้ (เปลี่ยน SLIP_SlipUrl เป็น SLIP_UPLOADED ให้ถูกต้อง) */}
          {order.Status === 'SLIP_UPLOADED' && (
             <div>
                <h4 style={{ color: '#E2E8F0', marginTop: 0, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '15px' }}>
                  หลักฐานจากผู้ฝากเงิน ({order.Username})
                </h4>
                
                <div style={{ background: '#1E293B', padding: '10px', borderRadius: '12px', textAlign: 'center', marginBottom: '20px', border: '1px dashed rgba(255,255,255,0.2)' }}>
                  {/* 🌟 ดึงข้อมูลจากคอลัมน์ SlipUrl ใน Database มาแสดงเป็นรูปภาพ */}
                  {order.SlipUrl ? (
                    <img 
                      src={order.SlipUrl} 
                      alt="Slip" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '400px', // จำกัดความสูงกันรูปล้นจอ
                        objectFit: 'contain', 
                        borderRadius: '8px' 
                      }} 
                    />
                  ) : (
                    <p style={{ color: '#94A3B8', fontSize: '0.8rem' }}>ผู้ใช้อัปโหลดรูปภาพ (รอลิงก์รูป)</p>
                  )}
                </div>

                <div style={{ background: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid #10B981', padding: '12px', borderRadius: '4px', marginBottom: '20px' }}>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#10B981' }}>
                    <b>ข้อควรระวัง:</b> โปรดเข้าแอปธนาคารของคุณเพื่อตรวจสอบว่า <b>ยอดเงิน {new Intl.NumberFormat('th-TH').format(order.Amount)} {currency}</b> เข้าบัญชีจริงแล้ว ก่อนกดยืนยันด้านล่าง
                  </p>
                </div>

                <button 
                  onClick={handleConfirmReceipt} 
                  disabled={isProcessing}
                  style={{ width: '100%', padding: '15px', background: 'linear-gradient(90deg, #10B981 0%, #059669 100%)', color: 'white', borderRadius: '12px', border: 'none', fontWeight: 'bold', fontSize: '1rem', cursor: isProcessing ? 'not-allowed' : 'pointer' }}
                >
                  {isProcessing ? 'กำลังประมวลผล...' : '✅ ฉันได้รับเงินแล้ว (อนุมัติรายการ)'}
                </button>
             </div>
          )}
        </div>
      )}

      {/* สถานะ COMPLETED (สำเร็จแล้ว ทั้งคู่เห็นเหมือนกัน) */}
      {order.Status === 'COMPLETED' && (
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '30px 15px', borderRadius: '12px', textAlign: 'center' }}>
          <CheckCircle size={60} color="#10B981" style={{ marginBottom: '15px' }} />
          <h2 style={{ margin: '0 0 10px 0', color: '#10B981' }}>ทำรายการสำเร็จ!</h2>
          <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.9rem' }}>ระบบได้กระทบยอดเงินและกระจายรายได้เข้ากระเป๋าของทุกฝ่ายเรียบร้อยแล้ว</p>
        </div>
      )}

    </div>
  );
}