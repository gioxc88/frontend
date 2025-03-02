<!-- src/components/chat/ChatArea.vue -->
<template>
  <div class="chat-area">
    <div class="chat-header">
      <div class="chat-title">Agent Conversation</div>

      <div class="chat-controls">
        <p-button
          icon="pi pi-search"
          class="p-button-rounded p-button-text p-button-sm"
          v-tooltip.bottom="'Search conversation'"
        />
        <p-button
          icon="pi pi-filter"
          class="p-button-rounded p-button-text p-button-sm"
          v-tooltip.bottom="'Filter by agent'"
        />
        <p-button
          icon="pi pi-download"
          class="p-button-rounded p-button-text p-button-sm"
          v-tooltip.bottom="'Export conversation'"
        />
      </div>
    </div>

    <div
      ref="messagesContainer"
      class="chat-messages"
      :class="{ 'empty': conversation.length === 0 }"
      @scroll="handleScroll"
      @wheel="handleWheel"
      @touchmove="handleTouchMove"
    >
      <div v-if="conversation.length === 0" class="empty-chat">
        <div class="empty-illustration">
          <i class="pi pi-comments"></i>
        </div>
        <h3>No Conversation Yet</h3>
        <p>Start the simulation to see agents discuss investment strategies.</p>
      </div>

      <template v-else>
        <ChatMessage
          v-for="message in conversation"
          :key="message.id"
          :message="message"
          :agents="roomAgents"
          @typing-progress="handleTypingProgress"
        />
      </template>
    </div>

    <!-- Scroll to bottom button -->
    <div
      v-if="showScrollToBottom"
      class="scroll-to-bottom-button"
      @click="scrollToBottomImmediately"
    >
      <i class="pi pi-chevron-down"></i>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed, onMounted } from 'vue';
import { useRoomsStore } from '../../stores/roomsStore';
import ChatMessage from './ChatMessage.vue';

const props = defineProps({
  roomId: {
    type: String,
    required: true
  },
  conversation: {
    type: Array,
    default: () => []
  }
});

const roomsStore = useRoomsStore();
const messagesContainer = ref(null);
const shouldAutoScroll = ref(true);
const showScrollToBottom = ref(false);
const userJustScrolled = ref(false);
const scrollThreshold = 100; // px from bottom to consider "scrolled to bottom"
const lastScrollPosition = ref(0);

// Get room data for agent info
const roomAgents = computed(() => {
  const room = roomsStore.getRoomById(props.roomId);
  return room ? room.agents : [];
});

// Scroll to bottom of messages with animation
const scrollToBottom = () => {
  if (!messagesContainer.value || !shouldAutoScroll.value) return;

  nextTick(() => {
    const container = messagesContainer.value;
    container.scrollTop = container.scrollHeight;
  });
};

// Scroll to bottom without checking shouldAutoScroll flag
const scrollToBottomImmediately = () => {
  if (!messagesContainer.value) return;

  const container = messagesContainer.value;
  container.scrollTop = container.scrollHeight;
  shouldAutoScroll.value = true;
  showScrollToBottom.value = false;
};

// Check if we're near the bottom
const isNearBottom = () => {
  if (!messagesContainer.value) return true;

  const container = messagesContainer.value;
  const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
  return distanceFromBottom <= scrollThreshold;
};

// Handle scrolling events
const handleScroll = (event) => {
  if (!messagesContainer.value || userJustScrolled.value) return;

  const container = messagesContainer.value;
  const isAtBottom = isNearBottom();

  // Update auto-scroll flag
  shouldAutoScroll.value = isAtBottom;

  // Show/hide scroll to bottom button
  showScrollToBottom.value = !isAtBottom;

  // Save last scroll position
  lastScrollPosition.value = container.scrollTop;
};

// Handle mouse wheel events
const handleWheel = (event) => {
  // If user is scrolling up, disable auto-scroll
  if (event.deltaY < 0) {
    shouldAutoScroll.value = false;
    userJustScrolled.value = true;

    // Reset the flag after a short delay
    setTimeout(() => {
      userJustScrolled.value = false;
    }, 100);
  }
};

// Handle touch move events for mobile
const handleTouchMove = () => {
  if (!messagesContainer.value) return;

  const container = messagesContainer.value;
  const currentScrollTop = container.scrollTop;

  // If scrolling up
  if (currentScrollTop < lastScrollPosition.value) {
    shouldAutoScroll.value = false;
  }

  lastScrollPosition.value = currentScrollTop;
};

// Handle typing progress from ChatMessage components
const handleTypingProgress = () => {
  if (shouldAutoScroll.value) {
    scrollToBottom();
  }
};

// When the conversation changes
watch(() => props.conversation.length, () => {
  const isAtBottom = isNearBottom();

  // Only auto scroll if we were already at the bottom
  if (isAtBottom) {
    shouldAutoScroll.value = true;
    scrollToBottom();
  } else {
    // If we're not at the bottom, show the scroll to bottom button
    showScrollToBottom.value = true;
  }
});

// Watch for agent status changes to detect when agents are typing
watch(() => roomAgents.value.map(agent => agent.status), () => {
  const hasTypingAgent = roomAgents.value.some(agent =>
    agent.status === 'thinking' || agent.status === 'speaking'
  );

  if (hasTypingAgent && shouldAutoScroll.value) {
    scrollToBottom();
  }
}, { deep: true });

// Initial scroll to bottom
onMounted(() => {
  scrollToBottom();
});
</script>

<style scoped>
.chat-area {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  position: relative;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.35rem 0.75rem; /* Reduced vertical padding from 0.75rem to 0.35rem */
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  height: 40px; /* Fixed height to make it narrower */
  min-height: 40px; /* Ensure minimum height */
}

.chat-title {
  font-weight: 600;
  font-size: 0.9rem; /* Reduced from 1rem to 0.9rem */
}

.chat-controls {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background-color: var(--bg-primary);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  scroll-behavior: smooth; /* Enable smooth scrolling */
}

.chat-messages.empty {
  align-items: center;
  justify-content: center;
}

.empty-chat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  max-width: 300px;
  padding: 2rem 0;
}

.empty-illustration {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.empty-illustration i {
  font-size: 2.5rem;
  color: var(--text-secondary);
}

.empty-chat h3 {
  margin: 0 0 0.5rem 0;
  font-weight: 600;
}

.empty-chat p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
}

.scroll-to-bottom-button {
  position: absolute;
  right: 1rem;
  bottom: 1rem;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--accent-purple);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease, opacity 0.2s ease;
  z-index: 5;
}

.scroll-to-bottom-button:hover {
  transform: translateY(-2px);
}
</style>
