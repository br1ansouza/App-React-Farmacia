import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; // verificar se vou utilizar ainda
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { FontAwesome } from '@expo/vector-icons'; 

export default function ListMovements() {
    const [movements, setMovements] = useState([]);
    const [userProfile, setUserProfile] = useState('');
    const [statusMap, setStatusMap] = useState({}); // mapeia os status das movimentações
    const [activeTab, setActiveTab] = useState('ativas'); // controla a aba ativa (ativas/canceladas)
    const navigation = useNavigation();

    // função para buscar o perfil do usuário
    const fetchUserProfile = async () => {
        try {
            const profile = await AsyncStorage.getItem('@userProfile');
            setUserProfile(profile);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível carregar o perfil do usuário.');
        }
    };

    // função para buscar a lista de movimentações no backend
    const fetchMovements = async () => {
        try {
            const response = await axios.get('http://10.0.2.2:3000/movements');
            setMovements(response.data);

            // inicia o status de cada movimentação no statusMap
            const initialStatusMap = {};
            response.data.forEach(movement => {
                initialStatusMap[movement.id] = movement.status;
            });
            setStatusMap(initialStatusMap);
        } catch (error) {
            Alert.alert(':(', 'Não foi possível carregar a lista de movimentações.');
        }
    };

    // função para alterar o status e salvar no backend
    const updateMovementStatus = async (id, newStatus) => {
        try {
            // envia a requisição patch para o backend para atualizar o status
            await axios.patch(`http://10.0.2.2:3000/movements/${id}/status`, { status: newStatus });

            // atualiza o status localmente após salvar no backend (checar o erro de funcionamento)
            setStatusMap(prevStatusMap => ({
                ...prevStatusMap,
                [id]: newStatus,
            }));

            Alert.alert('Sucesso', 'Status atualizado com sucesso.');
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Não foi possível atualizar o status. Verifique a conexão ou o servidor.');
        }
    };

    // separar movimentações ativas e finalizadas/canceladas
    const activeMovements = movements.filter(movement => statusMap[movement.id] !== 'cancelada' && statusMap[movement.id] !== 'finalizada');
    const canceledMovements = movements.filter(movement => statusMap[movement.id] === 'cancelada' || statusMap[movement.id] === 'finalizada');

    // carregar a lista de movimentações e o perfil do usuário ao montar o componente
    useEffect(() => {
        fetchMovements();
        fetchUserProfile();
    }, []);

    // renderiza movimentação/item da lista
    const renderMovementItem = ({ item }) => {
        const selectedStatus = statusMap[item.id] || item.status;

        return (
            <View style={styles.card}>
                <View style={styles.cardContent}>
                    <Text style={styles.movementDetail}><Text style={styles.bold}>Origem:</Text> {item.origem?.nome || 'Desconhecido'}</Text>
                    <Text style={styles.movementDetail}><Text style={styles.bold}>Destino:</Text> {item.destino?.nome || 'Desconhecido'}</Text>
                    <Text style={styles.movementDetail}><Text style={styles.bold}>Produto:</Text> {item.produto?.nome || 'Desconhecido'}</Text>
                    <Text style={styles.movementDetail}><Text style={styles.bold}>Quantidade:</Text> {item.quantidade || 'N/A'}</Text>
                    <Text style={styles.movementDetail}><Text style={styles.bold}>Observações:</Text> {item.observacoes || 'Nenhuma'}</Text>

                    <Text style={styles.movementDetail}><Text style={styles.bold}>Status atual:</Text> {selectedStatus}</Text>
                    
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={selectedStatus}
                            onValueChange={(itemValue) => updateMovementStatus(item.id, itemValue)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Selecionar status" value={selectedStatus} />
                            <Picker.Item label="Movimentação iniciada" value="iniciada" />
                            <Picker.Item label="Movimentação finalizada" value="finalizada" />
                            <Picker.Item label="Movimentação cancelada" value="cancelada" />
                        </Picker>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>Movimentações</Text>

            {/* mostrar o botão "Adicionar movimentação" apenas para perfis que não sejam do tipo "motorista" */}
            {userProfile !== 'motorista' && (
                <TouchableOpacity
                    style={styles.newMovementButton}
                    onPress={() => navigation.navigate('RegisterMovement')}
                >
                    <Text style={styles.newMovementButtonText}>Adicionar movimentação</Text>
                </TouchableOpacity>
            )}

            {/* list movimentações - aba ativa */}
            <FlatList
                data={activeTab === 'ativas' ? activeMovements : canceledMovements}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderMovementItem}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <Text style={styles.noMovementsText}>
                        {activeTab === 'ativas' ? 'Nenhuma movimentação ativa encontrada.' : 'Nenhuma movimentação cancelada/finalizada.'}
                    </Text>
                }
            />

            {/* footer fixo com abas para alternar entre ativas/canceladas */}
            <View style={styles.footer}>
                <TouchableOpacity 
                    style={[styles.footerButton, activeTab === 'ativas' && styles.activeTab]} 
                    onPress={() => setActiveTab('ativas')}
                >
                    <FontAwesome name="list-alt" size={24} color={activeTab === 'ativas' ? '#6200EE' : '#fff'} />
                    <Text style={styles.footerText}>Ativas</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.footerButton, activeTab === 'canceladas' && styles.activeTab]} 
                    onPress={() => setActiveTab('canceladas')}
                >
                    <FontAwesome name="times-circle" size={24} color={activeTab === 'canceladas' ? '#6200EE' : '#fff'} />
                    <Text style={styles.footerText}>Canceladas</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginVertical: 20,
        paddingHorizontal: 20,
    },
    newMovementButton: {
        backgroundColor: '#6200EE',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginBottom: 20,
        alignSelf: 'center',
    },
    newMovementButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },
    list: {
        paddingBottom: 100, // espaço extra para evitar sobreposição do footer
        paddingHorizontal: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardContent: {
        flexDirection: 'column',
    },
    movementDetail: {
        fontSize: 16,
        color: '#333',
        marginBottom: 5,
    },
    bold: {
        fontWeight: 'bold',
        color: '#000',
    },
    noMovementsText: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
        marginTop: 20,
    },
    pickerContainer: {
        borderColor: '#6200EE',
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        marginTop: 10,
        width: '100%',
    },
    picker: {
        height: 45,
        color: '#333',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 20,
        marginBottom: 10,
        paddingHorizontal: 20,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#101010',
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#454545',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    footerButton: {
        alignItems: 'center',
    },
    footerText: {
        color: '#fff', 
        fontSize: 14,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#6200EE',
    },
});
