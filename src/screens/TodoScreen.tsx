import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../firebase';
import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
 
type Todo = {
  id: string;
  text: string;
  done: boolean;
  createdAt?: FirebaseFirestoreTypes.Timestamp | null;
};
type FirebaseFirestoreTypes = typeof firestore;
 
export default function TodoScreen() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState('');
  const inputRef = useRef<TextInput>(null);
  const uid = auth().currentUser?.uid!;
  const colRef = useMemo(
    () => firestore().collection('users').doc(uid).collection('todos'),
    [uid],
  );
 
  useEffect(() => {
    const unsub = colRef.orderBy('createdAt', 'desc').onSnapshot(snap => {
      const data: Todo[] = snap?.docs.map(d => ({
        id: d.id,
        ...(d.data() as any),
      }));
      setTodos(data);
    });
    return unsub;
  }, [colRef]);
 
  const addTodo = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setText('');
    inputRef.current?.focus();
    await colRef.add({
      text: trimmed,
      done: false,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
  };
 
  const toggleTodo = async (id: string, done: boolean) => {
    await colRef.doc(id).update({ done: !done });
  };
 
  const deleteTodo = async (id: string) => {
    await colRef.doc(id).delete();
  };
 
  const editTodo = async (id: string, currentText: string) => {
    Alert.prompt(
      'Edit Task',
      'Update your todo text:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: async (newText?: string) => {
            const trimmed = newText?.trim();
            if (trimmed) {
              await colRef.doc(id).update({ text: trimmed });
            }
          },
        },
      ],
      'plain-text',
      currentText,
    );
  };
 
  const clearCompleted = async () => {
    const snap = await colRef.where('done', '==', true).get();
    if (snap.empty) return;
    Alert.alert('Clear completed?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          const batch = firestore().batch();
          snap.forEach(d => batch.delete(d.ref));
          await batch.commit();
        },
      },
    ]);
  };
 
  const signOut = () => auth().signOut();
 
  const renderItem = ({ item }: { item: Todo }) => (
    <View style={styles.row}>
      <TouchableOpacity
        style={[styles.checkbox, item.done && styles.checkboxChecked]}
        onPress={() => toggleTodo(item.id, item.done)}
      >
        {item.done ? <Text style={styles.checkmark}>✓</Text> : null}
      </TouchableOpacity>
      <Text
        style={[styles.rowText, item.done && styles.rowTextDone]}
        numberOfLines={2}
      >
        {item.text}
      </Text>
      <TouchableOpacity
        onPress={() => editTodo(item.id, item.text)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.edit}>✎</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => deleteTodo(item.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.delete}>✕</Text>
      </TouchableOpacity>
    </View>
  );
 
  return (
    <>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.container}
        >
          <View style={styles.headerRow}>
            <Text style={styles.title}>My To-Dos</Text>
            <TouchableOpacity onPress={signOut} style={styles.signoutBtn}>
              <Text style={styles.signoutText}>Sign out</Text>
            </TouchableOpacity>
          </View>
 
          <View style={styles.inputRow}>
            <TextInput
              ref={inputRef}
              value={text}
              onChangeText={setText}
              placeholder="Add a task..."
              placeholderTextColor="#7c89b3"
              onSubmitEditing={addTodo}
              returnKeyType="done"
              style={styles.input}
            />
            <TouchableOpacity
              style={[styles.btn, !text.trim() && styles.btnDisabled]}
              onPress={addTodo}
              disabled={!text.trim()}
            >
              <Text style={styles.btnText}>Add</Text>
            </TouchableOpacity>
          </View>
 
          <FlatList
            data={todos}
            keyExtractor={t => t.id}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={styles.sep} />}
            contentContainerStyle={todos.length === 0 && styles.emptyList}
            ListEmptyComponent={
              <Text style={styles.empty}>No tasks yet. Add your first!</Text>
            }
            keyboardDismissMode="on-drag"
          />
 
          <View style={styles.footer}>
            <Text style={styles.count}>
              {todos.filter(t => !t.done).length} remaining
            </Text>
            <TouchableOpacity
              onPress={clearCompleted}
              disabled={!todos.some(t => t.done)}
            >
              <Text
                style={[
                  styles.clear,
                  !todos.some(t => t.done) && styles.clearDisabled,
                ]}
              >
                Clear completed
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}
 
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0b1220' },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 8, gap: 12 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 28, fontWeight: '700', color: 'white', marginTop: 4 },
  signoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#1a2340',
    borderRadius: 8,
  },
  signoutText: { color: '#d7def7', fontWeight: '600' },
 
  inputRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  input: {
    flex: 1,
    backgroundColor: '#1a2340',
    color: 'white',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 44,
  },
  btn: {
    backgroundColor: '#4f7cff',
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: 'white', fontWeight: '700' },
 
  sep: { height: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121a33',
    padding: 12,
    borderRadius: 12,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#4f7cff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxChecked: { backgroundColor: '#4f7cff' },
  checkmark: { color: 'white', fontSize: 16, fontWeight: '700' },
  rowText: { flex: 1, color: 'white', fontSize: 16 },
  rowTextDone: { textDecorationLine: 'line-through', color: '#93a0c6' },
  edit: { color: '#ffd93d', fontSize: 18, paddingHorizontal: 6 },
  delete: { color: '#ff6b6b', fontSize: 18, paddingHorizontal: 6 },
 
  emptyList: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { color: '#93a0c6' },
 
  footerWrap: { paddingBottom: 10 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
  },
  footerSafe: {
    backgroundColor: '#0b1220',
  },
  count: { color: '#93a0c6' },
  clear: { color: '#ffb84d', fontWeight: '600' },
  clearDisabled: { opacity: 0.4 },
});