import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert
} from "react-native";
import { useAuth } from '../context/AuthContext';

export default function SignupScreen({ navigation }) {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !phone || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    setLoading(true);
    const res = await signup(name, phone, password);
    setLoading(false);
    // Navigation handled by AppNavigator
  };

  return (
    <View style={styles.container}>
      {/* Heading */}
      <Text style={styles.heading}>Join the Fresh Club</Text>
      <Text style={styles.subHeading}>
        Get fresh groceries delivered to your door in minutes.
      </Text>

      {/* Full Name */}
      <Text style={styles.label}>Full Name</Text>
      <TextInput
        placeholder="Enter your name"
        placeholderTextColor="#9ca3af"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      {/* Phone */}
      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        placeholder="Enter your phone"
        placeholderTextColor="#9ca3af"
        style={styles.input}
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      {/* Password */}
      <Text style={styles.label}>Password</Text>
      <TextInput
        placeholder="Create a password"
        placeholderTextColor="#9ca3af"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Terms */}
      <Text style={styles.terms}>
        By signing up, you agree to our{" "}
        <Text style={styles.link}>Terms of Service</Text> and{" "}
        <Text style={styles.link}>Privacy Policy</Text>.
      </Text>

      {/* Button */}
      <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Creating Account...' : 'Create Account'}</Text>
      </TouchableOpacity>

      {/* Footer */}
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.footer}>
          Already have an account? <Text style={styles.link}>Log In</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );

}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9faf7",
    padding: 24,
    // marginTop: 60,

  },

  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginTop: 80,
  },

  subHeading: {
    fontSize: 17,
    color: "#6b7280",
    marginBottom: 30,
    marginTop: 10,
  },

  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
    color: "#111827",
  },

  input: {
    borderWidth: 1,
    borderColor: "#d1fae5",
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 20,
    backgroundColor: "#fff",
  },

  terms: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 25,
  },

  link: {
    color: "#22c55e",
    fontWeight: "500",
  },

  button: {
    backgroundColor: "#6ee56b",
    paddingVertical: 16,
    borderRadius: 999,
    marginBottom: 30,
  },

  buttonText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },

  footer: {
    textAlign: "center",
    fontSize: 14,
    color: "#6b7280",
  },
});

