import type React from "react"
import { TouchableOpacity, StyleSheet } from "react-native"
import { Ionicons } from "react-native-vector-icons"

interface FloatingActionButtonProps {
  onPress: () => void
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress}>
      <Ionicons name="add" size={30} color="#fff" />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#2C6B2F",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
})

export default FloatingActionButton

