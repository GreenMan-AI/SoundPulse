import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, Alert, KeyboardAvoidingView, Platform,
  ActivityIndicator,
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useApp, API } from './AppContext';

interface Comment {
  _id: string;
  trackId: string;
  username: string;
  text: string;
  createdAt: string;
}

interface Props {
  trackId: string;
  trackTitle: string;
  onClose: () => void;
}

export default function TrackComments({ trackId, trackTitle, onClose }: Props) {
  const { user, token, accentColor, colors, t } = useApp();

  const [comments, setComments]   = useState<Comment[]>([]);
  const [text, setText]           = useState('');
  const [loading, setLoading]     = useState(true);
  const [sending, setSending]     = useState(false);
  const [error, setError]         = useState('');

  // ── Ielādē komentārus ──
  const loadComments = useCallback(async () => {
    try {
      const r = await fetch(`${API}/api/tracks/${trackId}/comments`);
      const d = await r.json();
      setComments(Array.isArray(d) ? d : (d.comments || []));
    } catch {
      setError(t.serverError);
    } finally {
      setLoading(false);
    }
  }, [trackId]);

  useEffect(() => { loadComments(); }, [loadComments]);

  // ── Nosūtīt komentāru ──
  const sendComment = async () => {
    if (!text.trim()) return;
    if (!token) { Alert.alert(t.error, t.login); return; }
    setSending(true);
    try {
      const r = await fetch(`${API}/api/tracks/${trackId}/comments`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify({ text: text.trim() }),
      });
      const d = await r.json();
      if (d._id || d.comment) {
        setComments(prev => [d.comment || d, ...prev]);
        setText('');
      } else {
        Alert.alert(t.error, d.error || t.serverError);
      }
    } catch {
      Alert.alert(t.error, t.serverError);
    } finally {
      setSending(false);
    }
  };

  // ── Dzēst komentāru (tikai admin) ──
  const deleteComment = (commentId: string) => {
    Alert.alert(
      t.delete + '?',
      t.commentDeleteConfirm ?? 'Dzēst šo komentāru?',
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.delete,
          style: 'destructive',
          onPress: async () => {
            try {
              await fetch(`${API}/api/comments/${commentId}`, {
                method:  'DELETE',
                headers: { Authorization: `Bearer ${token}` },
              });
              setComments(prev => prev.filter(c => c._id !== commentId));
            } catch {
              Alert.alert(t.error, t.serverError);
            }
          },
        },
      ]
    );
  };

  // ── Laika formatēšana ──
  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      const now = new Date();
      const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
      if (diff < 60)   return t.commentJustNow   ?? 'Tikko';
      if (diff < 3600) return `${Math.floor(diff / 60)} ${t.commentMinsAgo ?? 'min'}`;
      if (diff < 86400) return `${Math.floor(diff / 3600)} ${t.commentHoursAgo ?? 'h'}`;
      return `${Math.floor(diff / 86400)} ${t.commentDaysAgo ?? 'd'}`;
    } catch { return ''; }
  };

  return (
    <KeyboardAvoidingView
      style={[s.container, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={80}
    >
      {/* Header */}
      <View style={[s.header, {
        backgroundColor: colors.card,
        borderBottomColor: accentColor + '33',
      }]}>
        <View style={s.headerLeft}>
          <Ionicons name="chatbubbles" size={20} color={accentColor} />
          <View>
            <Text style={[s.headerTitle, { color: accentColor }]}>
              {t.comments ?? 'Komentāri'}
            </Text>
            <Text style={[s.headerSub, { color: colors.subText }]} numberOfLines={1}>
              {trackTitle}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={onClose} style={s.closeBtn}>
          <Ionicons name="close" size={22} color={colors.subText} />
        </TouchableOpacity>
      </View>

      {/* Komentāru saraksts */}
      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color={accentColor} />
        </View>
      ) : error ? (
        <View style={s.center}>
          <Ionicons name="cloud-offline" size={40} color={colors.border} />
          <Text style={[s.emptyTxt, { color: colors.subText }]}>{error}</Text>
          <TouchableOpacity onPress={loadComments} style={[s.retryBtn, { borderColor: accentColor }]}>
            <Text style={{ color: accentColor, fontWeight: '700' }}>
              {t.retry ?? 'Mēģināt vēlreiz'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={comments}
          keyExtractor={item => item._id}
          contentContainerStyle={s.list}
          inverted={comments.length > 0}
          ListEmptyComponent={
            <View style={s.center}>
              <Ionicons name="chatbubble-outline" size={48} color={colors.border} />
              <Text style={[s.emptyTxt, { color: colors.subText }]}>
                {t.noComments ?? 'Nav komentāru. Esi pirmais!'}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const isOwn   = item.username === user?.username;
            const isAdmin = user?.isAdmin;

            return (
              <View style={[
                s.bubble,
                {
                  backgroundColor: isOwn ? accentColor + '18' : colors.card,
                  borderColor:     isOwn ? accentColor + '44' : colors.border,
                  alignSelf:       isOwn ? 'flex-end' : 'flex-start',
                },
              ]}>
                {/* Lietotājvārds + laiks */}
                <View style={s.bubbleTop}>
                  <Text style={[s.bubbleUser, {
                    color: isOwn ? accentColor : colors.text,
                  }]}>
                    {item.username}
                    {item.username === 'admin' ? ' ⭐' : ''}
                  </Text>
                  <Text style={[s.bubbleTime, { color: colors.subText }]}>
                    {formatTime(item.createdAt)}
                  </Text>
                  {/* Dzēst — tikai admin */}
                  {isAdmin && (
                    <TouchableOpacity
                      onPress={() => deleteComment(item._id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="trash-outline" size={14} color="#ff446688" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Teksts */}
                <Text style={[s.bubbleText, { color: colors.text }]}>
                  {item.text}
                </Text>
              </View>
            );
          }}
        />
      )}

      {/* Ievades josla */}
      <View style={[s.inputBar, {
        backgroundColor: colors.card,
        borderTopColor:  accentColor + '22',
      }]}>
        <TextInput
          style={[s.input, {
            backgroundColor: colors.bg,
            color:           colors.text,
            borderColor:     accentColor + '33',
          }]}
          placeholder={t.commentPlaceholder ?? 'Raksti komentāru...'}
          placeholderTextColor={colors.subText}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={300}
        />
        <TouchableOpacity
          style={[s.sendBtn, {
            backgroundColor: text.trim() ? accentColor : accentColor + '33',
          }]}
          onPress={sendComment}
          disabled={sending || !text.trim()}
        >
          {sending
            ? <ActivityIndicator size="small" color="#000" />
            : <Ionicons name="send" size={18} color={text.trim() ? '#000' : colors.subText} />
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container:   { flex: 1 },
  header:      {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerLeft:  { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: '800' },
  headerSub:   { fontSize: 12, marginTop: 1, maxWidth: 220 },
  closeBtn:    { padding: 4 },
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 20 },
  emptyTxt:    { fontSize: 14, textAlign: 'center' },
  retryBtn:    { borderWidth: 1, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  list:        { padding: 12, gap: 8, flexGrow: 1 },
  bubble:      {
    maxWidth: '80%', borderRadius: 16,
    padding: 10, borderWidth: 1, gap: 4,
  },
  bubbleTop:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bubbleUser:  { fontSize: 12, fontWeight: '800', flex: 1 },
  bubbleTime:  { fontSize: 10 },
  bubbleText:  { fontSize: 13, lineHeight: 18 },
  inputBar:    {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 12, paddingVertical: 10,
    borderTopWidth: 1, gap: 8,
  },
  input:       {
    flex: 1, borderRadius: 14, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 14, maxHeight: 100,
  },
  sendBtn:     {
    width: 42, height: 42, borderRadius: 21,
    justifyContent: 'center', alignItems: 'center',
  },
});
