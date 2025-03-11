import type React from "react"
import { View, Text, Image, StyleSheet } from "react-native"

const EmptyState: React.FC = () => {
  return (
    <View style={styles.emptyState}>
      <Image
        source={{ uri: "https://cdn-icons-png.flaticon.com/512/6195/6195678.png" }}
        style={styles.emptyStateImage}
      />
      <Text style={styles.emptyStateText}>No tasks for this day</Text>
      <Text style={styles.emptyStateSubtext}>Tap the + button to add tasks</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 40,
  },
  emptyStateImage: {
    width: 120,
    height: 120,
    marginBottom: 20,
    opacity: 0.7,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 10,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: "#999",
  },
})

export default EmptyState

