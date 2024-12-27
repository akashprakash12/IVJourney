import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login({ navigation }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: '', password: '' });

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    if (value) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async () => {
    let newErrors = { email: '', password: '' };
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';

    if (newErrors.email || newErrors.password) {
      setErrors(newErrors);
      return;
    }

    try {
      async function getDeviceIP() {
        try {
            const response = await axios.get('http://api.ipify.org?format=json');
            return response.data.ip; // Returns the public IP of your device
        } catch (error) {
            console.error('Error fetching IP:', error);
        }
    }
    // const ip = await getDeviceIP();
    const ip='192.168.1.5'
     
      
      const response = await axios.post(`http://${ip}:5000/api/Login`, formData);
    

     

      const { token, message } = response.data;
      Alert.alert('Login Successful', message);

      await AsyncStorage.setItem('authToken', token);
      navigation.navigate('Home');
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      
      const errorMessage = error.response?.data?.error || 'Failed to login';
      Alert.alert('Login Failed', errorMessage);
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <View style={styles.form}>
        <TextInput
          style={[styles.input, errors.email ? styles.errorInput : null]}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={formData.email}
          onChangeText={(value) => handleChange('email', value)}
        />
        {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

        <TextInput
          style={[styles.input, errors.password ? styles.errorInput : null]}
          placeholder="Password"
          secureTextEntry
          value={formData.password}
          onChangeText={(value) => handleChange('password', value)}
        />
        {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

        <Button title="Submit" onPress={handleSubmit} color="#4F83CC" />
        
        <TouchableOpacity>
          <Text style={styles.link}>Forgot Password?</Text>
        </TouchableOpacity>
          {/* Registration Link */}
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>Don't have an account? Register here</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F0F4FF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  form: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  input: {
    height: 48,
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 16,
    marginBottom: 16,
   },
   errorInput:{
     borderColor:'#EF4444'
   },
   errorText:{
     color:'#EF4444',
     fontSize:12
   },
   link:{
    color: '#4F83CC',
    textAlign: 'center',
    marginTop: 15,
    textDecorationLine: 'underline',
   }
});
