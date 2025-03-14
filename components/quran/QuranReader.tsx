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

  // Add this at the top of your component with other refs
  const isLoadingMore = useRef(false)

  // Load initial data
  useEffect(() => {
    loadInitialPages()
  }, [])

  useEffect(() => {
    onUpdatePosition(currentSurah, currentVerse, currentPage, currentJuz)
  }, [currentJuz, currentSurah, currentVerse, currentPage])

  // Handle page change
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0 && !isLoadingMore.current) {
      // Find the most visible item (with highest percentVisible)
      const mostVisibleItem = viewableItems.reduce(
        (prev, current) => (current.percentVisible > prev.percentVisible ? current : prev),
        { percentVisible: 0 },
      )

      if (mostVisibleItem.item && mostVisibleItem.percentVisible > 0.5) {
        const visiblePage = mostVisibleItem.item

        // Update page number and index
        if (visiblePage.pageNumber !== currentPage) {
          setCurrentPage(visiblePage.pageNumber)
          const newIndex = pages.findIndex((page) => page.pageNumber === visiblePage.pageNumber)
          if (newIndex !== -1) {
            setCurrentPageIndex(newIndex)
          }

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
          // onUpdatePosition(newSurah, newVerse, visiblePage.pageNumber, newJuz)
        }
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
      // onUpdatePosition(newSurah, newVerse, startPage, newJuz)

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
      if (pages.length === 0 || isLoadingMore.current) return

      isLoadingMore.current = true
      const currentPages = [...pages]
      const newPages: PageData[] = []
      const currentIndex = currentPageIndex

      if (direction === "before") {
        const firstPage = currentPages[0].pageNumber
        if (firstPage <= 1) {
          isLoadingMore.current = false
          return
        }

        // Load page before the first loaded page
        const pagesToLoad = [firstPage - 1]

        await Promise.all(
          pagesToLoad.map(async (pageNum) => {
            const pageData = await QuranService.getPage(pageNum)
            newPages.push(pageData)
          }),
        )

        // Add new pages to the beginning
        setPages([...newPages, currentPages[0]])
        const { surah: newSurah, verse: newVerse, juz: newJuz } = QuranService.getSurahAndVerseForPage(firstPage - 1)

        setCurrentSurah(newSurah)
        setCurrentVerse(newVerse)
        setCurrentPage(firstPage - 1)
        setCurrentJuz(newJuz)

        // Adjust the current page index to maintain position
        setCurrentPageIndex(currentIndex + newPages.length)
      } else {
        const lastPage = currentPages[currentPages.length - 1].pageNumber
        const { surah: newSurah, verse: newVerse, juz: newJuz } = QuranService.getSurahAndVerseForPage(lastPage)

        setCurrentSurah(newSurah)
        setCurrentVerse(newVerse)
        setCurrentPage(lastPage)
        setCurrentJuz(newJuz)

        // Load page after the last loaded page
        const pagesToLoad = [lastPage + 1]

        await Promise.all(
          pagesToLoad.map(async (pageNum) => {
            const pageData = await QuranService.getPage(pageNum)
            newPages.push(pageData)
          }),
        )

        // Add new pages to the end without changing the current position
        setPages([currentPages[currentPages.length - 1], ...newPages])
      }

      // Add a delay before allowing another load
      setTimeout(() => {
        isLoadingMore.current = false
      }, 1000)
    } catch (error) {
      console.error(`Error loading more pages ${direction}:`, error)
      isLoadingMore.current = false
    }
  }

  // Handle end reached - load more pages
  const handleEndReached = () => {
    if (initialScrollDone.current && !isLoadingMore.current) {
      loadMorePages("after")
    }
  }

  // Handle start reached - load more pages
  const handleStartReached = () => {
    // We'll leave this empty for now since you mentioned
    // you want to focus on scrolling down
  }

  // Navigate to next/previous page
  const changePage = (direction: "next" | "prev") => {
    if (pages.length === 0) return

    const newIndex =
      direction === "next" ? Math.min(currentPageIndex + 1, pages.length - 1) : Math.max(currentPageIndex - 1, 0)
      const { surah: newSurah, verse: newVerse, juz: newJuz } = QuranService.getSurahAndVerseForPage(newIndex - 1)

      setCurrentSurah(newSurah)
      setCurrentVerse(newVerse)
      setCurrentPage(newIndex - 1)
      setCurrentJuz(newJuz)

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
              {/* Surah header if this is the first page of the surah */}
              {isFirstPageOfSurah && (
                <View style={styles.surahHeaderWrapper}>

                  <View style={[styles.surahHeader, isDarkMode && styles.darkSurahHeader]}>
                    <View style={styles.surahInfoContainer}>
                      <Text style={[styles.surahTitle, isDarkMode && styles.darkText]}>
                        Surah {surahInfo?.nameAlbanian || `${surahNumber}`}
                      </Text>
                      <View style={styles.surahMetaContainer}>
                        <View style={styles.surahNumberBadge}>
                          <Text style={styles.surahNumberText}>{surahNumber}</Text>
                        </View>
                        <Text style={[styles.surahSubtitle, isDarkMode && styles.darkSubtitleText]}>
                          {surahInfo?.revelationType} • {surahInfo?.numberOfAyahs} verses
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.surahArabicName}>{surahInfo?.nameArabic}</Text>
                  </View>
                </View>
              )}

              {/* Show Bismillah only at the start of a surah (except for Surah 9) */}
              {isFirstPageOfSurah && surahNumber !== 9 && (
                <View style={styles.bismillah}>
                  {showArabic && (
                    <Text style={[styles.bismillahText, { fontSize: fontSize + 8 }]}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
                  )}
                  <Text
                    style={[
                      styles.translationText,
                      { fontSize: fontSize - 2, marginTop: 8 },
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
                        style={[styles.arabicText, { fontSize: fontSize + 6 }, isDarkMode && styles.darkArabicText]}
                      >
                        {verse.text}
                      </Text>
                      <View style={styles.verseNumberBadge}>
                        <Text style={styles.verseNumberText}>{verse.number}</Text>
                      </View>
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

        {/* Page number at the bottom */}
        <View style={styles.pageNumberFooter}>
          <View style={[styles.pageNumberLine, isDarkMode && styles.darkPageNumberLine]} />
          <View style={[styles.pageNumberContainer, isDarkMode && styles.darkPageNumberContainer]}>
            <Text style={[styles.pageNumberText, isDarkMode && styles.darkPageNumberText]}>{pageNumber}</Text>
          </View>
          <View style={[styles.pageNumberLine, isDarkMode && styles.darkPageNumberLine]} />
        </View>
      </View>
    )
  }

  // Render separator between pages
  const renderSeparator = () => <View style={[styles.pageSeparator]} />

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
        onPress={() => {
          // Load more pages without changing scroll position
          loadMorePages("after")
        }}
      >
        <Ionicons name="chevron-down" size={20} color={isDarkMode ? "#fff" : "#333"} />
        <Text style={[styles.loadMoreText, isDarkMode && styles.darkText]}>Load More Pages</Text>
      </TouchableOpacity>
    </View>
  )

  // Update the viewConfigRef to be less sensitive
  viewConfigRef.current = {
    viewAreaCoveragePercentThreshold: 70, // Only consider an item "viewable" when 70% visible
    minimumViewTime: 300, // Require the item to be visible for at least 300ms before triggering
  }

  // Let's also update the FlatList to use getItemLayout for better performance
  // This helps with scroll position calculations

  // Add this function before the return statement
  const getItemLayout = (data, index) => {
    // Estimate a fixed height for each page
    const estimatedHeight = 800 // Adjust this based on your actual page heights
    return {
      length: estimatedHeight,
      offset: estimatedHeight * index,
      index,
    }
  }

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <QuranHeader
        title={QuranService.getSurah(currentSurah)?.nameAlbanian || "Kurani Famëlartë"}
        subtitle={`Surah ${currentSurah} • Page ${currentPage} • Juz ${currentJuz}`}
        isDarkMode={isDarkMode}
        toggleDarkMode={onToggleDarkMode}
        showBackButton={true}
        onBackPress={onBackPress}
        onSettingsPress={toggleControls}
      />

      {/* <View style={[styles.pageInfo, isDarkMode && styles.darkPageInfo]}>
        <Text style={[styles.pageInfoText, isDarkMode && styles.darkText]}>
          {QuranService.getSurah(currentSurah)?.nameArabic}
        </Text>
      </View> */}

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
          style={{ flex: 1 }}
          snapToAlignment={null}
          snapToInterval={null}
          pagingEnabled={false}
          disableIntervalMomentum={false}
          scrollEventThrottle={16}
          maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
          decelerationRate="normal"
          getItemLayout={getItemLayout}
        />
      )}

      {/* <View style={[styles.navigationContainer, isDarkMode && styles.darkNavigationContainer]}>
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
      </View> */}

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
    backgroundColor: "#f8f8f8",
  },
  darkContainer: {
    backgroundColor: "#121212",
  },
  pageInfo: {
    alignItems: "center",
    paddingVertical: 8, // Reduced from 12
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  darkPageInfo: {
    backgroundColor: "#1e1e1e",
    borderBottomColor: "#333",
  },
  pageInfoText: {
    fontSize: 20, // Reduced from 22
    color: "#2C6B2F",
    fontWeight: "500",
  },
  darkText: {
    color: "#f0f0f0",
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
    paddingHorizontal: 0, // Removed horizontal padding (was 16)
    paddingBottom: 20,
  },
  pageWrapper: {
    backgroundColor: "#fff",
    borderRadius: 0, // Removed border radius (was 12)
    marginVertical: 0, // Removed vertical margin (was 12)
    padding: 16, // Reduced padding (was 20)
    borderWidth: 0, // Removed border (was 1)
    borderColor: "#e8e8e8",
  },
  darkPageWrapper: {
    backgroundColor: "#1e1e1e",
    borderColor: "#333",
  },
  currentPageWrapper: {
    // Border removed as requested
  },
  pageSeparator: {
    height: 0, // Removed separator height (was 16)
  },
  darkPageSeparator: {
    backgroundColor: "#121212",
  },
  bismillah: {
    alignItems: "center",
    marginVertical: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(44, 107, 47, 0.1)",
  },
  bismillahText: {
    color: "#2C6B2F",
    textAlign: "center",
    fontWeight: "500",
  },
  verseContainer: {
    marginBottom: 12, // Reduced from 24
    paddingBottom: 12, // Reduced from 16
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  darkVerseContainer: {
    borderBottomColor: "#333",
  },
  arabicContainer: {
    marginBottom: 10, // Reduced from 12
    position: "relative",
    paddingRight: 30,
  },
  arabicText: {
    textAlign: "right",
    lineHeight: 46,
    color: "#000",
    fontWeight: "500",
  },
  verseNumberBadge: {
    position: "absolute",
    right: 0,
    top: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#e8f5e9",
    borderWidth: 1,
    borderColor: "#2C6B2F",
    justifyContent: "center",
    alignItems: "center",
  },
  verseNumberText: {
    fontSize: 12,
    color: "#2C6B2F",
    fontWeight: "bold",
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
    lineHeight: 26,
    color: "#333",
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12, // Reduced from 14
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  darkNavigationContainer: {
    backgroundColor: "#1e1e1e",
    borderTopColor: "#333",
  },
  navButton: {
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
    marginVertical: 20, // Reduced from 25
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
    borderWidth: 1,
    borderColor: "#2C6B2F",
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
  pageNumberContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e8f5e9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2C6B2F",
  },
  darkPageNumberContainer: {
    backgroundColor: "#1e3e1f",
    borderColor: "#4CAF50",
  },
  pageNumberText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C6B2F",
  },
  darkPageNumberText: {
    color: "#4CAF50",
  },
  // Enhanced styles for surah header
  surahHeaderWrapper: {
    // marginBottom: 5,
    marginTop: 5,
    paddingHorizontal: 5,
  },
  surahDecorativeLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 4,
  },
  surahDecorativeOrnament: {
    width: 100,
    height: 1,
    backgroundColor: "rgba(44, 107, 47, 0.5)",
    borderRadius: 1,
  },
  darkSurahDecorativeOrnament: {
    backgroundColor: "rgba(76, 175, 80, 0.5)",
  },
  surahHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  darkSurahHeader: {
    borderBottomColor: "#333",
  },
  surahInfoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  surahMetaContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  surahNumberBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#2C6B2F",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  surahNumberText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  surahTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  surahSubtitle: {
    fontSize: 11,
    color: "#666",
  },
  surahArabicName: {
    fontSize: 22,
    color: "#2C6B2F",
    fontWeight: "500",
    textAlign: "right",
    width: 80,
  },

  // Enhanced styles for page number
  pageNumberFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 0,
    marginBottom: 0,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    // height: 24,
  },
  pageNumberLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 10,
  },
  darkPageNumberLine: {
    backgroundColor: "#333",
  },
  pageNumberContainer: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  darkPageNumberContainer: {
    backgroundColor: "#2a2a2a",
    borderColor: "#444",
  },
  pageNumberText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  darkPageNumberText: {
    color: "#bbb",
  },
})

export default QuranReader

