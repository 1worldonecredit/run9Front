import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Paperclip, MoreVertical, UserPlus, Search, Ban, Bell, Phone, Video, Trash2 } from 'lucide-react';
import { io } from 'socket.io-client';

// 🌟 ตั้งค่า URL ของ API และ Socket (เปลี่ยนเป็น localhost:5100 ได้ถ้ากำลังทดสอบในคอม)
const API_URL = 'https://api.run9.app'; 
const SOCKET_URL = 'https://api.run9.app'; 

export default function Chat() {
  const { username } = useParams(); // ชื่อคนที่เรากำลังเปิดแชทด้วย
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [myUsername, setMyUsername] = useState(''); 
  const [partnerInfo, setPartnerInfo] = useState({ username: username, profileImageUrl: '', isOnline: true });
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  
  // State ระบบเพื่อน
  const [isFriend, setIsFriend] = useState(false);
  const [room, setRoom] = useState('');
  const [socket, setSocket] = useState(null);
  
  // State เมนู
  const [showMenu, setShowMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchUsername, setSearchUsername] = useState('');

  // 🌟 โหลดข้อมูลเริ่มต้น (โปรไฟล์, เช็คเพื่อน, ดึงแชทเก่า, ต่อ Socket)
  // 🌟 ชุดที่ 1: จัดการข้อมูลพื้นฐาน (ดึงประวัติแชท, เช็คเพื่อน, แจ้งระบบว่าอ่านแล้ว)
  // ทำงานแค่ครั้งเดียวตอนเปิดหน้า
  useEffect(() => {
    const initChat = async () => {
      // 1. ดึง Username ตัวเอง
      const savedProfileStr = localStorage.getItem('userProfile');
      let me = '';
      if (savedProfileStr) {
        try {
          me = JSON.parse(savedProfileStr).username || '';
          setMyUsername(me);
        } catch (e) {}
      }

      if (!me) {
        alert("กรุณาเข้าสู่ระบบก่อนใช้งานแชท");
        navigate('/');
        return;
      }

      // สร้างชื่อห้องแชท
      const chatRoom = [me, username].sort().join('_');
      setRoom(chatRoom);

      setPartnerInfo({
        username: username,
        profileImageUrl: `https://ui-avatars.com/api/?name=${username}&background=random&color=fff`,
        isOnline: true
      });

      // 3. เช็คสถานะเพื่อน
      try {
        const friendRes = await fetch(`${API_URL}/api/chat/check-friend?me=${me}&friend=${username}`);
        const friendData = await friendRes.json();
        setIsFriend(friendData.isFriend);
      } catch (err) { console.error("Check friend error", err); }

      // 4. ดึงประวัติแชทเก่า
      try {
        const historyRes = await fetch(`${API_URL}/api/chat/history/${chatRoom}`);
        const historyData = await historyRes.json();
        if (historyData.success) {
          setMessages(historyData.messages);
        }
      } catch (err) { console.error("Fetch history error", err); }

      setLoading(false);
    };

    initChat();
  }, [username, navigate]);

  // ===============================
  // 🌟 ฟังก์ชันบีบอัดรูปภาพก่อนส่ง
const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // กำหนดความกว้าง-ยาวสูงสุด (เช่น 800px กำลังดีสำหรับแชท)
        const MAX_SIZE = 800;
        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // แปลงกลับเป็น Base64 แบบ JPEG และบีบอัดคุณภาพเหลือ 60% (0.6)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
        resolve(compressedBase64);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};


  // 🌟 ชุดที่ 2: ระบบ Socket (Real-time) ทำงานแยกต่างหาก
  // จะเริ่มทำงานก็ต่อเมื่อรู้ "ชื่อห้อง (room)" และ "ชื่อเรา (myUsername)" แล้วเท่านั้น
  useEffect(() => {
    if (!room || !myUsername) return; 

    // 1. เชื่อมต่อ Socket (เพิ่มออปชั่นให้สายไม่หลุดง่าย)
    const newSocket = io(SOCKET_URL, {
        transports: ['websocket', 'polling']
    });
    setSocket(newSocket);

    // 2. ขอเข้าห้องแชท
    newSocket.emit('join_room', room);

    // 3. ดักฟังข้อความใหม่จากเพื่อน (ตัวที่ทำให้ข้อความเด้งขึ้นจอทันที)
    newSocket.on('receive_message', (data) => {
      if (data.type === 'delete') {
        setMessages((prev) => prev.map(m => m.id === data.msgId ? { ...m, isDeleted: true } : m));
      } else {
        setMessages((prev) => [...prev, data]);
        
        // ถ้ารับข้อความใหม่ขณะที่เปิดจอแชทอยู่ ให้ยิงบอกหลังบ้านว่า "อ่านแล้ว" ทันที
        fetch(`${API_URL}/api/chat/mark-read`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ room: room, me: myUsername })
        }).catch(err => console.error(err));
      }
    });

    // 4. ตัดการเชื่อมต่อเมื่อกดออกไปหน้าอื่น
    return () => {
      newSocket.disconnect();
    };
  }, [room, myUsername]); // ทำงานใหม่เมื่อ 2 ค่านี้พร้อม

  // ==========================================================

  // ฟังก์ชันพิเศษ: สั่งเคลียร์แจ้งเตือนทุกครั้งที่เปิดห้องแชท
  useEffect(() => {
    if (room && myUsername && messages.length > 0) {
      fetch(`${API_URL}/api/chat/mark-read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room: room, me: myUsername })
      }).catch(err => console.error("Auto mark-read error", err));
    }
  }, [messages.length, room, myUsername]);

  // เลื่อนจอลงล่างเสมอ
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 🌟 ฟังก์ชันส่งข้อความ
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !isFriend) return;

    const newMessage = {
      id: Date.now(), // ID ชั่วคราวก่อนลง DB
      room: room,
      sender: myUsername,
      text: inputText,
      imageUrl: null,
      timestamp: new Date(),
      isDeleted: false
    };

    // 1. โชว์ที่หน้าจอเราทันที
    setMessages((prev) => [...prev, newMessage]);
    setInputText('');

    // 2. ส่งผ่าน Socket ให้เพื่อน
    socket?.emit('send_message', newMessage);

    // 3. บันทึกลง Database
    try {
      await fetch(`${API_URL}/api/chat/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessage)
      });
    } catch(err) { console.error("Save msg error", err); }
  };

  // 🌟 ฟังก์ชันส่งรูปภาพ (บีบอัดก่อนส่ง)
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file && isFriend) {
      try {
        // 1. รอให้ฟังก์ชันบีบอัดรูปทำงานให้เสร็จ
        const compressedBase64 = await compressImage(file);
        
        const newMessage = {
          id: Date.now(),
          room: room,
          sender: myUsername,
          text: null,
          imageUrl: compressedBase64, // ใช้รูปที่บีบอัดแล้ว
          timestamp: new Date(),
          isDeleted: false,
          isRead: false
        };
        
        // 2. แสดงบนหน้าจอตัวเองทันที
        setMessages((prev) => [...prev, newMessage]);
        
        // 3. ส่งผ่าน Socket ให้เพื่อนเด้งทันที
        socket?.emit('send_message', newMessage);

        // 4. บันทึกลง Database
        await fetch(`${API_URL}/api/chat/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMessage)
        });

      } catch(err) { 
        console.error("Upload/Compress error:", err); 
        alert("เกิดข้อผิดพลาดในการประมวลผลรูปภาพ");
      }
    }
    
    // เคลียร์ค่า input file เพื่อให้กดส่งรูปเดิมซ้ำได้ในครั้งต่อไป
    e.target.value = null; 
  };

  // 🌟 ฟังก์ชันขอลบข้อความ (Soft Delete)
  const handleDeleteMessage = async (msgId) => {
    if(window.confirm('ต้องการลบข้อความนี้ใช่หรือไม่? (ลบเฉพาะหน้าจอ และเพื่อนจะเห็นว่าข้อความถูกลบ)')) {
      // อัปเดตหน้าจอตัวเองทันที
      setMessages(messages.map(msg => msg.id === msgId ? { ...msg, isDeleted: true } : msg));
      
      // ยิง API ไปอัปเดต Database
      try {
        await fetch(`${API_URL}/api/chat/delete/${msgId}`, { method: 'POST' });
        // แจ้งเตือนเพื่อนให้ลบข้อความบนจอด้วยผ่าน Socket
        socket?.emit('send_message', { type: 'delete', msgId: msgId, room: room });
      } catch (err) { console.error("Delete error", err); }
    }
  };

  // 🌟 ฟังก์ชันเพิ่มเพื่อน (ใช้จากการกดปุ่มเมื่อยังไม่เป็นเพื่อน)
  const handleAddDirectFriend = async () => {
    try {
      const res = await fetch(`${API_URL}/api/chat/add-friend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ me: myUsername, friendUsername: partnerInfo.username })
      });
      const data = await res.json();
      if (data.success) {
        alert('เพิ่มเพื่อนสำเร็จ! สามารถพูดคุยได้เลย');
        setIsFriend(true);
      } else {
        alert(data.message);
      }
    } catch (err) { console.error(err); }
  };

  // 🌟 ฟังก์ชันค้นหาและเพิ่มเพื่อนจากเมนู (Username อื่น)
  const handleSearchAddFriend = async () => {
    if(!searchUsername.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/chat/add-friend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ me: myUsername, friendUsername: searchUsername })
      });
      const data = await res.json();
      alert(data.message);
      setShowSearchModal(false);
      setSearchUsername('');
    } catch (err) { console.error(err); }
  };

  const formatTime = (date) => {
    if(!date) return '';
    return new Intl.DateTimeFormat('th-TH', { hour: '2-digit', minute: '2-digit' }).format(new Date(date));
  };
// 🌟 ฟังก์ชันพิเศษ: สั่งเคลียร์แจ้งเตือนทุกครั้งที่เปิดห้องแชท หรือมีข้อความใหม่เด้งเข้ามาในห้องนี้
  useEffect(() => {
    if (room && myUsername && messages.length > 0) {
      fetch(`${API_URL}/api/chat/mark-read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room: room, me: myUsername })
      }).catch(err => console.error("Auto mark-read error", err));
    }
  }, [messages.length, room, myUsername]); // ทำงานเมื่อจำนวนข้อความเปลี่ยนไป (เวลามีคนพิมพ์มาใหม่)

  if (loading) return <div style={{ textAlign: 'center', padding: '50px', color: '#fff', background: '#0B0E14', minHeight: '100vh' }}>กำลังโหลด...</div>;



  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      /* ดึงให้เต็มกรอบหน้าจอ โดยชดเชย padding ของ Layout */
      margin: '-20px', 
      /* ล็อกความสูงให้พอดีหน้าจอ (หักพื้นที่ TopNav และ BottomNav ออก) */
      height: 'calc(100vh - 170px)', 
      background: '#0B0E14' 
    }}>
      
      {/* 🌟 1. Top Navbar (ถูกล็อกไว้ด้านบน) */}
      <div className="chat-navbar" style={{ 
        background: 'rgba(11, 14, 20, 0.95)',
        backdropFilter: 'blur(10px)',
        padding: '15px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0, /* 🔒 ห้ามหดตัวเด็ดขาด */
        zIndex: 10
      }}>
        <div className="chat-nav-left" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}>
            <ArrowLeft size={24} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ position: 'relative' }}>
              <img src={partnerInfo.profileImageUrl} alt="profile" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
              {partnerInfo.isOnline && (
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', background: '#10B981', border: '2px solid rgba(11, 14, 20, 0.95)', borderRadius: '50%' }}></div>
              )}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>{partnerInfo.username}</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: partnerInfo.isOnline ? '#10B981' : '#64748B' }}>
                {isFriend ? (partnerInfo.isOnline ? 'ออนไลน์' : 'ออฟไลน์') : 'ยังไม่ได้เป็นเพื่อน'}
              </p>
            </div>
          </div>
        </div>

        <div className="chat-nav-right" style={{ position: 'relative', display: 'flex', gap: '15px', alignItems: 'center' }}>
          {/* ส่วนเมนู 3 จุด ค้นหา/บล็อก ของคุณใส่ตรงนี้ได้เลย (ผมดึงโค้ดเปิดปิดเมนูมาให้ด้วยครับ) */}
          <button onClick={() => setShowMenu(!showMenu)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
            <MoreVertical size={24} />
          </button>
          
          {showMenu && (
              <div style={{ position: 'absolute', top: '40px', right: '0', background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px 0', width: '180px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', zIndex: 30 }}>
                <button style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 15px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', textAlign: 'left', fontSize: '0.85rem' }} onClick={() => { setShowSearchModal(true); setShowMenu(false); }}>
                  <Search size={16} color="#94A3B8" /> ค้นหา Username
                </button>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', margin: '5px 0' }}></div>
                <button style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 15px', background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', textAlign: 'left', fontSize: '0.85rem' }} onClick={() => { alert('กำลังพัฒนาระบบบล็อก'); setShowMenu(false); }}>
                  <Ban size={16} color="#EF4444" /> บล็อกผู้ใช้นี้
                </button>
              </div>
          )}
        </div>
      </div>

      {/* 🌟 2. พื้นที่ข้อความ (เลื่อนได้เฉพาะตรงนี้!) */}
      <div className="chat-messages" style={{ 
        flex: 1, /* 🔓 ขยายพื้นที่ให้เต็มช่องว่างที่เหลืออยู่ */
        overflowY: 'auto', /* 🔓 เลื่อน (Scroll) ได้เฉพาะในกรอบนี้ */
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        backgroundImage: 'url(/BG2.jpg)', /* ย้ายรูปพื้นหลังมาไว้ตรงนี้ */
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        {messages.length === 0 && isFriend && (
           <div style={{ textAlign: 'center', color: '#64748B', marginTop: '20px', fontSize: '0.85rem' }}>เริ่มการสนทนากับ {partnerInfo.username}</div>
        )}

        {messages.map((msg) => {
          const isMe = msg.sender === myUsername;
          return (
            <div key={msg.id} className={`msg-wrapper ${isMe ? 'items-end' : 'items-start'}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexDirection: isMe ? 'row-reverse' : 'row' }}>
                
                {/* กล่องข้อความ */}
                <div className={`msg-bubble ${msg.isDeleted ? '' : (isMe ? 'msg-me' : 'msg-partner')}`} style={{ 
                  padding: (msg.imageUrl && !msg.isDeleted) ? '4px' : '12px 16px',
                  background: msg.isDeleted ? 'transparent' : undefined,
                  border: msg.isDeleted ? '1px dashed #64748B' : undefined,
                  color: msg.isDeleted ? '#64748B' : undefined,
                  boxShadow: msg.isDeleted ? 'none' : undefined
                }}>
                  {msg.isDeleted ? (
                    <span style={{ fontStyle: 'italic', fontSize: '0.85rem' }}>🚫 ข้อความนี้ถูกลบแล้ว</span>
                  ) : (
                    msg.imageUrl ? (
                      <img src={msg.imageUrl} alt="attachment" style={{ maxWidth: '100%', borderRadius: '12px', border: `1px solid ${isMe ? '#CFA348' : '#1E293B'}`, display: 'block' }} />
                    ) : (
                      <span>{msg.text}</span>
                    )
                  )}
                </div>

                {/* ปุ่มถังขยะ */}
                {isMe && !msg.isDeleted && (
                  <button onClick={() => handleDeleteMessage(msg.id)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '5px' }}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <span style={{ fontSize: '0.7rem', color: '#64748B', padding: '0 5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                {formatTime(msg.timestamp)}
                {isMe && !msg.isDeleted && (
                  msg.isRead ? <span style={{ color: '#10B981', fontWeight: 'bold' }}>อ่านแล้ว</span> : <span>ส่งแล้ว</span>
                )}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 🌟 3. ช่องพิมพ์ข้อความ (ถูกล็อกไว้ด้านล่าง) */}
      <div className="chat-input-area" style={{
        background: 'rgba(11, 14, 20, 0.95)',
        backdropFilter: 'blur(10px)',
        padding: '15px 20px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        flexShrink: 0, /* 🔒 ห้ามหดตัวเด็ดขาด */
        zIndex: 10
      }}>
        {isFriend ? (
          <form onSubmit={handleSendMessage} className="chat-form">
            <input type="file" accept="image/*" id="chatUpload" style={{ display: 'none' }} onChange={handleImageUpload} />
            <label htmlFor="chatUpload" style={{ color: '#94A3B8', cursor: 'pointer', padding: '5px' }}>
              <Paperclip size={20} />
            </label>
            <input 
              type="text" 
              placeholder="พิมพ์ข้อความ..." 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '0.95rem', padding: '5px' }}
            />
            <button type="submit" disabled={!inputText.trim()} style={{ background: inputText.trim() ? '#CFA348' : 'rgba(255,255,255,0.1)', color: inputText.trim() ? '#000' : '#64748B', border: 'none', width: '38px', height: '38px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: inputText.trim() ? 'pointer' : 'not-allowed', transition: '0.3s' }}>
              <Send size={18} style={{ marginLeft: '2px' }} />
            </button>
          </form>
        ) : (
          <div className="not-friend-alert">
            <UserPlus size={30} color="#CFA348" style={{ margin: '0 auto 10px auto' }} />
            <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#fff' }}>ต้องเป็นเพื่อนกันก่อนถึงจะพูดคุยได้</p>
            <button onClick={handleAddDirectFriend} style={{ background: '#CFA348', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>
              ส่งคำขอเพิ่ม {partnerInfo.username} เป็นเพื่อน
            </button>
          </div>
        )}
      </div>

    </div>
  );
}