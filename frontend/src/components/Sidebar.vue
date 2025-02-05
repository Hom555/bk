<!-- Sidebar.vue -->
<template>
  <div>
    <!-- ปุ่ม Toggle Sidebar -->
    <button class="toggle-sidebar-btn" @click="toggleSidebar">
      <i class="fas" :class="sidebarOpen ? 'fa-times' : 'fa-bars'"></i>
    </button>

    <!-- Sidebar -->
    <div class="sidebar" :class="{ open: sidebarOpen }">
      <div class="logo-container">
        <img :src="logoSrc" alt="Logo" class="logo" />
        <div class="app-info">
          <!-- <h1 class="app-title">การไฟฟ้าส่วนภูมิภาค</h1>
          <p class="app-subtitle">ระบบอัปเดตข้อมูลบันทึกกิจกรรม</p> -->
        </div>
      </div>

      <div class="menu-container">
        <ul>
          <li>
            <router-link to="/" class="sidebar-link" exact-active-class="active">
              <i class="fas fa-home"></i>
              <span>หน้าแรก</span>
            </router-link>
          </li>

          <li>
            <router-link to="/UserManual" class="sidebar-link" exact-active-class="active">
                  <i class="fas fa-book"></i>
              <span>คู่มือการใช้งาน</span>
            </router-link>
          </li>

          <li>
            <div
              class="sidebar-link expandable"
              @click="toggleSubMenu('systemMenu')"
              :class="{ active: subMenus.systemMenu }"
            >
              <i class="fas fa-cogs"></i>
              <span>ข้อมูลระบบ</span>
              <i class="fas fa-chevron-right toggle-icon" :class="{ rotated: subMenus.systemMenu }"></i>
            </div>
            <transition name="slide-fade">
              <ul v-show="subMenus.systemMenu" class="sub-menu">
                <li>
                  <router-link to="/datasystemrecord" class="sidebar-link">
                    <i class="fas fa-list-alt"></i>
                    <span>รายการระบบ</span>
                  </router-link>
                </li>
              </ul>
            </transition>
          </li>

          <li>
            <div
              class="sidebar-link expandable"
              @click="toggleSubMenu('updateDataMenu')"
              :class="{ active: subMenus.updateDataMenu }"
            >
              <i class="fas fa-sync-alt"></i>
              <span>อัพเดตข้อมูล</span>
              <i class="fas fa-chevron-right toggle-icon" :class="{ rotated: subMenus.updateDataMenu }"></i>
            </div>
            <transition name="slide-fade">
              <ul v-show="subMenus.updateDataMenu" class="sub-menu">
                <li>
                  <router-link to="/system_details" class="sidebar-link">
                    <i class="fas fa-upload"></i>
                    <span>อัพเดตข้อมูล</span>
                  </router-link>
                </li>
                <li>
                  <router-link to="/DataDisplay" class="sidebar-link">
                    <i class="fas fa-database"></i>
                    <span>ข้อมูลที่อัพเดต</span>
                  </router-link>
                </li>
              </ul>
            </transition>
          </li>

          <li>
            <div
              class="sidebar-link expandable"
              @click="toggleSubMenu('activityMenu')"
              :class="{ active: subMenus.activityMenu }"
            >
              <i class="fas fa-calendar-check"></i>
              <span>กิจกรรม</span>
              <i class="fas fa-chevron-right toggle-icon" :class="{ rotated: subMenus.activityMenu }"></i>
            </div>
            <transition name="slide-fade">
              <ul v-show="subMenus.activityMenu" class="sub-menu">
                <li>
                  <router-link to="/system-activities" class="sidebar-link">
                    <i class="fas fa-edit"></i>
                    <span>บันทึกกิจกรรม</span>
                  </router-link>
                </li>
                <li>
                  <router-link to="/Dataactivities" class="sidebar-link">
                    <i class="fas fa-list"></i>
                    <span>ข้อมูลกิจกรรม</span>
                  </router-link>
                </li>
              </ul>
            </transition>
          </li>
        </ul>
      </div>

      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">
            <i class="fas fa-user"></i>
          </div>
          <div class="user-details">
            <div class="user-name">{{ fullName }}</div>
            <div class="user-role">{{ department }}</div>
          </div>
        </div>
        <a href="#" class="logout-link" @click.prevent="handleLogout">
          <i class="fas fa-sign-out-alt"></i>
          <span>ออกจากระบบ</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "AppSidebar",
  data() {
    return {
      logoSrc: require("@/assets/logo.png"),
      sidebarOpen: false,
      subMenus: {
        systemMenu: false,
        updateDataMenu: false,
        activityMenu: false,
      },
      userData: {
        fullName: "",
        department: "",
        empId: null,
      },
    };
  },
  async created() {
    try {
      const response = await axios.get("http://localhost:3004/api/data", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data?.data?.dataDetail?.length > 0) {
        const user = response.data.data.dataDetail[0];
        if (user.emp_id) {
          this.userData = {
            fullName: `${user.title_s_desc || ""}${user.first_name} ${user.last_name}`,
            department: user.dept_full || "ไม่ระบุแผนก",
            empId: user.emp_id,
          };
        }
      } else {
        console.warn("ไม่พบข้อมูลผู้ใช้งานหรือข้อมูลว่าง");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        console.error("Token หมดอายุ กรุณาเข้าสู่ระบบใหม่");
        this.$router.push("/login");
      } else {
        console.error("เกิดข้อผิดพลาด:", error.response?.data || error.message);
      }
    }
  },
  computed: {
    fullName() {
      return this.userData.empId ? this.userData.fullName : "ไม่พบชื่อผู้ใช้งาน";
    },
    department() {
      return this.userData.empId ? this.userData.department : "ไม่พบแผนก";
    },
  },
  methods: {
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen;
    },
    toggleSubMenu(menu) {
      Object.keys(this.subMenus).forEach((key) => {
        if (key !== menu) this.subMenus[key] = false;
      });
      this.subMenus[menu] = !this.subMenus[menu];
    },
    handleLogout() {
      if (confirm("ต้องการออกจากระบบใช่หรือไม่?")) {
        localStorage.removeItem("token");
        this.$router.push("/login").catch((err) =>
          console.error("Error navigating to login:", err)
        );
      }
    },
  },
};
</script>

<style scoped>
.sidebar {
  width: 280px;
  background: #7e1465;
  color: white;
  position: fixed;
  height: 100vh;
  box-shadow: 2px 0px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  left: 0;
  top: 0;
  z-index: 1000;
}

.logo-container {
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #7e1465;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  height: 80px;
}

.logo {
  width: 100%;
  height: 100%;
  padding: 12px 25px;
  object-fit: contain;
  background: white;
  border-radius: 0;
  transition: all 0.3s ease;
  transform: scale(1.02);
}

.logo:hover {
  transition: all 0.3s ease;
  transform: scale(1.02);
}

.app-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  margin-bottom: 4px;
}

.app-subtitle {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

.menu-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px 12px;
}

.menu-container ul,
.menu-container ul li {
  list-style-type: none; /* เอาจุดออก */
  margin: 0;
  padding: 0;
}

.sidebar-link {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  border-radius: 8px;
  margin: 4px 0;
  background: transparent;
}

.sidebar-link i {
  font-size: 1.2rem;
  min-width: 35px;
  opacity: 0.9;
  transition: all 0.3s ease;
}

.sidebar-link span {
  flex: 1;
}

.toggle-icon {
  font-size: 0.8rem;
  margin-right: 5px;
  transition: transform 0.3s ease;
}

.toggle-icon.rotated {
  transform: rotate(90deg);
}

.sidebar-link:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  transform: translateX(5px);
}

.sidebar-link.active {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #ffffff;
}

.sidebar-link.active::before {
  content: none;
}

.expandable {
  cursor: pointer;
}

.sub-menu {
  background: rgba(0, 0, 0, 0.15);
  margin: 4px 8px;
  border-radius: 8px;
  padding: 4px;
}

.sub-menu .sidebar-link {
  padding-left: 48px;
  margin-bottom: 2px;
}

.sidebar-footer {
  padding: 20px;
  background: rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.user-avatar {
  width: 45px;
  height: 45px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.user-avatar i {
  color: #ffffff;
  font-size: 1.2rem;
}

.user-details {
  flex: 1;
}

.user-name {
  color: #ffffff;
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 4px;
}

.user-role {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.85rem;
  line-height: 1.4;
}

.logout-link {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin-top: 15px;
  background: rgba(255, 71, 87, 0.15);
  border-radius: 8px;
  color: #ffffff;
  text-decoration: none;
  transition: all 0.3s ease;
  font-weight: 500;
}

.logout-link:hover {
  background: rgba(255, 71, 87, 0.25);
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(255, 71, 87, 0.2);
}

.logout-link i {
  margin-right: 10px;
  font-size: 1.1rem;
}

/* Animation */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

/* ปรับ responsive design */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .main-content {
    margin-left: 0;
  }
}

/* เพิ่ม scrollbar style */
.menu-container::-webkit-scrollbar {
  width: 5px;
}

.menu-container::-webkit-scrollbar-track {
  background: transparent;
}

.menu-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.menu-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* เพิ่ม style เพื่อให้ข้อความแสดงผลสวยงาม */
.user-name, .user-role {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.85rem;
  line-height: 1.4;
}
</style>