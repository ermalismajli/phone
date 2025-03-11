"use client"

import type React from "react"
import { View, Text, TouchableOpacity, Animated, StyleSheet } from "react-native"
import { Ionicons } from "react-native-vector-icons"
import ChecklistItem from "./ChecklistItem"

interface TaskItemProps {
  task: any
  isExpanded: boolean
  progress: number
  onToggleCompletion: () => void
  onToggleExpansion: () => void
  onDelete: () => void
  onToggleChecklistItem: (itemId: string) => void
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  isExpanded,
  progress,
  onToggleCompletion,
  onToggleExpansion,
  onDelete,
  onToggleChecklistItem,
}) => {
  return (
    <Animated.View
      style={[
        styles.taskContainer,
        task.isCompleted && styles.completedTask,
        {
          opacity: task.isCompleted ? 0.8 : 1,
          transform: [{ scale: 1 }],
        },
      ]}
    >
      <View style={styles.taskHeader}>
        <View style={styles.taskTitleContainer}>
          <TouchableOpacity
            style={[styles.checkbox, task.isCompleted && styles.checkboxChecked]}
            onPress={onToggleCompletion}
          >
            {task.isCompleted && <Ionicons name="checkmark" size={18} color="#fff" />}
          </TouchableOpacity>
          <Text style={[styles.taskTitle, task.isCompleted && styles.completedTitle]}>{task.title}</Text>
        </View>
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Ionicons name="trash-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <Text style={[styles.taskDescription, task.isCompleted && styles.completedDescription]}>{task.description}</Text>

      {task.hasChecklist && task.checklistItems && task.checklistItems.length > 0 && (
        <>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress}%` },
                  task.isCompleted && styles.progressFillComplete,
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {task.checklistItems.filter((item) => item.isCompleted).length}/{task.checklistItems.length} completed
            </Text>
          </View>

          <TouchableOpacity style={styles.expandButton} onPress={onToggleExpansion}>
            <Text style={styles.expandButtonText}>{isExpanded ? "Hide Checklist" : "Show Checklist"}</Text>
            <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={16} color="#2C6B2F" />
          </TouchableOpacity>

          {isExpanded && (
            <View style={styles.checklistContainer}>
              {task.checklistItems.map((item) => (
                <ChecklistItem key={item.id} item={item} onToggle={() => onToggleChecklistItem(item.id)} />
              ))}
            </View>
          )}
        </>
      )}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  taskContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    borderLeftWidth: 5,
    borderLeftColor: "#2C6B2F",
  },
  completedTask: {
    backgroundColor: "#e8f5e9",
    borderLeftColor: "#4CAF50",
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  taskTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#2C6B2F",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  completedTitle: {
    color: "#4CAF50",
  },
  deleteButton: {
    backgroundColor: "#FF5733",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  taskDescription: {
    fontSize: 16,
    color: "#555",
    marginLeft: 36,
    lineHeight: 22,
    marginBottom: 15,
  },
  completedDescription: {
    color: "#888",
  },
  progressContainer: {
    marginLeft: 36,
    marginBottom: 15,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 5,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2C6B2F",
    borderRadius: 4,
  },
  progressFillComplete: {
    backgroundColor: "#4CAF50",
  },
  progressText: {
    fontSize: 14,
    color: "#666",
  },
  expandButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginLeft: 36,
    marginBottom: 10,
  },
  expandButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C6B2F",
    marginRight: 5,
  },
  checklistContainer: {
    marginLeft: 36,
    marginTop: 5,
  },
})

export default TaskItem

