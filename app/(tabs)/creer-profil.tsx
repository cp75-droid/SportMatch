import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../supabase';

const SPORTS = ['🎾 Padel', '🏃 Running', '🚴 Vélo', '🏊 Natation', '⚽ Foot', '🏀 Basket'];
const NIVEAUX = ['Débutant', 'Intermédiaire', 'Avancé'];

export default function CreerProfilScreen() {
  const router = useRouter();
  const [prenom, setPrenom] = useState('');
  const [ville, setVille] = useState('');
  const [sportChoisi, setSportChoisi] = useState('');
  const [niveauChoisi, setNiveauChoisi] = useState('');
  const [loading, setLoading] = useState(false);

  const sauvegarderProfil = async () => {
    if (!prenom || !ville || !sportChoisi || !niveauChoisi) {
      Alert.alert('Oups !', 'Remplis tous les champs.');
      return;
    }
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const email = userData.user?.email || '';

    const { error } = await supabase
      .from('profils')
      .insert([{ prenom, ville, sport: sportChoisi, niveau: niveauChoisi, email }]);

    setLoading(false);
    if (error) Alert.alert('Erreur', error.message);
    else router.push('/match');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titre}>Crée ton profil</Text>
      <Text style={styles.sousTitre}>Dis-nous qui tu es 👋</Text>

      <Text style={styles.label}>Ton prénom</Text>
      <TextInput style={styles.input} placeholder="Ex: Camille" value={prenom} onChangeText={setPrenom} />

      <Text style={styles.label}>Ta ville</Text>
      <TextInput style={styles.input} placeholder="Ex: Paris" value={ville} onChangeText={setVille} />

      <Text style={styles.label}>Ton sport</Text>
      <View style={styles.grille}>
        {SPORTS.map((sport) => (
          <TouchableOpacity
            key={sport}
            style={[styles.chip, sportChoisi === sport && styles.chipActif]}
            onPress={() => setSportChoisi(sport)}
          >
            <Text style={[styles.chipTexte, sportChoisi === sport && styles.chipTexteActif]}>{sport}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Ton niveau</Text>
      <View style={styles.grille}>
        {NIVEAUX.map((niveau) => (
          <TouchableOpacity
            key={niveau}
            style={[styles.chip, niveauChoisi === niveau && styles.chipActif]}
            onPress={() => setNiveauChoisi(niveau)}
          >
            <Text style={[styles.chipTexte, niveauChoisi === niveau && styles.chipTexteActif]}>{niveau}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={[styles.bouton, loading && { opacity: 0.6 }]} onPress={sauvegarderProfil} disabled={loading}>
        <Text style={styles.boutonTexte}>{loading ? 'Sauvegarde...' : 'Continuer →'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  titre: { fontSize: 28, fontWeight: 'bold', color: '#FF6B6B', marginTop: 48, marginBottom: 4 },
  sousTitre: { fontSize: 16, color: '#888', marginBottom: 32 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8, marginTop: 16 },
  input: { borderWidth: 1.5, borderColor: '#eee', borderRadius: 12, padding: 14, fontSize: 16, color: '#333' },
  grille: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1.5, borderColor: '#eee', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16 },
  chipActif: { backgroundColor: '#FF6B6B', borderColor: '#FF6B6B' },
  chipTexte: { color: '#555', fontSize: 14 },
  chipTexteActif: { color: 'white', fontWeight: 'bold' },
  bouton: { backgroundColor: '#FF6B6B', padding: 18, borderRadius: 30, alignItems: 'center', marginTop: 32, marginBottom: 48 },
  boutonTexte: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});