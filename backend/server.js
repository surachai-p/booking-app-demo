// เพิ่มการใช้งาน dotenv
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./database');

const app = express();
//const port = 3001; // เปลี่ยนเป็น port 3001
//const JWT_SECRET = 'your-secret-key'; // ในการใช้งานจริงควรเก็บไว้ใน environment variable

// ใช้ค่า environment variables
const port = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// CORS options
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['http://localhost:5173'];

app.use(cors({
    origin: function(origin, callback) {
        // อนุญาตให้เรียกจากทุก origin ในระหว่างการพัฒนา
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Middleware
//app.use(cors());
app.use(bodyParser.json());

// Middleware ตรวจสอบ token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: "กรุณาเข้าสู่ระบบ" });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Token ไม่ถูกต้องหรือหมดอายุ" });
        }
        req.user = user;
        next();
    });
};

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    console.log(`user:${username} password:${password}`);
    
    try 
        // ดึงข้อมูลผู้ใช้
       { db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (!user) {
                return res.status(401).json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
            }

            // ตรวจสอบรหัสผ่าน
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return res.status(401).json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
            }

            // สร้าง token
            const token = jwt.sign(
                { id: user.id, username: user.username, role: user.role },
                JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.json({
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role
                }
            });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Booking endpoints
// สร้างการจองใหม่
app.post('/api/bookings', async (req, res) => {
    const { fullname, email, phone, checkin, checkout, roomtype, guests } = req.body;
    
    const sql = `INSERT INTO bookings (fullname, email, phone, checkin, checkout, roomtype, guests)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, [fullname, email, phone, checkin, checkout, roomtype, guests], function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        
        db.get('SELECT * FROM bookings WHERE id = ?', [this.lastID], (err, row) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            res.status(201).json(row);
        });
    });
});

// ดึงข้อมูลการจองทั้งหมด (ต้อง login)
app.get('/api/bookings', authenticateToken, (req, res) => {
    const sql = "SELECT * FROM bookings ORDER BY created_at DESC";
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json(rows);
    });
});

// ดึงข้อมูลการจองตาม ID (ต้อง login)
app.get('/api/bookings/:id', authenticateToken, (req, res) => {
    const sql = "SELECT * FROM bookings WHERE id = ?";
    
    db.get(sql, [req.params.id], (err, row) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: "ไม่พบข้อมูลการจอง" });
        }
        res.json(row);
    });
});

// อัพเดตข้อมูลการจอง (ต้อง login)
app.put('/api/bookings/:id', authenticateToken, (req, res) => {
    const { fullname, email, phone, checkin, checkout, roomtype, guests,comment } = req.body;
    
    const sql = `UPDATE bookings 
                 SET fullname = ?, email = ?, phone = ?, 
                     checkin = ?, checkout = ?, roomtype = ?, guests = ?, comment= ?
                 WHERE id = ?`;
    
    db.run(sql, [fullname, email, phone, checkin, checkout, roomtype, guests,comment, req.params.id], 
        function(err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: "ไม่พบข้อมูลการจอง" });
            }
            
            db.get('SELECT * FROM bookings WHERE id = ?', [req.params.id], (err, row) => {
                if (err) {
                    return res.status(400).json({ error: err.message });
                }
                res.json(row);
            });
    });
});

// ลบข้อมูลการจอง (ต้อง login)
app.delete('/api/bookings/:id', authenticateToken, (req, res) => {
    const sql = "DELETE FROM bookings WHERE id = ?";
    
    db.run(sql, [req.params.id], function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "ไม่พบข้อมูลการจอง" });
        }
        res.json({status: "ลบข้อมูลเรียบร้อย"});
    });
});

// เริ่ม server
app.listen(port, () => {
    console.log(`Server กำลังทำงานที่ port ${port}`);
});