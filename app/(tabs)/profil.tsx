import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../supabase';

const SPORTS = ['🎾 Padel', '🏃 Running', '🚴 Vélo', '🏊 Natation', '⚽ Foot', '🏀 Basket'];
const NIVEAUX = ['Débutant', 'Intermédiaire', 'Avancé'];

export default function MonProfilScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [prenom, setPrenom] = useState('');
  const [ville, setVille] = useState('');
  const [sport, setSport] = useState('');
  const [niveau, setNiveau] = useState('');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

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
    const { data } = await supabase.from('profils').select('*').eq('email', email).single();
    if (data) {
      setPrenom(data.prenom);
      setVille(data.ville);
      setSport(data.sport);
      setNiveau(data.niveau);
    }
  };

  const sauvegarder = async () => {
    setLoading(true);
    const { error } = await supabase.from('profils').update({ prenom, ville, sport, niveau }).eq('email', email);
    setLoading(false);
    if (error) Alert.alert('Erreur', error.message);
    else {
      setEditing(false);
      Alert.alert('✓ Profil mis à jour !');
    }
  };

  const seDeconnecter = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (editing) {
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.titreEdit}>Modifier mon profil</Text>

        <Text style={styles.label}>Prénom</Text>
        <TextInput style={styles.input} value={prenom} onChangeText={setPrenom} />

        <Text style={styles.label}>Ville</Text>
        <TextInput style={styles.input} value={ville} onChangeText={setVille} />

        <Text style={styles.label}>Sport</Text>
        <View style={styles.grille}>
          {SPORTS.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.chip, sport === s && styles.chipActif]}
              onPress={() => setSport(s)}
            >
              <Text style={[styles.chipTexte, sport === s && styles.chipTexteActif]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Niveau</Text>
        <View style={styles.grille}>
          {NIVEAUX.map((n) => (
            <TouchableOpacity
              key={n}
              style={[styles.chip, niveau === n && styles.chipActif]}
              onPress={() => setNiveau(n)}
            >
              <Text style={[styles.chipTexte, niveau === n && styles.chipTexteActif]}>{n}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[styles.boutonSave, loading && { opacity: 0.6 }]} onPress={sauvegarder} disabled={loading}>
          <Text style={styles.boutonSaveTexte}>{loading ? 'Sauvegarde...' : 'Sauvegarder ✓'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.boutonAnnuler} onPress={() => setEditing(false)}>
          <Text style={styles.boutonAnnulerTexte}>Annuler</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarTexte}>{prenom ? prenom[0].toUpperCase() : '?'}</Text>
      </View>

      <Text style={styles.prenom}>{prenom || '...'}</Text>
      <Text style={styles.email}>{email}</Text>

      <View style={styles.infos}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>📍 Ville</Text>
          <Text style={styles.infoValeur}>{ville || '—'}</Text>
        </View>
        <View style={styles.separateur} />
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>🏅 Sport</Text>
          <Text style={styles.infoValeur}>{sport || '—'}</Text>
        </View>
        <View style={styles.separateur} />
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>⭐ Niveau</Text>
          <Text style={styles.infoValeur}>{niveau || '—'}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.boutonEdit} onPress={() => setEditing(true)}>
        <Text style={styles.boutonEditTexte}>Modifier mon profil ✏️</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.boutonDeconnexion} onPress={seDeconnecter}>
        <Text style={styles.boutonTexte}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8', padding: 24, paddingTop: 64 },
  titreEdit: { fontSize: 24, fontWeight: 'bold', color: '#FF6B6B', marginBottom: 24, marginTop: 24 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#FF6B6B', alignItems: 'center', justifyContent: 'center', marginBottom: 16, alignSelf: 'center' },
  avatarTexte: { fontSize: 40, fontWeight: 'bold', color: 'white' },
  prenom: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 4, textAlign: 'center' },
  email: { fontSize: 14, color: '#888', marginBottom: 32, textAlign: 'center' },
  infos: { backgroundColor: 'white', borderRadius: 16, width: '100%', padding: 8, marginBottom: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  infoItem: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontSize: 14, color: '#888' },
  infoValeur: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  separateur: { height: 0.5, backgroundColor: '#eee', marginHorizontal: 16 },
  boutonEdit: { backgroundColor: '#FF6B6B', padding: 16, borderRadius: 30, alignItems: 'center', marginBottom: 12 },
  boutonEditTexte: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  boutonDeconnexion: { borderWidth: 2, borderColor: '#FF6B6B', paddingVertical: 16, borderRadius: 30, alignItems: 'center' },
  boutonTexte: { color: '#FF6B6B', fontSize: 16, fontWeight: 'bold' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8, marginTop: 16 },
  input: { borderWidth: 1.5, borderColor: '#eee', borderRadius: 12, padding: 14, fontSize: 16, color: '#333', backgroundColor: 'white' },
  grille: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1.5, borderColor: '#eee', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16, backgroundColor: 'white' },
  chipActif: { backgroundColor: '#FF6B6B', borderColor: '#FF6B6B' },
  chipTexte: { color: '#555', fontSize: 14 },
  chipTexteActif: { color: 'white', fontWeight: 'bold' },
  boutonSave: { backgroundColor: '#FF6B6B', padding: 18, borderRadius: 30, alignItems: 'center', marginTop: 32, marginBottom: 12 },
  boutonSaveTexte: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  boutonAnnuler: { borderWidth: 2, borderColor: '#eee', padding: 16, borderRadius: 30, alignItems: 'center', marginBottom: 48 },
  boutonAnnulerTexte: { color: '#888', fontSize: 16 },
});