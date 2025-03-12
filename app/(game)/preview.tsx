import { View, Text, SafeAreaView, Image, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import React from 'react'
import {router, useLocalSearchParams} from "expo-router"
import images from "@/constants/images"
import icons from "@/constants/icons"
import SongPreview from "../components/SongPreview"
import CustomButton from '../components/CustomButton'
import { getPlaylist, getQuestions } from '@/lib/appwrite'
import Loading from '../components/Loading'
import { formatDuration, formatFans } from "@/lib/help"

function Preview() {
    const { playlistId } = useLocalSearchParams();
    const [isLoading, setIsLoading] = React.useState(true)
    const [currentPlayingSongId, setCurrentPlayingSongId] = React.useState<number | null>(null)
    const [playlist, setPlaylist] = React.useState<any | null>(null)
    
    React.useEffect(() => {
        console.log("Playlist ID received:", playlistId);
        setIsLoading(true);
        
        getPlaylist(playlistId).then((playlist) => {
            console.log("Playlist received:", playlist);
            setPlaylist(playlist);
            setIsLoading(false);
        }).catch((error) => {
            console.error("Error while fetching playlist:", error);
            Alert.alert("Error", error.message);
            setPlaylist(null);
            setIsLoading(false);
        });


    }, [playlistId]);

    const play = async () => {

        setIsLoading(true);
        try{
            const questions = await getQuestions(playlistId, 10)
            console.log(questions)
            router.push({
                pathname: "/(game)/game",
                params: { playlistId: playlistId, questions: questions, number: 0, correct: 0 }
            });
        } catch (error : any) {
            console.error(error)
            Alert.alert("Error", error.message)
        } finally {
            setIsLoading(false);
        }
    }

    const ListHeader = () => (
        <View style={{ alignItems: 'center', paddingHorizontal: 40, paddingTop: 70 }}>
            <Image source={{uri: playlist.cover}} resizeMode="contain" style={{width: 200, height: 200}} />
            <Text className="text-gray-100 text-center text-xs font-pregular mt-5">
                {playlist.description}
            </Text>
            <Text className="text-gray-100 text-center text-xs font-pregular mt-2 mb-4">
                {formatFans(playlist.fans)} • {formatDuration(playlist.duration)}
            </Text>
        </View>
    )
    
    const ListFooter = () => (
        <View style={{ alignItems: 'center', paddingHorizontal: 40, paddingBottom: 40 }}>
            <Text className="text-gray-100 text-center text-md font-pregular mt-2">
                {playlist.songs.length} songs have been found
            </Text>
            <View className='flex flex-row justify-between w-full mt-8'>
                <CustomButton text="Back" onClick={() => router.back()} 
                btnStyles="w-36 h-12 bg-primary" textStyles="text-md font-psemibold"
                icon={icons.arrowLeft} iconPosition='left' />
                <CustomButton text="Start" onClick={play} 
                btnStyles="w-36 h-12 bg-primary" textStyles="text-md font-psemibold"
                icon={icons.arrowRight} iconPosition='right'/>
            </View>
        </View>
    )

    return (
        isLoading ? <Loading/> :
        <SafeAreaView className="bg-secondary flex-1">
            {playlist == null ? 
            <View className="flex flex-col h-full items-center justify-center">
              <Text className='text-white text-2xl font-pbold text-center my-4'>Playlist not found</Text>
              <Text className='text-gray-100 text-md font-psemibold w-72 text-center'>
                We cannot find playlist you are looking for
              </Text>
              <CustomButton text="Back" onClick={() => router.push("/home")} btnStyles={"bg-primary w-32 mt-6"}/>
              <TouchableOpacity onPress={() => router.push("/home")}>
                <Text className='text-primary text-md font-psemibold mt-6'>Help</Text>
              </TouchableOpacity>
            </View> :
            <FlatList 
                data={playlist.songs} 
                ListHeaderComponent={ListHeader}
                ListFooterComponent={ListFooter}
                renderItem={({item}) => (
                    <SongPreview 
                        song={item} 
                        isPlaying={item.id === currentPlayingSongId} 
                        setIsPlaying={() => {
                            if(item.id === currentPlayingSongId) {
                                setCurrentPlayingSongId(null)
                            } else {
                                setCurrentPlayingSongId(item.id)
                            }
                        }} 
                    />
                )}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center' }}
            />}
        </SafeAreaView>
    )
}

export default Preview
