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
import { api } from '../lib/api';
import { formatCurrency, formatDate, COLORS } from '../lib/utils';

export default function SalesScreen() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewSale, setShowNewSale] = useState(false);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [taxRate, setTaxRate] = useState('16');
  const [productSearch, setProductSearch] = useState('');
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);
  const [showWarehousePicker, setShowWarehousePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadSales();
    }, [])
  );

  const loadSales = async () => {
    try {
      const data = await api.getSales({ limit: 50 });
      setSales(data.sales);
    } catch (error) {
      console.error('Error loading sales:', error);
      Alert.alert('Error', 'No se pudieron cargar las ventas');
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      const [p, c, w] = await Promise.all([
        api.getProducts({ limit: 200 }),
        api.getCustomers({ limit: 100 }),
        api.getWarehouses(),
      ]);
      setProducts(p.products);
      setCustomers(c.customers);
      setWarehouses(w);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos para la venta');
    }
  };

  const filteredProducts = productSearch
    ? products.filter((p) => p.name.toLowerCase().includes(productSearch.toLowerCase()))
    : products;

  const addItem = (product) => {
    const existing = selectedItems.find((i) => i.productId === product.id);
    if (existing) {
      setSelectedItems(
        selectedItems.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          productId: product.id,
          name: product.name,
          unitPrice: product.price,
          quantity: 1,
          discount: 0,
        },
      ]);
    }
  };

  const removeItem = (productId) => {
    setSelectedItems(selectedItems.filter((i) => i.productId !== productId));
  };

  const updateQuantity = (productId, qty) => {
    if (qty < 1) {
      removeItem(productId);
      return;
    }
    setSelectedItems(
      selectedItems.map((i) =>
        i.productId === productId ? { ...i, quantity: qty } : i
      )
    );
  };

  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity - item.discount,
    0
  );
  const taxAmount = subtotal * (parseFloat(taxRate) || 0) / 100;
  const total = subtotal + taxAmount;

  const handleCreateSale = async () => {
    if (selectedItems.length === 0) {
      Alert.alert('Error', 'Agrega al menos un producto');
      return;
    }
    if (!selectedWarehouse) {
      Alert.alert('Error', 'Selecciona una bodega para descontar inventario');
      return;
    }
    if (saving) return;
    setSaving(true);
    try {
      await api.createSale({
        customerId: selectedCustomer,
        warehouseId: selectedWarehouse,
        items: selectedItems.map(({ productId, quantity, unitPrice, discount }) => ({
          productId,
          quantity,
          unitPrice,
          discount,
        })),
        taxRate: parseFloat(taxRate) || 0,
        paymentMethod,
      });
      Alert.alert('\u00C9xito', 'Venta registrada');
      setShowNewSale(false);
      setSelectedItems([]);
      setSelectedCustomer(null);
      setSelectedWarehouse(null);
      setPaymentMethod('cash');
      loadSales();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setSaving(false);
    }
  };

  const selectedCustomerName = customers.find((c) => c.id === selectedCustomer)?.name || 'Sin cliente';
  const selectedWarehouseName = warehouses.find((w) => w.id === selectedWarehouse)?.name || 'Sin bodega';

  const renderSale = ({ item }) => (
    <View style={styles.saleCard}>
      <View style={styles.saleHeader}>
        <Text style={styles.saleNumber}>{item.saleNumber}</Text>
        <View style={[
          styles.statusBadge,
          item.status === 'COMPLETED' && styles.statusCompleted,
          item.status === 'CANCELLED' && styles.statusCancelled,
        ]}>
          <Text style={styles.statusText}>{item.status === 'COMPLETED' ? 'Completada' : item.status === 'CANCELLED' ? 'Cancelada' : item.status === 'PENDING' ? 'Pendiente' : item.status}</Text>
        </View>
      </View>
      <View style={styles.saleBody}>
        <Text style={styles.saleSeller}>{item.seller?.firstName} {item.seller?.lastName}</Text>
        <Text style={styles.saleCustomer}>{item.customer?.name || 'Sin cliente'}</Text>
        <Text style={styles.saleDate}>{formatDate(item.saleDate)}</Text>
      </View>
      <View style={styles.saleFooter}>
        <Text style={styles.saleTotal}>{formatCurrency(item.total)}</Text>
        <Text style={styles.saleItems}>{item.items?.length || 0} {item.items?.length === 1 ? 'producto' : 'productos'}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ventas</Text>
        <TouchableOpacity style={styles.newSaleBtn} onPress={() => { loadData(); setShowNewSale(true); }}>
          <Text style={styles.newSaleBtnText}>+ Nueva</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={sales}
          keyExtractor={(item) => item.id}
          renderItem={renderSale}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hay ventas registradas</Text>
            </View>
          }
        />
      )}

      {/* New Sale Modal */}
      <Modal visible={showNewSale} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowNewSale(false)}>
              <Text style={styles.modalCancel}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Nueva Venta</Text>
            <TouchableOpacity onPress={handleCreateSale}>
              <Text style={styles.modalSave}>Guardar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Customer Picker */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cliente</Text>
              <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowCustomerPicker(true)}>
                <Text style={[styles.pickerText, !selectedCustomer && styles.pickerPlaceholder]}>
                  {selectedCustomerName}
                </Text>
                <Text style={styles.pickerArrow}>&#8250;</Text>
              </TouchableOpacity>
            </View>

            {/* Warehouse Picker */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bodega</Text>
              <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowWarehousePicker(true)}>
                <Text style={[styles.pickerText, !selectedWarehouse && styles.pickerPlaceholder]}>
                  {selectedWarehouseName}
                </Text>
                <Text style={styles.pickerArrow}>&#8250;</Text>
              </TouchableOpacity>
            </View>

            {/* Payment Method */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Metodo de pago</Text>
              <View style={styles.paymentRow}>
                {[
                  { key: 'cash', label: 'Efectivo' },
                  { key: 'card', label: 'Tarjeta' },
                  { key: 'transfer', label: 'Transferencia' },
                  { key: 'credit', label: 'Credito' },
                ].map((m) => (
                  <TouchableOpacity
                    key={m.key}
                    style={[styles.paymentBtn, paymentMethod === m.key && styles.paymentBtnActive]}
                    onPress={() => setPaymentMethod(m.key)}
                  >
                    <Text style={[styles.paymentBtnText, paymentMethod === m.key && styles.paymentBtnTextActive]}>
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Selected Items */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Productos ({selectedItems.length})</Text>
              {selectedItems.map((item) => (
                <View key={item.productId} style={styles.selectedItem}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>{formatCurrency(item.unitPrice)}</Text>
                  </View>
                  <View style={styles.itemControls}>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.productId, item.quantity - 1)}>
                      <Text style={styles.qtyBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.productId, item.quantity + 1)}>
                      <Text style={styles.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.removeBtn} onPress={() => removeItem(item.productId)}>
                      <Text style={styles.removeBtnText}>X</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            {/* Add Products */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Agregar Producto</Text>
              <TextInput
                style={styles.productSearchInput}
                placeholder="Buscar producto..."
                placeholderTextColor={COLORS.gray[400]}
                value={productSearch}
                onChangeText={setProductSearch}
              />
              <View style={styles.productGrid}>
                {filteredProducts.slice(0, 30).map((product) => (
                  <TouchableOpacity key={product.id} style={styles.productChip} onPress={() => addItem(product)}>
                    <Text style={styles.productChipName} numberOfLines={1}>{product.name}</Text>
                    <Text style={styles.productChipPrice}>{formatCurrency(product.price)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Summary */}
            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>IVA ({taxRate}%)</Text>
                <Text style={styles.summaryValue}>{formatCurrency(taxAmount)}</Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryTotal]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Customer Picker Modal */}
      <Modal visible={showCustomerPicker} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCustomerPicker(false)}>
              <Text style={styles.modalCancel}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Seleccionar Cliente</Text>
            <View style={{ width: 60 }} />
          </View>
          <FlatList
            data={[{ id: null, name: 'Sin cliente' }, ...customers]}
            keyExtractor={(item) => item.id || 'none'}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.pickerItem, selectedCustomer === item.id && styles.pickerItemActive]}
                onPress={() => { setSelectedCustomer(item.id); setShowCustomerPicker(false); }}
              >
                <Text style={[styles.pickerItemText, selectedCustomer === item.id && styles.pickerItemTextActive]}>
                  {item.name}
                </Text>
                {item.phone ? <Text style={styles.pickerItemSub}>{item.phone}</Text> : null}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>

      {/* Warehouse Picker Modal */}
      <Modal visible={showWarehousePicker} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowWarehousePicker(false)}>
              <Text style={styles.modalCancel}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Seleccionar Bodega</Text>
            <View style={{ width: 60 }} />
          </View>
          <FlatList
            data={warehouses}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.pickerItem, selectedWarehouse === item.id && styles.pickerItemActive]}
                onPress={() => { setSelectedWarehouse(item.id); setShowWarehousePicker(false); }}
              >
                <Text style={[styles.pickerItemText, selectedWarehouse === item.id && styles.pickerItemTextActive]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray[50] },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.gray[900] },
  newSaleBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  newSaleBtnText: { color: '#fff', fontWeight: '600' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  saleCard: {
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
  saleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  saleNumber: { fontSize: 12, fontFamily: 'monospace', color: COLORS.gray[500] },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  statusCompleted: { backgroundColor: COLORS.successLight },
  statusCancelled: { backgroundColor: COLORS.dangerLight },
  statusText: { fontSize: 10, fontWeight: '600', color: COLORS.gray[700] },
  saleBody: { marginBottom: 8 },
  saleSeller: { fontSize: 14, fontWeight: '600', color: COLORS.gray[900] },
  saleCustomer: { fontSize: 12, color: COLORS.gray[500] },
  saleDate: { fontSize: 12, color: COLORS.gray[400], marginTop: 4 },
  saleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
    paddingTop: 8,
  },
  saleTotal: { fontSize: 16, fontWeight: 'bold', color: COLORS.gray[900] },
  saleItems: { fontSize: 12, color: COLORS.gray[500] },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 16, color: COLORS.gray[500] },
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
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: COLORS.gray[700], marginBottom: 12 },
  // Picker
  pickerBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  pickerText: { fontSize: 16, color: COLORS.gray[900] },
  pickerPlaceholder: { color: COLORS.gray[400] },
  pickerArrow: { fontSize: 20, color: COLORS.gray[400] },
  // Payment
  paymentRow: { flexDirection: 'row', gap: 8 },
  paymentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.gray[100],
    alignItems: 'center',
  },
  paymentBtnActive: { backgroundColor: COLORS.primary },
  paymentBtnText: { fontSize: 12, fontWeight: '500', color: COLORS.gray[600] },
  paymentBtnTextActive: { color: '#fff' },
  // Items
  selectedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '500', color: COLORS.gray[900] },
  itemPrice: { fontSize: 12, color: COLORS.gray[500] },
  itemControls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.gray[700] },
  qtyText: { fontSize: 14, fontWeight: '600', minWidth: 20, textAlign: 'center' },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.dangerLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtnText: { fontSize: 12, fontWeight: '600', color: COLORS.danger },
  // Product grid
  productSearchInput: {
    backgroundColor: COLORS.gray[50],
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.gray[900],
    marginBottom: 12,
  },
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  productChip: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 10,
    padding: 10,
    width: '30%',
    minWidth: 90,
  },
  productChipName: { fontSize: 11, fontWeight: '500', color: COLORS.primary, marginBottom: 4 },
  productChipPrice: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  summary: { backgroundColor: COLORS.gray[50], borderRadius: 12, padding: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: COLORS.gray[600] },
  summaryValue: { fontSize: 14, color: COLORS.gray[900] },
  summaryTotal: { borderTopWidth: 1, borderTopColor: COLORS.gray[200], paddingTop: 8, marginTop: 8 },
  totalLabel: { fontSize: 16, fontWeight: '600', color: COLORS.gray[900] },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
  // Picker modal items
  pickerItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  pickerItemActive: { backgroundColor: COLORS.primaryLight },
  pickerItemText: { fontSize: 16, color: COLORS.gray[900] },
  pickerItemTextActive: { color: COLORS.primary, fontWeight: '600' },
  pickerItemSub: { fontSize: 13, color: COLORS.gray[500], marginTop: 4 },
});
