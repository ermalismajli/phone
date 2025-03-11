import type React from "react"
import { View, type ViewStyle } from "react-native"

interface GradientViewProps {
  colors: string[]
  style?: ViewStyle
  children: React.ReactNode
}

const GradientView: React.FC<GradientViewProps> = ({ colors, style, children }) => {
  return <View style={[style, { backgroundColor: colors[0] }]}>{children}</View>
}

export default GradientView

