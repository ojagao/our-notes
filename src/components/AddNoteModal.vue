<script setup lang="ts">
import { ref, computed, watch } from "vue";

const props = defineProps<{
  show: boolean;
  currentPage: string;
  noteToEdit?: {
    id: string;
    text: string;
    date?: string;
  };
}>();

const emit = defineEmits(["close", "addNote", "updateNote"]);

const noteText = ref("");
const selectedDate = ref(new Date().toISOString().split("T")[0]);

// 編集モードかどうかを計算
const isEditMode = computed(() => !!props.noteToEdit);

// 編集モードの場合は初期値を設定
watch(() => props.noteToEdit, (newNote) => {
  if (newNote) {
    noteText.value = newNote.text;
    if (newNote.date) {
      selectedDate.value = newNote.date;
    }
  }
}, { immediate: true });

// 現在のページに基づいてモーダルのタイトルを計算
const modalTitle = computed(() => {
  const baseTitle = {
    shopping: "買うもの",
    map: "行きたい場所",
    calendar: "予定"
  }[props.currentPage] || "メモ";
  return isEditMode.value ? `${baseTitle}を更新` : `${baseTitle}を追加`;
});

function closeModal() {
  noteText.value = "";
  selectedDate.value = new Date().toISOString().split("T")[0];
  emit("close");
}

function handleNote() {
  if (!noteText.value.trim()) return;

  if (isEditMode.value && props.noteToEdit) {
    // 更新処理
    if (props.currentPage === "calendar") {
      emit("updateNote", {
        id: props.noteToEdit.id,
        text: noteText.value.trim(),
        page: props.currentPage,
        date: selectedDate.value
      });
    } else {
      emit("updateNote", {
        id: props.noteToEdit.id,
        text: noteText.value.trim(),
        page: props.currentPage
      });
    }
  } else {
    // 新規追加処理
    if (props.currentPage === "calendar") {
      emit("addNote", {
        text: noteText.value.trim(),
        page: props.currentPage,
        date: selectedDate.value
      });
    } else {
      emit("addNote", {
        text: noteText.value.trim(),
        page: props.currentPage
      });
    }
  }

  noteText.value = "";
  selectedDate.value = new Date().toISOString().split("T")[0];
  closeModal();
}
</script>

<template>
  <v-dialog :model-value="show" @update:model-value="closeModal" max-width="500" persistent transition="dialog-bottom-transition">
    <v-card class="rounded-lg">
      <v-card-title class="d-flex justify-space-between align-center pa-4">
        <span class="text-h6">{{ modalTitle }}</span>
        <v-btn icon="mdi-close" variant="text" density="compact" @click="closeModal"></v-btn>
      </v-card-title>

      <v-card-text class="pa-4">
        <v-container class="pa-0">
          <v-row v-if="currentPage === 'calendar'">
            <v-col cols="12">
              <v-text-field v-model="selectedDate" label="日付" type="date" variant="outlined" density="comfortable" hide-details="auto"></v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-text-field v-model="noteText" label="メモ" placeholder="メモを入力してください" variant="outlined" density="comfortable" hide-details="auto" @keyup.enter="handleNote"></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <v-card-actions class="pa-4 pt-0">
        <v-spacer></v-spacer>
        <v-btn color="grey-darken-1" variant="text" @click="closeModal"> キャンセル </v-btn>
        <v-btn color="primary" variant="elevated" :disabled="!noteText.trim()" @click="handleNote">
          {{ isEditMode ? '更新' : '追加' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
/* Vuetifyを使用しているため、カスタムスタイルは最小限に */
.v-card {
  overflow: hidden;
}

/* 必要に応じて追加のカスタムスタイルをここに記述 */
</style>
