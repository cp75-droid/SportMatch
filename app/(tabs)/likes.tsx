import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { supabase } from '../../supabase';

type Swipe = {
  id: number;
  swipeur: string;
  cible: string;
  direction: string;
};

type Profil = {
  prenom: string;
  email: string;
  sport: string;
  ville: string;
};

export default function LikesScreen() {
  const [likes, setLikes] = useState<Profil[]>([]);
  const [monEmail, setMonEmail] = useState('');

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const email = userData.user?.email || '';
    setMonEmail(email);

    const { data: swipes } = await supabase
      .from('swipes')
      .select('*')
      .eq('cible', email)
      .eq('direction', 'droite');

    if (!swipes || swipes.length === 0) return;

    const emails = swipes.map((s: Swipe) => s.swipeur);
    const { data: profils } = await supabase
      .from('profils')
      .select('*')
      .in('email', emails);

    if (profils) setLikes(profils);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titre}>❤️ Qui t'a likée</Text>
      {likes.length === 0 ? (
        <Text style={styles.vide}>Personne encore — va swiper pour que ça change ! ⚡</Text>
      ) : (
        <FlatList
          data={likes}
          keyExtractor={(item) => item.email}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.avatar}>
                <Text style={styles.avatarTexte}>{item.prenom[0].toUpperCase()}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.prenom}>{item.prenom}</Text>
                <Text style={styles.detail}>{item.sport} · {item.ville}</Text>
              </View>
              <Text style={styles.heart}>❤️</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  titre: { fontSize: 22, fontWeight: 'bold', color: '#FF6B6B', padding: 16, paddingTop: 48 },
  vide: { color: '#888', textAlign: 'center', marginTop: 40, fontSize: 15, paddingHorizontal: 32 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'white', marginHorizontal: 16, marginTop: 8, borderRadius: 12, gap: 12 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#FF6B6B', alignItems: 'center', justifyContent: 'center' },
  avatarTexte: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  info: { flex: 1 },
  prenom: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 2 },
  detail: { fontSize: 13, color: '#888' },
  heart: { fontSize: 20 },
});