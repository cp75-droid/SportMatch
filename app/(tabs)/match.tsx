import { useEffect, useRef, useState } from 'react';
import { Animated, PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../supabase';


type Profil = {
  id: number;
  prenom: string;
  ville: string;
  sport: string;
  niveau: string;
};

export default function MatchScreen() {
  const [profils, setProfils] = useState<Profil[]>([]);
  const [index, setIndex] = useState(0);
  const [dernierAction, setDernierAction] = useState('');
  const [loading, setLoading] = useState(true);
  const position = useRef(new Animated.ValueXY()).current;

  useEffect(() => {
    chargerProfils();
  }, []);

  const chargerProfils = async () => {
    const { data, error } = await supabase.from('profils').select('*');
    if (data) setProfils(data);
    setLoading(false);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      position.setValue({ x: gesture.dx, y: gesture.dy });
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx > 120) {
        swipe('droite');
      } else if (gesture.dx < -120) {
        swipe('gauche');
      } else {
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
        }).start();
      }
    },
  });

  const swipe = (direction: string) => {
    const x = direction === 'droite' ? 500 : -500;
    setDernierAction(direction === 'droite' ? '💚 Match !' : '❌ Passé');
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      position.setValue({ x: 0, y: 0 });
      setIndex((i) => (i + 1) % profils.length);
    });
  };

  const rotation = position.x.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: ['-15deg', '0deg', '15deg'],
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.titre}>⚡ SportMatch</Text>
        <Text style={{ color: '#888', marginTop: 40 }}>Chargement des profils...</Text>
      </View>
    );
  }

  if (profils.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.titre}>⚡ SportMatch</Text>
        <Text style={{ color: '#888', marginTop: 40 }}>Aucun profil pour l'instant !</Text>
      </View>
    );
  }

  const profil = profils[index];

  return (
    <View style={styles.container}>
      <Text style={styles.titre}>⚡ SportMatch</Text>

      {dernierAction ? (
        <Text style={styles.action}>{dernierAction}</Text>
      ) : null}

      <Animated.View
        style={[styles.carte, { transform: [{ translateX: position.x }, { translateY: position.y }, { rotate: rotation }] }]}
        {...panResponder.panHandlers}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarTexte}>{profil.prenom[0]}</Text>
        </View>
        <Text style={styles.nom}>{profil.prenom}</Text>
        <Text style={styles.ville}>📍 {profil.ville}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeTexte}>{profil.sport}</Text>
        </View>
        <View style={styles.badgeNiveau}>
          <Text style={styles.badgeNiveauTexte}>{profil.niveau}</Text>
        </View>
        <Text style={styles.hint}>← Swipe gauche ou droite →</Text>
      </Animated.View>

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
  container: { flex: 1, backgroundColor: '#f8f8f8', alignItems: 'center', paddingTop: 48 },
  titre: { fontSize: 22, fontWeight: 'bold', color: '#FF6B6B', marginBottom: 8 },
  action: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  carte: {
    backgroundColor: 'white', borderRadius: 20, padding: 24, width: '85%',
    alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1,
    shadowRadius: 10, elevation: 5, marginBottom: 24,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#FF6B6B',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarTexte: { fontSize: 32, fontWeight: 'bold', color: 'white' },
  nom: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  ville: { fontSize: 14, color: '#888', marginBottom: 12 },
  badge: { backgroundColor: '#FF6B6B', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 16, marginBottom: 8 },
  badgeTexte: { color: 'white', fontWeight: 'bold', fontSize: 13 },
  badgeNiveau: { backgroundColor: '#f0f0f0', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 16, marginBottom: 16 },
  badgeNiveauTexte: { color: '#555', fontWeight: 'bold', fontSize: 13 },
  hint: { fontSize: 12, color: '#bbb' },
  boutons: { flexDirection: 'row', gap: 32 },
  boutonNon: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: 'white',
    alignItems: 'center', justifyContent: 'center', shadowColor: '#000',
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 3,
  },
  boutonNonTexte: { fontSize: 24, color: '#ff4444' },
  boutonOui: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#FF6B6B',
    alignItems: 'center', justifyContent: 'center', shadowColor: '#000',
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 3,
  },
  boutonOuiTexte: { fontSize: 24, color: 'white' },
});