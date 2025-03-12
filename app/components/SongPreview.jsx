import icons from "@/constants/icons"
import React, { useEffect, useState } from 'react'
import { TouchableOpacity, View, Text, Image } from 'react-native'
import AnimatedBars from './AnimatedBars'
import { Audio } from 'expo-av'

function SongPreview({song, isPlaying, setIsPlaying}) {
    const [sound, setSound] = useState(null);

    const {
        id,
        title,
        artist,
        cover,
        preview
    } = song

    useEffect(() => {
        // Load sound on component mount
        const loadSound = async () => {
            try {
                const { sound } = await Audio.Sound.createAsync({ uri: preview });
                setSound(sound);
            } catch (error) {
                console.error("Error loading sound:", error);
            }
        };
        
        loadSound();
        
        // Cleanup sound when component unmounts
        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [preview]);

    useEffect(() => {
        // Play or pause sound based on isPlaying state
        if (sound) {
            if (isPlaying) {
                sound.playAsync();
            } else {
                sound.pauseAsync();
            }
        }
    }, [isPlaying, sound]);

    return (
        <View className="bg-primary flex flex-row items-center justify-between p-2 my-2 w-96 rounded-full">
            <View className="flex flex-row items-center ml-4">
                <Image source={{ uri: cover }} resizeMode='contain' style={{width: 50, height: 50, borderRadius: 10}} />
                <View className="flex flex-col ml-4 w-36">
                    <Text className="text-secondary-100 font-psemibold text-sm">{title}</Text>
                    <Text className="text-secondary font-pregular text-xs">{artist}</Text>
                </View>
                {isPlaying && <AnimatedBars isPlaying={isPlaying} width={46} height={30} thickness={4} color="secondary-100" />}
            </View>
            <TouchableOpacity onPress={() => setIsPlaying(!isPlaying)}>
                <Image source={isPlaying ? icons.resume : icons.play} resizeMode='contain' style={{width: 32, height: 32, borderRadius: 40, marginRight: 8}} />
            </TouchableOpacity>
        </View>
    )
}

export default SongPreview
