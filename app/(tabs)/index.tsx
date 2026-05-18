import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>⚡ SportMatch</Text>
      <Text style={styles.tagline}>Trouve ton partenaire de sport idéal</Text>
      
      <TouchableOpacity 
        style={styles.buttonPrimary}
        onPress={() => router.push('/login')}
      >
        <Text style={styles.buttonPrimaryText}>Créer mon profil</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.buttonSecondary}
        onPress={() => router.push('/login')}
      >
        <Text style={styles.buttonSecondaryText}>Trouve ton partenaire</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  tagline: {
    fontSize: 18,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 48,
  },
  buttonPrimary: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 30,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  buttonPrimaryText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonSecondary: {
    borderWidth: 2,
    borderColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  buttonSecondaryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});