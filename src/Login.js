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
    // Basic validation
    let newErrors = { email: '', password: '' };
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';

    if (newErrors.email || newErrors.password) {
      setErrors(newErrors);
      return;
    }

    try {
      // Replace with your API endpoint
      const response = await fetch('https://your-api-endpoint.com/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to login');
      }

      const data = await response.json();
      Alert.alert('Login Successful', `Welcome back, ${data.user.name}!`);

      // Navigate to Home screen on successful login
      
      
    } catch (error) {
      console.log(navigator);
      
      navigation.navigate('Home');
      Alert.alert('Login Failed', error.message);
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
     color:'#3B82F6',
     marginTop :10
   }
});
