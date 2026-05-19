import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../supabase';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Oups !', 'Remplis tous les champs.');
      return;
    }
    setLoading(true);
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) Alert.alert('Erreur', error.message);
      else {
        Alert.alert('Compte créé !', 'Tu peux maintenant créer ton profil.');
        router.push('/creer-profil');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) Alert.alert('Erreur', error.message);
      else router.push('/match');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>⚡ SportMatch</Text>
      <Text style={styles.titre}>{isSignUp ? 'Créer un compte' : 'Se connecter'}</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.bouton, loading && { opacity: 0.6 }]}
        onPress={handleAuth}
        disabled={loading}
      >
        <Text style={styles.boutonTexte}>
          {loading ? 'Chargement...' : isSignUp ? 'Créer mon compte' : 'Se connecter'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
        <Text style={styles.switch}>
          {isSignUp ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? S\'inscrire'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FF6B6B', alignItems: 'center', justifyContent: 'center', padding: 24 },
  logo: { fontSize: 36, fontWeight: 'bold', color: 'white', marginBottom: 8 },
  titre: { fontSize: 20, color: 'white', opacity: 0.9, marginBottom: 32 },
  input: {
    backgroundColor: 'white', width: '100%', padding: 16,
    borderRadius: 12, fontSize: 16, marginBottom: 12, color: '#333',
  },
  bouton: {
    backgroundColor: 'white', width: '100%', padding: 18,
    borderRadius: 30, alignItems: 'center', marginTop: 8, marginBottom: 16,
  },
  boutonTexte: { color: '#FF6B6B', fontSize: 16, fontWeight: 'bold' },
  switch: { color: 'white', opacity: 0.9, fontSize: 14, textDecorationLine: 'underline' },
});
