import React from "react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">ระบบจัดการห้องพัก</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          to="/admin/bookings"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-bold mb-2">จัดการการจอง</h2>
          <p className="text-gray-600">ดู แก้ไข และลบข้อมูลการจองห้องพัก</p>
        </Link>

        <Link
          to="/admin/rooms"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-bold mb-2">จัดการห้องพัก</h2>
          <p className="text-gray-600">จัดการข้อมูลห้องพักและประเภทห้อง</p>
        </Link>

        <Link
          to="/admin/reports"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-bold mb-2">รายงาน</h2>
          <p className="text-gray-600">ดูรายงานและสถิติการจองห้องพัก</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;