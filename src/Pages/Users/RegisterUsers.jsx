import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; 

export default function RegisterUser() {
    const [profile, setProfile] = useState('motorista');
    const [name, setName] = useState('');
    const [document, setDocument] = useState('');
    const [full_address, setFullAddress] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigation = useNavigation();

    const handleSubmit = async () => {
        if (!name || !document || !full_address || !email || !password || !confirmPassword) {
            Alert.alert('Erro', 'Todos os campos são obrigatórios.');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Erro', 'As senhas não coincidem.');
            return;
        }

        const user = {
            profile,
            name,
            document,
            full_address,
            email,
            password
        };

        try {
            const response = await axios.post('http://10.0.2.2:3000/register', user);
            if (response.status === 201) {
                Alert.alert(':)', 'Usuário cadastrado com sucesso.');
                navigation.goBack(); // retorna para a tela anterior após o cadastro
            }
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível cadastrar o usuário.');
        }
    };

    return (
        <View style={styles.container}>
            {/* picker para escolher o tipo de usuário (motorista/filial) */}
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={profile}
                    style={styles.picker}
                    onValueChange={(itemValue) => setProfile(itemValue)}
                >
                    <Picker.Item label="Motorista 🧑‍✈️" value="motorista" />
                    <Picker.Item label="Filial 🏭" value="filial" />
                </Picker>
            </View>


            <TextInput
                style={styles.input}
                placeholder="Nome completo"
                placeholderTextColor="#888"
                value={name}
                onChangeText={setName}
            />

            <TextInput
                style={styles.input}
                placeholder={profile === 'motorista' ? 'CPF' : 'CNPJ'}
                placeholderTextColor="#888"
                value={document}
                onChangeText={setDocument}
                keyboardType="numeric"
            />

            <TextInput
                style={styles.input}
                placeholder="Endereço completo"
                placeholderTextColor="#888"
                value={full_address}
                onChangeText={setFullAddress}
            />

            <View style={styles.sectionHeader}>
                <Icon name="key" size={20} color="#fff" style={styles.icon} />
                <Text style={styles.sectionTitle}>Dados de login</Text>
            </View>

            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#888"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
            />

            <TextInput
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor="#888"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TextInput
                style={styles.input}
                placeholder="Confirme a senha"
                placeholderTextColor="#888"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Cadastrar</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        padding: 20,
    },
    pickerContainer: {
        backgroundColor: '#1E1E1E',
        borderRadius: 8,
        marginBottom: 20,
    },
    picker: {
        color: '#fff',
    },
    input: {
        backgroundColor: '#1E1E1E',
        borderRadius: 8,
        padding: 10,
        color: '#fff',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#333',
    },
    sectionHeader: {
        flexDirection: 'row', // alinhar o ícone e o texto horizontalmente
        alignItems: 'center',
        marginVertical: 10,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8, // espaço entre ícone e o texto
    },
    icon: {
        marginRight: 10, // espaço entre ícone e o texto
    },
    button: {
        backgroundColor: '#6200EE',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
