<!-- src/components/agent/AddAgentButton.vue -->
<template>
  <div class="add-agent-container">
    <button
      ref="addButtonRef"
      class="add-agent-button non-draggable"
      @click="toggleAgentTypes"
      :aria-label="'Add agent'"
    >
      <i class="pi pi-plus"></i>
      <span>Add Agent</span>
    </button>

    <p-dialog
      v-model:visible="showAgentTypes"
      header="Select Agent Type"
      :modal="true"
      :closable="true"
      :closeOnEscape="true"
      class="agent-picker-dialog"
      position="center"
      @hide="showAgentTypes = false"
    >
      <div class="agent-types-grid">
        <div
          v-for="(info, type) in agentTypes"
          :key="type"
          class="agent-type-card"
          @click="addAgent(type)"
          :style="{ '--agent-color': info.color }"
        >
          <div class="agent-icon">
            <i :class="info.icon"></i>
          </div>

          <div class="agent-info">
            <h4>{{ info.title }}</h4>
            <p>{{ info.description }}</p>
          </div>

          <div class="expertise-tags">
            <span
              v-for="(skill, index) in info.expertise.slice(0, 2)"
              :key="index"
              class="expertise-tag"
            >
              {{ skill }}
            </span>
            <span
              v-if="info.expertise.length > 2"
              class="expertise-more"
            >
              +{{ info.expertise.length - 2 }}
            </span>
          </div>

          <i class="pi pi-plus-circle add-icon"></i>
        </div>
      </div>
    </p-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAgentsStore } from '@/stores/agentsStore';

const props = defineProps({
  roomId: {
    type: String,
    required: true
  }
});

const agentsStore = useAgentsStore();
const showAgentTypes = ref(false);
const addButtonRef = ref(null);

// Get agent types from store
const agentTypes = computed(() => agentsStore.agentTypes);

// Toggle dialog
const toggleAgentTypes = () => {
  showAgentTypes.value = !showAgentTypes.value;
};

// Add agent to room
const addAgent = (agentType) => {
  agentsStore.addAgent(props.roomId, agentType);
  showAgentTypes.value = false;
};
</script>

<style scoped>
.add-agent-container {
  margin-top: auto;
  padding: 0.5rem 0;
}

.add-agent-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.75rem;
  background-color: var(--bg-secondary);
  color: var(--accent-purple);
  border: 1px dashed var(--border-color);
  border-radius: var(--border-radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-agent-button:hover {
  background-color: var(--bg-tertiary);
  border-color: var(--accent-purple);
}

.add-agent-button i {
  margin-right: 0.5rem;
}

/* Agent picker dialog */
.agent-picker-dialog {
  max-width: 90vw;
  width: 650px;
}

.agent-types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  padding: 0.5rem;
}

.agent-type-card {
  position: relative;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-tertiary);
  border-radius: var(--border-radius-md);
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 4px solid var(--agent-color, var(--accent-purple));
}

.agent-type-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.agent-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--border-radius-md);
  background-color: var(--agent-color, var(--accent-purple));
  color: white;
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
}

.agent-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.agent-info p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.expertise-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.expertise-tag {
  font-size: 0.8rem;
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
  padding: 0.25rem 0.5rem;
  border-radius: 50px;
}

.expertise-more {
  font-size: 0.8rem;
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
  padding: 0.25rem 0.5rem;
  border-radius: 50px;
  opacity: 0.7;
}

.add-icon {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  font-size: 1.25rem;
  color: var(--agent-color, var(--accent-purple));
  opacity: 0;
  transition: opacity 0.2s ease;
}

.agent-type-card:hover .add-icon {
  opacity: 1;
}

/* Dark theme styling */
.dark-theme .agent-type-card {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

.dark-theme .agent-type-card:hover {
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.3);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .agent-types-grid {
    grid-template-columns: 1fr;
  }
}
</style>
