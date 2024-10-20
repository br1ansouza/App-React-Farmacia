import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

export default function RegisterMovement({ navigation }) {
    const [branches, setBranches] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedOriginBranch, setSelectedOriginBranch] = useState('');
    const [selectedDestinationBranch, setSelectedDestinationBranch] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantityDesired, setQuantityDesired] = useState('');
    const [observations, setObservations] = useState('');
    const [availableQuantity, setAvailableQuantity] = useState(null);

    // buscar opções de filiais e produtos quando a tela carregar
    useEffect(() => {
        fetchBranches();
        fetchProducts();
    }, []);

    // buscar filiais
    const fetchBranches = async () => {
        try {
            const response = await axios.get('http://10.0.2.2:3000/branches/options');
            setBranches(response.data);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível carregar as filiais.');
        }
    };

    // buscar produtos
    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://10.0.2.2:3000/products/options');
            setProducts(response.data);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível carregar os produtos.');
        }
    };

    // buscar quantidade disponível de produto na filial
    const fetchAvailableQuantity = async (branchId, productId) => {
        try {
            const response = await axios.get(`http://10.0.2.2:3000/products/${productId}/branches/${branchId}/quantity`);
            setAvailableQuantity(response.data.quantity);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                Alert.alert('Indisponível', 'Este produto não está disponível na filial selecionada.');
            } else {
                Alert.alert('Erro', 'Não foi possível carregar a quantidade disponível.');
            }
            setAvailableQuantity(null);
        }
    };

    // quando filial de origem ou produto forem selecionados, buscar a quantidade disponível
    useEffect(() => {
        if (selectedOriginBranch && selectedProduct) {
            fetchAvailableQuantity(selectedOriginBranch, selectedProduct);
        }
    }, [selectedOriginBranch, selectedProduct]);

    // função de validação e envio
    const validateAndSubmit = async () => {
        if (selectedOriginBranch === selectedDestinationBranch) {
            Alert.alert('Erro', 'A filial de origem e destino devem ser diferentes.');
            return;
        }

        // validação da quantidade desejada
        if (parseInt(quantityDesired) > availableQuantity) {
            Alert.alert('Erro', 'A quantidade desejada não pode ser maior do que a disponível.');
            return;
        }

        // prepara os dados para enviar
        const movementData = {
            originBranchId: selectedOriginBranch,
            destinationBranchId: selectedDestinationBranch,
            productId: selectedProduct,
            quantity: parseInt(quantityDesired),
            observations: observations,
        };

        // requisição para o backend
        try {
            // POST
            await axios.post('http://10.0.2.2:3000/movements', movementData);
            Alert.alert('Sucesso', 'Movimentação cadastrada com sucesso.');
            navigation.navigate('ListMovements', { refresh: true });
        } catch (error) {
            console.error('Erro no cadastro de movimentação:', error);
            Alert.alert('Erro', 'Não foi possível cadastrar a movimentação.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Filial origem</Text>
            <Picker
                selectedValue={selectedOriginBranch}
                onValueChange={(itemValue) => setSelectedOriginBranch(itemValue)}
                style={styles.picker}
            >
                <Picker.Item label="Selecione a filial de origem" value="" />
                {branches.map((branch) => (
                    <Picker.Item key={branch.id} label={branch.name} value={branch.id} />
                ))}
            </Picker>

            <Text style={styles.label}>Filial destino</Text>
            <Picker
                selectedValue={selectedDestinationBranch}
                onValueChange={(itemValue) => setSelectedDestinationBranch(itemValue)}
                style={styles.picker}
            >
                <Picker.Item label="Selecione a filial de destino" value="" />
                {branches.map((branch) => (
                    <Picker.Item key={branch.id} label={branch.name} value={branch.id} />
                ))}
            </Picker>

            <Text style={styles.label}>Produto desejado</Text>
            <Picker
                selectedValue={selectedProduct}
                onValueChange={(itemValue) => setSelectedProduct(itemValue)}
                style={styles.picker}
            >
                <Picker.Item label="Selecione o produto" value="" />
                {products.map((product) => (
                    <Picker.Item key={product.id} label={product.name} value={product.id} />
                ))}
            </Picker>

            {availableQuantity !== null ? (
                <Text style={styles.label}>Quantidade disponível: {availableQuantity}</Text>
            ) : (
                <Text style={styles.label}>Produto indisponível na filial</Text>
            )}

            <Text style={styles.label}>Quantidade desejada</Text>
            <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={quantityDesired}
                onChangeText={setQuantityDesired}
                placeholder="Digite a quantidade desejada"
            />

            <Text style={styles.label}>Observações</Text>
            <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={4}
                value={observations}
                onChangeText={setObservations}
                placeholder="Digite observações (opcional)"
            />

            <View style={styles.buttonContainer}>
                <Text style={styles.buttonText} onPress={validateAndSubmit}>Cadastrar</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F5F5F5',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333', 
        marginVertical: 8,
    },
    picker: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: '#fff',
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
        backgroundColor: '#fff',
        fontSize: 16,
        color: '#333',
    },
    textArea: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#fff',
        fontSize: 16,
        color: '#333',
        textAlignVertical: 'top',
        marginBottom: 20,
    },
    buttonContainer: {
        backgroundColor: '#6200EE',
        borderRadius: 8,
        paddingVertical: 15,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    }
});
