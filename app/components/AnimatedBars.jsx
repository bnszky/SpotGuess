import React, {useState, useEffect} from 'react'
import { View, Animated } from 'react-native'

function AnimatedBars({isPlaying, color, width, height = 10, thickness = 6, level = 5}) {

    const [barHeights] = useState(() =>
        new Array(Math.floor(width/(thickness*1.5))).fill(0).map(() => new Animated.Value(height))
    );    

    useEffect(() => {
        if (isPlaying) {
            animateBars()
        } else {
            resetBars()
        }
    }, [isPlaying])

    const animateBars = () => {

        // Create different animations for each bar
        const animations = barHeights.map((bar, index) => {
            const maxHeight = Math.random() * 15 + 15 // Different max heights between 15-30
            const minHeight = 5 + (index % 5) // Different min heights
            const duration1 = 300 + (index * 30) // Different durations
            const duration2 = 200 + (index * 40) // Different return durations
            
            return Animated.loop(
                Animated.sequence([
                    Animated.timing(bar, {
                        toValue: maxHeight,
                        duration: duration1,
                        useNativeDriver: false
                    }),
                    Animated.timing(bar, {
                        toValue: minHeight,
                        duration: duration2,
                        useNativeDriver: false
                    })
                ]),
                { iterations: -1 }
            )
        })
        
        // Start all animations with slight delays
        animations.forEach((animation, index) => {
            setTimeout(() => {
                animation.start()
            }, index * 50) // Add 50ms delay between each bar's animation start
        })
    }

    const resetBars = () => {
        // Stop all animations
        barHeights.forEach((bar) => {
            bar.stopAnimation()
            bar.setValue(height)
        })
    }

return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", height: {level}, paddingHorizontal: 10 }}>
            {barHeights.map((barHeight, index) => (
                    <Animated.View 
                            className={`bg-${color} rounded-lg`}
                            key={index}  
                            style={{
                                    height: barHeight,
                                    width: thickness,
                                    marginHorizontal: thickness / 2,
                                    borderRadius: 2
                            }} 
                    />
            ))}
    </View>
)
}

export default AnimatedBars
