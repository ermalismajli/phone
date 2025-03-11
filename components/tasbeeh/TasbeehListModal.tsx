import type React from "react"
import { View, Text, Modal, TouchableOpacity, StyleSheet, FlatList, Alert, Image } from "react-native"
import { Ionicons } from "react-native-vector-icons"
import GradientView from "../ramadan/GradientView"
import { Dimensions } from "react-native"
import type { Tasbeeh } from "../../types/tasbeeh"

const { width } = Dimensions.get("window")

interface TasbeehListModalProps {
  visible: boolean
  tasbeehs: Tasbeeh[]
  activeTasbeehId?: string
  onClose: () => void
  onSelect: (tasbeeh: Tasbeeh) => void
  onDelete: (id: string) => void
}

const TasbeehListModal: React.FC<TasbeehListModalProps> = ({
  visible,
  tasbeehs,
  activeTasbeehId,
  onClose,
  onSelect,
  onDelete,
}) => {
  const confirmDelete = (id: string) => {
    Alert.alert("Delete Tasbeeh", "Are you sure you want to delete this tasbeeh?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => onDelete(id) },
    ])
  }

  const renderItem = ({ item }: { item: Tasbeeh }) => {
    const isActive = item.id === activeTasbeehId
    const progress = item.target > 0 ? (item.count / item.target) * 100 : 0
    const isCompleted = item.target > 0 && item.count >= item.target

    return (
      <TouchableOpacity
        style={[styles.tasbeehItem, isActive && styles.activeTasbeehItem]}
        onPress={() => onSelect(item)}
      >
        <View style={styles.tasbeehContent}>
          <View style={[styles.colorBar, { backgroundColor: item.color }]} />

          <View style={styles.tasbeehInfo}>
            <Text style={styles.tasbeehName}>{item.name}</Text>
            <View style={styles.countContainer}>
              <Text style={styles.tasbeehCount}>
                {item.count}
                {item.target > 0 ? `/${item.target}` : ""}
              </Text>

              {isCompleted && (
                <View style={styles.completedIcon}>
                  <Ionicons name="checkmark-circle" size={16} color={item.color} />
                </View>
              )}
            </View>

            {item.target > 0 && (
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${progress}%`,
                        backgroundColor: item.color,
                      },
                    ]}
                  />
                </View>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.deleteButton} onPress={() => confirmDelete(item.id)}>
            <Ionicons name="trash-outline" size={20} color="#FF5733" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <GradientView colors={["#2C6B2F", "#4CAF50"]} style={styles.modalHeader}>
            <Text style={styles.modalTitle}>My Tasbeehs</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={28} color="#fff" />
            </TouchableOpacity>
          </GradientView>

          {tasbeehs.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Image
                source={{ uri: "https://cdn-icons-png.flaticon.com/512/5894/5894523.png" }}
                style={styles.emptyImage}
              />
              <Text style={styles.emptyText}>No tasbeehs yet</Text>
              <Text style={styles.emptySubtext}>Add a new tasbeeh to get started</Text>
            </View>
          ) : (
            <FlatList
              data={tasbeehs}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
            />
          )}
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
  listContent: {
    padding: 12,
    paddingBottom: 20,
  },
  tasbeehItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  activeTasbeehItem: {
    backgroundColor: "#f0f8f0",
  },
  tasbeehContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  colorBar: {
    width: 6,
    height: "100%",
    alignSelf: "stretch",
  },
  tasbeehInfo: {
    flex: 1,
    padding: 15,
  },
  tasbeehName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  countContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  tasbeehCount: {
    fontSize: 16,
    color: "#666",
  },
  completedIcon: {
    marginLeft: 8,
  },
  progressBarContainer: {
    marginTop: 5,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#eee",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  deleteButton: {
    padding: 15,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyImage: {
    width: 100,
    height: 100,
    opacity: 0.7,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
})

export default TasbeehListModal

