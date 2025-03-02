<!-- src/components/room/AddRoomButton.vue -->
<template>
  <div class="add-room-container">
    <p-button
      icon="pi pi-plus"
      label="New Investment Room"
      class="p-button-primary add-room-button"
      @click="showDialog = true"
    />

    <p-dialog
      v-model:visible="showDialog"
      header="Create New Investment Room"
      :modal="true"
      :closable="true"
      :closeOnEscape="true"
      class="room-dialog"
      @hide="closeDialog"
    >
      <div class="room-form">
        <div class="form-field">
          <label for="roomTitle">Room Name</label>
          <p-input-text
            id="roomTitle"
            v-model="roomTitle"
            placeholder="e.g., Crypto Analysis Room"
            class="w-full"
          />
        </div>

        <div class="form-field">
          <label>Room Type</label>
          <div class="room-type-grid">
            <div
              v-for="type in roomTypes"
              :key="type.id"
              class="room-type-option"
              :class="{ 'selected': selectedRoomType === type.id }"
              @click="selectedRoomType = type.id"
            >
              <i :class="type.icon"></i>
              <span>{{ type.name }}</span>
            </div>
          </div>
        </div>

        <div class="form-field">
          <label>Initial Agents</label>
          <div class="checkbox-group">
            <div
              v-for="agent in agentOptions"
              :key="agent.type"
              class="agent-option"
            >
              <p-checkbox
                :inputId="agent.type"
                v-model="selectedAgents"
                :value="agent.type"
              />
              <label :for="agent.type" class="ml-2">{{ agent.name }}</label>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <p-button
          label="Cancel"
          icon="pi pi-times"
          class="p-button-text"
          @click="closeDialog"
        />
        <p-button
          label="Create Room"
          icon="pi pi-check"
          class="p-button-primary"
          :disabled="!isFormValid"
          @click="createRoom"
        />
      </template>
    </p-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoomsStore } from '@/stores/roomsStore';
import { useAgentsStore } from '@/stores/agentsStore';

const props = defineProps({});
const emit = defineEmits(['room-created']);

// Stores
const roomsStore = useRoomsStore();
const agentsStore = useAgentsStore();

// Dialog state
const showDialog = ref(false);

// Method to open the dialog - expose this for external components
const openDialog = () => {
  showDialog.value = true;
};

// Make sure to expose the method and state
defineExpose({
  showDialog,
  openDialog
});

// Form data
const roomTitle = ref('');
const selectedRoomType = ref('general');
const selectedAgents = ref([]);

// Available room types
const roomTypes = [
  { id: 'general', name: 'General Analysis', icon: 'pi pi-chart-bar' },
  { id: 'equities', name: 'Equities', icon: 'pi pi-chart-line' },
  { id: 'crypto', name: 'Crypto', icon: 'pi pi-bitcoin' },
  { id: 'macro', name: 'Macro Economics', icon: 'pi pi-globe' },
  { id: 'forex', name: 'Forex', icon: 'pi pi-dollar' },
  { id: 'commodities', name: 'Commodities', icon: 'pi pi-box' }
];

// Available agent types
const agentOptions = computed(() => {
  return Object.entries(agentsStore.agentTypes).map(([type, info]) => ({
    type,
    name: info.title
  }));
});

// Form validation
const isFormValid = computed(() => {
  return roomTitle.value.trim() !== '';
});

// Actions
const closeDialog = () => {
  showDialog.value = false;
  resetForm();
};

const createRoom = () => {
  if (!isFormValid.value) return;

  // Add the room first
  const roomId = roomsStore.addRoom({
    title: roomTitle.value,
    type: selectedRoomType.value,
    // No need for position calculation as it will be managed by grid layout
    gridPosition: { x: 0, y: 0 }, // Initial position, will be updated by RoomsView
    gridSize: { w: 6, h: 6 }      // Default size
  });

  // Then add selected agents to the room
  selectedAgents.value.forEach(agentType => {
    agentsStore.addAgent(roomId, agentType);
  });

  // Save changes
  roomsStore.saveRooms();

  // Emit event so parent components can respond
  emit('room-created', roomId);

  // Close dialog and reset form
  closeDialog();
};

const resetForm = () => {
  roomTitle.value = '';
  selectedRoomType.value = 'general';
  selectedAgents.value = [];
};
</script>

<style scoped>
.add-room-container {
  position: fixed;
  right: 2rem;
  bottom: 2rem;
  z-index: var(--z-sticky);
}

.add-room-button {
  border-radius: 2rem;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  box-shadow: var(--shadow-lg);
  transition: all 0.3s ease;
}

.add-room-button:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-glow-purple);
}

.room-dialog {
  max-width: 550px;
}

.room-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem 0;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field label {
  font-weight: 500;
  color: var(--text-secondary);
}

.room-type-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.room-type-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  border-radius: var(--border-radius-md);
  background-color: var(--bg-tertiary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.room-type-option i {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.room-type-option:hover {
  background-color: var(--border-color);
}

.room-type-option.selected {
  background-color: var(--accent-purple);
  color: white;
}

.checkbox-group {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.agent-option {
  display: flex;
  align-items: center;
}

/* Enhanced styling for dark theme */
.dark-theme .add-room-button:hover {
  box-shadow: var(--glow-purple);
}

.dark-theme .room-type-option:hover:not(.selected) {
  background-color: var(--bg-secondary);
}

/* Responsive adjustments for mobile */
@media (max-width: 640px) {
  .room-type-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .checkbox-group {
    grid-template-columns: 1fr;
  }

  .add-room-container {
    right: 1rem;
    bottom: 1rem;
  }

  .add-room-button {
    padding: 0.5rem 1rem;
  }

  .room-dialog {
    max-width: 90vw;
  }
}
</style>
