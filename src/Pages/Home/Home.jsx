import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Home = ({ navigation }) => {
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;

    const handleLogout = async () => {
        // animação de fade-out e slide para direita
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 500,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start(async () => {
            // reset nos dados armazenados no AsyncStorage
            await AsyncStorage.removeItem('@userName');
            await AsyncStorage.removeItem('@userProfile');

            // reset da navegação e redireciona para a tela de login
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        });
    };

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
            <Text style={styles.text}>Olá!</Text>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#121212',
    },
    text: {
        color: '#fff',
        fontSize: 18,
        marginBottom: 20,
    },
    logoutButton: {
        backgroundColor: '#6200EE', // roxo
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default Home;