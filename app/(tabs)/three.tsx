"use client"

import { useState, useEffect } from "react"
import { View, StyleSheet, StatusBar } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Import components
import QuranHeader from "@/components/quran/QuranHeader"
import SurahList from "@/components/quran/SurahList"
import RecentlyRead from "@/components/quran/RecentlyRead"
import QuranReader from "@/components/quran/QuranReader"
import SearchBar from "@/components/quran/SearchBar"

// Import types and data
import type { RecentRead, QuranView } from "@/types/quran"
import { QuranService } from "@/services/QuranService"

export default function QuranScreen() {
  const [currentView, setCurrentView] = useState<QuranView>("list")

  // Current surah and verse being read
  const [currentSurah, setCurrentSurah] = useState(1)
  const [currentVerse, setCurrentVerse] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [currentJuz, setCurrentJuz] = useState(1)

  // Recently read sections
  const [recentlyRead, setRecentlyRead] = useState<RecentRead[]>([])

  // Search functionality
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  // Settings
  const [fontSize, setFontSize] = useState(18)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showArabic, setShowArabic] = useState(true)

  // Load data from storage
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load recently read
        const storedRecentlyRead = await AsyncStorage.getItem("quranRecentlyRead")
        if (storedRecentlyRead) {
          setRecentlyRead(JSON.parse(storedRecentlyRead))
        }

        // Load settings
        const storedFontSize = await AsyncStorage.getItem("quranFontSize")
        if (storedFontSize) {
          setFontSize(Number.parseInt(storedFontSize))
        }

        const storedDarkMode = await AsyncStorage.getItem("quranDarkMode")
        if (storedDarkMode) {
          setIsDarkMode(JSON.parse(storedDarkMode))
        }

        const storedShowArabic = await AsyncStorage.getItem("quranShowArabic")
        if (storedShowArabic !== null) {
          setShowArabic(JSON.parse(storedShowArabic))
        }

        // Load last read position
        const lastReadSurah = await AsyncStorage.getItem("lastReadSurah")
        const lastReadVerse = await AsyncStorage.getItem("lastReadVerse")
        const lastReadPage = await AsyncStorage.getItem("lastReadPage")
        const lastReadJuz = await AsyncStorage.getItem("lastReadJuz")

        if (lastReadSurah) setCurrentSurah(Number.parseInt(lastReadSurah))
        if (lastReadVerse) setCurrentVerse(Number.parseInt(lastReadVerse))
        if (lastReadPage) setCurrentPage(Number.parseInt(lastReadPage))
        if (lastReadJuz) setCurrentJuz(Number.parseInt(lastReadJuz))
      } catch (error) {
        console.error("Error loading Quran data:", error)
      }
    }

    loadData()
  }, [])

  // Save recently read when it changes
  useEffect(() => {
    const saveRecentlyRead = async () => {
      try {
        await AsyncStorage.setItem("quranRecentlyRead", JSON.stringify(recentlyRead))
      } catch (error) {
        console.error("Error saving recently read:", error)
      }
    }

    if (recentlyRead.length > 0) {
      saveRecentlyRead()
    }
  }, [recentlyRead])

  // Save current reading position
  const saveReadingPosition = async () => {
    try {
      await AsyncStorage.setItem("lastReadSurah", currentSurah.toString())
      await AsyncStorage.setItem("lastReadVerse", currentVerse.toString())
      await AsyncStorage.setItem("lastReadPage", currentPage.toString())
      await AsyncStorage.setItem("lastReadJuz", currentJuz.toString())
    } catch (error) {
      console.error("Error saving reading position:", error)
    }
  }

  // Update reading position and save to recently read
  const updateReadingPosition = (surah: number, verse: number, page: number, juz: number) => {
    setCurrentSurah(surah)
    setCurrentVerse(verse)
    setCurrentPage(page)
    setCurrentJuz(juz)

    // Add to recently read
    const surahInfo = QuranService.getSurah(surah)
    if (!surahInfo) return

    const newRecentRead: RecentRead = {
      id: Date.now().toString(),
      surah,
      verse,
      page,
      juz,
      timestamp: new Date().toISOString(),
      surahName: surahInfo.nameAlbanian,
      surahNameArabic: surahInfo.nameArabic,
    }

    // Add to recently read and keep only the last 3
    const updatedRecentlyRead = [
      newRecentRead,
      ...recentlyRead.filter((item) => item.surah !== surah || item.page !== page),
    ].slice(0, 3)

    setRecentlyRead(updatedRecentlyRead)
    saveReadingPosition()
  }

  // Open a specific surah
  const openSurah = (surahNumber: number) => {
    // Get the surah info
    const surahInfo = QuranService.getSurah(surahNumber)
    if (!surahInfo) return

    // Set the state
    setCurrentSurah(surahNumber)
    setCurrentVerse(1)
    setCurrentPage(surahInfo.startPage)
    setCurrentJuz(surahInfo.juz)

    // Change the view
    setCurrentView("reader")
  }

  // Open a recently read section
  const openRecentlyRead = (recentRead: RecentRead) => {
    setCurrentSurah(recentRead.surah)
    setCurrentVerse(recentRead.verse)
    setCurrentPage(recentRead.page)
    setCurrentJuz(recentRead.juz)
    setCurrentView("reader")
  }

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    AsyncStorage.setItem("quranDarkMode", JSON.stringify(newMode))
  }

  // Toggle Arabic text
  const toggleArabic = () => {
    const newValue = !showArabic
    setShowArabic(newValue)
    AsyncStorage.setItem("quranShowArabic", JSON.stringify(newValue))
  }

  // Change font size
  const changeFontSize = (size: number) => {
    setFontSize(size)
    AsyncStorage.setItem("quranFontSize", size.toString())
  }

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setIsSearching(query.length > 0)
  }

  // Clear search
  const clearSearch = () => {
    setSearchQuery("")
    setIsSearching(false)
  }

  // Go back to list view
  const goBackToList = () => {
    setCurrentView("list")
  }

  // Get all surahs
  const allSurahs = QuranService.getAllSurahs()

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      {currentView === "list" ? (
        <>
          <QuranHeader
            title="Kurani Famëlartë"
            subtitle="Përkthimi në gjuhën shqipe"
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
            showBackButton={false}
            onBackPress={goBackToList}
          />

          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={handleSearch}
            onClearSearch={clearSearch}
            isDarkMode={isDarkMode}
          />

          <RecentlyRead recentlyRead={recentlyRead} onSelectRecent={openRecentlyRead} isDarkMode={isDarkMode} />

          <SurahList
            surahList={allSurahs}
            onSelectSurah={openSurah}
            searchQuery={searchQuery}
            isDarkMode={isDarkMode}
          />
        </>
      ) : (
        <>
          <QuranReader
            surah={currentSurah}
            verse={currentVerse}
            page={currentPage}
            juz={currentJuz}
            fontSize={fontSize}
            isDarkMode={isDarkMode}
            showArabic={showArabic}
            onChangeFontSize={changeFontSize}
            onToggleDarkMode={toggleDarkMode}
            onToggleArabic={toggleArabic}
            onUpdatePosition={updateReadingPosition}
            onBackPress={goBackToList}
          />
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  darkContainer: {
    backgroundColor: "#121212",
  },
})

