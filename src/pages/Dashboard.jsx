import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Bell, Home, Briefcase, TrendingUp, MessageCircle } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <>


      <div className="page-content">
        <h3>Dashboard Overview</h3>
        <div className="card" style={{ marginTop: '20px' }}>
          <p>ยินดีต้อนรับสู่ 9 Plus System!</p>
        </div>
      </div>


    </>
  );
}