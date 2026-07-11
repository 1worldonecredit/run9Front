import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertTriangle, UploadCloud, Copy, Camera } from 'lucide-react';

export default function P2POrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams(); // รับ ID ของรายการจาก URL
  
  const [loading, setLoading] = useState(false);
  const [slipImage, setSlipImage] = useState(null);
  
  // 🌟 ข้อมูลจำลอง (Mock Data) เดี๋ยวเราค่อยต่อ API จริง
  const [order, setOrder] = useState({
    id: id || '1001',
    amount: 1500,
    status: 'MATCHED', // PENDING, MATCHED, SLIP_UPLOADED, COMPLETED
    confirmationCode: 'A8F9X',
    receiverName: 'Admin 9Plus',
    receiverBank: 'กสิกรไทย (KBank)',
    receiverAccount: '098-765432-1',
  });

  // ฟังก์ชันจำลองการเลือกรูปสลิป
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSlipImage(URL.createObjectURL(file)); // พรีวิวรูปทันที
    }
  };

  // ฟังก์ชันก๊อปปี้เลขบัญชี
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('คัดลอกเลขบัญชีแล้ว: ' + text);
  };

  // ฟังก์ชันกดยืนยันอัปโหลดสลิป
  const handleSubmitSlip = (e) => {
    e.preventDefault();
    if (!slipImage) {
      alert("กรุณาแนบรูปภาพสลิปการโอนเงิน");
      return;
    }
    
    // 🌟 จำลองการโหลดส่งข้อมูล
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOrder({ ...order, status: 'SLIP_UPLOADED' });
      alert("✅ อัปโหลดสลิปสำเร็จ! กรุณารอแอดมินหรือผู้รับงานตรวจสอบ");
    }, 1500);
  };

  return (
    <div className="order-detail-container">
      
      {/* 🌟 Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', padding: '8px', borderRadius: '10px', color: '#94A3B8', cursor: 'pointer' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#E2E8F0' }}>รายละเอียดการโอนเงิน</h2>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.7rem', color: '#64748B' }}>รายการ P2P #{order.id}</p>
        </div>
      </div>

      {/* 🌟 เตือนยอดเงินที่ต้องโอน */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <p style={{ margin: '0 0 5px 0', color: '#94A3B8', fontSize: '0.85rem' }}>ยอดเงินที่ต้องโอน (บาท)</p>
        <h1 style={{ margin: 0, color: '#10B981', fontSize: '2.5rem' }}>
          {new Intl.NumberFormat('th-TH').format(order.amount)}
        </h1>
      </div>

      {/* 🌟 บัญชีผู้รับเงิน (คนที่กดรับงาน) */}
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
            <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '1px', color: '#60A5FA' }}>
              {order.receiverAccount}
            </p>
            <button onClick={() => copyToClipboard(order.receiverAccount)} style={{ background: 'rgba(96, 165, 250, 0.1)', border: 'none', padding: '6px 10px', borderRadius: '8px', color: '#60A5FA', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Copy size={14} /> คัดลอก
            </button>
          </div>
        </div>

        {/* รหัสยืนยัน */}
        <p style={{ margin: '0 0 5px 0', fontSize: '0.8rem', color: '#94A3B8', textAlign: 'center' }}>รหัสยืนยัน (ระบุในบันทึกช่วยจำถ้ามี)</p>
        <div className="conf-code-box">
          {order.confirmationCode}
        </div>
      </div>

      {/* 🌟 กล่องอัปโหลดสลิป (จะซ่อนเมื่อส่งสลิปแล้ว) */}
      {order.status === 'MATCHED' ? (
        <form onSubmit={handleSubmitSlip}>
          
          <div style={{ display: 'flex', gap: '10px', background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '10px', marginBottom: '20px' }}>
            <AlertTriangle size={24} color="#EF4444" style={{ flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#FCA5A5', lineHeight: '1.5' }}>
              กรุณาโอนเงินให้ตรงกับยอด <b>{new Intl.NumberFormat('th-TH').format(order.amount)}</b> พอดีเท่านั้น หากโอนผิดยอด ระบบอาจไม่สามารถตรวจสอบอัตโนมัติได้
            </p>
          </div>

          <label className="upload-slip-box" style={{ display: slipImage ? 'none' : 'block' }}>
            <Camera size={40} color="#64748B" style={{ margin: '0 auto 10px auto' }} />
            <h4 style={{ margin: '0 0 5px 0', color: '#E2E8F0' }}>อัปโหลดสลิปการโอนเงิน</h4>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B' }}>คลิกเพื่อเลือกรูปภาพจากเครื่องของคุณ</p>
            <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
          </label>

          {slipImage && (
            <div style={{ position: 'relative' }}>
              <button 
                type="button" 
                onClick={() => setSlipImage(null)} 
                style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', padding: '5px 10px', borderRadius: '8px', cursor: 'pointer' }}
              >
                เปลี่ยนรูป
              </button>
              <img src={slipImage} alt="Slip Preview" className="slip-preview" />
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading || !slipImage}
            style={{ 
              width: '100%', 
              background: loading || !slipImage ? '#64748B' : 'linear-gradient(90deg, #3B82F6 0%, #2563EB 100%)', 
              color: '#fff', 
              border: 'none', 
              padding: '15px', 
              borderRadius: '12px', 
              fontWeight: 'bold', 
              fontSize: '1rem',
              cursor: loading || !slipImage ? 'not-allowed' : 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px',
              transition: '0.3s'
            }}
          >
            {loading ? 'กำลังอัปโหลด...' : (
              <>ยืนยันการโอนเงิน <UploadCloud size={20} /></>
            )}
          </button>
        </form>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <CheckCircle size={50} color="#10B981" style={{ margin: '0 auto 15px auto' }} />
          <h3 style={{ margin: '0 0 10px 0', color: '#10B981' }}>ส่งหลักฐานสำเร็จ</h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#A7F3D0' }}>กรุณารอระบบหรือผู้รับงานตรวจสอบยอดเงินสักครู่...</p>
        </div>
      )}

    </div>
  );
}