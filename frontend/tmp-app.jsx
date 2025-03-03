import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import BookingForm from "./components/BookingForm";
import BookingList from "./components/BookingList";
import BookingEdit from "./components/BookingEdit";
import AdminDashboard from "./components/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./components/Login";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          {/* Navigation */}
          <nav className="bg-white shadow-md">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center h-16">
                <Link to="/" className="text-xl font-bold">
                  ระบบจองห้องพัก
                </Link>
                <div className="space-x-4">
                  <Link to="/" className="text-gray-600 hover:text-gray-900">
                    หน้าแรก
                  </Link>
                  <Link
                    to="/booking"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    จองห้องพัก
                  </Link>
                  <Link
                    to="/admin"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    สำหรับผู้ดูแล
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          {/* Routes */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/booking" element={<BookingForm />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/bookings"
              element={
                <ProtectedRoute>
                  <BookingList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/bookings/edit/:id"
              element={
                <ProtectedRoute>
                  <BookingEdit />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

// HomePage component
const HomePage = () => (
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-4xl font-bold text-center mb-8">
      ยินดีต้อนรับสู่ระบบจองห้องพัก
    </h1>
    <div className="text-center">
      <Link
        to="/booking"
        className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
      >
        จองห้องพักเลย
      </Link>
    </div>
  </div>
);

export default App;