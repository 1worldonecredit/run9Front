import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle, Info, ArrowLeft, Trash2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  
  // State สำหรับเก็บ ID ของรายการที่ถูกกดกางออก (Accordion)
  const [expandedId, setExpandedId] = useState(null);
  // State สำหรับเก็บ ID ของรายการที่กำลังรอกดยืนยันการลบ
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    const savedProfileStr = localStorage.getItem('userProfile');
    if (savedProfileStr) {
      try {
        const parsed = JSON.parse(savedProfileStr);
        setUsername(parsed.username);
      } catch (e) {
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchNotifications = async () => {
    if (!username) return;
    try {
      const response = await fetch(`https://api.run9.app/api/notifications/${username}`);
      const data = await response.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [username]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
    setConfirmDeleteId(null); // ปิดกล่องยืนยันการลบถ้าย่อ/ขยายใหม่
  };

  const hideNotification = async (id) => {
    try {
      setNotifications(notifications.filter(n => n.Id !== id));
      setConfirmDeleteId(null);
      await fetch(`https://api.run9.app/api/notifications/${id}/hide`, { method: 'PUT' });
    } catch (error) {
      console.error("Error hiding notification:", error);
    }
  };

  return (
    <div style={{ padding: '20px 15px', paddingBottom: '90px', fontFamily: "'Prompt', sans-serif", background: '#0B0E14', minHeight: '100vh', color: '#fff' }}>
      
      <div className="notif-container">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', padding: '6px', borderRadius: '8px', color: '#94A3B8', cursor: 'pointer' }}>
            <ArrowLeft size={18} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={20} color="#60A5FA" />
            <h2 style={{ margin: 0, fontSize: '1rem', color: '#E2E8F0' }}>การแจ้งเตือน</h2>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', fontSize: '0.8rem' }}>กำลังโหลดข้อมูล...</div>
        ) : notifications.length > 0 ? (
          <div>
            {notifications.map((notif) => {
              const isSuccess = notif.Title.includes('สำเร็จ') || notif.Title.includes('อนุมัติ');
              const themeColor = isSuccess ? '#10B981' : '#3B82F6';
              const isExpanded = expandedId === notif.Id;
              const isConfirming = confirmDeleteId === notif.Id;

              return (
                <div key={notif.Id} className="notif-card">
                  {/* หัวข้อ (คลิกเพื่อกาง) */}
                  <div className="notif-header" onClick={() => toggleExpand(notif.Id)}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1 }}>
                      {isSuccess ? <CheckCircle size={16} color={themeColor} /> : <Info size={16} color={themeColor} />}
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 2px 0', fontSize: '0.8rem', color: themeColor }}>{notif.Title}</h4>
                        <p style={{ margin: 0, fontSize: '0.65rem', color: '#64748B' }}>
                          {new Date(notif.CreatedAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                        </p>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {/* ส่วนจัดการลบ หรือ ลูกศร */}
                      {isConfirming ? (
                        <div className="confirm-delete-box" onClick={(e) => e.stopPropagation()}>
                          <AlertCircle size={14} color="#EF4444" />
                          <button className="btn-confirm-yes" onClick={() => hideNotification(notif.Id)}>ลบ</button>
                          <button className="btn-confirm-no" onClick={() => setConfirmDeleteId(null)}>ยกเลิก</button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <button 
                            className="btn-trash" 
                            onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(notif.Id); }}
                          >
                            <Trash2 size={16} />
                          </button>
                          {isExpanded ? <ChevronUp size={16} color="#64748B" /> : <ChevronDown size={16} color="#64748B" />}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* เนื้อหาข้อความ (จะโชว์เมื่อ isExpanded = true) */}
                  <div className={`notif-body ${isExpanded ? 'expanded' : ''}`}>
                    <p style={{ margin: '0 0 10px 0', fontSize: '0.75rem', color: '#94A3B8', lineHeight: '1.5', paddingTop: '10px', borderTop: '1px dashed rgba(255,255,255,0.05)' }}>
                      {notif.Message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748B' }}>
            <Bell size={24} style={{ opacity: 0.3, marginBottom: '10px' }} />
            <p style={{ margin: 0, fontSize: '0.75rem' }}>ไม่มีการแจ้งเตือนใหม่</p>
          </div>
        )}
      </div>
    </div>
  );
}