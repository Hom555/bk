<template>
  <div class="manual-container">
    <h1 class="manual-title">คู่มือการใช้งานระบบ</h1>

    <!-- คู่มือสำหรับ datasystemrecord -->
    <section class="manual-section">
      <h2>1. การจัดการข้อมูลระบบ </h2>
      <div class="manual-content">
        <h3>การเพิ่มข้อมูลระบบ:</h3>
        <ol>
          <li>กรอกชื่อระบบภาษาไทย</li>
          <li>กรอกชื่อระบบภาษาอังกฤษ</li>
          <li>กดปุ่ม "บันทึก" เพื่อเพิ่มข้อมูล</li>
        </ol>
        <h3>การแก้ไขข้อมูล:</h3>
        <ol>
          <li>กดปุ่ม "แก้ไข" ที่รายการที่ต้องการ</li>
          <li>แก้ไขข้อมูลตามต้องการ</li>
          <li>กดปุ่ม "บันทึก" เพื่อยืนยันการแก้ไข</li>
        </ol>
        <h3>การลบข้อมูล:</h3>
        <ol>
          <li>กดปุ่ม "ลบ" ที่รายการที่ต้องการ</li>
          <li>ยืนยันการลบในหน้าต่างที่แสดงขึ้น</li>
        </ol>
      </div>
    </section>

    <!-- คู่มือสำหรับ system_details -->
    <section class="manual-section">
      <h2>2. การจัดการรายละเอียดระบบ </h2>
      <div class="manual-content">
        <h3>การเพิ่มรายละเอียด:</h3>
        <ol>
          <li>เลือกระบบที่ต้องการเพิ่มรายละเอียด</li>
          <li>กรอกข้อมูลสำคัญ </li>
          <li>กรอกเลขที่อ้างอิง </li>
          <li>กรอกรายละเอียดเพิ่มเติม (ถ้ามี)</li>
          <li>กดปุ่ม "บันทึก"</li>
        </ol>
      </div>
    </section>

    <!-- คู่มือสำหรับ DataDisplay -->
    <section class="manual-section">
      <h2>3. การแสดงข้อมูล </h2>
      <div class="manual-content">
        <h3>การดูข้อมูล:</h3>
        <ol>
          <li>เลือกระบบที่ต้องการดูข้อมูล</li>
          <li>ข้อมูลจะแสดงในรูปแบบตาราง</li>
        </ol>
        <h3>การแก้ไขข้อมูล:</h3>
        <ol>
          <li>กดปุ่ม "แก้ไข" ที่รายการที่ต้องการ</li>
          <li>แก้ไขข้อมูลในฟอร์ม</li>
          <li>กดปุ่ม "บันทึก" เพื่อยืนยัน</li>
        </ol>
      </div>
    </section>

    <!-- คู่มือสำหรับ system-activities -->
    <section class="manual-section">
      <h2>4. กิจกรรมของระบบ </h2>
      <div class="manual-content">
        <h3>การดูกิจกรรม:</h3>
        <ol>
          <li>เลือกระบบที่ต้องการดูกิจกรรม</li>
          <li>กิจกรรมทั้งหมดจะแสดงในรูปแบบตาราง</li>
        </ol>
      </div>
    </section>

    <!-- คู่มือสำหรับ Dataactivities -->
    <section class="manual-section">
      <h2>5. การจัดการกิจกรรม </h2>
      <div class="manual-content">
        <h3>การเพิ่มกิจกรรม:</h3>
        <ol>
          <li>เลือกระบบที่ต้องการเพิ่มกิจกรรม</li>
          <li>กรอกรายละเอียดกิจกรรม</li>
          <li>แนบไฟล์หรือรูปภาพ (ถ้ามี)</li>
          <li>กดปุ่ม "บันทึก"</li>
        </ol>
        <h3>การแก้ไขกิจกรรม:</h3>
        <ol>
          <li>กดปุ่ม "แก้ไข" ที่กิจกรรมที่ต้องการ</li>
          <li>แก้ไขข้อมูลตามต้องการ</li>
          <li>กดปุ่ม "บันทึก" เพื่อยืนยัน</li>
        </ol>
        <h3>การลบกิจกรรม:</h3>
        <ol>
          <li>กดปุ่ม "ลบ" ที่กิจกรรมที่ต้องการ</li>
          <li>ยืนยันการลบในหน้าต่างที่แสดงขึ้น</li>
        </ol>
      </div>
    </section>
  </div>
</template>

<style scoped>
.manual-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.manual-title {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 40px;
}

.manual-section {
  margin-bottom: 40px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.manual-section h2 {
  color: #2c3e50;
  border-bottom: 2px solid #3498db;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.manual-content {
  padding-left: 20px;
}

.manual-content h3 {
  color: #3498db;
  margin: 20px 0 10px;
}

.manual-content ol {
  padding-left: 20px;
}

.manual-content li {
  margin: 10px 0;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .manual-container {
    padding: 10px;
  }
  
  .manual-section {
    padding: 15px;
  }
}
</style> 