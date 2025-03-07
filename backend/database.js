const sqlite3 = require('sqlite3').verbose();
const path = require('path'); // เพิ่มเพื่อจัดการพาธ

// เพิ่มข้อมูล admin เริ่มต้น
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const adminPassword = bcrypt.hashSync('admin123', salt);

// สร้างการเชื่อมต่อกับฐานข้อมูล - ระบุพาธให้ชัดเจน
const db = new sqlite3.Database(path.join(__dirname, 'bookings.db'), (err) => {
  if (err) {
    console.error('เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล:', err);
  } else {
    console.log('เชื่อมต่อฐานข้อมูลสำเร็จ');
    
    // สร้างตารางและตรวจสอบว่าได้ถูกสร้างหรือไม่
    createTables(() => {
      // ตรวจสอบว่าตาราง users ถูกสร้างหรือไม่
      db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (err, row) => {
        if (err) {
          console.error('เกิดข้อผิดพลาดในการตรวจสอบตาราง users:', err);
        } else {
          if (row) {
            console.log('ตาราง users ถูกสร้างเรียบร้อยแล้ว');
          } else {
            console.error('ตาราง users ยังไม่ถูกสร้าง!');
          }
        }
      });
    });
  }
});

// สร้างตารางที่จำเป็น - เปลี่ยนเป็นรูปแบบ callback
const createTables = (callback) => {
  // ตาราง users สำหรับเก็บข้อมูลผู้ใช้
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการสร้างตาราง users:', err);
      return;
    }
    
    console.log('สร้างตาราง users เรียบร้อย');
    
    // ตาราง bookings สำหรับเก็บข้อมูลการจอง
    db.run(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullname TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        checkin DATE NOT NULL,
        checkout DATE NOT NULL,
        roomtype TEXT NOT NULL,
        guests INTEGER NOT NULL,
        status TEXT DEFAULT 'pending',
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('เกิดข้อผิดพลาดในการสร้างตาราง bookings:', err);
        return;
      }
      
      console.log('สร้างตาราง bookings เรียบร้อย');
      
      // เพิ่มข้อมูล admin
      db.run(`
        INSERT OR IGNORE INTO users (username, password, role)
        VALUES ('admin', ?, 'admin')
      `, [adminPassword], (err) => {
        if (err) {
          console.error('เกิดข้อผิดพลาดในการเพิ่มข้อมูล admin:', err);
          return;
        }
        
        console.log('เพิ่มข้อมูล admin เรียบร้อย');
        
        // เรียก callback เมื่อทุกอย่างเสร็จสมบูรณ์
        if (callback) callback();
      });
    });
  });
};

module.exports = db;