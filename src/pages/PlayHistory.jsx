import React, { useState, useEffect } from 'react';
import { History, Target, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PlayHistory() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // สมมติว่าดึง UserId จาก LocalStorage
  const userStr = localStorage.getItem('user') || localStorage.getItem('userProfile');
  const userId = userStr ? (JSON.parse(userStr).Id || JSON.parse(userStr).id) : 1; 

  useEffect(() => {
    fetch(`https://api.run9.app/api/game/history/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setLogs(data.history);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching history:", err);
        setLoading(false);
      });
  }, [userId]);

  // ฟังก์ชันช่วยเช็คว่าแทงรางวัลไหนไป
  const getPlayedDetails = (log) => {
    if (log.Number6D) return { type: '6D แจ็คพ็อต', num: log.Number6D, color: '#38bdf8' };
    if (log.Number4D) return { type: '4 ตัว', num: log.Number4D, color: '#d4af37' };
    if (log.Number3D) return { type: '3 ตัว', num: log.Number3D, color: '#a78bfa' };
    if (log.Number2D) return { type: '2 ตัว', num: log.Number2D, color: '#f472b6' };
    return { type: 'ไม่ทราบ', num: '-', color: '#888' };
  };

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '20px', background: '#0b0b0d', minHeight: '100vh', color: '#EAEAEA', fontFamily: 'sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px', borderBottom: '1px solid #23232a', paddingBottom: '15px' }}>
        <ArrowLeft size={24} color="#FFD700" style={{ cursor: 'pointer' }} onClick={() => navigate(-1)} />
        <h2 style={{ margin: 0, color: '#FFD700', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={24} /> ประวัติการสอยดาว
        </h2>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>กำลังโหลดข้อมูลการเล่น...</div>
      ) : logs.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {logs.map((log) => {
            const details = getPlayedDetails(log);
            const isWin = log.IsWon === true || log.IsWon === 1;

            return (
              <div key={log.LogId} style={{ 
                background: '#141419', padding: '15px', borderRadius: '16px', border: '1px solid #23232a',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                    <Target size={16} color={details.color} />
                    <span style={{ fontWeight: 'bold', color: details.color }}>รางวัล {details.type}</span>
                    {log.IsFreePlay ? (
                      <span style={{ background: '#064e3b', color: '#34d399', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '10px' }}>สิทธิ์ฟรี</span>
                    ) : null}
                  </div>
                  
                  {/* กล่องโชว์เลขที่แทง */}
                  <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#FFD700', letterSpacing: '2px', textShadow: '0 0 5px rgba(255,215,0,0.3)', margin: '5px 0' }}>
                    {details.num}
                  </div>
                  
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {new Date(log.CreatedAt).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                </div>

                {/* สถานะถูกรางวัล */}
                <div style={{ textAlign: 'center' }}>
                  {isWin ? (
                    <div style={{ color: '#52C41A', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <CheckCircle size={28} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 'bold', marginTop: '4px' }}>ถูกรางวัล</span>
                    </div>
                  ) : (
                    <div style={{ color: '#4a4a55', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <XCircle size={28} />
                      <span style={{ fontSize: '0.8rem', marginTop: '4px' }}>ไม่ถูกรางวัล</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', background: '#141419', borderRadius: '16px', border: '1px solid #23232a' }}>
          <History size={40} color="#3d3d48" style={{ marginBottom: '10px' }} />
          <p style={{ color: '#8A8A93', margin: 0 }}>ยังไม่มีประวัติการเล่น<br/>ไปสอยดาวกันเลย!</p>
        </div>
      )}
    </div>
  );
}