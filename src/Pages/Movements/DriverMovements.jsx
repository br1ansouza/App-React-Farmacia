import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';  // usado para o icone de bicicleta
import MapView, { Marker } from 'react-native-maps';

// instância de axios com timeout
const axiosInstance = axios.create({
    baseURL: 'http://10.0.2.2:3000', 
    timeout: 10000, // timeout de 10 segundos
});

export default function DriverMovements() {
    const [movement, setMovement] = useState(null);
    const [imageUri, setImageUri] = useState(null);
    const route = useRoute();
    const navigation = useNavigation();
    const { movementId } = route.params;

    useEffect(() => {
        fetchMovement();
    }, []);

    const fetchMovement = async () => {
        try {
            const response = await axiosInstance.get(`/movements/${movementId}`);
            setMovement(response.data);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível carregar os dados da movimentação.');
        }
    };

    const openCamera = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (permissionResult.granted === false) {
            Alert.alert("Acesso negado", "Permissão para acessar a câmera foi negada.");
            return { cancelled: true }; // return cancelado caso a permissão seja negada
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,  // reduzir a qualidade da imagem para 50% (unica fomra que resolveu o problema de travamento)
        });

        return result;
    };

    const updateStatus = (newStatus) => {
        const currentDate = new Date();  // usa o objeto Date diretamente

        // atualiza o status e o histórico da movimentação
        setMovement((prevMovement) => ({
            ...prevMovement,
            status: newStatus,
            historico: [
                ...prevMovement.historico,
                { descricao: newStatus, data: currentDate }  // usa o objeto Date diretamente
            ],
        }));
    };

    // aqui atualiuza o status e adiciona ao histórico
    const handleSimulateUpload = async (url, motorista, newStatus) => {
        Alert.alert('Sucesso', 'Upload de imagem bem-sucedido. Status atualizado.');
        updateStatus(newStatus);  
    };

    const handleStartDelivery = async () => {
        try {
            // abrir a câmera e captura a imagem
            const result = await openCamera();

            // checa se a imagem foi capturada
            if (!result.cancelled) {
                setImageUri(result.uri); // armazena a URI da imagem capturada
                
                handleSimulateUpload(`/movements/${movementId}/start`, 'Motorista X', 'em transito');
            } else {
                Alert.alert('Erro', 'Nenhuma imagem capturada.');
            }
        } catch (error) {
            console.error('Erro ao iniciar a entrega:', error);
            Alert.alert('Erro', 'Erro ao iniciar a entrega.');
        }
    };

    const handleFinalizeDelivery = async () => {
        try {
            // abrir a câmera e captura a imagem
            const result = await openCamera();

            // checa se a imagem foi capturada
            if (!result.cancelled) {
                setImageUri(result.uri); 

                handleSimulateUpload(`/movements/${movementId}/end`, 'Motorista X', 'coleta finalizada');
            } else {
                Alert.alert('Erro', 'Nenhuma imagem capturada.');
            }
        } catch (error) {
            console.error('Erro ao finalizar a entrega:', error);
            Alert.alert('Erro', 'Erro ao finalizar a entrega.');
        }
    };

    const openMap = () => {
        // verifica se nome "MapScreen" corresponde ao nome usado nas rotas
        navigation.navigate('MapScreen', { 
            origem: movement.origem, 
            destino: movement.destino 
        });
    };

    const formatStatus = (status) => {
        if (status === 'Pedido Criado') {
            return 'Pedido Criado';
        } else if (status === 'Em Trânsito') {
            return 'Em Trânsito';
        } else if (status === 'Entrega Finalizada') {
            return 'Entrega Finalizada';
        }
        return status;
    };

    const formatHistoryEntry = (entry) => {
        const dateObject = new Date(entry.data);  // converte a data em um objeto Date
        return `${entry.descricao} - ${dateObject.toLocaleString()}`;  // formatar a data corretamente
    };

    const getProgressPercentage = () => {
        if (movement.status === 'Pedido Criado') {
            return 33; 
        } else if (movement.status === 'Em Trânsito') {
            return 66; 
        } else if (movement.status === 'Entrega Finalizada') {
            return 100; 
        }
        return 0; // padrão caso nenhum status seja compatível
    };

    const renderProgressBar = () => {
        const progressPercentage = getProgressPercentage();

        return (
            <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
            </View>
        );
    };

    const renderMovementDetails = () => {
        if (!movement) return null;

        return (
            <View style={styles.card}>
                <View style={styles.header}>
                    <Image source={{ uri: movement.produto.imagem }} style={styles.productImage} />
                    <View>
                        <Text style={styles.productName}>{movement.produto.nome}</Text>
                        <Text style={styles.productQuantity}>{movement.quantidade} Unidades</Text>
                    </View>
                    <Text style={styles.movementId}>#{movement.id}</Text>
                </View>

                <View style={styles.transportIconContainer}>
                    <FontAwesome name="bicycle" size={24} color="green" />
                    {renderProgressBar()} 
                </View>

                <Text style={styles.movementDetail}><Text style={styles.bold}>Origem:</Text> {movement.origem.nome}</Text>
                <Text style={styles.movementDetail}><Text style={styles.bold}>Destino:</Text> {movement.destino.nome}</Text>
                <Text style={styles.movementDetail}><Text style={styles.bold}>Status:</Text> {formatStatus(movement.status)}</Text>

                <Text style={styles.movementDetail}><Text style={styles.bold}>Histórico:</Text></Text>
                {movement.historico.map((entry, index) => (
                    <Text key={index} style={styles.historyEntry}>- {formatHistoryEntry(entry)}</Text>
                ))}

                <View style={styles.buttonContainer}>
                    {movement.status === 'Pedido Criado' && (
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={handleStartDelivery}
                        >
                            <Text style={styles.buttonText}>Iniciar entrega</Text>
                        </TouchableOpacity>
                    )}

                    {movement.status === 'Em Trânsito' && (
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={handleFinalizeDelivery}
                        >
                            <Text style={styles.buttonText}>Finalizar entrega</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={styles.mapButton}
                        onPress={openMap}
                    >
                        <Text style={styles.buttonText}>Mapa</Text>
                    </TouchableOpacity>
                </View>

                {imageUri && (
                    <>
                        <Image source={{ uri: imageUri }} style={styles.capturedImage} />
                    </>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {renderMovementDetails()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f0f0f0',
    },
    card: {
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
        backgroundColor: '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    productImage: {
        width: 60,
        height: 60,
        borderRadius: 10,
        marginRight: 15,
    },
    productName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    productQuantity: {
        fontSize: 16,
        color: '#666',
    },
    movementId: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        position: 'absolute',
        right: 0,
        top: 10,
    },
    transportIconContainer: {
        marginVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    movementDetail: {
        fontSize: 16,
        marginBottom: 10,
    },
    bold: {
        fontWeight: 'bold',
    },
    historyEntry: {
        fontSize: 14,
        color: '#555',
        marginBottom: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    actionButton: {
        backgroundColor: '#6200EE',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    mapButton: {
        backgroundColor: '#ffa500',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    capturedImage: {
        width: '100%',
        height: 200,
        marginTop: 10,
        borderRadius: 10,
    },
    buttonDisabled: {
        backgroundColor: '#B0B0B0',
    },
    progressBarContainer: {
        flex: 1,
        height: 10,
        backgroundColor: '#e0e0e0',
        borderRadius: 5,
        overflow: 'hidden',
        marginLeft: 10,
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#6200EE',
        borderRadius: 5,
    },
});
