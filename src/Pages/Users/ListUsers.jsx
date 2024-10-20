import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Switch, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

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

    // função para excluir o usuário
    const deleteUser = async (userId) => {
        try {
            await axios.delete(`http://10.0.2.2:3000/users/${userId}`);
            Alert.alert('Sucesso', 'Usuário excluído com sucesso.');
            fetchUsers();  // atualiza a lista de usuários após a exclusão
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível excluir o usuário.');
        }
    };

    // alerta de confirmação antes de excluir o usuário
    const confirmDelete = (userId, profile) => {
        Alert.alert(
            'Excluir Usuário',
            `Deseja realmente excluir o usuário do tipo ${profile}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Excluir', onPress: () => deleteUser(userId) },
            ],
            { cancelable: true }
        );
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
                    <View style={styles.actions}>
                        <Switch
                            value={item.status === 1} // verifica se o status é 1 (ativo)
                            onValueChange={() => toggleUserStatus(item.id)}  // alterna status
                            trackColor={{ false: '#767577', true: '#81b0ff' }}  // azul para ativo, cinza para inativo
                            thumbColor={item.status === 1 ? '#f4f3f4' : '#f4f3f4'}
                        />
                        {/* icone de lixeira para excluir, verifica se o perfil é do tipo motorista ou filial e aí exibe o botão de exclusão para esse tipo */}
                        {(item.profile === 'motorista' || item.profile === 'filial') && (
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => confirmDelete(item.id, item.profile)}
                            >
                                <MaterialIcons name="delete" size={24} color="#fff" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    // function para renderizar a lista de usuários separada por tipo
    const renderSection = (title, data) => {
        return (
            <View>
                <Text style={styles.sectionTitle}>{title}</Text>
                {data.length > 0 ? (
                    <FlatList
                        data={data}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderUserItem}
                    />
                ) : (
                    <Text style={styles.emptyText}>Nenhum usuário {title} encontrado.</Text>
                )}
            </View>
        );
    };

    // separar usuários por tipo
    const admins = users.filter(user => user.profile === 'admin');
    const drivers = users.filter(user => user.profile === 'motorista');
    const branches = users.filter(user => user.profile === 'filial');

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Usuários</Text>
                <TouchableOpacity
                    style={styles.newUserButton}
                    onPress={() => navigation.navigate('RegisterUser')} // verifique se o nome está igual
                >
                    <Text style={styles.newUserButtonText}>Novo usuário</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                ListHeaderComponent={
                    <>
                        {renderSection('Admins', admins)}
                        {renderSection('Motoristas', drivers)}
                        {renderSection('Filiais', branches)}
                    </>
                }
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
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    userAddress: {
        fontSize: 16,
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
        borderColor: 'green',  // borda verde usuários ativos
    },
    inactive: {
        backgroundColor: '#d98580',  // fundo vermelho usuários inativos
        borderColor: 'red',
    },
    deleteButton: {
        marginLeft: 10,
        backgroundColor: '#E53935',
        padding: 10,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 10,
        marginBottom: 10,
    },
    emptyText: {
        fontSize: 16,
        color: '#D3D3D3',
        textAlign: 'center',
        marginBottom: 10,
    },
});
