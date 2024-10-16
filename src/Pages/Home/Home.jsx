import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Home = ({ navigation }) => {
    const [userName, setUserName] = useState('');
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;

    // recuperar o nome do usuário salvo no AsyncStorage para poder exibir na tela
    useEffect(() => {
        const fetchUserName = async () => {
            const name = await AsyncStorage.getItem('@userName');
            if (name) {
                setUserName(name);
            }
        };
        fetchUserName();
    }, []);

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
           {/* cabeçalho com saudação e botão logout */}
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    <Image
                        source={{ uri: 'https://cdn-icons-png.flaticon.com/128/9566/9566077.png' }}
                        style={styles.profileImage}
                    />
                    <Text style={styles.greeting}>Olá, {userName}</Text>
                </View>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.buttonText}>Logout</Text>
                </TouchableOpacity>
            </View>

            {/* cards de estoque/usuários */}
            <View style={styles.card}>
                <View style={styles.cardContent}>
                    <Image
                        source={{ uri: 'https://cdn-icons-png.flaticon.com/128/5166/5166961.png' }}
                        style={styles.icon}
                    />
                    <View>
                        <Text style={styles.cardText}>Estoque</Text>
                        <Text style={styles.cardDescription}>Gerencie o inventário da loja</Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.manageButton}
                    onPress={() => navigation.navigate('ListProducts')}
                >
                    <Text style={styles.buttonText}>Gerenciar</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.card}>
                <View style={styles.cardContent}>
                    <Image
                        source={{ uri: 'https://cdn-icons-png.flaticon.com/128/5065/5065003.png' }}
                        style={styles.icon}
                    />
                    <View>
                        <Text style={styles.cardText}>Usuários</Text>
                        <Text style={styles.cardDescription}>Acesse a lista de usuários</Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.manageButton}
                    onPress={() => navigation.navigate('ListUsers')}
                >
                    <Text style={styles.buttonText}>Gerenciar</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',  
        paddingHorizontal: 20,
        paddingVertical: 30,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 40,
        marginTop: 20,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    greeting: {
        fontSize: 18,
        color: '#fff',
    },
    logoutButton: {
        backgroundColor: '#6200EE',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#fff', // sombra "branca"
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4, 
        shadowRadius: 6,  
        elevation: 10,  
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        width: 40,
        height: 40,
        marginRight: 10,
    },
    cardText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    cardDescription: {
        fontSize: 14,
        color: '#666',
    },
    manageButton: {
        backgroundColor: '#6200EE',
        paddingVertical: 10,
        paddingHorizontal: 19,
        borderRadius: 8,
    },
});

export default Home;
