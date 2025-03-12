import React from 'react'
import {Image, View, Text, TouchableOpacity} from 'react-native'
import icons from "@/constants/icons"
import { formatDuration, getTimeAgo } from '@/lib/help'

function PlaylistCard({song}) {

    const {
        title,
        duration,
        last_played,
        cover
    } = song

  return (
    <TouchableOpacity>
    <View className={'bg-primary rounded-full w-96 pl-7 pr-3 py-2 flex flex-row justify-between items-center my-2'}>
      <View className={'flex flex-row items-center'}>
        <Image source={{uri: cover}} resizeMode='contain' style={{height: 52, width: 52}}/>
        <View className='flex flex-col p-2'>
          <Text className='text-secondary-100 font-psemibold text-md'>{title}</Text>  
          <Text className='text-gray-100 font-pregular text-sm'>{formatDuration(duration)}</Text>  
        </View>
      </View>
      <View className='flex flex-row'>
        <Text className="text-gray-100 font-pregular text-xs mx-2">
          {last_played != null ? getTimeAgo(last_played) : "Never played"}
        </Text>
        {last_played && <Image source={icons.orientationOutlined} style={{width: 20, height: 20}} tintColor={"gray"} resizeMode='contain'/>}
      </View>
    </View>
    </TouchableOpacity>
  )
}

export default PlaylistCard
