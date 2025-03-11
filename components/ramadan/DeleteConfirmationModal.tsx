import type React from "react"
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native"
import { Ionicons } from "react-native-vector-icons"
import { Dimensions } from "react-native"

const { width } = Dimensions.get("window")

interface DeleteConfirmationModalProps {
  visible: boolean
  deleteMode: "current" | "all"
  onClose: () => void
  onDelete: () => void
  onChangeDeleteMode: (mode: "current" | "all") => void
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  visible,
  deleteMode,
  onClose,
  onDelete,
  onChangeDeleteMode,
}) => {
  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.warningIconContainer}>
            <Ionicons name="warning" size={40} color="#fff" />
          </View>

          <Text style={styles.deleteModalTitle}>Delete Task</Text>
          <Text style={styles.deleteModalDescription}>How would you like to delete this task?</Text>

          <View style={styles.deleteOptionsContainer}>
            <TouchableOpacity
              style={[styles.deleteOption, deleteMode === "current" && styles.selectedDeleteOption]}
              onPress={() => onChangeDeleteMode("current")}
            >
              <Ionicons
                name={deleteMode === "current" ? "radio-button-on" : "radio-button-off"}
                size={24}
                color={deleteMode === "current" ? "#2C6B2F" : "#666"}
                style={styles.deleteOptionIcon}
              />
              <View style={styles.deleteOptionTextContainer}>
                <Text style={styles.deleteOptionTitle}>Delete from today only</Text>
                <Text style={styles.deleteOptionDescription}>This task will be removed only from today's list</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.deleteOption, deleteMode === "all" && styles.selectedDeleteOption]}
              onPress={() => onChangeDeleteMode("all")}
            >
              <Ionicons
                name={deleteMode === "all" ? "radio-button-on" : "radio-button-off"}
                size={24}
                color={deleteMode === "all" ? "#2C6B2F" : "#666"}
                style={styles.deleteOptionIcon}
              />
              <View style={styles.deleteOptionTextContainer}>
                <Text style={styles.deleteOptionTitle}>Delete from all days</Text>
                <Text style={styles.deleteOptionDescription}>
                  This task will be removed from all days, including future occurrences
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.deleteModalButtons}>
            <TouchableOpacity style={[styles.deleteModalButton, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.deleteModalButton, styles.confirmButton]} onPress={onDelete}>
              <Text style={styles.confirmButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
    maxHeight: "auto",
    padding: 0,
    overflow: "hidden",
  },
  warningIconContainer: {
    backgroundColor: "#FF5733",
    width: "100%",
    padding: 20,
    alignItems: "center",
  },
  deleteModalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  deleteModalDescription: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  deleteOptionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  deleteOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    marginBottom: 10,
  },
  selectedDeleteOption: {
    borderColor: "#2C6B2F",
    backgroundColor: "#f0f8f0",
  },
  deleteOptionIcon: {
    marginRight: 15,
  },
  deleteOptionTextContainer: {
    flex: 1,
  },
  deleteOptionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  deleteOptionDescription: {
    fontSize: 14,
    color: "#777",
  },
  deleteModalButtons: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  deleteModalButton: {
    flex: 1,
    padding: 15,
    alignItems: "center",
  },
  cancelButton: {
    borderRightWidth: 1,
    borderRightColor: "#eee",
  },
  confirmButton: {
    backgroundColor: "#FF5733",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
})

export default DeleteConfirmationModal

