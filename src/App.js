// App.js
import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import axios from 'axios';

const Apps = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    const handleSubmit = async () => {
        try {
            const response = await axios.post('http://192.168.1.5:5000/api/items', { name, email });
            // console.log("Full Axios response:", response);
            
            console.log("Server response:", response.data);
            Alert.alert('Success', `Item saved: ${response.data.name}`);
        } catch (error) {
            console.error("Submission error:", error);
            // Check if the error response exists
            const errorMessage = error.response ? error.response.data : error.message;
            Alert.alert('Error', `Failed to save item: ${errorMessage}`);
        }
    };
    
    

    return (
        <View>
            <TextInput placeholder="Name" value={name} onChangeText={setName} />
            <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
            <Button title="Submit" onPress={handleSubmit} />
        </View>
    );
};

export default Apps;
