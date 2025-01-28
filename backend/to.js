// to.js
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const axios = require('axios');
const mysql = require('mysql2/promise');

const app = express();
const SECRET_KEY = "I76iLBG2vrXRc6Y2gqQpT3r9oHDzQHuOaG89S+C2NE0="; // คีย์ลับสำหรับเซ็น Token

app.use(cors());
app.use(express.json()); // สำหรับรับข้อมูล JSON

// เชื่อมต่อกับฐานข้อมูล MySQL แบบ Promise
let db;
(async () => {
    try {
        db = await mysql.createPool({
            host: 'localhost',
            user: 'root',
            password: '12345678',
            database: 'activitydb',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
        });
        console.log('เชื่อมต่อฐานข้อมูลสำเร็จ');
    } catch (error) {
        console.error('เชื่อมต่อฐานข้อมูลล้มเหลว:', error);
    }
})();

app.use(express.json()); // สำหรับรับข้อมูล JSON

// Middleware สำหรับตรวจสอบ Token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(403).json({ message: "จำเป็นต้องมีโทเค็น" });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(403).json({ message: "โทเค็นไม่ถูกต้อง" });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded; // เก็บข้อมูลผู้ใช้ที่ถอดรหัสได้
        next();
    } catch (err) {
        res.status(401).json({ message: "โทเค็นไม่ถูกต้องหรือหมดอายุ" });
    }
};

// app.get('/api/data', (req, res) => {
//     res.setHeader('Content-Type', 'application/json');
//     res.json({
//       data: {
//         dataDetail: [
//           {
//             "emp_id": 498146444,
//             "title_s_desc": "นาย",
//             "first_name": "วิลัยพร",
//             "last_name": "บุญญะ",
//             "eng_name_full": "MR.PORAWAT  JUNRAYAPES",
//             "sex": "M",
//             "posi_code": 94,
//             "posi_text_short": ";ชผ.",
//             "posi_text": ";ผู้ช่วยหัวหน้าแผนก",
//             "level_code": "M1",
//             "level_desc": "ชผ.",
//             "plans_code": 3059264,
//             "plans_text_short": "ชผ.",
//             "plans_text_full": "ผู้ช่วยหัวหน้าแผนก",
//             "posi_status_desc": "พนักงานปกติ",
//             "dept_stable_code": null,
//             "dept_change_code": "530105002000301",
//             "dept_short": "ผรบ.",
//             "dept_full": "แผนกพัฒนาระบบงานด้านการเงิน",
//             "dept_sap": 7316,
//             "dept_sap_short": "ผรบ./กพก./ฝพท./ผชก.(ทส)/รผก.(ทส)/ผวก.",
//             "dept_sap_full": "แผนกพัฒนาระบบงานด้านทรัพยากรบุคคล/กองพัฒนาระบบสารสนเทศด้านการจัดการองค์กร/ฝ่ายวางแผนพัฒนาระบบสารสนเทศและสื่อสาร",
//             "dept_upper": 7307,
//             "region": 9900,
//             "region_name": "สำนักงานใหญ่",
//             "sub_region": 9900,
//             "sub_region_name": "สนญ.(ปกติ)",
//             "cost_center": "ZD01011030",
//             "cost_center_name": "ผรบ.กพก.-บริหาร",
//             "pea_code": "Z00000",
//             "business_area": "Z000",
//             "business_area_name": "การไฟฟ้าส่วนภูมิภาค สนญ.",
//             "payroll_area": 0,
//             "payroll_area_name": "พนง.-สนญ.",
//             "vendor_code": "EM00498143",
//             "resource_code": 500,
//             "resource_name": "แผนก",
//             "stell_code": 2000556,
//             "stell_text_short": "ชผ.",
//             "stell_text_full": "ผู้ช่วยหัวหน้าแผนก",
//             "qualification": 350,
//             "qualification_desc": "วิทยาศาสตร์มหาบัณฑิต(วท.ม.)",
//             "qualification_level": 20,
//             "qualification_level_desc": "ปริญญาโท",
//             "qualification_dept": 1308,
//             "qualification_dept_desc": "เทคโนโลยีสารสนเทศ",
//             "entry_date": "2007-10-01",
//             "staff_date": "2008-01-01",
//             "posi_date": "2015-07-04",
//             "retired": "9999-12-31",
//             "retired2_date": "2045-08-03",
//             "email": "porrawat.jun@pea.co.th",
//             "tel_mobile": "0990907899",
//             "location_building": "51",
//             "location_floor": "3",
//             "tel_org_ext": "9646",
//             "age": 34,
//             "sap_update_date": "2020-10-28",
//             "updated_date": null
//           }
//         ]
//       }
//     });
// });

// API สำหรับซิงค์ข้อมูล
app.post('/sync-data', verifyToken,  async (req, res) => {
    try {
        const response = await axios.get('http://localhost:3004/api/data');
        const employeeData = response.data?.data?.dataDetail;

        if (!employeeData || !Array.isArray(employeeData) || employeeData.length === 0) {
            return res.status(400).json({ message: "ไม่มีข้อมูลสำหรับบันทึก" });
        }

        const query = `
            INSERT INTO employees (emp_id, first_name, last_name, dept_change_code, dept_full)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            first_name = VALUES(first_name),
            last_name = VALUES(last_name),
            dept_change_code = VALUES(dept_change_code),
            dept_full = VALUES(dept_full)
        `;

        const promises = employeeData.map(emp =>
            db.execute(query, [
                emp.emp_id,
                emp.first_name,
                emp.last_name,
                emp.dept_change_code,
                emp.dept_full,
            ])
        );

        await Promise.all(promises);
        res.status(200).json({ message: "ข้อมูลถูกบันทึกสำเร็จ" });
    } catch (error) {
        console.error('เกิดข้อผิดพลาด:', error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการซิงค์ข้อมูล" });
    }
});

// เพิ่ม API endpoint สำหรับดึงข้อมูลผู้ใช้
app.get('/api/user-info', verifyToken, async (req, res) => {
    try {
        // ดึงข้อมูลจาก API ที่ port 3004
        const response = await axios.get('http://localhost:3004/api/data');
        
        if (response.data?.data?.dataDetail?.length > 0) {
            const user = response.data.data.dataDetail[0];
            res.json({
                name: `${user.title_s_desc || ""}${user.first_name} ${user.last_name}`,
                role: user.dept_full || "ไม่ระบุแผนก",
                emp_id: user.emp_id
            });
        } else {
            res.status(404).json({ 
                message: "ไม่พบข้อมูลผู้ใช้งาน",
                name: "ไม่พบชื่อผู้ใช้งาน",
                role: "ไม่พบแผนก"
            });
        }
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้:', error);
        res.status(500).json({ 
            message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
            name: "ไม่สามารถดึงข้อมูลได้",
            role: "ไม่สามารถดึงข้อมูลได้"
        });
    }
});

// เพิ่มฟังก์ชันสำหรับกำหนดสิทธิ์ตามแผนก
const getDepartmentRole = (deptCode) => {
    const deptRoles = {
        // แผนกพัฒนาระบบงานด้านทรัพยากรบุคคล
        "530105002000300": "Admin",
        // แผนกพัฒนาระบบงานด้านการเงิน
        "530105002000301": "User",
        // แผนกพัฒนาระบบงานด้านบัญชี
        "530105002000302": "User",
        // แผนกพัฒนาระบบงานด้านจัดซื้อ
        "530105002000303": "Superadmin",
        // ค่าเริ่มต้นสำหรับแผนกอื่นๆ
        "default": "User"
    };
    return deptRoles[deptCode] || deptRoles.default;
};

// API สำหรับการเข้าสู่ระบบและสร้าง Token
app.post('/login', (req, res) => {
    const user = {
        emp_id: 498143,
        first_name: "ปรวรรธน์",
        last_name: "จรรยาเพศ",
        dept_change_code: "530105002000300",
        dept_full: "แผนกพัฒนาระบบงานด้านทรัพยากรบุคคล",
        app_version: "v1.0",
        role: getDepartmentRole("530105002000300") // กำหนดสิทธิ์ตามแผนก
    };

    const token = jwt.sign(user, SECRET_KEY, { expiresIn: '1d' });

    res.json({
        message: "เข้าสู่ระบบสำเร็จ",
        token: token,
        user: {
            name: `${user.first_name} ${user.last_name}`,
            role: user.role,
            dept_full: user.dept_full,
            emp_id: user.emp_id
        }
    });
});

// API สำหรับการเข้าสู่ระบบและสร้าง Token
app.post('/loginto', (req, res) => {
    const { emp_id } = req.body;

    const query = `SELECT * FROM employees WHERE emp_id = ?`;
    db.query(query, [emp_id], (err, result) => {
        if (err) {
            console.error('Error fetching user details:', err);
            return res.status(500).json({ message: "ไม่สามารถดึงข้อมูลผู้ใช้ได้" });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: "ไม่พบข้อมูลผู้ใช้" });
        }

        const user = result[0];
        const role = getDepartmentRole(user.dept_change_code);

        const token = jwt.sign(
            {
                emp_id: user.emp_id,
                first_name: user.first_name,
                last_name: user.last_name,
                dept_full: user.dept_full,
                role: role // ใช้สิทธิ์ที่กำหนดตามแผนก
            },
            SECRET_KEY,
            { expiresIn: '1d' }
        );

        res.json({
            message: "เข้าสู่ระบบสำเร็จ",
            token: token,
            user: {
                name: `${user.first_name} ${user.last_name}`,
                role: role,
                dept_full: user.dept_full,
                emp_id: user.emp_id
            }
        });
    });
});

// API สำหรับเพิ่มสมาชิก
app.post('/addmember', verifyToken, (req, res) => {
    const userRole = req.user.role;

    // if (userRole !== 'Admin' && userRole !== 'Superadmin') {
    //     return res.status(403).json({ message: "ไม่มีสิทธิ์ในการเพิ่มสมาชิก" });
    // }

    const query = `
        INSERT INTO employees (emp_id, first_name, last_name, dept_change_code, dept_full)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        first_name = VALUES(first_name),
        last_name = VALUES(last_name),
        dept_change_code = VALUES(dept_change_code),
        dept_full = VALUES(dept_full)
    `;


    const values = [
        req.body["emp_id"],
        req.body["first_name"],
        req.body["last_name"],
        req.body["dept_change_code"],
        req.body["dept_full"]
    ];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล:', err);
            return res.status(500).json({ message: "ไม่สามารถบันทึกข้อมูลได้" });
        }

        console.log('ข้อมูลถูกบันทึกสำเร็จ:', result);
        res.status(200).json({ message: "บันทึกข้อมูลสำเร็จ", result });
    });
});

// API สำหรับดึงบทบาทผู้ใช้
app.get('/getrole', verifyToken, (req, res) => {
    const emp_id = req.user.emp_id;

    const query = `SELECT role FROM employees WHERE emp_id = ?`;
    db.query(query, [emp_id], (err, result) => {
        // if (err) {
        //     console.error('Error fetching role:', err);
        //     return res.status(500).json({ message: "ไม่สามารถดึงข้อมูลได้" });
        // }

        // กรณีไม่มีข้อมูลในฐานข้อมูล
        if (result.length === 0) {
            return res.status(200).json({ message: "ไม่พบข้อมูล", role: "User5555" });
        }

        // กรณีพบข้อมูลในฐานข้อมูล
        res.status(200).json({ role: result[0]['role'] });
    });
});

// API สำหรับแสดงแดชบอร์ด
app.get('/dashboard', verifyToken, (req, res) => {
    const userRole = req.user.role;

    if (userRole === 'Superadmin') {
        res.status(200).json({ message: 'ยินดีต้อนรับ, Superadmin' });
    } else if (userRole === 'Admin') {
        res.status(200).json({ message: 'ยินดีต้อนรับ, Admin' });
    } else if (userRole === 'User') {
        res.status(200).json({ message: 'ยินดีต้อนรับ, User' });
    } else {
        res.status(403).json({ message: 'การเข้าถึงถูกปฏิเสธ' });
    }
});


// Middleware สำหรับตรวจสอบสิทธิ์
const authorize = (roles) => {
    return (req, res, next) => {
        const userRole = req.user.role;

        if (roles.includes(userRole)) {
            next(); // อนุญาตให้ดำเนินการต่อ
        } else {
            res.status(403).json({ message: 'การเข้าถึงถูกปฏิเสธ' });
        }
    };
};

// API สำหรับ Admin และ Superadmin
app.get('/admin', verifyToken, authorize(['Admin', 'Superadmin']), (req, res) => {
    res.status(200).json({ message: 'ยินดีต้อนรับสู่แผงผู้ดูแลระบบ' });
});

// API สำหรับ Superadmin
app.get('/superadmin', verifyToken, authorize(['Superadmin']), (req, res) => {
    res.status(200).json({ message: 'ยินดีต้อนรับสู่แผงควบคุมขั้นสูง' });
});

// API ทดสอบเส้นทางที่ได้รับการคุ้มครอง
app.get('/protected', verifyToken, (req, res) => {
    const iatDate = new Date(req.user.iat * 1000);
    const expDate = new Date(req.user.exp * 1000);

    res.json({
        message: "นี่คือเส้นทางที่ได้รับการคุ้มครอง",
        user: {
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            dept_full: req.user.dept_full,
            iat: iatDate.toISOString(),
            exp: expDate.toISOString()
        }
    });
});

// API สำหรับแสดงข้อมูลผู้ใช้
app.get('/userinfo', verifyToken, (req, res) => {
    res.json({
      emp_id: req.user.emp_id,
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      dept_full: req.user.dept_full,
    });
  });



app.get('/prot', verifyToken, (req, res) => {
    const iatDate = new Date(req.user.iat * 1000);
    const expDate = new Date(req.user.exp * 1000);
  
    res.json({
      message: "นี่คือเส้นทางที่ได้รับการคุ้มครอง",
      user: {
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        dept_full: req.user.dept_full,
        iat: iatDate.toISOString(),
        exp: expDate.toISOString()
      }
    });
  });



  

app.listen(3003, () => {
    console.log('Server running on http://localhost:3003');
});