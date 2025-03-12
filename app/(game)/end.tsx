import React, { useEffect, useRef } from 'react'
import { SafeAreaView, ScrollView, Text, Image, View, TouchableOpacity, Animated } from 'react-native'
import images from "@/constants/images";
import AnimatedProgressWheel from 'react-native-progress-wheel';
import CustomButton from "../components/CustomButton";
import { router } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { getPlaylist } from '@/lib/appwrite';
import Loading from '../components/Loading';
import { formatDuration, formatFans } from '@/lib/help';

function End() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [playlist, setPlaylist] = React.useState<any | null>(null);
  const params = useLocalSearchParams();
  const { playlistId } = params;
  const total = Number(params.total || 0);
  const correct = Number(params.correct || 0);
  const playlistOpacity = useRef(new Animated.Value(0)).current;
  const buttonsTranslateY = useRef(new Animated.Value(50)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {

    setIsLoading(true);
    async function fetchPlaylist() {
      try {
        const p = await getPlaylist(playlistId);
        console.log("Playlist received:", p);
        setPlaylist({
          cover: p.cover,
          description: p.description,
          fans: p.fans,
          duration: p.duration,
          title: p.title
        });
        setIsLoading(false);
      } catch (error) {
        console.error("Error while fetching playlist:", error);
        setIsLoading(false);
      }
    }
    fetchPlaylist();

    Animated.sequence([
      Animated.timing(playlistOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(buttonsTranslateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(buttonsOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ]).start();
  }, []);

  return (
    isLoading ? <Loading/> :
    <SafeAreaView className="bg-secondary flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start', height: "100%", paddingHorizontal: 40, paddingVertical: 40 }}>
            <Text className='font-pregular text-sm text-gray-100 mt-10'>Finished</Text>
            <View className="w-full bg-gray-100 my-1" style={{height: 1}} />
            
            <Animated.View 
              className="flex flex-col justify-center items-center"
              style={{ opacity: playlistOpacity }}
            >
                <View className='w-full flex justify-center items-center mt-16 playlist-desp'>
                    <Image source={{ uri: playlist.cover }} style={{width: 200, height: 200}} resizeMode='contain'/>
                    <Text className='font-psemibold text-gray-100 text-xs mt-4 text-center'>{playlist.description} </Text>
                    <Text className='font-psemibold text-gray-100 text-xs mt-2 text-center'>{formatFans(playlist.fans)} fans | {formatDuration(playlist.duration)} </Text>
                </View>
            </Animated.View>
            
            <Animated.View 
              className='flex flex-col justify-center items-center mt-10'
              style={{ 
                opacity: buttonsOpacity,
                transform: [{ translateY: buttonsTranslateY }]
              }}
            >
                <AnimatedProgressWheel
                    size={220}
                    width={20}
                    animateFromValue={0}
                    showProgressLabel={true}
                    showPercentageSymbol={true}
                    labelStyle={{fontSize: 36, color: '#FDE9CC', fontWeight: 'bold'}}
                    subtitleStyle={{fontSize: 12, color: '#FDE9CC', fontWeight: 'bold'}}
                    subtitle={`Questions out of ${total}`}
                    duration={5000}
                    color={'#FDE9CC'}
                    progress={(correct/total)*100}
                    backgroundColor={'#777777'}
                />
                <CustomButton text="Continue" onClick={() => router.push('/home')}
                btnStyles={"w-60 p-3 rounded-full bg-primary mt-12"} 
                textStyles={"text-md color-secondary font-pbold"}/>
                <TouchableOpacity onPress={() => router.push('/home')}>
                    <Text className='text-primary text-md font-psemibold mt-6'>Play again</Text>
                </TouchableOpacity>
            </Animated.View>
        </ScrollView>
    </SafeAreaView>
  )
}

export default End
