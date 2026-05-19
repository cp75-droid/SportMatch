import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../supabase';

type Profil = {
  prenom: string;
  ville: string;
  sport: string;
  niveau: string;
  email: string;
};

export default function MonProfilScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [profil, setProfil] = useState<Profil | null>(null);

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      setEmail(data.user.email || '');
      chargerProfil(data.user.email || '');
    }
  };

  const chargerProfil = async (email: string) => {
    const { data } = await supabase
      .from('profils')
      .select('*')
      .eq('email', email)
      .single();
    if (data) setProfil(data);
  };

  const seDeconnecter = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarTexte}>{profil ? profil.prenom[0].toUpperCase() : '?'}</Text>
      </View>

      <Text style={styles.prenom}>{profil ? profil.prenom : '...'}</Text>
      <Text style={styles.email}>{email}</Text>

      <View style={styles.infos}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>📍 Ville</Text>
          <Text style={styles.infoValeur}>{profil?.ville || '—'}</Text>
        </View>
        <View style={styles.separateur} />
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>🏅 Sport</Text>
          <Text style={styles.infoValeur}>{profil?.sport || '—'}</Text>
        </View>
        <View style={styles.separateur} />
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>⭐ Niveau</Text>
          <Text style={styles.infoValeur}>{profil?.niveau || '—'}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.boutonDeconnexion} onPress={seDeconnecter}>
        <Text style={styles.boutonTexte}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8', alignItems: 'center', paddingTop: 64, padding: 24 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#FF6B6B', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  avatarTexte: { fontSize: 40, fontWeight: 'bold', color: 'white' },
  prenom: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  email: { fontSize: 14, color: '#888', marginBottom: 32 },
  infos: { backgroundColor: 'white', borderRadius: 16, width: '100%', padding: 8, marginBottom: 32, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  infoItem: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontSize: 14, color: '#888' },
  infoValeur: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  separateur: { height: 0.5, backgroundColor: '#eee', marginHorizontal: 16 },
  boutonDeconnexion: { borderWidth: 2, borderColor: '#FF6B6B', paddingVertical: 16, paddingHorizontal: 48, borderRadius: 30 },
  boutonTexte: { color: '#FF6B6B', fontSize: 16, fontWeight: 'bold' },
});