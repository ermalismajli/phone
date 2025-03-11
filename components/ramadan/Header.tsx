import type React from "react"
import { Text, TouchableOpacity, StyleSheet, Platform } from "react-native"
import { Ionicons } from "react-native-vector-icons"
import moment from "moment"
import GradientView from "./GradientView"

interface HeaderProps {
  currentDay: number
  selectedDate: string
  onDatePress: () => void
}

const Header: React.FC<HeaderProps> = ({ currentDay, selectedDate, onDatePress }) => {
  return (
    <GradientView colors={["#2C6B2F", "#4CAF50"]} style={styles.header}>
      <Text style={styles.title}>Ramadan To-Do List</Text>
      <TouchableOpacity style={styles.dateSelector} onPress={onDatePress}>
        <Text style={styles.dateText}>
          Day {currentDay} - {moment(selectedDate).format("MMM DD")}
        </Text>
        <Ionicons name="calendar-outline" size={24} color="#fff" />
      </TouchableOpacity>
    </GradientView>
  )
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 25,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 15,
    fontFamily: Platform.OS === "ios" ? "Avenir" : "Roboto",
  },
  dateSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 20,
  },
  dateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginRight: 10,
  },
})

export default Header

