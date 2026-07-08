import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SoiDaoGame from './pages/SoiDaoGame';

// -------------------------------------------------------------
// 1. นำเข้าไฟล์หน้าต่างๆ 
// (ถ้าไฟล์ Layout.jsx ของคุณอยู่ในโฟลเดอร์ pages ให้แก้เป็น './pages/Layout' นะครับ)
// -------------------------------------------------------------
import Prelogin from './Prelogin'; 
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import Notifications from './pages/Notifications';
import Assets from './pages/Assets';
import Market from './pages/Market';
import Chat from './pages/Chat';
import Layout from './Layout'; 
import Promo from './pages/Promo';
import PlayHistory from './pages/PlayHistory';
import Deposit from './pages/Deposit';
import AddUsersName from './pages/AddUsersName'


function App() {
  // -------------------------------------------------------------
  // 2. สร้างตัวแปรเก็บข้อมูลผู้ใช้ (ใส่ค่าเริ่มต้นป้องกันหน้าขาว)
  // -------------------------------------------------------------
  const [userProfile, setUserProfile] = useState({
    name: 'กำลังเตรียมข้อมูล...',
    phone: '',
    image: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
  });
  
  const [isLoading, setIsLoading] = useState(true);

  // -------------------------------------------------------------
  // 3. จำลองการดึงข้อมูลตอนเปิดแอป
  // -------------------------------------------------------------
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setTimeout(() => {
          // โหลดเสร็จแล้ว อัปเดตข้อมูล
          setUserProfile({
            name: 'ยังไม่ได้ระบุชื่อ', 
            phone: 'ยังไม่ได้ระบุเบอร์โทร',
            image: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
          });
          
          setIsLoading(false); // สั่งปิดหน้าโหลด

        }, 1000); // หน่วงเวลาให้เห็นหน้าโหลด 1 วินาที
      } catch (error) {
        console.error("Error:", error);
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // -------------------------------------------------------------
  // 4. หน้าจอ "กำลังโหลด" 
  // -------------------------------------------------------------
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f3f4f6' }}>
        <h3 style={{ color: '#1e3a8a' }}>กำลังเตรียมระบบ 9 Plus...</h3>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 5. โครงสร้างหน้าเว็บหลัก (Router)
  // -------------------------------------------------------------
  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* กลุ่มหน้าอิสระ (ไม่มีเมนูบาร์) */}
          <Route path="/" element={<Prelogin />} />
          <Route path="/login" element={<Login />} />  {/* 🟢 เพิ่มบรรทัดนี้เข้าไปครับ */}
  
          {/* หน้า Dashboard เปล่าๆ ชั่วคราว เพื่อให้ทดสอบได้ */}
       
          {/* กลุ่มหน้าหลัก (มี Layout คลุมเพื่อให้มี Navbar บน-ล่าง) */}
          <Route element={<Layout userProfile={userProfile} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/game" element={<SoiDaoGame />} />
            {/* หน้า Profile ส่งตัวแปรไปเยอะกว่าเพื่อน เพื่อให้อัปเดตรูปได้ */}
            <Route path="/profile" element={
              <Profile 
                userProfile={userProfile} 
                setUserProfile={setUserProfile} 
              />
            } />
            <Route path="/cart" element={<Cart />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/market" element={<Market />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/play-history" element={<PlayHistory />} />
            <Route path="/deposit" element={<Deposit />} />
            <Route path="/addusersname" element={<AddUsersName />} />

          </Route>
            <Route path="/prelogin" element={<Prelogin/>} />
          <Route path="/promo" element={<Promo />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;