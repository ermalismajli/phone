import type React from "react"
import { ScrollView, StyleSheet } from "react-native"
import TaskItem from "./TaskItem"
import EmptyState from "./EmptyState"

interface TaskListProps {
  tasks: any[]
  expandedTasks: Record<number, boolean>
  calculateProgress: (task: any) => number
  toggleTaskCompletion: (taskId: number) => void
  toggleTaskExpansion: (taskId: number) => void
  confirmDeleteTask: (taskId: number) => void
  toggleChecklistItemCompletion: (taskId: number, itemId: string) => void
  scrollViewRef: React.RefObject<ScrollView>
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  expandedTasks,
  calculateProgress,
  toggleTaskCompletion,
  toggleTaskExpansion,
  confirmDeleteTask,
  toggleChecklistItemCompletion,
  scrollViewRef,
}) => {
  return (
    <ScrollView style={styles.scrollContainer} ref={scrollViewRef} contentContainerStyle={{ paddingBottom: 100 }}>
      {tasks.length === 0 ? (
        <EmptyState />
      ) : (
        tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            isExpanded={expandedTasks[task.id] || false}
            progress={calculateProgress(task)}
            onToggleCompletion={() => toggleTaskCompletion(task.id)}
            onToggleExpansion={() => toggleTaskExpansion(task.id)}
            onDelete={() => confirmDeleteTask(task.id)}
            onToggleChecklistItem={(itemId) => toggleChecklistItemCompletion(task.id, itemId)}
          />
        ))
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
})

export default TaskList

