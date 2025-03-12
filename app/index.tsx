import { ScrollView, Text, View, Image, TouchableOpacity, ImageBackground } from "react-native";
import "../global.css";
import { SafeAreaView } from "react-native-safe-area-context";
import images from "../constants/images";
import logo from "../constants/logo";
import CustomButton from "./components/CustomButton";
import {router, Redirect} from "expo-router";
import { useGlobalContext } from "@/context/GlobalProvider";

export default function Index() {

  const {loading, isLogged} = useGlobalContext();

  if(!loading && isLogged) {
    return <Redirect href="/home" />
  }

  return (
    <ImageBackground source={images.bg1} style={{ width: '100%', height: '100%' }}>
      <SafeAreaView className="flex-1">
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end', alignItems: 'center', height: "100%" }}
        >
          <View className="p-4 flex flex-col items-center justify-center w-80 mb-12 gap-y-2">
            <Text className="text-center text-white text-2xl font-bold">Guess millions of songs with SpotGuess</Text>
            <CustomButton text="Sign up free" onClick={() => router.push("/sign-up")} btnStyles={"w-80 p-2 mt-2 bg-primary"} textStyles={"text-md"} />

            <CustomButton text="Continue with Google" onClick={() => {}} logo={logo.google} 
            btnStyles={"w-80 p-3 border-gray-100 border-2 bg-gray-200"} 
            textStyles={"text-sm color-white"} />
            <CustomButton text="Continue with Facebook" onClick={() => {}} logo={logo.fb} 
            btnStyles={"w-80 p-3 border-gray-100 border-2 bg-gray-200"} 
            textStyles={"text-sm color-white"} />
            <CustomButton text="Continue with Apple" onClick={() => {}} logo={logo.apple} 
            btnStyles={"w-80 p-3 border-gray-100 border-2 bg-gray-200"} 
            textStyles={"text-sm color-white"} />
            <TouchableOpacity onPress={() => router.push("/sign-in")}>
              <Text className="text-white text-sm font-pbold mt-4">
                Log in
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}
