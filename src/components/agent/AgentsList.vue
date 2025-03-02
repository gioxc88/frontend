<!-- src/components/agent/AgentsList.vue -->
<template>
  <div class="agents-list">
    <div class="agents-header">
      <h3>Agents</h3>

      <div class="agents-counter">
        <span class="badge">{{ agents.length }}</span>
      </div>
    </div>

    <p-divider class="compact-divider" />

    <div v-if="agents.length === 0" class="no-agents">
      <i class="pi pi-user-plus"></i>
      <p>No agents yet.<br>Add your first agent using the "+" button below.</p>
    </div>

    <div v-else class="agents-grid non-draggable">
      <AgentAvatar
        v-for="agent in agents"
        :key="agent.id"
        :agent="agent"
        :room-id="roomId"
      />
    </div>
  </div>
</template>

<script setup>
import AgentAvatar from './AgentAvatar.vue';

defineProps({
  agents: {
    type: Array,
    default: () => []
  },
  roomId: {
    type: String,
    required: true
  }
});
</script>

<style scoped>
.agents-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
}

.agents-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.25rem 0; /* Reduced from 0.5rem to 0.25rem */
  margin-bottom: 0; /* Added to remove extra space */
}

.agents-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.agents-counter .badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: var(--accent-purple);
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
}

/* Make divider more compact */
.compact-divider {
  margin: 0.25rem 0; /* Reduced spacing around divider */
}

:deep(.p-divider.p-divider-horizontal) {
  margin: 0.25rem 0; /* Override PrimeVue divider margins */
  padding: 0;
}

.no-agents {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 1rem 0; /* Reduced from 2rem to 1rem */
  color: var(--text-secondary);
}

.no-agents i {
  font-size: 2rem;
  margin-bottom: 0.5rem; /* Reduced from 1rem to 0.5rem */
  opacity: 0.7;
}

.no-agents p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
}

.agents-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem; /* Reduced from 1rem to 0.75rem */
  padding: 0.25rem 0; /* Reduced from 0.5rem to 0.25rem */
}

/* Adjust for smaller column width */
:deep(.agent-avatar) {
  width: 100%;
}

:deep(.avatar-circle) {
  margin: 0 auto;
}

:deep(.avatar-label) {
  text-align: center;
  font-size: 0.75rem;
  max-width: 100%;
  white-space: normal;
  word-wrap: break-word;
}
</style>
