"use client"

import { useState, useEffect } from "react"
import { View, StyleSheet, Text, TouchableOpacity, StatusBar, Dimensions } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Ionicons } from "react-native-vector-icons"

// Import components
import TasbeehCounter from "@/components/tasbeeh/TasbeehCounter"
import AddTasbeehModal from "@/components/tasbeeh/AddTasbeehModal"
import TasbeehListModal from "@/components/tasbeeh/TasbeehListModal"
import GradientView from "@/components/ramadan/GradientView"

// Import types
import type { Tasbeeh } from "@/types/tasbeeh"

const { width, height } = Dimensions.get("window")

// Default Tasbeehs
const defaultTasbeehs: Tasbeeh[] = [
  {
    id: "1",
    name: "Subhanallah",
    target: 33,
    count: 0,
    color: "#4CAF50",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Alhamdulillah",
    target: 33,
    count: 0,
    color: "#2196F3",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Allahu Akbar",
    target: 34,
    count: 0,
    color: "#9C27B0",
    createdAt: new Date().toISOString(),
  },
]

export default function TasbeehScreen() {
  const [count, setCount] = useState(0)
  const [tasbeehs, setTasbeehs] = useState<Tasbeeh[]>([])
  const [activeTasbeeh, setActiveTasbeeh] = useState<Tasbeeh | null>(null)
  const [isAddModalVisible, setAddModalVisible] = useState(false)
  const [isListModalVisible, setListModalVisible] = useState(false)
  const [vibrationEnabled, setVibrationEnabled] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)

  // Load tasbeehs from storage
  useEffect(() => {
    const loadTasbeehs = async () => {
      try {
        const storedTasbeehs = await AsyncStorage.getItem("tasbeehs")

        if (storedTasbeehs) {
          const parsedTasbeehs = JSON.parse(storedTasbeehs)
          setTasbeehs(parsedTasbeehs)

          // Set the first tasbeeh as active if available
          if (parsedTasbeehs.length > 0) {
            setActiveTasbeeh(parsedTasbeehs[0])
            setCount(parsedTasbeehs[0].count)
          }
        } else {
          // Initialize with default tasbeehs if none exist
          setTasbeehs(defaultTasbeehs)
          setActiveTasbeeh(defaultTasbeehs[0])
          setCount(defaultTasbeehs[0].count)
          await AsyncStorage.setItem("tasbeehs", JSON.stringify(defaultTasbeehs))
        }

        // Load settings
        const vibrationSetting = await AsyncStorage.getItem("vibrationEnabled")
        if (vibrationSetting !== null) {
          setVibrationEnabled(JSON.parse(vibrationSetting))
        }

        const soundSetting = await AsyncStorage.getItem("soundEnabled")
        if (soundSetting !== null) {
          setSoundEnabled(JSON.parse(soundSetting))
        }
      } catch (error) {
        console.error("Error loading tasbeehs:", error)
      }
    }

    loadTasbeehs()
  }, [])

  // Save tasbeehs when they change
  useEffect(() => {
    const saveTasbeehs = async () => {
      try {
        if (tasbeehs.length > 0) {
          await AsyncStorage.setItem("tasbeehs", JSON.stringify(tasbeehs))
        }
      } catch (error) {
        console.error("Error saving tasbeehs:", error)
      }
    }

    saveTasbeehs()
  }, [tasbeehs])

  // Update active tasbeeh count
  useEffect(() => {
    if (activeTasbeeh) {
      const updatedTasbeehs = tasbeehs.map((tasbeeh) =>
        tasbeeh.id === activeTasbeeh.id ? { ...tasbeeh, count } : tasbeeh,
      )
      setTasbeehs(updatedTasbeehs)
    }
  }, [count])

  // Increment counter
  const incrementCount = () => {
    setCount((prevCount) => prevCount + 1)
  }

  // Decrement counter
  const decrementCount = () => {
    setCount((prevCount) => (prevCount > 0 ? prevCount - 1 : 0))
  }

  // Reset counter
  const resetCount = () => {
    setCount(0)
  }

  // Add new tasbeeh
  const addTasbeeh = (newTasbeeh: Omit<Tasbeeh, "id" | "createdAt">) => {
    const tasbeehToAdd: Tasbeeh = {
      ...newTasbeeh,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }

    const updatedTasbeehs = [...tasbeehs, tasbeehToAdd]
    setTasbeehs(updatedTasbeehs)
    setActiveTasbeeh(tasbeehToAdd)
    setCount(tasbeehToAdd.count)
    setAddModalVisible(false)
  }

  // Delete tasbeeh
  const deleteTasbeeh = (id: string) => {
    const updatedTasbeehs = tasbeehs.filter((tasbeeh) => tasbeeh.id !== id)
    setTasbeehs(updatedTasbeehs)

    // If the active tasbeeh is deleted, set the first available one as active
    if (activeTasbeeh && activeTasbeeh.id === id) {
      if (updatedTasbeehs.length > 0) {
        setActiveTasbeeh(updatedTasbeehs[0])
        setCount(updatedTasbeehs[0].count)
      } else {
        setActiveTasbeeh(null)
        setCount(0)
      }
    }
  }

  // Select tasbeeh
  const selectTasbeeh = (tasbeeh: Tasbeeh) => {
    setActiveTasbeeh(tasbeeh)
    setCount(tasbeeh.count)
    setListModalVisible(false)
  }

  // Toggle settings
  const toggleVibration = () => {
    const newValue = !vibrationEnabled
    setVibrationEnabled(newValue)
    AsyncStorage.setItem("vibrationEnabled", JSON.stringify(newValue))
  }

  const toggleSound = () => {
    const newValue = !soundEnabled
    setSoundEnabled(newValue)
    AsyncStorage.setItem("soundEnabled", JSON.stringify(newValue))
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <GradientView colors={["#2C6B2F", "#4CAF50"]} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Tasbeeh</Text>
          {activeTasbeeh && (
            <View style={styles.activeTasbeehBadge}>
              <View style={[styles.colorDot, { backgroundColor: activeTasbeeh.color }]} />
              <Text style={styles.activeTasbeehName}>{activeTasbeeh.name}</Text>
            </View>
          )}
        </View>
      </GradientView>

      <View style={styles.counterContainer}>
        <TasbeehCounter
          count={count}
          target={activeTasbeeh?.target || 0}
          color={activeTasbeeh?.color || "#4CAF50"}
          onPress={incrementCount}
          vibrationEnabled={vibrationEnabled}
          soundEnabled={soundEnabled}
        />
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.iconButton} onPress={decrementCount}>
          <View style={[styles.iconCircle, { backgroundColor: "#FF5733" }]}>
            <Ionicons name="remove" size={22} color="#fff" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={resetCount}>
          <View style={[styles.iconCircle, { backgroundColor: "#2196F3" }]}>
            <Ionicons name="refresh" size={22} color="#fff" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={() => setListModalVisible(true)}>
          <View style={[styles.iconCircle, { backgroundColor: "#2C6B2F" }]}>
            <Ionicons name="list" size={22} color="#fff" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={() => setAddModalVisible(true)}>
          <View style={[styles.iconCircle, { backgroundColor: "#4CAF50" }]}>
            <Ionicons name="add" size={22} color="#fff" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={toggleVibration}>
          <View style={[styles.iconCircle, { backgroundColor: vibrationEnabled ? "#9C27B0" : "#e0e0e0" }]}>
            <Ionicons name="vibrate" size={22} color="#fff" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={toggleSound}>
          <View style={[styles.iconCircle, { backgroundColor: soundEnabled ? "#FF9800" : "#e0e0e0" }]}>
            <Ionicons name="volume-high" size={22} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <AddTasbeehModal visible={isAddModalVisible} onClose={() => setAddModalVisible(false)} onAdd={addTasbeeh} />

      <TasbeehListModal
        visible={isListModalVisible}
        tasbeehs={tasbeehs}
        activeTasbeehId={activeTasbeeh?.id}
        onClose={() => setListModalVisible(false)}
        onSelect={selectTasbeeh}
        onDelete={deleteTasbeeh}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  header: {
    paddingTop: 25,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  activeTasbeehBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  activeTasbeehName: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
  },
  counterContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    flexWrap: "wrap",
    paddingHorizontal: 10,
    paddingBottom: 20,
    paddingTop: 15,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 10,
  },
  iconButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
    marginHorizontal: 1,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
})

