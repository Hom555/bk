<template>
  <div class="page-container">
    <!-- ส่วนค้นหา -->
    <div class="search-section">
      <div class="search-header">
        <i class="fas fa-search"></i>
        <h2>ค้นหาข้อมูลกิจกรรม</h2>
      </div>

      <div class="search-form">
        <div class="form-group">
          <label>
            <i class="fas fa-server"></i>
            เลือกระบบงาน
          </label>
          <select
            v-model="selectedSystemId"
            @change="fetchSystemDetails"
            class="form-select"
          >
            <option value="">-- กรุณาเลือกระบบงาน --</option>
            <option
              v-for="system in system"
              :key="system.id"
              :value="system.id"
            >
              {{ system.name_th }}-{{ system.name_en }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>
            <i class="fas fa-info-circle"></i>
            เลือกข้อมูลสำคัญ
          </label>
          <select
            v-model="selectedImportantInfoId"
            @change="fetchActivities"
            :disabled="!selectedSystemId"
            class="form-select"
          >
            <option value="">-- กรุณาเลือกข้อมูลสำคัญ --</option>
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
    </div>

    <!-- ส่วนแสดงผลข้อมูล -->
    <div v-if="activities.length > 0" class="table-section">
      <div class="table-header">
        <div class="header-title">
          <i class="fas fa-clipboard-list"></i>
          <div class="header-info">
            <h2>รายการกิจกรรม</h2>
            <div class="selected-info">
              <span class="system-name">{{
                getSystemName(selectedSystemId)
              }}</span>
              <span class="separator">•</span>
              <span class="important-info">{{
                getImportantInfo(selectedImportantInfoId)
              }}</span>
            </div>
          </div>
        </div>
        <div class="table-actions">
          <span class="record-count">{{ activities.length }} รายการ</span>
        </div>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>ลำดับ</th>
              <th>วันที่</th>
              <th>รายละเอียด</th>
              <th>เอกสารแนบ</th>
              <th>รูปภาพ</th>
              <th class="text-center"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(activity, index) in activities" :key="activity.id" :class="{ 'editing-row': activity.editing }">
              <td class="text-center">{{ index + 1 }}</td>
              <td>{{ formatDate(activity.created_at) }}</td>
              <td>
                <input
                  v-if="activity.editing"
                  v-model="editedDetails"
                  type="text"
                  class="edit-input-same-cell"
                  :style="{ height: activity.editing ? '100%' : 'auto' }"
                  placeholder="รายละเอียด"
                />
                <span v-else class="cell-text">{{ activity.details }}</span>
              </td>
              <td>
                <div v-if="activity.editing">
                  <input
                    type="file"
                    @change="handleFileChange($event, activity)"
                    multiple
                    class="file-input"
                  />
                  <div v-if="activity.file_paths" class="existing-files">
                    <div v-for="filePath in activity.file_paths.split(',')" :key="filePath" class="file-item">
                      <span>{{ getFileName(filePath) }}</span>
                      <button @click="removeExistingFile(activity, filePath)" class="remove-btn">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <div v-else class="file-list">
                  <template v-if="activity.file_paths">
                    <a
                      v-for="filePath in activity.file_paths.split(',')"
                      :key="filePath"
                      :href="`http://localhost:8088${filePath}`"
                      target="_blank"
                      class="file-link"
                    >
                      <i class="fas fa-file-alt"></i>
                      {{ getFileName(filePath) }}
                    </a>
                  </template>
                  <div v-else class="no-files">ไม่มีไฟล์แนบ</div>
                </div>
              </td>
              <td>
                <div v-if="activity.editing">
                  <input
                    type="file"
                    @change="handleImageChange($event, activity)"
                    multiple
                    accept="image/*"
                    class="file-input"
                  />
                  <div v-if="activity.image_paths" class="existing-files">
                    <div v-for="imagePath in activity.image_paths.split(',')" :key="imagePath" class="file-item">
                      <img :src="`http://localhost:8088${imagePath}`" class="thumbnail" />
                      <button @click="removeExistingImage(activity, imagePath)" class="remove-btn">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <div v-else class="image-list">
                  <template v-if="activity.image_paths">
                    <div
                      v-for="imagePath in activity.image_paths.split(',')"
                      :key="imagePath"
                      class="image-thumbnail"
                      @click="openImage(`http://localhost:8088${imagePath}`)"
                    >
                      <img :src="`http://localhost:8088${imagePath}`" alt="Activity image" />
                    </div>
                  </template>
                  <div v-else class="no-images">ไม่มีรูปภาพ</div>
                </div>
              </td>
              <td class="text-center action-buttons">
                <template v-if="!activity.editing">
                  <button @click="startEdit(activity)" class="btn-edit" title="แก้ไข">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button @click="confirmDelete(activity)" class="btn-delete" title="ลบ">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </template>
                <template v-else>
                  <button @click="saveEdit(activity)" class="btn-save" title="บันทึก">
                    <i class="fas fa-save"></i>
                  </button>
                  <button @click="cancelEdit()" class="btn-cancel" title="ยกเลิก">
                    <i class="fas fa-times"></i>
                  </button>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- แสดงเมื่อไม่มีข้อมูล -->
    <div
      v-else-if="selectedSystemId && selectedImportantInfoId"
      class="no-data"
    >
      <i class="fas fa-inbox"></i>
      <p>ไม่พบข้อมูลกิจกรรม</p>
    </div>

    <!-- Dialog ยืนยันการลบ -->
    <div v-if="showDeleteConfirm" class="delete-confirm-overlay">
      <div class="delete-confirm-dialog">
        <div class="dialog-header">
          <i class="fas fa-exclamation-triangle warning-icon"></i>
          <h3>ยืนยันการลบกิจกรรม</h3>
        </div>
        
        <div class="dialog-content">
          <p>คุณต้องการลบกิจกรรมของระบบ "{{ getSystemName(activityToDelete?.system_id) }}" ใช่หรือไม่?</p>
          <p class="activity-details">รายละเอียด: {{ getActivityDetails(activityToDelete?.details) }}</p>
          <p class="warning-text">การดำเนินการนี้ไม่สามารถยกเลิกได้</p>
        </div>

        <div class="dialog-actions">
          <button @click="cancelDelete" class="btn-cancel">
            <i class="fas fa-times"></i>
            ยกเลิก
          </button>
          <button @click="handleDelete" class="btn-confirm-delete">
            <i class="fas fa-trash-alt"></i>
            ยืนยันการลบ
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { useToast } from 'vue-toastification';

export default {
  name: 'Dataactivities',
  setup() {
    const toast = useToast();
    return { toast }
  },
  data() {
    return {
      system: [],
      importantInfoList: [],
      selectedSystemId: "",
      selectedImportantInfoId: "",
      allActivities: [],
      activities: [],
      searchQuery: "",
      deptInfo: null,
      loading: false,
      toastShown: false,
      editingId: null,
      editedDetails: "",
      newFiles: [],
      newImages: [],
      removedFiles: [],
      removedImages: [],
      showDeleteConfirm: false,
      activityToDelete: null
    };
  },
  methods: {
    showToast(message, type = 'error') {
      if (!this.toastShown) {
        this.toastShown = true;
        this.toast[type](message);
        setTimeout(() => {
          this.toastShown = false;
        }, 3000);
      }
    },
    async fetchDeptInfo() {
      try {
        const response = await axios.get("http://localhost:3004/api/data");
        const employeeData = response.data?.data?.dataDetail[0];
        if (employeeData) {
          this.deptInfo = {
            dept_change_code: employeeData.dept_change_code,
            dept_full: employeeData.dept_full
          };
          console.log('Department Info:', this.deptInfo);
          await this.fetchSystems();
        } else {
          throw new Error("ไม่พบข้อมูลแผนก");
        }
      } catch (error) {
        console.error("Error fetching department info:", error);
        this.toast.error("ไม่สามารถดึงข้อมูลแผนกได้");
      }
    },

    async fetchSystems() {
      try {
        const response = await axios.get("http://localhost:8088/api/system-records");
        if (this.deptInfo) {
          this.system = response.data.filter(
            system => system.dept_change_code === this.deptInfo.dept_change_code
          );
          console.log('Filtered Systems:', this.system);
        }
      } catch (error) {
        console.error("Error fetching systems:", error);
        this.toast.error("ไม่สามารถดึงข้อมูลระบบได้");
      }
    },

    async fetchActivities() {
      try {
        const response = await axios.get("http://localhost:8088/api/all-activities");
        if (this.deptInfo) {
          // เก็บข้อมูลทั้งหมดที่ผ่านการกรองแผนก
          this.allActivities = response.data.filter(
            activity => activity.dept_change_code === this.deptInfo.dept_change_code
          );
          this.filterActivities();
        }
      } catch (error) {
        console.error("Error fetching activities:", error);
        this.toast.error("ไม่สามารถดึงข้อมูลกิจกรรมได้");
      }
    },

    filterActivities() {
      let filteredActivities = [...this.allActivities];

      if (this.selectedSystemId) {
        filteredActivities = filteredActivities.filter(
          activity => parseInt(activity.system_id) === parseInt(this.selectedSystemId)
        );
      }

      if (this.selectedImportantInfoId) {
        filteredActivities = filteredActivities.filter(
          activity => parseInt(activity.important_info) === parseInt(this.selectedImportantInfoId)
        );
      }

      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filteredActivities = filteredActivities.filter(activity =>
          activity.details.toLowerCase().includes(query)
        );
      }

      this.activities = filteredActivities;
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleString("th-TH");
    },
    getFileName(filePath) {
      if (!filePath) return "";
      const parts = filePath.split("/");
      return parts[parts.length - 1];
    },
    openImage(imageUrl) {
      window.open(imageUrl, '_blank');
    },
    getSystemName(systemId) {
      const system = this.system.find(s => s.id === systemId);
      return system ? system.name_th : '';
    },
    getImportantInfo(infoId) {
      const info = this.importantInfoList.find(i => i.id === infoId);
      return info ? info.important_info : '';
    },
    getActivityDetails(details) {
      if (!details) return '';
      return details.length > 50 ? details.substring(0, 50) + '...' : details;
    },
    async editActivity(activity) {
      try {
        const newDetails = prompt("แก้ไขรายละเอียด:", activity.details);
        if (newDetails === null) return;

        if (newDetails.trim() === "") {
          alert("กรุณากรอกรายละเอียด");
          return;
        }

        await axios.put(
          `http://localhost:8088/api/activities/${activity.id}`,
          {
            details: newDetails,
          }
        );

        await this.fetchActivities();
        alert("แก้ไขข้อมูลสำเร็จ");
      } catch (error) {
        console.error("Error updating activity:", error);
        alert("ไม่สามารถแก้ไขข้อมูลได้");
      }
    },
    async deleteActivity(activityId) {
      try {
        const activityToDelete = this.activities.find(activity => activity.id === activityId);
        if (!activityToDelete) {
          throw new Error("ไม่พบข้อมูลกิจกรรมที่ต้องการลบ");
        }

        if (parseInt(activityToDelete.system_id) !== parseInt(this.selectedSystemId) || 
            parseInt(activityToDelete.important_info) !== parseInt(this.selectedImportantInfoId)) {
          throw new Error("ไม่สามารถลบกิจกรรมที่ไม่ตรงกับระบบหรือข้อมูลสำคัญที่เลือก");
        }

        const response = await axios.delete(
          `http://localhost:8088/api/activities/${activityId}/${activityToDelete.system_id}/${activityToDelete.important_info}`
        );
        
        if (response.data.success) {
          this.toast.success("ลบข้อมูลสำเร็จ");
          this.activities = this.activities.filter(activity => activity.id !== activityId);
        } else {
          throw new Error(response.data.message || "ไม่สามารถลบข้อมูลได้");
        }
      } catch (error) {
        console.error("Error deleting activity:", error);
        this.toast.error(error.message || "เกิดข้อผิดพลาดในการลบข้อมูล");
      }
    },
    async confirmDelete(activity) {
      this.activityToDelete = activity;
      this.showDeleteConfirm = true;
    },
    cancelDelete() {
      this.activityToDelete = null;
      this.showDeleteConfirm = false;
    },
    async handleDelete() {
      if (!this.activityToDelete) return;

      try {
        const response = await axios.delete(
          `http://localhost:8088/api/activities/${this.activityToDelete.id}/${this.activityToDelete.system_id}/${this.activityToDelete.important_info}`
        );

        if (response.data.success) {
          this.toast.success('ลบข้อมูลกิจกรรมสำเร็จ');
          await this.fetchActivities();
        }
      } catch (error) {
        console.error('Error:', error);
        this.toast.error('ไม่สามารถลบข้อมูลได้');
      } finally {
        this.showDeleteConfirm = false;
        this.activityToDelete = null;
      }
    },
    startEdit(activity) {
      // ยกเลิกการแก้ไขรายการอื่นก่อน (ถ้ามี)
      const currentEditing = this.activities.find(a => a.editing);
      if (currentEditing) {
        this.cancelEdit();
      }

      // เก็บข้อมูลเดิมและเปิดโหมดแก้ไข
      activity.editing = true;
      activity.editedInfo = {
        details: activity.details,
        file_paths: activity.file_paths,
        image_paths: activity.image_paths
      };

      // ตั้งค่าตัวแปรสำหรับการแก้ไข
      this.editingId = activity.id;
      this.editedDetails = activity.details;
      this.newFiles = [];
      this.newImages = [];
      this.removedFiles = [];
      this.removedImages = [];

      // แจ้งเตือนผู้ใช้
      this.toast.info("เริ่มแก้ไขข้อมูล", {
        timeout: 2000
      });
    },

    async saveEdit(activity) {
      try {
        if (!this.editedDetails.trim()) {
          throw new Error("กรุณากรอกรายละเอียด");
        }

        const formData = new FormData();
        formData.append('details', this.editedDetails);
        formData.append('systemId', activity.system_id);
        formData.append('importantInfo', activity.important_info);

        // จัดการไฟล์ใหม่
        if (activity.newFiles) {
          activity.newFiles.forEach(file => {
            formData.append('files', file);
          });
        }

        // จัดการรูปภาพใหม่
        if (activity.newImages) {
          activity.newImages.forEach(image => {
            formData.append('images', image);
          });
        }

        // จัดการไฟล์และรูปภาพที่ต้องการลบ
        if (activity.removedFiles) {
          formData.append('removedFiles', JSON.stringify(activity.removedFiles));
        }
        if (activity.removedImages) {
          formData.append('removedImages', JSON.stringify(activity.removedImages));
        }

        const response = await axios.put(
          `http://localhost:8088/api/activities/${activity.id}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        if (response.data.success) {
          // อัพเดทข้อมูลในแถวที่แก้ไข
          activity.details = this.editedDetails;
          activity.file_paths = response.data.file_paths;
          activity.image_paths = response.data.image_paths;
          activity.updated_at = new Date().toISOString();
          activity.editing = false;

          // ล้างข้อมูลการแก้ไข
          delete activity.editedInfo;
          delete activity.newFiles;
          delete activity.newImages;
          delete activity.removedFiles;
          delete activity.removedImages;

          this.editingId = null;
          this.editedDetails = "";

          this.toast.success("บันทึกการแก้ไขสำเร็จ");
        } else {
          throw new Error(response.data.message || "ไม่สามารถบันทึกการแก้ไขได้");
        }
      } catch (error) {
        console.error("Error saving edit:", error);
        this.toast.error(error.message || "ไม่สามารถบันทึกการแก้ไขได้");
      }
    },

    cancelEdit() {
      // ยกเลิกการแก้ไขและคืนค่าเดิม
      const activity = this.activities.find(a => a.id === this.editingId);
      if (activity && activity.editedInfo) {
        // คืนค่าข้อมูลเดิม
        activity.details = activity.editedInfo.details;
        activity.file_paths = activity.editedInfo.file_paths;
        activity.image_paths = activity.editedInfo.image_paths;
        
        // ล้างข้อมูลการแก้ไข
        activity.editing = false;
        delete activity.editedInfo;
        delete activity.newFiles;
        delete activity.newImages;
        delete activity.removedFiles;
        delete activity.removedImages;
      }

      // รีเซ็ตตัวแปรที่เกี่ยวข้องกับการแก้ไข
      this.editingId = null;
      this.editedDetails = "";
      this.newFiles = [];
      this.newImages = [];
      this.removedFiles = [];
      this.removedImages = [];

      // แจ้งเตือนผู้ใช้
      this.toast.info("ยกเลิกการแก้ไข", {
        timeout: 2000
      });
    },

    handleFileChange(event, activity) {
      activity.newFiles = Array.from(event.target.files);
      activity.removedFiles = [];
    },

    handleImageChange(event, activity) {
      const files = Array.from(event.target.files);
      const validImages = files.filter(file => file.type.startsWith('image/'));
      if (validImages.length !== files.length) {
        this.toast.error("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
        event.target.value = '';
        return;
      }
      activity.newImages = validImages;
      activity.removedImages = [];
    },

    removeSelectedFile(activity, index) {
      activity.newFiles.splice(index, 1);
      if (activity.newFiles.length === 0) {
        const fileInput = this.$el.querySelector('.file-input');
        if (fileInput) fileInput.value = '';
      }
    },

    removeSelectedImage(activity, index) {
      activity.newImages.splice(index, 1);
      if (activity.newImages.length === 0) {
        const imageInput = this.$el.querySelector('.file-input');
        if (imageInput) imageInput.value = '';
      }
    },

    async fetchSystemDetails() {
      if (!this.selectedSystemId) {
        this.importantInfoList = [];
        return;
      }

      try {
        const response = await axios.get(`http://localhost:8088/api/system-details/${this.selectedSystemId}`);
        if (this.deptInfo) {
          this.importantInfoList = response.data
            .filter(detail => detail.dept_change_code === this.deptInfo.dept_change_code)
            .map(detail => ({
              id: detail.id,
              important_info: detail.important_info
            }));
        }
      } catch (error) {
        console.error("Error:", error);
        this.toast.error("ไม่สามารถดึงข้อมูลสำคัญได้");
      }
    },

    // เพิ่มเมธอดสำหรับลบไฟล์ที่มีอยู่
    removeExistingFile(activity, filePath) {
      if (!activity.removedFiles) {
        activity.removedFiles = [];
      }
      activity.removedFiles.push(filePath);
      
      // อัพเดท file_paths โดยลบไฟล์ที่เลือกออก
      const currentFiles = activity.file_paths.split(',');
      activity.file_paths = currentFiles
        .filter(path => path !== filePath)
        .join(',');
    },

    // เพิ่มเมธอดสำหรับลบรูปภาพที่มีอยู่
    removeExistingImage(activity, imagePath) {
      if (!activity.removedImages) {
        activity.removedImages = [];
      }
      activity.removedImages.push(imagePath);
      
      // อัพเดท image_paths โดยลบรูปภาพที่เลือกออก
      const currentImages = activity.image_paths.split(',');
      activity.image_paths = currentImages
        .filter(path => path !== imagePath)
        .join(',');
    },
  },
  watch: {
    selectedSystemId() {
      this.selectedImportantInfoId = "";
      this.importantInfoList = [];
      if (this.selectedSystemId) {
        this.fetchSystemDetails();
        this.fetchActivities();
      }
    },
    selectedImportantInfoId() {
      if (this.selectedImportantInfoId !== "") {
        console.log('Selected important info changed:', this.selectedImportantInfoId);
        this.fetchActivities();
      }
    },
    searchQuery() {
      this.fetchActivities();
    }
  },
  async mounted() {
    try {
      this.loading = true;
      await this.fetchDeptInfo();
      if (this.selectedSystemId) {
        await this.fetchSystemDetails();
      }
      this.loading = false;
    } catch (error) {
      console.error("Error in mounted:", error);
      this.toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      this.loading = false;
    }
  },
};
</script>

<style scoped>
.page-container {
  padding: 24px;
  background: #f0f2f5;
  min-height: 100vh;
}

.search-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  color: #2c3e50;
  border-bottom: 2px solid #f0f2f5;
  padding-bottom: 16px;
}

.search-header i {
  font-size: 1.4rem;
  color: #3498db;
}

.search-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
}

.search-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.form-group {
  margin: 0;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: #666;
}

.form-select {
  width: 100%;
  padding: 12px;
  border: 1px solid #e1e8ef;
  border-radius: 8px;
  font-size: 1rem;
  color: #2c3e50;
  background-color: #fff;
  transition: all 0.3s ease;
  cursor: pointer;
}

.form-select:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  outline: none;
}

.form-select:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.table-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f2f5;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-title i {
  font-size: 1.4rem;
  color: #3498db;
}

.header-title h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.record-count {
  background: #e1f0fa;
  padding: 6px 16px;
  border-radius: 20px;
  color: #3498db;
  font-weight: 500;
}

.table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 800px;
}

th,
td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #edf2f7;
}

th {
  background: #f8fafc;
  color: #64748b;
  font-weight: 600;
  font-size: 0.95rem;
  white-space: nowrap;
}

th:first-child {
  border-top-left-radius: 8px;
}

th:last-child {
  border-top-right-radius: 8px;
}

td {
  position: relative;
  color: #2c3e50;
  font-size: 0.95rem;
  white-space: normal;
  word-break: break-word;
}

tr:hover td {
  background: #f8fafc;
}

.text-center {
  text-align: center;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
}

.file-link {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  padding: 6px 12px;
  background: #f1f5f9;
  border-radius: 6px;
  color: #3498db;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  width: fit-content;
}

.file-link:hover {
  background: #e2e8f0;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px;
}

.image-thumbnail {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid #e1e8ef;
  transition: all 0.2s ease;
  position: relative;
}

.image-thumbnail:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: #3498db;
}

.image-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.no-images {
  color: #666;
  font-style: italic;
  padding: 8px;
  text-align: center;
  width: 100%;
}

.file-input {
  width: 100%;
  padding: 8px;
  border: 2px dashed #e1e8ef;
  border-radius: 8px;
  background-color: #f8f9fa;
  margin-bottom: 8px;
  cursor: pointer;
}

.file-input:hover {
  border-color: #3498db;
  background-color: #f0f7fc;
}

.editing-row .image-thumbnail {
  opacity: 0.7;
}

table td:nth-child(5) {
  min-width: 220px;
  max-width: 300px;
}

.image-container {
  position: relative;
  display: inline-block;
}

.remove-image {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #fff;
  border: 1px solid #dc3545;
  color: #dc3545;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.remove-image:hover {
  background-color: #dc3545;
  color: #fff;
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.selected-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  color: #64748b;
}

.system-name,
.important-info {
  font-weight: 500;
}

.separator {
  color: #cbd5e1;
}

.action-buttons {
  display: inline-flex;
  justify-content: flex-start;
  gap: 8px;
}

.btn-edit,
.btn-delete {
  padding: 6px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.btn-edit {
  background: #e1f0fa;
  color: #3498db;
}

.btn-edit:hover {
  background: #3498db;
  color: white;
}

.btn-delete {
  background: #fee2e2;
  color: #ef4444;
}

.btn-delete:hover {
  background: #ef4444;
  color: white;
}

.edit-textarea {
  width: 100%;
  min-height: 80px;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.95rem;
  resize: vertical;
  transition: border-color 0.2s ease;
  margin-bottom: 8px;
}

.edit-textarea:focus {
  border-color: #3498db;
  outline: none;
}

.edit-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.btn-save,
.btn-cancel {
  padding: 6px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-save {
  background: #e1f0fa;
  color: #3498db;
}

.btn-save:hover {
  background: #3498db;
  color: white;
}

.btn-cancel {
  background: #fee2e2;
  color: #ef4444;
}

.btn-cancel:hover {
  background: #ef4444;
  color: white;
}

.details-text {
  padding: 8px;
  border-radius: 4px;
}

.edit-form {
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.edit-header {
  background: #f1f5f9;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #e2e8f0;
}

.edit-header i {
  color: #3498db;
}

.edit-content {
  padding: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #475569;
  font-weight: 500;
}

.form-group label i {
  color: #3498db;
}

.edit-textarea {
  width: 100%;
  min-height: 120px;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.95rem;
  resize: vertical;
}

.upload-section {
  margin-top: 8px;
}

.files-preview,
.images-preview {
  margin-top: 12px;
  background: #f8fafc;
  border-radius: 6px;
  padding: 12px;
  max-height: 250px;
  overflow-y: auto;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  margin-bottom: 8px;
}

.file-item:last-child {
  margin-bottom: 0;
}

.image-item {
  width: 100%;
  height: 120px;
  margin-bottom: 8px;
}

.image-item:last-child {
  margin-bottom: 0;
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.edit-layout {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 16px;
}

.edit-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.files-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #475569;
  font-weight: 500;
}

.form-group label i {
  color: #3498db;
}

.edit-textarea {
  width: 100%;
  min-height: 120px;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.95rem;
  resize: vertical;
  transition: border-color 0.2s ease;
}

.edit-textarea:focus {
  border-color: #3498db;
  outline: none;
}

.upload-label {
  width: 100%;
  padding: 12px;
  background: #f8fafc;
  border: 2px dashed #e2e8f0;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-label:hover {
  border-color: #3498db;
  background: #e1f0fa;
}

.files-preview,
.images-preview {
  margin-top: 12px;
  background: #f8fafc;
  border-radius: 6px;
  padding: 12px;
  max-height: 250px;
  overflow-y: auto;
}

.selected-files {
  margin-top: 10px;
}

.file-item {
  display: flex;
  align-items: center;
  margin: 5px 0;
  padding: 5px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.file-item span {
  flex: 1;
  margin-right: 10px;
  font-size: 0.9em;
}

.remove-btn {
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  padding: 2px 5px;
}

.remove-btn:hover {
  color: #c82333;
}

.existing-files {
  margin-top: 10px;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 5px 0;
  padding: 8px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.thumbnail {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}

.remove-btn {
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  padding: 4px 8px;
}

.remove-btn:hover {
  color: #c82333;
}

@media (max-width: 768px) {
  .search-form {
    grid-template-columns: 1fr;
  }

  .table-section {
    margin: 0 -12px;
    border-radius: 0;
  }

  .table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .record-count {
    align-self: flex-start;
  }
}

@media (max-width: 480px) {
  .page-container {
    padding: 12px;
  }

  .search-section,
  .table-section {
    padding: 16px;
  }

  .thumbnail {
    width: 32px;
    height: 32px;
  }

  .btn-edit,
  .btn-delete {
    width: 28px;
    height: 28px;
    padding: 4px;
  }

  .file-link {
    padding: 4px 8px;
    font-size: 0.85rem;
  }

  th,
  td {
    padding: 12px 8px;
    font-size: 0.9rem;
  }
}

.delete-confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.delete-confirm-dialog {
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.warning-icon {
  color: #f59e0b;
  font-size: 24px;
}

.dialog-content {
  margin-bottom: 24px;
}

.warning-text {
  color: #dc2626;
  font-size: 14px;
  margin-top: 8px;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}

.btn-cancel,
.btn-confirm-delete {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  min-width: 120px;
  justify-content: center;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}

.btn-confirm-delete {
  background: #dc2626;
  color: white;
  border: none;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-confirm-delete:hover {
  background: #b91c1c;
}

.activity-details {
  color: #4b5563;
  font-size: 14px;
  margin: 8px 0;
  font-style: italic;
}
</style>