import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth(); // ดึง token โดยตรงจาก useAuth
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
        const response = await axios.get("/api/bookings", {
          headers: { Authorization: `Bearer ${token}` }
        });
      setBookings(response.data);
      setLoading(false);
    } catch (err) {
        console.error("Error details:", err);
        setError(`ไม่สามารถดึงข้อมูลการจองได้: ${err.message}`);
        setLoading(false);
        navigate("/admin/bookings");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("คุณต้องการลบข้อมูลการจองนี้ใช่หรือไม่?")) {
      try {
        await axios.delete(`http://localhost:3001/api/bookings/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // ดึงข้อมูลใหม่หลังจากลบ
        fetchBookings();
        alert("ลบข้อมูลการจองเรียบร้อยแล้ว");
      } catch (err) {
        alert("เกิดข้อผิดพลาดในการลบข้อมูล");
      }
    }
  };

  if (loading)
    return <div className="text-center py-4">กำลังโหลดข้อมูล...</div>;
  if (error)
    return <div className="text-center py-4 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">รายการจองห้องพัก</h2>
        <Link
          to="/admin/bookings/new"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          เพิ่มการจอง
        </Link>
      </div>

      {bookings.length === 0 ? (
        <p className="text-center py-4">ไม่พบข้อมูลการจอง</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold">{booking.fullname}</h3>
                <div className="space-x-2">
                  <Link
                    to={`/admin/bookings/edit/${booking.id}`}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    แก้ไข
                  </Link>
                  <button
                    onClick={() => handleDelete(booking.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ลบ
                  </button>
                </div>
              </div>
              <p className="text-gray-600">อีเมล: {booking.email}</p>
              <p className="text-gray-600">เบอร์โทร: {booking.phone}</p>
              <p className="text-gray-600">
                ประเภทห้อง:{" "}
                {booking.roomtype === "standard"
                  ? "ห้องมาตรฐาน"
                  : booking.roomtype === "deluxe"
                  ? "ห้องดีลักซ์"
                  : "ห้องสวีท"}
              </p>
              <p className="text-gray-600">
                วันที่เข้าพัก:{" "}
                {new Date(booking.checkin).toLocaleDateString("th-TH")}
              </p>
              <p className="text-gray-600">
                วันที่ออก:{" "}
                {new Date(booking.checkout).toLocaleDateString("th-TH")}
              </p>
              <p className="text-gray-600">
                จำนวนผู้เข้าพัก: {booking.guests} ท่าน
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingList;