import React, { useState, useEffect } from 'react';
import { Search, Bell, Download, Upload, ShieldCheck, FileText, CheckCircle, ChevronRight, Timer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Market() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('DEPOSIT'); 
  const [currencySymbol, setCurrencySymbol] = useState('฿');
  const [myUsername, setMyUsername] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 🌟 เพิ่ม State สำหรับนับเวลาปัจจุบันของเครื่องเพื่อให้นาฬิกาเดิน
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const savedProfileStr = localStorage.getItem('userProfile');
    if (savedProfileStr) {
      const parsed = JSON.parse(savedProfileStr);
      if(parsed.currencySymbol) setCurrencySymbol(parsed.currencySymbol);
      if(parsed.username) setMyUsername(parsed.username);
    }
    
    fetchTasks();
    // 🌟 โหลดงานใหม่เข้า Market ทุก 10 วินาที
    const intervalTasks = setInterval(fetchTasks, 10000);
    return () => clearInterval(intervalTasks);
  }, []);

  // 🌟 อัปเดตเวลาปัจจุบันทุก 1 วินาที
  useEffect(() => {
    const intervalTime = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(intervalTime);
  }, []);

  const fetchTasks = async () => {
    try {
      const savedProfileStr = localStorage.getItem('userProfile');
      let myCountry = '';
      if (savedProfileStr) {
        const parsed = JSON.parse(savedProfileStr);
        myCountry = parsed.country || parsed.Country || ''; 
      }

      const response = await fetch(`https://api.run9.app/api/p2p/orders/pending?country=${myCountry}`);
      const data = await response.json();
      
      if (data.success) {
        // ดึงตั้งค่าเวลา (timeoutSetting) จากศูนย์กลาง (Backend) มาใช้งาน
        const apiTimeout = data.timeoutSetting || 300; 

        // คำนวณเวลาหมดอายุให้แต่ละออเดอร์
        const processedTasks = data.orders.map(o => ({
          ...o,
          localExpireTimestamp: Date.now() + ((apiTimeout - (o.ElapsedSeconds || 0)) * 1000)
        }));
        setTasks(processedTasks);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🌟 ฟังก์ชันคำนวณเวลานับถอยหลัง
  const getCountdown = (localExpireTimestamp) => {
    if (!localExpireTimestamp) return null;
    const diff = localExpireTimestamp - currentTime.getTime();

    // เผื่อไว้กรณีที่มันยังไม่หายไปทันที (แต่จริงๆ มันจะถูกซ่อนจาก Filter ด้านล่างแล้ว)
    if (diff <= 0) return <span style={{ color: '#EF4444' }}>หมดเวลา</span>;

    const minutes = Math.floor((diff / 1000) / 60);
    const seconds = Math.floor((diff / 1000) % 60);
    
    return <span>{minutes} น. {seconds} วิ.</span>;
  };

  const maskUsername = (name) => {
    if (!name) return 'User***';
    if (name.length <= 4) return name.substring(0, 1) + '***' + name.substring(name.length - 1);
    return name.substring(0, 3) + '***' + name.substring(name.length - 2);
  };

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
        fetchTasks(); 
        navigate('/my-p2p-orders'); 
      } else {
        alert(`❌ ${data.message}`);
        fetchTasks(); 
      }
    } catch (error) {
      alert("⚠️ เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  // =========================================================================
  // 🌟 จุดสำคัญ: กรองข้อมูลก่อนนำไปแสดงผล (ซ่อนงานที่หมดเวลา + แยกหมวดหมู่)
  // =========================================================================
  const validTasks = tasks.filter(t => 
    t.OrderType === activeCategory && // ต้องตรงกับหมวดหมู่ที่กด (ฝาก/ถอน)
    t.Username !== myUsername &&      // ต้องไม่ใช่งานของตัวเอง
    (t.localExpireTimestamp - currentTime.getTime() > 0) // 🌟 เวลาที่เหลือต้องมากกว่า 0 (ถ้าหมดเวลาให้ซ่อนทันที)
  );

  return (
    <div style={{ padding: '20px 15px', paddingBottom: '90px', fontFamily: "'Prompt', sans-serif", background: '#0B0E14', minHeight: '100vh', color: '#fff' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', gap: '15px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="ค้นหารายการ..." 
            style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 12px 12px 42px', color: '#fff', outline: 'none', fontSize: '0.85rem' }}
          />
        </div>

        <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', cursor: 'pointer' }}>
          <Bell size={20} />
        </button>
      </div>

      <div style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)', borderRadius: '20px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)', borderRadius: '50%' }}></div>
        <div style={{ zIndex: 1 }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.3rem', color: '#fff', fontWeight: 'bold' }}>รับรายได้จาก P2P</h3>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)', lineHeight: '1.4' }}>
            รับค่าธรรมเนียมสูงสุดถึง 20% <br/>เมื่อช่วยผู้ใช้ท่านอื่นทำรายการ
          </p>
        </div>
        <ShieldCheck size={55} color="rgba(255,255,255,0.9)" style={{ zIndex: 1 }} />
      </div>

      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', padding: '5px', marginBottom: '25px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <button 
          onClick={() => setActiveCategory('DEPOSIT')}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '10px', background: activeCategory === 'DEPOSIT' ? '#1C1F26' : 'transparent', color: activeCategory === 'DEPOSIT' ? '#3B82F6' : '#94A3B8', border: 'none', fontWeight: activeCategory === 'DEPOSIT' ? 'bold' : 'normal', cursor: 'pointer', transition: 'all 0.3s' }}
        >
          <Download size={18} /> รับฝากเงิน
        </button>
        <button 
          onClick={() => setActiveCategory('WITHDRAWAL')}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '10px', background: activeCategory === 'WITHDRAWAL' ? '#1C1F26' : 'transparent', color: activeCategory === 'WITHDRAWAL' ? '#EF4444' : '#94A3B8', border: 'none', fontWeight: activeCategory === 'WITHDRAWAL' ? 'bold' : 'normal', cursor: 'pointer', transition: 'all 0.3s' }}
        >
          <Upload size={18} /> รับโอน (ถอน)
        </button>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#E2E8F0' }}>รายการรอดำเนินการ</h3>
        
        <button 
          onClick={() => navigate('/my-p2p-orders')}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '6px', 
            padding: '8px 12px', background: 'rgba(59, 130, 246, 0.1)', 
            color: '#3B82F6', border: '1px solid rgba(59, 130, 246, 0.3)', 
            borderRadius: '8px', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' 
          }}
        >
          <FileText size={16} /> ประวัติของฉัน
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>กำลังโหลด...</div>
        ) : validTasks.length > 0 ? (
            validTasks.map(task => (
            <div key={task.Id} style={{ background: 'linear-gradient(180deg, #1A1F2B 0%, #12161F 100%)', borderRadius: '16px', padding: '18px', border: '1px solid rgba(59, 130, 246, 0.15)', position: 'relative', overflow: 'hidden' }}>
              
              <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)', borderRadius: '50%' }}></div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '15px' }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.75rem', color: '#94A3B8' }}>ยอดที่ต้องการ</p>
                  <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#fff' }}>{currencySymbol}{new Intl.NumberFormat('th-TH').format(task.Amount)}</h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.75rem', color: '#94A3B8' }}>ค่าธรรมเนียมที่จะได้รับ</p>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#10B981' }}>+{currencySymbol}{new Intl.NumberFormat('th-TH').format(task.FeeAmount)}</h3>
                </div>
              </div>

              {/* Soidao ID Card & 🌟 นาฬิกานับถอยหลัง */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '12px' }}>
                
                {/* ข้อมูลโปรไฟล์ */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                    {task.ProfileImageUrl && <img src={task.ProfileImageUrl} alt="user" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                  <div>
                    <p style={{ margin: '0 0 2px 0', fontSize: '0.9rem', fontWeight: 'bold', color: '#E2E8F0' }}>
                      {maskUsername(task.Username)}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle size={12} color="#10B981" />
                      <span style={{ fontSize: '0.7rem', color: '#10B981' }}>ยืนยันตัวตนแล้ว</span>
                    </div>
                  </div>
                </div>

                {/* 🌟 นาฬิกานับถอยหลัง */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', padding: '6px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  <Timer size={14} />
                  {getCountdown(task.localExpireTimestamp)}
                </div>

              </div>

              <button 
                onClick={() => handleAcceptTask(task.Id, task.Amount)}
                style={{ width: '100%', padding: '14px', background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', border: '1px solid #3B82F6', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'all 0.3s' }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#3B82F6'; e.currentTarget.style.color = '#fff'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'; e.currentTarget.style.color = '#3B82F6'; }}
              >
                รับงานนี้ <ChevronRight size={18} />
              </button>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748B', background: '#12161F', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <ShieldCheck size={40} style={{ opacity: 0.2, margin: '0 auto 15px auto' }} />
            <p style={{ margin: 0, fontSize: '0.9rem' }}>ยังไม่มีคำขอในขณะนี้</p>
          </div>
        )}
      </div>

    </div>
  );
}