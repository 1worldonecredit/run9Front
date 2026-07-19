import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Check, X, MessageCircle } from 'lucide-react';

const API_URL = 'https://api.run9.app'; // หรือ 'http://localhost:5100' ถ้าทดสอบในคอม

export default function ChatList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [myUsername, setMyUsername] = useState('');
  
  const [pendingRequests, setPendingRequests] = useState([]);
  const [chatList, setChatList] = useState([]);
  const [searchUsername, setSearchUsername] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);

  useEffect(() => {
    const fetchChatData = async () => {
      const savedProfileStr = localStorage.getItem('userProfile');
      let me = '';
      if (savedProfileStr) {
        try {
          me = JSON.parse(savedProfileStr).username || '';
          setMyUsername(me);
        } catch (e) {}
      }

      if (!me) {
        navigate('/'); return;
      }

      try {
        const res = await fetch(`${API_URL}/api/chat/list/${me}`);
        const data = await res.json();
        if (data.success) {
          setPendingRequests(data.pendingRequests);
          
          // เรียงแชทที่มีข้อความล่าสุดขึ้นบนสุด
          const sortedChats = data.chatList.sort((a, b) => new Date(b.lastTime || 0) - new Date(a.lastTime || 0));
          setChatList(sortedChats);
        }
      } catch (err) { console.error(err); }
      setLoading(false);
    };

    fetchChatData();
  }, [navigate]);

  // ยอมรับเพื่อน
  const handleAcceptFriend = async (requester) => {
    try {
      await fetch(`${API_URL}/api/chat/accept-friend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ me: myUsername, requesterUsername: requester })
      });
      alert('ยอมรับเพื่อนเรียบร้อย');
      window.location.reload(); // โหลดข้อมูลใหม่
    } catch (err) {}
  };

  // ปฏิเสธเพื่อน
  const handleRejectFriend = async (requester) => {
    try {
      await fetch(`${API_URL}/api/chat/reject-friend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ me: myUsername, targetUsername: requester })
      });
      setPendingRequests(prev => prev.filter(req => req.Requester !== requester));
    } catch (err) {}
  };

  // ค้นหาและส่งคำขอเพื่อน
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
    } catch (err) {}
  };

  const formatTime = (dateStr) => {
    if(!dateStr) return '';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('th-TH', { hour: '2-digit', minute: '2-digit' }).format(date);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px', color: '#fff', background: '#0B0E14', minHeight: '100vh' }}>กำลังโหลด...</div>;

  return (
    <div style={{ background: '#0B0E14', minHeight: '100vh', color: '#fff', fontFamily: "'Prompt', sans-serif", paddingBottom: '90px' }}>
      
      {/* 🌟 Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#CFA348' }}>ข้อความ</h2>
        <button onClick={() => setShowSearchModal(true)} style={{ background: 'rgba(207, 163, 72, 0.15)', border: '1px solid rgba(207, 163, 72, 0.3)', color: '#CFA348', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}>
          <UserPlus size={20} />
        </button>
      </div>

      <div style={{ padding: '20px' }}>
        
        {/* 🌟 คำขอเป็นเพื่อน (โชว์เฉพาะเวลามีคนส่งมา) */}
        {pendingRequests.length > 0 && (
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ fontSize: '0.9rem', color: '#94A3B8', marginBottom: '10px' }}>คำขอเป็นเพื่อน ({pendingRequests.length})</h3>
            {pendingRequests.map((req, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1E293B', padding: '15px', borderRadius: '12px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontWeight: 'bold' }}>
                    {req.Requester.substring(0,2).toUpperCase()}
                  </div>
                  <h4 style={{ margin: 0, color: '#fff' }}>{req.Requester}</h4>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => handleAcceptFriend(req.Requester)} style={{ background: '#10B981', color: '#fff', border: 'none', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}><Check size={18} /></button>
                  <button onClick={() => handleRejectFriend(req.Requester)} style={{ background: 'rgba(255,255,255,0.1)', color: '#EF4444', border: 'none', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}><X size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 🌟 รายการเพื่อนและแชท */}
        <h3 style={{ fontSize: '0.9rem', color: '#94A3B8', marginBottom: '10px' }}>รายการแชท</h3>
        {chatList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <MessageCircle size={40} color="#64748B" style={{ margin: '0 auto 15px auto' }} />
            <p style={{ color: '#64748B', margin: 0 }}>ยังไม่มีรายการแชท ค้นหาและเพิ่มเพื่อนเลย!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {chatList.map((chat, index) => (
              <div 
                key={index} 
                onClick={() => navigate(`/chat/${chat.FriendName}`)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'transparent', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <img src={chat.ProfileImageUrl || `https://ui-avatars.com/api/?name=${chat.FriendName}&background=random&color=fff`} alt="profile" style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', fontSize: '1.05rem', color: '#fff', fontWeight: chat.unreadCount > 0 ? 'bold' : 'normal' }}>{chat.FriendName}</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: chat.unreadCount > 0 ? '#fff' : '#64748B', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {chat.latestMessage}
                    </p>
                  </div>
                </div>
                
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                  <span style={{ fontSize: '0.75rem', color: chat.unreadCount > 0 ? '#10B981' : '#64748B' }}>{formatTime(chat.lastTime)}</span>
                  {chat.unreadCount > 0 && (
                    <div style={{ background: '#EF4444', color: '#fff', fontSize: '0.7rem', fontWeight: 'bold', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      {chat.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🌟 Modal ค้นหาเพื่อน */}
      {showSearchModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
          <div style={{ background: '#1E293B', width: '90%', maxWidth: '350px', padding: '25px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#CFA348', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Search size={20} /> ค้นหาเพื่อน
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '15px' }}>เพิ่มเพื่อนด้วย Username</p>
            <input 
              type="text" 
              placeholder="กรอก Username..." 
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: '10px', border: '1px solid rgba(207, 163, 72, 0.3)', background: 'rgba(0,0,0,0.3)', color: '#fff', marginBottom: '20px', outline: 'none' }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowSearchModal(false)} style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>ยกเลิก</button>
              <button onClick={handleSearchAddFriend} style={{ flex: 1, padding: '10px', background: '#CFA348', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>ส่งคำขอ</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}