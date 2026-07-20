import React, { useState, useEffect } from 'react';
// 🌟 เพิ่ม Outlet เข้ามาเพื่อใช้สำหรับทำ Protected Route
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import SoiDaoGame from './pages/SoiDaoGame';

// -------------------------------------------------------------
// 1. นำเข้าไฟล์หน้าต่างๆ 
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
import AddUsersName from './pages/AddUsersName';
import Team from './pages/Team';
import TopUpMoney from './pages/TopUpMoney';
import P2POrderDetail from './pages/P2POrderDetail';
import MyP2POrders from './pages/MyP2POrders';
import History from './pages/History'; 
import ProfileMyTeam from './pages/ProfileMyTeam';
import ChatList from './pages/ChatList';

// ==========================================
// 🌟 ฟังก์ชันยามเฝ้าประตู (Protected Route)
// ==========================================
const ProtectedRoute = () => {
  const isAuth = localStorage.getItem('userProfile');
  
  // ถ้าไม่มีข้อมูลโปรไฟล์ในเครื่อง (ยังไม่ล็อกอิน) ให้เตะกลับไปหน้า login
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  
  // ถ้าล็อกอินแล้ว ให้ผ่านไปแสดงผลหน้าลูกๆ (Outlet) ได้
  return <Outlet />;
};

function App() {
  // -------------------------------------------------------------
  // 2. สร้างตัวแปรเก็บข้อมูลผู้ใช้
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
          setUserProfile({
            name: 'ยังไม่ได้ระบุชื่อ', 
            phone: 'ยังไม่ได้ระบุเบอร์โทร',
            image: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
          });
          setIsLoading(false); 
        }, 1000); 
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
          {/* ========================================== */}
          {/* 🔓 โซนอิสระ: ใครก็เข้าได้ (ไม่ต้องล็อกอิน) */}
          {/* ========================================== */}
          <Route path="/" element={<Prelogin />} />
          <Route path="/prelogin" element={<Prelogin/>} />
          <Route path="/login" element={<Login />} />  
          <Route path="/register" element={<Register />} />
          <Route path="/promo" element={<Promo />} />

          {/* ========================================== */}
          {/* 🔒 โซนปลอดภัย: ต้องผ่านยาม (ProtectedRoute) เท่านั้น */}
          {/* ========================================== */}
          <Route element={<ProtectedRoute />}>
            
            {/* กลุ่มหน้าหลัก (มี Layout คลุมเพื่อให้มี Navbar บน-ล่าง) */}
            <Route element={<Layout userProfile={userProfile} />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/game" element={<SoiDaoGame />} />
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
              
              <Route path="/chat-list" element={<ChatList />} />
              <Route path="/chat" element={<Navigate to="/chat-list" replace />} />
              <Route path="/chat/:username" element={<Chat />} />
              
              <Route path="/play-history" element={<PlayHistory />} />
              <Route path="/deposit" element={<Deposit />} />
              <Route path="/addusersname" element={<AddUsersName />} />
              <Route path="/team" element={<Team/>} />
              <Route path="/topup" element={<TopUpMoney/>}/>
              <Route path="/p2p-order/:id" element={<P2POrderDetail />} />
              <Route path="/my-p2p-orders" element={<MyP2POrders />} />
              <Route path="/history" element={<History />} />
              <Route path="/profile-my-team/:username" element={<ProfileMyTeam />} />
            </Route>

          </Route>

          {/* 🌟 ดักจับ URL มั่วๆ (404) ให้เด้งกลับไปหน้าแรกสุดเสมอ */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;