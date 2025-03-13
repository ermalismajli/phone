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
  onSettingsPress?: () => void // Add this new prop
}

const QuranHeader: React.FC<QuranHeaderProps> = ({
  title,
  subtitle,
  isDarkMode,
  toggleDarkMode,
  showBackButton,
  onBackPress,
  onSettingsPress, // Add this new prop
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
          {subtitle && (
            <View style={styles.subtitleContainer}>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
          )}
        </View>

        <View style={styles.headerButtons}>
          {onSettingsPress && (
            <TouchableOpacity style={styles.iconButton} onPress={onSettingsPress}>
              <Ionicons name="settings-outline" size={22} color="#fff" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.darkModeButton} onPress={toggleDarkMode}>
            <Ionicons name={isDarkMode ? "sunny" : "moon"} size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </GradientView>
  )
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 18, // Reduced from 50
    paddingBottom: 10, // Reduced from 15
    paddingHorizontal: 16, // Reduced from 20
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 6, // Reduced from 8
    marginRight: 8, // Reduced from 10
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    width: 36, // Reduced from 40
    height: 36, // Reduced from 40
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 20, // Reduced from 24
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  subtitleContainer: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10, // Reduced from 12
    paddingVertical: 3, // Reduced from 4
    borderRadius: 10, // Reduced from 12
    marginTop: 4, // Reduced from 6
  },
  subtitle: {
    fontSize: 12, // Reduced from 14
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: 6,
    marginLeft: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 18,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  darkModeButton: {
    padding: 6, // Reduced from 8
    marginLeft: 6, // Reduced from 10
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 18,
    width: 36, // Reduced from 40
    height: 36, // Reduced from 40
    alignItems: "center",
    justifyContent: "center",
  },
})

export default QuranHeader

