import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Tags, Users, Settings, LogOut } from 'lucide-react';

export default function ShopLayout() {
  const location = useLocation();

  // สร้างอาร์เรย์ของเมนู เพื่อให้ Loop ง่ายๆ
  const menuItems = [
    { path: '/shop/dashboard', name: 'แดชบอร์ด', icon: <LayoutDashboard size={20} /> },
    { path: '/shop/orders', name: 'ออร์เดอร์', icon: <ShoppingCart size={20} /> },
    { path: '/shop/products', name: 'จัดการสินค้า', icon: <Package size={20} /> },
    { path: '/shop/promotions', name: 'โปรโมชั่น', icon: <Tags size={20} /> },
    { path: '/shop/staff', name: 'จัดการพนักงาน', icon: <Users size={20} /> },
    { path: '/shop/settings', name: 'ตั้งค่าร้านค้า', icon: <Settings size={20} /> },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f8fafc' }}>
      
      {/* 🟢 แถบเมนูด้านซ้าย (Sidebar) สำหรับหน้าจอคอม / แท็บเล็ต */}
      <div style={{ width: '250px', backgroundColor: '#1e293b', color: '#fff', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #334155', textAlign: 'center' }}>
          <h2 style={{ margin: 0, color: '#fbbf24' }}>My Shop Pro</h2>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: '5px 0 0 0' }}>ศูนย์บัญชาการร้านค้า</p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '15px 10px' }}>
          {menuItems.map((item) => {
            const isActive = location.pathname.includes(item.path);
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', 
                  borderRadius: '8px', textDecoration: 'none', marginBottom: '8px',
                  backgroundColor: isActive ? '#3b82f6' : 'transparent',
                  color: isActive ? '#ffffff' : '#cbd5e1',
                  fontWeight: isActive ? 'bold' : 'normal',
                  transition: 'all 0.2s'
                }}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        <div style={{ padding: '20px', borderTop: '1px solid #334155' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444', textDecoration: 'none', fontWeight: 'bold' }}>
            <LogOut size={20} /> กลับไปหน้านักช้อป
          </Link>
        </div>
      </div>

      {/* 🟢 พื้นที่แสดงเนื้อหาหลัก (จะเปลี่ยนไปตามเมนูที่คลิก) */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {/* <Outlet /> คือจุดที่ React Router จะเอาเนื้อหาของหน้าต่างๆ มาเสียบ */}
        <Outlet /> 
      </div>

    </div>
  );
}