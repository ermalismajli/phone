"use client"

import type React from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Switch,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { Ionicons } from "react-native-vector-icons"
import GradientView from "./GradientView"
import { Dimensions } from "react-native"

const { width } = Dimensions.get("window")

interface AddTaskModalProps {
  visible: boolean
  newTask: {
    title: string
    description: string
    hasChecklist: boolean
    checklistItems: Array<{
      id: string
      text: string
      isCompleted: boolean
    }>
  }
  isRecurring: boolean
  onClose: () => void
  onAddTask: () => void
  onChangeTitle: (text: string) => void
  onChangeDescription: (text: string) => void
  onToggleHasChecklist: () => void
  onToggleRecurring: (value: boolean) => void
  onAddChecklistItem: () => void
  onRemoveChecklistItem: (id: string) => void
  onUpdateChecklistItemText: (id: string, text: string) => void
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({
  visible,
  newTask,
  isRecurring,
  onClose,
  onAddTask,
  onChangeTitle,
  onChangeDescription,
  onToggleHasChecklist,
  onToggleRecurring,
  onAddChecklistItem,
  onRemoveChecklistItem,
  onUpdateChecklistItemText,
}) => {
  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <GradientView colors={["#2C6B2F", "#4CAF50"]} style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Task</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close-circle" size={28} color="#fff" />
              </TouchableOpacity>
            </GradientView>

            <ScrollView style={styles.modalScrollContent}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Task Title</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter task title"
                  value={newTask.title}
                  onChangeText={onChangeTitle}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Task Description</Text>
                <TextInput
                  style={[styles.modalInput, styles.textArea]}
                  placeholder="Enter task description"
                  value={newTask.description}
                  onChangeText={onChangeDescription}
                  multiline={true}
                  numberOfLines={4}
                />
              </View>

              <View style={styles.checklistToggleContainer}>
                <Text style={styles.inputLabel}>Add Checklist</Text>
                <Switch
                  value={newTask.hasChecklist}
                  onValueChange={onToggleHasChecklist}
                  trackColor={{ false: "#ccc", true: "#4CAF50" }}
                  thumbColor={newTask.hasChecklist ? "#fff" : "#f4f3f4"}
                />
              </View>

              {newTask.hasChecklist && (
                <View style={styles.checklistContainer}>
                  <View style={styles.checklistHeader}>
                    <Text style={styles.checklistHeaderText}>Checklist Items</Text>
                    <TouchableOpacity style={styles.addChecklistButton} onPress={onAddChecklistItem}>
                      <Ionicons name="add-circle" size={24} color="#2C6B2F" />
                    </TouchableOpacity>
                  </View>

                  {newTask.checklistItems.map((item, index) => (
                    <View key={item.id} style={styles.checklistItemInput}>
                      <Text style={styles.checklistItemNumber}>{index + 1}.</Text>
                      <TextInput
                        style={styles.checklistItemTextInput}
                        placeholder={`Checklist item ${index + 1}`}
                        value={item.text}
                        onChangeText={(text) => onUpdateChecklistItemText(item.id, text)}
                      />
                      <TouchableOpacity
                        style={styles.removeChecklistButton}
                        onPress={() => onRemoveChecklistItem(item.id)}
                      >
                        <Ionicons name="remove-circle" size={24} color="#FF5733" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.recurringContainer}>
                <Text style={styles.recurringText}>Add to future days</Text>
                <Switch
                  value={isRecurring}
                  onValueChange={onToggleRecurring}
                  trackColor={{ false: "#ccc", true: "#4CAF50" }}
                  thumbColor={isRecurring ? "#fff" : "#f4f3f4"}
                />
              </View>

              <Text style={styles.recurringDescription}>
                {isRecurring
                  ? "This task will appear on today and all future days"
                  : "This task will only appear on today's list"}
              </Text>
            </ScrollView>

            <TouchableOpacity style={styles.addButton} onPress={onAddTask}>
              <Text style={styles.addButtonText}>Add Task</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: width * 0.9,
    maxWidth: 400,
    alignItems: "stretch",
    maxHeight: "80%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  modalScrollContent: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
    marginBottom: 8,
  },
  modalInput: {
    width: "100%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  checklistToggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  checklistContainer: {
    marginBottom: 20,
  },
  checklistHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  checklistHeaderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
  },
  addChecklistButton: {
    padding: 5,
  },
  checklistItemInput: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  checklistItemNumber: {
    width: 25,
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
  },
  checklistItemTextInput: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  removeChecklistButton: {
    padding: 5,
    marginLeft: 5,
  },
  recurringContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  recurringText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
  },
  recurringDescription: {
    fontSize: 14,
    color: "#888",
    marginBottom: 20,
    fontStyle: "italic",
  },
  addButton: {
    backgroundColor: "#2C6B2F",
    padding: 18,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
})

export default AddTaskModal

