<template>
  <div id="app">
    <AppSidebar />
    <!-- Sidebar ที่ใช้ในทุกหน้า -->
    <div class="content">
      <router-view />
      <!-- เนื้อหาของแต่ละหน้า -->
    </div>
  </div>

</template>

<script>
import AppSidebar from "./components/Sidebar.vue";
import Footer from "./components/Footer.vue";


export default {
  name: "App",
  components: {
    AppSidebar, Footer,
    // ไม่ต้องลงทะเบียน HomePage ที่นี่
  },
};
</script> 
<style scoped>
#app {
  display: flex;
}

.content {
  margin-left: 220px; /* เพื่อให้เนื้อหาหลักไม่ทับ Sidebar */
  padding: 20px;
  flex-grow: 1;
}
</style>

<style>
@import 'vue-toastification/dist/index.css';
</style>
