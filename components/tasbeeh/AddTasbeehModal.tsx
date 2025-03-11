"use client"

import type React from "react"
import { useState } from "react"
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from "react-native"
import { Ionicons } from "react-native-vector-icons"
import GradientView from "../ramadan/GradientView"
import { Dimensions } from "react-native"

const { width } = Dimensions.get("window")

// Predefined colors for tasbeeh
const COLORS = [
  "#4CAF50", // Green
  "#2196F3", // Blue
  "#9C27B0", // Purple
  "#FF9800", // Orange
  "#F44336", // Red
  "#009688", // Teal
  "#795548", // Brown
  "#607D8B", // Blue Grey
]

interface AddTasbeehModalProps {
  visible: boolean
  onClose: () => void
  onAdd: (tasbeeh: { name: string; target: number; count: number; color: string }) => void
}

const AddTasbeehModal: React.FC<AddTasbeehModalProps> = ({ visible, onClose, onAdd }) => {
  const [name, setName] = useState("")
  const [target, setTarget] = useState("")
  const [selectedColor, setSelectedColor] = useState(COLORS[0])

  const handleAdd = () => {
    if (name.trim() === "") {
      Alert.alert("Error", "Please enter a name for your tasbeeh")
      return
    }

    const targetNumber = Number.parseInt(target)
    if (target !== "" && (isNaN(targetNumber) || targetNumber <= 0)) {
      Alert.alert("Error", "Target must be a positive number")
      return
    }

    onAdd({
      name: name.trim(),
      target: target === "" ? 0 : targetNumber,
      count: 0,
      color: selectedColor,
    })

    // Reset form
    setName("")
    setTarget("")
    setSelectedColor(COLORS[0])
  }

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <GradientView colors={["#2C6B2F", "#4CAF50"]} style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Tasbeeh</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close-circle" size={28} color="#fff" />
              </TouchableOpacity>
            </GradientView>

            <ScrollView style={styles.modalScrollContent}>
              <View style={styles.decorativeElement}>
                <Image
                  source={{ uri: "https://cdn-icons-png.flaticon.com/512/5894/5894523.png" }}
                  style={styles.decorativeImage}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Tasbeeh Name</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="text" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter tasbeeh name"
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Target Count (Optional)</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="flag" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter target count"
                    value={target}
                    onChangeText={setTarget}
                    keyboardType="number-pad"
                  />
                </View>
                <Text style={styles.inputHelp}>Leave empty for unlimited count</Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Select Color</Text>
                <View style={styles.colorContainer}>
                  {COLORS.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        selectedColor === color && styles.selectedColorOption,
                      ]}
                      onPress={() => setSelectedColor(color)}
                    >
                      {selectedColor === color && <Ionicons name="checkmark" size={20} color="#fff" />}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
              <Text style={styles.addButtonText}>Add Tasbeeh</Text>
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
    maxHeight: "90%",
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
    paddingBottom: 10,
  },
  decorativeElement: {
    alignItems: "center",
    marginBottom: 20,
  },
  decorativeImage: {
    width: 80,
    height: 80,
    opacity: 0.8,
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
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    backgroundColor: "#f9f9f9",
  },
  inputIcon: {
    padding: 15,
  },
  input: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  inputHelp: {
    fontSize: 14,
    color: "#888",
    marginTop: 5,
    fontStyle: "italic",
  },
  colorContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    justifyContent: "center",
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    margin: 8,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  selectedColorOption: {
    borderWidth: 3,
    borderColor: "#333",
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

export default AddTasbeehModal

