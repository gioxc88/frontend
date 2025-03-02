<!-- src/App.vue -->
<template>
  <div class="app-container">
    <NavBar />

    <main class="main-content">
      <router-view />
    </main>

    <!-- Global toast messages -->
    <p-toast />

    <!-- Global tooltips -->
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useThemeStore } from './stores/themeStore';
import NavBar from './components/layout/NavBar.vue';

const themeStore = useThemeStore();

onMounted(() => {
  // Initialize theme based on user preferences
  themeStore.initTheme();
});
</script>

<style>


.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  position: relative;
}
</style>
