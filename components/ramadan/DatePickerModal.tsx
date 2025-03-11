import type React from "react"
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from "react-native"
import { Ionicons } from "react-native-vector-icons"
import moment from "moment"
import GradientView from "./GradientView"
import { Dimensions } from "react-native"

const { width } = Dimensions.get("window")

interface DatePickerModalProps {
  visible: boolean
  availableDates: string[]
  selectedDate: string
  onClose: () => void
  onSelectDate: (date: string) => void
  getDateCompletionStatus: (date: string) => { completed: number; total: number }
  isDateCompleted: (date: string) => boolean
  getRamadanDay: (date: moment.Moment) => number
}

const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  availableDates,
  selectedDate,
  onClose,
  onSelectDate,
  getDateCompletionStatus,
  isDateCompleted,
  getRamadanDay,
}) => {
  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <GradientView colors={["#2C6B2F", "#4CAF50"]} style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Date</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={28} color="#fff" />
            </TouchableOpacity>
          </GradientView>

          <ScrollView style={styles.dateList}>
            {availableDates.map((date) => {
              const { completed, total } = getDateCompletionStatus(date)
              const isCompleted = isDateCompleted(date)

              return (
                <TouchableOpacity
                  key={date}
                  style={[
                    styles.dateItem,
                    selectedDate === date && styles.selectedDateItem,
                    isCompleted && styles.completedDateItem,
                  ]}
                  onPress={() => onSelectDate(date)}
                >
                  <View style={styles.dateItemContent}>
                    <View>
                      <Text
                        style={[
                          styles.dateItemText,
                          selectedDate === date && styles.selectedDateItemText,
                          isCompleted && styles.completedDateItemText,
                        ]}
                      >
                        {moment(date).format("dddd, MMMM D")}
                      </Text>
                      <Text style={[styles.ramadanDayText, isCompleted && styles.completedRamadanDayText]}>
                        Day {getRamadanDay(moment(date))} of Ramadan
                      </Text>
                    </View>

                    {total > 0 && (
                      <View style={[styles.completionBadge, isCompleted && styles.completedBadge]}>
                        <Text style={styles.completionBadgeText}>
                          {completed}/{total}
                        </Text>
                        {isCompleted && (
                          <Ionicons name="checkmark-circle" size={16} color="#fff" style={styles.completedIcon} />
                        )}
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: width * 0.9,
    maxWidth: 400,
    maxHeight: "90%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  dateList: {
    width: "100%",
    flexGrow: 0,
    paddingHorizontal: 10,
    marginVertical: 8,
  },
  dateItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    borderRadius: 8,
    marginBottom: 5,
  },
  dateItemContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedDateItem: {
    backgroundColor: "#e8f5e9",
  },
  completedDateItem: {
    backgroundColor: "#c8e6c9",
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  dateItemText: {
    fontSize: 18,
    color: "#333",
    fontWeight: "500",
  },
  selectedDateItemText: {
    fontWeight: "bold",
    color: "#2C6B2F",
  },
  completedDateItemText: {
    color: "#2C6B2F",
    fontWeight: "bold",
  },
  ramadanDayText: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  completedRamadanDayText: {
    color: "#388E3C",
  },
  completionBadge: {
    backgroundColor: "#2C6B2F",
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  completedBadge: {
    backgroundColor: "#4CAF50",
  },
  completionBadgeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  completedIcon: {
    marginLeft: 5,
  },
})

export default DatePickerModal

