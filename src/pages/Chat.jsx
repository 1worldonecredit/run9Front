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

      // สร้างชื่อห้องแชท (เรียงตาม A-Z เพื่อให้ได้ชื่อตรงกันเสมอ)
      const chatRoom = [me, username].sort().join('_');
      setRoom(chatRoom);

      // 2. จำลองดึงโปรไฟล์เพื่อน
      setPartnerInfo({
        username: username,
        profileImageUrl: `https://ui-avatars.com/api/?name=${username}&background=random&color=fff`,
        isOnline: true
      });

      // 3. เช็คสถานะ "เพื่อน" จาก Database
      try {
        const friendRes = await fetch(`${API_URL}/api/chat/check-friend?me=${me}&friend=${username}`);
        const friendData = await friendRes.json();
        setIsFriend(friendData.isFriend);
      } catch (err) { console.error("Check friend error", err); }

      // 4. ดึงประวัติแชทเก่าจาก Database
      try {
        const historyRes = await fetch(`${API_URL}/api/chat/history/${chatRoom}`);
        const historyData = await historyRes.json();
        if (historyData.success) {
          setMessages(historyData.messages);
        }
      } catch (err) { console.error("Fetch history error", err); }

      // 5. เชื่อมต่อ Socket.IO
      const newSocket = io(SOCKET_URL);
      setSocket(newSocket);
      newSocket.emit('join_room', chatRoom);

      // 🌟 ย้ายการเช็ค 'delete' มาไว้ที่ตรงนี้แทน เพื่อไม่ให้เกิด Infinite Loop
      newSocket.on('receive_message', (data) => {
        if (data.type === 'delete') {
          // ถ้าเป็นการแจ้งเตือนว่าลบข้อความ ให้อัปเดตสถานะข้อความนั้น
          setMessages((prev) => prev.map(m => m.id === data.msgId ? { ...m, isDeleted: true } : m));
        } else {
          // ถ้าเป็นข้อความปกติ ก็เพิ่มเข้าจอ
          setMessages((prev) => [...prev, data]);
        }
      });

      setLoading(false);

      return () => {
        newSocket.disconnect();
      };
    };

    initChat();
  }, [username, navigate]);

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

  // 🌟 ฟังก์ชันส่งรูปภาพ
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && isFriend) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const newMessage = {
          id: Date.now(),
          room: room,
          sender: myUsername,
          text: null,
          imageUrl: reader.result,
          timestamp: new Date(),
          isDeleted: false
        };
        
        setMessages((prev) => [...prev, newMessage]);
        socket?.emit('send_message', newMessage);

        try {
          await fetch(`${API_URL}/api/chat/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newMessage)
          });
        } catch(err) { console.error("Save img error", err); }
      };
      reader.readAsDataURL(file);
    }
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
    <div className="chat-wrapper">
      <div className="chat-page">
        
        {/* Top Navbar */}
        <div className="chat-navbar">
          <div className="chat-nav-left">
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

          <div className="chat-nav-right">
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <Bell size={22} color="#CFA348" />
            </div>

            <button onClick={() => setShowMenu(!showMenu)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
              <MoreVertical size={24} />
            </button>

            {/* Dropdown Menu */}
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

       {/* Chat Messages */}
        <div className="chat-messages">
          {messages.length === 0 && isFriend && (
             <div style={{ textAlign: 'center', color: '#64748B', marginTop: '20px', fontSize: '0.85rem' }}>เริ่มการสนทนากับ {partnerInfo.username}</div>
          )}

          {messages.map((msg) => {
            // ❌ ลบ if(msg.type === 'delete') ทิ้งไปเลยนะครับ เราย้ายไปด้านบนแล้ว
            
            const isMe = msg.sender === myUsername;
            return (
              <div key={msg.id} className={`msg-wrapper ${isMe ? 'items-end' : 'items-start'}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexDirection: isMe ? 'row-reverse' : 'row' }}>
                  
                  {/* กล่องข้อความ / รูปภาพ */}
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
                
                {/* 🌟 เพิ่มสถานะ "อ่านแล้ว" ตรงส่วนที่แสดงเวลา */}
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

        {/* Input Area */}
        <div className="chat-input-area">
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

        {/* Modal ค้นหาเพื่อน */}
        {showSearchModal && (
          <div className="chat-modal-overlay">
            <div className="chat-modal-box">
              <h3 style={{ margin: '0 0 15px 0', color: '#CFA348', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Search size={20} /> ค้นหาเพื่อน
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '15px' }}>เพิ่มเพื่อนด้วย Username เพื่อความเป็นส่วนตัว</p>
              
              <input 
                type="text" 
                placeholder="กรอก Username..." 
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: '10px', border: '1px solid rgba(207, 163, 72, 0.3)', background: 'rgba(0,0,0,0.3)', color: '#fff', marginBottom: '20px', outline: 'none' }}
              />
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setShowSearchModal(false)} style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>ยกเลิก</button>
                <button onClick={handleSearchAddFriend} style={{ flex: 1, padding: '10px', background: '#CFA348', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>เพิ่มเพื่อน</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}