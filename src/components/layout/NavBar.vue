<!-- src/components/layout/NavBar.vue -->
<template>
  <header class="navbar shadow-md transition-all">
    <div class="container mx-auto px-4 h-16 flex items-center justify-between">
      <!-- Logo and title -->
      <div class="flex items-center gap-md">
        <router-link to="/" class="logo flex items-center gap-sm">
          <div class="logo-icon">
            <i class="pi pi-chart-line text-2xl neon-text-purple"></i>
          </div>
          <h1 class="text-xl font-bold">InvestmentAI</h1>
        </router-link>

        <div class="cyber-line w-32 hidden md:block"></div>
      </div>

      <!-- Navigation links -->
      <nav class="main-nav hidden md:flex items-center gap-lg">
        <router-link to="/" class="nav-link">Dashboard</router-link>
        <router-link to="/rooms" class="nav-link">Investment Rooms</router-link>
<!--        <router-link to="/market" class="nav-link">Market Data</router-link>-->
<!--        <router-link to="/settings" class="nav-link">Settings</router-link>-->
      </nav>

      <!-- Right side controls -->
      <div class="flex items-center gap-md">
        <p-button
          icon="pi pi-bell"
          class="p-button-rounded p-button-text"
          :value="3"
          badge-class="p-badge-danger"
        />

        <ThemeToggle />

        <!-- Mobile menu button -->
        <p-button
          icon="pi pi-bars"
          class="p-button-rounded p-button-text md:hidden"
          @click="toggleMobileMenu"
        />
      </div>
    </div>

    <!-- Mobile menu -->
    <Transition name="slide">
      <div v-if="mobileMenuOpen" class="mobile-menu md:hidden">
        <div class="container mx-auto p-4 cyber-border glass-dark">
          <div class="flex flex-col gap-md">
            <router-link
              v-for="link in navLinks"
              :key="link.path"
              :to="link.path"
              class="nav-link mobile-nav-link"
              @click="mobileMenuOpen = false"
            >
              <i :class="link.icon"></i>
              {{ link.label }}
            </router-link>
          </div>
        </div>
      </div>
    </Transition>
  </header>
</template>

<script setup>
import { ref } from 'vue';
import ThemeToggle from './ThemeToggle.vue';

const mobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const navLinks = [
  { path: '/', label: 'Dashboard', icon: 'pi pi-home' },
  { path: '/rooms', label: 'Investment Rooms', icon: 'pi pi-th-large' },
  // { path: '/market', label: 'Market Data', icon: 'pi pi-chart-line' },
  // { path: '/settings', label: 'Settings', icon: 'pi pi-cog' }
];
</script>

<style scoped>
.navbar {
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
}

.logo {
  text-decoration: none;
  color: var(--text-primary);
}

.logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--bg-tertiary);
  color: var(--accent-purple);
}

.nav-link {
  position: relative;
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 0.75rem;
  border-radius: var(--border-radius-md);
  transition: color var(--animation-speed),
              background-color var(--animation-speed);
}

.nav-link:hover, .nav-link.router-link-active {
  color: var(--text-primary);
  background-color: var(--bg-tertiary);
}

.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(
    90deg,
    var(--accent-purple),
    var(--accent-blue)
  );
  border-radius: 2px;
}

.mobile-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: var(--z-dropdown);
  padding: 1rem;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: var(--border-radius-md);
}

/* Animation transitions */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>
