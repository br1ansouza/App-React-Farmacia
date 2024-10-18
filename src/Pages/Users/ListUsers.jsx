import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Switch, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

export default function ListUsers() {
    const [users, setUsers] = useState([]);
    const navigation = useNavigation();

    // função de buscar a lista de usuários no backend
    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://10.0.2.2:3000/users');
            setUsers(response.data);
        } catch (error) {
            Alert.alert(':(', 'Não foi possível carregar a lista de usuários.');
        }
    };

    // carregar a lista de users ao montar o componente
    useEffect(() => {
        fetchUsers();
    }, []);

    // função para alternar o status do user
    const toggleUserStatus = async (userId) => {
        try {
            await axios.patch(`http://10.0.2.2:3000/users/${userId}/toggle-status`);
            fetchUsers();  // atualiza a lista de usuários após a mudança de status
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível atualizar o status do usuário.');
        }
    };

    // renderiza cada item (usuário) da lista
    const renderUserItem = ({ item }) => {
        return (
            <View style={[styles.card, item.status ? styles.active : styles.inactive]}>
                <View style={styles.cardContent}>
                    <View style={styles.info}>
                        <Text style={styles.userName}>{item.name}</Text>
                        <Text style={styles.userAddress}>{item.full_address}</Text>
                        <Text style={styles.userType}>Tipo: {item.profile}</Text>
                    </View>
                    <Switch
                        value={item.status === 1} // verifica se o status é 1 (ativo)
                        onValueChange={() => toggleUserStatus(item.id)}  // alterna status
                        trackColor={{ false: '#767577', true: '#81b0ff' }}  // azul para ativo, cinza para inativo
                        thumbColor={item.status === 1 ? '#f4f3f4' : '#f4f3f4'}
                    />
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Usuários</Text>
                <TouchableOpacity
                    style={styles.newUserButton}
                    onPress={() => navigation.navigate('RegisterUser')} // Verifique se o nome está igual
                >
                    <Text style={styles.newUserButtonText}>Novo usuário</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={users}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderUserItem}
                contentContainerStyle={styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    newUserButton: {
        backgroundColor: '#6200EE',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    newUserButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    list: {
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    info: {
        flexDirection: 'column',
        justifyContent: 'center',
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    userAddress: {
        fontSize: 14,
        color: '#D3D3D3',
        marginBottom: 5,
    },
    userType: {
        fontSize: 16,
        color: '#fff',
        marginBottom: 5,
    },
    active: {
        backgroundColor: '#14510a',
        borderColor: 'green',  // borda verde para usuários ativos
    },
    inactive: {
        backgroundColor: '#d98580',  // fundo vermelho para usuários inativos
        borderColor: 'red',
    },
});
