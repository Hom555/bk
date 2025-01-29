<template>
  <div class="container">
    <div class="form-card">
      <div class="form-header">
        <div class="header-icon">
          <i class="fas fa-edit"></i>
        </div>
        <div class="header-text">
          <h1>บันทึกข้อมูลระบบ</h1>
          <p class="subtitle">กรอกข้อมูลให้ครบถ้วนในช่องที่มีเครื่องหมาย <span class="required">*</span></p>
        </div>
      </div>

      <div class="form-container">
        <form @submit.prevent="submitForm">
          <div class="form-grid">
            <!-- ชื่อระบบงาน -->
            <div class="form-group">
              <label>
                <i class="fas fa-desktop"></i>
                ชื่อระบบงาน <span class="required">*</span>
              </label>
              <div class="input-wrapper">
                <select v-model="selectedSystemId" required>
                  <option value="" disabled>-- เลือกชื่อระบบ --</option>
                  <option v-for="system in systemList" :key="system.id" :value="system.id">
                    {{ system.name_th }} - {{ system.name_en }}
                  </option>
                </select>
              </div>
            </div>

            <!-- ข้อมูลสำคัญ -->
            <div class="form-group">
              <label>
                <i class="fas fa-info-circle"></i>
                ข้อมูลสำคัญ <span class="required">*</span>
              </label>
              <div class="input-wrapper">
                <input
                  type="text"
                  v-model="importantInfo"
                  required
                  placeholder="กรอกข้อมูลสำคัญ"
                />
              </div>
            </div>

            <!-- เลขที่หนังสืออ้างอิง -->
            <div class="form-group">
              <label>
                <i class="fas fa-file-alt"></i>
                เลขที่หนังสืออ้างอิง <span class="required">*</span>
              </label>
              <div class="input-wrapper">
                <input
                  type="text"
                  v-model="referenceNo"
                  required
                  placeholder="กรอกเลขที่หนังสืออ้างอิง"
                />
              </div>
            </div>

            <!-- ข้อมูลเพิ่มเติม -->
            <div class="form-group full-width">
              <label>
                <i class="fas fa-align-left"></i>
                ข้อมูลเพิ่มเติม
              </label>
              <div class="input-wrapper">
                <textarea
                  v-model="additionalInfo"
                  placeholder="กรอกข้อมูลเพิ่มเติม (ถ้ามี)"
                  rows="4"
                ></textarea>
              </div>
            </div>

            <!-- ไฟล์แนบ -->
            <div class="form-group full-width">
              <label for="fileUpload">ไฟล์แนบ</label>
              <div class="file-upload-wrapper">
                <div class="file-upload-content" @click="triggerFileInput">
                  <i class="fas fa-cloud-upload-alt"></i>
                  <p>ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์</p>
                  <span class="file-type">รองรับไฟล์ PDF, DOCX, XLSX</span>
                </div>
                <input
                  type="file"
                  id="fileUpload"
                  ref="fileInput"
                  multiple
                  @change="handleFileUpload"
                  class="hidden-input"
                />
              </div>
              <!-- แสดงไฟล์ที่เลือก -->
              <div v-if="files && files.length > 0" class="selected-files">
                <div v-for="(file, index) in files" :key="index" class="file-item">
                  <i class="fas fa-file"></i>
                  <span class="file-name">{{ file.name }}</span>
                  <button type="button" @click="removeFile(index)" class="remove-file">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- ปุ่มกด -->
            <div class="form-actions">
              <button type="button" @click="resetForm" class="btn-reset">
                <i class="fas fa-undo"></i>
                ล้างข้อมูล
              </button>
              <button type="submit" class="btn-submit">
                <i class="fas fa-save"></i>
                บันทึกข้อมูล
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { useToast } from "vue-toastification";

export default {
  setup() {
    const toast = useToast();
    return { toast }
  },
  data() {
    return {
      systemList: [],
      selectedSystemId: "",
      importantInfo: "",
      referenceNo: "",
      additionalInfo: "",
      files: null,
      deptInfo: null,
      isSubmitting: false
    };
  },
  methods: {
    async fetchDeptInfo() {
      try {
        const response = await axios.get("http://localhost:3004/api/data");
        const employeeData = response.data?.data?.dataDetail[0];
        if (employeeData) {
          this.deptInfo = {
            dept_change_code: employeeData.dept_change_code,
            dept_full: employeeData.dept_full
          };
        }
      } catch (error) {
        console.error("ไม่สามารถดึงข้อมูลแผนกได้:", error);
      }
    },

    async fetchSystems() {
      try {
        const response = await axios.get("http://localhost:8088/api/system-records");
        if (this.deptInfo) {
          this.systemList = response.data.filter(
            system => system.dept_change_code === this.deptInfo.dept_change_code
          );
        }
      } catch (error) {
        console.error("Error:", error);
        this.toast.error("ไม่สามารถดึงข้อมูลระบบได้");
      }
    },

    handleFileUpload(event) {
      this.files = event.target.files;
    },

    async submitForm() {
      if (!this.selectedSystemId || !this.importantInfo || !this.referenceNo) {
        this.toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
        return;
      }

      if (!this.deptInfo) {
        this.toast.error("ไม่พบข้อมูลแผนก กรุณาลองใหม่อีกครั้ง");
        return;
      }

      this.isSubmitting = true;

      try {
        const formData = new FormData();
        formData.append("systemId", this.selectedSystemId);
        formData.append("importantInfo", this.importantInfo);
        formData.append("referenceNo", this.referenceNo);
        formData.append("additionalInfo", this.additionalInfo || "");
        formData.append("dept_change_code", this.deptInfo.dept_change_code);
        formData.append("dept_full", this.deptInfo.dept_full);

        if (this.files) {
          Array.from(this.files).forEach((file) => {
            formData.append("files", file);
          });
        }

        const response = await axios.post(
          "http://localhost:8088/api/system-details",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.data.success) {
          this.toast.success("บันทึกข้อมูลสำเร็จ");
          this.resetForm();
        }
      } catch (error) {
        console.error("Error:", error);
        this.toast.error(error.response?.data?.message || "ไม่สามารถบันทึกข้อมูลได้");
      } finally {
        this.isSubmitting = false;
      }
    },

    resetForm() {
      this.selectedSystemId = "";
      this.importantInfo = "";
      this.referenceNo = "";
      this.additionalInfo = "";
      this.files = null;
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = "";
      }
    },

    removeFile(index) {
      const fileArray = Array.from(this.files);
      fileArray.splice(index, 1);
      this.files = new FileList(fileArray);
    },

    triggerFileInput() {
      this.$refs.fileInput.click();
    }
  },
  async mounted() {
    await this.fetchDeptInfo();
    await this.fetchSystems();
  }
};
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.form-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.form-header {
  background: linear-gradient(135deg, #ffffff 0%, #ffffff 100%);
  padding: 2rem;
  color: rgb(83, 82, 82);
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.header-icon {
  background: rgba(255, 255, 255, 0.2);
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-icon i {
  font-size: 1.8rem;
}

.header-text h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
}

.subtitle {
  margin: 0.5rem 0 0;
  opacity: 0.8;
  font-size: 0.9rem;
}

.form-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;  /* แบ่งเป็น 2 คอลัมน์ */
  gap: 24px;  /* ระยะห่างระหว่างช่อง */
}

.form-group {
  margin-bottom: 0;  /* ลบ margin ด้านล่างเพราะใช้ grid gap แทน */
}

.form-group.full-width {
  grid-column: 1 / -1;  /* ให้ข้อมูลเพิ่มเติมกินพื้นที่เต็ม */
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-weight: 500;
  color: #4a5568;
}

.form-group label i {
  color: rgba(0, 0, 0, 0.5);  /* สีดำโปร่งแสง 50% */
  font-size: 16px;
  width: 20px;
  text-align: center;
}

/* ปรับสีตอน hover */
.form-group:hover label i {
  color: rgba(0, 0, 0, 0.7);  /* เข้มขึ้นเล็กน้อยเมื่อ hover */
}

/* ปรับสีดาวแดงให้จางลงด้วย */
.required {
  color: rgba(229, 62, 62, 0.6);  /* สีแดงโปร่งแสง */
  margin-left: 4px;
}

.input-wrapper {
  position: relative;
}

.input-wrapper input,
.input-wrapper select,
.input-wrapper textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
  background-color: #f8fafc;  /* พื้นหลังอ่อนๆ */
}

.input-wrapper input:focus,
.input-wrapper select:focus,
.input-wrapper textarea:focus {
  outline: none;
  border-color: #7B105A;
  box-shadow: 0 0 0 3px rgba(123, 16, 90, 0.1);
  background-color: white;
}

/* ปุ่มกด */
.form-actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.btn-submit,
.btn-reset {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-submit {
  background: #3d98cd;
  color: rgb(255, 254, 254);
  border: none;
}

.btn-reset {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.btn-submit:hover {
  background: #2a6fca;
}

.btn-reset:hover {
  background: #e2e8f0;
}

/* ปรับสีไอคอนในปุ่มให้เข้ากัน */
.btn-submit i,
.btn-reset i {
  opacity: 0.7;  /* ทำให้ไอคอนในปุ่มจางลงเล็กน้อย */
}

/* Responsive */
@media (max-width: 768px) {
  .form-container {
    margin: 10px;
    padding: 20px;
  }

  .form-grid {
    grid-template-columns: 1fr;  /* แสดงเป็น 1 คอลัมน์บนมือถือ */
    gap: 16px;
  }
}

.selected-files {
  margin-top: 1rem;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.file-item i {
  color: #000000;
  margin-right: 0.75rem;
}

.file-name {
  flex: 1;
  font-size: 0.9rem;
}

.remove-file {
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.remove-file:hover {
  background: rgba(231, 76, 60, 0.1);
}

.file-upload-wrapper {
  border: 2px dashed #a1a1a1;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.file-upload-wrapper:hover {
  border-color: #000000;
  background: rgba(148, 148, 148, 0.02);
}

.file-upload-content {
  padding: 2rem;
  text-align: center;
  cursor: pointer;
}

.file-upload-content i {
  font-size: 2.5rem;
  color: #2980b9;
  margin-bottom: 1rem;
}

.file-upload-content p {
  margin: 0 0 0.5rem;
  color: #2c3e50;
}

.file-type {
  font-size: 0.85rem;
  color: #94a3b8;
}

.hidden-input {
  display: none;
}
</style>