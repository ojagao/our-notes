<script setup lang="ts">
import { useNotesStore } from "../stores/notesStore";

const notesStore = useNotesStore();

function toggleEditMode() {
  notesStore.toggleEditMode();
}
</script>

<template>
  <div class="action-buttons">
    <!-- Edit Button -->
    <button class="edit-button" :class="{ active: notesStore.isEditMode }" @click="toggleEditMode">
      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-eraser" viewBox="0 0 16 16">
        <path d="M8.086 2.207a2 2 0 0 1 2.828 0l3.879 3.879a2 2 0 0 1 0 2.828l-5.5 5.5A2 2 0 0 1 7.879 15H5.12a2 2 0 0 1-1.414-.586l-2.5-2.5a2 2 0 0 1 0-2.828zm2.121.707a1 1 0 0 0-1.414 0L4.16 7.547l5.293 5.293 4.633-4.633a1 1 0 0 0 0-1.414zM8.746 13.547 3.453 8.254 1.914 9.793a1 1 0 0 0 0 1.414l2.5 2.5a1 1 0 0 0 .707.293H7.88a1 1 0 0 0 .707-.293z" />
      </svg>
    </button>

    <!-- Add Button (hidden in edit mode) -->
    <button v-if="!notesStore.isEditMode" class="add-button" @click="$emit('showAddModal')">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-circle" viewBox="0 0 16 16">
        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.action-buttons {
  position: fixed;
  bottom: 80px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 100;
}

.edit-button,
.add-button {
  width: 48px;
  height: 48px;
  padding: 16px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  border: none;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s;
}

.edit-button {
  background-color: #f0f0f0;
  color: #333;
}

.edit-button.active {
  background-color: #ff9800;
  color: white;
}

.add-button {
  background-color: #4a90e2;
  color: white;
}

.edit-button:active,
.add-button:active {
  transform: scale(0.95);
}
</style>
