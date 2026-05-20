import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, PanResponder, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../supabase';

type Profil = {
  id: number;
  prenom: string;
  ville: string;
  sport: string;
  niveau: string;
  photo: string;
  email: string;
  bio: string;

};

const SPORTS = ['Tous', '🎾 Padel', '🏃 Running', '🚴 Vélo', '🏊 Natation', '⚽ Foot', '🏀 Basket'];
const { width } = Dimensions.get('window');

export default function MatchScreen() {
  const router = useRouter();
  const [profils, setProfils] = useState<Profil[]>([]);
  const [index, setIndex] = useState(0);
  const [dernierAction, setDernierAction] = useState('');
  const [loading, setLoading] = useState(true);
  const [filtreActif, setFiltreActif] = useState('Tous');
  const [monEmail, setMonEmail] = useState('');
  const position = useRef(new Animated.ValueXY()).current;
  const likeOpacity = useRef(new Animated.Value(0)).current;
  const nopeOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    chargerProfils();
  }, []);

  const chargerProfils = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const email = userData.user?.email || '';
    setMonEmail(email);
    const { data } = await supabase.from('profils').select('*').neq('email', email);
    if (data) setProfils(data);
    setLoading(false);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      position.setValue({ x: gesture.dx, y: gesture.dy });
      if (gesture.dx > 0) {
        likeOpacity.setValue(gesture.dx / 100);
        nopeOpacity.setValue(0);
      } else {
        nopeOpacity.setValue(-gesture.dx / 100);
        likeOpacity.setValue(0);
      }
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx > 120) swipe('droite');
      else if (gesture.dx < -120) swipe('gauche');
      else {
        Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start();
        Animated.timing(likeOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start();
        Animated.timing(nopeOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start();
      }
    },
  });

  const swipe = async (direction: string) => {
    const x = direction === 'droite' ? 500 : -500;
    if (direction === 'droite' && monEmail && profilsFiltres[index]) {
      const cible = profilsFiltres[index].email;
      await supabase.from('swipes').insert([{ swipeur: monEmail, cible, direction: 'droite' }]);
      const { data: swipeRetour } = await supabase.from('swipes').select('*').eq('swipeur', cible).eq('cible', monEmail).eq('direction', 'droite');
      if (swipeRetour && swipeRetour.length > 0) {
        await supabase.from('matches').insert([{ user1: monEmail, user2: cible }]);
        setDernierAction('🎉 Nouveau match !');
        setTimeout(() => router.push('/messages'), 1500);
        return;
      }
    }
    setDernierAction(direction === 'droite' ? '💚 Like !' : '❌ Passé');
    Animated.timing(position, { toValue: { x, y: 0 }, duration: 300, useNativeDriver: true }).start(() => {
      position.setValue({ x: 0, y: 0 });
      likeOpacity.setValue(0);
      nopeOpacity.setValue(0);
      setIndex((i) => (i + 1) % profilsFiltres.length);
      setTimeout(() => setDernierAction(''), 1000);
    });
  };

  const rotation = position.x.interpolate({ inputRange: [-200, 0, 200], outputRange: ['-12deg', '0deg', '12deg'] });

  const profilsFiltres = filtreActif === 'Tous' ? profils : profils.filter(p => p.sport === filtreActif);

  if (loading) return (
    <View style={styles.container}>
      <Text style={styles.titre}>⚡ SportMatch</Text>
      <Text style={{ color: '#888', marginTop: 40 }}>Chargement...</Text>
    </View>
  );

  if (profilsFiltres.length === 0) return (
    <View style={styles.container}>
      <Text style={styles.titre}>⚡ SportMatch</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtres} contentContainerStyle={{ paddingHorizontal: 16 }}>
        {SPORTS.map((sport) => (
          <TouchableOpacity key={sport} style={[styles.filtre, filtreActif === sport && styles.filtreActif]} onPress={() => { setFiltreActif(sport); setIndex(0); }}>
            <Text style={[styles.filtreTexte, filtreActif === sport && styles.filtreTexteActif]}>{sport}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Text style={{ color: '#888', marginTop: 40, fontSize: 15 }}>Aucun profil pour ce sport !</Text>
    </View>
  );

  const profil = profilsFiltres[index % profilsFiltres.length];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titre}>⚡ SportMatch</Text>
        {dernierAction ? <Text style={styles.action}>{dernierAction}</Text> : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtres} contentContainerStyle={{ paddingHorizontal: 16 }}>
        {SPORTS.map((sport) => (
          <TouchableOpacity key={sport} style={[styles.filtre, filtreActif === sport && styles.filtreActif]} onPress={() => { setFiltreActif(sport); setIndex(0); }}>
            <Text style={[styles.filtreTexte, filtreActif === sport && styles.filtreTexteActif]}>{sport}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.carteContainer}>
        <Animated.View
          style={[styles.carte, { transform: [{ translateX: position.x }, { translateY: position.y }, { rotate: rotation }] }]}
          {...panResponder.panHandlers}
        >
          {profil.photo ? (
            <Image source={{ uri: profil.photo }} style={styles.carteImage} />
          ) : (
            <View style={styles.carteImagePlaceholder}>
              <Text style={styles.carteInitiale}>{profil.prenom[0]}</Text>
            </View>
          )}

          <Animated.View style={[styles.likeStamp, { opacity: likeOpacity }]}>
            <Text style={styles.likeText}>LIKE</Text>
          </Animated.View>

          <Animated.View style={[styles.nopeStamp, { opacity: nopeOpacity }]}>
            <Text style={styles.nopeText}>NOPE</Text>
          </Animated.View>

          <View style={styles.carteInfo}>
            <Text style={styles.carteNom}>{profil.prenom}</Text>
            <Text style={styles.carteVille}>📍 {profil.ville}</Text>
            {profil.bio ? <Text style={styles.carteBio}>{profil.bio}</Text> : null}
            <View style={styles.carteBadges}>
              <View style={styles.carteBadge}>
                <Text style={styles.carteBadgeTexte}>{profil.sport}</Text>
              </View>
              <View style={styles.carteBadgeGray}>
                <Text style={styles.carteBadgeGrayTexte}>{profil.niveau}</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </View>

      <View style={styles.boutons}>
        <TouchableOpacity style={styles.boutonNon} onPress={() => swipe('gauche')}>
          <Text style={styles.boutonNonTexte}>✕</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.boutonOui} onPress={() => swipe('droite')}>
          <Text style={styles.boutonOuiTexte}>♥</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 48, paddingBottom: 8 },
  titre: { fontSize: 22, fontWeight: 'bold', color: '#FF6B6B' },
  action: { fontSize: 16, fontWeight: 'bold' },
  filtres: { maxHeight: 52, marginBottom: 8 },
  filtre: { borderWidth: 1.5, borderColor: '#eee', borderRadius: 20, paddingVertical: 7, paddingHorizontal: 16, marginHorizontal: 4, backgroundColor: 'white' },
  filtreActif: { backgroundColor: '#FF6B6B', borderColor: '#FF6B6B' },
  filtreTexte: { color: '#555', fontSize: 13 },
  filtreTexteActif: { color: 'white', fontWeight: 'bold', fontSize: 13 },
  carteContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  carte: {
    width: '100%', maxWidth: 380,
    backgroundColor: 'white',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  carteImage: { width: '100%', height: 200, resizeMode: 'cover' },
  carteImagePlaceholder: { width: '100%', height: 200, backgroundColor: '#FF6B6B', alignItems: 'center', justifyContent: 'center' },
  carteInitiale: { fontSize: 80, fontWeight: 'bold', color: 'white' },
  likeStamp: { position: 'absolute', top: 40, left: 20, borderWidth: 4, borderColor: '#4CAF50', borderRadius: 8, padding: 8, transform: [{ rotate: '-20deg' }] },
  likeText: { fontSize: 28, fontWeight: 'bold', color: '#4CAF50' },
  nopeStamp: { position: 'absolute', top: 40, right: 20, borderWidth: 4, borderColor: '#FF4444', borderRadius: 8, padding: 8, transform: [{ rotate: '20deg' }] },
  nopeText: { fontSize: 28, fontWeight: 'bold', color: '#FF4444' },
  carteInfo: { padding: 20 },
  carteNom: { fontSize: 26, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 4 },
  carteVille: { fontSize: 14, color: '#888', marginBottom: 12 },
  carteBadges: { flexDirection: 'row', gap: 8 },
  carteBadge: { backgroundColor: '#FF6B6B', borderRadius: 20, paddingVertical: 5, paddingHorizontal: 14 },
  carteBadgeTexte: { color: 'white', fontWeight: 'bold', fontSize: 13 },
  carteBadgeGray: { backgroundColor: '#f0f0f0', borderRadius: 20, paddingVertical: 5, paddingHorizontal: 14 },
  carteBadgeGrayTexte: { color: '#555', fontWeight: 'bold', fontSize: 13 },
  boutons: { flexDirection: 'row', justifyContent: 'center', gap: 40, paddingVertical: 20 },
  boutonNon: { width: 68, height: 68, borderRadius: 34, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 4, borderWidth: 1, borderColor: '#eee' },
  boutonNonTexte: { fontSize: 26, color: '#FF4444' },
  boutonOui: { width: 68, height: 68, borderRadius: 34, backgroundColor: '#FF6B6B', alignItems: 'center', justifyContent: 'center', shadowColor: '#FF6B6B', shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 },
  boutonOuiTexte: { fontSize: 26, color: 'white' },
  carteBio: { fontSize: 14, color: '#555', lineHeight: 20, marginBottom: 10 },
});