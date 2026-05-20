import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
  const [bio, setBio] = useState('');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState('');

const choisirPhoto = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.5,
  });
  if (!result.canceled) {
    setPhoto(result.assets[0].uri);
    uploaderPhoto(result.assets[0].uri);
  }
};

const uploaderPhoto = async (uri: string) => {
  const fileName = `avatar_${Date.now()}.jpg`;
  
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  
  const arrayBuffer = decode(base64);
  
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, arrayBuffer, { contentType: 'image/jpeg' });

  if (!error) {
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
    await supabase.from('profils').update({ photo: urlData.publicUrl }).eq('email', email);
    setPhoto(urlData.publicUrl);
  }
};

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
  let email = '';
  const { data: sessionData } = await supabase.auth.getSession();
  email = sessionData.session?.user?.email || '';
  
  if (!email) {
    const { data: userData } = await supabase.auth.getUser();
    email = userData.user?.email || '';
  }
  
  if (email) {
    setEmail(email);
    chargerProfil(email);
  }
};

  const chargerProfil = async (email: string) => {
    const { data } = await supabase.from('profils').select('*').eq('email', email).single();
    console.log('email cherché:', email);
console.log('data trouvée:', data);
    if (data) {
      setPrenom(data.prenom);
      setVille(data.ville);
      setSport(data.sport);
      setNiveau(data.niveau);
      setBio(data.bio || '');
    }
  };

  const sauvegarder = async () => {
    setLoading(true);
    const { error } = await supabase.from('profils').update({ prenom, ville, sport, niveau, bio }).eq('email', email);
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
        <TouchableOpacity style={styles.photoBtn} onPress={choisirPhoto}>
  {photo ? (
    <Image source={{ uri: photo }} style={styles.photoBtnImg} />
  ) : (
    <View style={styles.photoBtnPlaceholder}>
      <Text style={styles.photoBtnTexte}>📷 Ajouter une photo</Text>
    </View>
  )}
</TouchableOpacity>

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
        <Text style={styles.label}>Ta bio</Text>
        <TextInput
          style={[styles.input, { height: 100 }]}
          placeholder="Présente-toi en quelques mots..."
          value={bio}
          onChangeText={setBio}
          multiline
        />
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
      {photo ? (
  <Image source={{ uri: photo }} style={styles.avatarPhoto} />
) : (
  <View style={styles.avatar}>
    <Text style={styles.avatarTexte}>{prenom ? prenom[0].toUpperCase() : '?'}</Text>
  </View>
)}

      <Text style={styles.prenom}>{prenom || '...'}</Text>
      <Text style={styles.email}>{email}</Text>

      <View style={styles.infoItem}>
  <Text style={styles.infoLabel}>Ville</Text>
  <Text style={styles.infoValeur}>📍 {ville || '—'}</Text>
</View>
<View style={styles.separateur} />
<View style={styles.infoItem}>
  <Text style={styles.infoLabel}>Sport</Text>
  <Text style={styles.infoValeur}>{sport || '—'}</Text>
</View>
<View style={styles.separateur} />
<View style={styles.infoItem}>
  <Text style={styles.infoLabel}>Niveau</Text>
  <Text style={styles.infoValeur}>⭐ {niveau || '—'}</Text>
</View>
{bio ? (
  <View style={styles.bioContainer}>
    <Text style={styles.bioTexte}>{bio}</Text>
  </View>
) : null}
      <TouchableOpacity style={styles.boutonEdit} onPress={() => setEditing(true)}>
        <Text style={styles.boutonEditTexte}>Modifier mon profil </Text>
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
  bioContainer: { backgroundColor: 'white', borderRadius: 12, padding: 16, width: '100%', marginBottom: 16 },
bioTexte: { fontSize: 14, color: '#555', lineHeight: 22, textAlign: 'center' },
photoBtn: { alignSelf: 'center', marginBottom: 24, marginTop: 8 },
photoBtnImg: { width: 100, height: 100, borderRadius: 50 },
photoBtnPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FF6B6B', borderStyle: 'dashed' },
photoBtnTexte: { fontSize: 11, color: '#FF6B6B', textAlign: 'center' },
avatarPhoto: { width: 100, height: 100, borderRadius: 50, marginBottom: 16, alignSelf: 'center' },
});