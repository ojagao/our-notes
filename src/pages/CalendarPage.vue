<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useNotesStore } from "../stores/notesStore";
import AddNoteModal from "../components/AddNoteModal.vue";

const notesStore = useNotesStore();
const showAddModal = ref(false);
const showEditModal = ref(false);
const noteToEdit = ref<
  | {
      id: string;
      text: string;
      date?: string;
      person?: 1 | 2;
    }
  | undefined
>(undefined);
const sortOrder = ref("desc"); // 'asc' for oldest first, 'desc' for newest first
const currentDate = ref(new Date());
const selectedDate = ref<string | null>(null);
const viewMode = ref<"calendar" | "list">("list");

// ページが表示されたときにデータを再取得
onMounted(() => {
  notesStore.fetchCalendarNotes();
});

// ソートされたノートのリスト
const sortedNotes = computed(() => {
  return [...notesStore.calendarNotes].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder.value === "asc" ? dateA - dateB : dateB - dateA;
  });
});

function toggleSortOrder() {
  sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
}

function openEditModal(note: { id: string; text: string; date: string | Date; person?: 1 | 2 }) {
  noteToEdit.value = {
    id: note.id,
    text: note.text,
    date: typeof note.date === "string" ? note.date : new Date(note.date).toISOString().split("T")[0],
    person: note.person || 1,
  };
  showEditModal.value = true;
}

function addNote(note: { text: string; date: string; person?: 1 | 2; page: string }) {
  notesStore.addCalendarNote(note.text, new Date(note.date), note.person || 1);
  showAddModal.value = false;
}

async function updateNote(note: { id: string; text: string; date: string; person?: 1 | 2; page: string }) {
  await notesStore.updateCalendarNote(note.id, note.text, note.date, note.person || 1);
  showEditModal.value = false;
  noteToEdit.value = undefined;
}

// カレンダー関連の computed properties
const currentYear = computed(() => currentDate.value.getFullYear());
const currentMonth = computed(() => currentDate.value.getMonth());

const calendarDays = computed(() => {
  const year = currentYear.value;
  const month = currentMonth.value;

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const days = [];

  // 前月の日付を追加
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month, 1 - i - 1);
    days.push({
      date: date,
      isCurrentMonth: false,
      dateString: formatDateString(date),
    });
  }

  // 当月の日付を追加
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    days.push({
      date: date,
      isCurrentMonth: true,
      dateString: formatDateString(date),
    });
  }

  // 次月の日付を追加（6週間分まで）
  const remainingCells = 42 - days.length;
  for (let i = 1; i <= remainingCells; i++) {
    const date = new Date(year, month + 1, i);
    days.push({
      date: date,
      isCurrentMonth: false,
      dateString: formatDateString(date),
    });
  }

  return days;
});

const notesForDate = computed(() => {
  const notesByDate: { [key: string]: any[] } = {};

  notesStore.calendarNotes.forEach((note) => {
    const dateString = formatDateString(new Date(note.date));
    if (!notesByDate[dateString]) {
      notesByDate[dateString] = [];
    }
    notesByDate[dateString].push(note);
  });

  return notesByDate;
});

const filteredNotes = computed(() => {
  if (!selectedDate.value) return sortedNotes.value;
  return sortedNotes.value.filter((note) => {
    const noteDate = formatDateString(new Date(note.date));
    return noteDate === selectedDate.value;
  });
});

function goToPreviousMonth() {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1);
}

function goToNextMonth() {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1);
}

function selectDate(dateString: string) {
  selectedDate.value = selectedDate.value === dateString ? null : dateString;
}

function isToday(date: Date) {
  const today = new Date();
  return formatDateString(date) === formatDateString(today);
}

function getNotesCountForDate(dateString: string) {
  return notesForDate.value[dateString]?.length || 0;
}

function switchViewMode(mode: "calendar" | "list") {
  viewMode.value = mode;
  if (mode === "list") {
    selectedDate.value = null;
  }
}

// ローカル時間でYYYY-MM-DD形式の日付文字列を生成
function formatDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
</script>

<template>
  <div class="page">
    <!-- View mode toggle -->
    <div class="view-controls">
      <div class="view-toggle">
        <button :class="['toggle-button', { active: viewMode === 'calendar' }]" @click="switchViewMode('calendar')">📅</button>
        <button :class="['toggle-button', { active: viewMode === 'list' }]" @click="switchViewMode('list')">📋</button>
      </div>

      <button v-if="viewMode === 'list'" class="sort-button" @click="toggleSortOrder">
        <span v-if="sortOrder === 'asc'">↑ (古い順)</span>
        <span v-else>↓ (新しい順)</span>
      </button>
    </div>

    <!-- Calendar View -->
    <div v-if="viewMode === 'calendar'" class="calendar-container">
      <!-- Calendar Header -->
      <div class="calendar-header">
        <button class="nav-button" @click="goToPreviousMonth">
          ←
        </button>

        <h2 class="month-year">{{ currentDate.toLocaleDateString("ja-JP", { year: "numeric", month: "long" }) }}</h2>

        <button class="nav-button" @click="goToNextMonth">
          →
        </button>
      </div>

      <!-- Calendar Grid -->
      <div class="calendar-grid">
        <!-- Week headers -->
        <div class="week-header">
          <div class="day-header">日</div>
          <div class="day-header">月</div>
          <div class="day-header">火</div>
          <div class="day-header">水</div>
          <div class="day-header">木</div>
          <div class="day-header">金</div>
          <div class="day-header">土</div>
        </div>

        <!-- Calendar days -->
        <div class="calendar-days">
          <div
            v-for="day in calendarDays"
            :key="day.dateString"
            :class="[
              'calendar-day',
              {
                'other-month': !day.isCurrentMonth,
                today: isToday(day.date),
                selected: selectedDate === day.dateString,
                'has-notes': getNotesCountForDate(day.dateString) > 0,
              },
            ]"
            @click="selectDate(day.dateString)"
          >
            <div class="day-number">{{ day.date.getDate() }}</div>
            <div v-if="getNotesCountForDate(day.dateString) > 0" class="notes-indicator">
              <span v-if="notesForDate[day.dateString]?.some((note) => note.person === 1)" class="note-circle">🟤</span>
              <span v-if="notesForDate[day.dateString]?.some((note) => note.person === 2)" class="note-circle">🟡</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Selected date notes -->
      <div v-if="selectedDate" class="selected-date-notes">
        <h3 class="selected-date-title">
          {{
            new Date(selectedDate).toLocaleDateString("ja-JP", {
              month: "long",
              day: "numeric",
              weekday: "long",
            })
          }}
          の予定
        </h3>
        <div v-if="filteredNotes.length === 0" class="no-notes">この日に予定はありません</div>
        <div v-else>
          <div v-for="note in filteredNotes" :key="note.id" class="selected-note-item" @click="openEditModal(note)">
            <span class="note-person">{{ note.person === 1 ? "🦔" : "🐥" }}</span>
            <span class="note-text">{{ note.text }}</span>
            <div v-if="notesStore.isEditMode" class="delete-button" @click.stop="notesStore.deleteCalendarNote(note.id)">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- List View -->
    <div v-if="viewMode === 'list'" class="notes-container">
      <!-- ローディング表示 -->
      <div v-if="notesStore.isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>読み込み中...</p>
      </div>

      <!-- エラー表示 -->
      <div v-else-if="notesStore.error" class="error-state">
        <p>{{ notesStore.error }}</p>
        <button @click="notesStore.fetchCalendarNotes()" class="retry-button">再試行</button>
      </div>

      <!-- 空の場合の表示 -->
      <div v-else-if="sortedNotes.length === 0" class="empty-state">予定は登録されていないようです…</div>

      <!-- ノート一覧 -->
      <div v-else v-for="note in sortedNotes" :key="note.id" class="note-item" @click="openEditModal(note)">
        <div class="note-content">
          <div class="note-date">{{ new Date(note.date).toLocaleDateString() }}</div>
          <div>
            <span class="mr-2">{{ note.person === 1 ? "\u{1F994}" : "\u{1F425}" }}</span
            >{{ note.text }}
          </div>
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
    <AddNoteModal :show="showAddModal" :currentPage="'calendar'" @close="showAddModal = false" @addNote="addNote" />

    <!-- 編集モーダル -->
    <AddNoteModal :show="showEditModal" :currentPage="'calendar'" :noteToEdit="noteToEdit" @close="showEditModal = false" @updateNote="updateNote" />
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
  to {
    transform: rotate(360deg);
  }
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

/* View Controls */
.view-controls {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.view-toggle {
  display: flex;
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 4px;
}

.toggle-button {
  padding: 8px 16px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.toggle-button.active {
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: #333;
}

.toggle-button:not(.active) {
  color: #666;
}

/* Calendar Container */
.calendar-container {
  margin-bottom: 20px;
}

/* Calendar Header */
.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 0 8px;
}

.month-year {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.nav-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background-color: #f5f5f5;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.nav-button:hover {
  background-color: #e5e5e5;
}

/* Calendar Grid */
.calendar-grid {
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.week-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.day-header {
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  padding: 8px 4px;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.calendar-day {
  position: relative;
  min-height: 60px;
  padding: 8px 4px 4px 4px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background-color: #fafafa;
}

.calendar-day:hover {
  background-color: #f0f0f0;
}

.calendar-day.other-month {
  opacity: 0.3;
}

.calendar-day.today {
  background-color: #e3f2fd;
  border: 2px solid #2196f3;
}

.calendar-day.selected {
  background-color: #2196f3;
  color: white;
}

.calendar-day.has-notes {
  background-color: #fff3e0;
  border: 1px solid #ff9800;
}

.calendar-day.selected.has-notes {
  background-color: #1976d2;
}

.day-number {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.notes-indicator {
  display: flex;
  gap: 2px;
  align-items: center;
  justify-content: center;
  margin-top: auto;
}

.note-circle {
  font-size: 12px;
  line-height: 1;
}

/* Selected Date Notes */
.selected-date-notes {
  margin-top: 20px;
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.selected-date-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
}

.no-notes {
  color: #888;
  text-align: center;
  padding: 20px;
  font-style: italic;
}

.selected-note-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  background-color: #f9f9f9;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.selected-note-item:hover {
  background-color: #f0f0f0;
}

.selected-note-item:last-child {
  margin-bottom: 0;
}

.note-person {
  margin-right: 12px;
  font-size: 16px;
}

.note-text {
  flex: 1;
  color: #333;
}
</style>
