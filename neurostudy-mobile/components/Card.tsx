import React, { ReactNode } from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

export default function Card({ children, onPress, style }: CardProps) {
  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      onPress={onPress}
      style={[styles.card, style]}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {children}
    </Component>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
});
