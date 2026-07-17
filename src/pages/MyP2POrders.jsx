import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, AlertCircle, ChevronRight, Timer } from 'lucide-react';

export default function MyP2POrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currencySymbol, setCurrencySymbol] = useState('฿');
  
  // 🌟 เพิ่ม State สำหรับนับเวลาปัจจุบันของเครื่องลูกค้า
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [myUsername, setMyUsername] = useState('');

  // ฟังก์ชันดึงข้อมูล
  const fetchMyOrders = (username) => {
    fetch(`https://api.run9.app/api/p2p/my-orders/${username}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // 🌟 รับค่า ElapsedSeconds มาแปลงเป็นเวลาหมดอายุ
          const processedOrders = data.orders.map(o => ({
            ...o,
            // 300 วินาที = 5 นาที (แก้ตัวเลขตรงนี้ได้ถ้าต้องการเปลี่ยนเวลา)
            localExpireTimestamp: Date.now() + ((1200 - (o.ElapsedSeconds || 0)) * 1000)
          }));
          setOrders(processedOrders);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

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
      fetchMyOrders(username);
      // 🌟 ให้รีเฟรชข้อมูลทุกๆ 10 วินาที เผื่อมีคนรับงาน
      const intervalData = setInterval(() => fetchMyOrders(username), 10000);
      return () => clearInterval(intervalData);
    }
  }, []);

  // 🌟 อัปเดตเวลาปัจจุบันทุก 1 วินาทีเพื่อให้นาฬิกาเดิน
  useEffect(() => {
    const intervalTime = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(intervalTime);
  }, []);

  // 🌟 ฟังก์ชันคำนวณเวลานับถอยหลัง
  const getCountdown = (localExpireTimestamp) => {
    if (!localExpireTimestamp) return null;
    const diff = localExpireTimestamp - currentTime.getTime();

    if (diff <= 0) return <span style={{ color: '#EF4444', fontWeight: 'bold' }}>หมดเวลา</span>;

    const minutes = Math.floor((diff / 1000) / 60);
    const seconds = Math.floor((diff / 1000) % 60);
    
    return <span>{minutes} น. {seconds} วิ.</span>;
  };

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
            
            const myName = String(myUsername || '').trim().toLowerCase();
            const creatorName = String(order.Username || order.RequesterUsername || '').trim().toLowerCase();
            const matcherName = String(order.MatchedUsername || order.MatcherUsername || '').trim().toLowerCase();

            let isRequester = (myName === creatorName);
            let isMatcher = (myName === matcherName);

            if (!isRequester && creatorName.includes('***') && myName.substring(0, 3) === creatorName.substring(0, 3)) {
                isRequester = true;
            }
            if (!isMatcher && matcherName.includes('***') && myName.substring(0, 3) === matcherName.substring(0, 3)) {
                isMatcher = true;
            }
            if (!isRequester && !isMatcher) {
                isRequester = !isMatcher; 
            }

            return (
              <div key={order.Id} style={{ background: '#1C1F26', borderRadius: '16px', padding: '15px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                
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
                    {/* 🌟 แสดงเวลานับถอยหลังแทนวันที่ หากสถานะเป็น PENDING */}
                    {order.Status === 'PENDING' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#F59E0B', fontSize: '0.85rem', background: 'rgba(245, 158, 11, 0.1)', padding: '4px 10px', borderRadius: '20px' }}>
                            <Timer size={14} />
                            {getCountdown(order.localExpireTimestamp)}
                        </div>
                    ) : (
                        <p style={{ margin: '0 0 5px 0', fontSize: '0.75rem', color: '#64748B' }}>{new Date(order.CreatedAt).toLocaleDateString('th-TH')}</p>
                    )}
                  </div>
                </div>

                {order.Status === 'MATCHED' && (
                  <>
                    {isRequester ? (
                      <button 
                        onClick={() => navigate(`/p2p-order/${order.Id}`)} 
                        style={{ width: '100%', background: 'linear-gradient(90deg, #10B981 0%, #059669 100%)', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                      >
                        <span>ดูบัญชีและโอนเงิน</span>
                        <ChevronRight size={18} />
                      </button>
                    ) : isMatcher ? (
                      <div style={{ width: '100%', background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', border: '1px dashed #F59E0B', padding: '12px', borderRadius: '10px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        ⏳ รอผู้ฝากโอนเงิน
                      </div>
                    ) : null}
                  </>
                )}
                
                {order.Status === 'SLIP_UPLOADED' && (
                  <>
                    {isMatcher ? (
                      <button 
                        onClick={() => navigate(`/p2p-order/${order.Id}`)}
                        style={{ width: '100%', background: 'linear-gradient(90deg, #8B5CF6 0%, #6D28D9 100%)', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                      >
                        <span>ตรวจสลิปและอนุมัติ</span>
                        <ChevronRight size={18} />
                      </button>
                    ) : (
                      <button 
                        onClick={() => navigate(`/p2p-order/${order.Id}`)}
                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '10px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}
                      >
                        ดูรายละเอียด
                      </button>
                    )}
                  </>
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