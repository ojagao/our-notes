import { defineStore } from 'pinia'
import { ref, onMounted } from 'vue'

// APIエンドポイントのベースURL
const API_BASE_URL = import.meta.env.PROD
  ? 'https://our-notes-api.our-notes.workers.dev'
  : 'http://localhost:8787'

// Define types
export interface ShoppingNote {
  id: string
  text: string
  createdAt: Date
}

export interface MapNote {
  id: string
  text: string
  createdAt: Date
}

export interface CalendarNote {
  id: string
  text: string
  date: Date
  createdAt: Date
}

// APIレスポンスの型
interface ApiShoppingNote {
  id: string
  text: string
  created_at: string
}

interface ApiMapNote {
  id: string
  text: string
  created_at: string
}

interface ApiCalendarNote {
  id: string
  text: string
  date: string
  created_at: string
}

// Create store
export const useNotesStore = defineStore('notes', () => {
  // State
  const shoppingNotes = ref<ShoppingNote[]>([])
  const mapNotes = ref<MapNote[]>([])
  const calendarNotes = ref<CalendarNote[]>([])
  const isEditMode = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // データ取得関数
  async function fetchShoppingNotes() {
    isLoading.value = true
    error.value = null
    try {
      const response = await fetch(`${API_BASE_URL}/api/shopping-notes`)
      if (!response.ok) throw new Error('Failed to fetch shopping notes')
      
      const data = await response.json() as ApiShoppingNote[]
      shoppingNotes.value = data.map(note => ({
        id: note.id,
        text: note.text,
        createdAt: new Date(note.created_at)
      }))
    } catch (err) {
      console.error('Error fetching shopping notes:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error'
      // エラー時はローカルストレージからフォールバック
      loadFromLocalStorage()
    } finally {
      isLoading.value = false
    }
  }

  async function fetchMapNotes() {
    isLoading.value = true
    error.value = null
    try {
      const response = await fetch(`${API_BASE_URL}/api/map-notes`)
      if (!response.ok) throw new Error('Failed to fetch map notes')
      
      const data = await response.json() as ApiMapNote[]
      mapNotes.value = data.map(note => ({
        id: note.id,
        text: note.text,
        createdAt: new Date(note.created_at)
      }))
    } catch (err) {
      console.error('Error fetching map notes:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error'
      // エラー時はローカルストレージからフォールバック
      loadFromLocalStorage()
    } finally {
      isLoading.value = false
    }
  }

  async function fetchCalendarNotes() {
    isLoading.value = true
    error.value = null
    try {
      const response = await fetch(`${API_BASE_URL}/api/calendar-notes`)
      if (!response.ok) throw new Error('Failed to fetch calendar notes')
      
      const data = await response.json() as ApiCalendarNote[]
      calendarNotes.value = data.map(note => ({
        id: note.id,
        text: note.text,
        date: new Date(note.date),
        createdAt: new Date(note.created_at)
      }))
    } catch (err) {
      console.error('Error fetching calendar notes:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error'
      // エラー時はローカルストレージからフォールバック
      loadFromLocalStorage()
    } finally {
      isLoading.value = false
    }
  }

  // Actions
  async function addShoppingNote(text: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/shopping-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      })

      if (!response.ok) throw new Error('Failed to add shopping note')
      
      const data = await response.json() as ApiShoppingNote
      const newNote: ShoppingNote = {
        id: data.id,
        text: data.text,
        createdAt: new Date(data.created_at)
      }
      
      shoppingNotes.value.push(newNote)
      saveToLocalStorage() // バックアップとしてローカルにも保存
    } catch (err) {
      console.error('Error adding shopping note:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error'
      
      // エラー時はローカルにのみ保存
      const note: ShoppingNote = {
        id: Date.now().toString(),
        text,
        createdAt: new Date()
      }
      shoppingNotes.value.push(note)
      saveToLocalStorage()
    }
  }

  async function addMapNote(text: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/map-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      })

      if (!response.ok) throw new Error('Failed to add map note')
      
      const data = await response.json() as ApiMapNote
      const newNote: MapNote = {
        id: data.id,
        text: data.text,
        createdAt: new Date(data.created_at)
      }
      
      mapNotes.value.push(newNote)
      saveToLocalStorage() // バックアップとしてローカルにも保存
    } catch (err) {
      console.error('Error adding map note:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error'
      
      // エラー時はローカルにのみ保存
      const note: MapNote = {
        id: Date.now().toString(),
        text,
        createdAt: new Date()
      }
      mapNotes.value.push(note)
      saveToLocalStorage()
    }
  }

  async function addCalendarNote(text: string, date: Date) {
    try {
      const dateStr = date.toISOString()
      
      const response = await fetch(`${API_BASE_URL}/api/calendar-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text, date: dateStr })
      })

      if (!response.ok) throw new Error('Failed to add calendar note')
      
      const data = await response.json() as ApiCalendarNote
      const newNote: CalendarNote = {
        id: data.id,
        text: data.text,
        date: new Date(data.date),
        createdAt: new Date(data.created_at)
      }
      
      calendarNotes.value.push(newNote)
      saveToLocalStorage() // バックアップとしてローカルにも保存
    } catch (err) {
      console.error('Error adding calendar note:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error'
      
      // エラー時はローカルにのみ保存
      const note: CalendarNote = {
        id: Date.now().toString(),
        text,
        date,
        createdAt: new Date()
      }
      calendarNotes.value.push(note)
      saveToLocalStorage()
    }
  }

  async function deleteShoppingNote(id: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/shopping-notes/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok && response.status !== 404) {
        throw new Error('Failed to delete shopping note')
      }
      
      shoppingNotes.value = shoppingNotes.value.filter(note => note.id !== id)
      saveToLocalStorage() // バックアップとしてローカルにも保存
    } catch (err) {
      console.error('Error deleting shopping note:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error'
      
      // エラー時もUIからは削除
      shoppingNotes.value = shoppingNotes.value.filter(note => note.id !== id)
      saveToLocalStorage()
    }
  }

  async function deleteMapNote(id: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/map-notes/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok && response.status !== 404) {
        throw new Error('Failed to delete map note')
      }
      
      mapNotes.value = mapNotes.value.filter(note => note.id !== id)
      saveToLocalStorage() // バックアップとしてローカルにも保存
    } catch (err) {
      console.error('Error deleting map note:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error'
      
      // エラー時もUIからは削除
      mapNotes.value = mapNotes.value.filter(note => note.id !== id)
      saveToLocalStorage()
    }
  }

  async function deleteCalendarNote(id: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/calendar-notes/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok && response.status !== 404) {
        throw new Error('Failed to delete calendar note')
      }
      
      calendarNotes.value = calendarNotes.value.filter(note => note.id !== id)
      saveToLocalStorage() // バックアップとしてローカルにも保存
    } catch (err) {
      console.error('Error deleting calendar note:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error'
      
      // エラー時もUIからは削除
      calendarNotes.value = calendarNotes.value.filter(note => note.id !== id)
      saveToLocalStorage()
    }
  }

  // Update functions
  async function updateShoppingNote(id: string, text: string) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${API_BASE_URL}/api/shopping-notes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error('Failed to update shopping note');

      // 更新後のデータを取得
      await fetchShoppingNotes();
    } catch (err) {
      console.error('Error updating shopping note:', err);
      error.value = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      isLoading.value = false;
    }
  }

  async function updateMapNote(id: string, text: string) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${API_BASE_URL}/api/map-notes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error('Failed to update map note');

      // 更新後のデータを取得
      await fetchMapNotes();
    } catch (err) {
      console.error('Error updating map note:', err);
      error.value = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      isLoading.value = false;
    }
  }

  async function updateCalendarNote(id: string, text: string, date: string) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${API_BASE_URL}/api/calendar-notes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, date }),
      });

      if (!response.ok) throw new Error('Failed to update calendar note');

      // 更新後のデータを取得
      await fetchCalendarNotes();
    } catch (err) {
      console.error('Error updating calendar note:', err);
      error.value = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      isLoading.value = false;
    }
  }

  function toggleEditMode() {
    isEditMode.value = !isEditMode.value
  }

  // Local storage functions (バックアップとして使用)
  function saveToLocalStorage() {
    localStorage.setItem('shoppingNotes', JSON.stringify(shoppingNotes.value))
    localStorage.setItem('mapNotes', JSON.stringify(mapNotes.value))
    localStorage.setItem('calendarNotes', JSON.stringify(calendarNotes.value))
  }

  function loadFromLocalStorage() {
    const savedShoppingNotes = localStorage.getItem('shoppingNotes')
    const savedMapNotes = localStorage.getItem('mapNotes')
    const savedCalendarNotes = localStorage.getItem('calendarNotes')

    if (savedShoppingNotes) {
      shoppingNotes.value = JSON.parse(savedShoppingNotes)
    }
    if (savedMapNotes) {
      mapNotes.value = JSON.parse(savedMapNotes)
    }
    if (savedCalendarNotes) {
      calendarNotes.value = JSON.parse(savedCalendarNotes)
    }
  }

  // 初期化時にデータを取得
  onMounted(() => {
    fetchShoppingNotes()
    fetchMapNotes()
    fetchCalendarNotes()
  })

  return {
    shoppingNotes,
    mapNotes,
    calendarNotes,
    isEditMode,
    isLoading,
    error,
    fetchShoppingNotes,
    fetchMapNotes,
    fetchCalendarNotes,
    addShoppingNote,
    addMapNote,
    addCalendarNote,
    deleteShoppingNote,
    deleteMapNote,
    deleteCalendarNote,
    updateShoppingNote,
    updateMapNote,
    updateCalendarNote,
    toggleEditMode,
    saveToLocalStorage,
    loadFromLocalStorage,
  }
})
