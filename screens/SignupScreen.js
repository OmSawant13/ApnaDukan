import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
} from "react-native";
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useState, useRef, useEffect } from 'react';

export default function SignupScreen({ navigation }) {
  const { signup } = useAuth();
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('customer'); // Default role
  const [isScrollEnabled, setIsScrollEnabled] = useState(false); // Locked by default
  const scrollViewRef = useRef(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        // Uniform scroll for any keyboard event
        scrollViewRef.current?.scrollTo({ y: 190, animated: true });
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleSignup = async () => {
    if (!name || !phone || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    setLoading(true);
    const res = await signup(name, phone, password, role);
    setLoading(false);
    // Navigation handled by AppNavigator
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={isScrollEnabled}
      >
        <View style={styles.container}>
          {/* Heading */}
          <Text style={styles.heading}>{t('join_fresh_club')}</Text>
          <Text style={styles.subHeading}>
            {t('signup_desc')}
          </Text>

          {/* Role Selection */}
          <Text style={styles.label}>{t('i_am_a')}</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[styles.roleButton, role === 'customer' && styles.roleButtonActive]}
              onPress={() => setRole('customer')}
            >
              <Text style={[styles.roleButtonText, role === 'customer' && styles.roleButtonTextActive]}>
                {t('customer')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleButton, role === 'shopkeeper' && styles.roleButtonActive]}
              onPress={() => setRole('shopkeeper')}
            >
              <Text style={[styles.roleButtonText, role === 'shopkeeper' && styles.roleButtonTextActive]}>
                {t('shopkeeper')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Full Name */}
          <Text style={styles.label}>{t('full_name')}</Text>
          <TextInput
            placeholder={t('name_placeholder')}
            placeholderTextColor="#9ca3af"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />

          {/* Phone */}
          <Text style={styles.label}>{t('phone_number')}</Text>
          <TextInput
            placeholder={t('phone_placeholder')}
            placeholderTextColor="#9ca3af"
            style={styles.input}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          {/* Password */}
          <Text style={styles.label}>{t('password')}</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder={t('password_placeholder')}
              placeholderTextColor="#9ca3af"
              style={styles.passwordInput}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.eyeIcon}>{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
            </TouchableOpacity>
          </View>

          {/* Terms */}
          <Text style={styles.terms}>
            {t('by_signing_up')}{" "}
            <Text style={styles.link}>{t('terms_service')}</Text> {t('and')}{" "}
            <Text style={styles.link}>{t('privacy_policy')}</Text>.
          </Text>

          {/* Button */}
          <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? t('creating_account') : t('create_account')}</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.line} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.line} />
          </View>

          {/* Footer */}
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footer}>
              {t('already_have_account')} <Text style={styles.link}>{t('login')}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9faf7",
    padding: 24,
    paddingBottom: 400, // Headroom for scroll lock
  },

  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginTop: 40,
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
  roleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 999,
    padding: 4,
    marginBottom: 20,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 999,
  },
  roleButtonActive: {
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  roleButtonTextActive: {
    color: '#111827',
    fontWeight: '600',
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

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1fae5",
    borderRadius: 999,
    paddingHorizontal: 18,
    marginBottom: 20,
    backgroundColor: "#fff",
  },

  passwordInput: {
    flex: 1,
    paddingVertical: 14,
  },

  eyeIcon: {
    fontSize: 18,
    paddingHorizontal: 5,
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
    marginBottom: 20,
  },

  buttonText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
    marginTop: 10,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },

  orText: {
    marginHorizontal: 12,
    color: "#9ca3af",
    fontSize: 14,
  },

  footer: {
    textAlign: "center",
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 40,
  },
});

