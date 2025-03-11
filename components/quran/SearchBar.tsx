import type React from "react"
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native"
import { Ionicons } from "react-native-vector-icons"

interface SearchBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onClearSearch: () => void
  isDarkMode: boolean
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, onSearchChange, onClearSearch, isDarkMode }) => {
  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={[styles.searchBar, isDarkMode && styles.darkSearchBar]}>
        <Ionicons name="search" size={20} color={isDarkMode ? "#aaa" : "#666"} style={styles.searchIcon} />

        <TextInput
          style={[styles.searchInput, isDarkMode && styles.darkSearchInput]}
          placeholder="Search surah by name or number..."
          placeholderTextColor={isDarkMode ? "#aaa" : "#999"}
          value={searchQuery}
          onChangeText={onSearchChange}
        />

        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={onClearSearch} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={isDarkMode ? "#aaa" : "#999"} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  darkContainer: {
    backgroundColor: "#121212",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  darkSearchBar: {
    backgroundColor: "#1e1e1e",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: "#333",
  },
  darkSearchInput: {
    color: "#fff",
  },
  clearButton: {
    padding: 4,
  },
})

export default SearchBar

