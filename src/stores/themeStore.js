// src/stores/themeStore.js
import { defineStore } from 'pinia';

export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDarkMode: false
  }),

  actions: {
    toggleTheme() {
      this.isDarkMode = !this.isDarkMode;
      this.applyTheme();
      // Save preference to localStorage
      localStorage.setItem('darkMode', this.isDarkMode);
    },

    initTheme() {
      // Check for saved preference or system preference
      const savedTheme = localStorage.getItem('darkMode');

      if (savedTheme !== null) {
        this.isDarkMode = savedTheme === 'true';
      } else {
        // Check system preference
        this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      this.applyTheme();

      // Add listener for system theme changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (localStorage.getItem('darkMode') === null) {
          this.isDarkMode = e.matches;
          this.applyTheme();
        }
      });
    },

    applyTheme() {
      // Apply theme to document body
      if (this.isDarkMode) {
        document.documentElement.classList.add('dark-theme');
        // No need to set data-p-theme attribute as PrimeVue will detect dark-theme class
      } else {
        document.documentElement.classList.remove('dark-theme');
      }
    }
  }
});
