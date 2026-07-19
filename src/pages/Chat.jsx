import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Video, Image as ImageIcon, Send, Paperclip } from 'lucide-react';

export default function Chat() {
  const { username } = useParams(); // รับชื่อคนที่ต้องการแชทด้วยจาก URL
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [partnerInfo, setPartnerInfo] = useState({ username: username, profileImageUrl: '', isOnline: true });
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  // 🌟 จำลองการดึงข้อมูลประวัติแชทและข้อมูลเพื่อน (รอเชื่อม API จริง)
  useEffect(() => {
    // สมมติว่านี่คือข้อมูลที่ดึงมาจาก Database
    setPartnerInfo({
      username: username,
      profileImageUrl: `https://ui-avatars.com/api/?name=${username}&background=random&color=fff`,
      isOnline: true
    });

    setMessages([
      { id: 1, sender: username, text: 'สวัสดีครับ! ยินดีต้อนรับสู่ทีม', timestamp: new Date(Date.now() - 3600000) },
      { id: 2, sender: 'me', text: 'สวัสดีครับ ฝากเนื้อฝากตัวด้วยครับ', timestamp: new Date(Date.now() - 3500000) },
    ]);
    
    setLoading(false);
  }, [username]);

  // 🌟 เลื่อนหน้าจอลงมาล่างสุดเสมอเมื่อมีข้อความใหม่
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 🌟 ฟังก์ชันส่งข้อความ
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage = {
      id: Date.now(),
      sender: 'me',
      text: inputText,
      timestamp: new Date()
    };

    setMessages([...messages, newMessage]);
    setInputText('');
    
    // TODO: ตรงนี้ต้องใส่คำสั่งส่งข้อมูลผ่าน Socket.IO หรือ Fetch API ไปบันทึกลง Database
  };

  // 🌟 ฟังก์ชันส่งรูปภาพ
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newMessage = {
          id: Date.now(),
          sender: 'me',
          imageUrl: reader.result,
          timestamp: new Date()
        };
        setMessages([...messages, newMessage]);
        // TODO: ส่งรูปภาพผ่าน API ไปบันทึก
      };
      reader.readAsDataURL(file);
    }
  };

  // 🌟 ฟังก์ชันจำลองการโทร
  const handleCall = (type) => {
    alert(`กำลังพัฒนาระบบ ${type} Call 📞\n(เตรียมเชื่อมต่อ WebRTC ในอนาคต)`);
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('th-TH', { hour: '2-digit', minute: '2-digit' }).format(new Date(date));
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px', color: '#fff', background: '#0B0E14', minHeight: '100vh' }}>กำลังโหลด...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0B0E14', color: '#fff', fontFamily: "'Prompt', sans-serif" }}>
      
      {/* 🌟 Header Bar */}
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

        {/* ปุ่มโทรและวิดีโอคอล */}
        <div style={{ display: 'flex', gap: '15px' }}>
          <button onClick={() => handleCall('Voice')} style={{ background: 'none', border: 'none', color: '#CFA348', cursor: 'pointer' }}>
            <Phone size={22} />
          </button>
          <button onClick={() => handleCall('Video')} style={{ background: 'none', border: 'none', color: '#CFA348', cursor: 'pointer' }}>
            <Video size={24} />
          </button>
        </div>
      </div>

      {/* 🌟 Chat Messages Area */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {messages.map((msg) => {
          const isMe = msg.sender === 'me';
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

      {/* 🌟 Input Area */}
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