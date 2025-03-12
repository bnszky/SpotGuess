import React, {useEffect, useState, useRef} from 'react'
import {Image, Text, ScrollView, View, SafeAreaView, Alert} from 'react-native'
import {Animated, Easing} from 'react-native'
import CustomButton from '../components/CustomButton';
import MusicPlayer from '../components/MusicPlayer';
import {router} from 'expo-router';
import Loading from '../components/Loading';
import { useLocalSearchParams } from 'expo-router';
import { getQuestions, sendResult } from '@/lib/appwrite';

function Game() {
    const {playlistId, correct: correctParam} = useLocalSearchParams();
    
    // Internal state for tracking questions and current index
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(parseInt(correctParam as string, 10) || 0);
    
    const [isLoading, setIsLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isRevealed, setIsRevealed] = useState(false);
    const [selectedOption, setSelectedOption] = useState<number|null>(null);
    const [questionInfo, setQuestionInfo] = useState({
        songTitle: "",
        artistName: "",
        cover: null,
        songPreview: "",
        options: [
            {title: "", isCorrect: false},
            {title: "", isCorrect: false},
            {title: "", isCorrect: false},
            {title: "", isCorrect: false}
        ]
    });
    
    // Animation refs
    const buttonAnimations = [
        useRef(new Animated.Value(0)).current,
        useRef(new Animated.Value(0)).current,
        useRef(new Animated.Value(0)).current,
        useRef(new Animated.Value(0)).current,
    ];
    const moveDownAnimation = useRef(new Animated.Value(0)).current;
    const revealAnimation = useRef(new Animated.Value(0)).current;
    
    // Fetch questions once when component mounts
    useEffect(() => {
        const fetchQuestions = async () => {
            setIsLoading(true);
            try {
                const fetchedQuestions = await getQuestions(playlistId as string, 10);
                console.log("Fetched questions:", fetchedQuestions);
                setQuestions(fetchedQuestions);
            } catch (error) {
                console.error("Error fetching questions:", error);
                Alert.alert("Error", "Failed to load questions. Please try again.");
                router.replace('/');
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchQuestions();
    }, [playlistId]);
    
    // Load current question when questions array changes or current index changes
    useEffect(() => {
        if (questions && questions.length > 0 && currentQuestionIndex < questions.length) {
            try {
                const currentQuestion = questions[currentQuestionIndex];
                setQuestionInfo({
                    songTitle: currentQuestion.song.title,
                    artistName: currentQuestion.song.artist,
                    cover: currentQuestion.song.cover,
                    songPreview: currentQuestion.song.preview,
                    options: [
                        {title: currentQuestion.answers[0].title, isCorrect: currentQuestion.answers[0].isCorrect === "true"},
                        {title: currentQuestion.answers[1].title, isCorrect: currentQuestion.answers[1].isCorrect === "true"},
                        {title: currentQuestion.answers[2].title, isCorrect: currentQuestion.answers[2].isCorrect === "true"},
                        {title: currentQuestion.answers[3].title, isCorrect: currentQuestion.answers[3].isCorrect === "true"}
                    ]
                });
            } catch (error) {
                console.error("Error setting up question:", error);
            }
        }
    }, [questions, currentQuestionIndex]);
    
    // Reset animations to initial state
    const resetAnimations = () => {
        buttonAnimations.forEach(anim => anim.setValue(0));
        moveDownAnimation.setValue(0);
        revealAnimation.setValue(0);
    };
    
    // Move to next question or end game
    const handleNextQuestion = () => {
        const isCorrect = selectedOption !== null && questionInfo.options[selectedOption].isCorrect;
        
        if (isCorrect) {
            setCorrectAnswers(prev => prev + 1);
        }
        
        // If this is the last question, go to results page
        if (currentQuestionIndex >= questions.length - 1) {

            sendResult(playlistId as string, questions.length, correctAnswers).then(() => {
                console.log("Result sent successfully");
            }
            ).catch((error) => {
                console.error("Error sending result:", error);
            }).finally(() => {
                router.replace({
                    pathname: '/end',
                    params: { 
                        playlistId: playlistId,
                        correct: isCorrect ? correctAnswers + 1 : correctAnswers, 
                        total: questions.length,
                    }
                });
            });

        } else {
            // Reset state for next question
            resetAnimations();
            setIsSubmitted(false);
            setIsRevealed(false);
            setSelectedOption(null);
            setIsPlaying(false);
            
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };
    
    // Animation values for each button
    const BUTTON_FULL_HEIGHT = 80;
    const REVEAL_HEIGHT = 180;

    // Function to animate buttons sliding away
    const animateButtonsAway = () => {
        setIsSubmitted(true);
        
        let slideRightAnimations = [];
        for(let i = 0; i < buttonAnimations.length; i++) {
            let delayIterator = 0;
            if(!questionInfo.options[i].isCorrect && selectedOption !== i) {
                slideRightAnimations.push(Animated.timing(buttonAnimations[i], {
                    toValue: 1,
                    duration: 500,
                    delay: delayIterator,
                    useNativeDriver: true,
                    easing: Easing.ease
                }));
                delayIterator += 100;
            }
        }
        
        const moveDownAnim = Animated.timing(moveDownAnimation, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.ease
        });
        
        const revealAnim = Animated.timing(revealAnimation, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.ease
        });
        
        Animated.sequence([
            Animated.parallel(slideRightAnimations),
            moveDownAnim,
            revealAnim
        ]).start(() => {
            setIsRevealed(true);
        });
    };
    
    const getSlideRightStyle = (animValue: any) => {
        return {
            transform: [{
                translateX: animValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 400] // Slide right
                })
            }],
            opacity: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0] // Fade out
            })
        };
    };
    
    const getMoveDownStyle = (animValue: number) => {
        return {
            transform: [{
                translateY: moveDownAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, animValue] // Move down to make space for song info
                })
            }]
        };
    };

    const getMoveButtonStyle = (id: number) => {

        let calculatedHeight = null;

        if(questionInfo.options[id].isCorrect) {
            if(selectedOption == id){
                calculatedHeight = BUTTON_FULL_HEIGHT * (2.5-id)
            }
            else {
                calculatedHeight = BUTTON_FULL_HEIGHT * (3-id)
            }
        }
        else if(selectedOption == id) {
            if(id == 3){
                calculatedHeight = -BUTTON_FULL_HEIGHT
            }
            else {
                calculatedHeight = BUTTON_FULL_HEIGHT * (2-id)
            }
        }
        else {
            return getSlideRightStyle(buttonAnimations[id]);
        }

        return {
            transform: [{
                translateY: moveDownAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, calculatedHeight]
                })
            }]
        };

    }
    
    const getRevealStyle = () => {
        return {
            opacity: revealAnimation,
            transform: [{
                translateY: revealAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, 0]
                })
            }]
        };
    };

    // Helper function to determine button style based on reveal state
    const getButtonStyle = (index: number) => {
        if (isRevealed) {
            if (questionInfo.options[index].isCorrect) {
                return "bg-green-500";
            } else if (selectedOption === index) {
                return "bg-red-500";
            } else {
                return "bg-gray-200";
            }
        } else {
            return selectedOption === index ? "bg-primary" : "bg-gray-200";
        }
    };
    
    // Helper function to determine text style based on reveal state
    const getTextStyle = (index: number) => {
        if (isRevealed) {
            if (questionInfo.options[index].isCorrect || selectedOption === index) {
                return "color-secondary-100";
            } else {
                return "color-white";
            }
        } else {
            return selectedOption === index ? "color-secondary-100" : "color-white";
        }
    };

    return (
        isLoading ? <Loading/> :
        <SafeAreaView className="bg-secondary flex-1">
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start', height: "100%", paddingHorizontal: 40, paddingVertical: 40 }}>
                <Text className='font-pregular text-sm text-gray-100 mt-10'>
                    Song {currentQuestionIndex + 1} / {questions.length}
                </Text>
                <View className="w-full bg-gray-100 my-1" style={{height: 1}} />
                
                <Animated.View 
                    pointerEvents={isRevealed ? 'auto' : 'none'}
                    style={[
                        {
                            position: 'absolute',
                            top: 120,
                            left: 0,
                            right: 0,
                            zIndex: 10,
                            opacity: 0,
                            paddingHorizontal: 40
                        },
                        getRevealStyle()
                    ]}>
                    <View className='flex flex-row justify-center w-full my-10'>
                        <Image source={{ uri: questionInfo.cover }} resizeMode="contain" style={{width: 150, height: 150}}/>
                        <View className='flex flex-col justify-center items-center ml-10 w-48'>
                            <Text className='font-pbold text-lg text-white my-2'>{questionInfo.songTitle}</Text>
                            <Text className='font-pregular text-sm text-primary'>{questionInfo.artistName}</Text>
                        </View>
                    </View>
                </Animated.View>
                
                    <View className="flex flex-col justify-start items-center w-full h-full">
                        <Animated.View style={getMoveDownStyle(REVEAL_HEIGHT)}>
                            <MusicPlayer isPlaying={isPlaying} setIsPlaying={setIsPlaying} previewUrl={questionInfo.songPreview}  />
                        </Animated.View>
                        <View className="flex flex-col mt-10">
                            <Animated.View style={getMoveButtonStyle(0)}>
                                <CustomButton text={questionInfo.options[0].title} onClick={() => {setSelectedOption(0)}} 
                                    btnStyles={`w-96 p-5 rounded-full ${getButtonStyle(0)} mt-7`} 
                                    textStyles={`text-sm ${getTextStyle(0)} font-psemibold`} />
                            </Animated.View>
                            
                            <Animated.View style={getMoveButtonStyle(1)}>
                                <CustomButton text={questionInfo.options[1].title} onClick={() => {setSelectedOption(1)}} 
                                    btnStyles={`w-96 p-5 rounded-full ${getButtonStyle(1)} mt-7`} 
                                    textStyles={`text-sm ${getTextStyle(1)} font-psemibold`} />
                            </Animated.View>
                            
                            <Animated.View style={getMoveButtonStyle(2)}>
                                <CustomButton text={questionInfo.options[2].title} onClick={() => {setSelectedOption(2)}} 
                                    btnStyles={`w-96 p-5 rounded-full ${getButtonStyle(2)} mt-7`} 
                                    textStyles={`text-sm ${getTextStyle(2)} font-psemibold`} />
                            </Animated.View>
                            
                            <Animated.View style={getMoveButtonStyle(3)}>
                                <CustomButton text={questionInfo.options[3].title} onClick={() => {setSelectedOption(3)}} 
                                    btnStyles={`w-96 p-5 rounded-full ${getButtonStyle(3)} mt-7`} 
                                    textStyles={`text-sm ${getTextStyle(3)} font-psemibold`} />
                            </Animated.View>

                            <CustomButton text={!isRevealed ? "Submit" : "Next Question"} 
                                onClick={!isRevealed ? animateButtonsAway : handleNextQuestion} 
                                btnStyles={"w-96 p-5 rounded-full bg-primary mt-12"} 
                                textStyles={"text-sm color-secondary font-pbold"} />
                        </View>
                    </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default Game
