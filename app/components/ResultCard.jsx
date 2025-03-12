import React from 'react'
import {Image, View, Text, TouchableOpacity} from 'react-native'
import icons from "@/constants/icons"
import { formatDuration, getTimeAgo } from '@/lib/help'
import AnimatedProgressWheel from 'react-native-progress-wheel'

function ResultCard({song}) {

    const {
        id,
        title,
        cover,
        fans,
        duration,
        correct_answers,
        questions_number,
        finished_date
    } = song

  return (
    <TouchableOpacity>
    <View className={'bg-primary rounded-lg w-96 h-48 flex flex-row justify-between items-center my-2 pl-4 pr-8'}>
      <View className={'flex flex-col h-full justify-center items-center'}>
        <Image source={{uri: cover}} resizeMode='contain' style={{height: 100, width: 100}}/>
        <View className='flex flex-col p-2 text-center items-center'>
          <Text className='text-secondary-100 font-psemibold text-sm'>{title}</Text>  
          <Text className='text-gray-100 font-pregular text-xs'>{formatDuration(duration)}</Text>  
        </View>
      </View>
      <View className='flex flex-col h-full justify-center items-center'>
        <AnimatedProgressWheel
            size={120}
            width={20}
            animateFromValue={0}
            showProgressLabel={true}
            showPercentageSymbol={true}
            labelStyle={{fontSize: 12, color: '#010D34'}}
            subtitleStyle={{fontSize: 8, color: '#010D34'}}
            subtitle={`${correct_answers} out of ${questions_number}`} 
            duration={5000}
            color={'#010D34'}
            progress={(correct_answers / questions_number) * 100}
            backgroundColor={'#777777'}
        />
        <View className='flex flex-row mt-2'>
            <Text className='text-secondary-100 text-xs font-pregular mx-1'>{getTimeAgo(finished_date)}</Text>
            <Image source={icons.orientationOutlined} style={{width: 14, height: 14, marginTop: 2.5}} tintColor={"gray"} resizeMode='contain'/>
        </View>
      </View>
    </View>
    </TouchableOpacity>
  )
}

export default ResultCard