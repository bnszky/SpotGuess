import { ScrollView, Text, View, ImageBackground, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import images from "@/constants/images";
import CustomButton from "../components/CustomButton";
import CustomFormField from "../components/CustomFormField";
import {router} from "expo-router";
import React from "react";
import { signIn } from "@/lib/appwrite"
import { useGlobalContext } from "@/context/GlobalProvider";

export default function SignIn() {

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const {setIsLogged} = useGlobalContext();

  const [form, setForm] = React.useState({
    email: "",
    password: "",
  });

  const submit = async () => {

    if(!form.email || !form.password) {
      Alert.alert("Error", "Please fill in all fields");
    }

    setIsSubmitting(true);
    try {
      await signIn(form.email, form.password);

      setIsLogged(true);
      router.replace("/home");
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
      <ScrollView contentContainerStyle={{flexGrow: 1, height: "100%", justifyContent: "flex-end", alignItems: "center"}}>
      <View className="p-4 items-center justify-center w-80 space-y-2 my-20">
        <Text className="text-center text-white text-2xl font-bold my-4 w-56">Log in to your account</Text>

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
        <CustomButton text="Sign in" onClick={submit} btnStyles={"w-full p-2 bg-primary my-4"} textStyles={"text-md"} />
        <TouchableOpacity onPress={() => router.push("/")}>
          <Text className="text-white text-sm text-center">Dont you have account? </Text>
          <Text className="text-white text-sm text-center">Sign up for free now! </Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </SafeAreaView>
    </ImageBackground>
  );
}
