import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function SignupScreen() {
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
        placeholder="Kinjal Gawali"
        placeholderTextColor="#9ca3af"
        style={styles.input}
      />

      {/* Email */}
      <Text style={styles.label}>Email Address</Text>
      <TextInput
        placeholder="kinjal@example.com"
        placeholderTextColor="#9ca3af"
        style={styles.input}
      />

      {/* Password */}
      <Text style={styles.label}>Password</Text>
      <View style={styles.passwordBox}>
        <TextInput
          placeholder="••••••••"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          style={styles.passwordInput}
        />
        <Text style={styles.eye}>👁</Text>
      </View>

      {/* Terms */}
      <Text style={styles.terms}>
        By signing up, you agree to our{" "}
        <Text style={styles.link}>Terms of Service</Text> and{" "}
        <Text style={styles.link}>Privacy Policy</Text>.
      </Text>

      {/* Button */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.dividerRow}>
        <View style={styles.line} />
        <Text style={styles.or}>or</Text>
        <View style={styles.line} />
      </View>

      

      {/* Footer */}
      <Text style={styles.footer}>
        Already have an account? <Text style={styles.link}>Log In</Text>
      </Text>
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

  passwordBox: {
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

  eye: {
    fontSize: 16,
    color: "#6b7280",
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

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },

  or: {
    marginHorizontal: 12,
    color: "#9ca3af",
    fontSize: 14,
  },

  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 30,
  },

  socialBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#d1fae5",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },

  footer: {
    textAlign: "center",
    fontSize: 14,
    color: "#6b7280",
  },
});
    
