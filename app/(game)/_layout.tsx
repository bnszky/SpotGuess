import { Stack } from "expo-router";
import React from "react";

export default function RootLayout() {

  return (
    <Stack 
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="preview" />
      <Stack.Screen name="game" />
      <Stack.Screen name="end" />
    </Stack>
  );
}
