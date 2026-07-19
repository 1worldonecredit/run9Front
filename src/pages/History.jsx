import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wallet, ArrowDownLeft, Clock, Calendar } from 'lucide-react';

export default function History() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [historyList, setHistoryList] = useState([]);
  
  // 🌟 State สำหรับตัวกรองเดือนและปี (ค่าเริ่มต้นคือเดือนและปีปัจจุบัน)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0 = มกราคม, 11 = ธันวาคม
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const monthNames = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];
  
  // สร้างตัวเลือกปี (ย้อนหลังไป 3 ปีจากปีปัจจุบัน)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 4 }, (_, i) => currentYear - i);

  useEffect(() => {
    const savedProfileStr = localStorage.getItem('userProfile');
    let currentUsername = '';
    
    if (savedProfileStr) {
      try {
        const parsed = JSON.parse(savedProfileStr);
        currentUsername = parsed.username || '';
      } catch (e) {}
    }

    if (currentUsername) {
      fetch(`https://api.run9.app/api/history/commission/${currentUsername}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setHistoryList(data.history);
          }
        })
        .catch(err => console.error("Error fetching history:", err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // 🌟 ฟังก์ชันกรองข้อมูลตามเดือนและปีที่เลือก
  const filteredHistory = historyList.filter(item => {
    const date = new Date(item.TransactionDate);
    return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
  });

  // คำนวณยอด
  const monthlyTotal = filteredHistory.reduce((sum, item) => sum + item.CommissionAmount, 0);
  const allTimeTotal = historyList.reduce((sum, item) => sum + item.CommissionAmount, 0);

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('th-TH', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  const maskName = (name) => {
    if (!name) return 'User***';
    return name.length > 4 ? name.substring(0, 3) + '***' : name + '***';
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px', color: '#fff', background: '#0B0E14', minHeight: '100vh' }}>กำลังโหลดประวัติ...</div>;

  return (
    <div style={{ padding: '20px 15px', paddingBottom: '90px', fontFamily: "'Prompt', sans-serif", background: '#0B0E14', minHeight: '100vh', color: '#fff' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', padding: '10px', borderRadius: '12px', color: '#94A3B8', cursor: 'pointer' }}>
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>ประวัติค่านายหน้า</h2>
      </div>

      {/* 🌟 บัตรสรุปยอด (ปรับให้โชว์ยอดตามเดือนที่เลือก) */}
      <div style={{ background: 'linear-gradient(135deg, rgba(207, 163, 72, 0.15) 0%, rgba(207, 163, 72, 0.05) 100%)', border: '1px solid rgba(207, 163, 72, 0.3)', padding: '25px 20px', borderRadius: '16px', textAlign: 'center', marginBottom: '25px', backdropFilter: 'blur(10px)' }}>
        <Wallet size={28} color="#CFA348" style={{ margin: '0 auto 10px auto', display: 'block' }} />
        <p style={{ margin: '0 0 5px 0', color: '#D1D5DB', fontSize: '0.85rem' }}>ยอดรวมเดือน {monthNames[selectedMonth]}</p>
        <h1 style={{ margin: 0, fontSize: '2.2rem', color: '#fff' }}>
          <span style={{ fontSize: '1.2rem', color: '#CFA348', marginRight: '5px' }}>฿</span>
          {new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2 }).format(monthlyTotal)}
        </h1>
        <div style={{ marginTop: '12px', borderTop: '1px solid rgba(207, 163, 72, 0.2)', paddingTop: '10px' }}>
          <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.75rem' }}>
            ยอดสะสมทุกเดือน: <span style={{ color: '#fff' }}>฿{new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2 }).format(allTimeTotal)}</span>
          </p>
        </div>
      </div>

      {/* 🌟 ส่วนหัวและตัวกรองเดือน/ปี */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ fontSize: '1rem', color: '#94A3B8', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={16} /> รายการ
        </h3>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px 10px', borderRadius: '8px', outline: 'none', fontSize: '0.8rem', cursor: 'pointer' }}
          >
            {monthNames.map((m, i) => (
              <option key={i} value={i} style={{ color: '#000' }}>{m}</option>
            ))}
          </select>
          
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px 10px', borderRadius: '8px', outline: 'none', fontSize: '0.8rem', cursor: 'pointer' }}
          >
            {years.map(y => (
              <option key={y} value={y} style={{ color: '#000' }}>{y + 543}</option> /* โชว์เป็น พ.ศ. */
            ))}
          </select>
        </div>
      </div>

      {/* 🌟 รายการประวัติที่ถูกกรองแล้ว */}
      <div>
        {filteredHistory.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredHistory.map((item, index) => (
              <div key={item.TransactionId || index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <ArrowDownLeft size={20} color="#10B981" />
                  </div>
                  
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: '#fff' }}>
                      จาก: {maskName(item.FromUser)}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> {formatDateTime(item.TransactionDate)}
                    </p>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: '#10B981', fontWeight: 'bold', fontSize: '1.05rem' }}>
                    +฿{new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2 }).format(item.CommissionAmount)}
                  </span>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <p style={{ color: '#64748B', margin: 0 }}>ไม่มีรายการค่านายหน้าในเดือนนี้</p>
          </div>
        )}
      </div>

    </div>
  );
}