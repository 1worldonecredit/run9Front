import React, { useState, useEffect } from 'react';
import { Search, Bell, Download, Upload, ShieldCheck, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Market() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('DEPOSIT'); 
  const [currencySymbol, setCurrencySymbol] = useState('฿');
  const [myUsername, setMyUsername] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedProfileStr = localStorage.getItem('userProfile');
    if (savedProfileStr) {
      const parsed = JSON.parse(savedProfileStr);
      if(parsed.currencySymbol) setCurrencySymbol(parsed.currencySymbol);
      if(parsed.username) setMyUsername(parsed.username);
    }
    fetchTasks();
  }, []);

  // 🌟 ดึงข้อมูลจาก API จริง
  const fetchTasks = async () => {
    try {
      const response = await fetch('https://api.run9.app/api/p2p/orders/pending');
      const data = await response.json();
      if (data.success) setTasks(data.orders);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🌟 ฟังก์ชันเบลอชื่อ User (เช่น somsak -> som***ak)
  const maskUsername = (name) => {
    if (!name) return 'User***';
    if (name.length <= 4) return name.substring(0, 1) + '***' + name.substring(name.length - 1);
    return name.substring(0, 3) + '***' + name.substring(name.length - 2);
  };

  // 🌟 ฟังก์ชันกดรับงาน
  const handleAcceptTask = async (orderId, requiredAmount) => {
    const confirmAccept = window.confirm(`ระบบจะทำการหักเงิน ${requiredAmount} ${currencySymbol} จากกระเป๋าของคุณเพื่อเป็นตัวกลาง (Escrow) ทันที\n\nยืนยันการรับงานนี้หรือไม่?`);
    
    if (!confirmAccept) return;

    try {
      const response = await fetch('https://api.run9.app/api/p2p/match-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderId, matchedUsername: myUsername })
      });
      const data = await response.json();

      if (data.success) {
        alert(`✅ ${data.message}\nรหัสยืนยันของคุณคือ: ${data.confirmationCode}`);
        fetchTasks(); // รีเฟรชหน้าจอ เอางานที่โดนรับแล้วออกไป
        // อนาคตสามารถ navigate ไปหน้า Order Details ได้
      } else {
        alert(`❌ ${data.message}`);
        fetchTasks(); // ดึงข้อมูลใหม่ เผื่อโดนแย่งงานไปแล้ว
      }
    } catch (error) {
      alert("⚠️ เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  return (
    <div className="market-container" style={{ padding: '20px 15px', fontFamily: "'Prompt', sans-serif" }}>
      
      {/* 🌟 Header Search & Notif */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ position: 'relative', flex: 1, marginRight: '15px' }}>
          <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '10px' }} />
          <input 
            type="text" 
            placeholder="ค้นหารายการ..." 
            style={{ width: '100%', background: '#1C1F26', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '10px 10px 10px 40px', color: '#fff', outline: 'none' }}
          />
        </div>
        <div style={{ background: '#1C1F26', padding: '10px', borderRadius: '50%' }}>
          <Bell size={20} color="#fff" />
        </div>
      </div>

      {/* 🌟 Promo Banner */}
      <div className="market-promo-card">
        <div>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', color: '#fff' }}>รับรายได้จาก P2P</h3>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.9)' }}>
            รับค่าธรรมเนียมสูงสุดถึง 20% <br/>เมื่อช่วยผู้ใช้ท่านอื่นทำรายการ
          </p>
        </div>
        <ShieldCheck size={50} color="rgba(255,255,255,0.8)" />
      </div>

      {/* 🌟 Categories */}
      <div className="market-categories">
        <div className={`category-btn ${activeCategory === 'DEPOSIT' ? 'active' : ''}`} onClick={() => setActiveCategory('DEPOSIT')}>
          <Download size={24} />
          <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>รับฝากเงิน</span>
        </div>
        <div className={`category-btn ${activeCategory === 'WITHDRAWAL' ? 'active' : ''}`} onClick={() => setActiveCategory('WITHDRAWAL')}>
          <Upload size={24} />
          <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>รับโอน (ถอน)</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0, fontSize: '1rem', color: '#E2E8F0' }}>รายการรอดำเนินการ</h3>
      </div>

      {/* 🌟 Task List */}
      <div className="task-grid">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748B', gridColumn: '1 / -1' }}>กำลังโหลด...</div>
        ) : tasks.filter(t => t.OrderType === activeCategory).length > 0 ? (
          // หลังแก้ (เพิ่ม t.Username !== myUsername):
              tasks.filter(t => t.OrderType === activeCategory && t.Username !== myUsername).map(task => (
            <div key={task.Id} className="task-card">
              
              <div className="task-card-header">
                <div>
                  <p style={{ margin: '0 0 2px 0', fontSize: '0.7rem', color: '#94A3B8' }}>คำขอฝากเงิน (จำนวนเงินที่ต้องการ)</p>
                  <div className="task-amount">{currencySymbol}{new Intl.NumberFormat('th-TH').format(task.Amount)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0 0 2px 0', fontSize: '0.7rem', color: '#94A3B8' }}>ค่าธรรมเนียมของคุณ</p>
                  <div className="task-fee">+{currencySymbol}{new Intl.NumberFormat('th-TH').format(task.FeeAmount)}</div>
                </div>
              </div>

              {/* Soidao ID Card */}
              <div className="soidao-id-card">
                <img src={task.ProfileImageUrl || 'https://via.placeholder.com/40'} alt="user" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 2px 0', fontSize: '0.85rem', fontWeight: 'bold', color: '#fff' }}>
                    {maskUsername(task.Username)}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>ผู้ยืนยันตัวตนแล้ว</span>
                  </div>
                </div>
                <CheckCircle size={16} color="#10B981" />
              </div>

              <button className="btn-accept-task" onClick={() => handleAcceptTask(task.Id, task.Amount)}>
                รับงานนี้ (หักเงินค้ำประกัน)
              </button>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748B', gridColumn: '1 / -1' }}>
            <ShieldCheck size={32} style={{ opacity: 0.3, margin: '0 auto 10px auto' }} />
            <p style={{ margin: 0, fontSize: '0.8rem' }}>ยังไม่มีคำขอในขณะนี้</p>
          </div>
        )}
      </div>

    </div>
  );
}