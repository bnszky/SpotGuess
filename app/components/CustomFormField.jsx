import React from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import icons from "@/constants/icons";

function CustomFormField({title = null, value, placeholder = "", onChange, isPassword = false, otherStyles = {}, ...props}) {

  const [showPassword, setShowPassword] = React.useState(false);

return (
    <View className='flex flex-col w-full relative'>
        {title && <Text className='text-white text-sm font-pbold mx-3'>{title}</Text>}
        <TextInput
            placeholder={placeholder}
            value={value}
            onChangeText={onChange}
            secureTextEntry={isPassword && !showPassword}
            className={`border-2 border-gray-200 bg-gray-100 px-4 rounded-3xl text-white font-pregular text-sm ${otherStyles}`}
            textAlignVertical="center"
            style={{height: 50}}
            {...props}
        />
        {isPassword && (
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className='absolute right-4 bottom-3'>
                <Image source={showPassword ? icons.eye : icons.eyeHide} style={{height: 24, width: 24, tintColor: "white"}} resizeMode="contain"/>
            </TouchableOpacity>
        )}
    </View>
)
}

export default CustomFormField
