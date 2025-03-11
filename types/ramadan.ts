export interface ChecklistItem {
    id: string
    text: string
    isCompleted: boolean
  }
  
  export interface Task {
    id: number
    title: string
    description: string
    hasChecklist: boolean
    checklistItems?: ChecklistItem[]
    isCompleted: boolean
    createdAt?: string
  }
  
  export interface TasksByDate {
    [date: string]: Task[]
  }
  
  