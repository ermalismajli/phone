"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native"
import { Ionicons } from "react-native-vector-icons"
import type { Surah } from "@/types/quran"
import { QuranService } from "@/services/QuranService"

interface SurahListProps {
  surahList: Surah[]
  onSelectSurah: (surahNumber: number) => void
  searchQuery: string
  isDarkMode: boolean
}

const SurahList: React.FC<SurahListProps> = ({ surahList, onSelectSurah, searchQuery, isDarkMode }) => {
  const [loading, setLoading] = useState(true)
  const [filteredSurahs, setFilteredSurahs] = useState<Surah[]>([])

  // Load and filter surahs
  useEffect(() => {
    setLoading(true)

    // Simulate loading all surahs from the service
    setTimeout(() => {
      const surahs = searchQuery ? QuranService.searchSurahs(searchQuery) : QuranService.getAllSurahs()

      setFilteredSurahs(surahs)
      setLoading(false)
    }, 300)
  }, [searchQuery])

  // Render a surah item
  const renderItem = ({ item }: { item: Surah }) => {
    return (
      <TouchableOpacity
        style={[styles.surahItem, isDarkMode && styles.darkSurahItem]}
        onPress={() => onSelectSurah(item.number)}
      >
        <View style={styles.surahNumberContainer}>
          <Text style={styles.surahNumber}>{item.number}</Text>
        </View>

        <View style={styles.surahInfo}>
          <Text style={[styles.surahName, isDarkMode && styles.darkText]}>{item.nameAlbanian}</Text>
          <Text style={[styles.surahMeta, isDarkMode && styles.darkMetaText]}>
            {item.revelationType} • {item.numberOfAyahs} vargje
          </Text>
        </View>

        <Text style={styles.surahArabicName}>{item.nameArabic}</Text>
      </TouchableOpacity>
    )
  }

  // Render loading state
  if (loading) {
    return (
      <View style={[styles.loadingContainer, isDarkMode && styles.darkListContainer]}>
        <ActivityIndicator size="large" color="#2C6B2F" />
        <Text style={[styles.loadingText, isDarkMode && styles.darkText]}>Duke ngarkuar suret...</Text>
      </View>
    )
  }

  // Render empty state
  if (filteredSurahs.length === 0) {
    return (
      <View style={[styles.emptyContainer, isDarkMode && styles.darkListContainer]}>
        <Ionicons name="search-outline" size={50} color={isDarkMode ? "#555" : "#ccc"} />
        <Text style={[styles.emptyText, isDarkMode && styles.darkText]}>Nuk u gjet asnjë sure për "{searchQuery}"</Text>
      </View>
    )
  }

  return (
    <FlatList
      data={filteredSurahs}
      renderItem={renderItem}
      keyExtractor={(item) => `surah-${item.number}`}
      contentContainerStyle={[styles.listContainer, isDarkMode && styles.darkListContainer]}
      initialNumToRender={10}
      maxToRenderPerBatch={20}
      windowSize={10}
    />
  )
}

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  darkListContainer: {
    backgroundColor: "#121212",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
  surahItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginBottom: 8,
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  darkSurahItem: {
    backgroundColor: "#1e1e1e",
    borderBottomColor: "#333",
  },
  surahNumberContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2C6B2F",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  surahNumber: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  surahInfo: {
    flex: 1,
  },
  surahName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  darkText: {
    color: "#fff",
  },
  darkMetaText: {
    color: "#aaa",
  },
  surahMeta: {
    fontSize: 12,
    color: "#666",
  },
  surahArabicName: {
    fontSize: 18,
    color: "#2C6B2F",
    marginLeft: 8,
  },
})

export default SurahList

