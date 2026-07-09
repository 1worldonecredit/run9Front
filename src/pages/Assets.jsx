import React, { useState, useEffect } from 'react';
import { Wallet, ArrowDownCircle, Gift, Calendar, ChevronLeft, ChevronRight, Download, Upload, FileText, Send, ScanLine, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Assets() {
  const navigate = useNavigate();

  const [data, setData] = useState({ balance: 0, currency: 'THB', lastUpdated: null, transactions: [], totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [showStatement, setShowStatement] = useState(false); 
  
  // 🌟 เปลี่ยนชื่อตัวแปรเป็น pendingDividend (เงินปันผลสะสม)
  const [pendingDividend, setPendingDividend] = useState(0);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(currentMonth); 
  const [page, setPage] = useState(1);

  const userStr = localStorage.getItem('user') || localStorage.getItem('userProfile');
  const userId = userStr ? (JSON.parse(userStr).Id || JSON.parse(userStr).id) : 1;

  const fetchAssets = () => {
    setLoading(true);
    let url = `https://api.run9.app/api/wallet/assets/${userId}?page=${page}&limit=20`;
    if (month) url += `&month=${month}`;

    fetch(url)
      .then(res => res.json())
      .then(result => {
        if (result.success) setData(result);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching assets:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAssets();
  }, [page, month]);

  // 🌟 ฟังก์ชันคำนวณเงินปันผลแบบ Real-time (ทำงานทุกๆ 0.1 วินาที)
  useEffect(() => {
    if (data.balance > 0 && data.lastUpdated) {
      const rate = 0.10; // 10% ต่อปี
      const lastUpdateDate = new Date(data.lastUpdated).getTime(); // แปลงเวลาล่าสุดเป็นมิลลิวินาที

      // สั่งให้คำนวณใหม่ทุกๆ 100 มิลลิวินาที (0.1 วินาที)
      const intervalId = setInterval(() => {
        const now = Date.now(); // เวลาปัจจุบันของเครื่อง
        const diffTime = Math.max(0, now - lastUpdateDate); // ระยะเวลาที่ผ่านไป
        const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365); // แปลงเป็นจำนวนปี
        
        // เงินต้น * 10% * สัดส่วนของปี
        setPendingDividend(data.balance * rate * diffYears);
      }, 100);

      // คืนค่าเพื่อล้างการทำงานเดิมเวลาคอมโพเนนต์ถูกรีเฟรช (ป้องกัน Memory Leak)
      return () => clearInterval(intervalId);
    } else {
      setPendingDividend(0);
    }
  }, [data.balance, data.lastUpdated]);

  const getTransactionFormat = (type) => {
    switch(type) {
      case 'GAME_PRIZE': 
        return { icon: <Gift size={16} color="#10B981" />, label: 'ถูกรางวัลสอยดาว', bg: 'rgba(16, 185, 129, 0.1)', color: '#10B981', sign: '+' };
      case 'DEPOSIT': 
        return { icon: <Download size={16} color="#3B82F6" />, label: 'เติมเงิน', bg: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', sign: '+' };
      case 'WITHDRAWAL': 
        return { icon: <Upload size={16} color="#EF4444" />, label: 'ถอนเงิน', bg: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', sign: '-' };
      case 'DIVIDEND': // เปลี่ยนเป็น DIVIDEND
        return { icon: <TrendingUp size={16} color="#F59E0B" />, label: 'รับเงินปันผล', bg: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', sign: '+' };
      default:
        return { icon: <Wallet size={16} color="#94A3B8" />, label: 'ทำรายการ', bg: 'rgba(148, 163, 184, 0.1)', color: '#94A3B8', sign: '' };
    }
  };

  const getCurrencySymbol = (currencyCode) => {
    const symbols = { 'THB': '฿', 'LAK': '₭', 'USD': '$' };
    return symbols[currencyCode] || '฿';
  };

  if (loading && data.transactions.length === 0) {
    return <div style={{ textAlign: 'center', padding: '50px', color: '#94A3B8' }}>กำลังโหลดข้อมูลกระเป๋าเงิน...</div>;
  }

  const currencySymbol = getCurrencySymbol(data.currency);

  return (
    <div style={{ padding: '15px', paddingBottom: '80px', fontFamily: "'Prompt', sans-serif", background: '#0B0E14', minHeight: '100vh', color: '#fff' }}>
      
      {/* 💳 ส่วนยอดเงินและเงินปันผล: แบ่งเป็น 2 การ์ด ซ้าย-ขวา */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        
        {/* การ์ด 1: ยอดเงินคงเหลือ */}
        <div style={{ background: 'linear-gradient(180deg, #1A1F2B 0%, #12161F 100%)', padding: '15px', borderRadius: '16px', boxShadow: '0 8px 20px rgba(0,0,0,0.4)', border: '1px solid rgba(50, 100, 255, 0.2)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-25px', right: '-25px', width: '70px', height: '70px', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', borderRadius: '50%' }}></div>
          <p style={{ margin: '0 0 4px 0', fontSize: '0.6rem', color: '#94A3B8', letterSpacing: '0.5px' }}>ยอดเงินคงเหลือ</p>
          <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold', color: '#FACC15', textShadow: '0 0 10px rgba(250, 204, 21, 0.2)' }}>
            {currencySymbol}{new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(data.balance)}
          </h1>
        </div>

        {/* การ์ด 2: เงินปันผลสะสม (โชว์ทศนิยม 6 ตำแหน่งให้เห็นตัวเลขวิ่ง) */}
        <div style={{ background: 'linear-gradient(180deg, #1A1F2B 0%, #12161F 100%)', padding: '15px', borderRadius: '16px', boxShadow: '0 8px 20px rgba(0,0,0,0.4)', border: '1px solid rgba(16, 185, 129, 0.2)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-25px', right: '-25px', width: '70px', height: '70px', background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)', borderRadius: '50%' }}></div>
          <p style={{ margin: '0 0 4px 0', fontSize: '0.6rem', color: '#10B981', letterSpacing: '0.5px' }}>เงินปันผลสะสม (10%/ปี)</p>
          <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold', color: '#10B981', textShadow: '0 0 10px rgba(16, 185, 129, 0.2)' }}>
            +{currencySymbol}{new Intl.NumberFormat('th-TH', { minimumFractionDigits: 6, maximumFractionDigits: 6 }).format(pendingDividend)}
          </h1>
        </div>

      </div>

      {/* 🌟 ปุ่มเมนู 4 ปุ่ม */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => navigate('/deposit')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 5px', borderRadius: '14px', background: 'linear-gradient(180deg, #1A1F2B 0%, #12161F 100%)', border: '1px solid rgba(59, 130, 246, 0.2)', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '8px', borderRadius: '50%' }}><Download size={18} color="#3B82F6" /></div>
          <span style={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 'bold' }}>เติมเงิน</span>
        </button>
        
        <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 5px', borderRadius: '14px', background: 'linear-gradient(180deg, #1A1F2B 0%, #12161F 100%)', border: '1px solid rgba(239, 68, 68, 0.2)', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '8px', borderRadius: '50%' }}><Upload size={18} color="#EF4444" /></div>
          <span style={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 'bold' }}>ถอนเงิน</span>
        </button>

        <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 5px', borderRadius: '14px', background: 'linear-gradient(180deg, #1A1F2B 0%, #12161F 100%)', border: '1px solid rgba(16, 185, 129, 0.2)', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '8px', borderRadius: '50%' }}><Send size={18} color="#10B981" /></div>
          <span style={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 'bold' }}>โอนเงิน</span>
        </button>

        <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 5px', borderRadius: '14px', background: 'linear-gradient(180deg, #1A1F2B 0%, #12161F 100%)', border: '1px solid rgba(245, 158, 11, 0.2)', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '8px', borderRadius: '50%' }}><ScanLine size={18} color="#F59E0B" /></div>
          <span style={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 'bold' }}>สแกนจ่าย</span>
        </button>
      </div>

      {/* 🌟 ปุ่มเปิด-ปิด Statement */}
      <button 
        onClick={() => setShowStatement(!showStatement)}
        style={{ 
          width: '100%', padding: '12px', borderRadius: '12px', background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.1), transparent)', 
          border: '1px solid rgba(59, 130, 246, 0.3)', color: '#60A5FA', display: 'flex', justifyContent: 'center', alignItems: 'center', 
          gap: '8px', cursor: 'pointer', marginBottom: '20px'
        }}
      >
        <FileText size={16} /> 
        <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{showStatement ? 'ซ่อนรายการย้อนหลัง' : 'ดูรายการย้อนหลัง (Statement)'}</span>
      </button>

      {/* 📄 ส่วนล่าง: Statement */}
      {showStatement && (
        <div style={{ animation: 'fadeIn 0.3s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, color: '#E2E8F0', fontSize: '0.85rem' }}>รายการทั้งหมด</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Calendar size={14} color="#94A3B8" />
              <input 
                type="month" 
                value={month} 
                onChange={(e) => { setMonth(e.target.value); setPage(1); }} 
                style={{ border: 'none', background: 'transparent', outline: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '0.75rem' }}
              />
            </div>
          </div>

          {data.transactions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.transactions.map((tx) => {
                const format = getTransactionFormat(tx.TransactionType);
                const isIncome = format.sign === '+';
                
                return (
                  <div key={tx.Id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(180deg, #1A1F2B 0%, #12161F 100%)', padding: '12px 15px', borderRadius: '16px', border: '1px solid rgba(50, 100, 255, 0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ background: format.bg, padding: '8px', borderRadius: '50%' }}>
                        {format.icon}
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 2px 0', color: '#E2E8F0', fontSize: '0.75rem' }}>{format.label}</h4>
                        <p style={{ margin: 0, fontSize: '0.6rem', color: '#64748B' }}>
                          {new Date(tx.CreatedAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <h3 style={{ margin: '0 0 2px 0', fontSize: '0.8rem', color: isIncome ? '#10B981' : '#EF4444' }}>
                        {format.sign}{currencySymbol}{new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2 }).format(tx.Amount)}
                      </h3>
                      <p style={{ margin: 0, fontSize: '0.6rem', color: '#64748B' }}>สำเร็จ</p>
                    </div>
                  </div>
                );
              })}

              {data.totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '15px' }}>
                  <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))} 
                    disabled={page === 1}
                    style={{ background: 'rgba(255,255,255,0.05)', border: 'none', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1, padding: '6px 10px', borderRadius: '8px', color: '#fff' }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span style={{ color: '#94A3B8', fontSize: '0.75rem' }}>หน้า {page} จาก {data.totalPages}</span>
                  <button 
                    onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} 
                    disabled={page === data.totalPages}
                    style={{ background: 'rgba(255,255,255,0.05)', border: 'none', cursor: page === data.totalPages ? 'not-allowed' : 'pointer', opacity: page === data.totalPages ? 0.5 : 1, padding: '6px 10px', borderRadius: '8px', color: '#fff' }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '25px', color: '#64748B', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <ArrowDownCircle size={24} style={{ opacity: 0.3, marginBottom: '10px' }} />
              <p style={{ margin: 0, fontSize: '0.75rem' }}>ไม่พบประวัติการทำรายการในเดือนนี้</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}