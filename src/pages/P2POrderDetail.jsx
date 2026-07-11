import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertTriangle, UploadCloud, Copy, Camera, User, CheckSquare } from 'lucide-react';

export default function P2POrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(false);
  const [slipImage, setSlipImage] = useState(null);
  const [myUsername, setMyUsername] = useState('');
  
  // 🌟 ข้อมูลจำลอง (เดี๋ยวเราจะมาต่อ API ดึงของจริงกันทีหลัง)
  const [order, setOrder] = useState({
    id: id || '1001',
    amount: 1500,
    status: 'MATCHED', // PENDING, MATCHED, SLIP_UPLOADED, COMPLETED
    confirmationCode: 'A8F9X',
    requesterUsername: 'userlaos', // สมมติว่านี่คือคนที่สร้างคำขอฝากเงิน
    receiverUsername: 'Admin', // สมมติว่าแอดมินเป็นคนกดรับงาน
    receiverName: 'Admin 9Plus',
    receiverBank: 'กสิกรไทย (KBank)',
    receiverAccount: '098-765432-1',
    slipUrl: null 
  });

  useEffect(() => {
     const savedProfileStr = localStorage.getItem('userProfile');
     if (savedProfileStr) {
       try {
         const parsed = JSON.parse(savedProfileStr);
         if (parsed.username) setMyUsername(parsed.username);
       } catch (e) {}
     }
  }, []);

  // 🌟 เช็กว่าคนที่เปิดหน้านี้มา คือใคร?
  const isRequester = myUsername === order.requesterUsername;
  const isReceiver = myUsername === order.receiverUsername;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setSlipImage(URL.createObjectURL(file));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('คัดลอกแล้ว: ' + text);
  };

  // 🌟 [มุมมองผู้ฝาก] กดยืนยันอัปโหลดสลิป
  const handleSubmitSlip = (e) => {
    e.preventDefault();
    if (!slipImage) return alert("กรุณาแนบรูปภาพสลิป");
    
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOrder({ ...order, status: 'SLIP_UPLOADED', slipUrl: slipImage });
      alert("✅ ส่งสลิปสำเร็จ! รอผู้ให้บริการตรวจสอบสักครู่");
    }, 1500);
  };

  // 🌟 [มุมมองผู้รับงาน] กดยืนยันว่าได้เงินจริง จบงาน
  const handleConfirmReceived = () => {
    const confirm = window.confirm("คุณได้รับเงินเข้าบัญชีตามสลิปนี้เรียบร้อยแล้วใช่หรือไม่?\n\n*หากยืนยัน ระบบจะโอนเงิน Escrow ของคุณให้ผู้ใช้งานทันที");
    if(confirm) {
        setOrder({ ...order, status: 'COMPLETED' });
        alert("🎉 ยืนยันสำเร็จ ระบบทำการกระทบยอดเรียบร้อยแล้ว!");
    }
  };

  return (
    <div className="order-detail-container">
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', padding: '8px', borderRadius: '10px', color: '#94A3B8', cursor: 'pointer' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#E2E8F0' }}>รายละเอียด P2P</h2>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.7rem', color: '#64748B' }}>
            รายการ #{order.id} • {isRequester ? 'คุณคือผู้ฝากเงิน' : (isReceiver ? 'คุณคือผู้รับงาน' : 'ผู้เยี่ยมชม')}
          </p>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <p style={{ margin: '0 0 5px 0', color: '#94A3B8', fontSize: '0.85rem' }}>ยอดเงินสุทธิ (บาท)</p>
        <h1 style={{ margin: 0, color: '#10B981', fontSize: '2.5rem' }}>
          {new Intl.NumberFormat('th-TH').format(order.amount)}
        </h1>
      </div>

      {/* ======================================= */}
      {/* 🔴 ส่วนสำหรับ "ผู้ฝากเงิน (Requester)" 🔴 */}
      {/* ======================================= */}
      {isRequester && (
        <>
          <div className="receiver-card">
            <h4 style={{ margin: '0 0 15px 0', color: '#10B981', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
              <CheckCircle size={18} /> ข้อมูลผู้ให้บริการ (โอนเข้าบัญชีนี้)
            </h4>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '12px', marginBottom: '15px' }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '0.75rem', color: '#94A3B8' }}>ธนาคาร</p>
              <p style={{ margin: '0 0 15px 0', fontSize: '0.95rem', fontWeight: 'bold' }}>{order.receiverBank}</p>
              
              <p style={{ margin: '0 0 5px 0', fontSize: '0.75rem', color: '#94A3B8' }}>ชื่อบัญชี</p>
              <p style={{ margin: '0 0 15px 0', fontSize: '0.95rem', fontWeight: 'bold' }}>{order.receiverName}</p>
              
              <p style={{ margin: '0 0 5px 0', fontSize: '0.75rem', color: '#94A3B8' }}>เลขบัญชี</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '1px', color: '#60A5FA' }}>{order.receiverAccount}</p>
                <button onClick={() => copyToClipboard(order.receiverAccount)} style={{ background: 'rgba(96, 165, 250, 0.1)', border: 'none', padding: '6px 10px', borderRadius: '8px', color: '#60A5FA', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Copy size={14} /> คัดลอก
                </button>
              </div>
            </div>
            <p style={{ margin: '0 0 5px 0', fontSize: '0.8rem', color: '#94A3B8', textAlign: 'center' }}>รหัสยืนยันความปลอดภัย (ใส่ในบันทึกช่วยจำ)</p>
            <div className="conf-code-box">{order.confirmationCode}</div>
          </div>

          {order.status === 'MATCHED' && (
             <form onSubmit={handleSubmitSlip}>
                <label className="upload-slip-box" style={{ display: slipImage ? 'none' : 'block' }}>
                  <Camera size={40} color="#64748B" style={{ margin: '0 auto 10px auto' }} />
                  <h4 style={{ margin: '0 0 5px 0', color: '#E2E8F0' }}>อัปโหลดสลิปการโอนเงิน</h4>
                  <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                </label>
                {slipImage && (
                  <div style={{ position: 'relative' }}>
                    <button type="button" onClick={() => setSlipImage(null)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', padding: '5px 10px', borderRadius: '8px', cursor: 'pointer' }}>เปลี่ยนรูป</button>
                    <img src={slipImage} alt="Slip Preview" className="slip-preview" />
                  </div>
                )}
                <button type="submit" disabled={loading || !slipImage} style={{ width: '100%', background: loading || !slipImage ? '#64748B' : 'linear-gradient(90deg, #3B82F6 0%, #2563EB 100%)', color: '#fff', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: 'bold', cursor: loading || !slipImage ? 'not-allowed' : 'pointer' }}>
                  {loading ? 'กำลังส่งข้อมูล...' : 'ฉันโอนเงินแล้ว (ส่งสลิป)'}
                </button>
             </form>
          )}

          {order.status === 'SLIP_UPLOADED' && (
            <div style={{ textAlign: 'center', padding: '30px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px' }}>
              <CheckCircle size={40} color="#10B981" style={{ margin: '0 auto 10px auto' }} />
              <h3 style={{ margin: '0 0 5px 0', color: '#10B981' }}>รอผู้ให้บริการตรวจสอบ</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#A7F3D0' }}>กรุณารอสักครู่ ระบบจะเติมเงินให้อัตโนมัติ</p>
            </div>
          )}
        </>
      )}

      {/* ======================================= */}
      {/* 🔵 ส่วนสำหรับ "ผู้รับงาน (Receiver)" 🔵 */}
      {/* ======================================= */}
      {isReceiver && (
        <>
          <div style={{ background: '#1C1F26', padding: '15px', borderRadius: '12px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
             <p style={{ margin: '0 0 5px 0', fontSize: '0.8rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '5px' }}><User size={14}/> ผู้ที่ต้องการฝากเงิน</p>
             <h3 style={{ margin: 0, color: '#fff' }}>@{order.requesterUsername}</h3>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#E2E8F0' }}>รหัสยืนยันของงานนี้ (ใช้ตรวจสลิป)</p>
            <div className="conf-code-box" style={{ margin: 0 }}>{order.confirmationCode}</div>
          </div>

          {order.status === 'MATCHED' && (
             <div style={{ textAlign: 'center', padding: '30px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '16px', border: '1px dashed #3B82F6' }}>
                <Clock size={40} color="#3B82F6" style={{ margin: '0 auto 10px auto' }} />
                <h3 style={{ margin: '0 0 5px 0', color: '#60A5FA' }}>รอผู้ใช้งานโอนเงิน...</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#93C5FD' }}>เมื่อผู้ใช้งานส่งสลิป สลิปจะปรากฏที่นี่</p>
             </div>
          )}

          {order.status === 'SLIP_UPLOADED' && (
             <div>
                <h4 style={{ margin: '0 0 10px 0', color: '#E2E8F0' }}>สลิปหลักฐานการโอน</h4>
                <img src={order.slipUrl} alt="Slip" style={{ width: '100%', borderRadius: '12px', border: '2px solid #10B981', marginBottom: '20px' }} />
                
                <button 
                  onClick={handleConfirmReceived}
                  style={{ width: '100%', background: 'linear-gradient(90deg, #10B981 0%, #059669 100%)', color: '#fff', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.3)' }}
                >
                  <CheckSquare size={20} /> ยืนยันได้รับยอดเงินครบถ้วน
                </button>
             </div>
          )}
        </>
      )}

      {/* ======================================= */}
      {/* 🟢 เมื่อสถานะเสร็จสมบูรณ์ (โชว์ให้เห็นทั้งคู่) 🟢 */}
      {/* ======================================= */}
      {order.status === 'COMPLETED' && (
        <div style={{ textAlign: 'center', padding: '40px 20px', background: 'linear-gradient(145deg, #064E3B 0%, #022C22 100%)', borderRadius: '16px', border: '1px solid #10B981' }}>
          <CheckCircle size={60} color="#34D399" style={{ margin: '0 auto 15px auto' }} />
          <h2 style={{ margin: '0 0 10px 0', color: '#34D399' }}>ทำรายการสำเร็จ!</h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#A7F3D0' }}>เงินถูกโอนเข้ากระเป๋าผู้รับและกระทบยอดเรียบร้อยแล้ว</p>
        </div>
      )}

    </div>
  );
}