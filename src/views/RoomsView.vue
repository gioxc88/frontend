<template>
  <div class="rooms-view">
    <!-- Background grid for cyberpunk aesthetic -->
    <div class="cyber-grid"></div>

    <!-- Two-column layout for rooms with fixed height -->
    <div v-if="rooms.length > 0" class="rooms-container">
      <div class="rooms-grid">
        <div
          v-for="room in rooms"
          :key="room.id"
          class="room-cell"
        >
          <RoomComponent
            :room-id="room.id"
            :is-active="activeRoomId === room.id"
            @activate="setActiveRoom(room.id)"
            @remove="removeRoom(room.id)"
          />
        </div>
      </div>
    </div>

    <!-- Empty state when no rooms -->
    <div v-if="rooms.length === 0" class="empty-state">
      <div class="empty-content">
        <i class="pi pi-th-large text-6xl mb-4 text-gray-400"></i>
        <h2 class="text-2xl font-semibold mb-2">No Investment Rooms Yet</h2>
        <p class="text-gray-500 mb-6">
          Create your first investment room to get started
        </p>
        <p-button
          label="Create Room"
          icon="pi pi-plus"
          @click="openAddRoomDialog"
          class="non-draggable p-button-lg"
        />
      </div>
    </div>

    <!-- Hidden Add Room Button used for the dialog -->
    <AddRoomButton ref="addRoomBtn" @room-created="onRoomCreated" />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoomsStore } from '@/stores/roomsStore';
import RoomComponent from '@/components/room/RoomComponent.vue';
import AddRoomButton from '@/components/room/AddRoomButton.vue';

// Store
const roomsStore = useRoomsStore();
const { rooms } = storeToRefs(roomsStore);

// Currently active room
const activeRoomId = ref(null);
const addRoomBtn = ref(null);

// Open the add room dialog
const openAddRoomDialog = () => {
  if (addRoomBtn.value) {
    addRoomBtn.value.openDialog();
  }
};

// Set active room
const setActiveRoom = (roomId) => {
  activeRoomId.value = roomId;
};

// Remove a room
const removeRoom = (roomId) => {
  if (activeRoomId.value === roomId) {
    activeRoomId.value = null;
  }
  roomsStore.deleteRoom(roomId);
  roomsStore.saveRooms();
};

// Handle room creation – new rooms simply appear in the grid
const onRoomCreated = (roomId) => {
  activeRoomId.value = roomId;
};

// Lifecycle hooks
onMounted(() => {
  roomsStore.initRooms();

  if (rooms.value.length > 0) {
    activeRoomId.value = rooms.value[0].id;
  }

  window.addEventListener('beforeunload', saveRooms);
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', saveRooms);
});

const saveRooms = () => {
  roomsStore.saveRooms();
};
</script>

<style scoped>
.rooms-view {
  position: relative;
  width: 100%;
  height: calc(100vh - 64px); /* Adjust based on navbar height */
  background-color: var(--bg-primary);
  padding: 1rem;
  overflow-y: auto; /* Only one scrollbar at the outer container */
  overflow-x: hidden; /* Prevent horizontal scrolling */
}

.cyber-grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.15;
}

.rooms-container {
  position: relative;
  z-index: 1;
  width: 75%; /* Changed to 75% as requested */
  max-width: 75%;
  margin-left: 0; /* Align to the left */
  margin-right: auto; /* Allow space on the right */
  overflow: visible; /* Remove scrollbar from this container */
}

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr)); /* Allow columns to shrink */
  gap: 1rem;
  width: 100%;
}

.room-cell {
  height: 50vh; /* Fixed height at 40% of viewport height */
  width: 100%;
  min-width: 0; /* Allow content to shrink below its intrinsic width */
  margin-bottom: 1rem;
  transition: all 200ms ease;
}

/* Empty state styling */
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.empty-content {
  text-align: center;
  background-color: var(--bg-secondary);
  padding: 3rem 2rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  max-width: 450px;
  animation: fadeIn 0.5s ease-in-out;
}

.fixed-add-button {
  position: fixed;
  right: 2rem;
  bottom: 2rem;
  z-index: 10;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Dark theme specific styles */
:deep(.dark-theme) .cyber-grid {
  background-image: linear-gradient(var(--bg-tertiary) 1px, transparent 1px),
    linear-gradient(90deg, var(--bg-tertiary) 1px, transparent 1px);
  background-size: 40px 40px;
  background-position: center center;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .rooms-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: auto;
  }
}

@media (max-width: 640px) {
  .rooms-grid {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }

  .room-cell {
    height: auto;
    min-height: 400px;
  }
}
</style>
