import React from 'react'
import { TouchableOpacity, Text, Image, View} from 'react-native'

function CustomButton({text, onClick, btnStyles = {}, textStyles = {}, logo = null, icon = null, iconPosition = null, isSubmitting = false}) {
    return (
        <TouchableOpacity onPress={onClick} className={`${btnStyles} rounded-3xl flex flex-row p-2 ${icon ? "justify-between px-4" : "justify-center"} items-center ${isSubmitting && "opacity-50"}`} disabled={isSubmitting}>
            {logo && <Image source={logo} style={{height: 20, width: 20}} resizeMode="contain" className='mx-2 absolute left-2'/>}
            {icon && iconPosition === 'left' && <Image source={icon} style={{height: 20, width: 20}} tintColor="black" resizeMode="contain" className='mx-2'/>}
            <Text className={`text-black font-psemibold text-center ${textStyles}`}>{text}</Text>
            {icon && iconPosition === 'right' && <Image source={icon} style={{height: 20, width: 20}} tintColor="black" resizeMode="contain" className='mx-2'/>}
        </TouchableOpacity>
    )
}

export default CustomButton
