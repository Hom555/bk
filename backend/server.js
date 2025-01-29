const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 8088;

// แก้ไขการตั้งค่า CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8082');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(cors({
  origin: 'http://localhost:8082',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

app.use('/uploads', (req, res, next) => {
  const filePath = path.join(__dirname, req.url);
  console.log('Accessing file:', filePath);
  if (fs.existsSync(filePath)) {
    next();
  } else {
    res.status(404).send('File not found');
  }
});

function generateUniqueFilename(originalname) {
  const timestamp = Date.now();
  const extension = originalname.split('.').pop();
  return `${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`;
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, generateUniqueFilename(file.originalname));
  }
});


const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  fs.chmodSync(uploadsDir, 0o755);
  console.log('สร้างโฟลเดอร์ uploads สำเร็จ');
} else {
  console.log('โฟลเดอร์ uploads มีอยู่แล้ว');
}

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error(`ประเภทไฟล์ ${file.mimetype} ไม่ได้รับอนุญาต`);
    error.code = 'FILE_TYPE';
    cb(error, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: fileFilter,
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

app.post('/api/upload', upload.array('files', 10), (req, res) => {
  try {
    res.status(200).json({
      message: 'อัปโหลดไฟล์สำเร็จ',
      files: req.files,
    });
  } catch (error) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์' });
  }
});

// แก้ไขการเชื่อมต่อ MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '12345678',
  database: 'activitydb',
  port: 3306,
  connectTimeout: 60000
}).promise();

// ปรับปรุงฟังก์ชันเชื่อมต่อ
async function connectDB() {
  try {
    await db.connect();
    console.log('เชื่อมต่อกับฐานข้อมูล MySQL สำเร็จ');
  } catch (err) {
    console.error('ไม่สามารถเชื่อมต่อฐานข้อมูลได้:', err);
    process.exit(1);
  }
}

connectDB();

// เพิ่มการจัดการ error
db.on('error', async (err) => {
  console.error('Database error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('Database connection was closed. Reconnecting...');
    await connectDB();
  } else {
    throw err;
  }
});

app.post('/api/system-record', async (req, res) => {
  const { nameTH, nameEN } = req.body;

  if (!nameTH || !nameEN) {
    return res.status(400).send({ message: 'กรุณากรอกชื่อภาษาไทยและภาษาอังกฤษ' });
  }

  const query = 'INSERT INTO system_master (name_th, name_en)  VALUES (?, ?)';
  try {
    const [result] = await db.query(query, [nameTH, nameEN]);
    res.status(200).send({ message: 'บันทึกข้อมูลสำเร็จ', id: result.insertId });
  } catch (error) {
    console.error('Error saving record:', error);
    res.status(500).send({ message: 'ไม่สามารถบันทึกข้อมูลได้' });
  }
});

app.delete('/api/system-record/:id', async (req, res) => {
  const id = req.params.id;

  const query = 'DELETE FROM system_master WHERE id = ?';
  try {
    const [result] = await db.query(query, [id]);
    if (result.affectedRows === 0) {
      return res.status(404).send({ message: 'ไม่พบข้อมูลที่ต้องการลบ' });
    }
    res.status(200).send({ message: 'ลบข้อมูลสำเร็จ' });
  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).send({ message: 'ไม่สามารถลบข้อมูลได้' });
  }
});

app.put('/api/system-record/:id', async (req, res) => {
  const id = req.params.id;
  const { nameTH, nameEN } = req.body;

  const query = 'UPDATE system_master SET name_th = ?, name_en = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
  try {
    const [result] = await db.query(query, [nameTH, nameEN, id]);
    if (result.affectedRows === 0) {
      return res.status(404).send({ message: 'ไม่พบข้อมูลที่ต้องการอัปเดต' });
    }
    res.status(200).send({ message: 'อัปเดตข้อมูลสำเร็จ' });
  } catch (error) {
    console.error('Error updating record:', error);
    res.status(500).send({ message: 'ไม่สามารถอัปเดตข้อมูลได้' });
  }
});

app.get('/api/system-records', async (req, res) => {
  try {
    const [systems] = await db.query(`
      SELECT 
        id,
        name_th,
        name_en,
        dept_change_code,
        dept_full,
        created_at,
        updated_at
      FROM system_master
      ORDER BY created_at DESC
    `);
    res.json(systems);
  } catch (error) {
    console.error('Error fetching systems:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/system-details', upload.array('files'), async (req, res) => {
  try {
    const { systemId, importantInfo, referenceNo, additionalInfo } = req.body;
    const files = req.files;

    if (!systemId || !importantInfo || !referenceNo) {
      return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    let filePath = '';
    if (files && files.length > 0) {
      filePath = files.map(file => file.path).join(', ');
    }

    const query = 'INSERT INTO system_details (system_id, important_info, reference_no, file_path, additional_info) VALUES (?, ?, ?, ?, ?)';
    const values = [systemId, importantInfo, referenceNo, filePath, additionalInfo];

    const [result] = await db.query(query, values);
    
    if (result.affectedRows > 0) {
      console.log('Data saved successfully:', result);
      return res.status(200).json({ 
        success: true,
        message: 'บันทึกข้อมูลสำเร็จ!',
        data: result 
      });
    } else {
      throw new Error('ไม่สามารถบันทึกข้อมูลได้');
    }
  } catch (error) {
    console.error('Error saving system details:', error);
    return res.status(500).json({ 
      success: false,
      message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
      error: error.message 
    });
  }
});

app.get('/api/system-details/:systemId', async (req, res) => {
  const { systemId } = req.params;

  const query = `
    SELECT * FROM system_details 
    WHERE system_id = ?
    ORDER BY created_at DESC
  `;

  try {
    const [rows] = await db.query(query, [systemId]);
    console.log('Fetched system details:', rows);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching system details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/system-details/:id', upload.array('files', 10), async (req, res) => {
  const { id } = req.params;
  const { importantInfo, referenceNo, additionalInfo } = req.body;
  const files = req.files || [];

  if (!importantInfo || !referenceNo) {
    return res.status(400).json({ message: 'กรุณากรอกข้อมูลที่จำเป็น' });
  }

  try {
    // อัปเดตข้อมูลในฐานข้อมูล
    const updateQuery = `
      UPDATE system_details
      SET important_info = ?, reference_no = ?, additional_info = ?
      WHERE id = ?
    `;
    await db.query(updateQuery, [importantInfo, referenceNo, additionalInfo, id]);

    // หากมีไฟล์ใหม่ให้เพิ่มในฐานข้อมูล
    if (files.length > 0) {
      const filePaths = files.map((file) => `/uploads/${file.filename}`).join(',');
      const updateFileQuery = `
        UPDATE system_details
        SET file_path = ?
        WHERE id = ?
      `;
      await db.query(updateFileQuery, [filePaths, id]);
    }

    res.status(200).json({ 
      message: 'อัปเดตข้อมูลสำเร็จ', 
      data: {
        id,
        importantInfo,
        referenceNo,
        additionalInfo,
        file_path: files.length > 0 ? files.map((file) => `/uploads/${file.filename}`).join(',') : ''
      }
    });
  } catch (error) {
    console.error('Error updating details:', error);
    if (files.length > 0) {
      files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      });
    }
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' });
  }
});

app.delete('/api/system-details/:id', async (req, res) => {
  const detailId = req.params.id;
  
  try {
    const [result] = await db.query(
      'DELETE FROM system_details WHERE id = ?',
      [detailId]
    );

    if (result.affectedRows > 0) {
      console.log('Deleted successfully:', detailId);
      res.status(200).json({ message: 'ลบข้อมูลสำเร็จ' });
    } else {
      console.log('Record not found:', detailId);
      res.status(404).json({ error: 'ไม่พบข้อมูลที่ต้องการลบ' });
    }
  } catch (error) {
    console.error('Error deleting:', error);
    res.status(500).json({ error: 'ไม่สามารถลบข้อมูลได้' });
  }
});

// กิจกรรม
app.post("/api/activities", upload.fields([{ name: "files" }, { name: "images" }]), async (req, res) => {
  const { systemId, importantInfo, details } = req.body;

  try {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!systemId || !importantInfo || !details) {
      return res.status(400).json({ 
        success: false,
        message: "กรุณากรอกข้อมูลให้ครบถ้วน" 
      });
    }

    // เก็บไฟล์แนบและรูปภาพ
    const filePaths = req.files?.["files"]
      ? req.files["files"].map((file) => `/uploads/${file.filename}`)
      : [];
    const imagePaths = req.files?.["images"]
      ? req.files["images"].map((file) => `/uploads/${file.filename}`)
      : [];

    // ดึงข้อมูลแผนกจากระบบ
    const [system] = await db.query(
      'SELECT dept_change_code, dept_full FROM system_master WHERE id = ?',
      [systemId]
    );

    if (system.length === 0) {
      return res.status(400).json({
        success: false,
        message: "ไม่พบข้อมูลระบบ"
      });
    }

    // บันทึกข้อมูลลงฐานข้อมูล
    const query = `
      INSERT INTO activities 
      (system_id, important_info, details, file_paths, image_paths, dept_change_code, dept_full) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(query, [
      systemId,
      importantInfo,
      details,
      filePaths.join(",") || "",
      imagePaths.join(",") || "",
      system[0].dept_change_code,
      system[0].dept_full
    ]);

    res.status(200).json({ 
      success: true,
      message: "บันทึกกิจกรรมสำเร็จ",
      activityId: result.insertId 
    });
  } catch (error) {
    console.error("Error saving activity:", error);
    res.status(500).json({ 
      success: false, 
      message: "ไม่สามารถบันทึกกิจกรรมได้",
      error: error.message 
    });
  }
});

// แก้ไข API สำหรับดึงข้อมูลกิจกรรมทั้งหมด
app.get('/api/all-activities', async (req, res) => {
  try {
    const [activities] = await db.query(`
      SELECT 
        a.*,
        sm.name_th as system_name,
        sm.name_en as system_name_en,
        sm.dept_change_code,
        sm.dept_full
      FROM activities a
      LEFT JOIN system_master sm ON a.system_id = sm.id
      ORDER BY a.created_at DESC
    `);
    res.json(activities);
  } catch (error) {
    console.error('Error fetching all activities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// แก้ไข API สำหรับดึงข้อมูลกิจกรรมตามระบบและข้อมูลสำคัญ
app.get('/api/activities/:systemId/:importantInfo', async (req, res) => {
  const { systemId, importantInfo } = req.params;
  
  try {
    const [activities] = await db.query(`
      SELECT a.*, sm.dept_change_code, sm.dept_full
      FROM activities a
      LEFT JOIN system_master sm ON a.system_id = sm.id
      WHERE a.system_id = ? AND a.important_info = ?
      ORDER BY a.created_at DESC
    `, [systemId, importantInfo]);

    res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// นับจำนวนกิจกรรมทั้งหมด
app.get('/api/activities/count', async (req, res) => {
  try {
    const [result] = await db.query(`
      SELECT COUNT(*) as count 
      FROM activities
    `);
    res.json({ count: result[0].count });
  } catch (error) {
    console.error('Error counting activities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ดึงเวลาอัพเดตล่าสุด
app.get('/api/system-activities/last-update', async (req, res) => {
  try {
    const [result] = await db.query('SELECT MAX(created_at) as lastUpdate FROM system_activities');
    res.json({ lastUpdate: result[0].lastUpdate });
  } catch (error) {
    console.error('Error fetching last update:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ค้นหาข้อมูล
app.get('/api/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);

  try {
    const [activities] = await db.query(`
      SELECT 
        sa.id,
        sa.details,
        sa.created_at,
        sm.name_th as system_name,
        sd.important_info as important_info_name,
        'activity' as type
      FROM system_activities sa
      LEFT JOIN system_master sm ON sa.system_id = sm.id
      LEFT JOIN system_details sd ON sa.important_info = sd.important_info
      WHERE 
        sa.details LIKE ? OR
        sd.important_info_name LIKE ?
      ORDER BY sa.created_at DESC
      LIMIT 10
    `, [`%${q}%`, `%${q}%`, `%${q}%`]);

    const results = activities.map(activity => ({
      id: activity.id,
      type: 'activity',
      title: `${activity.system_name || 'ไม่ระบุระบบ'} - ${activity.important_info_name || 'ไม่ระบุข้อมูลสำคัญ'}`,
      description: activity.details || '',
      link: `/Dataactivities`,
      date: activity.created_at
    }));

    console.log('Search results:', results);
    res.json(results);
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/activities/count', async (req, res) => {
  try {
    const [result] = await db.query(`
      SELECT COUNT(*) as count 
      FROM activities
    `);
    res.json({ count: result[0].count });
  } catch (error) {
    console.error('Error counting activities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/activities/current-month', async (req, res) => {
  try {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    const [currentMonth] = await db.query(`
      SELECT COUNT(*) as count 
      FROM activities 
      WHERE created_at >= ?
    `, [firstDayOfMonth]);

    const firstDayLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const [lastMonth] = await db.query(`
      SELECT COUNT(*) as count 
      FROM activities 
      WHERE created_at >= ? AND created_at < ?
    `, [firstDayLastMonth, firstDayOfMonth]);

    const currentCount = currentMonth[0].count;
    const lastCount = lastMonth[0].count;
    const trend = lastCount > 0 
      ? Math.round(((currentCount - lastCount) / lastCount) * 100)
      : 0;
    
    res.json({
      count: currentCount,
      trend: trend
    });
  } catch (error) {
    console.error('Error getting monthly activities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/activities/:id', upload.fields([{ name: 'files' }, { name: 'images' }]), async (req, res) => {
  const { id } = req.params;
  const { details, removedFiles, removedImages } = req.body;
  const files = req.files?.['files'] || [];
  const images = req.files?.['images'] || [];

  try {
    // ตรวจสอบว่ามีกิจกรรมนี้อยู่จริงหรือไม่
    const [existingActivity] = await db.query(
      'SELECT * FROM activities WHERE id = ? LIMIT 1',
      [id]
    );
    
    if (!existingActivity || existingActivity.length === 0) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบข้อมูลกิจกรรมที่ต้องการแก้ไข"
      });
    }

    // จัดการไฟล์และรูปภาพที่ต้องการลบ
    let currentFiles = existingActivity[0].file_paths ? existingActivity[0].file_paths.split(',') : [];
    let currentImages = existingActivity[0].image_paths ? existingActivity[0].image_paths.split(',') : [];

    if (removedFiles) {
      const filesToRemove = JSON.parse(removedFiles);
      currentFiles = currentFiles.filter(file => !filesToRemove.includes(file));
    }

    if (removedImages) {
      const imagesToRemove = JSON.parse(removedImages);
      currentImages = currentImages.filter(image => !imagesToRemove.includes(image));
    }

    // เพิ่มไฟล์และรูปภาพใหม่
    const newFilePaths = files.map(file => `/uploads/${file.filename}`);
    const newImagePaths = images.map(image => `/uploads/${image.filename}`);

    // รวมไฟล์และรูปภาพทั้งหมด
    const updatedFilePaths = [...currentFiles, ...newFilePaths].filter(Boolean).join(',');
    const updatedImagePaths = [...currentImages, ...newImagePaths].filter(Boolean).join(',');

    // อัพเดทข้อมูลเฉพาะรายการที่เลือก
    const [result] = await db.query(
      'UPDATE activities SET details = ?, file_paths = ?, image_paths = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? LIMIT 1',
      [details, updatedFilePaths, updatedImagePaths, id]
    );

    if (result.affectedRows > 0) {
      res.json({
        success: true,
        message: "แก้ไขข้อมูลสำเร็จ",
        file_paths: updatedFilePaths,
        image_paths: updatedImagePaths
      });
    } else {
      throw new Error("ไม่สามารถแก้ไขข้อมูลได้");
    }

  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการแก้ไขข้อมูล",
      error: error.message
    });
  }
});


app.delete('/api/activities/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM activities WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({ error: 'Failed to delete activity' });
  }
});

//API MANEGERS USERS
app.post('/api/add-system-record', (req, res) => {
  const { nameTH, nameEN } = req.body;

  // ตรวจสอบข้อมูลที่ส่งมา
  if (!nameTH || !nameEN) {
    return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
  }

  // สร้าง ID ใหม่ (Mock)
  const newId = employeesData.data.dataDetail.length + 1;

  // เพิ่มข้อมูลใหม่ใน Mock Data
  employeesData.data.dataDetail.push({
    id: newId,
    name_th: nameTH,
    name_en: nameEN,
  });

  res.json({ success: true, message: 'เพิ่มข้อมูลสำเร็จ' });
});

app.get('/api/user-info', (req, res) => {
  res.json({
    name: 'ผู้ใช้งานระบบ',
    role: 'ผู้ใช้ทั่วไป'
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
