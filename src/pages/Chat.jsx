import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Paperclip, MoreVertical, UserPlus, Search, Ban, Bell, CheckCircle2 } from 'lucide-react';
// import { io } from 'socket.io-client';

export default function Chat() {
  const { username } = useParams(); // ชื่อคนที่เรากำลังเปิดแชทด้วย
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [myUsername, setMyUsername] = useState('me'); 
  const [partnerInfo, setPartnerInfo] = useState({ username: username, profileImageUrl: '', isOnline: true });
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  
  // 🌟 State สำหรับระบบเพื่อนและการค้นหา
  const [isFriend, setIsFriend] = useState(false); // เช็คว่าเป็นเพื่อนกันหรือยัง
  const [unreadCount, setUnreadCount] = useState(2); // แจ้งเตือนข้อความใหม่ (Mock)
  const [showMenu, setShowMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchUsername, setSearchUsername] = useState('');

  useEffect(() => {
    // 🌟 จำลองการดึงข้อมูล (คุณต้องไป Fetch API จากตาราง ChatFriends เพื่อเช็ค)
    setPartnerInfo({
      username: username,
      profileImageUrl: `https://ui-avatars.com/api/?name=${username}&background=random&color=fff`,
      isOnline: true
    });

    // สมมติว่าดึง API มาแล้วพบว่า "ยังไม่เป็นเพื่อนกัน"
    setIsFriend(false); 

    setMessages([
      { id: 1, sender: username, text: 'สวัสดีครับ สนใจเข้าร่วมทีมครับ', timestamp: new Date(Date.now() - 3600000) }
    ]);
    
    setLoading(false);
  }, [username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 🌟 ฟังก์ชันส่งข้อความ (บันทึกลง Database ทันที)
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !isFriend) return;

    const newMessage = {
      id: Date.now(),
      sender: myUsername,
      text: inputText,
      timestamp: new Date()
    };

    // 1. โชว์ขึ้นจอตัวเองก่อนเพื่อความรวดเร็ว
    setMessages([...messages, newMessage]);
    setInputText('');

    /* 🌟 2. ส่งไปบันทึกลง Database และส่งผ่าน Socket
    try {
      // ส่งผ่าน Socket ให้เพื่อนเห็นทันที
      socket.emit('send_message', newMessage);

      // ยิง API บันทึกลงตาราง ChatMessages ทันที
      await fetch('https://api.run9.app/api/chat/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room: 'room_name',
          sender: myUsername,
          text: inputText
        })
      });
    } catch(err) {
      console.error("Save message error", err);
    }
    */
  };

  // 🌟 ฟังก์ชันขอเพิ่มเพื่อนด้วย Username
  const handleAddFriend = () => {
    if(!searchUsername.trim()) return;
    alert(`ส่งคำขอเพิ่มเพื่อนไปยัง Username: ${searchUsername} เรียบร้อยแล้ว`);
    setShowSearchModal(false);
    setSearchUsername('');
    // TODO: Fetch API INSERT ลงตาราง ChatFriends
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('th-TH', { hour: '2-digit', minute: '2-digit' }).format(new Date(date));
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px', color: '#fff', background: '#0B0E14', minHeight: '100vh' }}>กำลังโหลด...</div>;

  return (
    <div className="chat-wrapper">
      <div className="chat-page">
        
        {/* 🌟 Top Navbar (มีแจ้งเตือนและเมนูเพื่อน) */}
        <div className="chat-navbar">
          <div className="chat-nav-left">
            <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}>
              <ArrowLeft size={24} />
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src={partnerInfo.profileImageUrl} alt="profile" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>{partnerInfo.username}</h3>
                <p style={{ margin: 0, fontSize: '0.75rem', color: partnerInfo.isOnline ? '#10B981' : '#64748B' }}>
                  {partnerInfo.isOnline ? 'ออนไลน์' : 'ออฟไลน์'}
                </p>
              </div>
            </div>
          </div>

          <div className="chat-nav-right">
            {/* 🌟 ไอคอนแจ้งเตือนข้อความ (โชว์ตัวเลขสีแดง) */}
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => alert('ไปหน้าแชทรวม')}>
              <Bell size={22} color="#CFA348" />
              {unreadCount > 0 && (
                <div style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#EF4444', color: '#fff', fontSize: '0.6rem', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>
                  {unreadCount}
                </div>
              )}
            </div>

            <button onClick={() => setShowMenu(!showMenu)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
              <MoreVertical size={24} />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div style={{ position: 'absolute', top: '40px', right: '0', background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px 0', width: '180px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
                <button style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 15px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', textAlign: 'left', fontSize: '0.85rem' }} onClick={() => { setShowSearchModal(true); setShowMenu(false); }}>
                  <Search size={16} color="#94A3B8" /> ค้นหา Username
                </button>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', margin: '5px 0' }}></div>
                <button style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 15px', background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', textAlign: 'left', fontSize: '0.85rem' }} onClick={() => { alert('บล็อกผู้ใช้นี้เรียบร้อย'); setShowMenu(false); }}>
                  <Ban size={16} color="#EF4444" /> บล็อกผู้ใช้นี้
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 🌟 Chat Messages */}
        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`msg-wrapper ${msg.sender === myUsername ? 'items-end' : 'items-start'}`}>
              <div className={`msg-bubble ${msg.sender === myUsername ? 'msg-me' : 'msg-partner'}`}>
                {msg.text}
              </div>
              <span style={{ fontSize: '0.7rem', color: '#64748B', padding: '0 5px' }}>{formatTime(msg.timestamp)}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* 🌟 Input Area (เช็คสถานะความเป็นเพื่อน) */}
        <div className="chat-input-area">
          {isFriend ? (
            <form onSubmit={handleSendMessage} className="chat-form">
              <input type="file" id="chatUpload" style={{ display: 'none' }} />
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
              <button onClick={() => setIsFriend(true)} style={{ background: '#CFA348', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>
                ส่งคำขอเป็นเพื่อน
              </button>
            </div>
          )}
        </div>

        {/* 🌟 Modal ค้นหาเพื่อนด้วย Username */}
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
                <button onClick={handleAddFriend} style={{ flex: 1, padding: '10px', background: '#CFA348', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>เพิ่มเพื่อน</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}