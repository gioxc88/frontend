<!-- src/components/room/RoomHeader.vue -->
<template>
  <div class="room-header">
    <!-- Left side controls -->
    <div class="header-controls">
      <p-button
        icon="pi pi-ellipsis-v"
        class="p-button-rounded p-button-text p-button-sm"
        @click="showMenu = true"
      />

      <p-menu
        v-if="showMenu"
        :model="menuItems"
        :popup="true"
        ref="menu"
        @hide="showMenu = false"
      />
    </div>

    <!-- Room title -->
    <div
      class="room-title"
      @dblclick="startEditing"
    >
      <input
        v-if="isEditing"
        ref="titleInput"
        v-model="editedTitle"
        class="title-input"
        @blur="finishEditing"
        @keydown.enter="finishEditing"
        @keydown.esc="cancelEditing"
      />
      <h2 v-else class="title-text">{{ title }}</h2>
    </div>

    <!-- Right side controls -->
    <div class="header-controls">
      <p-button
        icon="pi pi-times"
        class="p-button-rounded p-button-text p-button-danger p-button-sm"
        @click="confirmRemove"
      />
    </div>

    <!-- Confirm Dialog -->
    <p-dialog
      v-model:visible="showConfirmDialog"
      header="Remove Room"
      :modal="true"
      :closable="false"
      class="dialog-confirm"
    >
      <div class="confirm-content">
        Are you sure you want to remove this investment room?
      </div>
      <template #footer>
        <p-button
          label="Cancel"
          class="p-button-text"
          @click="showConfirmDialog = false"
        />
        <p-button
          label="Remove"
          class="p-button-danger"
          @click="removeRoom"
        />
      </template>
    </p-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  roomId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['title-change', 'remove']);

// Menu
const showMenu = ref(false);
const menu = ref(null);

const menuItems = [
  {
    label: 'Room Settings',
    icon: 'pi pi-cog',
    command: () => { /* Room settings */ }
  },
  {
    label: 'Export Conversation',
    icon: 'pi pi-download',
    command: () => { /* Export conversation */ }
  },
  {
    label: 'Clear Conversation',
    icon: 'pi pi-trash',
    command: () => { /* Clear conversation */ }
  },
  { separator: true },
  {
    label: 'Remove Room',
    icon: 'pi pi-times',
    class: 'p-error',
    command: () => confirmRemove()
  }
];

// Title editing
const isEditing = ref(false);
const editedTitle = ref(props.title);
const titleInput = ref(null);

const startEditing = () => {
  editedTitle.value = props.title;
  isEditing.value = true;

  // Focus the input after it's rendered
  setTimeout(() => {
    if (titleInput.value) {
      titleInput.value.focus();
      titleInput.value.select();
    }
  }, 10);
};

const finishEditing = () => {
  if (editedTitle.value.trim() !== '') {
    emit('title-change', editedTitle.value);
  } else {
    editedTitle.value = props.title;
  }
  isEditing.value = false;
};

const cancelEditing = () => {
  editedTitle.value = props.title;
  isEditing.value = false;
};

// Room removal
const showConfirmDialog = ref(false);

const confirmRemove = () => {
  showConfirmDialog.value = true;
};

const removeRoom = () => {
  showConfirmDialog.value = false;
  emit('remove');
};

// Lifecycle hooks
onMounted(() => {
  // Handle clicks outside the menu to close it
  document.addEventListener('click', (event) => {
    if (showMenu.value && menu.value && !menu.value.$el.contains(event.target)) {
      showMenu.value = false;
    }
  });
});
</script>

<style scoped>
.room-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  background: linear-gradient(to right, var(--bg-tertiary), var(--bg-secondary));
  border-bottom: 1px solid var(--border-color);
  cursor: default;
  user-select: none;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.room-title {
  flex: 1;
  text-align: center;
  padding: 0 0.5rem;
  max-width: 70%;
}

.title-text {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.title-input {
  width: 100%;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  padding: 0.25rem 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  text-align: center;
}

.title-input:focus {
  outline: none;
  border-color: var(--accent-purple);
  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.25);
}

/* Dialog styles */
.dialog-confirm {
  width: 350px;
}

.confirm-content {
  padding: 1rem 0;
  text-align: center;
}

:deep(.p-dialog-header) {
  border-bottom: 1px solid var(--border-color);
}

:deep(.p-dialog-footer) {
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem;
}
</style>
