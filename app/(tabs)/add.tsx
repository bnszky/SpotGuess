import { Image, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native'
import images from '@/constants/images'
import CustomButton from '../components/CustomButton'
import CustomFormField from '../components/CustomFormField'
import React from 'react'
import { router } from 'expo-router'
import { verifyPlaylistLink } from '@/lib/appwrite'

const Add = () => {

  const [link, setLink] = React.useState("")

  return (
    <SafeAreaView className="bg-secondary h-full">
      <Image source={images.bg2} style={{ width: '100%', height: '100%', position: 'absolute' }} />
      <ScrollView contentContainerStyle={{flexGrow: 1, height: "100%", justifyContent: "center", alignItems: "center"}}>
      <View className="p-4 items-center justify-center w-80 space-y-4">
      <Text className="text-center text-white text-3xl font-bold mb-5">Paste link and start your game</Text>
        <CustomFormField placeholder="Your Deezem link..." value={link} onChange={(t: string) => {setLink(t)}} />
        <CustomButton 
          text="Search" 
          onClick={async () => {
            try{
              const id = await verifyPlaylistLink(link)
              console.log(id)
              router.push({
                pathname: "/(game)/preview",
                params: { playlistId: id }
              });
            } catch (error : any) {
              console.error(error)
              Alert.alert("Error", error.message)
            }
          }} 
          btnStyles={"w-full p-2 mt-4 bg-primary"} 
          textStyles={"text-md font-pregular"} 
        />
      </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Add