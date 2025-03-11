import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native"
import { Ionicons } from "react-native-vector-icons"
import type { RecentRead } from "../../types/quran"

interface RecentlyReadProps {
  recentlyRead: RecentRead[]
  onSelectRecent: (recentRead: RecentRead) => void
  isDarkMode: boolean
}

const RecentlyRead: React.FC<RecentlyReadProps> = ({ recentlyRead, onSelectRecent, isDarkMode }) => {
  if (recentlyRead.length === 0) {
    return null
  }

  // Format timestamp to relative time (e.g., "2 hours ago")
  const getRelativeTime = (timestamp: string) => {
    const now = new Date()
    const past = new Date(timestamp)
    const diffMs = now.getTime() - past.getTime()

    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) {
      return `${diffMins} min ago`
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`
    } else {
      return `${diffDays} days ago`
    }
  }

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Continue Reading</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {recentlyRead.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.recentItem, isDarkMode && styles.darkRecentItem]}
            onPress={() => onSelectRecent(item)}
          >
            <View style={styles.recentItemContent}>
              <View style={styles.recentItemHeader}>
                <Text style={[styles.recentItemTitle, isDarkMode && styles.darkText]}>{item.surahName}</Text>
                <Text style={styles.recentItemArabic}>{item.surahNameArabic}</Text>
              </View>

              <View style={styles.recentItemFooter}>
                <View style={styles.detailsContainer}>
                  <View style={styles.detailItem}>
                    <Ionicons name="book-outline" size={12} color={isDarkMode ? "#aaa" : "#666"} />
                    <Text style={[styles.detailText, isDarkMode && styles.darkDetailText]}>Surah {item.surah}</Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Ionicons name="document-text-outline" size={12} color={isDarkMode ? "#aaa" : "#666"} />
                    <Text style={[styles.detailText, isDarkMode && styles.darkDetailText]}>Page {item.page}</Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Ionicons name="time-outline" size={12} color={isDarkMode ? "#aaa" : "#666"} />
                    <Text style={[styles.detailText, isDarkMode && styles.darkDetailText]}>
                      {getRelativeTime(item.timestamp)}
                    </Text>
                  </View>
                </View>

                <View style={styles.readMoreContainer}>
                  <Ionicons name="arrow-forward-circle" size={20} color="#2C6B2F" />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  darkContainer: {
    backgroundColor: "#121212",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  darkText: {
    color: "#fff",
  },
  scrollContent: {
    paddingRight: 16,
  },
  recentItem: {
    width: 200,
    height: 120,
    marginRight: 10,
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: "hidden",
    borderLeftWidth: 3,
    borderLeftColor: "#2C6B2F",
  },
  darkRecentItem: {
    backgroundColor: "#1e1e1e",
  },
  recentItemContent: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  recentItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  recentItemTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  recentItemArabic: {
    fontSize: 14,
    color: "#2C6B2F",
    fontWeight: "500",
  },
  recentItemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  detailsContainer: {
    flex: 1,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  detailText: {
    fontSize: 11,
    color: "#666",
    marginLeft: 4,
  },
  darkDetailText: {
    color: "#aaa",
  },
  readMoreContainer: {
    padding: 4,
  },
})

export default RecentlyRead

