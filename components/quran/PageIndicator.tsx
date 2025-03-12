import type React from "react"
import { View, Text, StyleSheet } from "react-native"
import { Ionicons } from "react-native-vector-icons"

interface PageIndicatorProps {
  pageNumber: number
  isDarkMode: boolean
}

const PageIndicator: React.FC<PageIndicatorProps> = ({ pageNumber, isDarkMode }) => {
  return (
    <View style={styles.container}>
      <View style={[styles.line, isDarkMode && styles.darkLine]} />

      <View style={[styles.pageNumberContainer, isDarkMode && styles.darkPageNumberContainer]}>
        <Ionicons name="book-outline" size={16} color={isDarkMode ? "#4CAF50" : "#2C6B2F"} />
        <Text style={[styles.pageNumber, isDarkMode && styles.darkPageNumber]}>Page {pageNumber}</Text>
      </View>

      <View style={[styles.line, isDarkMode && styles.darkLine]} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#2C6B2F",
    opacity: 0.3,
  },
  darkLine: {
    backgroundColor: "#4CAF50",
    opacity: 0.5,
  },
  pageNumberContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 15,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: "#2C6B2F",
  },
  darkPageNumberContainer: {
    backgroundColor: "#1e3e1f",
    borderColor: "#4CAF50",
  },
  pageNumber: {
    color: "#2C6B2F",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 6,
  },
  darkPageNumber: {
    color: "#4CAF50",
  },
})

export default PageIndicator

