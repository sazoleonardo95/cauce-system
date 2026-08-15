import React, { useState, useEffect } from 'react';
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
import { api } from '../lib/api';
import { COLORS } from '../lib/utils';

export default function InventoryScreen() {
  const [items, setItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdjust, setShowAdjust] = useState(false);
  const [adjustForm, setAdjustForm] = useState({
    productId: '',
    warehouseId: '',
    type: 'ENTRY',
    quantity: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [inv, wh] = await Promise.all([
        api.getInventory(),
        api.getWarehouses(),
      ]);
      setItems(inv);
      setWarehouses(wh);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el inventario');
    } finally {
      setLoading(false);
    }
  };

  const handleAdjust = async () => {
    if (!adjustForm.productId || !adjustForm.warehouseId || !adjustForm.quantity) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }

    try {
      await api.adjustStock({
        ...adjustForm,
        quantity: parseInt(adjustForm.quantity),
      });
      Alert.alert('Exito', 'Stock ajustado');
      setShowAdjust(false);
      setAdjustForm({ productId: '', warehouseId: '', type: 'ENTRY', quantity: '', notes: '' });
      loadData();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const totalProducts = items.length;
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const lowStockCount = items.filter((i) => i.quantity <= (i.product?.minStock || 0)).length;

  const renderItem = ({ item }) => {
    const isLow = item.quantity <= (item.product?.minStock || 0);
    return (
      <View style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <View style={styles.itemIcon}>
            <Text style={styles.itemIconText}>{item.product?.name?.[0]}</Text>
          </View>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.product?.name}</Text>
            <Text style={styles.itemSku}>SKU: {item.product?.sku}</Text>
          </View>
          <View style={[
            styles.stockBadge,
            isLow ? styles.stockBadgeLow : styles.stockBadgeNormal,
          ]}>
            <Text style={[
              styles.stockText,
              isLow ? styles.stockTextLow : styles.stockTextNormal,
            ]}>
              {item.quantity}
            </Text>
          </View>
        </View>
        <View style={styles.itemFooter}>
          <Text style={styles.warehouseText}>📍 {item.warehouse?.name}</Text>
          <Text style={styles.minStockText}>Min: {item.product?.minStock}</Text>
          {isLow && <View style={styles.alertBadge}><Text style={styles.alertText}>STOCK BAJO</Text></View>}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.adjustBtn} onPress={() => setShowAdjust(true)}>
          <Text style={styles.adjustBtnText}>+ Ajustar</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalProducts}</Text>
          <Text style={styles.statLabel}>Productos</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalItems}</Text>
          <Text style={styles.statLabel}>Unidades</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, lowStockCount > 0 && styles.statValueDanger]}>{lowStockCount}</Text>
          <Text style={styles.statLabel}>Stock Bajo</Text>
        </View>
      </View>

      {/* Inventory List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Sin datos de inventario</Text>
            </View>
          }
        />
      )}

      {/* Adjust Stock Modal */}
      <Modal visible={showAdjust} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAdjust(false)}>
              <Text style={styles.modalCancel}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Ajustar Stock</Text>
            <TouchableOpacity onPress={handleAdjust}>
              <Text style={styles.modalSave}>Aplicar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Tipo de movimiento</Text>
              <View style={styles.typeRow}>
                {['ENTRY', 'EXIT', 'ADJUSTMENT'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeBtn,
                      adjustForm.type === type && styles.typeBtnActive,
                    ]}
                    onPress={() => setAdjustForm({ ...adjustForm, type })}
                  >
                    <Text style={[
                      styles.typeBtnText,
                      adjustForm.type === type && styles.typeBtnTextActive,
                    ]}>
                      {type === 'ENTRY' ? 'Entrada' : type === 'EXIT' ? 'Salida' : 'Ajuste'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Bodega</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {warehouses.map((wh) => (
                  <TouchableOpacity
                    key={wh.id}
                    style={[
                      styles.warehouseBtn,
                      adjustForm.warehouseId === wh.id && styles.warehouseBtnActive,
                    ]}
                    onPress={() => setAdjustForm({ ...adjustForm, warehouseId: wh.id })}
                  >
                    <Text style={[
                      styles.warehouseBtnText,
                      adjustForm.warehouseId === wh.id && styles.warehouseBtnTextActive,
                    ]}>
                      {wh.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Cantidad</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={COLORS.gray[400]}
                keyboardType="numeric"
                value={adjustForm.quantity}
                onChangeText={(text) => setAdjustForm({ ...adjustForm, quantity: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Notas (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Agregar notas..."
                placeholderTextColor={COLORS.gray[400]}
                value={adjustForm.notes}
                onChangeText={(text) => setAdjustForm({ ...adjustForm, notes: text })}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  adjustBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  adjustBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.gray[900],
  },
  statValueDanger: {
    color: COLORS.danger,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.gray[200],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  itemCard: {
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
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemIconText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray[900],
  },
  itemSku: {
    fontSize: 12,
    color: COLORS.gray[500],
  },
  stockBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  stockBadgeNormal: { backgroundColor: COLORS.successLight },
  stockBadgeLow: { backgroundColor: COLORS.dangerLight },
  stockText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  stockTextNormal: { color: COLORS.success },
  stockTextLow: { color: COLORS.danger },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
    gap: 8,
  },
  warehouseText: {
    fontSize: 12,
    color: COLORS.gray[500],
  },
  minStockText: {
    fontSize: 12,
    color: COLORS.gray[400],
  },
  alertBadge: {
    backgroundColor: COLORS.danger,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  alertText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray[500],
  },
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  modalCancel: {
    fontSize: 16,
    color: COLORS.gray[500],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray[900],
  },
  modalSave: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray[700],
    marginBottom: 12,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.gray[100],
    alignItems: 'center',
  },
  typeBtnActive: {
    backgroundColor: COLORS.primary,
  },
  typeBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray[600],
  },
  typeBtnTextActive: {
    color: '#fff',
  },
  warehouseBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.gray[100],
    marginRight: 8,
  },
  warehouseBtnActive: {
    backgroundColor: COLORS.primary,
  },
  warehouseBtnText: {
    fontSize: 14,
    color: COLORS.gray[600],
  },
  warehouseBtnTextActive: {
    color: '#fff',
  },
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
