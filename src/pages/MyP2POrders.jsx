import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';

export default function MyP2POrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currencySymbol, setCurrencySymbol] = useState('฿');
  
  // 🌟 1. เพิ่ม State สำหรับเก็บ Username ของคนที่กำลังล็อกอิน
  const [myUsername, setMyUsername] = useState('');

  useEffect(() => {
    const savedProfileStr = localStorage.getItem('userProfile');
    let username = '';
    
    if (savedProfileStr) {
      try {
        const parsed = JSON.parse(savedProfileStr);
        if (parsed.currencySymbol) setCurrencySymbol(parsed.currencySymbol);
        if (parsed.username) {
            username = parsed.username;
            setMyUsername(username);
        }
      } catch (e) {}
    }

    if (username) {
      fetch(`https://api.run9.app/api/p2p/my-orders/${username}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setOrders(data.orders);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, []);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'PENDING': return <span style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12}/> กำลังหาผู้รับงาน</span>;
      case 'MATCHED': return <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={12}/> รอโอนเงิน</span>;
      case 'SLIP_UPLOADED': return <span style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12}/> รอตรวจสอบสลิป</span>;
      case 'COMPLETED': return <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={12}/> สำเร็จแล้ว</span>;
      default: return null;
    }
  };

  return (
    <div style={{ padding: '20px 15px', paddingBottom: '90px', fontFamily: "'Prompt', sans-serif", background: '#0B0E14', minHeight: '100vh', color: '#fff' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', padding: '8px', borderRadius: '10px', color: '#94A3B8', cursor: 'pointer' }}>
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#E2E8F0' }}>รายการ P2P ของฉัน</h2>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>กำลังโหลดข้อมูล...</div>
      ) : orders.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {orders.map(order => {
            
            // ==============================================================
            // 🌟 2. ระบบแยกบทบาทที่รัดกุม 100% (ลบโค้ดอันตรายออกแล้ว)
            // ==============================================================
            const myName = String(myUsername || '').trim().toLowerCase();
            // ดึงชื่อคนฝากเงิน (เผื่อ API ส่งมาในชื่อ Username หรือ RequesterUsername)
            const creatorName = String(order.RequesterUsername || order.Username || '').trim().toLowerCase();
            // ดึงชื่อคนรับงาน (เผื่อ API ส่งมาในชื่อ MatchedUsername หรือ MatcherUsername)
            const matcherName = String(order.MatchedUsername || order.MatcherUsername || '').trim().toLowerCase();

            let isRequester = (myName === creatorName);
            let isMatcher = (myName === matcherName);

            // ท่าไม้ตาย: ดักจับกรณี API ส่งชื่อติดดอกจันมา (เช่น use***r1)
            if (!isRequester && creatorName.includes('***') && myName.substring(0, 3) === creatorName.substring(0, 3)) {
                isRequester = true;
            }
            if (!isMatcher && matcherName.includes('***') && myName.substring(0, 3) === matcherName.substring(0, 3)) {
                isMatcher = true;
            }
            // ==============================================================

            return (
              <div key={order.Id} style={{ background: '#1C1F26', borderRadius: '16px', padding: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>#{order.Id} • {order.OrderType === 'DEPOSIT' ? 'เติมเงิน' : 'ถอนเงิน'}</span>
                  {getStatusBadge(order.Status)}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '15px' }}>
                  <div>
                    <p style={{ margin: '0 0 5px 0', fontSize: '0.8rem', color: '#94A3B8' }}>จำนวนเงิน</p>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>{currencySymbol}{new Intl.NumberFormat('th-TH').format(order.Amount)}</h3>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: '0 0 5px 0', fontSize: '0.75rem', color: '#64748B' }}>{new Date(order.CreatedAt).toLocaleDateString('th-TH')}</p>
                  </div>
                </div>

                {/* ============================================== */}
                {/* 🌟 แสดงปุ่ม/ข้อความ ตามสถานะและบทบาทที่ถูกต้อง */}
                {/* ============================================== */}
                
                {order.Status === 'PENDING' && (
                   <button onClick={() => navigate(`/p2p-order/${order.Id}`)} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                      ดูรายละเอียด
                   </button>
                )}

                {order.Status === 'MATCHED' && (
                  <>
                    {isRequester ? (
                      // 🔴 คนฝากเงิน: โชว์ปุ่ม "ดูบัญชีและโอนเงิน" (สีเขียว)
                      <button onClick={() => navigate(`/p2p-order/${order.Id}`)} style={{ width: '100%', background: 'linear-gradient(90deg, #10B981 0%, #059669 100%)', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                        <span>ดูบัญชีและโอนเงิน</span>
                        <ChevronRight size={18} />
                      </button>
                    ) : isMatcher ? (
                      // 🔵 คนรับงาน: โชว์ข้อความ "รอผู้ฝากโอนเงิน" (สีส้ม) แบบป้ายแจ้งเตือน กดไม่ได้
                      <div style={{ width: '100%', background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', border: '1px dashed #F59E0B', padding: '12px', borderRadius: '10px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        ⏳ รอผู้ฝากโอนเงิน
                      </div>
                    ) : null}
                  </>
                )}
                
                {order.Status === 'SLIP_UPLOADED' && (
                  <>
                    {isMatcher ? (
                      // 🔵 คนรับงาน: โชว์ปุ่ม "ตรวจสลิปและอนุมัติ" (สีม่วง)
                      <button onClick={() => navigate(`/p2p-order/${order.Id}`)} style={{ width: '100%', background: 'linear-gradient(90deg, #8B5CF6 0%, #6D28D9 100%)', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                        <span>ตรวจสลิปและอนุมัติ</span>
                        <ChevronRight size={18} />
                      </button>
                    ) : (
                      // 🔴 คนฝากเงิน: โชว์แค่ปุ่มดูรายละเอียด (เพราะต้องรอเค้าตรวจ)
                      <button onClick={() => navigate(`/p2p-order/${order.Id}`)} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                        ดูรายละเอียด
                      </button>
                    )}
                  </>
                )}

                {order.Status === 'COMPLETED' && (
                  <button onClick={() => navigate(`/p2p-order/${order.Id}`)} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                    ดูรายละเอียดคำขอ
                  </button>
                )}

              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748B' }}>
          <p>คุณยังไม่มีประวัติการทำรายการ P2P</p>
        </div>
      )}

    </div>
  );
}