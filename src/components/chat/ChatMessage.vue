<!-- src/components/chat/ChatMessage.vue -->
<template>
  <div
    class="chat-message"
    :class="{ 'expanded': isExpanded }"
  >
    <div
      class="message-avatar"
      :style="{
        backgroundColor: agentColor || 'var(--accent-purple)'
      }"
    >
      <i v-if="agentIcon" :class="agentIcon"></i>
      <span v-else>{{ agentInitial }}</span>
    </div>

    <div class="message-content">
      <div class="message-header">
        <div class="agent-info">
          <span class="agent-name">{{ message.agentName }}</span>
          <span class="agent-type">{{ agentTypeLabel }}</span>
        </div>

        <div class="message-time">
          {{ formattedTime }}
        </div>
      </div>

      <div class="message-text">
        {{ message.content }}
      </div>

      <div class="message-actions">
        <button
          class="action-button"
          @click="copyMessage"
          v-tooltip.bottom="'Copy message'"
        >
          <i class="pi pi-copy"></i>
        </button>

        <button
          class="action-button"
          @click="toggleExpand"
        >
          <i :class="isExpanded ? 'pi pi-minus' : 'pi pi-plus'"></i>
          {{ isExpanded ? 'Less' : 'More' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  message: {
    type: Object,
    required: true
  },
  agents: {
    type: Array,
    default: () => []
  }
});

// UI state
const isExpanded = ref(false);

// Get agent information
const agentData = computed(() => {
  return props.agents.find(agent => agent.id === props.message.agentId) || {};
});

const agentIcon = computed(() => {
  return agentData.value.avatar;
});

const agentColor = computed(() => {
  return agentData.value.color;
});

const agentInitial = computed(() => {
  return props.message.agentName?.charAt(0) || 'A';
});

const agentTypeLabel = computed(() => {
  const agentType = props.message.agentType;
  return agentType?.split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
});

// Format timestamp
const formattedTime = computed(() => {
  if (!props.message.timestamp) return '';

  try {
    const date = new Date(props.message.timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return '';
  }
});

// Actions
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

const copyMessage = () => {
  navigator.clipboard.writeText(props.message.content)
    .then(() => {
      // Could show a toast notification here
      console.log('Message copied to clipboard');
    })
    .catch(err => {
      console.error('Failed to copy: ', err);
    });
};
</script>

<style scoped>
.chat-message {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: var(--border-radius-lg);
  background-color: var(--bg-secondary);
  transition: all 0.3s ease;
  max-width: 95%;
  align-self: flex-start;
}

.chat-message:hover {
  box-shadow: var(--shadow-sm);
}

.message-avatar {
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.agent-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.agent-name {
  font-weight: 600;
  font-size: 0.9rem;
}

.agent-type {
  font-size: 0.8rem;
  color: var(--text-secondary);
  background-color: var(--bg-tertiary);
  padding: 0.1rem 0.5rem;
  border-radius: 50px;
}

.message-time {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.message-text {
  font-size: 0.95rem;
  line-height: 1.5;
  white-space: pre-wrap;
  overflow-wrap: break-word;
}

.message-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.chat-message:hover .message-actions,
.chat-message.expanded .message-actions {
  opacity: 1;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius-sm);
  transition: all 0.2s ease;
}

.action-button:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

.action-button i {
  font-size: 0.9rem;
}

/* Expanded state styles */
.chat-message.expanded {
  background-color: var(--bg-secondary);
  border-left: 3px solid var(--accent-purple);
}

.chat-message.expanded .message-text {
  margin-bottom: 0.5rem;
}

/* Mobile responsiveness */
@media (max-width: 640px) {
  .chat-message {
    max-width: 100%;
  }

  .message-actions {
    opacity: 1;
  }
}
</style>
