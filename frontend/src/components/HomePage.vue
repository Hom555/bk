<template>
  <div class="home">
    <div class="content-wrapper">
      <!-- Stats Section -->
      <div class="dashboard-header">
        <div class="stats-grid">
          <div class="stat-card animate-in" style="--delay: 0.1s">
            <div class="stat-icon pulse">
              <i class="fas fa-calendar-check"></i>
            </div>
            <div class="stat-info">
              <h3>กิจกรรมทั้งหมด</h3>
              <div class="stat-value counter">{{ totalActivities }}</div>
              <div class="stat-change positive">
                <div class="trend-arrow">
                  <!-- <i class="fas fa-sync"></i> -->
                </div>
                <span>อัพเดตล่าสุด {{ lastUpdateTime }}</span>
              </div>
            </div>
            <div class="stat-bg-icon">
              <i class="fas fa-calendar-check"></i>
            </div>
          </div>

          <div class="stat-card animate-in" style="--delay: 0.2s">
            <div class="stat-icon pulse">
              <i class="fas fa-chart-line"></i>
            </div>
            <div class="stat-info">
              <h3>กิจกรรมเดือนนี้</h3>
              <div class="stat-value">
                <span>{{ currentMonthActivities }}</span>
                <div class="trend-badge" v-if="activityTrend > 0">
                  <i class="fas fa-arrow-up"></i>
                  +{{ activityTrend }}%
                </div>
              </div>
              <div class="stat-change">
                <i class="fas fa-clock"></i>
                <span>เดือน {{ currentMonth }}</span>
              </div>
            </div>
            <div class="stat-bg-icon">
              <i class="fas fa-chart-line"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions Section -->
      <div class="quick-actions">
        <div class="section-title animate-in" style="--delay: 0.4s">
          <!-- <h2></h2>
          <p>เครื่องมือที่ใช้งานบ่อย</p>
          <div class="title-underline"></div> -->
        </div>
        
        <div class="actions-grid">
          <div v-for="(action, index) in actions" 
               :key="index"
               class="action-card animate-in"
               :style="{ '--delay': `${0.5 + index * 0.1}s`, '--accent-color': action.color }"
               @click="navigateTo(action.path)">
            <div class="card-icon-wrapper">
              <div class="card-icon">
                <i :class="action.icon"></i>
              </div>
              <div class="icon-ring"></div>
            </div>
            <div class="card-content">
              <h3>{{ action.title }}</h3>
              <p>{{ action.description }}</p>
            </div>
            <div class="card-arrow">
              <i class="fas fa-arrow-right"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
import axios from 'axios';

export default {
  name: "HomePage",
  data() {
    return {
      totalActivities: 0,
      currentMonthActivities: 0,
      activityTrend: 0,
      lastUpdateTime: '',
      currentMonth: '',
      updateInterval: null,
      actions: [
        // {
        //   title: 'บันทึกกิจกรรม',
        //   description: 'เพิ่มกิจกรรมใหม่เข้าสู่ระบบ',
        //   icon: 'fas fa-edit',
        //   path: '/system-activities',
        //   color: '#460d54'
        // },
        // {
        //   title: 'อัพเดตข้อมูล',
        //   description: 'ปรับปรุงข้อมูลในระบบ',
        //   icon: 'fas fa-sync-alt',
        //   path: '/system_details',
        //   color: '#2c0845'
        // },
        // {
        //   title: 'ข้อมูลกิจกรรม',
        //   description: 'ดูรายการกิจกรรมทั้งหมด',
        //   icon: 'fas fa-list-alt',
        //   path: '/Dataactivities',
        //   color: '#6a11cb'
        // },
        // {
        //   title: 'ข้อมูลที่อัพเดต',
        //   description: 'ตรวจสอบการอัพเดตล่าสุด',
        //   icon: 'fas fa-database',
        //   path: '/DataDisplay',
        //   color: '#2575fc'
        // }
      ]
    }
  },
  methods: {
    async fetchActivityStats() {
      try {
        // ดึงข้อมูลกิจกรรมทั้งหมด
        const totalResponse = await axios.get('http://localhost:8088/api/activities/count');
        this.totalActivities = totalResponse.data.count;

        // ดึงข้อมูลกิจกรรมเดือนนี้
        const monthlyResponse = await axios.get('http://localhost:8088/api/activities/current-month');
        this.currentMonthActivities = monthlyResponse.data.count;
        this.activityTrend = monthlyResponse.data.trend;

        // อัพเดตเวลาล่าสุด
        const now = new Date();
        this.lastUpdateTime = now.toLocaleTimeString('th-TH');
        this.currentMonth = now.toLocaleString('th-TH', { month: 'long' });
      } catch (error) {
        console.error('Error fetching activity stats:', error);
      }
    },
    startAutoUpdate() {
      // อัพเดตข้อมูลทุก 5 นาที
      this.updateInterval = setInterval(this.fetchActivityStats, 300000);
    },
    navigateTo(path) {
      this.$router.push(path);
    }
  },
  mounted() {
    this.fetchActivityStats();
    this.startAutoUpdate();
  },
  beforeUnmount() {
    // ยกเลิก interval เมื่อออกจากหน้า
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
};
</script>

<style scoped>
/* Base Styles */
.home {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fc 0%, #f1f4f8 100%);
  padding: 2rem;
}

.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
}

/* Animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-in {
  opacity: 0;
  animation: slideIn 0.6s ease-out forwards;
  animation-delay: var(--delay, 0s);
}

/* Stats Cards */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: linear-gradient(145deg, #CE9700 0%, #CE9700 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.05),
    inset 0 0 0 1px rgba(255, 255, 255, 0.4);
  border-radius: 20px;
  padding: 1.8rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 
    0 8px 30px rgba(255, 255, 255, 0.1),
    inset 0 0 0 1px rgba(255, 255, 255, 0.5);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%);
  color: #626161;
  font-size: 1.5rem;
  position: relative;
  z-index: 2;
  box-shadow: 
    0 4px 15px rgba(105, 105, 105, 0.1),
    inset 0 0 0 1px rgba(255, 255, 255, 0.8);
}

.stat-bg-icon {
  position: absolute;
  right: -20px;
  bottom: -20px;
  font-size: 8rem;
  opacity: 0.05;
  color: #000000;
  transform: rotate(-15deg) scale(1.2);
  transition: all 0.3s ease;
}

.pulse {
  animation: pulse 3s infinite;
}

.rotating {
  animation: rotate 6s linear infinite;
}

/* Live Indicator */
.live-indicator {
  width: 8px;
  height: 8px;
  background: #48bb78;
  border-radius: 50%;
  display: inline-block;
  margin-right: 8px;
  position: relative;
}

.live-indicator::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background: inherit;
  border-radius: inherit;
  animation: pulse 2s infinite;
  opacity: 0.5;
  transform: scale(1.5);
}

/* Quick Actions */
.section-title {
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
}

.title-underline {
  width: 60px;
  height: 4px;
  background: linear-gradient(to right, #460d54, #2c0845);
  margin: 1rem auto 0;
  border-radius: 2px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.action-card {
  background: #7e1465;
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1.8rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.card-icon-wrapper {
  position: relative;
}

.icon-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  border: 2px solid var(--accent-color);
  border-radius: 50%;
  opacity: 0;
  transition: all 0.3s ease;
}

.action-card:hover .icon-ring {
  width: 70px;
  height: 70px;
  opacity: 0.2;
}

.card-arrow {
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
}

.action-card:hover .card-arrow {
  opacity: 1;
  transform: translateX(0);
}

/* Responsive Design */
@media (max-width: 768px) {
  .home {
    padding: 1rem;
  }

  .stats-grid, .actions-grid {
    grid-template-columns: 1fr;
  }

  .stat-card, .action-card {
    padding: 1.5rem;
  }
}

/* Additional Styles */
.shield-icon {
  color: #48bb78;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-right: 8px;
}

.stat-value {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
}

.stat-value i {
  font-size: 1.2rem;
}

.trend-badge {
  background: rgba(72, 187, 120, 0.1);
  color: #48bb78;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.live-pulse {
  width: 12px;
  height: 12px;
  background: #48bb78;
  border-radius: 50%;
  position: relative;
  margin-left: 10px;
}

.live-pulse::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background: inherit;
  border-radius: inherit;
  animation: pulse 2s infinite;
  opacity: 0.5;
  transform: scale(2);
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin: 8px 0;
}

.progress {
  height: 100%;
  background: linear-gradient(to right, #460d54, #2c0845);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.stat-card {
  background: linear-gradient(145deg, #7B105A 0%, #ffff 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 
    0 4px 20px rgba(183, 183, 183, 0.05),
    inset 0 0 0 1px rgba(255, 255, 255, 0.4);
}

.stat-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 
    0 8px 30px rgba(255, 254, 254, 0.1),
    inset 0 0 0 1px rgba(255, 255, 255, 0.5);
}

.stat-icon {
  background: linear-gradient(135deg, #f5f5f5 0%, #fffefe 100%);
  box-shadow: 
    0 4px 15px rgba(255, 255, 254, 0.3),
    inset 0 0 0 1px rgba(255, 255, 255, 0.1);
}

.stat-info h3 {
  color: #ffffff;
  font-weight: 600;
}

.stat-value {
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: 700;
}

.stat-change {
  color: rgba(255, 255, 255, 0.8);
}

.trend-badge {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.trend-arrow i {
  color: #ffffff;
}

/* Add smooth transitions */
.stat-card * {
  transition: all 0.3s ease;
}

/* Enhanced hover effects */
.stat-card:hover .stat-bg-icon {
  transform: rotate(-5deg) scale(1.3);
  opacity: 0.04;
}

.stat-card:hover .stat-icon {
  transform: scale(1.1);
}
</style>
