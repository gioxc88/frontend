<!-- src/components/layout/ThemeToggle.vue -->
<template>
  <div class="theme-toggle">
    <button
      class="theme-toggle-button"
      @click="toggleTheme"
      :aria-label="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
    >
      <Transition name="fade" mode="out-in">
        <div v-if="isDarkMode" key="sun" class="theme-icon">
          <i class="pi pi-sun neon-text-yellow"></i>
        </div>
        <div v-else key="moon" class="theme-icon">
          <i class="pi pi-moon"></i>
        </div>
      </Transition>
    </button>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { useThemeStore } from '../../stores/themeStore';

const themeStore = useThemeStore();
const { isDarkMode } = storeToRefs(themeStore);
const { toggleTheme } = themeStore;
</script>

<style scoped>
.theme-toggle {
  position: relative;
}

.theme-toggle-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--bg-tertiary);
  border: none;
  cursor: pointer;
  transition: background-color var(--animation-speed),
              transform var(--animation-speed);
}

.theme-toggle-button:hover {
  transform: var(--hover-scale);
  background-color: var(--border-color);
}

.theme-toggle-button:active {
  transform: var(--active-scale);
}

.theme-icon {
  font-size: 1.2rem;
  color: var(--text-primary);
}

/* Animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>
