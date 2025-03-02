<!-- src/components/room/RoomComponent.vue -->
<template>
  <div
    ref="roomRef"
    class="room-container cyber-border"
    :class="{ 'active': isActive }"
    @click.stop="activateRoom"
  >
    <!-- Room Header -->
    <RoomHeader
      :title="room.title"
      :room-id="room.id"
      @title-change="updateRoomTitle"
      @remove="$emit('remove')"
    />

    <!-- Room Content -->
    <div class="room-content">
      <!-- Agents Column -->
      <div class="agents-column">
        <AgentsList
          :room-id="room.id"
          :agents="room.agents"
        />

        <AddAgentButton :room-id="room.id" />
      </div>

      <!-- Chat Column -->
      <div class="chat-column">
        <ChatArea
          :room-id="room.id"
          :conversation="room.conversation || []"
        />

        <!-- User Interaction Controls -->
        <div class="user-interaction-controls non-draggable">
          <div class="user-input-container">
            <textarea
              v-model="userMessage"
              placeholder="Ask agents a question..."
              class="user-input"
              @keydown.enter.exact.prevent="sendMessage"
              rows="3"
            ></textarea>

            <div class="input-actions">
              <p-button
                v-if="!isSimulationRunning"
                icon="pi pi-play"
                class="p-button-text p-button-sm"
                @click="startSimulation"
                v-tooltip.top="'Start agent conversation'"
              />
              <p-button
                v-else
                icon="pi pi-pause"
                class="p-button-text p-button-sm"
                @click="pauseSimulation"
                v-tooltip.top="'Pause conversation'"
              />

              <p-button
                icon="pi pi-send"
                class="p-button-primary send-button"
                @click="sendMessage"
                :disabled="!userMessage.trim()"
                v-tooltip.top="'Send message to agents'"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoomsStore } from '@/stores/roomsStore';
import { useAgentsStore } from '@/stores/agentsStore';
import RoomHeader from './RoomHeader.vue';
import AgentsList from '@/components/agent/AgentsList.vue';
import AddAgentButton from '@/components/agent/AddAgentButton.vue';
import ChatArea from '@/components/chat/ChatArea.vue';

const props = defineProps({
  roomId: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['activate', 'remove']);

// Stores
const roomsStore = useRoomsStore();
const agentsStore = useAgentsStore();

// Get room data from store
const room = computed(() => roomsStore.getRoomById(props.roomId) || {
  id: props.roomId,
  title: 'Loading...',
  agents: [],
  conversation: []
});

// Simulation state
const { isSimulationRunning } = storeToRefs(agentsStore);
const simulationSpeed = ref(1);

// User interaction
const userMessage = ref('');

// DOM refs
const roomRef = ref(null);

// Room activation
const activateRoom = () => {
  emit('activate');
};

// Room title update
const updateRoomTitle = (newTitle) => {
  roomsStore.updateRoom(props.roomId, { title: newTitle });
  roomsStore.saveRooms();
};

// Send a message from the user to the agents
const sendMessage = () => {
  if (!userMessage.value.trim()) return;

  // In a real implementation, this would add the user's message to the conversation
  // and potentially trigger agent responses based on the user's input

  // For now, we'll simulate by adding a user message to the conversation
  if (!room.value.conversation) {
    roomsStore.updateRoom(props.roomId, { conversation: [] });
  }

  const newMessage = {
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    agentId: 'user',
    agentName: 'You',
    agentType: 'USER',
    timestamp: new Date().toISOString(),
    content: userMessage.value
  };

  roomsStore.updateRoom(props.roomId, {
    conversation: [...room.value.conversation, newMessage]
  });

  // Clear the input
  userMessage.value = '';

  // Save changes
  roomsStore.saveRooms();

  // This would potentially trigger agent responses in a real implementation
  // For now, we'll just start the simulation if it's not already running
  if (!isSimulationRunning.value) {
    startSimulation();
  }
};

// Simulation controls
const startSimulation = () => {
  agentsStore.startSimulation(props.roomId);
};

const pauseSimulation = () => {
  agentsStore.pauseSimulation();
};

const updateSimulationSpeed = () => {
  agentsStore.setSimulationSpeed(simulationSpeed.value);
};

// Initial setup
onMounted(() => {
  // If room is active on mount, add visual indication
  if (props.isActive) {
    roomRef.value?.classList.add('active');
  }
});
</script>

<style scoped>
.room-container {
  position: relative;
  background-color: var(--bg-secondary);
  box-shadow: var(--shadow-md);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-width: 0; /* Prevents contents from forcing container to expand */
  transition: box-shadow 0.3s ease;
}

.room-container:hover {
  box-shadow: var(--shadow-lg);
}

.room-container.active {
  box-shadow: 0 0 0 2px var(--accent-purple), var(--shadow-lg);
}

.dark-theme .room-container.active {
  box-shadow: 0 0 0 2px var(--accent-purple), var(--glow-purple);
}

.room-content {
  display: flex;
  flex: 1;
  overflow: hidden;
  min-width: 0; /* Prevents contents from forcing container to expand */
}

.agents-column {
  /*
    Make sure this matches the width set in AgentsList.vue
    The value should be the same as --agents-column-width in AgentsList
  */
  width: 110px;
  flex-shrink: 0; /* Prevents this column from shrinking below set width */
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  padding: 0.5rem;
  background-color: var(--bg-tertiary);
  overflow: visible; /* Allow AgentsList to handle its own scrolling */
}

.chat-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0; /* Prevents contents from forcing container to expand */
}

/* New user interaction controls */
.user-interaction-controls {
  border-top: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  padding: 0.75rem;
}

.user-input-container {
  display: flex;
  gap: 0.5rem;
}

.user-input {
  flex: 1;
  min-width: 0;
  border-radius: var(--border-radius-md);
  padding: 0.5rem;
  resize: none; /* Prevent manual resizing */
  height: 70px; /* Fixed height for the textarea */
  overflow-y: auto; /* Enable scrolling for overflow text */
  border: 1px solid var(--border-color);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: inherit;
  line-height: 1.5;
}

.user-input:focus {
  outline: none;
  border-color: var(--accent-purple);
  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.25);
}

.input-actions {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.send-button {
  border-radius: var(--border-radius-md);
}

/* Medium screens adjustments */
@media (max-width: 900px) {
  .agents-column {
    width: 100px; /* Slightly narrower on medium screens */
  }
}

/* Small screens adjustments */
@media (max-width: 640px) {
  .room-content {
    flex-direction: column;
  }

  .agents-column {
    width: 100%;
    height: 120px;
    overflow-x: auto;
    flex-direction: row;
    border-right: none;
    border-bottom: 1px solid var(--border-color);
  }

  .user-interaction-controls {
    padding: 0.5rem;
  }

  .user-input-container {
    flex-direction: column;
    align-items: stretch;
  }

  .input-actions {
    flex-direction: row;
    justify-content: space-between;
    margin-top: 0.5rem;
  }
}
</style>
