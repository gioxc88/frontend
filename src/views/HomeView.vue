<!-- src/views/HomeView.vue -->
<template>
  <div class="home-view">
    <div class="container mx-auto p-4">
      <div class="welcome-card cyber-border glass">
        <div class="hero-content">
          <h1 class="text-3xl font-bold mb-4">Welcome to InvestmentAI</h1>
          <p class="mb-6">Your futuristic investment platform powered by AI agents</p>

          <router-link to="/rooms" class="cta-button">
            <i class="pi pi-arrow-right"></i>
            Go to Investment Rooms
          </router-link>
        </div>

        <div class="stats-panel">
          <div class="stat-card">
            <h3>{{ roomsCount }}</h3>
            <p>Active Rooms</p>
          </div>

          <div class="stat-card">
            <h3>{{ agentsCount }}</h3>
            <p>AI Agents</p>
          </div>

          <div class="stat-card">
            <h3>{{ messagesCount }}</h3>
            <p>Generated Insights</p>
          </div>
        </div>
      </div>

      <div class="quick-actions">
        <h2 class="section-title">Quick Actions</h2>

        <div class="actions-grid">
          <router-link to="/rooms" class="action-card">
            <i class="pi pi-th-large"></i>
            <span>Investment Rooms</span>
          </router-link>

          <router-link to="/market" class="action-card">
            <i class="pi pi-chart-line"></i>
            <span>Market Data</span>
          </router-link>

          <div class="action-card" @click="createNewRoom">
            <i class="pi pi-plus"></i>
            <span>New Room</span>
          </div>

          <router-link to="/settings" class="action-card">
            <i class="pi pi-cog"></i>
            <span>Settings</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useRoomsStore } from '../stores/roomsStore';

const router = useRouter();
const roomsStore = useRoomsStore();
const { rooms } = storeToRefs(roomsStore);

// Statistics
const roomsCount = computed(() => rooms.value.length);

const agentsCount = computed(() => {
  return rooms.value.reduce((count, room) => {
    return count + (room.agents?.length || 0);
  }, 0);
});

const messagesCount = computed(() => {
  return rooms.value.reduce((count, room) => {
    return count + (room.conversation?.length || 0);
  }, 0);
});

// Actions
const createNewRoom = () => {
  // This will just navigate to rooms view
  // The actual room creation is handled by AddRoomButton
  router.push('/rooms');
};
</script>

<style scoped>
.home-view {
  min-height: calc(100vh - 64px);
  padding: 2rem 0;
  background-color: var(--bg-primary);
}

.welcome-card {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem;
  margin-bottom: 2rem;
  border-radius: var(--border-radius-lg);
  background-color: var(--bg-secondary);
  box-shadow: var(--shadow-md);
}

.hero-content {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.cta-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: var(--accent-purple);
  color: white;
  border-radius: var(--border-radius-md);
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
}

.cta-button:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-glow-purple);
}

.stats-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  padding: 1.5rem;
  background-color: var(--bg-tertiary);
  border-radius: var(--border-radius-md);
  text-align: center;
}

.stat-card h3 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(90deg, var(--accent-blue), var(--accent-purple));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-card p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 1rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 2rem 0 1rem 0;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius-md);
  text-decoration: none;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
  cursor: pointer;
  text-align: center;
}

.action-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  border-color: var(--accent-purple);
}

.action-card i {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: var(--accent-purple);
}

/* Responsive adjustments */
@media (min-width: 768px) {
  .welcome-card {
    padding: 3rem;
  }
}
</style>
