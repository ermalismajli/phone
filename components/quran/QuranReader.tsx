"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Animated,
  Platform,
  StyleSheet,
} from "react-native"
import { Ionicons } from "react-native-vector-icons"
import QuranHeader from "./QuranHeader"
import { QuranService } from "../../services/QuranService"
import type { Verse, PageData } from "../../types/quran"
import PageIndicator from "./PageIndicator"

const { width } = Dimensions.get("window")

interface QuranReaderProps {
  surah: number
  verse: number
  page: number
  juz: number
  fontSize: number
  isDarkMode: boolean
  showArabic: boolean
  onChangeFontSize: (size: number) => void
  onToggleDarkMode: () => void
  onToggleArabic: () => void
  onUpdatePosition: (surah: number, verse: number, page: number, juz: number) => void
  onBackPress: () => void
}

const QuranReader: React.FC<QuranReaderProps> = ({
  surah,
  verse,
  page,
  juz,
  fontSize,
  isDarkMode,
  showArabic,
  onChangeFontSize,
  onToggleDarkMode,
  onToggleArabic,
  onUpdatePosition,
  onBackPress,
}) => {
  // Core state
  const [isLoading, setIsLoading] = useState(true)
  const [pages, setPages] = useState<PageData[]>([])
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [currentSurah, setCurrentSurah] = useState(surah)
  const [currentVerse, setCurrentVerse] = useState(verse)
  const [currentPage, setCurrentPage] = useState(page)
  const [currentJuz, setCurrentJuz] = useState(juz)

  // UI state
  const [showControls, setShowControls] = useState(false)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const flatListRef = useRef<FlatList>(null)
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 })
  const initialScrollDone = useRef(false)

  // Load initial data
  useEffect(() => {
    loadInitialPages()
  }, [])

  // Handle page change
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const visiblePage = viewableItems[0].item

      if (visiblePage.pageNumber !== currentPage) {
        setCurrentPage(visiblePage.pageNumber)

        // Get surah and verse information for this page
        const {
          surah: newSurah,
          verse: newVerse,
          juz: newJuz,
        } = QuranService.getSurahAndVerseForPage(visiblePage.pageNumber)

        setCurrentSurah(newSurah)
        setCurrentVerse(newVerse)
        setCurrentJuz(newJuz)

        // Update reading position in parent component
        onUpdatePosition(newSurah, newVerse, visiblePage.pageNumber, newJuz)
      }
    }
  }).current

  // Load initial pages centered around the target page
  const loadInitialPages = async () => {
    setIsLoading(true)

    try {
      // Make sure we're loading the correct starting page for the surah
      const surahInfo = QuranService.getSurah(surah)
      const startPage = surahInfo ? surahInfo.startPage : page

      const pagesToLoad = []
      const startRange = startPage
      const endRange = startPage + 1

      for (let i = startRange; i <= endRange; i++) {
        pagesToLoad.push(i)
      }

      const pageDataArray: PageData[] = []

      // Load pages in parallel for better performance
      await Promise.all(
        pagesToLoad.map(async (pageNum) => {
          const pageData = await QuranService.getPage(pageNum)
          pageDataArray.push(pageData)
        }),
      )

      // Sort pages by page number
      pageDataArray.sort((a, b) => a.pageNumber - b.pageNumber)

      // Find the index of the starting page
      const startPageIndex = pageDataArray.findIndex((p) => p.pageNumber === startPage)

      setPages(pageDataArray)
      setCurrentPageIndex(startPageIndex >= 0 ? startPageIndex : 0)
      setCurrentPage(startPage)

      // Update position
      const { surah: newSurah, verse: newVerse, juz: newJuz } = QuranService.getSurahAndVerseForPage(startPage)

      setCurrentSurah(newSurah)
      setCurrentVerse(newVerse)
      setCurrentJuz(newJuz)
      onUpdatePosition(newSurah, newVerse, startPage, newJuz)

      // Scroll to the starting page after a short delay to ensure rendering
      setTimeout(() => {
        if (flatListRef.current && startPageIndex >= 0) {
          flatListRef.current.scrollToIndex({
            index: startPageIndex,
            animated: false,
            viewPosition: 0,
          })
          initialScrollDone.current = true
        }
      }, 300)
    } catch (error) {
      console.error("Error loading initial pages:", error)
    }

    setIsLoading(false)
  }

  // Load more pages when reaching the end
  const loadMorePages = async (direction: "before" | "after") => {
    try {
      if (pages.length === 0) return

      const currentPages = [...pages]
      const newPages: PageData[] = []

      if (direction === "before") {
        const firstPage = currentPages[0].pageNumber
        if (firstPage <= 1) return

        // Load 3 pages before the first loaded page
        const pagesToLoad = []
        for (let i = Math.max(1, firstPage - 1); i < firstPage; i++) {
          pagesToLoad.push(i)
        }

        await Promise.all(
          pagesToLoad.map(async (pageNum) => {
            const pageData = await QuranService.getPage(pageNum)
            newPages.push(pageData)
          }),
        )

        // Add new pages to the beginning
        setPages([...newPages, ...currentPages])

        // Adjust the current page index
        setCurrentPageIndex((prev) => prev + newPages.length)
      } else {
        const lastPage = currentPages[currentPages.length - 1].pageNumber

        // Load 3 pages after the last loaded page
        const pagesToLoad = [lastPage + 1]

        await Promise.all(
          pagesToLoad.map(async (pageNum) => {
            const pageData = await QuranService.getPage(pageNum)
            newPages.push(pageData)
          }),
        )

        // Add new pages to the end
        setPages([currentPages[currentPages.length-1], ...newPages])
      }
    } catch (error) {
      console.error(`Error loading more pages ${direction}:`, error)
    }
  }

  // Handle end reached - load more pages
  const handleEndReached = () => {
    if (initialScrollDone.current) {
      loadMorePages("after")
    }
  }

  // Handle start reached - load more pages
  const handleStartReached = () => {
    // if (initialScrollDone.current) {
    //   loadMorePages("before")
    // }
  }

  // Navigate to next/previous page
  const changePage = (direction: "next" | "prev") => {
    if (pages.length === 0) return

    const newIndex =
      direction === "next" ? Math.min(currentPageIndex + 1, pages.length - 1) : Math.max(currentPageIndex - 1, 0)

    if (newIndex !== currentPageIndex) {
      setCurrentPageIndex(newIndex)

      if (flatListRef.current) {
        flatListRef.current.scrollToIndex({
          index: newIndex,
          animated: true,
          viewPosition: 0,
        })
      }
    }
  }

  // Toggle font size
  const toggleFontSize = (increase: boolean) => {
    const newSize = increase ? fontSize + 2 : fontSize - 2
    if (newSize >= 14 && newSize <= 30) {
      onChangeFontSize(newSize)
    }
  }

  // Toggle controls visibility
  const toggleControls = () => {
    setShowControls(!showControls)

    Animated.timing(fadeAnim, {
      toValue: !showControls ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start()
  }

  // Handle scroll to index failure
  const handleScrollToIndexFailed = (info) => {
    const wait = new Promise((resolve) => setTimeout(resolve, 500))
    wait.then(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToIndex({
          index: info.index,
          animated: false,
          viewPosition: 0,
        })
      }
    })
  }

  // Render a page
  const renderPage = ({ item: pageData }) => {
    const { pageNumber, verses, surahs } = pageData

    // Group verses by surah
    const versesBySurah: { [key: number]: Verse[] } = {}

    verses.forEach((verse) => {
      if (!versesBySurah[verse.surah]) {
        versesBySurah[verse.surah] = []
      }
      versesBySurah[verse.surah].push(verse)
    })

    return (
      <View
        style={[
          styles.pageWrapper,
          isDarkMode && styles.darkPageWrapper,
          pageNumber === currentPage && styles.currentPageWrapper,
        ]}
      >
        {/* Render each surah's verses on this page */}
        {Object.keys(versesBySurah).map((surahKey) => {
          const surahNumber = Number.parseInt(surahKey)
          const surahVerses = versesBySurah[surahNumber]
          const surahInfo = QuranService.getSurah(surahNumber)

          // Check if this is the first page of the surah
          const isFirstPageOfSurah = surahInfo && surahInfo.startPage === pageNumber

          return (
            <View key={`page-${pageNumber}-surah-${surahNumber}`}>
              {/* Show Bismillah only at the start of a surah (except for Surah 9) */}
              {isFirstPageOfSurah && surahNumber !== 9 && (
                <View style={styles.bismillah}>
                  {showArabic && (
                    <Text style={[styles.bismillahText, { fontSize: fontSize + 6 }]}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
                  )}
                  <Text
                    style={[
                      styles.translationText,
                      { fontSize: fontSize - 2, marginTop: 5 },
                      isDarkMode && styles.darkText,
                    ]}
                  >
                    Me emrin e Allahut, të Gjithëmëshirshmit, Mëshirëplotit!
                  </Text>
                </View>
              )}

              {/* Render verses */}
              {surahVerses.map((verse) => (
                <View
                  key={`verse-${surahNumber}-${verse.number}`}
                  style={[styles.verseContainer, isDarkMode && styles.darkVerseContainer]}
                >
                  {showArabic && (
                    <View style={styles.arabicContainer}>
                      <Text
                        style={[styles.arabicText, { fontSize: fontSize + 4 }, isDarkMode && styles.darkArabicText]}
                      >
                        {verse.text}
                        <Text style={styles.verseNumber}> {verse.number}</Text>
                      </Text>
                    </View>
                  )}

                  <Text style={[styles.translationText, { fontSize: fontSize }, isDarkMode && styles.darkText]}>
                    <Text style={styles.verseNumberTranslation}>{verse.number}. </Text>
                    {verse.translation}
                  </Text>
                </View>
              ))}

              {/* Show end of surah indicator if this is the last verse of the surah */}
              {surahInfo && surahVerses.some((v) => v.number === surahInfo.numberOfAyahs) && (
                <View style={[styles.endOfSurahContainer, isDarkMode && styles.darkEndOfSurahContainer]}>
                  <View style={styles.endOfSurahLine} />
                  <View style={styles.endOfSurahBadge}>
                    <Text style={styles.endOfSurahText}>End of Surah {surahNumber}</Text>
                  </View>
                  <View style={styles.endOfSurahLine} />
                </View>
              )}
            </View>
          )
        })}

        {/* Page indicator */}
        <PageIndicator pageNumber={pageNumber} isDarkMode={isDarkMode} />
      </View>
    )
  }

  // Render separator between pages
  const renderSeparator = () => <View style={[styles.pageSeparator, isDarkMode && styles.darkPageSeparator]} />

  // Render the list header (for pull-to-load-more)
  const renderListHeader = () => (
    <View style={styles.listHeaderFooter}>
      {pages.length > 0 && pages[0].pageNumber > 1 && (
        <TouchableOpacity
          style={[styles.loadMoreButton, isDarkMode && styles.darkLoadMoreButton]}
          onPress={() => loadMorePages("before")}
        >
          <Ionicons name="chevron-up" size={20} color={isDarkMode ? "#fff" : "#333"} />
          <Text style={[styles.loadMoreText, isDarkMode && styles.darkText]}>Load Previous Pages</Text>
        </TouchableOpacity>
      )}
    </View>
  )

  // Render the list footer (for load-more-at-end)
  const renderListFooter = () => (
    <View style={styles.listHeaderFooter}>
      <TouchableOpacity
        style={[styles.loadMoreButton, isDarkMode && styles.darkLoadMoreButton]}
        onPress={() => loadMorePages("after")}
      >
        <Ionicons name="chevron-down" size={20} color={isDarkMode ? "#fff" : "#333"} />
        <Text style={[styles.loadMoreText, isDarkMode && styles.darkText]}>Load More Pages</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <QuranHeader
        title={QuranService.getSurah(currentSurah)?.nameAlbanian || "Kurani Famëlartë"}
        subtitle={`Surah ${currentSurah} • Page ${currentPage} • Juz ${currentJuz}`}
        isDarkMode={isDarkMode}
        toggleDarkMode={onToggleDarkMode}
        showBackButton={true}
        onBackPress={onBackPress}
      />

      <View style={[styles.pageInfo, isDarkMode && styles.darkPageInfo]}>
        <Text style={[styles.pageInfoText, isDarkMode && styles.darkText]}>
          {QuranService.getSurah(currentSurah)?.nameArabic}
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2C6B2F" />
          <Text style={[styles.loadingText, isDarkMode && styles.darkText]}>Duke ngarkuar faqen...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={pages}
          renderItem={renderPage}
          keyExtractor={(item) => `page-${item.pageNumber}`}
          contentContainerStyle={styles.contentContainer}
          ItemSeparatorComponent={renderSeparator}
          ListHeaderComponent={renderListHeader}
          ListFooterComponent={renderListFooter}
          onEndReached={handleEndReached}
          onStartReached={handleStartReached}
          onEndReachedThreshold={0.5}
          onStartReachedThreshold={0.5}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewConfigRef.current}
          onScrollToIndexFailed={handleScrollToIndexFailed}
          initialNumToRender={3}
          maxToRenderPerBatch={5}
          windowSize={7}
          removeClippedSubviews={Platform.OS === "android"}
          showsVerticalScrollIndicator={true}
          snapToAlignment="start"
          decelerationRate="normal"
          snapToInterval={0} // Disable snapping for smoother scrolling
          pagingEnabled={false}
        />
      )}

      <View style={[styles.navigationContainer, isDarkMode && styles.darkNavigationContainer]}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => changePage("prev")}
          disabled={currentPageIndex === 0 && pages[0]?.pageNumber === 1}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={currentPageIndex === 0 && pages[0]?.pageNumber === 1 ? "#ccc" : isDarkMode ? "#fff" : "#333"}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlsButton} onPress={toggleControls}>
          <Ionicons name="settings-outline" size={24} color={isDarkMode ? "#fff" : "#333"} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => changePage("next")}
          disabled={currentPageIndex === pages.length - 1}
        >
          <Ionicons
            name="chevron-forward"
            size={24}
            color={currentPageIndex === pages.length - 1 ? "#ccc" : isDarkMode ? "#fff" : "#333"}
          />
        </TouchableOpacity>
      </View>

      {/* Settings panel */}
      <Animated.View
        style={[
          styles.controlsPanel,
          isDarkMode && styles.darkControlsPanel,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
          showControls ? styles.controlsVisible : styles.controlsHidden,
        ]}
      >
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[styles.controlButton, isDarkMode && styles.darkControlButton]}
            onPress={() => toggleFontSize(false)}
          >
            <Ionicons name="remove" size={20} color={isDarkMode ? "#fff" : "#333"} />
          </TouchableOpacity>

          <Text style={[styles.fontSizeText, isDarkMode && styles.darkText]}>Font Size</Text>

          <TouchableOpacity
            style={[styles.controlButton, isDarkMode && styles.darkControlButton]}
            onPress={() => toggleFontSize(true)}
          >
            <Ionicons name="add" size={20} color={isDarkMode ? "#fff" : "#333"} />
          </TouchableOpacity>
        </View>

        <View style={[styles.divider, isDarkMode && styles.darkDivider]} />

        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[styles.controlButton, isDarkMode && styles.darkControlButton]}
            onPress={onToggleArabic}
          >
            <Ionicons name={showArabic ? "eye-off" : "eye"} size={20} color={isDarkMode ? "#fff" : "#333"} />
          </TouchableOpacity>

          <Text style={[styles.fontSizeText, isDarkMode && styles.darkText]}>
            {showArabic ? "Hide Arabic" : "Show Arabic"}
          </Text>
        </View>

        <View style={[styles.divider, isDarkMode && styles.darkDivider]} />

        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[styles.controlButton, isDarkMode && styles.darkControlButton]}
            onPress={onToggleDarkMode}
          >
            <Ionicons name={isDarkMode ? "sunny" : "moon"} size={20} color={isDarkMode ? "#fff" : "#333"} />
          </TouchableOpacity>

          <Text style={[styles.fontSizeText, isDarkMode && styles.darkText]}>
            {isDarkMode ? "Light Mode" : "Dark Mode"}
          </Text>
        </View>
      </Animated.View>
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
  pageInfo: {
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  darkPageInfo: {
    backgroundColor: "#1e1e1e",
    borderBottomColor: "#333",
  },
  pageInfoText: {
    fontSize: 20,
    color: "#2C6B2F",
    fontWeight: "500",
  },
  darkText: {
    color: "#fff",
  },
  darkArabicText: {
    color: "#e0e0e0",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  pageWrapper: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginVertical: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  darkPageWrapper: {
    backgroundColor: "#1e1e1e",
  },
  currentPageWrapper: {
    borderLeftWidth: 3,
    borderLeftColor: "#2C6B2F",
  },
  pageSeparator: {
    height: 16,
  },
  darkPageSeparator: {
    backgroundColor: "#121212",
  },
  bismillah: {
    alignItems: "center",
    marginVertical: 20,
  },
  bismillahText: {
    color: "#2C6B2F",
    textAlign: "center",
  },
  verseContainer: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  darkVerseContainer: {
    borderBottomColor: "#333",
  },
  arabicContainer: {
    marginBottom: 8,
  },
  arabicText: {
    textAlign: "right",
    lineHeight: 36,
    color: "#000",
  },
  verseNumber: {
    fontSize: 16,
    color: "#2C6B2F",
    backgroundColor: "#e8f5e9",
    borderRadius: 10,
    overflow: "hidden",
    padding: 4,
  },
  verseNumberTranslation: {
    fontWeight: "bold",
    color: "#2C6B2F",
  },
  translationText: {
    textAlign: "left",
    lineHeight: 24,
    color: "#333",
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  darkNavigationContainer: {
    backgroundColor: "#1e1e1e",
    borderTopColor: "#333",
  },
  navButton: {
    padding: 10,
  },
  controlsButton: {
    padding: 10,
  },
  controlsPanel: {
    position: "absolute",
    bottom: 70,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  controlsVisible: {
    display: "flex",
  },
  controlsHidden: {
    display: "none",
  },
  darkControlsPanel: {
    backgroundColor: "#1e1e1e",
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
  },
  controlButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 5,
  },
  darkControlButton: {
    backgroundColor: "#333",
  },
  fontSizeText: {
    marginHorizontal: 10,
    fontSize: 14,
    color: "#333",
    flex: 1,
    textAlign: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 10,
  },
  darkDivider: {
    backgroundColor: "#333",
  },
  endOfSurahContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  darkEndOfSurahContainer: {
    opacity: 0.8,
  },
  endOfSurahLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#2C6B2F",
  },
  endOfSurahBadge: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    backgroundColor: "#e8f5e9",
    borderRadius: 15,
    marginHorizontal: 10,
  },
  endOfSurahText: {
    color: "#2C6B2F",
    fontWeight: "500",
    fontSize: 14,
  },
  listHeaderFooter: {
    paddingVertical: 8,
  },
  loadMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  darkLoadMoreButton: {
    backgroundColor: "#1e1e1e",
  },
  loadMoreText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
  },
})

export default QuranReader

