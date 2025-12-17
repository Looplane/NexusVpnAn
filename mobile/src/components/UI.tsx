import React from 'react';
import { TouchableOpacity, Text, TextInput, View, ActivityIndicator, StyleSheet } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  isLoading?: boolean;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ title, onPress, variant = 'primary', isLoading, disabled }) => {
  const getBgColor = () => {
    if (variant === 'primary') return '#0ea5e9'; // brand-500
    if (variant === 'danger') return '#ef444440'; // red-500/25
    if (variant === 'outline') return 'transparent';
    return '#334155'; // slate-700
  };

  const getTextColor = () => {
    if (variant === 'danger') return '#ef4444';
    if (variant === 'outline') return '#cbd5e1';
    return '#ffffff';
  };

  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={isLoading || disabled}
      style={[
        styles.btn, 
        { 
          backgroundColor: getBgColor(), 
          borderWidth: variant === 'outline' ? 1 : 0, 
          borderColor: '#475569',
          opacity: (isLoading || disabled) ? 0.5 : 1
        }
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.btnText, { color: getTextColor() }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
}

export const Input: React.FC<InputProps> = ({ label, value, onChangeText, placeholder, secureTextEntry }) => {
  return (
    <View style={styles.inputContainer}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#64748b"
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  btn: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: 8,
  },
  btnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    color: '#94a3b8', // slate-400
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#0f172a', // slate-900
    borderWidth: 1,
    borderColor: '#334155', // slate-700
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 16,
  },
});