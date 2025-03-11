import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Ionicons } from "react-native-vector-icons"
import GradientView from "../ramadan/GradientView"

interface QuranHeaderProps {
  title: string
  subtitle?: string
  isDarkMode: boolean
  toggleDarkMode: () => void
  showBackButton: boolean
  onBackPress: () => void
}

const QuranHeader: React.FC<QuranHeaderProps> = ({
  title,
  subtitle,
  isDarkMode,
  toggleDarkMode,
  showBackButton,
  onBackPress,
}) => {
  return (
    <GradientView colors={["#2C6B2F", "#4CAF50"]} style={styles.header}>
      <View style={styles.headerContent}>
        {showBackButton && (
          <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        )}

        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        <TouchableOpacity style={styles.darkModeButton} onPress={toggleDarkMode}>
          <Ionicons name={isDarkMode ? "sunny" : "moon"} size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </GradientView>
  )
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginTop: 4,
  },
  darkModeButton: {
    padding: 8,
    marginLeft: 10,
  },
})

export default QuranHeader

