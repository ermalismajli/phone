export type QuranView = "list" | "reader"

export interface Surah {
  number: number
  nameArabic: string
  nameAlbanian: string
  link: string
  englishName: string
  englishNameTranslation: string
  numberOfAyahs: number
  revelationType: string
  juz: number
  startPage: number
}

export interface RecentRead {
  id: string
  surah: number
  verse: number
  page: number
  juz: number
  timestamp: string
  surahName: string
  surahNameArabic: string
}

export interface Verse {
  number: number
  text: string
  translation: string
  surah: number
  juz: number
  page: number
}

export interface PageData {
  pageNumber: number
  verses: Verse[]
  surahs: number[]
}

