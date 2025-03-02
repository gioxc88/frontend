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

        <!-- Simulation Controls -->
        <div class="simulation-controls non-draggable">
          <p-button
            v-if="!isSimulationRunning"
            icon="pi pi-play"
            class="p-button-success"
            @click="startSimulation"
            label="Start Conversation"
          />
          <p-button
            v-else
            icon="pi pi-pause"
            class="p-button-warning"
            @click="pauseSimulation"
            label="Pause"
          />

          <div class="speed-controls">
            <label>Speed:</label>
            <p-slider
              v-model="simulationSpeed"
              :min="0.5"
              :max="5"
              :step="0.5"
              class="w-32"
              @change="updateSimulationSpeed"
            />
            <span>{{ simulationSpeed }}x</span>
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
}

.agents-column {
  width: 120px;
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  padding: 0.5rem;
  background-color: var(--bg-tertiary);
}

.chat-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.simulation-controls {
  padding: 0.75rem;
  border-top: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.speed-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

  .simulation-controls {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
  }
}
</style>
