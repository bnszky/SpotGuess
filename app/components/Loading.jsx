import React from 'react'
import { View, ActivityIndicator } from 'react-native'

function Loading() {
  return (
    <View className="bg-secondary flex-1 items-center justify-center h-full w-full">
        <ActivityIndicator size="large" color="#FDE9CC" />
    </View>
  )
}

export default Loading
