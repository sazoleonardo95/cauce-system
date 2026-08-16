import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { COLORS } from '../lib/utils';

export default function WarehousesScreen() {
  const { user } = useAuth();
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', address: '' });

  const canManage = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  useFocusEffect(
    useCallback(() => {
      loadWarehouses();
    }, [search])
  );

  const loadWarehouses = async () => {
    try {
      const data = await api.getWarehouses();
      setWarehouses(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las bodegas');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', code: '', address: '' });
    setShowModal(true);
  };

  const openEdit = (wh) => {
    setEditing(wh);
    setForm({
      name: wh.name || '',
      code: wh.code || '',
      address: wh.address || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }
    if (!form.code.trim()) {
      Alert.alert('Error', 'El codigo es obligatorio');
      return;
    }
    try {
      if (editing) {
        await api.updateWarehouse(editing.id, form);
        Alert.alert('Exito', 'Bodega actualizada');
      } else {
        await api.createWarehouse(form);
        Alert.alert('Exito', 'Bodega creada');
      }
      setShowModal(false);
      loadWarehouses();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDelete = (wh) => {
    Alert.alert('Eliminar bodega', `Eliminar "${wh.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteWarehouse(wh.id);
            loadWarehouses();
          } catch (error) {
            Alert.alert('Error', error.message);
          }
        },
      },
    ]);
  };

  const filteredWarehouses = warehouses.filter(
    (wh) =>
      wh.name.toLowerCase().includes(search.toLowerCase()) ||
      wh.code.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => openEdit(item)}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.code?.[0] || 'B'}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{item.name}</Text>
          <Text style={styles.cardCode}>{item.code}</Text>
        </View>
        {canManage && (
          <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
            <Text style={styles.deleteBtnText}>X</Text>
          </TouchableOpacity>
        )}
      </View>
      {item.address ? (
        <View style={styles.cardFooter}>
          <Text style={styles.addressText}>{item.address}</Text>
        </View>
      ) : null}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{item.totalProducts || 0}</Text>
          <Text style={styles.statLabel}>Productos</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{item.totalItems || 0}</Text>
          <Text style={styles.statLabel}>Unidades</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statValue, item.lowStockItems > 0 && { color: COLORS.danger }]}>
            {item.lowStockItems || 0}
          </Text>
          <Text style={styles.statLabel}>Bajo stock</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar bodegas..."
            placeholderTextColor={COLORS.gray[400]}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        {canManage && (
          <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredWarehouses}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No hay bodegas</Text>
              <Text style={styles.emptySubtitle}>
                {canManage ? 'Toca + para crear una bodega' : 'No hay bodegas disponibles'}
              </Text>
            </View>
          }
        />
      )}

      {/* Create/Edit Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.modalCancel}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editing ? 'Editar Bodega' : 'Nueva Bodega'}</Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.modalSave}>Guardar</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nombre *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre de la bodega"
                placeholderTextColor={COLORS.gray[400]}
                value={form.name}
                onChangeText={(t) => setForm({ ...form, name: t })}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Codigo *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: BOD-01"
                placeholderTextColor={COLORS.gray[400]}
                value={form.code}
                onChangeText={(t) => setForm({ ...form, code: t.toUpperCase() })}
                autoCapitalize="characters"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Direccion</Text>
              <TextInput
                style={styles.input}
                placeholder="Direccion de la bodega"
                placeholderTextColor={COLORS.gray[400]}
                value={form.address}
                onChangeText={(t) => setForm({ ...form, address: t })}
              />
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
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
    gap: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 16, color: COLORS.gray[900] },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: { fontSize: 24, color: '#fff', fontWeight: '600', marginTop: -2 },
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
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.warningLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 16, fontWeight: 'bold', color: COLORS.warning || '#F59E0B' },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '600', color: COLORS.gray[900] },
  cardCode: { fontSize: 12, color: COLORS.gray[500], marginTop: 2 },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.dangerLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtnText: { fontSize: 12, fontWeight: '600', color: COLORS.danger },
  cardFooter: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
  addressText: { fontSize: 13, color: COLORS.gray[600] },
  statsRow: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
    gap: 16,
  },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: 'bold', color: COLORS.gray[900] },
  statLabel: { fontSize: 11, color: COLORS.gray[500], marginTop: 2 },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: COLORS.gray[700] },
  emptySubtitle: { fontSize: 14, color: COLORS.gray[500], marginTop: 4 },
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
  formGroup: { marginBottom: 20 },
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
});
