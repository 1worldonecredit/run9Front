import React, { useState, useEffect } from 'react';
import { Wallet, ArrowDownCircle, Gift, Calendar, ChevronLeft, ChevronRight, Download, Upload, FileText, Send, ScanLine, TrendingUp, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Assets() {
  const navigate = useNavigate();

  const [data, setData] = useState({ balance: 0, lastUpdated: null, transactions: [], totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [showStatement, setShowStatement] = useState(false); 
  const [pendingDividend, setPendingDividend] = useState(0);
  
  const [userProfile, setUserProfile] = useState({ username: '', currencySymbol: '฿', currencyCode: 'THB' });

  const currentMonth = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(currentMonth); 
  const [page, setPage] = useState(1);

  useEffect(() => {
    const savedProfileStr = localStorage.getItem('userProfile');
    if (savedProfileStr) {
      try {
        const parsed = JSON.parse(savedProfileStr);
        setUserProfile({
          username: parsed.username,
          currencySymbol: parsed.currencySymbol || '฿',
          currencyCode: parsed.currencyCode || 'THB'
        });
      } catch (e) {
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchAssets = () => {
    if (!userProfile.username) return; 
    setLoading(true);
    let url = `https://api.run9.app/api/wallet/assets/${userProfile.username}?page=${page}&limit=20`;
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
  }, [page, month, userProfile.username]);

  useEffect(() => {
    if (data.balance > 0 && data.lastUpdated) {
      const rate = 0.10; 
      const lastUpdateDate = new Date(data.lastUpdated).getTime();
      const intervalId = setInterval(() => {
        const now = Date.now();
        const diffTime = Math.max(0, now - lastUpdateDate);
        const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365);
        setPendingDividend(data.balance * rate * diffYears);
      }, 100);
      return () => clearInterval(intervalId);
    } else {
      setPendingDividend(0);
    }
  }, [data.balance, data.lastUpdated]);

  const getTransactionFormat = (type) => {
    switch(type) {
      case 'GAME_PRIZE': return { icon: <Gift size={16} color="#10B981" />, label: 'ถูกรางวัลสอยดาว', bg: 'rgba(16, 185, 129, 0.1)', color: '#10B981', sign: '+' };
      case 'DEPOSIT': return { icon: <Download size={16} color="#3B82F6" />, label: 'เติมเงิน (P2P)', bg: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', sign: '+' };
      case 'WITHDRAWAL': return { icon: <Upload size={16} color="#EF4444" />, label: 'ถอนเงิน (P2P)', bg: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', sign: '-' };
     // 🌟 [เพิ่มตรงนี้] รายการแสดงเงินค้ำประกันที่โอนให้ผู้ฝาก (ฝั่งคนรับงานจะเห็นรายการนี้)
      case 'P2P_TRANSFER_OUT': return { icon: <Upload size={16} color="#F97316" />, label: 'โอนค้ำประกัน (P2P)', bg: 'rgba(249, 115, 22, 0.1)', color: '#F97316', sign: '-' };
      case 'DIVIDEND': return { icon: <TrendingUp size={16} color="#F59E0B" />, label: 'รับเงินปันผล', bg: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', sign: '+' };
      // 🌟 เพิ่มประเภทรายการใหม่สำหรับผู้รับงาน และ ผู้แนะนำ
      case 'P2P_REWARD': return { icon: <Gift size={16} color="#8B5CF6" />, label: 'รายได้ผู้รับงาน P2P', bg: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6', sign: '+' };
      case 'AFFILIATE_P2P': return { icon: <Users size={16} color="#EC4899" />, label: 'ค่าคอมมิชชั่นสายงาน', bg: 'rgba(236, 72, 153, 0.1)', color: '#EC4899', sign: '+' };
      default: return { icon: <Wallet size={16} color="#94A3B8" />, label: 'ทำรายการ', bg: 'rgba(148, 163, 184, 0.1)', color: '#94A3B8', sign: '' };
    }
  };

  if (loading && data.transactions.length === 0) {
    return <div style={{ textAlign: 'center', padding: '50px', color: '#94A3B8' }}>กำลังโหลดข้อมูลกระเป๋าเงิน...</div>;
  }

  const currencySymbol = userProfile.currencySymbol;

  return (
    <div style={{ padding: '15px', paddingBottom: '80px', fontFamily: "'Prompt', sans-serif", background: '#0B0E14', minHeight: '100vh', color: '#fff' }}>
      
      {/* ... (ส่วน Header กระเป๋าเงินคงเดิม) ... */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        <div style={{ background: 'linear-gradient(180deg, #1A1F2B 0%, #12161F 100%)', padding: '15px', borderRadius: '16px', boxShadow: '0 8px 20px rgba(0,0,0,0.4)', border: '1px solid rgba(50, 100, 255, 0.2)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-25px', right: '-25px', width: '70px', height: '70px', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', borderRadius: '50%' }}></div>
          <p style={{ margin: '0 0 4px 0', fontSize: '0.6rem', color: '#94A3B8', letterSpacing: '0.5px' }}>ยอดเงินคงเหลือ ({userProfile.currencyCode})</p>
          <h1 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 'bold', color: '#FACC15', textShadow: '0 0 10px rgba(250, 204, 21, 0.2)' }}>
            {currencySymbol}{new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(data.balance)}
          </h1>
        </div>

        <div style={{ background: 'linear-gradient(180deg, #1A1F2B 0%, #12161F 100%)', padding: '15px', borderRadius: '16px', boxShadow: '0 8px 20px rgba(0,0,0,0.4)', border: '1px solid rgba(16, 185, 129, 0.2)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-25px', right: '-25px', width: '70px', height: '70px', background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)', borderRadius: '50%' }}></div>
          <p style={{ margin: '0 0 4px 0', fontSize: '0.6rem', color: '#10B981', letterSpacing: '0.5px' }}>เงินปันผล (10%/ปี)</p>
          <h1 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 'bold', color: '#10B981', textShadow: '0 0 10px rgba(16, 185, 129, 0.2)' }}>
            +{currencySymbol}{new Intl.NumberFormat('th-TH', { minimumFractionDigits: 6, maximumFractionDigits: 6 }).format(pendingDividend)}
          </h1>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => navigate('/market')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 5px', borderRadius: '14px', background: 'linear-gradient(180deg, #1A1F2B 0%, #12161F 100%)', border: '1px solid rgba(59, 130, 246, 0.2)', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '8px', borderRadius: '50%' }}><Download size={18} color="#3B82F6" /></div>
          <span style={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 'bold' }}>ฝาก-ถอน</span>
        </button>
        {/* ... (ปุ่มอื่นๆ คงเดิม) ... */}
      </div>

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
                
                // 🌟 ตรวจสอบว่าเป็น PENDING ของ P2P หรือไม่ เพื่อเปิดให้คลิกได้
                const isClickableP2P = tx.Status === 'PENDING' && (tx.TransactionType === 'DEPOSIT' || tx.TransactionType === 'WITHDRAWAL');
                
                return (
                  <div 
                    key={tx.Id} 
                    // 🌟 ถ้าคลิกได้ ให้ Navigate ไปหน้า p2p-order (โดยใช้ ReferenceId หรือ OrderId ที่ผูกไว้)
                    onClick={() => isClickableP2P ? navigate(`/p2p-order/${tx.ReferenceId || tx.Id}`) : null}
                    style={{ 
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                        background: 'linear-gradient(180deg, #1A1F2B 0%, #12161F 100%)', 
                        padding: '12px 15px', borderRadius: '16px', 
                        border: '1px solid rgba(50, 100, 255, 0.1)',
                        cursor: isClickableP2P ? 'pointer' : 'default', // เปลี่ยนเคอร์เซอร์ถ้าคลิกได้
                        boxShadow: isClickableP2P ? '0 0 10px rgba(59,130,246,0.3)' : 'none' // ทำกรอบเรืองแสงให้รู้ว่ากดได้
                    }}>
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
                      <p style={{ margin: 0, fontSize: '0.6rem', color: tx.Status === 'PENDING' ? '#F59E0B' : (tx.Status === 'REJECTED' ? '#EF4444' : '#10B981') }}>
                        {tx.Status === 'PENDING' ? '⏳ รออัปโหลดสลิป/ตรวจสอบ' : (tx.Status === 'REJECTED' ? '❌ ยกเลิก' : '✅ สำเร็จ')}
                      </p>
                    </div>
                  </div>
                );
              })}
              {/* ... (ปุ่มเปลี่ยนหน้า คงเดิม) ... */}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '25px', color: '#64748B', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <p style={{ margin: 0, fontSize: '0.75rem' }}>ไม่พบประวัติการทำรายการในเดือนนี้</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}