import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Share2, FileText, MessageCircle, Camera, CalendarClock } from 'lucide-react';

export default function Team() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // ข้อมูลส่วนตัว
  const [myProfile, setMyProfile] = useState({
    username: data.profile.username || currentUsername,
              // 🌟 แก้ไขตรงนี้: ถ้าไม่มีรูปโปรไฟล์ ให้ใช้รูป Avatar ค่าเริ่มต้นแทน
    profileImageUrl: data.profile.profileImageUrl || 'https://i.pravatar.cc/150?img=11', 
    currencySymbol: data.profile.currencySymbol || '฿',
    walletBalance: 0,
    totalCommission: 0,
    monthlyCommission: 0
  });


  // รูปปกพื้นหลัง (ตั้งค่ารูปเริ่มต้นที่ดูหรูหราไว้ก่อน)
  const [coverImage, setCoverImage] = useState('/BG2.jpg');
  const [teamMembers, setTeamMembers] = useState([]);

 useEffect(() => {
    // 1. ดึง Username ตัวเองจาก LocalStorage ก่อน
    const savedProfileStr = localStorage.getItem('userProfile');
    let currentUsername = '';
    
    if (savedProfileStr) {
      try {
        const parsed = JSON.parse(savedProfileStr);
        currentUsername = parsed.username || '';
      } catch (e) {}
    }

    if (currentUsername) {
      // 🌟 2. ยิง API ดึงข้อมูล Profile (เงินในกระเป๋า, ค่านายหน้า) ตามโค้ดของคุณ
      fetch(`https://api.run9.app/api/user/profile-stats?username=${currentUsername}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.profile) {
            setMyProfile(prev => ({
              ...prev,
              username: data.profile.username || currentUsername,
              // ใช้รูปจาก API หรือรูปเริ่มต้นที่เราตั้งไว้
              profileImageUrl: data.profile.profileImageUrl || '/BG2.jpg', 
              currencySymbol: data.profile.currencySymbol || '฿',
              walletBalance: data.profile.walletBalance || 0,
              totalCommission: data.profile.totalCommission || 0,
              monthlyCommission: data.profile.monthlyCommission || 0
            }));
          }
        })
        .catch(err => console.error("Error fetching profile stats:", err));

      // 🌟 3. ยิง API ดึงรายชื่อทีมงานที่เราเพิ่งสร้าง
      fetch(`https://api.run9.app/api/team/my-team/${currentUsername}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setTeamMembers(data.members);
          }
        })
        .catch(err => console.error("Error fetching team:", err))
        .finally(() => setLoading(false));
        
    } else {
      setLoading(false); // ถ้าไม่ได้ Login ให้หยุดโหลด
    }
  }, []);

  // 🌟 ฟังก์ชันจัดการอัปโหลดเปลี่ยนรูปปก (Cover Image)
  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result); // แสดงผลรูปใหม่ทันที
        // TODO: ตรงนี้คุณสามารถเพิ่มโค้ดเพื่อยิง API บันทึกรูปลง Database ได้ในอนาคต
      };
      reader.readAsDataURL(file);
    }
  };

  // คำนวณอายุสมาชิก
  const calculateTenure = (dateString) => {
    if (!dateString) return 'ไม่ทราบข้อมูล';
    const regDate = new Date(dateString);
    const now = new Date();
    
    let years = now.getFullYear() - regDate.getFullYear();
    let months = now.getMonth() - regDate.getMonth();
    let days = now.getDate() - regDate.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    let result = [];
    if (years > 0) result.push(`${years} ปี`);
    if (months > 0) result.push(`${months} เดือน`);
    if (days > 0) result.push(`${days} วัน`);

    return result.length > 0 ? result.join(' ') : 'เริ่มวันนี้';
  };

  const maskName = (firstName, lastName, username) => {
    if (firstName && lastName) {
      const maskedFirst = firstName.length > 2 ? firstName.substring(0, 2) + '***' : firstName + '***';
      const maskedLast = lastName.length > 1 ? lastName.substring(0, 1) + '***' : '***';
      return `${maskedFirst} ${maskedLast}`;
    }
    if (username) {
      return username.length > 4 ? username.substring(0, 3) + '***' : username + '***';
    }
    return 'User***';
  };

  const handleSharePromo = () => {
    const promoLink = `https://soidao.run9.app/promo?ref=${myProfile.username}`;
    if (navigator.share) {
      navigator.share({
        title: 'เกมปลดรหัสตู้เซฟพารวย',
        text: 'โอกาสเปลี่ยนชีวิตมาถึงแล้ว! สมัครผ่านลิงก์ของฉันเพื่อรับสิทธิ์พิเศษ',
        url: promoLink,
      }).catch((error) => console.log('Error sharing', error));
    } else {
      navigator.clipboard.writeText(promoLink);
      alert(`✅ คัดลอกลิงก์แนะนำเรียบร้อยแล้ว!\n\n${promoLink}`);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px', color: '#fff', background: '#111', minHeight: '100vh' }}>กำลังโหลดข้อมูลทีม...</div>;

  return (
    <div className="pro-page-wrapper">
      
      {/* 🌟 Dynamic Blurred Background */}
      <div className="pro-page-bg" style={{ backgroundImage: `url(${coverImage})` }}></div>
      <div className="pro-page-overlay"></div>

      {/* 🌟 Top Cover Section */}
      <div className="pro-cover-section">
        <img src={coverImage} alt="Cover" className="pro-cover-img" />
        
        {/* ปุ่มอัปโหลดรูปปกซ่อนอยู่มุมขวาบน */}
        <input type="file" accept="image/*" id="coverUpload" style={{ display: 'none' }} onChange={handleCoverUpload} />
        <label htmlFor="coverUpload" className="pro-upload-cover-btn">
          <Camera size={18} />
        </label>
      </div>

      {/* 🌟 Profile Picture (ทับเส้น) */}
      <div className="pro-profile-wrapper">
        <img src={myProfile.profileImageUrl} alt="Profile" className="pro-profile-img" />
      </div>

      {/* 🌟 Text Info */}
      <div className="pro-text-center">
        <h2 className="pro-name">{myProfile.username}</h2>
        <p className="pro-role">Soidao 9Plus Member</p>
      </div>

      {/* 🌟 Stats Section (3 Columns) */}
      <div className="pro-stats-container">
        <div className="pro-stat-item">
          <p className="pro-stat-value">{new Intl.NumberFormat('th-TH', {notation: "compact", compactDisplay: "short"}).format(myProfile.walletBalance)}</p>
          <p className="pro-stat-label">ยอดเงิน</p>
        </div>
        
        <div className="pro-stat-divider"></div>
        
        <div className="pro-stat-item">
          <p className="pro-stat-value">{new Intl.NumberFormat('th-TH', {notation: "compact", compactDisplay: "short"}).format(myProfile.totalCommission)}</p>
          <p className="pro-stat-label">สะสมรวม</p>
        </div>

        <div className="pro-stat-divider"></div>
        
        <div className="pro-stat-item">
          <p className="pro-stat-value">{new Intl.NumberFormat('th-TH', {notation: "compact", compactDisplay: "short"}).format(myProfile.monthlyCommission)}</p>
          <p className="pro-stat-label">เดือนนี้</p>
        </div>
      </div>

      {/* 🌟 Action Buttons */}
      <div className="pro-actions">
        <button className="pro-btn-gold" onClick={handleSharePromo}>
          <Share2 size={18} /> แชร์โปรโมท
        </button>
        <button className="pro-btn-white" onClick={() => navigate('/history')}>
          <FileText size={18} /> ประวัติ
        </button>
      </div>

      {/* 🌟 Team List Section */}
      <div className="pro-team-section">
        <h3 className="pro-section-title">ทีมงานของฉัน ({teamMembers.length})</h3>
        
        <div className="pro-team-list">
          {teamMembers.length > 0 ? (
            teamMembers.map((member) => (
              <div key={member.id} className="pro-team-item">
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }} onClick={() => navigate(`/profile-my-team/${member.username}`)}>
                  <div className="team-member-avatar" style={{ width: '50px', height: '50px' }}>
                    <img src={member.profileImageUrl} alt="team" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 3px 0', fontSize: '1rem', color: '#fff' }}>
                      {maskName(member.firstName, member.lastName, member.username)}
                    </h4>
                    <p style={{ margin: '0 0 3px 0', fontSize: '0.75rem', color: '#D1D5DB' }}>ประเทศ: {member.country || 'ไม่ระบุ'}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#CFA348', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CalendarClock size={12} /> {calculateTenure(member.registeredAt)}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: '0 0 2px 0', fontSize: '0.7rem', color: '#D1D5DB' }}>ค่านายหน้า</p>
                    <span style={{ color: '#CFA348', fontWeight: 'bold', fontSize: '0.9rem' }}>
                      +{myProfile.currencySymbol}{new Intl.NumberFormat('th-TH').format(member.commissionEarned)}
                    </span>
                  </div>
                  
                  {/* ปุ่มแชทสีทอง */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); navigate(`/chat/${member.username}`); }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(207, 163, 72, 0.15)', color: '#CFA348', border: '1px solid rgba(207, 163, 72, 0.3)', cursor: 'pointer' }}
                  >
                    <MessageCircle size={18} />
                  </button>
                </div>

              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#D1D5DB' }}>
              <p>คุณยังไม่มีทีมงาน แนะนำเพื่อนเลย!</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}