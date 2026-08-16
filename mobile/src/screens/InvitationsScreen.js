import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { formatDate, COLORS } from '../lib/utils';

export default function InvitationsScreen() {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('SELLER');
  const [sending, setSending] = useState(false);

  const isAdminOrManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  useFocusEffect(
    useCallback(() => {
      loadInvitations();
    }, [])
  );

  const loadInvitations = async () => {
    try {
      const data = await api.getInvitations();
      setInvitations(data);
    } catch (error) {
      console.error('Error loading invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Ingresa un email');
      return;
    }
    setSending(true);
    try {
      await api.createInvitation({ email: email.trim(), role });
      Alert.alert('Exito', 'Invitacion enviada a ' + email);
      setShowModal(false);
      setEmail('');
      setRole('SELLER');
      loadInvitations();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setSending(false);
    }
  };

  const handleResend = async (invitation) => {
    try {
      await api.post(`/invitations/${invitation.id}/resend`);
      Alert.alert('Exito', 'Invitacion reenviada');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleCancel = (invitation) => {
    Alert.alert('Cancelar invitacion', `Cancelar invitacion a ${invitation.email}?`, [
      { text: 'No', style: 'cancel' },
      {
        text: 'Si, cancelar',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.patch(`/invitations/${invitation.id}/cancel`);
            loadInvitations();
          } catch (error) {
            Alert.alert('Error', error.message);
          }
        },
      },
    ]);
  };

  const statusColor = (status) => {
    switch (status) {
      case 'PENDING': return COLORS.warning;
      case 'ACCEPTED': return COLORS.success;
      case 'CANCELLED': return COLORS.gray[400];
      case 'EXPIRED': return COLORS.danger;
      default: return COLORS.gray[500];
    }
  };

  const statusLabel = (status) => {
    switch (status) {
      case 'PENDING': return 'Pendiente';
      case 'ACCEPTED': return 'Aceptada';
      case 'CANCELLED': return 'Cancelada';
      case 'EXPIRED': return 'Expirada';
      default: return status;
    }
  };

  const roleLabel = (role) => {
    switch (role) {
      case 'ADMIN': return 'Administrador';
      case 'MANAGER': return 'Gerente';
      case 'SELLER': return 'Vendedor';
      case 'WAREHOUSE': return 'Bodega';
      default: return role;
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIcon}>
          <Text style={styles.cardIconText}>{item.email[0]?.toUpperCase()}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardEmail}>{item.email}</Text>
          <Text style={styles.cardRole}>{roleLabel(item.role)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: statusColor(item.status) }]}>{statusLabel(item.status)}</Text>
        </View>
      </View>

      <View style={styles.cardMeta}>
        <Text style={styles.metaText}>Por: {item.invitedBy?.firstName} {item.invitedBy?.lastName}</Text>
        <Text style={styles.metaText}>{formatDate(item.createdAt)}</Text>
      </View>

      {item.status === 'PENDING' && (
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleResend(item)}>
            <Text style={styles.actionBtnText}>Reenviar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.actionBtnDanger]} onPress={() => handleCancel(item)}>
            <Text style={[styles.actionBtnText, styles.actionBtnTextDanger]}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {isAdminOrManager && (
        <View style={styles.header}>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
            <Text style={styles.addBtnText}>+ Invitar</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={invitations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>Sin invitaciones</Text>
              <Text style={styles.emptyText}>Invita a tu equipo para que se una</Text>
            </View>
          }
        />
      )}

      {/* Create Invitation Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.modalCancel}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Nueva Invitacion</Text>
            <TouchableOpacity onPress={handleCreate} disabled={sending}>
              <Text style={[styles.modalSave, sending && { opacity: 0.5 }]}>
                {sending ? 'Enviando...' : 'Enviar'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Email del invitado *</Text>
              <TextInput
                style={styles.input}
                placeholder="correo@ejemplo.com"
                placeholderTextColor={COLORS.gray[400]}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Rol</Text>
              <View style={styles.roleRow}>
                {[
                  { key: 'SELLER', label: 'Vendedor' },
                  { key: 'MANAGER', label: 'Gerente' },
                  { key: 'WAREHOUSE', label: 'Bodega' },
                ].map((r) => (
                  <TouchableOpacity
                    key={r.key}
                    style={[styles.roleBtn, role === r.key && styles.roleBtnActive]}
                    onPress={() => setRole(r.key)}
                  >
                    <Text style={[styles.roleBtnText, role === r.key && styles.roleBtnTextActive]}>
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                Se enviara un email con un link para que la persona cree su cuenta y se una a tu equipo.
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray[50] },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: { color: '#fff', fontWeight: '600' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardIconText: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary },
  cardInfo: { flex: 1 },
  cardEmail: { fontSize: 15, fontWeight: '600', color: COLORS.gray[900] },
  cardRole: { fontSize: 12, color: COLORS.gray[500], marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '600' },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
  metaText: { fontSize: 12, color: COLORS.gray[400] },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
  },
  actionBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  actionBtnDanger: { backgroundColor: COLORS.dangerLight },
  actionBtnTextDanger: { color: COLORS.danger },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: COLORS.gray[700], marginBottom: 8 },
  emptyText: { fontSize: 14, color: COLORS.gray[500] },
  // Modal
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  modalCancel: { fontSize: 16, color: COLORS.gray[500] },
  modalTitle: { fontSize: 18, fontWeight: '600', color: COLORS.gray[900] },
  modalSave: { fontSize: 16, fontWeight: '600', color: COLORS.primary },
  modalContent: { flex: 1, padding: 16 },
  formGroup: { marginBottom: 24 },
  formLabel: { fontSize: 14, fontWeight: '600', color: COLORS.gray[700], marginBottom: 8 },
  input: {
    backgroundColor: COLORS.gray[50],
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.gray[900],
  },
  roleRow: { flexDirection: 'row', gap: 8 },
  roleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.gray[100],
    alignItems: 'center',
  },
  roleBtnActive: { backgroundColor: COLORS.primary },
  roleBtnText: { fontSize: 14, fontWeight: '500', color: COLORS.gray[600] },
  roleBtnTextActive: { color: '#fff' },
  infoBox: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    padding: 16,
  },
  infoText: { fontSize: 13, color: COLORS.primary, lineHeight: 20 },
});
