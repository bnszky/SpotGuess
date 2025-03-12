import { Stack, Tabs } from 'expo-router'
import { Image, Text, View, SafeAreaView } from 'react-native'
import icons from '@/constants/icons'
import React from 'react'

interface TabIconProps {
  icon: any;
  iconSelected: any;
  color: string;
  name: string;
  focused: boolean;
}

const TabIcon: React.FC<TabIconProps> = ({icon, iconSelected, color, name, focused}) => {
  return <View className='items-center justify-center gap-1' style={{height: 14}}>
      <Image className='' source={focused ? iconSelected : icon} resizeMode='contain' tintColor={color} style={{ width: 20, height: 20}}/>
      <Text className={`${focused ? 'font-psemibold' : "font-pregular"} w-full text-xs`} style={{color: color}}>
          {name}
      </Text>
  </View>
}

export default function TabsLayout() {
  return (
    <SafeAreaView style={{ flex: 1, }}>
    <Tabs screenOptions={{
      tabBarShowLabel: false,
      tabBarActiveTintColor: '#FFFFFF',
      tabBarInactiveTintColor: '#777777',
      tabBarStyle: {
          backgroundColor: "#02091C",
          borderTopWidth: 0,
          height: 70,
          paddingTop: 12,
      }
    }}>
      <Tabs.Screen 
        name="home"
        options={{
            title: 'Home',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
                <TabIcon icon={icons.homeOutlined} iconSelected={icons.homeSolid} color={color} focused={focused} name="Home"/>
            )
      }} />
      <Tabs.Screen 
        name="add"
        options={{
            title: 'Add',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
                <TabIcon icon={icons.searchOutlined} iconSelected={icons.searchSolid} color={color} focused={focused} name="Add"/>
            )
      }} />
      <Tabs.Screen 
        name="recent"
        options={{
            title: 'Recent',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
                <TabIcon icon={icons.recentOutlined} iconSelected={icons.recentFilled} color={color} focused={focused} name="Recent"/>
            )
      }} />
    </Tabs>
    </SafeAreaView>
  )
}
