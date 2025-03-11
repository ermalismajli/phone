import type React from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { Ionicons } from "react-native-vector-icons"

interface ChecklistItemProps {
  item: {
    id: string
    text: string
    isCompleted: boolean
  }
  onToggle: () => void
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({ item, onToggle }) => {
  return (
    <TouchableOpacity style={styles.checklistItem} onPress={onToggle}>
      <View style={[styles.checklistItemCheckbox, item.isCompleted && styles.checklistItemCheckboxChecked]}>
        {item.isCompleted && <Ionicons name="checkmark" size={16} color="#fff" />}
      </View>
      <Text style={[styles.checklistItemText, item.isCompleted && styles.checklistItemTextCompleted]}>{item.text}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  checklistItemCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#2C6B2F",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checklistItemCheckboxChecked: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  checklistItemText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  checklistItemTextCompleted: {
    color: "#4CAF50",
    textDecorationLine: "line-through",
  },
})

export default ChecklistItem

