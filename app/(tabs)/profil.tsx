import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../supabase';

export default function MonProfilScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) setEmail(data.user.email || '');
  };

  const seDeconnecter = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarTexte}>{email ? email[0].toUpperCase() : '?'}</Text>
      </View>
      <Text style={styles.email}>{email}</Text>
      <Text style={styles.sousTitre}>Connectée ✓</Text>

      <TouchableOpacity style={styles.boutonDeconnexion} onPress={seDeconnecter}>
        <Text style={styles.boutonTexte}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8', alignItems: 'center', justifyContent: 'center', padding: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FF6B6B', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  avatarTexte: { fontSize: 32, fontWeight: 'bold', color: 'white' },
  email: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  sousTitre: { fontSize: 14, color: '#4A7C59', marginBottom: 48 },
  boutonDeconnexion: { borderWidth: 2, borderColor: '#FF6B6B', paddingVertical: 16, paddingHorizontal: 48, borderRadius: 30 },
  boutonTexte: { color: '#FF6B6B', fontSize: 16, fontWeight: 'bold' },
});