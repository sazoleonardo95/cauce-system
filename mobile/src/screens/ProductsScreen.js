import React, { useState, useEffect } from 'react';
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
import { api } from '../lib/api';
import { formatCurrency, COLORS } from '../lib/utils';

export default function ProductsScreen() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '', sku: '', price: '', cost: '', category: '', description: '', minStock: '',
  });

  useEffect(() => {
    loadProducts();
  }, [search]);

  const loadProducts = async () => {
    try {
      const data = await api.getProducts({ search, limit: 100 });
      setProducts(data.products);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', sku: '', price: '', cost: '', category: '', description: '', minStock: '' });
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name || '',
      sku: product.sku || '',
      price: String(product.price || ''),
      cost: String(product.cost || ''),
      category: product.category || '',
      description: product.description || '',
      minStock: String(product.minStock || ''),
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) {
      Alert.alert('Error', 'Nombre y precio son obligatorios');
      return;
    }
    try {
      const data = {
        name: form.name,
        sku: form.sku || `SKU-${Date.now()}`,
        price: parseFloat(form.price) || 0,
        category: form.category || undefined,
        description: form.description || undefined,
        minStock: form.minStock ? parseInt(form.minStock) : 0,
      };
      if (form.cost && parseFloat(form.cost) > 0) {
        data.cost = parseFloat(form.cost);
      }
      if (editing) {
        await api.updateProduct(editing.id, data);
        Alert.alert('Exito', 'Producto actualizado');
      } else {
        await api.createProduct(data);
        Alert.alert('Exito', 'Producto creado');
      }
      setShowModal(false);
      loadProducts();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDelete = (product) => {
    Alert.alert('Eliminar producto', `Eliminar "${product.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteProduct(product.id);
            loadProducts();
          } catch (error) {
            Alert.alert('Error', error.message);
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.productCard} onPress={() => openEdit(item)}>
      <View style={styles.productHeader}>
        <View style={styles.productIcon}>
          <Text style={styles.productIconText}>{item.name[0]}</Text>
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productSku}>SKU: {item.sku}</Text>
        </View>
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>{formatCurrency(item.price)}</Text>
        </View>
      </View>
      <View style={styles.productFooter}>
        {item.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        )}
        <View style={styles.stockInfo}>
          <Text style={[
            styles.stockText,
            item.totalStock <= (item.minStock || 0) && styles.stockLow,
            item.totalStock > (item.minStock || 0) * 2 && styles.stockGood,
          ]}>
            Stock: {item.totalStock}
          </Text>
        </View>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
          <Text style={styles.deleteBtnText}>X</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar productos..."
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
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No se encontraron productos</Text>
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
            <Text style={styles.modalTitle}>{editing ? 'Editar Producto' : 'Nuevo Producto'}</Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.modalSave}>Guardar</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nombre *</Text>
              <TextInput style={styles.input} placeholder="Nombre del producto" placeholderTextColor={COLORS.gray[400]} value={form.name} onChangeText={(t) => setForm({ ...form, name: t })} />
            </View>
            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.formLabel}>SKU</Text>
                <TextInput style={styles.input} placeholder="Auto-generado" placeholderTextColor={COLORS.gray[400]} value={form.sku} onChangeText={(t) => setForm({ ...form, sku: t })} />
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.formLabel}>Categoria</Text>
                <TextInput style={styles.input} placeholder="Ej: Electronica" placeholderTextColor={COLORS.gray[400]} value={form.category} onChangeText={(t) => setForm({ ...form, category: t })} />
              </View>
            </View>
            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.formLabel}>Precio de venta *</Text>
                <TextInput style={styles.input} placeholder="0.00" placeholderTextColor={COLORS.gray[400]} keyboardType="decimal-pad" value={form.price} onChangeText={(t) => setForm({ ...form, price: t })} />
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.formLabel}>Costo</Text>
                <TextInput style={styles.input} placeholder="0.00" placeholderTextColor={COLORS.gray[400]} keyboardType="decimal-pad" value={form.cost} onChangeText={(t) => setForm({ ...form, cost: t })} />
              </View>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Stock minimo</Text>
              <TextInput style={styles.input} placeholder="0" placeholderTextColor={COLORS.gray[400]} keyboardType="numeric" value={form.minStock} onChangeText={(t) => setForm({ ...form, minStock: t })} />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Descripcion</Text>
              <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} placeholder="Descripcion del producto..." placeholderTextColor={COLORS.gray[400]} multiline value={form.description} onChangeText={(t) => setForm({ ...form, description: t })} />
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
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  productHeader: { flexDirection: 'row', alignItems: 'center' },
  productIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  productIconText: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
  productInfo: { flex: 1 },
  productName: { fontSize: 16, fontWeight: '600', color: COLORS.gray[900] },
  productSku: { fontSize: 12, color: COLORS.gray[500], marginTop: 2 },
  priceBadge: {
    backgroundColor: COLORS.successLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  priceText: { fontSize: 14, fontWeight: '600', color: COLORS.success },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
  categoryBadge: {
    backgroundColor: COLORS.gray[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: { fontSize: 12, color: COLORS.gray[600] },
  stockText: { fontSize: 12, fontWeight: '500', color: COLORS.gray[700] },
  stockLow: { color: COLORS.danger },
  stockGood: { color: COLORS.success },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.dangerLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtnText: { fontSize: 12, fontWeight: '600', color: COLORS.danger },
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
  formRow: { flexDirection: 'row' },
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
