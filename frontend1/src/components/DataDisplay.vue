<template>
  <div class="container">
    <div class="header">
      <h1>ระบบจัดการข้อมูล</h1>
    </div>

    <div class="controls">
      <div class="select-group">
        <label>ระบบงาน</label>
        <select v-model="selectedSystemId" @change="fetchSystemDetails">
          <option value="">-- กรุณาเลือกระบบงาน --</option>
          <option v-for="system in systems" :key="system.id" :value="system.id">
            {{ system.name_th }}-{{ system.name_en }}
          </option>
        </select>
      </div>
      <div class="search-group">
        <label>ค้นหา</label>
        <input
          type="text"
          v-model="searchQuery"
          placeholder="ค้นหาจากข้อมูลสำคัญ, เลขที่อ้างอิง..."
          class="search-input"
        />
      </div>
    </div>

    <div class="details-container">
      <div class="table-wrapper">
        <table v-if="filteredDetails.length > 0" class="details-table">
          <thead>
            <tr>
              <th class="th-important">ข้อมูลสำคัญ</th>
              <th class="th-ref">เลขที่อ้างอิง</th>
              <th class="th-additional">ข้อมูลเพิ่มเติม</th>
              <th class="th-files">ไฟล์แนบ</th>
              <th class="th-date">วันที่สร้าง</th>
              <th class="th-actions"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="detail in filteredDetails" :key="detail.id" :class="{ 'editing-row': detail.editing }">
              <td>
                <input
                  v-if="detail.editing"
                  v-model="detail.editedInfo.important_info"
                  type="text"
                  class="edit-input-same-cell"
                  :style="{ height: detail.editing ? '100%' : 'auto' }"
                  placeholder="ข้อมูลสำคัญ"
                />
                <span v-else class="cell-text">{{ detail.important_info }}</span>
              </td>
              <td>
                <input
                  v-if="detail.editing"
                  v-model="detail.editedInfo.reference_no"
                  type="text"
                  class="edit-input-same-cell"
                  :style="{ height: detail.editing ? '100%' : 'auto' }"
                  placeholder="เลขที่อ้างอิง"
                />
                <span v-else class="cell-text">{{ detail.reference_no }}</span>
              </td>
              <td>
                <input
                  v-if="detail.editing"
                  v-model="detail.editedInfo.additional_info"
                  type="text"
                  class="edit-input-same-cell"
                  :style="{ height: detail.editing ? '100%' : 'auto' }"
                  placeholder="ข้อมูลเพิ่มเติม"
                />
                <span v-else class="cell-text">{{ detail.additional_info || "-" }}</span>
              </td>
              <td>
                <div v-if="detail.editing">
                  <input
                    type="file"
                    @change="handleFileChange($event, detail)"
                    multiple
                    class="file-input"
                  />
                </div>
                <div v-else class="file-list">
                  <template v-if="detail.file_path">
                    <a
                      v-for="filePath in detail.file_path.split(',')"
                      :key="filePath"
                      :href="'http://localhost:8088' + filePath"
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
              <td>{{ formatDate(detail.created_at) }}</td>
              <td class="action-column">
                <div class="action-buttons">
                  <template v-if="!detail.editing">
                    <button @click="startEditing(detail)" class="edit-btn">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button @click="confirmDelete(detail)" class="delete-btn">
                      <i class="fas fa-trash"></i>
                    </button>
                  </template>
                  <template v-else>
                    <button @click="saveChanges(detail)" class="save-btn">
                      <i class="fas fa-save"></i>
                    </button>
                    <button @click="cancelEditing(detail)" class="cancel-btn">
                      <i class="fas fa-times"></i>
                    </button>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else-if="selectedSystemId" class="no-data">ไม่พบข้อมูล</div>
      </div>
    </div>

    <!-- Dialog ยืนยันการลบ -->
    <div v-if="showDeleteConfirm" class="delete-confirm-overlay">
      <div class="delete-confirm-dialog">
        <div class="dialog-header">
          <i class="fas fa-exclamation-triangle warning-icon"></i>
          <h3>ยืนยันการลบข้อมูล</h3>
        </div>
        
        <div class="dialog-content">
          <p>คุณต้องการลบข้อมูลของระบบ "{{ getSystemName(recordToDelete?.system_id) }}" ใช่หรือไม่?</p>
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
import { useToast } from "vue-toastification";

export default {
  name: 'DataDisplay',
  setup() {
    const toast = useToast();
    return { toast }
  },
  data() {
    return {
      systems: [],
      selectedSystemId: "",
      systemDetails: [],
      searchQuery: "",
      deptInfo: null,
      showDeleteConfirm: false,
      recordToDelete: null
    };
  },
  computed: {
    filteredDetails() {
      if (!this.searchQuery) return this.systemDetails;

      const query = this.searchQuery.toLowerCase();
      return this.systemDetails.filter(
        (detail) =>
          detail.important_info.toLowerCase().includes(query) ||
          detail.reference_no.toLowerCase().includes(query) ||
          (detail.additional_info &&
            detail.additional_info.toLowerCase().includes(query))
      );
    },
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
          this.systems = response.data.filter(
            system => system.dept_change_code === this.deptInfo.dept_change_code
          );
        }
      } catch (error) {
        console.error("Error:", error);
      }
    },
    async fetchSystemDetails() {
      if (!this.selectedSystemId) return;
      
      try {
        const response = await axios.get(
          `http://localhost:8088/api/system-details/${this.selectedSystemId}`
        );
        if (this.deptInfo && response.data) {
          this.systemDetails = response.data.filter(
            detail => detail.dept_change_code === this.deptInfo.dept_change_code
          );
        }
      } catch (error) {
        console.error("Error:", error);
        this.toast.error("ไม่สามารถดึงข้อมูลได้");
      }
    },
    startEditing(detail) {
      detail.editing = true;
      detail.editedInfo = {
        important_info: detail.important_info,
        reference_no: detail.reference_no,
        additional_info: detail.additional_info,
      };
    },
    async saveChanges(detail) {
      try {
        const formData = new FormData();
        formData.append("systemId", this.selectedSystemId);
        formData.append("importantInfo", detail.editedInfo.important_info);
        formData.append("referenceNo", detail.editedInfo.reference_no);
        formData.append("additionalInfo", detail.editedInfo.additional_info || "");

        if (detail.newFiles && detail.newFiles.length > 0) {
          detail.newFiles.forEach((file) => {
            formData.append("files", file);
          });
        }

        await axios.put(
          `http://localhost:8088/api/system-details/${detail.id}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        await this.fetchSystemDetails();
        detail.editing = false;
        detail.newFiles = [];

        this.toast.success("บันทึกการแก้ไขสำเร็จ");
      } catch (error) {
        console.error("Error saving changes:", error.response?.data || error.message);
        this.toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    },
    cancelEditing(detail) {
      detail.editing = false;
      detail.newFiles = [];
    },
    handleFileChange(event, detail) {
      const files = Array.from(event.target.files);
      console.log("Selected files:", files);
      if (files.length > 0) {
        detail.newFiles = files;
      }
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleString("th-TH");
    },
    getFileName(filePath) {
      if (!filePath) return "";
      try {
        const parts = filePath.split("/");
        const filename = parts[parts.length - 1];
        return decodeURIComponent(filename.replace(/^\d+-/, ""));
      } catch (error) {
        console.error("Error getting filename:", error);
        return "Unknown file";
      }
    },
    confirmDelete(record) {
      this.recordToDelete = record;
      this.showDeleteConfirm = true;
    },
    cancelDelete() {
      this.recordToDelete = null;
      this.showDeleteConfirm = false;
    },
    async handleDelete() {
      if (!this.recordToDelete) return;

      try {
        const response = await axios.delete(
          `http://localhost:8088/api/system-details/${this.recordToDelete.id}/${this.recordToDelete.system_id}/${this.recordToDelete.important_info}`
        );

        if (response.data.success) {
          this.toast.success('ลบข้อมูลสำเร็จ');
          this.systemDetails = this.systemDetails.filter(
            detail => detail.id !== this.recordToDelete.id
          );
        }
      } catch (error) {
        console.error('Error:', error);
        this.toast.error('ไม่สามารถลบข้อมูลได้');
      } finally {
        this.showDeleteConfirm = false;
        this.recordToDelete = null;
      }
    },
    async refreshData() {
      if (this.selectedSystemId) {
        await this.fetchSystemDetails();
      }
    },
    getSystemName(systemId) {
      const system = this.systems.find(s => s.id === systemId);
      return system ? system.name_th : '';
    },
  },
  watch: {
    selectedSystemId() {
      this.fetchSystemDetails();
    },
  },
  async created() {
    await this.fetchDeptInfo();
    await this.fetchSystems();
    if (this.selectedSystemId) {
      await this.fetchSystemDetails();
    }
  },
};
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 30px;
  background-color: #ffffff;
  border-radius: 15px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
}

.header {
  margin-bottom: 30px;
}

.header h1 {
  color: #2c3e50;
  font-size: 28px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 10px;
}

.controls {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
  align-items: flex-end;
}

.select-group, .search-group {
  flex: 1;
}

.select-group label, .search-group label {
  display: block;
  margin-bottom: 8px;
  color: #2c3e50;
  font-weight: 500;
  font-size: 14px;
}

select, .search-input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  color: #2c3e50;
  background-color: white;
  transition: all 0.3s ease;
}

select:focus, .search-input:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
  outline: none;
}

.table-wrapper {
  overflow-x: auto;
  background: white;
  border-radius: 10px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.05);
}

.details-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: white;
}

.details-table th {
  background: #f8f9fa;
  color: #2c3e50;
  font-weight: 600;
  padding: 15px;
  text-align: left;
  border-bottom: 2px solid #e0e0e0;
  white-space: nowrap;
}

.details-table td {
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
  color: #2c3e50;
  vertical-align: top;
  min-width: 150px;
}

.th-important { width: 25%; }
.th-ref { width: 20%; }
.th-additional { width: 30%; }
.th-files { width: 15%; }
.th-date { width: 10%; }
.th-actions { width: 100px; }

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.action-buttons button {
  width: 32px;
  height: 32px;
  margin: 0 2px;
  border: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-btn {
  background-color: #3498db;
  color: white;
}

.delete-btn {
  background-color: #e74c3c;
  color: white;
}

.save-btn {
  background-color: #2ecc71;
  color: white;
}

.cancel-btn {
  background-color: #95a5a6;
  color: white;
}

.action-buttons button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.file-list {
  padding: 4px 0;
}

.file-link {
  margin: 4px 0;
  padding: 6px 10px;
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  color: #2c3e50;
  transition: all 0.2s ease;
}

.file-link:hover {
  background: #e9ecef;
}

.file-link i {
  margin-right: 8px;
  color: #3498db;
}

.edit-input-same-cell {
  width: 100%;
  height: 100%;
  padding: 8px;
  margin: 0;
  border: none;
  background: transparent;
  font-size: inherit;
  color: inherit;
  font-family: inherit;
}

.edit-input-same-cell:focus {
  outline: 2px solid #3498db;
  background-color: white;
}

.cell-text {
  display: block;
  padding: 8px;
}

.editing-row td {
  padding: 0 !important;
  background-color: rgba(52, 152, 219, 0.05);
}

td {
  position: relative;
  height: 45px;
  transition: all 0.2s ease;
}

.details-table td {
  vertical-align: middle;
}

.no-files {
  color: #666;
  font-style: italic;
  padding: 8px 0;
}

@media (max-width: 1024px) {
  .container {
    padding: 20px;
    margin: 10px;
  }

  .controls {
    flex-direction: column;
    gap: 15px;
  }

  .select-group, .search-group {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .table-wrapper {
    overflow-x: auto;
  }

  .details-table {
    min-width: 800px;
  }
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 16px;
  background: #f8f9fa;
  border-radius: 10px;
}

.btn.delete {
  background-color: transparent;
  color: #dc3545;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn.delete:hover {
  background-color: rgba(220, 53, 69, 0.1);
  transform: translateY(-1px);
}

.editing-row {
  background-color: #f8f9fa !important;
}

.editing-row td {
  padding: 8px 15px !important;
}

.details-table td {
  transition: all 0.3s ease;
  padding: 12px 15px;
  vertical-align: middle;
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
  border-radius: 8px;
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
  gap: 12px;
}

.btn-cancel,
.btn-confirm-delete {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
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
</style>