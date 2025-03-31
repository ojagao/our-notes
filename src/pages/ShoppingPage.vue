<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useNotesStore } from "../stores/notesStore";
import AddNoteModal from "../components/AddNoteModal.vue";

const notesStore = useNotesStore();
const showAddModal = ref(false);
const showEditModal = ref(false);
const noteToEdit = ref<{
  id: string;
  text: string;
  date?: string;
} | undefined>(undefined);

// ページが表示されたときにデータを再取得
onMounted(() => {
  notesStore.fetchShoppingNotes();
});

function openEditModal(note: {
  id: string;
  text: string;
}) {
  noteToEdit.value = {
    id: note.id,
    text: note.text
  };
  showEditModal.value = true;
}

function addNote(note: {
  text: string;
  page: string;
}) {
  notesStore.addShoppingNote(note.text);
  showAddModal.value = false;
}

async function updateNote(note: {
  id: string;
  text: string;
  page: string;
}) {
  await notesStore.updateShoppingNote(note.id, note.text);
  showEditModal.value = false;
  noteToEdit.value = undefined;
}
</script>

<template>
  <div class="page">
    <div class="notes-container">
      <!-- <h1>buying</h1> -->

      <!-- ローディング表示 -->
      <div v-if="notesStore.isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>読み込み中...</p>
      </div>

      <!-- エラー表示 -->
      <div v-else-if="notesStore.error" class="error-state">
        <p>{{ notesStore.error }}</p>
        <button @click="notesStore.fetchShoppingNotes()" class="retry-button">
          再試行
        </button>
      </div>

      <!-- 空の場合の表示 -->
      <div v-else-if="notesStore.shoppingNotes.length === 0" class="empty-state">買うものは登録されていないようです…</div>

      <!-- ノート一覧 -->
      <div v-else v-for="note in notesStore.shoppingNotes" :key="note.id" class="note-item" @click="openEditModal(note)">
        <div class="note-content">
          {{ note.text }}
        </div>
        <div v-if="notesStore.isEditMode" class="delete-button" @click.stop="notesStore.deleteShoppingNote(note.id)">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </div>
      </div>
    </div>

    <!-- 追加モーダル -->
    <AddNoteModal
      :show="showAddModal"
      :currentPage="'shopping'"
      @close="showAddModal = false"
      @addNote="addNote"
    />

    <!-- 編集モーダル -->
    <AddNoteModal
      :show="showEditModal"
      :currentPage="'shopping'"
      :noteToEdit="noteToEdit"
      @close="showEditModal = false"
      @updateNote="updateNote"
    />
  </div>
</template>

<style scoped>
.page {
  padding: 16px;
  padding-bottom: 80px;
  height: 100%;
  overflow-y: auto;
  width: 90vw;
  margin: 0 auto;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
}

.notes-container {
  margin-bottom: 20px;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  color: #888;
  margin: 40px 0;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 16px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #3498db;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.retry-button {
  margin-top: 16px;
  padding: 8px 16px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.retry-button:hover {
  background-color: #2980b9;
}

.note-item {
  display: flex;
  align-items: center;
  text-align: left;
  padding: 12px 16px;
  background-color: white;
  border-radius: 8px;
  margin-bottom: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.note-content {
  flex: 1;
}

.delete-button {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 24px;
  height: 24px;
  margin-left: 12px;
  color: #ff5252;
  cursor: pointer;
  border-radius: 50%;
  background-color: rgba(255, 82, 82, 0.1);
  transition: background-color 0.2s;
}

.delete-button:hover {
  background-color: rgba(255, 82, 82, 0.2);
}
</style>
