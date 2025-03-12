import React, { useState, useEffect, useRef } from 'react';
import Slider from '@react-native-community/slider';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import AnimatedBars from './AnimatedBars';
import icons from '@/constants/icons';

function MusicPlayer({ isPlaying, setIsPlaying, previewUrl }) {
    const [sound, setSound] = useState(null);

    useEffect(() => {
            // Load sound on component mount
            console.log(previewUrl);
            const loadSound = async () => {
                try {
                    const { sound } = await Audio.Sound.createAsync({ uri: previewUrl });
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
        }, [previewUrl]);
    
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
        <View className="flex flex-col mt-20">
            <View className='flex flex-row justify-between w-full'>
                <TouchableOpacity onPress={() => setIsPlaying(!isPlaying)}>
                    <Image source={isPlaying ? icons.pausePrimary : icons.playPrimary} resizeMode="contain" style={{ width: 60, height: 60, borderRadius: 40 }} />
                </TouchableOpacity>
                <AnimatedBars isPlaying={isPlaying} width={200} thickness={12} height={60} level={20} color="primary" />
            </View>
            <Slider
                style={{ width: 340, height: 50, marginTop: 20 }}
                minimumValue={0}
                maximumValue={29}
                value={0}
                onValueChange={() => {}}
                minimumTrackTintColor="#FDE9CC"
                maximumTrackTintColor="#FFFFFF"
                thumbTintColor='#FDE9CC'
            />
            <View className="flex flex-row justify-between w-full">
                <Text className='font-psemibold text-sm text-primary'>{}</Text>
                <Text className='font-psemibold text-sm text-primary'>{}</Text>
            </View>
        </View>
    );
}

export default MusicPlayer;
