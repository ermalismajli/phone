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
        <Ionicons name="bookmark-outline" size={16} color={isDarkMode ? "#4CAF50" : "#2C6B2F"} />
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
    backgroundColor: "#ddd",
  },
  darkLine: {
    backgroundColor: "#444",
  },
  pageNumberContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f8f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginHorizontal: 10,
  },
  darkPageNumberContainer: {
    backgroundColor: "#1e3e1f",
  },
  pageNumber: {
    color: "#2C6B2F",
    fontWeight: "500",
    fontSize: 14,
    marginLeft: 5,
  },
  darkPageNumber: {
    color: "#4CAF50",
  },
})

export default PageIndicator

