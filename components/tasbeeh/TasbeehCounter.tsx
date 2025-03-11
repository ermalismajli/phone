"use client"

import React, { useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Animated, Vibration, Dimensions } from "react-native"
import { Ionicons } from "react-native-vector-icons"

const { width, height } = Dimensions.get("window")
const COUNTER_SIZE = Math.min(width, height) * 0.7

interface TasbeehCounterProps {
  count: number
  target: number
  color: string
  onPress: () => void
  vibrationEnabled: boolean
  soundEnabled: boolean
}

const TasbeehCounter: React.FC<TasbeehCounterProps> = ({
  count,
  target,
  color,
  onPress,
  vibrationEnabled,
  soundEnabled,
}) => {
  const animatedValue = React.useRef(new Animated.Value(1)).current
  const progress = target > 0 ? (count / target) * 100 : 0
  const isCompleted = target > 0 && count >= target

  // Animation when counter is pressed
  const animatePress = () => {
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()
  }

  // Handle counter press
  const handlePress = () => {
    animatePress()

    if (vibrationEnabled) {
      Vibration.vibrate(20)
    }

    // Sound effect would be implemented here if using a sound library

    onPress()
  }

  // Celebration animation when target is reached
  useEffect(() => {
    if (isCompleted) {
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()

      if (vibrationEnabled) {
        Vibration.vibrate([0, 100, 50, 100])
      }
    }
  }, [isCompleted])

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={handlePress}>
      <Animated.View
        style={[
          styles.counterCircle,
          {
            borderColor: color,
            transform: [{ scale: animatedValue }],
          },
        ]}
      >
        <View style={[styles.innerCircle, { backgroundColor: `${color}10` }]}>
          <View style={styles.innerContent}>
            <Text style={[styles.counterText, { color }]}>{count}</Text>
            {target > 0 && <Text style={[styles.targetText, { color: `${color}99` }]}>of {target}</Text>}

            {isCompleted && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={28} color={color} />
              </View>
            )}
          </View>
        </View>

        {/* {target > 0 && (
          <View style={styles.progressRing}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress}%`,
                  backgroundColor: color,
                },
              ]}
            />
          </View>
        )} */}
      </Animated.View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  counterCircle: {
    width: COUNTER_SIZE,
    height: COUNTER_SIZE,
    borderRadius: COUNTER_SIZE / 2,
    borderWidth: 15,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 15,
    backgroundColor: "#fff",
  },
  innerCircle: {
    width: COUNTER_SIZE - 40,
    height: COUNTER_SIZE - 40,
    borderRadius: (COUNTER_SIZE - 40) / 2,
    justifyContent: "center",
    alignItems: "center",
  },
  innerContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  counterText: {
    fontSize: COUNTER_SIZE * 0.25,
    fontWeight: "bold",
  },
  targetText: {
    fontSize: COUNTER_SIZE * 0.07,
    fontWeight: "500",
    marginTop: 5,
  },
  completedBadge: {
    position: "absolute",
    top: -COUNTER_SIZE * 0.15,
    right: -COUNTER_SIZE * 0.15,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 5,
  },
  progressRing: {
    position: "absolute",
    bottom: 20,
    width: "60%",
    height: 8,
    backgroundColor: "#eee",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
})

export default TasbeehCounter

