import React, { useState } from 'react';
import { ChevronLeft, Save, UserCircle } from 'lucide-react';

export default function AddUsersName({ setCurrentPage, currentUser }) {
  // -----------------------------------------------------------
  // ส่วนที่ 1: สร้าง State เพื่อเก็บข้อมูลที่ผู้ใช้พิมพ์ในช่องกรอก
  // -----------------------------------------------------------
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // -----------------------------------------------------------
  // ส่วนที่ 2: ฟังก์ชันสำหรับยิงข้อมูลไปหา Node.js (เมื่อกดปุ่มบันทึก)
  // -----------------------------------------------------------
  const handleSaveName = async (e) => {
    e.preventDefault(); // ป้องกันไม่ให้หน้าเว็บรีเฟรชตอนกด Submit

    try {
      // ใช้ fetch ยิงข้อมูลไปที่ API ที่เราเพิ่งสร้างใน Server.js
      const response = await fetch('https://api.run9.app/update-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: currentUser, // ส่งชื่อ user ไปด้วย เพื่อให้รู้ว่ากำลังแก้ของใคร
          firstName: firstName,  // ชื่อที่พิมพ์
          lastName: lastName     // นามสกุลที่พิมพ์
        })
      });

      if (response.ok) {
        alert("บันทึกชื่อ-นามสกุลสำเร็จ!");
        setCurrentPage('profile'); // บันทึกเสร็จ สั่งให้เด้งกลับหน้าโปรไฟล์
      } else {
        alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (error) {
      alert("ไม่สามารถติดต่อเซิร์ฟเวอร์ได้");
    }
  };

  // -----------------------------------------------------------
  // ส่วนที่ 3: หน้าตา UI (แบบฟอร์ม)
  // -----------------------------------------------------------
  return (
    <div className="flex flex-col items-center justify-start min-h-[85vh] bg-slate-50 text-slate-900 pt-10 px-4 pb-20">
      
      {/* ปุ่มย้อนกลับ */}
      <div className="w-full max-w-md mb-6">
        <button onClick={() => setCurrentPage('profile')} className="flex items-center gap-2 text-slate-500 hover:text-amber-600 transition font-medium">
          <ChevronLeft size={20} /> ย้อนกลับไปโปรไฟล์
        </button>
      </div>

      <h2 className="text-3xl font-bold text-slate-900 mb-2">ข้อมูลชื่อ-สกุล</h2>
      <p className="text-slate-500 mb-8 text-center">กรุณาระบุชื่อและนามสกุลให้ตรงกับบัญชีธนาคาร<br/>เพื่อความสะดวกในการทำธุรกรรม</p>
      
      {/* ฟอร์มกรอกข้อมูล */}
      <form onSubmit={handleSaveName} className="w-full max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
        
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
            <UserCircle size={40} />
          </div>
        </div>

        <div className="space-y-5">
          {/* ช่องกรอกชื่อ */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">ชื่อจริง (First Name)</label>
            <input 
              type="text" 
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)} // เมื่อพิมพ์ให้เอาไปเก็บใน State
              placeholder="ไม่ต้องใส่คำนำหน้าชื่อ"
              className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-amber-400 outline-none transition" 
            />
          </div>

          {/* ช่องกรอกนามสกุล */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">นามสกุล (Last Name)</label>
            <input 
              type="text" 
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)} // เมื่อพิมพ์ให้เอาไปเก็บใน State
              placeholder="นามสกุล"
              className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-amber-400 outline-none transition" 
            />
          </div>

          {/* ปุ่มบันทึก */}
          <button type="submit" className="w-full bg-slate-900 text-amber-400 py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition shadow-lg mt-6 flex justify-center items-center gap-2">
            <Save size={20}/> บันทึกข้อมูล
          </button>
        </div>

      </form>

    </div>
  );
}