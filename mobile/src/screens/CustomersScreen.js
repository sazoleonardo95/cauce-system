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
import { api } from '../lib/api';
import { COLORS } from '../lib/utils';

export default function CustomersScreen() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', taxId: '', notes: '' });

  useFocusEffect(
    useCallback(() => {
      loadCustomers();
    }, [search])
  );

  const loadCustomers = async () => {
    try {
      const data = await api.getCustomers({ search, limit: 100 });
      setCustomers(data.customers);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', email: '', phone: '', address: '', taxId: '', notes: '' });
    setShowModal(true);
  };

  const openEdit = (customer) => {
    setEditing(customer);
    setForm({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      taxId: customer.taxId || '',
      notes: customer.notes || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }
    if (saving) return;
    setSaving(true);
    try {
      if (editing) {
        await api.updateCustomer(editing.id, form);
        Alert.alert('\u00C9xito', 'Cliente actualizado');
      } else {
        await api.createCustomer(form);
        Alert.alert('\u00C9xito', 'Cliente creado');
      }
      setShowModal(false);
      loadCustomers();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (customer) => {
    Alert.alert('Eliminar cliente', `Eliminar a "${customer.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteCustomer(customer.id);
            loadCustomers();
          } catch (error) {
            Alert.alert('Error', error.message);
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => openEdit(item)}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name[0]?.toUpperCase()}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{item.name}</Text>
          {item.email ? <Text style={styles.cardEmail}>{item.email}</Text> : null}
        </View>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
          <Text style={styles.deleteBtnText}>X</Text>
        </TouchableOpacity>
      </View>
      {item.phone ? (
        <View style={styles.cardFooter}>
          <Text style={styles.phoneText}>{item.phone}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar clientes..."
            placeholderTextColor={COLORS.gray[400]}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={customers}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hay clientes registrados</Text>
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
            <Text style={styles.modalTitle}>{editing ? 'Editar Cliente' : 'Nuevo Cliente'}</Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.modalSave}>Guardar</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nombre *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre del cliente"
                placeholderTextColor={COLORS.gray[400]}
                value={form.name}
                onChangeText={(t) => setForm({ ...form, name: t })}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="email@ejemplo.com"
                placeholderTextColor={COLORS.gray[400]}
                keyboardType="email-address"
                value={form.email}
                onChangeText={(t) => setForm({ ...form, email: t })}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Telefono</Text>
              <TextInput
                style={styles.input}
                placeholder="+57 300 123 4567"
                placeholderTextColor={COLORS.gray[400]}
                keyboardType="phone-pad"
                value={form.phone}
                onChangeText={(t) => setForm({ ...form, phone: t })}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Direccion</Text>
              <TextInput
                style={styles.input}
                placeholder="Direccion"
                placeholderTextColor={COLORS.gray[400]}
                value={form.address}
                onChangeText={(t) => setForm({ ...form, address: t })}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>NIT / RUT</Text>
              <TextInput
                style={styles.input}
                placeholder="123456789-0"
                placeholderTextColor={COLORS.gray[400]}
                value={form.taxId}
                onChangeText={(t) => setForm({ ...form, taxId: t })}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Notas</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Notas adicionales..."
                placeholderTextColor={COLORS.gray[400]}
                multiline
                value={form.notes}
                onChangeText={(t) => setForm({ ...form, notes: t })}
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
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '600', color: COLORS.gray[900] },
  cardEmail: { fontSize: 12, color: COLORS.gray[500], marginTop: 2 },
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
  phoneText: { fontSize: 13, color: COLORS.gray[600] },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 16, color: COLORS.gray[500] },
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
