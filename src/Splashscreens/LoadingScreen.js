import { View, Text, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Dimensions } from 'react-native';


export default function SplashScreen() {
    const navigation = useNavigation();
    const { height, width } = Dimensions.get('window');

    useEffect(() => {
        setTimeout(() => {
            navigation.replace("Gui"); // Ensure "Home" exists in Stack.Navigator
        }, 3000);
    }, []);
    
    return (
        <LinearGradient colors={['#f43f5e', '#ec4899']} className="flex-1 justify-center items-center">
            <View className="items-center">
                <View className="w-24 h-24 bg-white rounded-full flex justify-center items-center">
                    <Text className="text-4xl text-red-500">Iv</Text>
                </View>
                <Text className="text-white font-bold text-lg mt-4">IVJOURNEY</Text>
                <Text className="text-white text-center mt-2 px-10">
                    organizing your visit... bridging{''}knowledge and experience
                </Text>
            </View>
            <View style={{ position: 'absolute', bottom: 0, width: width, height: height * 0.3 }}>
                <Image source={require('../../assets/Graphics.png')} 
                    style={{ width: '100%', height: '100%', resizeMode: 'contain' }} />
            </View>
        </LinearGradient>
    );
}
