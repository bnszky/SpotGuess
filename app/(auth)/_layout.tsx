import { Stack } from 'expo-router'
import React from 'react'

function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="/sign-in" />
      <Stack.Screen name="/sign-up" />
    </Stack>
  )
}

export default AuthLayout
