import { useEffect, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../supabase';


type Message = {
  id: number;
  contenu: string;
  expediteur: string;
  created_at: string;
};

export default function MessagesScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [nouveau, setNouveau] = useState('');
  const [monEmail, setMonEmail] = useState('');

  useEffect(() => {
    getUser();
    chargerMessages();
  }, []);

  const getUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) setMonEmail(data.user.email || '');
  };

  const chargerMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  const envoyerMessage = async () => {
    if (!nouveau.trim()) return;
    const { data } = await supabase.auth.getUser();
    const email = data.user?.email || 'anonyme';
    await supabase.from('messages').insert([{
      contenu: nouveau,
      expediteur: email,
    }]);
    setNouveau('');
    chargerMessages();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Text style={styles.titre}>💬 Messages</Text>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        style={styles.liste}
        renderItem={({ item }) => {
          const estMoi = item.expediteur === monEmail;
          return (
            <View style={[styles.bulle, estMoi ? styles.bullesMoi : styles.bulleAutre]}>
              {!estMoi && (
                <Text style={styles.expediteur}>{item.expediteur.split('@')[0]}</Text>
              )}
              <Text style={[styles.contenu, estMoi && { color: 'white' }]}>
                {item.contenu}
              </Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  titre: { fontSize: 20, fontWeight: 'bold', color: '#FF6B6B', padding: 16, paddingTop: 48, backgroundColor: 'white', borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  liste: { flex: 1, padding: 16 },
  bulle: { maxWidth: '75%', padding: 12, borderRadius: 16, marginBottom: 8 },
  bullesMoi: { backgroundColor: '#FF6B6B', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  bulleAutre: { backgroundColor: 'white', alignSelf: 'flex-start', borderBottomLeftRadius: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  expediteur: { fontSize: 11, color: '#888', marginBottom: 4 },
  contenu: { fontSize: 15, color: '#333' },
  inputRow: { flexDirection: 'row', padding: 12, backgroundColor: 'white', borderTopWidth: 0.5, borderTopColor: '#eee', gap: 8 },
  input: { flex: 1, backgroundColor: '#f0f0f0', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15 },
  boutonEnvoyer: { backgroundColor: '#FF6B6B', width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  boutonTexte: { color: 'white', fontSize: 20, fontWeight: 'bold' },
});