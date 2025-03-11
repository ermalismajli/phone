import type React from "react"
import { View, TouchableOpacity, StyleSheet } from "react-native"
import { Ionicons } from "react-native-vector-icons"

interface TasbeehControlsProps {
  onDecrement: () => void
  onReset: () => void
}

const TasbeehControls: React.FC<TasbeehControlsProps> = ({ onDecrement, onReset }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.controlButton, styles.decrementButton]}
        onPress={onDecrement}
        activeOpacity={0.7}
      >
        <Ionicons name="remove" size={28} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.controlButton, styles.resetButton]} onPress={onReset} activeOpacity={0.7}>
        <Ionicons name="refresh" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 20,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  decrementButton: {
    backgroundColor: "#FF5733",
  },
  resetButton: {
    backgroundColor: "#2196F3",
  },
})

export default TasbeehControls

