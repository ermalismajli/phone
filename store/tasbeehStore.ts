import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import AsyncStorage from "@react-native-async-storage/async-storage"

export interface Tasbeeh {
  id: string
  name: string
  text: string
  target: number
  count: number
}

interface TasbeehState {
  tasbeehs: Tasbeeh[]
  selectedTasbeeh: Tasbeeh | null
  addTasbeeh: (tasbeeh: Omit<Tasbeeh, "id">) => void
  deleteTasbeeh: (id: string) => void
  selectTasbeeh: (id: string) => void
  updateTasbeehCount: (id: string, count: number) => void
  resetTasbeehCount: (id: string) => void
}

export const useTasbeehStore = create<TasbeehState>()(
  persist(
    (set, get) => ({
      tasbeehs: [],
      selectedTasbeeh: null,

      addTasbeeh: (tasbeeh) => {
        const newTasbeeh = {
          ...tasbeeh,
          id: Date.now().toString(),
        }

        set((state) => ({
          tasbeehs: [...state.tasbeehs, newTasbeeh],
          selectedTasbeeh: newTasbeeh,
        }))
      },

      deleteTasbeeh: (id) => {
        set((state) => {
          const newTasbeehs = state.tasbeehs.filter((t) => t.id !== id)
          const newSelected =
            state.selectedTasbeeh?.id === id ? (newTasbeehs.length > 0 ? newTasbeehs[0] : null) : state.selectedTasbeeh

          return {
            tasbeehs: newTasbeehs,
            selectedTasbeeh: newSelected,
          }
        })
      },

      selectTasbeeh: (id) => {
        set((state) => ({
          selectedTasbeeh: state.tasbeehs.find((t) => t.id === id) || null,
        }))
      },

      updateTasbeehCount: (id, count) => {
        set((state) => ({
          tasbeehs: state.tasbeehs.map((t) => (t.id === id ? { ...t, count } : t)),
          selectedTasbeeh:
            state.selectedTasbeeh?.id === id ? { ...state.selectedTasbeeh, count } : state.selectedTasbeeh,
        }))
      },

      resetTasbeehCount: (id) => {
        set((state) => ({
          tasbeehs: state.tasbeehs.map((t) => (t.id === id ? { ...t, count: 0 } : t)),
          selectedTasbeeh:
            state.selectedTasbeeh?.id === id ? { ...state.selectedTasbeeh, count: 0 } : state.selectedTasbeeh,
        }))
      },
    }),
    {
      name: "tasbeeh-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
)

