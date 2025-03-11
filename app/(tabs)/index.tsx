"use client"

import { useState, useEffect, useRef } from "react"
import { View, Alert, Animated, StyleSheet, type ScrollView, KeyboardAvoidingView, Platform } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import moment from "moment"

// Components
import Header from "@/components/ramadan/Header"
import TaskList from "@/components/ramadan/TaskList"
import FloatingActionButton from "@/components/ramadan/FloatingActionButton"
import AddTaskModal from "@/components/ramadan/AddTaskModal"
import DatePickerModal from "@/components/ramadan/DatePickerModal"
import DeleteConfirmationModal from "@/components/ramadan/DeleteConfirmationModal"

// Types
import type { Task, ChecklistItem, TasksByDate } from "@/types/ramadan"

const ramadanStartDate = "2025-03-01"
const ramadanEndDate = "2025-03-29"

// List of default tasks to perform during Ramadan with checklist items
const defaultTasks: Task[] = [
  {
    id: 1,
    title: "Fajr Salah",
    description: "Perform Fajr Salah and make Dua",
    hasChecklist: true,
    checklistItems: [
      { id: "1-1", text: "Perform 2 Sunnah rakats", isCompleted: false },
      { id: "1-2", text: "Perform 2 Fard rakats", isCompleted: false },
      { id: "1-3", text: "Make morning Dua", isCompleted: false },
    ],
    isCompleted: false,
  },
  {
    id: 2,
    title: "Zikr",
    description: "Daily Zikr and Tasbih",
    hasChecklist: true,
    checklistItems: [
      { id: "2-1", text: "Subhanallah (100 times)", isCompleted: false },
      { id: "2-2", text: "Alhamdulillah (100 times)", isCompleted: false },
      { id: "2-3", text: "Allahu Akbar (100 times)", isCompleted: false },
      { id: "2-4", text: "La ilaha illallah (100 times)", isCompleted: false },
    ],
    isCompleted: false,
  },
  {
    id: 3,
    title: "Quran Reading",
    description: "Read 1 Juz of the Quran",
    hasChecklist: false,
    isCompleted: false,
  },
  {
    id: 4,
    title: "Dua for Family",
    description: "Make Dua for your family's well-being",
    hasChecklist: false,
    isCompleted: false,
  },
  {
    id: 5,
    title: "Iftar Preparation",
    description: "Help prepare the Iftar meal",
    hasChecklist: true,
    checklistItems: [
      { id: "5-1", text: "Prepare dates and water", isCompleted: false },
      { id: "5-2", text: "Help with cooking", isCompleted: false },
      { id: "5-3", text: "Set the table", isCompleted: false },
    ],
    isCompleted: false,
  },
  {
    id: 6,
    title: "Maghrib Salah",
    description: "Perform Maghrib Salah and make Dua",
    hasChecklist: false,
    isCompleted: false,
  },
  {
    id: 7,
    title: "Taraweeh",
    description: "Pray Taraweeh after Iftar",
    hasChecklist: false,
    isCompleted: false,
  },
]

export default function RamadanToDoScreen() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState<{
    title: string
    description: string
    hasChecklist: boolean
    checklistItems: ChecklistItem[]
  }>({
    title: "",
    description: "",
    hasChecklist: false,
    checklistItems: [],
  })
  const [isRecurring, setIsRecurring] = useState(false)
  const [isModalVisible, setModalVisible] = useState(false)
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false)
  const [isDatePickerVisible, setDatePickerVisible] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null)
  const [animation] = useState(new Animated.Value(1))
  const [currentDay, setCurrentDay] = useState(0)
  const [selectedDate, setSelectedDate] = useState("")
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [tasksByDate, setTasksByDate] = useState<TasksByDate>({})
  const [recurringTasks, setRecurringTasks] = useState<Task[]>([])
  const [expandedTasks, setExpandedTasks] = useState<Record<number, boolean>>({})
  const [firstDataDate, setFirstDataDate] = useState("")
  const [deleteMode, setDeleteMode] = useState<"current" | "all">("current")
  const scrollViewRef = useRef<ScrollView>(null)

  // Helper function to calculate the day of Ramadan
  const getRamadanDay = (date = moment()) => {
    const start = moment(ramadanStartDate)
    const end = moment(ramadanEndDate)
    const daysInRamadan = end.diff(start, "days") + 1

    const diff = date.diff(start, "days")
    if (diff < 0) {
      return 0
    } else if (diff >= daysInRamadan) {
      return daysInRamadan
    } else {
      return diff + 1
    }
  }

  // Generate all dates in Ramadan
  const generateRamadanDates = () => {
    const dates: string[] = []
    const start = moment(ramadanStartDate)
    const end = moment(ramadanEndDate)
    const today = moment()

    const lastDate = today.isAfter(end) ? end : today

    const current = start.clone()
    while (current.isSameOrBefore(lastDate)) {
      dates.push(current.format("YYYY-MM-DD"))
      current.add(1, "days")
    }

    return dates
  }

  // Toggle task expansion
  const toggleTaskExpansion = (taskId: number) => {
    setExpandedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }))
  }

  // Load tasks from AsyncStorage when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load tasks by date
        const storedTasksByDate = await AsyncStorage.getItem("tasksByDate")
        let parsedTasksByDate: TasksByDate = {}

        if (storedTasksByDate) {
          parsedTasksByDate = JSON.parse(storedTasksByDate)

          // Find the first date with data
          const dates = Object.keys(parsedTasksByDate).sort()
          if (dates.length > 0) {
            setFirstDataDate(dates[0])
          }
        }

        // Load recurring tasks
        const storedRecurringTasks = await AsyncStorage.getItem("recurringTasks")
        let parsedRecurringTasks: Task[] = []

        if (storedRecurringTasks) {
          parsedRecurringTasks = JSON.parse(storedRecurringTasks)
        } else {
          // If no recurring tasks exist, add default tasks as recurring tasks
          parsedRecurringTasks = defaultTasks.map((task) => ({
            ...task,
            createdAt: moment(ramadanStartDate).format("YYYY-MM-DD"), // Set creation date to start of Ramadan
          }))

          // Save these to AsyncStorage
          await AsyncStorage.setItem("recurringTasks", JSON.stringify(parsedRecurringTasks))
        }

        setRecurringTasks(parsedRecurringTasks)

        // Generate available dates
        const dates = generateRamadanDates()
        setAvailableDates(dates)

        // Set today as the default selected date
        const today = moment().format("YYYY-MM-DD")
        setSelectedDate(today)

        // Initialize tasks for today if they don't exist
        if (!parsedTasksByDate[today]) {
          // Use recurring tasks instead of default tasks
          const todayTasks = parsedRecurringTasks.map((task) => ({
            ...task,
            isCompleted: false,
            checklistItems:
              task.hasChecklist && task.checklistItems
                ? task.checklistItems.map((item) => ({
                    ...item,
                    isCompleted: false,
                  }))
                : [],
          }))

          parsedTasksByDate[today] = todayTasks
        }

        setTasksByDate(parsedTasksByDate)

        // Set tasks for today
        setTasks(parsedTasksByDate[today] || [])

        // Set current day of Ramadan
        setCurrentDay(getRamadanDay())
      } catch (error) {
        console.error("Error loading data from AsyncStorage:", error)
      }
    }

    loadData()
  }, [])

  // Save tasks to AsyncStorage whenever they change
  useEffect(() => {
    const saveTasks = async () => {
      try {
        if (selectedDate) {
          // Update tasks for the selected date
          const updatedTasksByDate = {
            ...tasksByDate,
            [selectedDate]: tasks,
          }

          setTasksByDate(updatedTasksByDate)

          // Save all tasks by date
          await AsyncStorage.setItem("tasksByDate", JSON.stringify(updatedTasksByDate))
        }
      } catch (error) {
        console.error("Error saving tasks to AsyncStorage:", error)
      }
    }

    if (selectedDate && tasks.length > 0) {
      saveTasks()
    }
  }, [tasks, selectedDate])

  // Save recurring tasks whenever they change
  useEffect(() => {
    const saveRecurringTasks = async () => {
      try {
        await AsyncStorage.setItem("recurringTasks", JSON.stringify(recurringTasks))
      } catch (error) {
        console.error("Error saving recurring tasks to AsyncStorage:", error)
      }
    }

    if (recurringTasks.length > 0) {
      saveRecurringTasks()
    }
  }, [recurringTasks])

  // Animate task completion
  const animateTaskCompletion = (taskId: number) => {
    Animated.sequence([
      Animated.timing(animation, {
        toValue: 1.05,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(animation, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start()
  }

  // Check if all checklist items are completed
  const areAllChecklistItemsCompleted = (checklistItems?: ChecklistItem[]) => {
    if (!checklistItems || checklistItems.length === 0) return false
    return checklistItems.every((item) => item.isCompleted)
  }

  // Toggle task completion status
  const toggleTaskCompletion = (taskId: number) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          // For tasks with checklist, toggle all checklist items
          if (task.hasChecklist && task.checklistItems && task.checklistItems.length > 0) {
            const newIsCompleted = !task.isCompleted
            return {
              ...task,
              isCompleted: newIsCompleted,
              checklistItems: task.checklistItems.map((item) => ({
                ...item,
                isCompleted: newIsCompleted,
              })),
            }
          } else {
            // For simple tasks, just toggle the completion status
            animateTaskCompletion(taskId)
            return { ...task, isCompleted: !task.isCompleted }
          }
        }
        return task
      }),
    )
  }

  // Toggle checklist item completion
  const toggleChecklistItemCompletion = (taskId: number, itemId: string) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId && task.hasChecklist && task.checklistItems) {
          const updatedChecklistItems = task.checklistItems.map((item) => {
            if (item.id === itemId) {
              return { ...item, isCompleted: !item.isCompleted }
            }
            return item
          })

          // Check if all items are now completed
          const allCompleted = areAllChecklistItemsCompleted(updatedChecklistItems)

          return {
            ...task,
            checklistItems: updatedChecklistItems,
            isCompleted: allCompleted,
          }
        }
        return task
      }),
    )
  }

  // Add a new checklist item to the new task
  const addChecklistItem = () => {
    setNewTask({
      ...newTask,
      checklistItems: [...newTask.checklistItems, { id: Date.now().toString(), text: "", isCompleted: false }],
    })
  }

  // Remove a checklist item from the new task
  const removeChecklistItem = (itemId: string) => {
    if (newTask.checklistItems.length <= 1) {
      Alert.alert("Error", "Task must have at least one checklist item.")
      return
    }

    setNewTask({
      ...newTask,
      checklistItems: newTask.checklistItems.filter((item) => item.id !== itemId),
    })
  }

  // Update a checklist item text
  const updateChecklistItemText = (itemId: string, text: string) => {
    setNewTask({
      ...newTask,
      checklistItems: newTask.checklistItems.map((item) => {
        if (item.id === itemId) {
          return { ...item, text }
        }
        return item
      }),
    })
  }

  // Toggle checklist feature for new task
  const toggleHasChecklist = () => {
    setNewTask({
      ...newTask,
      hasChecklist: !newTask.hasChecklist,
      checklistItems: !newTask.hasChecklist ? [{ id: Date.now().toString(), text: "", isCompleted: false }] : [],
    })
  }

  // Add a new task
  const addNewTask = () => {
    if (newTask.title.trim() === "" || newTask.description.trim() === "") {
      Alert.alert("Error", "Please fill in both title and description fields.")
      return
    }

    // Check if all checklist items have text if hasChecklist is true
    if (newTask.hasChecklist) {
      const emptyChecklistItems = newTask.checklistItems.filter((item) => item.text.trim() === "")
      if (emptyChecklistItems.length > 0) {
        Alert.alert("Error", "Please fill in all checklist items or remove empty ones.")
        return
      }
    }

    // Generate a unique ID
    const taskId = Date.now()

    const newTaskObject: Task = {
      id: taskId,
      title: newTask.title,
      description: newTask.description,
      hasChecklist: newTask.hasChecklist,
      checklistItems: newTask.hasChecklist ? newTask.checklistItems : [],
      isCompleted: false,
    }

    // Add to current day's tasks
    setTasks([...tasks, newTaskObject])

    // If recurring, check if a task with the same name already exists
    if (isRecurring) {
      const taskExists = recurringTasks.some((task) => task.title.toLowerCase() === newTask.title.toLowerCase())
      if (taskExists) {
        Alert.alert(
          "Duplicate Task",
          "A recurring task with this name already exists. The task has been added to today only.",
          [{ text: "OK" }],
        )
      } else {
        // Add to recurring tasks if it doesn't exist
        const recurringTask = {
          ...newTaskObject,
          createdAt: selectedDate, // Track when this recurring task was created
        }
        setRecurringTasks([...recurringTasks, recurringTask])
      }
    }
    

    // Reset form
    setNewTask({
      title: "",
      description: "",
      hasChecklist: false,
      checklistItems: [],
    })
    setIsRecurring(false)
    setModalVisible(false)
  }

  // Show delete confirmation modal
  const confirmDeleteTask = (taskId: number) => {
    // Check if this task is a recurring task
    const isRecurringTask = recurringTasks.some((task) => task.id === taskId)

    setTaskToDelete(taskId)
    setDeleteMode(isRecurringTask ? "current" : "current") // Default to 'current' for both
    setDeleteModalVisible(true)
  }

  // Delete a task
  const deleteTask = () => {
    if (!taskToDelete) return

    if (deleteMode === "current") {
      // Remove from current day's tasks only
      setTasks(tasks.filter((task) => task.id !== taskToDelete))

      // Update tasksByDate for the current date
      const updatedTasksByDate = {
        ...tasksByDate,
        [selectedDate]: tasks.filter((task) => task.id !== taskToDelete),
      }
      setTasksByDate(updatedTasksByDate)

      // Save to AsyncStorage
      AsyncStorage.setItem("tasksByDate", JSON.stringify(updatedTasksByDate))
    } else if (deleteMode === "all") {
      // Remove from current day's tasks
      setTasks(tasks.filter((task) => task.id !== taskToDelete))

      // Remove from recurring tasks
      const updatedRecurringTasks = recurringTasks.filter((task) => task.id !== taskToDelete)
      setRecurringTasks(updatedRecurringTasks)

      // Remove from all dates in tasksByDate
      const updatedTasksByDate = { ...tasksByDate }
      Object.keys(updatedTasksByDate).forEach((date) => {
        updatedTasksByDate[date] = updatedTasksByDate[date].filter((task) => task.id !== taskToDelete)
      })
      setTasksByDate(updatedTasksByDate)

      // Save to AsyncStorage
      AsyncStorage.setItem("tasksByDate", JSON.stringify(updatedTasksByDate))
      AsyncStorage.setItem("recurringTasks", JSON.stringify(updatedRecurringTasks))
    }

    setDeleteModalVisible(false)
    setTaskToDelete(null)
  }

  // Change selected date
  const changeDate = (date: string) => {
    setSelectedDate(date)

    // Load tasks for the selected date
    if (tasksByDate[date]) {
      setTasks(tasksByDate[date])
    } else {
      // Initialize with recurring tasks instead of default tasks
      const newTasks = recurringTasks.map((task) => ({
        ...task,
        isCompleted: false,
        checklistItems:
          task.hasChecklist && task.checklistItems
            ? task.checklistItems.map((item) => ({
                ...item,
                isCompleted: false,
              }))
            : [],
      }))

      setTasks(newTasks)

      // Update tasksByDate
      const updatedTasksByDate = {
        ...tasksByDate,
        [date]: newTasks,
      }
      setTasksByDate(updatedTasksByDate)

      // Save to AsyncStorage
      AsyncStorage.setItem("tasksByDate", JSON.stringify(updatedTasksByDate))
    }

    // Calculate the day of Ramadan for the selected date
    const dayOfRamadan = getRamadanDay(moment(date))
    setCurrentDay(dayOfRamadan)

    // Close date picker modal
    setDatePickerVisible(false)
  }

  // Calculate progress percentage for a task
  const calculateProgress = (task: Task) => {
    if (!task.hasChecklist || !task.checklistItems || task.checklistItems.length === 0) return 0
    const completedItems = task.checklistItems.filter((item) => item.isCompleted).length
    return (completedItems / task.checklistItems.length) * 100
  }

  // Check if a date is after the first date with data
  const isDateAfterFirstData = (date: string) => {
    if (!firstDataDate) return false
    return moment(date).isAfter(moment(firstDataDate))
  }

  // Check if all tasks for a date are completed
  const isDateCompleted = (date: string) => {
    if (!tasksByDate[date] || tasksByDate[date].length === 0) return false
    return tasksByDate[date].every((task) => task.isCompleted)
  }

  // Get completion status for a date
  const getDateCompletionStatus = (date: string) => {
    if (tasksByDate[date]) {
      const totalTasks = tasksByDate[date].length
      const completedTasks = tasksByDate[date].filter((t) => t.isCompleted).length
      return { completed: completedTasks, total: totalTasks }
    } else if (isDateAfterFirstData(date)) {
      // For future dates that don't have data yet but come after the first date with data
      // We'll show 0/totalTasks where totalTasks is the number of recurring tasks
      const totalRecurringTasks = recurringTasks.filter((task) => {
        const taskDate = moment(task.createdAt)
        return taskDate && taskDate.isBefore(moment(date))
      }).length

      // Add default tasks count
      const totalTasks = totalRecurringTasks + defaultTasks.length
      return { completed: 0, total: totalTasks }
    }
    return { completed: 0, total: 0 }
  }

  // Open add task modal
  const openAddTaskModal = () => {
    setNewTask({
      title: "",
      description: "",
      hasChecklist: false,
      checklistItems: [],
    })
    setIsRecurring(false)
    setModalVisible(true)
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <View style={styles.container}>
        <Header currentDay={currentDay} selectedDate={selectedDate} onDatePress={() => setDatePickerVisible(true)} />

        <TaskList
          tasks={tasks}
          expandedTasks={expandedTasks}
          calculateProgress={calculateProgress}
          toggleTaskCompletion={toggleTaskCompletion}
          toggleTaskExpansion={toggleTaskExpansion}
          confirmDeleteTask={confirmDeleteTask}
          toggleChecklistItemCompletion={toggleChecklistItemCompletion}
          scrollViewRef={scrollViewRef}
        />

        <FloatingActionButton onPress={openAddTaskModal} />

        <AddTaskModal
          visible={isModalVisible}
          newTask={newTask}
          isRecurring={isRecurring}
          onClose={() => setModalVisible(false)}
          onAddTask={addNewTask}
          onChangeTitle={(text) => setNewTask({ ...newTask, title: text })}
          onChangeDescription={(text) => setNewTask({ ...newTask, description: text })}
          onToggleHasChecklist={toggleHasChecklist}
          onToggleRecurring={setIsRecurring}
          onAddChecklistItem={addChecklistItem}
          onRemoveChecklistItem={removeChecklistItem}
          onUpdateChecklistItemText={updateChecklistItemText}
        />

        <DatePickerModal
          visible={isDatePickerVisible}
          availableDates={availableDates}
          selectedDate={selectedDate}
          onClose={() => setDatePickerVisible(false)}
          onSelectDate={changeDate}
          getDateCompletionStatus={getDateCompletionStatus}
          isDateCompleted={isDateCompleted}
          getRamadanDay={getRamadanDay}
        />

        <DeleteConfirmationModal
          visible={isDeleteModalVisible}
          deleteMode={deleteMode}
          onClose={() => setDeleteModalVisible(false)}
          onDelete={deleteTask}
          onChangeDeleteMode={setDeleteMode}
        />
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
})

