import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Video, Image as ImageIcon, Send, Paperclip } from 'lucide-react';
import { io } from 'socket.io-client'; // 🌟 1. นำเข้า Socket.IO Client

// 🌟 2. ตั้งค่าการเชื่อมต่อไปที่ Backend (ถ้าคุณใช้ Railway ให้เปลี่ยนเป็น URL ของ Railway ได้เลยครับ)
// ตรงนี้ผมใส่ http://localhost:5100 เผื่อไว้ให้คุณทดสอบในคอมก่อน
const SOCKET_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:5100' : 'https://api.run9.app'; 

export default function Chat() {
  const { username } = useParams(); // ชื่อเพื่อนที่เราจะคุยด้วย
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [myUsername, setMyUsername] = useState('');
  const [partnerInfo, setPartnerInfo] = useState({ username: username, profileImageUrl: '', isOnline: true });
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  
  // State สำหรับเก็บ Socket และชื่อห้อง
  const [socket, setSocket] = useState(null);
  const [room, setRoom] = useState('');

  // 🌟 3. จัดการเชื่อมต่อ Socket เมื่อเปิดหน้าแชท
  useEffect(() => {
    // 3.1 ดึงชื่อ Username ของตัวเองจาก LocalStorage
    const savedProfileStr = localStorage.getItem('userProfile');
    let me = '';
    if (savedProfileStr) {
      try {
        const parsed = JSON.parse(savedProfileStr);
        me = parsed.username || '';
        setMyUsername(me);
      } catch (e) {}
    }

    if (!me) {
        alert("กรุณาเข้าสู่ระบบก่อนใช้งานแชท");
        return;
    }

    // 3.2 สร้างชื่อห้องแชท (นำชื่อ 2 คนมาเรียงตาม A-Z เพื่อให้ได้ชื่อห้องตรงกันเสมอ)
    const chatRoom = [me, username].sort().join('_');
    setRoom(chatRoom);

    // 3.3 สร้างการเชื่อมต่อ Socket ไปที่ Backend
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    // 3.4 แจ้ง Backend ว่าขอเข้าร่วมห้องแชทนี้
    newSocket.emit('join_room', chatRoom);

    // 3.5 ดักฟังข้อความใหม่จากเพื่อน (เมื่อมีคนส่งมา จะทำงานตรงนี้)
    newSocket.on('receive_message', (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    // (จำลองดึงโปรไฟล์เพื่อน - อนาคตสามารถยิง API ไปดึงรูปจริงได้)
    setPartnerInfo({
      username: username,
      profileImageUrl: `https://ui-avatars.com/api/?name=${username}&background=random&color=fff`,
      isOnline: true
    });
    
    setLoading(false);

    // 3.6 ตัดการเชื่อมต่อเมื่อกดปุ่มกลับ หรือปิดหน้าแชท
    return () => {
      newSocket.disconnect();
    };
  }, [username]);

  // เลื่อนหน้าจอลงมาล่างสุดเสมอเมื่อมีข้อความใหม่
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 🌟 4. ฟังก์ชันส่งข้อความ
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !socket) return;

    // เตรียมก้อนข้อมูลข้อความ
    const messageData = {
      id: Date.now(),
      room: room, // ส่งชื่อห้องไปด้วย Backend จะได้ส่งถูกห้อง
      sender: myUsername, // คนส่งคือเราเอง
      text: inputText,
      timestamp: new Date()
    };

    // 1. อัปเดตข้อความขึ้นหน้าจอตัวเองทันที
    setMessages((prev) => [...prev, messageData]);
    
    // 2. ยิงข้อมูลผ่านท่อ Socket ไปให้เพื่อน
    socket.emit('send_message', messageData);
    
    // 3. ล้างช่องพิมพ์ข้อความ
    setInputText('');
  };

  // 🌟 ฟังก์ชันส่งรูปภาพ (เบื้องต้น)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && socket) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const messageData = {
          id: Date.now(),
          room: room,
          sender: myUsername,
          imageUrl: reader.result, // ส่งเป็น Base64
          timestamp: new Date()
        };
        
        setMessages((prev) => [...prev, messageData]);
        socket.emit('send_message', messageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCall = (type) => {
    alert(`กำลังพัฒนาระบบ ${type} Call 📞\n(เตรียมเชื่อมต่อ WebRTC ในอนาคต)`);
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('th-TH', { hour: '2-digit', minute: '2-digit' }).format(new Date(date));
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px', color: '#fff', background: '#0B0E14', minHeight: '100vh' }}>กำลังโหลด...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0B0E14', color: '#fff', fontFamily: "'Prompt', sans-serif" }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 20px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}>
            <ArrowLeft size={24} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <img src={partnerInfo.profileImageUrl} alt="profile" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
              {partnerInfo.isOnline && (
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', background: '#10B981', border: '2px solid #0B0E14', borderRadius: '50%' }}></div>
              )}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>{partnerInfo.username}</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: partnerInfo.isOnline ? '#10B981' : '#64748B' }}>
                {partnerInfo.isOnline ? 'ออนไลน์' : 'ออฟไลน์'}
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <button onClick={() => handleCall('Voice')} style={{ background: 'none', border: 'none', color: '#CFA348', cursor: 'pointer' }}>
            <Phone size={22} />
          </button>
          <button onClick={() => handleCall('Video')} style={{ background: 'none', border: 'none', color: '#CFA348', cursor: 'pointer' }}>
            <Video size={24} />
          </button>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#64748B', marginTop: '20px', fontSize: '0.85rem' }}>
            นี่คือจุดเริ่มต้นของการสนทนากับ {partnerInfo.username}
          </div>
        )}

        {messages.map((msg) => {
          // 🌟 เช็คว่าใครเป็นคนส่ง ถ้า sender ตรงกับ myUsername แสดงว่าเราพิมพ์เอง
          const isMe = msg.sender === myUsername;
          return (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
              
              <div style={{ 
                maxWidth: '75%', 
                padding: msg.imageUrl ? '5px' : '12px 16px', 
                background: msg.imageUrl ? 'none' : (isMe ? 'linear-gradient(135deg, #CFA348 0%, #B8860B 100%)' : '#1E293B'), 
                color: isMe ? '#000' : '#fff', 
                borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
              }}>
                {msg.imageUrl ? (
                  <img src={msg.imageUrl} alt="attachment" style={{ maxWidth: '100%', borderRadius: '12px', border: `2px solid ${isMe ? '#CFA348' : '#1E293B'}` }} />
                ) : (
                  <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.4', fontWeight: isMe ? '500' : 'normal' }}>{msg.text}</p>
                )}
              </div>
              <span style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '5px', padding: '0 5px' }}>{formatTime(msg.timestamp)}</span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ padding: '15px 20px', background: 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
        <form onSubmit={handleSendMessage} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.3)', padding: '8px 15px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)' }}>
          
          <input type="file" accept="image/*" id="chatImageUpload" style={{ display: 'none' }} onChange={handleImageUpload} />
          <label htmlFor="chatImageUpload" style={{ color: '#94A3B8', cursor: 'pointer', padding: '5px' }}>
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
      </div>

    </div>
  );
}