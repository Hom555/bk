<template>
  <div class="page-container">
    <!-- Header Section -->
    <div class="page-header">
      <h1>บันทึกกิจกรรม</h1>
      <p class="subtitle">บันทึกและติดตามกิจกรรมการดำเนินงานของระบบ</p>
    </div>

    <div class="content-wrapper">
      <!-- Form Section -->
      <div class="form-section">
        <form @submit.prevent="submitForm" class="activity-form">
          <div class="form-header">
            <i class="fas fa-edit"></i>
            <span>แบบฟอร์มบันทึกกิจกรรม</span>
          </div>

          <div class="form-grid">
            <!-- System Selection -->
            <div class="form-group">
              <label>
                <i class="fas fa-server"></i>
                ระบบงาน
              </label>
              <select
                v-model="selectedSystemId"
                @change="fetchImportantInfo"
                :class="{ error: isSubmitted && !selectedSystemId }"
              >
                <option value="">-- เลือกระบบงาน --</option>
                <option
                  v-for="system in systemList"
                  :key="system.id"
                  :value="system.id"
                >
                  {{ system.name_th }}-{{ system.name_en }}
                </option>
              </select>
            </div>

            <!-- Important Info Selection -->
            <div class="form-group">
              <label>
                <i class="fas fa-info-circle"></i>
                ข้อมูลสำคัญ
              </label>
              <select
                v-model="importantInfo"
                :class="{ error: isSubmitted && !importantInfo }"
              >
                <option value="">-- เลือกข้อมูลสำคัญ --</option>
                <option
                  v-for="info in importantInfoList"
                  :key="info.id"
                  :value="info.id"
                >
                  {{ info.important_info }}
                </option>
              </select>
            </div>
          </div>

          <!-- Details Input -->
          <div class="form-group">
            <label>
              <i class="fas fa-align-left"></i>
              รายละเอียด
            </label>
            <textarea
              v-model="details"
              :class="{ error: isSubmitted && !details }"
              placeholder="กรอกรายละเอียดกิจกรรมที่ดำเนินการ..."
              rows="4"
            ></textarea>
          </div>

          <!-- File Upload Section -->
          <div class="upload-grid">
            <!-- Document Upload -->
            <div class="upload-section">
              <label>
                <i class="fas fa-file-upload"></i>
                เอกสารแนบ
              </label>
              <div
                class="upload-area"
                @drop.prevent="handleFileDrop"
                @dragover.prevent
                @click="$refs.fileInput.click()"
              >
                <input
                  ref="fileInput"
                  type="file"
                  multiple
                  @change="handleFileUpload"
                  class="hidden"
                />
                <div class="upload-placeholder">
                  <i class="fas fa-file"></i>
                  <span>คลิกหรือลากไฟล์มาวางที่นี่</span>
                  <small>รองรับไฟล์ PDF, DOC, DOCX</small>
                </div>
              </div>
              <!-- File Preview -->
              <div class="file-preview" v-if="files.length > 0">
                <div v-for="(file, index) in files" :key="index" class="preview-item">
                  <i class="fas fa-file"></i>
                  <span>{{ file.name }}</span>
                  <button @click.prevent="removeFile(index)" class="remove-btn">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Image Upload -->
            <div class="upload-section">
              <label>
                <i class="fas fa-images"></i>
                รูปภาพ
              </label>
              <div
                class="upload-area"
                @drop.prevent="handleImageDrop"
                @dragover.prevent
                @click="$refs.imageInput.click()"
              >
                <input
                  ref="imageInput"
                  type="file"
                  multiple
                  @change="handleImageUpload"
                  accept="image/*"
                  class="hidden"
                />
                <div class="upload-placeholder">
                  <i class="fas fa-image"></i>
                  <span>คลิกหรือลากรูปภาพมาวางที่นี่</span>
                  <small>รองรับไฟล์ JPG, PNG</small>
                </div>
              </div>
              <!-- Image Preview -->
              <div class="image-preview" v-if="images.length > 0">
                <div v-for="(image, index) in images" :key="index" class="preview-item">
                  <img v-if="image" :src="getImagePreviewUrl(image)" alt="Preview" />
                  <button @click.prevent="removeImage(index)" class="remove-btn">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <button type="button" @click="resetForm" class="btn-secondary">
              <i class="fas fa-redo"></i>
              ล้างฟอร์ม
            </button>
            <button type="submit" class="btn-primary">
              <i class="fas fa-save"></i>
              บันทึกกิจกรรม
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { useToast } from 'vue-toastification';

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
      importantInfoList: [],
      details: "",
      files: [],
      images: [],
      isSubmitted: false,
      activities: [],
      deptInfo: null
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
          await this.fetchSystems(); // เรียกดึงข้อมูลระบบหลังจากได้ข้อมูลแผนก
        }
      } catch (error) {
        console.error("Error:", error);
      }
    },

    async fetchSystems() {
      try {
        const response = await axios.get("http://localhost:8088/api/system-records");
        // กรองระบบตามแผนก
        if (this.deptInfo) {
          this.systemList = response.data.filter(
            system => system.dept_change_code === this.deptInfo.dept_change_code
          );
        }
      } catch (error) {
        console.error("Error:", error);
      }
    },

    async fetchImportantInfo() {
      if (!this.selectedSystemId) {
        this.importantInfoList = [];
        return;
      }
      try {
        const response = await axios.get(
          `http://localhost:8088/api/system-details/${this.selectedSystemId}`
        );
        this.importantInfoList = response.data.map((item) => ({
          id: item.id,
          important_info: item.important_info,
        }));
      } catch (error) {
        console.error("ไม่สามารถดึงข้อมูลสำคัญได้:", error);
      }
    },
    handleFileUpload(event) {
      this.files = Array.from(event.target.files);
    },
    handleImageUpload(event) {
      const files = Array.from(event.target.files);
      const validImages = files.filter(
        (file) => file && file.type.startsWith("image/")
      );
      if (validImages.length !== files.length) {
        alert("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
        return;
      }
      this.images = validImages;
    },
    async submitForm() {
      this.isSubmitted = true;
      if (!this.selectedSystemId || !this.importantInfo || !this.details) {
        this.toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
        return;
      }

      // ดึงข้อมูลแผนกจากระบบที่เลือก
      const selectedSystem = this.systemList.find(
        system => system.id === this.selectedSystemId
      );

      if (!selectedSystem) {
        this.toast.error("ไม่พบข้อมูลระบบที่เลือก");
        return;
      }

      const formData = new FormData();
      formData.append("systemId", this.selectedSystemId);
      formData.append("importantInfo", this.importantInfo);
      formData.append("details", this.details);
      formData.append("dept_change_code", selectedSystem.dept_change_code);
      formData.append("dept_full", selectedSystem.dept_full);

      this.files.forEach((file) => formData.append("files", file));
      this.images.forEach((image) => formData.append("images", image));

      try {
        const response = await axios.post(
          "http://localhost:8088/api/activities",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.data.success) {
          this.toast.success("บันทึกกิจกรรมสำเร็จ");
          this.resetForm();
          await this.fetchActivities();
        }
      } catch (error) {
        console.error("Error:", error);
        this.toast.error(error.response?.data?.message || "ไม่สามารถบันทึกข้อมูลได้");
      }
    },
    resetForm() {
      this.selectedSystemId = "";
      this.importantInfo = "";
      this.details = "";
      this.files = [];
      this.images = [];
      this.importantInfoList = [];
      this.isSubmitted = false;
     
    },
    async fetchActivities() {
      if (!this.selectedSystemId || !this.importantInfo) return;

      try {
        const response = await axios.get(
          `http://localhost:8088/api/activities/${this.selectedSystemId}/${this.importantInfo}`
        );
        // กรองกิจกรรมตามแผนก
        if (this.deptInfo) {
          this.activities = response.data.filter(
            activity => activity.dept_change_code === this.deptInfo.dept_change_code
          );
        }
      } catch (error) {
        console.error("Error:", error);
      }
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleString("th-TH");
    },
    getFileName(filePath) {
      if (!filePath) return "";
      const parts = filePath.split("/");
      return parts[parts.length - 1];
    },
    getImagePreviewUrl(image) {
      try {
        return image ? URL.createObjectURL(image) : "";
      } catch (error) {
        console.error("Error creating image URL:", error);
        return "";
      }
    },
  },
  watch: {
    importantInfo() {
      this.fetchActivities();
    },
  },
  async mounted() {
    await this.fetchDeptInfo();
  },
  beforeUnmount() {
    // Cleanup image URLs
    this.images.forEach((image) => {
      if (image) {
        URL.revokeObjectURL(this.getImagePreviewUrl(image));
      }
    });
  },
};
</script>

<style scoped>
.page-container {
  padding: 24px;
  background: #f8f9fa;
  min-height: 100vh;
}

.page-header {
  text-align: center;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 1.75rem;
  color: #2c3e50;
  margin-bottom: 8px;
}

.subtitle {
  color: #666;
  font-size: 0.95rem;
}

.content-wrapper {
  max-width: 900px;
  margin: 0 auto;
}

.form-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.activity-form {
  padding: 20px;
}

.form-header {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.2rem;
  color: #2c3e50;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: #2c3e50;
  font-weight: 500;
}

select,
textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

select:focus,
textarea:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  outline: none;
}

.upload-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.upload-section {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
  border: 2px dashed #ddd;
}

.upload-area {
  padding: 24px 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-area:hover {
  background: rgba(52, 152, 219, 0.1);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #666;
}

.upload-placeholder i {
  font-size: 1.5rem;
  color: #3498db;
}

.hidden {
  display: none;
}

.file-preview,
.image-preview {
  margin-top: 16px;
}

.preview-item {
  background: white;
  padding: 8px;
  border-radius: 8px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.preview-item img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}

.remove-btn {
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  padding: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.btn-primary,
.btn-secondary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background: #7f8c8d;
}

@media (max-width: 768px) {
  .page-container {
    padding: 16px;
  }

  .form-grid,
  .upload-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }
}
</style>
