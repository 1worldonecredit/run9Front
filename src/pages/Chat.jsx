import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Paperclip, MoreVertical, UserPlus, Search, Ban, Bell, Phone, Video, Trash2, Download, X } from 'lucide-react';
import { io } from 'socket.io-client';

// 🌟 ตั้งค่า URL ของ API และ Socket (เปลี่ยนเป็น localhost:5100 ได้ถ้ากำลังทดสอบในคอม)
const API_URL = 'https://api.run9.app'; 
const SOCKET_URL = 'https://api.run9.app'; 

export default function Chat() {
  const { username } = useParams(); // ชื่อคนที่เรากำลังเปิดแชทด้วย
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  // 🌟 2. เพิ่ม State สำหรับเก็บรูปที่ต้องการขยายดู
  const [selectedImage, setSelectedImage] = useState(null);
  // 🌟 เพิ่ม State เก็บรูปภาพรอส่ง (Preview)
  const [previewImages, setPreviewImages] = useState([]);
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

  // 🌟 1. ฟังก์ชันเมื่อกดเลือกรูป (เช็คจำนวน + บีบอัดเก็บไว้ใน State ก่อน)
  const handleSelectImages = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // 🔒 ป้องกันคนส่งรัวๆ: จำกัดสูงสุด 4 รูปต่อครั้ง
    const MAX_IMAGES = 4;
    if (files.length > MAX_IMAGES) {
      alert(`เพื่อความเสถียรของระบบ กรุณาส่งรูปสูงสุดไม่เกิน ${MAX_IMAGES} รูปต่อครั้งครับ`);
      e.target.value = null;
      return;
    }

    try {
      const compressedList = [];
      for (let i = 0; i < files.length; i++) {
        // บีบอัดรูปเตรียมไว้
        const compressedBase64 = await compressImage(files[i]);
        compressedList.push(compressedBase64);
      }
      // นำรูปไปใส่ใน State เพื่อแสดงหน้า Preview
      setPreviewImages(compressedList);
    } catch(err) { 
      console.error("Compress error:", err); 
      alert("เกิดข้อผิดพลาดในการอ่านไฟล์รูปภาพ");
    }
    
    e.target.value = null; // เคลียร์ค่า input
  };

  // 🌟 2. ฟังก์ชันกดยืนยันส่งรูปจากหน้า Preview
  const handleConfirmSendImages = async () => {
    const imgsToSend = [...previewImages];
    setPreviewImages([]); // ปิดหน้า Preview ทันทีเพื่อความลื่นไหล

    for (let i = 0; i < imgsToSend.length; i++) {
      try {
        const newMessage = {
          id: Date.now() + i, // บวก i เพื่อป้องกัน ID ชนกัน
          room: room,
          sender: myUsername,
          text: null,
          imageUrl: imgsToSend[i],
          timestamp: new Date(),
          isDeleted: false,
          isRead: false
        };
        
        // แสดงบนจอทันที และส่ง Socket
        setMessages((prev) => [...prev, newMessage]);
        socket?.emit('send_message', newMessage);

        // บันทึกลงฐานข้อมูล
        await fetch(`${API_URL}/api/chat/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMessage)
        });
      } catch(err) { 
        console.error("Upload error:", err); 
      }
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

      {/* 🌟 2. พื้นที่ข้อความ (จัดกลุ่มรูปภาพเป็น Grid 2 คอลัมน์) */}
      <div className="chat-messages" style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        backgroundImage: 'url(/BG2.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        {messages.length === 0 && isFriend && (
           <div style={{ textAlign: 'center', color: '#64748B', marginTop: '20px', fontSize: '0.85rem' }}>เริ่มการสนทนากับ {partnerInfo.username}</div>
        )}

        {(() => {
          const elements = [];
          let imgGroup = [];

          const flushImgGroup = () => {
            if (imgGroup.length > 0) {
              const sender = imgGroup[0].sender;
              const isMe = sender === myUsername;
              const lastMsg = imgGroup[imgGroup.length - 1];

              elements.push(
                <div key={`group-${imgGroup[0].id}`} className={`msg-wrapper ${isMe ? 'items-end' : 'items-start'}`}>
                  <div style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', gap: '8px', alignItems: 'flex-end' }}>
                    
                    {/* กล่อง Grid สำหรับรูปภาพ */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: imgGroup.length > 1 ? 'repeat(2, 1fr)' : '1fr',
                      gap: '5px',
                      maxWidth: '260px' 
                    }}>
                      {imgGroup.map(msg => (
                        <div key={msg.id} style={{ position: 'relative' }}>
                          <img
                            src={msg.imageUrl}
                            alt="attachment"
                            onClick={() => setSelectedImage(msg.imageUrl)} 
                            style={{
                              width: imgGroup.length > 1 ? '120px' : '160px',
                              height: imgGroup.length > 1 ? '120px' : '160px',
                              objectFit: 'cover',
                              borderRadius: '12px',
                              border: `1px solid ${isMe ? '#CFA348' : '#1E293B'}`,
                              cursor: 'pointer',
                              transition: 'transform 0.2s'
                            }}
                            onMouseOver={e => e.currentTarget.style.transform = 'scale(0.98)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                          />
                          {isMe && (
                            <button onClick={() => handleDeleteMessage(msg.id)} style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', cursor: 'pointer', padding: '5px', borderRadius: '50%' }}>
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#64748B', padding: '0 5px', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px' }}>
                    {formatTime(lastMsg.timestamp)}
                    {isMe && (lastMsg.isRead ? <span style={{ color: '#10B981', fontWeight: 'bold' }}>อ่านแล้ว</span> : <span>ส่งแล้ว</span>)}
                  </span>
                </div>
              );
              imgGroup = []; 
            }
          };

          messages.forEach((msg) => {
            if (msg.isDeleted) {
              flushImgGroup();
              const isMe = msg.sender === myUsername;
              elements.push(
                <div key={msg.id} className={`msg-wrapper ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`msg-bubble`} style={{ padding: '12px 16px', background: 'transparent', border: '1px dashed #64748B', color: '#64748B' }}>
                    <span style={{ fontStyle: 'italic', fontSize: '0.85rem' }}>🚫 ข้อความนี้ถูกลบแล้ว</span>
                  </div>
                </div>
              );
            } else if (msg.imageUrl) {
              if (imgGroup.length > 0 && imgGroup[imgGroup.length - 1].sender !== msg.sender) {
                flushImgGroup();
              }
              imgGroup.push(msg);
            } else {
              flushImgGroup();
              const isMe = msg.sender === myUsername;
              elements.push(
                <div key={msg.id} className={`msg-wrapper ${isMe ? 'items-end' : 'items-start'}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexDirection: isMe ? 'row-reverse' : 'row' }}>
                    <div className={`msg-bubble ${isMe ? 'msg-me' : 'msg-partner'}`} style={{ padding: '12px 16px' }}>
                      <span>{msg.text}</span>
                    </div>
                    {isMe && (
                      <button onClick={() => handleDeleteMessage(msg.id)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '5px' }}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#64748B', padding: '0 5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    {formatTime(msg.timestamp)}
                    {isMe && (msg.isRead ? <span style={{ color: '#10B981', fontWeight: 'bold' }}>อ่านแล้ว</span> : <span>ส่งแล้ว</span>)}
                  </span>
                </div>
              );
            }
          });
          flushImgGroup(); 
          return elements;
        })()}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 🌟 3. ช่องพิมพ์ข้อความ (ถูกล็อกไว้ด้านล่าง) */}
      <div className="chat-input-area" style={{
        background: 'rgba(11, 14, 20, 0.95)',
        backdropFilter: 'blur(10px)',
        padding: '15px 20px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        flexShrink: 0, 
        zIndex: 10
      }}>
        {isFriend ? (
          <form onSubmit={handleSendMessage} className="chat-form">
            {/* 🌟 กดเลือกไฟล์จะไปเรียก handleSelectImages แทน เพื่อเปิดหน้า Preview */}
            <input type="file" accept="image/*" multiple id="chatUpload" style={{ display: 'none' }} onChange={handleSelectImages} />
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

      {/* 🌟 4. Popup ขยายรูปภาพพร้อมปุ่มดาวน์โหลด (Fullscreen Modal) */}
      {selectedImage && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.95)', zIndex: 9999,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <button onClick={() => setSelectedImage(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '10px' }}>
            <X size={32} />
          </button>
          <img src={selectedImage} alt="fullscreen" style={{ maxWidth: '95%', maxHeight: '75vh', objectFit: 'contain', borderRadius: '8px' }} />
          <a href={selectedImage} download={`9Plus_Chat_Image_${Date.now()}.jpg`} style={{ 
            marginTop: '30px', background: '#CFA348', color: '#000', padding: '12px 30px', 
            borderRadius: '30px', textDecoration: 'none', fontWeight: 'bold', 
            display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(207, 163, 72, 0.4)'
          }}>
            <Download size={20} /> บันทึกรูปภาพ
          </a>
        </div>
      )}

      {/* 🌟 5. Popup Preview: แสดงรูปก่อนส่ง */}
      {previewImages.length > 0 && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(11, 14, 20, 0.95)', backdropFilter: 'blur(10px)', zIndex: 10000,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <h3 style={{ color: '#fff', marginBottom: '10px' }}>ตัวอย่างรูปภาพก่อนส่ง</h3>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '25px' }}>
           เลือกแล้ว <span style={{ color: '#CFA348', fontWeight: 'bold' }}>{previewImages.length}</span> รูป (จากสูงสุด 4 รูป)
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: previewImages.length > 1 ? 'repeat(2, 1fr)' : '1fr',
            gap: '15px',
            maxWidth: '90%',
            maxHeight: '60vh',
            overflowY: 'auto',
            padding: '10px'
          }}>
            {previewImages.map((src, idx) => (
               <div key={idx} style={{ position: 'relative' }}>
                 <img src={src} alt="preview" style={{ width: '100%', height: previewImages.length > 1 ? '160px' : '250px', objectFit: 'cover', borderRadius: '12px', border: '2px solid #CFA348', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' }} />
               </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '20px', marginTop: '40px' }}>
            <button onClick={() => setPreviewImages([])} style={{ padding: '12px 30px', borderRadius: '30px', border: '1px solid rgba(239, 68, 68, 0.5)', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' }}>
               ยกเลิก
            </button>
            <button onClick={handleConfirmSendImages} style={{ padding: '12px 30px', borderRadius: '30px', border: 'none', background: '#CFA348', color: '#000', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(207, 163, 72, 0.4)', transition: '0.3s' }}>
               <Send size={18} /> ยืนยันการส่ง
            </button>
          </div>
        </div>
      )}

    </div>
  );
}