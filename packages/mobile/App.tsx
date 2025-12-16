import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📚 Kinna</Text>
      <Text style={styles.subtitle}>Social Media for Book Readers</Text>
      <Text style={styles.info}>Mobile app coming soon...</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0ea5e9',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 20,
    color: '#e0f2fe',
    marginBottom: 40,
  },
  info: {
    fontSize: 16,
    color: '#bae6fd',
  },
});
