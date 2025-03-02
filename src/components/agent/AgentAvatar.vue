<!-- src/components/agent/AgentAvatar.vue -->
<template>
  <div
    class="agent-avatar"
    :class="{
      'thinking': agent.status === 'thinking',
      'speaking': agent.status === 'speaking'
    }"
    :style="{
      '--agent-color': agent.color || '#8b5cf6'
    }"
  >
    <div class="avatar-circle">
      <i v-if="agent.avatar" :class="agent.avatar"></i>
      <span v-else>{{ agentInitial }}</span>

      <div class="status-indicator" :class="agent.status"></div>

      <!-- Remove button -->
      <button
        class="remove-button non-draggable"
        @click.stop="removeAgent"
        title="Remove agent"
      >
        <i class="pi pi-times"></i>
      </button>
    </div>

    <div class="avatar-label">{{ agent.name }}</div>

    <div v-if="agent.status === 'thinking'" class="thinking-animation">
      <span></span>
      <span></span>
      <span></span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useAgentsStore } from '@/stores/agentsStore';

const props = defineProps({
  agent: {
    type: Object,
    required: true
  },
  roomId: {
    type: String,
    required: true
  }
});

const agentsStore = useAgentsStore();

// Computed values
const agentInitial = computed(() => {
  return props.agent.name?.charAt(0) || 'A';
});

// Controls visibility
const showControls = ref(false);

// Event handlers
const removeAgent = () => {
  agentsStore.removeAgent(props.roomId, props.agent.id);
};
</script>

<style scoped>
.agent-avatar {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  transition: transform 0.3s ease;
}

.agent-avatar:hover {
  transform: translateY(-3px);
}

.avatar-circle {
  position: relative;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background-color: var(--agent-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.avatar-label {
  font-size: 0.8rem;
  font-weight: 500;
  text-align: center;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Status indicator */
.status-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: var(--bg-secondary);
  border: 2px solid var(--bg-secondary);
}

.status-indicator.idle {
  background-color: var(--bg-tertiary);
}

.status-indicator.thinking {
  background-color: var(--accent-yellow);
}

.status-indicator.speaking {
  background-color: var(--accent-green);
}

/* Speaking animation */
.agent-avatar.speaking .avatar-circle {
  box-shadow: 0 0 0 4px rgba(var(--agent-color), 0.3);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(52, 211, 153, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(52, 211, 153, 0);
  }
}

/* Thinking animation */
.thinking-animation {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  margin-top: -3px;
}

.thinking-animation span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--text-secondary);
  animation: bounce 1.4s infinite ease-in-out both;
}

.thinking-animation span:nth-child(1) {
  animation-delay: -0.32s;
}

.thinking-animation span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.remove-button {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: var(--accent-red);
  color: white;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease, transform 0.2s ease;
  z-index: 2;
}

.agent-avatar:hover .remove-button {
  opacity: 1;
}

.remove-button:hover {
  transform: scale(1.1);
}

/* Remove avatar-controls since we're replacing it */
.avatar-controls {
  display: none;
}
</style>
