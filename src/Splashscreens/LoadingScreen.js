/* global setTimeout, clearTimeout */
import { View, Text, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Dimensions } from 'react-native';

export default function SplashScreen() {
    const navigation = useNavigation();
    const { height, width } = Dimensions.get('window');

    useEffect(() => {
        const timer = setTimeout(() => {
            navigation.replace("Gui");
        }, 3000);
        
        return () => clearTimeout(timer);
    }, [navigation]);

    return (
        <LinearGradient colors={['#f43f5e', '#ec4899']} className="flex-1 justify-center items-center">
            <View className="items-center">
                <View className="w-24 h-24 bg-white rounded-full flex justify-center items-center">
                    <Text className="text-4xl text-red-500">Iv</Text>
                </View>
                <Text className="text-white font-bold text-lg mt-4">IVJOURNEY</Text>
                <Text className="text-white text-center mt-2 px-10">
                    organizing your visit... bridging{' '}knowledge and experience
                </Text>
            </View>
            <View className="absolute bottom-0" style={{ width, height: height * 0.3 }}>
                <Image source={require('../../assets/Graphics.png')} 
                    style={{ width: '100%', height: '100%', resizeMode: 'contain' }} />
            </View>
        </LinearGradient>
    );
}
