import { useEffect, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../supabase';

type Match = {
  id: number;
  user1: string;
  user2: string;
};

type Message = {
  id: number;
  contenu: string;
  expediteur: string;
  destinataire: string;
  created_at: string;
};

export default function MessagesScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [matchActif, setMatchActif] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [nouveau, setNouveau] = useState('');
  const [monEmail, setMonEmail] = useState('');

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      setMonEmail(data.user.email || '');
      chargerMatches(data.user.email || '');
    }
  };

  const chargerMatches = async (email: string) => {
    const { data } = await supabase
      .from('matches')
      .select('*')
      .or(`user1.eq.${email},user2.eq.${email}`);
    if (data) setMatches(data);
  };

  const ouvrirConversation = async (autreUser: string) => {
    setMatchActif(autreUser);
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(expediteur.eq.${monEmail},destinataire.eq.${autreUser}),and(expediteur.eq.${autreUser},destinataire.eq.${monEmail})`)
      .order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  const envoyerMessage = async () => {
    if (!nouveau.trim() || !matchActif) return;
    await supabase.from('messages').insert([{
      contenu: nouveau,
      expediteur: monEmail,
      destinataire: matchActif,
    }]);
    setNouveau('');
    ouvrirConversation(matchActif);
  };

  if (matchActif) {
    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setMatchActif(null)}>
            <Text style={styles.retour}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.headerNom}>{matchActif.split('@')[0]}</Text>
        </View>

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          style={styles.liste}
          renderItem={({ item }) => {
            const estMoi = item.expediteur === monEmail;
            return (
              <View style={[styles.bulle, estMoi ? styles.bulleMoi : styles.bulleAutre]}>
                <Text style={[styles.contenu, estMoi && { color: 'white' }]}>{item.contenu}</Text>
              </View>
            );
          }}
        />

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Écris un message..."
            value={nouveau}
            onChangeText={setNouveau}
          />
          <TouchableOpacity style={styles.boutonEnvoyer} onPress={envoyerMessage}>
            <Text style={styles.boutonTexte}>→</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titre}>💬 Mes Matchs</Text>
      {matches.length === 0 ? (
        <Text style={styles.vide}>Pas encore de matchs — va swiper ! ⚡</Text>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const autreUser = item.user1 === monEmail ? item.user2 : item.user1;
            return (
              <TouchableOpacity style={styles.matchItem} onPress={() => ouvrirConversation(autreUser)}>
                <View style={styles.matchAvatar}>
                  <Text style={styles.matchAvatarTexte}>{autreUser[0].toUpperCase()}</Text>
                </View>
                <Text style={styles.matchNom}>{autreUser.split('@')[0]}</Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  titre: { fontSize: 22, fontWeight: 'bold', color: '#FF6B6B', padding: 16, paddingTop: 48 },
  vide: { color: '#888', textAlign: 'center', marginTop: 40, fontSize: 16 },
  matchItem: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'white', marginHorizontal: 16, marginTop: 8, borderRadius: 12, gap: 12 },
  matchAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FF6B6B', alignItems: 'center', justifyContent: 'center' },
  matchAvatarTexte: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  matchNom: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 48, backgroundColor: 'white', borderBottomWidth: 0.5, borderBottomColor: '#eee', gap: 16 },
  retour: { color: '#FF6B6B', fontSize: 16 },
  headerNom: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  liste: { flex: 1, padding: 16 },
  bulle: { maxWidth: '75%', padding: 12, borderRadius: 16, marginBottom: 8 },
  bulleMoi: { backgroundColor: '#FF6B6B', alignSelf: 'flex-end' },
  bulleAutre: { backgroundColor: 'white', alignSelf: 'flex-start' },
  contenu: { fontSize: 15, color: '#333' },
  inputRow: { flexDirection: 'row', padding: 12, backgroundColor: 'white', borderTopWidth: 0.5, borderTopColor: '#eee', gap: 8 },
  input: { flex: 1, backgroundColor: '#f0f0f0', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15 },
  boutonEnvoyer: { backgroundColor: '#FF6B6B', width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  boutonTexte: { color: 'white', fontSize: 20, fontWeight: 'bold' },
});