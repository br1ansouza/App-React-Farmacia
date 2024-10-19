import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

export default function ListMovements() {
    const [movements, setMovements] = useState([]);
    const navigation = useNavigation();

    // function buscar a lista de movimentações no backend
    const fetchMovements = async () => {                                            // por algum motvio não está conseguindo acessar o backend, ver isso outra hora
        try {
            const response = await axios.get('http://10.0.2.2:3000/movements');
            console.log('Dados recebidos:', response.data);
            setMovements(response.data);
        } catch (error) {
            Alert.alert(':(', 'Não foi possível carregar a lista de movimentações.');
        }
    };

    // carregar a lista de movimentações ao montar o componente
    useEffect(() => {
        fetchMovements();
    }, []);

    // renderiza cada movimentação/item da lista
    const renderMovementItem = ({ item }) => {
        return (
            <View style={styles.card}>
                <View style={styles.cardContent}>
                    <Text style={styles.movementDetail}><Text style={styles.bold}>Origem:</Text> {item.origem?.nome || 'Desconhecido'}</Text>
                    <Text style={styles.movementDetail}><Text style={styles.bold}>Destino:</Text> {item.destino?.nome || 'Desconhecido'}</Text>
                    <Text style={styles.movementDetail}><Text style={styles.bold}>Produto:</Text> {item.produto?.nome || 'Desconhecido'}</Text>
                    <Text style={styles.movementDetail}><Text style={styles.bold}>Status:</Text> {item.status || 'Desconhecido'}</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>Movimentações</Text>
            <TouchableOpacity
                style={styles.newMovementButton}
                onPress={() => navigation.navigate('RegisterMovement')}
            >
                <Text style={styles.newMovementButtonText}>Adicionar movimentação</Text>
            </TouchableOpacity>

            {movements.length === 0 ? (
                <Text style={styles.noMovementsText}>Nenhuma movimentação encontrada.</Text>
            ) : (
                <FlatList
                    data={movements}
                    keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
                    renderItem={renderMovementItem}
                    contentContainerStyle={styles.list}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        padding: 20,
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20,
    },
    newMovementButton: {
        backgroundColor: '#6200EE',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginBottom: 20,
    },
    newMovementButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },
    list: {
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        elevation: 10,
    },
    cardContent: {
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    movementDetail: {
        fontSize: 16,
        color: '#fff',
        marginBottom: 5,
    },
    bold: {
        fontWeight: 'bold',
        color: '#fff',
    },
    noMovementsText: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
        marginTop: 20,
    },
});
