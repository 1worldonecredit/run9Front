import React, { useState, useEffect } from 'react';
import { Wallet, ArrowDownCircle, Gift, Calendar, ChevronLeft, ChevronRight, Download, Upload, FileText, ArrowUpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Assets() {
  const navigate = useNavigate(); // 🌟 เพิ่มตัวแปรนี้เพื่อให้เปลี่ยนหน้าได้

  const [data, setData] = useState({ balance: 0, transactions: [], totalPages: 1 });
  const [loading, setLoading] = useState(true);
  
  // 🌟 State สำหรับเปิด-ปิด Statement
  const [showStatement, setShowStatement] = useState(false); 

  // States สำหรับฟิลเตอร์และแบ่งหน้า
  const [month, setMonth] = useState(''); 
  const [page, setPage] = useState(1);

  // ดึงข้อมูล User Id
  const userStr = localStorage.getItem('user') || localStorage.getItem('userProfile');
  const userId = userStr ? (JSON.parse(userStr).Id || JSON.parse(userStr).id) : 1;

  // ฟังก์ชันดึงข้อมูล API
  const fetchAssets = () => {
    setLoading(true);
    let url = `https://api.run9.app/api/wallet/assets/${userId}?page=${page}`;
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

  // ฟังก์ชันช่วยจัดรูปแบบ UI
  const getTransactionFormat = (type) => {
    switch(type) {
      case 'GAME_PRIZE': 
        return { icon: <Gift size={20} color="#52C41A" />, label: 'ถูกรางวัลสอยดาว', color: '#52C41A', sign: '+' };
      case 'DEPOSIT': 
        return { icon: <Download size={20} color="#1890FF" />, label: 'เติมเงิน', color: '#1890FF', sign: '+' };
      case 'WITHDRAWAL': 
        return { icon: <Upload size={20} color="#FF4D4F" />, label: 'ถอนเงินเข้าบัญชี', color: '#FF4D4F', sign: '-' };
      default:
        return { icon: <Wallet size={20} color="#888" />, label: 'ทำรายการ', color: '#888', sign: '' };
    }
  };

  if (loading && data.transactions.length === 0) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>กำลังโหลดข้อมูลกระเป๋าเงิน...</div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* 💳 ส่วนบน: การ์ดแสดงยอดเงิน */}
      <h2 style={{ color: 'var(--earth-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Wallet /> กระเป๋าเงิน (My Assets)
      </h2>
      
      <div style={{ background: '#9D8667', color: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem', opacity: 0.9 }}>ยอดเงินคงเหลือ</p>
        <h1 style={{ margin: 0, fontSize: '2.5rem' }}>
          ฿{new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2 }).format(data.balance)}
        </h1>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <button 
          onClick={() => navigate('/deposit')} 
          style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #9D8667', background: 'transparent', color: '#9D8667', fontWeight: 'bold', cursor: 'pointer' }}>
          ↙ เติมเงิน
        </button>
        <button style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#9D8667', color: 'white', fontWeight: 'bold' }}>
          ↗ ถอนเงิน
        </button>
      </div>

      {/* 🌟 ปุ่มกดเปิด-ปิด ดู Statement เพื่อให้ UI สะอาดตา */}
      <button 
        onClick={() => setShowStatement(!showStatement)}
        style={{ 
          width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #eee', background: 'white', 
          color: '#444', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', 
          gap: '8px', cursor: 'pointer', marginBottom: '25px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' 
        }}
      >
        <FileText size={20} /> 
        {showStatement ? 'ซ่อนประวัติการทำรายการ' : 'ดูประวัติการทำรายการ (Statement)'}
      </button>

      {/* 📄 ส่วนล่าง: Statement จะแสดงก็ต่อเมื่อ showStatement เป็น true */}
      {showStatement && (
        <div style={{ animation: 'fadeIn 0.3s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, color: '#444' }}>🕒 ประวัติรายการล่าสุด</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#f5f5f5', padding: '5px 10px', borderRadius: '8px' }}>
              <Calendar size={16} color="#666" />
              <input 
                type="month" 
                value={month} 
                onChange={(e) => { setMonth(e.target.value); setPage(1); }} 
                style={{ border: 'none', background: 'transparent', outline: 'none', color: '#555', cursor: 'pointer' }}
              />
            </div>
          </div>

          {data.transactions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.transactions.map((tx) => {
                const format = getTransactionFormat(tx.TransactionType);
                const isIncome = format.sign === '+';
                
                return (
                  <div key={tx.Id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '15px', borderRadius: '12px', border: '1px solid #eee' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ background: `${format.color}20`, padding: '10px', borderRadius: '50%' }}>
                        {format.icon}
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>{format.label}</h4>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>
                          {new Date(tx.CreatedAt).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}
                          {tx.ReferenceId && ` • Ref: ${tx.ReferenceId}`}
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <h3 style={{ margin: 0, color: isIncome ? '#52C41A' : '#FF4D4F' }}>
                        {format.sign}{new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2 }).format(tx.Amount)}
                      </h3>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>{tx.Status}</p>
                    </div>
                  </div>
                );
              })}

              {data.totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '20px' }}>
                  <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))} 
                    disabled={page === 1}
                    style={{ background: 'transparent', border: 'none', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}
                  >
                    <ChevronLeft />
                  </button>
                  <span style={{ color: '#555' }}>หน้า {page} จาก {data.totalPages}</span>
                  <button 
                    onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} 
                    disabled={page === data.totalPages}
                    style={{ background: 'transparent', border: 'none', cursor: page === data.totalPages ? 'not-allowed' : 'pointer', opacity: page === data.totalPages ? 0.5 : 1 }}
                  >
                    <ChevronRight />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#aaa', background: '#fafafa', borderRadius: '12px' }}>
              <ArrowDownCircle size={40} style={{ opacity: 0.3, marginBottom: '10px' }} />
              <p style={{ margin: 0 }}>ไม่พบประวัติการทำรายการในเดือนนี้</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}