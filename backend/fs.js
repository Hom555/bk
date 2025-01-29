// const axios = require('axios');
// const mysql = require('mysql2/promise');

// // กำหนดค่าการเชื่อมต่อฐานข้อมูล
// const dbConfig = {
//   host: 'localhost',
//   user: 'root',
//   password: '12345678',
//   database: 'activitydb'
// };

// async function setupDatabase() {
//   try {
//     const connection = await mysql.createConnection(dbConfig);
    
//     // สร้างตารางพร้อมกำหนด PRIMARY KEY
//     const createTableQuery = `
//       CREATE TABLE IF NOT EXISTS employees (
//         emp_id INT PRIMARY KEY,
//         first_name VARCHAR(50),
//         last_name VARCHAR(50),
//         dept_change_code VARCHAR(50),
//         dept_full VARCHAR(100),
//         role VARCHAR(50) DEFAULT 'User'
//       ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
//     `;
    
//     await connection.query(createTableQuery);
//     console.log('สร้างตารางสำเร็จ');
    
//     await connection.end();
//     return true;
//   } catch (error) {
//     console.error('เกิดข้อผิดพลาดในการสร้างตาราง:', error);
//     return false;
//   }
// }

// async function fetchAndSaveEmployees() {
//   try {
//     // สร้างตารางก่อน
//     const isTableCreated = await setupDatabase();
//     if (!isTableCreated) {
//       throw new Error('ไม่สามารถสร้างตารางได้');
//     }

//     // เชื่อมต่อฐานข้อมูล
//     const connection = await mysql.createConnection(dbConfig);
//     console.log('เชื่อมต่อฐานข้อมูลสำเร็จ');

//     // ดึงข้อมูลจาก API
//     const response = await axios.get('http://localhost:3004/api/data');
//     const employees = response.data?.data?.dataDetail;

//     if (!employees || !Array.isArray(employees)) {
//       throw new Error('ไม่พบข้อมูลพนักงานหรือข้อมูลไม่ถูกต้อง');
//     }

//     // เตรียมข้อมูลสำหรับบันทึก
//     const values = employees.map(emp => [
//       emp.emp_id,
//       emp.first_name,
//       emp.last_name,
//       emp.dept_change_code,
//       emp.dept_full,
//       'User' // ค่าเริ่มต้นสำหรับ role
//     ]);

//     // บันทึกข้อมูลลงฐานข้อมูล
//     const query = `
//       INSERT INTO employees 
//       (emp_id, first_name, last_name, dept_change_code, dept_full, role)
//       VALUES ?
//       ON DUPLICATE KEY UPDATE
//       first_name = VALUES(first_name),
//       last_name = VALUES(last_name),
//       dept_change_code = VALUES(dept_change_code),
//       dept_full = VALUES(dept_full)
//     `;

//     const [result] = await connection.query(query, [values]);
//     console.log(`บันทึกข้อมูลสำเร็จ ${result.affectedRows} รายการ`);

//     // ปิดการเชื่อมต่อ
//     await connection.end();
//     console.log('ปิดการเชื่อมต่อฐานข้อมูล');

//   } catch (error) {
//     console.error('เกิดข้อผิดพลาด:', error);
//   }
// }

// // เรียกใช้งานฟังก์ชัน
// fetchAndSaveEmployees(); 