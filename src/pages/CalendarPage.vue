<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
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
const sortOrder = ref('desc'); // 'asc' for oldest first, 'desc' for newest first

// ページが表示されたときにデータを再取得
onMounted(() => {
  notesStore.fetchCalendarNotes();
});

// ソートされたノートのリスト
const sortedNotes = computed(() => {
  return [...notesStore.calendarNotes].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder.value === 'asc' ? dateA - dateB : dateB - dateA;
  });
});

function toggleSortOrder() {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
}

function openEditModal(note: {
  id: string;
  text: string;
  date: string | Date;
}) {
  noteToEdit.value = {
    id: note.id,
    text: note.text,
    date: typeof note.date === 'string' ? note.date : new Date(note.date).toISOString().split('T')[0]
  };
  showEditModal.value = true;
}

function addNote(note: {
  text: string;
  date: string;
  page: string;
}) {
  notesStore.addCalendarNote(note.text, new Date(note.date));
  showAddModal.value = false;
}

async function updateNote(note: {
  id: string;
  text: string;
  date: string;
  page: string;
}) {
  await notesStore.updateCalendarNote(note.id, note.text, note.date);
  showEditModal.value = false;
  noteToEdit.value = undefined;
}
</script>

<template>
  <div class="page">
    <!-- <h1>schedule</h1> -->

    <div class="sort-controls">
      <button class="sort-button" @click="toggleSortOrder">
        <span v-if="sortOrder === 'asc'">日付 ↑ (古い順)</span>
        <span v-else>日付 ↓ (新しい順)</span>
      </button>
    </div>

    <div class="notes-container">
      <!-- ローディング表示 -->
      <div v-if="notesStore.isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>読み込み中...</p>
      </div>

      <!-- エラー表示 -->
      <div v-else-if="notesStore.error" class="error-state">
        <p>{{ notesStore.error }}</p>
        <button @click="notesStore.fetchCalendarNotes()" class="retry-button">
          再試行
        </button>
      </div>

      <!-- 空の場合の表示 -->
      <div v-else-if="sortedNotes.length === 0" class="empty-state">予定は登録されていないようです…</div>

      <!-- ノート一覧 -->
      <div v-else v-for="note in sortedNotes" :key="note.id" class="note-item" @click="openEditModal(note)">
        <div class="note-content">
          <div class="note-date">{{ new Date(note.date).toLocaleDateString() }}</div>
          <div>{{ note.text }}</div>
        </div>
        <div v-if="notesStore.isEditMode" class="delete-button" @click.stop="notesStore.deleteCalendarNote(note.id)">
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
      :currentPage="'calendar'"
      @close="showAddModal = false"
      @addNote="addNote"
    />

    <!-- 編集モーダル -->
    <AddNoteModal
      :show="showEditModal"
      :currentPage="'calendar'"
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

.note-date {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
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

.sort-controls {
  margin-bottom: 16px;
  display: flex;
  justify-content: flex-end;
}

.sort-button {
  background-color: #f0f0f0;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  color: #333;
}

.sort-button:hover {
  background-color: #e0e0e0;
}
</style>
