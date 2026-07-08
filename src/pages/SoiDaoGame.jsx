import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Gift, AlertCircle, Trophy, RefreshCw, Disc, Wallet, Ticket } from 'lucide-react';

// ฟังก์ชันเซนเซอร์ข้อมูลผู้โชคดี
const maskString = (str, type) => {
  if (!str) return 'ไม่ระบุ';
  if (type === 'phone' && str.length >= 10) return `${str.substring(0,3)}***${str.substring(str.length-4)}`;
  return `${str.substring(0,3)}***`;
};

export default function SoiDaoGame() {
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 🌟 State สำหรับเก็บข้อมูลสิทธิ์และเงิน
  const [gameInfo, setGameInfo] = useState({ freeTickets: 0, balance: 0, canClaimToday: true });
  
  // States สำหรับเก็บตัวเลขทายผล
  const [guess2D, setGuess2D] = useState('');
  const [guess3D, setGuess3D] = useState('');
  const [guess4D, setGuess4D] = useState('');
  const [guess6D, setGuess6D] = useState(''); 
  
  const [message, setMessage] = useState('');

  // ดึงชื่อผู้ใช้งาน (รองรับทั้ง key 'username' และ 'user')
  const username = localStorage.getItem('username') || (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).Username : 'admin');

  // ดึงข้อมูลแจ็คพ็อต
  const fetchGameStatus = () => {
    fetch('https://api.run9.app/api/game/status')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setGameData(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error:", err);
        setLoading(false);
      });
  };

  // 🌟 ดึงข้อมูลสิทธิ์และกระเป๋าเงิน
  const fetchGameInfo = () => {
    fetch(`https://api.run9.app/api/game/info?username=${username}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setGameInfo(data);
        }
      })
      .catch(err => console.error("Error fetching game info:", err));
  };

  useEffect(() => {
    fetchGameStatus();
    fetchGameInfo();
  }, []);

  // 🌟 ฟังก์ชันกดรับสิทธิ์ประจำวัน
  const handleClaimDaily = async () => {
    try {
      const response = await fetch('https://api.run9.app/api/tickets/claim-daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      const data = await response.json();
      if (data.success) {
        alert(data.message);
        fetchGameInfo(); // รีเฟรชข้อมูลสิทธิ์ใหม่ทันที
      } else {
        alert('❌ ' + data.error);
      }
    } catch (err) {
      alert('❌ เชื่อมต่อเซิร์ฟเวอร์ไม่ได้');
    }
  };

  const handlePlay = (gameType, guessNumber, clearInputCallback) => {
    if (!guessNumber || guessNumber.length < (gameType === '6D' ? 6 : parseInt(gameType))) {
      setMessage(`❌ กรุณากรอกเลข ${gameType} ให้ครบทุกช่องก่อนครับ`);
      return;
    }

    // ดักก่อนยิง API ถ้าเป็นเกมฟรี (2D, 3D, 4D) แต่ไม่มีตั๋ว
    if (gameType !== '6D' && gameInfo.freeTickets <= 0) {
      setMessage("❌ คุณไม่มีสิทธิ์ฟรี กรุณากดปุ่ม 'รับสิทธิ์ประจำวัน' ก่อนเล่น!");
      return;
    }

    setMessage('⚡ กำลังส่งคำสั่งสอยดาวไปยังเซิร์ฟเวอร์...');

    const userStr = localStorage.getItem('user') || localStorage.getItem('userProfile');
    const userId = userStr ? (JSON.parse(userStr).Id || JSON.parse(userStr).id) : 1;

    // ส่ง username พ่วงไปด้วย เพื่อให้ API หลังบ้านตัดตั๋วถูกคน
    fetch('https://api.run9.app/api/game/play', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, userId, guessNumber, gameType })
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        setMessage(`❌ ${data.error}`);
      } else {
        setMessage(data.message);
        if (clearInputCallback) clearInputCallback(); 
        
        fetchGameInfo(); // อัปเดตตั๋วและเงินทันทีหลังกดเล่นเสร็จ
        
        if (data.isWin || data.isWinner) { // รองรับทั้งชื่อตัวแปรเก่าและใหม่
          // 🎉 เอฟเฟกต์พลุแจ็คพ็อต
          let duration = 3 * 1000;
          let end = Date.now() + duration;

          (function frame() {
            confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 } });
            confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 } });
            if (Date.now() < end) { requestAnimationFrame(frame); }
          }());
          
          fetchGameStatus();
        }
      }
    })
    .catch(err => {
      setMessage('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    });
  };

  const triggerNewDay = () => {
    if(window.confirm('ต้องการจำลองการขึ้นวันใหม่เพื่อทดสอบทบยอดรางวัลใช่หรือไม่?')) {
      fetch('https://api.run9.app/api/game/trigger-new-day', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          alert(data.message);
          fetchGameStatus();
        })
        .catch(err => alert("เกิดข้อผิดพลาดในการข้ามวัน"));
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px', color: '#9D8667' }}>กำลังตั้งค่าตู้เกมสอยดาวพรีเมียม...</div>;
  if (!gameData) return (
    <div style={{ textAlign: 'center', padding: '50px', background: '#0b0b0d', minHeight: '100vh', color: '#EAEAEA' }}>
      <AlertCircle size={48} color="#FFD700" style={{ marginBottom: '15px', display: 'block', margin: '0 auto 15px' }} />
      <h3 style={{ color: '#FFD700', margin: '0 0 20px 0' }}>ยังไม่มีการเปิดระบบสุ่มเลขในวันนี้</h3>
      <button 
        onClick={triggerNewDay}
        style={{ 
          padding: '12px 24px', borderRadius: '25px', border: '1px solid #FFD700',
          background: 'linear-gradient(90deg, #141419, #1e1b10)', color: '#FFD700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 'bold'
        }}>
        <RefreshCw size={18} /> กดที่นี่เพื่อจำลองเปิดเกมของวันนี้
      </button>
    </div>
  );

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '15px', background: '#0b0b0d', minHeight: '100vh', color: '#EAEAEA', position: 'relative', overflowX: 'hidden' }}>
      
      {/* 🌌 ฉากหลังละอองดาวเรืองแสง */}
      <div className="particle-container">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      {/* ================= 🌟 แถบแสดงกระเป๋าตั๋วและเงิน (ใหม่) ================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(30,41,59,0.8)', padding: '12px 20px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '15px', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FFD700', fontWeight: 'bold' }}>
          <Ticket size={18} />
          <span style={{ fontSize: '0.9rem' }}>สิทธิ์ฟรี: {gameInfo.freeTickets || 0} ครั้ง</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981', fontWeight: 'bold' }}>
          <Wallet size={18} />
          <span style={{ fontSize: '0.9rem' }}>{new Intl.NumberFormat('th-TH').format(gameInfo.balance || 0)} ฿</span>
        </div>
      </div>

      {/* ================= 🌟 ปุ่มรับสิทธิ์ฟรีรายวัน (ใหม่) ================= */}
      <div style={{ position: 'relative', zIndex: 2, marginBottom: '20px' }}>
        {gameInfo.canClaimToday ? (
          <button
            onClick={handleClaimDaily}
            style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '2px dashed #10B981', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', fontWeight: 'bold', fontSize: '1.05rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', animation: 'pulseBtn 2s infinite' }}
          >
            <Gift size={20} /> กดรับสิทธิ์เล่นฟรี 2 ครั้ง ประจำวันนี้!
          </button>
        ) : (
          <div style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: '#8A8A93', textAlign: 'center', fontSize: '0.85rem', border: '1px solid #23232a' }}>
            ✅ คุณรับสิทธิ์รายวันไปแล้ว (กลับมารับใหม่พรุ่งนี้นะครับ)
          </div>
        )}
      </div>

      {/* 🎰 ส่วนหัวตู้เกม */}
      <div style={{ textAlign: 'center', marginBottom: '20px', background: 'linear-gradient(180deg, #141419 0%, #0b0b0d 100%)', padding: '15px 15px 5px 15px', borderRadius: '24px', border: '1px solid #23232a', position: 'relative', zIndex: 2 }}>
        
        <div style={{ width: '100%', height: '140px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px' }}>
          <svg width="160" height="140" viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0px 0px 8px rgba(255,215,0,0.4))' }}>
            <circle cx="50" cy="50" r="25" fill="rgba(255,215,0,0.04)" className="pulse-glow" />
            <path d="M50,85 L50,55 Q50,45 35,35 M50,60 Q50,40 65,30 M50,70 Q40,55 30,55 M50,65 Q60,50 70,45" fill="none" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round" />
            <circle cx="35" cy="35" r="4" fill="#FFD700" className="sway-leaf-1" />
            <circle cx="65" cy="30" r="5" fill="#FFF" className="sway-leaf-2" />
            <circle cx="30" cy="55" r="3.5" fill="#FFD700" className="sway-leaf-3" />
            <circle cx="70" cy="45" r="4" fill="#FFD700" className="sway-leaf-1" />
            <polygon points="50,15 53,22 60,22 55,26 57,33 50,29 43,33 45,26 40,22 47,22" fill="#FFF" className="star-glow" />
          </svg>
        </div>

        <h1 style={{ color: '#FFD700', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', margin: '0 0 5px 0', fontSize: '1.6rem', textShadow: '0 0 12px rgba(255,215,0,0.5)' }}>
          <Disc className="spin-icon" color="#FFD700" size={22} /> 9 PLUS SLOTS <Disc className="spin-icon" color="#FFD700" size={22} />
        </h1>
        <p style={{ color: '#8A8A93', margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>เลือกตัวเลขนำโชคเพื่อลุ้นชิงรางวัลแจ็คพ็อตสะสม!</p>
      </div>

      {/* 📢 บอร์ดแจ้งผลระบบ */}
      {message && (
        <div style={{ 
          padding: '12px', borderRadius: '12px', marginBottom: '20px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem',
          background: message.includes('🎉') || message.includes('สำเร็จ') ? '#0c2616' : message.includes('❌') ? '#2d1212' : '#1e1b10',
          border: `1px solid ${message.includes('🎉') || message.includes('สำเร็จ') ? '#2e7d32' : message.includes('❌') ? '#c62828' : '#f59e0b'}`,
          color: message.includes('🎉') || message.includes('สำเร็จ') ? '#4caf50' : message.includes('❌') ? '#ef5350' : '#ffca28',
          boxShadow: '0 4px 15px rgba(0,0,0,0.4)', zIndex: 5, position: 'relative'
        }}>
          {message}
        </div>
      )}

      {/* 💎 1. ตู้แกรนด์แจ็คพ็อต 6 ตัว */}
      <ArcadeCard6D 
        prize={gameData.prizes.CurrentJackpot6D || 4000000000}
        isWon={gameData.status.IsWon6D}
        value={guess6D}
        onChange={setGuess6D}
        onPlay={() => handlePlay('6D', guess6D, () => setGuess6D(''))}
      />

      {/* 🥇 2. ตู้แจ็คพ็อต 4 ตัว */}
      <ArcadeCard 
        title="แจ็คพ็อตเลขท้าย 4 ตัว" 
        prize={gameData.prizes.CurrentJackpot4D || 50000000} 
        isWon={gameData.status.IsWon4D}
        value={guess4D}
        onChange={setGuess4D}
        length={4}
        onPlay={() => handlePlay('4D', guess4D, () => setGuess4D(''))}
        themeColor="linear-gradient(135deg, #8a6f48, #d4af37)"
      />

      {/* 🥈 3. ตู้รางวัลเลขท้าย 3 ตัว */}
      <ArcadeCard 
        title="รางวัลเลขท้าย 3 ตัว" 
        prize={gameData.prizes.CurrentJackpot3D || 10000000} 
        isWon={gameData.status.IsWon3D}
        value={guess3D}
        onChange={setGuess3D}
        length={3}
        onPlay={() => handlePlay('3D', guess3D, () => setGuess3D(''))}
        themeColor="linear-gradient(135deg, #24242e, #3a3a4a)"
      />

      {/* 🥉 4. ตู้รางวัลเลขท้าย 2 ตัว */}
      <ArcadeCard 
        title="รางวัลเลขท้าย 2 ตัว" 
        prize={gameData.prizes.CurrentJackpot2D || 500000} 
        isWon={gameData.status.IsWon2D}
        value={guess2D}
        onChange={setGuess2D}
        length={2}
        onPlay={() => handlePlay('2D', guess2D, () => setGuess2D(''))}
        themeColor="linear-gradient(135deg, #18181f, #252530)"
      />

      {/* 🏆 ทำเนียบผู้โชคดี */}
      <div style={{ marginTop: '25px', padding: '15px', background: '#141419', borderRadius: '20px', border: '1px solid #23232a', position: 'relative', zIndex: 2 }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FFD700', margin: '0 0 12px 0', fontSize: '0.9rem' }}>
          <Trophy size={16} color="#FFD700" /> ทำเนียบคนดวงเฮงล่าสุด
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ background: '#0b0b0d', padding: '10px', borderRadius: '10px', fontSize: '0.8rem', borderLeft: '3px solid #FFD700', color: '#ccc' }}>
            🎉 คุณ <b>{maskString('Admin', 'name')}</b> ({maskString('0812345678', 'phone')}) คว้าแจ็คพ็อตใหญ่ 6 ตัว!
          </div>
          <div style={{ background: '#0b0b0d', padding: '10px', borderRadius: '10px', fontSize: '0.8rem', borderLeft: '3px solid #8a6f48', color: '#ccc' }}>
            🎉 คุณ <b>{maskString('Somsak', 'name')}</b> ({maskString('0998887777', 'phone')}) คว้าแจ็คพ็อต 4 ตัวสำเร็จ!
          </div>
        </div>
      </div>

      {/* ⚙️ แผงควบคุมระบบทดสอบ */}
      <div style={{ marginTop: '25px', textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <button 
          onClick={triggerNewDay}
          style={{ 
            padding: '10px 18px', borderRadius: '25px', border: '1px solid #2e2e38',
            background: '#141419', color: '#8A8A93', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 'bold'
          }}>
          <RefreshCw size={12} /> จำลองข้ามวัน (ทดสอบระบบทบยอดสะสม)
        </button>
      </div>

      {/* 🎮 CSS แอนิเมชัน */}
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes pulseBtn { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(0.98); opacity: 0.8; } }
        .spin-icon { animation: spin 4s linear infinite; }
        .tactile-btn:active { transform: scale(0.95); opacity: 0.9; }

        @keyframes sway1 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(2px, -1px); } }
        @keyframes sway2 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-3px, 2px); } }
        @keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 0.7; transform: scale(1.1); } }
        
        .sway-leaf-1 { animation: sway1 3s ease-in-out infinite; transform-origin: 50% 50%; }
        .sway-leaf-2 { animation: sway2 2.5s ease-in-out infinite; transform-origin: 50% 50%; }
        .sway-leaf-3 { animation: sway1 3.5s ease-in-out infinite; transform-origin: 50% 50%; }
        .pulse-glow { animation: pulse 2s ease-in-out infinite; transform-origin: 50% 50%; }
        .star-glow { animation: pulse 1.5s ease-in-out infinite; transform-origin: 50% 50%; }

        .particle-container { position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; pointer-events: none; z-index: 1; }
        .particle { position: absolute; bottom: -10px; width: 4px; height: 4px; background: rgba(255,215,0,0.3); borderRadius: 50%; animation: flyUp 8s infinite linear; }
        .particle:nth-child(1) { left: 10%; animation-duration: 6s; animation-delay: 1s; }
        .particle:nth-child(2) { left: 30%; animation-duration: 9s; animation-delay: 3s; width: 5px; height: 5px; }
        .particle:nth-child(3) { left: 55%; animation-duration: 7s; animation-delay: 0s; }
        .particle:nth-child(4) { left: 75%; animation-duration: 11s; animation-delay: 5s; }
        .particle:nth-child(5) { left: 90%; animation-duration: 8s; animation-delay: 2s; width: 3px; height: 3px; }

        @keyframes flyUp {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(-100vh) translateX(15px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ==============================================================
// 🎰 หน้าปัดไฟวิ่งโชว์ตัวเลข (Segmented Input Box)
// ==============================================================
function ArcadeDisplay({ length, value, onChange, isWon }) {
  const digits = value.split('');
  while (digits.length < length) digits.push('');

  if (isWon) return null;

  return (
    <div style={{ position: 'relative', margin: '10px 0', width: '100%' }}>
      <input 
        type="text" 
        pattern="\d*"
        maxLength={length}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10, fontSize: '16px' }}
      />
      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
        {digits.map((digit, idx) => {
          const isActive = value.length === idx;
          return (
            <div key={idx} style={{
              flex: 1, height: '42px', maxWidth: '40px', background: '#070709',
              border: `2px solid ${isActive ? '#FFD700' : '#2d2d35'}`,
              borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.2rem', fontWeight: 'bold', color: digit ? '#FFD700' : '#3d3d48',
              boxShadow: isActive ? '0 0 10px rgba(255,215,0,0.3)' : 'none',
              textShadow: digit ? '0 0 6px rgba(255,215,0,0.5)' : 'none',
              transition: '0.1s'
            }}>
              {digit || '-'}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==============================================================
// 💎 แผงตู้รางวัล 6 ตัว (แบ่งคู่หน้า-คู่กลาง-คู่หลัง)
// ==============================================================
function ArcadeCard6D({ prize, isWon, value, onChange, onPlay }) {
  const p1 = value.substring(0, 2);
  const p2 = value.substring(2, 4);
  const p3 = value.substring(4, 6);

  return (
    <div style={{ background: 'linear-gradient(135deg, #090e1a 0%, #131135 100%)', padding: '18px', borderRadius: '24px', border: '1px solid #1e1c52', marginBottom: '15px', boxShadow: '0 8px 25px rgba(0,0,0,0.4)', position: 'relative', zIndex: 2 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
          <Sparkles size={16} color="#FFD700" /> แกรนด์แจ็คพ็อต 6 ตัว
        </h3>
        <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 'bold', background: isWon ? '#2a0810' : '#042f24', color: isWon ? '#f43f5e' : '#34d399', border: `1px solid ${isWon ? '#f43f5e' : '#34d399'}` }}>
          {isWon ? 'รางวัลแตกแล้ว' : 'รางวัลว่าง'}
        </span>
      </div>
      <p style={{ margin: '4px 0 0 0', fontSize: '0.7rem', color: '#94a3b8', opacity: 0.8 }}>ค่าตั๋ว 20 บาท | ทายถูก 1-2 คู่ รับรางวัลปลอบใจ!</p>
      
      <h2 style={{ fontSize: '1.6rem', color: '#FFD700', margin: '12px 0', letterSpacing: '-0.5px', textShadow: '0 0 10px rgba(255,215,0,0.5)', whiteSpace: 'nowrap' }}>
        {new Intl.NumberFormat('lo-LA', { style: 'currency', currency: 'LAK' }).format(prize)}
      </h2>

      {!isWon ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <div style={{ flex: 1, textAlign: 'center' }}><span style={{fontSize:'0.7rem', color:'#64748b'}}>คู่หน้า</span><ArcadeDisplay length={2} value={p1} onChange={(val) => onChange(val + p2 + p3)} /></div>
            <div style={{ flex: 1, textAlign: 'center' }}><span style={{fontSize:'0.7rem', color:'#64748b'}}>คู่กลาง</span><ArcadeDisplay length={2} value={p2} onChange={(val) => onChange(p1 + val + p3)} /></div>
            <div style={{ flex: 1, textAlign: 'center' }}><span style={{fontSize:'0.7rem', color:'#64748b'}}>คู่หลัง</span><ArcadeDisplay length={2} value={p3} onChange={(val) => onChange(p1 + p2 + val)} /></div>
          </div>
          <button onClick={onPlay} className="tactile-btn" style={{ width: '100%', padding: '14px', background: 'linear-gradient(90deg, #FFD700, #F59E0B)', color: '#000', fontWeight: 'bold', fontSize: '0.95rem', border: 'none', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(245,158,11,0.35)', transition: '0.1s' }}>
            ⚡ ยิงคำสั่งสอยดาว 6 ตัว!
          </button>
        </div>
      ) : (
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#94a3b8' }}>
          <AlertCircle size={14} /> <span>รอบนี้แจ็คพ็อตแตกแล้ว รอระบบคำนวณรอบถัดไปนะครับ</span>
        </div>
      )}
    </div>
  );
}

// ==============================================================
// 🎰 ตู้แผงควบคุมรางวัลเดี่ยวทั่วไป (4D, 3D, 2D)
// ==============================================================
function ArcadeCard({ title, prize, isWon, value, onChange, length, onPlay, themeColor }) {
  return (
    <div style={{ background: '#141419', padding: '16px', borderRadius: '24px', border: '1px solid #23232a', marginBottom: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', position: 'relative', zIndex: 2 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#EAEAEA', fontWeight: 'bold' }}>
          <Gift size={14} color="#FFD700" /> {title}
        </h4>
        <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: 'bold', background: isWon ? '#2d1212' : '#0c2616', color: isWon ? '#FF4D4F' : '#52C41A' }}>
          {isWon ? 'รางวัลแตกแล้ว' : 'ยังว่างอยู่'}
        </span>
      </div>
      
      <h3 style={{ margin: '0 0 10px 0', fontSize: '1.3rem', color: '#FFD700' }}>
        {new Intl.NumberFormat('lo-LA', { style: 'currency', currency: 'LAK' }).format(prize)}
      </h3>

      {!isWon ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <ArcadeDisplay length={length} value={value} onChange={onChange} />
          </div>
          <button 
            onClick={onPlay}
            className="tactile-btn"
            style={{ 
              height: '42px', padding: '0 16px', borderRadius: '10px', border: 'none',
              background: themeColor, color: themeColor.includes('d4af37') ? 'black' : 'white',
              fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '0.85rem', transition: '0.1s',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}
          >
            สอยดาว!
          </button>
        </div>
      ) : (
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#8A8A93' }}>
          <AlertCircle size={12} /> <span>มีผู้โชคดีสอยรางวัลนี้ไปแล้ว รอเล่นใหม่ในวันถัดไปนะครับ</span>
        </div>
      )}
    </div>
  );
}