import { View, Text, SafeAreaView, Image, TouchableOpacity, FlatList, Alert } from 'react-native'
import React from 'react'
import images from '@/constants/images'
import ResultCard from '../components/ResultCard'
import CustomButton from '../components/CustomButton'
import icons from '@/constants/icons'
import { signOut, getHistory } from '@/lib/appwrite'
import { useGlobalContext } from '@/context/GlobalProvider'
import Loading from '../components/Loading'

const Recent = () => {

  const {user, setUser, isLogged, setIsLogged} = useGlobalContext();
  const [isLoading, setIsLoading] = React.useState(true);
  const [historyGames, setHistoryGames] = React.useState<any>(null);

  React.useEffect(() => {

    getHistory().then((history) => {
      console.log("History received:", history);
      setHistoryGames(history);
    }).catch((error) => {
      console.error("Error while fetching history of games:", error);
      Alert.alert("Error", error.message);
      setHistoryGames([]);
    }).finally(() => {
      setIsLoading(false);
    });

  }, [])

  const logOut = async () => {
    await signOut();
    setUser(null);
    setIsLogged(false);
  }

  return (
    isLoading || user == null ? <Loading/> :
      <SafeAreaView className='bg-secondary h-full'>
      <View className='w-full h-12 bg-secondary-100'/>
      <View className='flex flex-row flex-grow justify-between items-center bg-secondary-100 p-4'>
        <View className='flex flex-row items-center'>
          <Image source={{uri: user.avatar}} style={{width: 50, height: 50, borderRadius: 40, marginHorizontal: 12}} resizeMode='contain'/>
          <Text className='text-white text-xl font-psemibold'>Hello, {user.name}!</Text>
        </View>
        <TouchableOpacity onPress={logOut}>
          <Text className='text-red-800 font-pregular text-md'>
            Log out  
          </Text> 
        </TouchableOpacity>
      </View>
      {historyGames == null || historyGames.length <= 0 ? <View className="flex flex-col h-full items-center justify-center">
        <Text className='text-white text-2xl font-pbold text-center my-4'>Game not found</Text>
        <Text className='text-gray-100 text-md font-psemibold w-52 text-center'>
          We cannot find any game. Paste a link to play your first game!
        </Text>
        <CustomButton text="Play" onClick={() => {}} btnStyles={"bg-primary w-24 my-4"}/>
      </View>

      : <View className='flex flex-grow h-full justify-start p-4 space-y-2'>
          <View className='flex flex-row space-x-2 p-3'>
            <Text className='text-gray-100 text-md font-psemibold mx-2'>Your stats</Text>
            <Image source={icons.profileMusic} style={{width: 20, height: 20}} tintColor="white" resizeMode='contain'/>
          </View>
          <View className='h-full flex flex-grow justify-start items-center'>
            <FlatList
              data={historyGames}
              renderItem={({item}) => <ResultCard song={item}/>}/>
          </View>
        </View>}
    </SafeAreaView>
  )
}

export default Recent