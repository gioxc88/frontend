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
        />
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue';
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

// Get room data for agent info
const roomAgents = computed(() => {
  const room = roomsStore.getRoomById(props.roomId);
  return room ? room.agents : [];
});

// Auto-scroll to bottom when new messages arrive
watch(() => props.conversation.length, async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
});
</script>

<style scoped>
.chat-area {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
}

.chat-title {
  font-weight: 600;
  font-size: 1rem;
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
</style>
