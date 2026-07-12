import React, { useState, useEffect } from 'react';
import { Wallet, ArrowDownCircle, Gift, Calendar, ChevronLeft, ChevronRight, Download, Upload, FileText, Send, ScanLine, TrendingUp, Users, History, Activity } from 'lucide-react';
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

  // 🌟 ระบบแอนิเมชันเงินปันผลวิ่งขึ้นแบบเรียลไทม์
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

  // 🌟 ฟังก์ชันจัดการหน้าตาของ Transaction แต่ละประเภท
  const getTransactionFormat = (type) => {
    switch(type) {
      case 'GAME_PRIZE': return { icon: <Gift size={18} color="#10B981" />, label: 'ถูกรางวัลสอยดาว', bg: 'rgba(16, 185, 129, 0.15)', color: '#10B981', sign: '+' };
      case 'DEPOSIT': return { icon: <Download size={18} color="#3B82F6" />, label: 'เติมเงิน (P2P)', bg: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', sign: '+' };
      case 'WITHDRAWAL': return { icon: <Upload size={18} color="#EF4444" />, label: 'ถอนเงิน (P2P)', bg: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', sign: '-' };
      case 'P2P_TRANSFER_OUT': return { icon: <Upload size={18} color="#F97316" />, label: 'โอนค้ำประกัน (P2P)', bg: 'rgba(249, 115, 22, 0.15)', color: '#F97316', sign: '-' };
      case 'DIVIDEND': return { icon: <TrendingUp size={18} color="#F59E0B" />, label: 'รับเงินปันผล', bg: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', sign: '+' };
      case 'P2P_FEE': 
      case 'P2P_REWARD': return { icon: <Wallet size={18} color="#8B5CF6" />, label: 'รายได้ผู้รับงาน P2P', bg: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6', sign: '+' };
      case 'AFFILIATE_COMMISSION': 
      case 'AFFILIATE_P2P': return { icon: <Users size={18} color="#EC4899" />, label: 'คอมมิชชันสายงาน', bg: 'rgba(236, 72, 153, 0.15)', color: '#EC4899', sign: '+' };
      default: return { icon: <Activity size={18} color="#94A3B8" />, label: 'ทำรายการ', bg: 'rgba(148, 163, 184, 0.15)', color: '#94A3B8', sign: '' };
    }
  };

  const currencySymbol = userProfile.currencySymbol;

  return (
    <div style={{ padding: '20px 15px', paddingBottom: '90px', fontFamily: "'Prompt', sans-serif", background: '#0B0E14', minHeight: '100vh', color: '#fff' }}>
      
      {/* 🌟 Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600', color: '#E2E8F0' }}>กระเป๋าเงิน (Assets)</h2>
        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
          <span style={{ fontSize: '0.75rem', color: '#60A5FA', fontWeight: '500' }}>@{userProfile.username}</span>
        </div>
      </div>

      {/* 🌟 ยอดเงินคงเหลือ & เงินปันผล (ดีไซน์กระจกใสเรืองแสง) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '25px' }}>
        
        {/* กล่องยอดเงินหลัก */}
        <div style={{ background: 'linear-gradient(135deg, #1A1F2B 0%, #12161F 100%)', padding: '18px 15px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', border: '1px solid rgba(250, 204, 21, 0.15)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '80px', height: '80px', background: 'radial-gradient(circle, rgba(250,204,21,0.1) 0%, transparent 70%)', borderRadius: '50%' }}></div>
          <p style={{ margin: '0 0 5px 0', fontSize: '0.65rem', color: '#94A3B8', letterSpacing: '0.5px' }}>ยอดเงินคงเหลือ ({userProfile.currencyCode})</p>
          
          {loading && data.balance === 0 ? (
            <h1 style={{ margin: 0, fontSize: '1.2rem', color: '#475569' }}>กำลังโหลด...</h1>
          ) : (
            <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: '#FACC15', textShadow: '0 0 15px rgba(250, 204, 21, 0.3)' }}>
              {currencySymbol}{new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(data.balance)}
            </h1>
          )}
        </div>

        {/* กล่องเงินปันผลวิ่ง */}
        <div style={{ background: 'linear-gradient(135deg, #1A1F2B 0%, #12161F 100%)', padding: '18px 15px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', border: '1px solid rgba(16, 185, 129, 0.15)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '80px', height: '80px', background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)', borderRadius: '50%' }}></div>
          <p style={{ margin: '0 0 5px 0', fontSize: '0.65rem', color: '#10B981', letterSpacing: '0.5px' }}>เงินปันผล (10%/ปี)</p>
          <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold', color: '#10B981', textShadow: '0 0 15px rgba(16, 185, 129, 0.3)' }}>
            +{currencySymbol}{new Intl.NumberFormat('th-TH', { minimumFractionDigits: 6, maximumFractionDigits: 6 }).format(pendingDividend)}
          </h1>
        </div>
      </div>

      {/* 🌟 4 ปุ่มเมนูลัด (ดีไซน์เรียบหรู) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '25px' }}>
        <button onClick={() => navigate('/market')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '15px 5px', borderRadius: '16px', background: 'linear-gradient(180deg, #1A1F2B 0%, #12161F 100%)', border: '1px solid rgba(59, 130, 246, 0.2)', cursor: 'pointer', transition: 'all 0.2s' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '10px', borderRadius: '50%' }}><Download size={20} color="#3B82F6" /></div>
          <span style={{ fontSize: '0.65rem', color: '#E2E8F0', fontWeight: '500' }}>ฝาก-ถอน</span>
        </button>

        <button onClick={() => navigate('/team')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '15px 5px', borderRadius: '16px', background: 'linear-gradient(180deg, #1A1F2B 0%, #12161F 100%)', border: '1px solid rgba(236, 72, 153, 0.2)', cursor: 'pointer', transition: 'all 0.2s' }}>
          <div style={{ background: 'rgba(236, 72, 153, 0.15)', padding: '10px', borderRadius: '50%' }}><Users size={20} color="#EC4899" /></div>
          <span style={{ fontSize: '0.65rem', color: '#E2E8F0', fontWeight: '500' }}>ทีมงาน</span>
        </button>

        <button onClick={() => navigate('/scan')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '15px 5px', borderRadius: '16px', background: 'linear-gradient(180deg, #1A1F2B 0%, #12161F 100%)', border: '1px solid rgba(16, 185, 129, 0.2)', cursor: 'pointer', transition: 'all 0.2s' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '10px', borderRadius: '50%' }}><ScanLine size={20} color="#10B981" /></div>
          <span style={{ fontSize: '0.65rem', color: '#E2E8F0', fontWeight: '500' }}>สแกนจ่าย</span>
        </button>

        <button onClick={() => setShowStatement(!showStatement)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '15px 5px', borderRadius: '16px', background: 'linear-gradient(180deg, #1A1F2B 0%, #12161F 100%)', border: '1px solid rgba(148, 163, 184, 0.2)', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}>
          <div style={{ background: 'rgba(148, 163, 184, 0.15)', padding: '10px', borderRadius: '50%' }}><History size={20} color="#94A3B8" /></div>
          <span style={{ fontSize: '0.65rem', color: '#E2E8F0', fontWeight: '500' }}>ประวัติ</span>
          {/* จุดแจ้งเตือนเล็กๆ */}
          {data.transactions.length > 0 && <div style={{ position: 'absolute', top: '12px', right: '15px', width: '8px', height: '8px', background: '#EF4444', borderRadius: '50%', boxShadow: '0 0 5px #EF4444' }}></div>}
        </button>
      </div>

      {/* 🌟 ส่วนแสดง Statement (รายการย้อนหลัง) */}
      {showStatement && (
        <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', padding: '0 5px' }}>
            <h3 style={{ margin: 0, color: '#F8FAFC', fontSize: '0.9rem', fontWeight: '600' }}>รายการเคลื่อนไหวล่าสุด</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Calendar size={14} color="#94A3B8" />
              <input 
                type="month" 
                value={month} 
                onChange={(e) => { setMonth(e.target.value); setPage(1); }} 
                style={{ border: 'none', background: 'transparent', outline: 'none', color: '#E2E8F0', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'inherit' }}
              />
            </div>
          </div>

          {loading && data.transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>กำลังโหลดรายการ...</div>
          ) : data.transactions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.transactions.map((tx) => {
                const format = getTransactionFormat(tx.TransactionType || tx.Type); // รองรับทั้งชื่อคอลัมน์ใหม่และเก่า
                const isIncome = format.sign === '+';
                
                // เช็กให้กดได้เฉพาะงาน P2P ที่กำลังรอ
                const isClickableP2P = tx.Status === 'PENDING' && (tx.TransactionType === 'DEPOSIT' || tx.TransactionType === 'WITHDRAWAL');
                
                return (
                  <div 
                    key={tx.Id} 
                    onClick={() => isClickableP2P ? navigate(`/p2p-order/${tx.ReferenceId || tx.ReferenceCode?.replace('P2P-','') || tx.Id}`) : null}
                    style={{ 
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                        background: 'linear-gradient(180deg, #1A1F2B 0%, #12161F 100%)', 
                        padding: '16px', borderRadius: '16px', 
                        border: isClickableP2P ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid rgba(255,255,255,0.05)',
                        cursor: isClickableP2P ? 'pointer' : 'default',
                        boxShadow: isClickableP2P ? '0 0 15px rgba(59,130,246,0.15)' : '0 4px 6px rgba(0,0,0,0.1)',
                        transition: 'transform 0.2s'
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ background: format.bg, padding: '10px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {format.icon}
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 4px 0', color: '#F8FAFC', fontSize: '0.8rem', fontWeight: '500' }}>{format.label}</h4>
                        <p style={{ margin: 0, fontSize: '0.65rem', color: '#64748B' }}>
                          {new Date(tx.CreatedAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', fontWeight: 'bold', color: isIncome ? '#10B981' : '#EF4444' }}>
                        {format.sign}{currencySymbol}{new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2 }).format(tx.Amount)}
                      </h3>
                      <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: '500', color: tx.Status === 'PENDING' ? '#F59E0B' : (tx.Status === 'REJECTED' || tx.Status === 'CANCELLED' ? '#EF4444' : '#10B981') }}>
                        {tx.Status === 'PENDING' ? '⏳ รอดำเนินการ' : (tx.Status === 'REJECTED' || tx.Status === 'CANCELLED' ? '❌ ยกเลิก' : '✅ สำเร็จ')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748B', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <FileText size={30} color="#475569" style={{ marginBottom: '10px', opacity: 0.5 }} />
              <p style={{ margin: 0, fontSize: '0.8rem' }}>ไม่พบประวัติการทำรายการในเดือนนี้</p>
            </div>
          )}
        </div>
      )}

      {/* Global Style สำหรับ Animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}