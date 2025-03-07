const sqlite3 = require('sqlite3').verbose();
    // เพิ่มข้อมูล admin เริ่มต้น
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const adminPassword = bcrypt.hashSync('admin123', salt);
// สร้างการเชื่อมต่อกับฐานข้อมูล


// สร้างตารางที่จำเป็น
const createTables = () => {
    // ตาราง users สำหรับเก็บข้อมูลผู้ใช้
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

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
    `);


    
    db.run(`
        INSERT OR IGNORE INTO users (username, password, role)
        VALUES ('admin', ?, 'admin')
    `, [adminPassword]);
};

const db = new sqlite3.Database('bookings.db', (err) => {
    if (err) {
        console.error('เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล:', err);
    } else {
        console.log('เชื่อมต่อฐานข้อมูลสำเร็จ');
        createTables();
    }
});

module.exports = db;