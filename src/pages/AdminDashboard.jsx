import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Globe, Clock, CheckCircle, AlertCircle, HandHeart } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, todayUsers: 0, countryStats: [] });
  const [p2pOrders, setP2pOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // ดึงชื่อแอดมินจาก LocalStorage เพื่อส่งไปเป็นคนรับงาน
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

  const fetchDashboardData = () => {
    fetch('https://api.run9.app/api/admin/dashboard-stats')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats(data.stats);
          setP2pOrders(data.p2pOrders);
        }
        setLoading(false);
      })
      .catch(err => console.error("Error fetching dashboard:", err));
  };

  // รีเฟรชข้อมูลทุก 10 วินาที
  useEffect(() => {
    fetchDashboardData();
    const intervalData = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(intervalData);
  }, []);

  // อัปเดตเวลาทุกวินาทีเพื่อนับถอยหลัง
  useEffect(() => {
    const intervalTime = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(intervalTime);
  }, []);

  const handleAdminMatch = async (orderId) => {
    if (!window.confirm(`ยืนยันการใช้สิทธิ์ Admin รับออเดอร์ #${orderId} นี้หรือไม่?`)) return;
    try {
      const res = await fetch('https://api.run9.app/api/admin/p2p-admin-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, adminUsername: adminUser.Username || 'Admin' })
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ ' + data.message);
        fetchDashboardData();
      } else {
        alert('❌ ' + data.error);
      }
    } catch (err) {
      alert('❌ เชื่อมต่อเซิร์ฟเวอร์ไม่ได้');
    }
  };

  // ฟังก์ชันคำนวณเวลานับถอยหลัง (สมมติให้เวลา 5 นาที สำหรับ PENDING)
  const getCountdown = (createdAtString, status) => {
    if (status !== 'PENDING') return '-';
    
    const createdAt = new Date(createdAtString).getTime();
    const expireTime = createdAt + (5 * 60 * 1000); // 5 นาที
    const diff = expireTime - currentTime.getTime();

    if (diff <= 0) return <span style={{ color: '#EF4444', fontWeight: 'bold' }}>หมดเวลา</span>;

    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return <span style={{ color: minutes < 1 ? '#EF4444' : '#F59E0B', fontWeight: 'bold' }}>{minutes} น. {seconds} วิ.</span>;
  };

  const pendingOrders = p2pOrders.filter(o => o.Status === 'PENDING');
  const matchedOrders = p2pOrders.filter(o => o.Status === 'MATCHED' || o.Status === 'SLIP_UPLOADED');

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>กำลังโหลดข้อมูลแดชบอร์ด...</div>;

  return (
    <div style={{ fontFamily: '"Sarabun", sans-serif' }}>
      <h2 style={{ color: '#0F172A', marginBottom: '24px' }}>ภาพรวมระบบ (Dashboard)</h2>

      {/* ================= สถิติผู้ใช้งาน ================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="admin-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ background: '#EFF6FF', padding: '15px', borderRadius: '12px' }}><Users size={28} color="#3B82F6" /></div>
          <div>
            <p style={{ margin: 0, color: '#64748B', fontSize: '0.9rem' }}>สมาชิกรวมทั้งหมด</p>
            <h3 style={{ margin: 0, color: '#0F172A', fontSize: '1.8rem' }}>{new Intl.NumberFormat().format(stats.totalUsers)}</h3>
          </div>
        </div>
        
        <div className="admin-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ background: '#D1FAE5', padding: '15px', borderRadius: '12px' }}><UserPlus size={28} color="#10B981" /></div>
          <div>
            <p style={{ margin: 0, color: '#64748B', fontSize: '0.9rem' }}>สมัครใหม่วันนี้</p>
            <h3 style={{ margin: 0, color: '#0F172A', fontSize: '1.8rem' }}>{new Intl.NumberFormat().format(stats.todayUsers)}</h3>
          </div>
        </div>

        <div className="admin-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <Globe size={20} color="#8B5CF6" />
            <h4 style={{ margin: 0, color: '#0F172A' }}>แยกตามประเทศ</h4>
          </div>
          {stats.countryStats.map((c, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#475569', padding: '4px 0', borderBottom: i !== stats.countryStats.length -1 ? '1px dashed #E2E8F0' : 'none' }}>
              <span>{c.country}</span>
              <span style={{ fontWeight: 'bold' }}>{new Intl.NumberFormat().format(c.count)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ================= รายการ P2P รอคนรับงาน (PENDING) ================= */}
      <h3 style={{ color: '#0F172A', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Clock size={20} color="#F59E0B" /> รายการฝากเงิน (ไม่มีผู้รับงาน)
      </h3>
      <div className="admin-card table-responsive" style={{ padding: '15px', marginBottom: '30px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', color: '#475569', borderBottom: '1px solid #E2E8F0' }}>
              <th style={{ padding: '12px' }}>ออเดอร์</th>
              <th style={{ padding: '12px' }}>ผู้ฝาก (ลูกค้า)</th>
              <th style={{ padding: '12px' }}>ยอดเงิน</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>เวลาที่เหลือ</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {pendingOrders.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>ไม่มีรายการค้าง</td></tr>
            ) : (
              pendingOrders.map((o, index) => (
                <tr key={o.Id} style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>#{o.Id}</td>
                  <td style={{ padding: '12px' }}>@{o.RequesterUsername}</td>
                  <td style={{ padding: '12px', color: '#0F172A', fontWeight: 'bold' }}>{new Intl.NumberFormat().format(o.Amount)}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>{getCountdown(o.CreatedAt, o.Status)}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button onClick={() => handleAdminMatch(o.Id)} className="badge badge-green" style={{ cursor: 'pointer', border: 'none' }}>
                      <HandHeart size={14} /> Admin รับงานแทน
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ================= รายการ P2P มีคนรับแล้ว (MATCHED / SLIP_UPLOADED) ================= */}
      <h3 style={{ color: '#0F172A', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <CheckCircle size={20} color="#10B981" /> รายการฝากเงิน (กำลังดำเนินการ)
      </h3>
      <div className="admin-card table-responsive" style={{ padding: '15px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', color: '#475569', borderBottom: '1px solid #E2E8F0' }}>
              <th style={{ padding: '12px' }}>ออเดอร์</th>
              <th style={{ padding: '12px' }}>ผู้ฝาก ➡️ ผู้รับงาน</th>
              <th style={{ padding: '12px' }}>ยอดเงิน</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {matchedOrders.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>ไม่มีรายการกำลังดำเนินการ</td></tr>
            ) : (
              matchedOrders.map((o, index) => (
                <tr key={o.Id} style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>#{o.Id}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ color: '#EF4444' }}>@{o.RequesterUsername}</span>
                    <span style={{ margin: '0 8px', color: '#94A3B8' }}>➡️</span>
                    <span style={{ color: '#10B981' }}>@{o.MatchedUsername}</span>
                  </td>
                  <td style={{ padding: '12px', color: '#0F172A', fontWeight: 'bold' }}>{new Intl.NumberFormat().format(o.Amount)}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {o.Status === 'MATCHED' ? (
                      <span className="badge badge-orange"><AlertCircle size={12}/> รอผู้ฝากโอนเงิน</span>
                    ) : (
                      <span className="badge badge-blue"><Clock size={12}/> รอตรวจสลิป</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}