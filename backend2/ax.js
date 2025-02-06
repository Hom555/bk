// ax.js

// const axios = require('axios');

// axios.get('http://localhost:3004/api/data')
//   .then(response => {
//     // ตรวจสอบว่ามีข้อมูลใน response หรือไม่
//     if (!response.data || !response.data.data || !response.data.data.dataDetail) {
//       throw new Error('ไม่พบข้อมูลที่ต้องการ');
//     }

//     const employeeData = response.data.data.dataDetail;
//     employeeData.forEach(employee => {
//       const fullName = employee.first_name + ' ' + employee.last_name;
//       console.log('Full Name:', fullName);

//       const department = employee.dept_full;
//       console.log('Department:', department);
//     });
//   })
//   .catch(error => {
//     console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', error.message);
//     // อาจจะเพิ่มการจัดการ error เพิ่มเติมตามความเหมาะสม
//   });




const axios = require('axios');
const mysql = require('mysql2/promise');

// กำหนดค่าการเชื่อมต่อฐานข้อมูล
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '12345678',
  database: 'activitydb'
};

async function saveDepartments() {
  try {
    // เชื่อมต่อฐานข้อมูล
    const connection = await mysql.createConnection(dbConfig);
    console.log('เชื่อมต่อฐานข้อมูลสำเร็จ');

    // ดึงข้อมูลจาก API
    const response = await axios.get('http://localhost:3004/api/data');
    const employeeData = response.data?.data?.dataDetail;

    if (!employeeData || !Array.isArray(employeeData)) {
      throw new Error('ไม่พบข้อมูลพนักงาน');
    }

    // กรองเฉพาะ dept_change_code และ dept_full ที่ไม่ซ้ำกัน
    const uniqueDepts = new Map();
    employeeData.forEach(emp => {
      if (emp.dept_change_code && emp.dept_full) {
        uniqueDepts.set(emp.dept_change_code, {
          dept_change_code: emp.dept_change_code,
          dept_full: emp.dept_full
        });
      }
    });

    // แปลงเป็น array สำหรับบันทึกลง MySQL
    const deptArray = Array.from(uniqueDepts.values());
    
    // บันทึกข้อมูลลงฐานข้อมูล
    for (const dept of deptArray) {
      await connection.query(`
        INSERT INTO departments (dept_change_code, dept_full) 
        VALUES (?, ?) 
        ON DUPLICATE KEY UPDATE dept_full = VALUES(dept_full)
      `, [dept.dept_change_code, dept.dept_full]);
    }

    console.log(`บันทึกข้อมูลแผนกสำเร็จ ${deptArray.length} รายการ`);

    // แสดงข้อมูลที่บันทึก
    const [rows] = await connection.query('SELECT * FROM departments');
    console.log('ข้อมูลแผนกในฐานข้อมูล:', rows);

    await connection.end();

  } catch (error) {
    console.error('เกิดข้อผิดพลาด:', error.message);
  }
}

// เรียกใช้งานฟังก์ชัน
saveDepartments();

