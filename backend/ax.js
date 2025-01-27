// ax.js

// const axios = require('axios');

// axios.get('http://localhost:3003/api/data')
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

axios.get('http://localhost:3004/api/data')
  .then(response => {
    // ตรวจสอบข้อมูลใน response ด้วย Optional Chaining
    const employeeData = response.data?.data?.dataDetail;

    // กรณีไม่มีข้อมูลหรือข้อมูลว่าง
    if (!employeeData || !Array.isArray(employeeData) || employeeData.length === 0) {
      console.warn('ไม่พบข้อมูลพนักงานหรือข้อมูลว่าง');
      return;
    }

    // แสดงข้อมูลพนักงาน
    employeeData.forEach(employee => {
      const fullName = `${employee.first_name} ${employee.last_name}`;
      console.log('Full Name:', fullName);

      const department = employee.dept_full || 'ไม่ระบุแผนก';
      console.log('Department:', department);
    });
  })
  .catch(error => {
    // ตรวจสอบข้อผิดพลาดจากเซิร์ฟเวอร์
    if (error.response) {
      console.error('ข้อผิดพลาดจากเซิร์ฟเวอร์:', error.response.status, error.response.data);
    } else {
      // ข้อผิดพลาดทั่วไป เช่น การเชื่อมต่อหรือโครงสร้างผิด
      console.error('เกิดข้อผิดพลาด:', error.message);
    }
  });

