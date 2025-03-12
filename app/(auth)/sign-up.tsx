import { ScrollView, Text, View, Image, TouchableOpacity, Alert, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import images from "@/constants/images";
import CustomButton from "../components/CustomButton";
import CustomFormField from "../components/CustomFormField";
import {router} from "expo-router";
import React from "react";
import { signUp, signOut } from "@/lib/appwrite"
import { useGlobalContext } from "@/context/GlobalProvider";

export default function SignUp() {

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { setIsLogged } = useGlobalContext();

  const [form, setForm] = React.useState({
    username: "",
    email: "",
    password: "",
    repeatPassword: "",
  });

  const submit = async () => {

    setIsSubmitting(true);
    if(!form.username || !form.email || !form.password) {
      Alert.alert("Error", "Please fill in all fields");
    }

    if(form.password !== form.repeatPassword) {
      Alert.alert("Error", "Passwords do not match");
    }

    try {
      await signUp(form.email, form.password, form.username);
      
      setIsLogged(true)
      router.replace("/home")
    } catch (error : any) {
      console.error(error);
      Alert.alert("Error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ImageBackground source={images.bg1} style={{ width: '100%', height: '100%' }}>
    <SafeAreaView className="flex-1">
      <ScrollView contentContainerStyle={{flexGrow: 1, height: "100%", justifyContent: "center", alignItems: "center"}}>
      <View className="p-4 items-center justify-center w-80 space-y-1">
        <Text className="text-center text-white text-2xl font-bold my-4">Register for free </Text>
        <CustomFormField
          title="Username"
          value={form.username}
          isPassword={false}
          onChange={(text: string)  => setForm({...form, username: text})}
        />
        <CustomFormField 
          title="Email"
          value={form.email}
          isPassword={false}
          onChange={(text: string) => setForm({...form, email: text})}
        />
        <CustomFormField 
          title="Password"
          value={form.password}
          isPassword={true}
          onChange={(text: string) => setForm({...form, password: text})}
        />
        <CustomFormField 
          title="Repeat Password"
          value={form.repeatPassword}
          isPassword={true}
          onChange={(text: string) => setForm({...form, repeatPassword: text})}
        />
        <CustomButton text="Sign up" onClick={submit} btnStyles={"w-full p-2 bg-primary my-4"} textStyles={"text-md"} isSubmitting={isSubmitting} />
        <TouchableOpacity onPress={() => router.push("/sign-in")}>
          <Text className="text-white text-sm">Already have an account? Log in </Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </SafeAreaView>
    </ImageBackground>
  );
}
