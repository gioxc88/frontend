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
        </div>

        <div class="message-time">
          {{ formattedTime }}
        </div>
      </div>

      <div class="message-text">
        <span v-if="message.agentId === 'user' || !shouldAnimate || isTypingComplete">{{ message.content }}</span>
        <span v-else>{{ displayedText }}<span class="typing-cursor"></span></span>
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
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { useAgentsStore } from '../../stores/agentsStore';

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
const displayedText = ref('');
const isTypingComplete = ref(false);
const typingTimeoutId = ref(null);

// Emit events
const emit = defineEmits(['typing-progress']);

// Should the message be animated?
const shouldAnimate = computed(() => {
  // Import the agents store to check session ID
  const agentsStore = useAgentsStore();

  // Only animate if:
  // 1. The message is from an agent (not user)
  // 2. The message has the current session ID (created during this browser session)
  // 3. The message is marked as new
  // 4. The agent is currently speaking
  return props.message.agentId !== 'user' &&
         props.message.sessionId === agentsStore.sessionId &&
         props.message.isNew === true &&
         currentAgentStatus.value === 'speaking';
});

// Get current agent status
const currentAgentStatus = computed(() => {
  const agent = props.agents.find(a => a.id === props.message.agentId);
  return agent ? agent.status : 'idle';
});

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

// Clean up any running animations
const clearTypingAnimation = () => {
  if (typingTimeoutId.value) {
    clearTimeout(typingTimeoutId.value);
    typingTimeoutId.value = null;
  }
};

// Typing animation
const startTyping = () => {
  // Clear any existing animation
  clearTypingAnimation();

  // Skip animation for user messages or old messages
  if (!shouldAnimate.value) {
    displayedText.value = props.message.content;
    isTypingComplete.value = true;
    return;
  }

  const fullText = props.message.content;
  displayedText.value = '';
  isTypingComplete.value = false;

  // Get the typing speed from the store or use a default
  const baseSpeed = 40; // Characters per second (higher = faster)

  // Calculate delay between characters (in milliseconds)
  const delay = 1000 / baseSpeed;

  let currentIndex = 0;

  // Function to type next character
  const typeNextChar = () => {
    // Check if we should stop the animation
    if (!shouldAnimate.value) {
      displayedText.value = fullText;
      isTypingComplete.value = true;
      return;
    }

    if (currentIndex < fullText.length) {
      // Add a batch of characters at once for faster typing
      const charsToAdd = Math.min(3, fullText.length - currentIndex);
      displayedText.value += fullText.substr(currentIndex, charsToAdd);
      currentIndex += charsToAdd;

      // Emit event for scroll adjustment
      emit('typing-progress');

      // Add variation to typing speed
      const variationFactor = 0.5 + Math.random(); // Between 0.5 and 1.5
      const nextDelay = delay * variationFactor;

      typingTimeoutId.value = setTimeout(typeNextChar, nextDelay);
    } else {
      // Typing is complete
      isTypingComplete.value = true;
      emit('typing-progress');
    }
  };

  // Start typing after a short initial delay
  typingTimeoutId.value = setTimeout(typeNextChar, 200);
};

// Watch for message or agent status changes and restart animation if needed
watch(() => [props.message, currentAgentStatus.value], () => {
  if (shouldAnimate.value && !isTypingComplete.value) {
    startTyping();
  } else if (!shouldAnimate.value && !isTypingComplete.value) {
    // If animation should stop, show the full message
    displayedText.value = props.message.content;
    isTypingComplete.value = true;
  }
}, { immediate: false, deep: true });

// Clean up when component unmounts
onUnmounted(() => {
  clearTypingAnimation();
});

// Start typing when component is mounted
onMounted(() => {
  if (shouldAnimate.value) {
    startTyping();
  } else {
    // Skip animation for non-animated messages
    displayedText.value = props.message.content;
    isTypingComplete.value = true;
  }
});
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

.typing-cursor {
  display: inline-block;
  width: 0.5rem;
  height: 1rem;
  background-color: var(--text-primary);
  margin-left: 2px;
  vertical-align: middle;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
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
