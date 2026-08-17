import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { formatCurrency, COLORS } from '../lib/utils';

export default function DashboardScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  const loadStats = async () => {
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
      Alert.alert('Error', 'No se pudieron cargar las estadisticas');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  if (!stats) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando...</Text>
        <TouchableOpacity onPress={loadStats} style={{ marginTop: 16, padding: 12, backgroundColor: COLORS.primaryLight, borderRadius: 8 }}>
          <Text style={{ color: COLORS.primary, fontWeight: '600' }}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const role = stats.role;

  const renderAdminManager = () => (
    <>
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: COLORS.primaryLight }]}>
          <Text style={styles.statLabel}>Ventas Hoy</Text>
          <Text style={[styles.statValue, { color: COLORS.primary }]}>{formatCurrency(stats.today.sales)}</Text>
          <Text style={styles.statCount}>{stats.today.count} transacciones</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: COLORS.successLight }]}>
          <Text style={styles.statLabel}>Ventas Mes</Text>
          <Text style={[styles.statValue, { color: COLORS.success }]}>{formatCurrency(stats.month.sales)}</Text>
          <Text style={styles.statCount}>{stats.month.count} transacciones</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: COLORS.warningLight }]}>
          <Text style={styles.statLabel}>Productos</Text>
          <Text style={[styles.statValue, { color: COLORS.warning }]}>{stats.totals.products}</Text>
          <Text style={styles.statCount}>{stats.totals.lowStockCount} stock bajo</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#F3E8FF' }]}>
          <Text style={styles.statLabel}>Vendedores</Text>
          <Text style={[styles.statValue, { color: '#9333EA' }]}>{stats.totals.sellers}</Text>
          <Text style={styles.statCount}>{stats.totals.customers} clientes</Text>
        </View>
      </View>

      {stats.topSellers.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Vendedores</Text>
          <View style={styles.card}>
            {stats.topSellers.map((seller, index) => (
              <View key={seller.id} style={styles.sellerItem}>
                <View style={[
                  styles.rankBadge,
                  index === 0 && styles.rankGold,
                  index === 1 && styles.rankSilver,
                  index === 2 && styles.rankBronze,
                ]}>
                  <Text style={styles.rankText}>{index + 1}</Text>
                </View>
                <View style={styles.sellerInfo}>
                  <Text style={styles.sellerName}>{seller.firstName} {seller.lastName}</Text>
                  <Text style={styles.sellerCount}>{seller._count.sales} ventas</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ultimas Ventas</Text>
        <View style={styles.card}>
          {stats.recentSales.slice(0, 5).map((sale) => (
            <View key={sale.id} style={styles.saleItem}>
              <View style={styles.saleInfo}>
                <Text style={styles.saleSeller}>{sale.seller?.firstName} {sale.seller?.lastName}</Text>
                <Text style={styles.saleCustomer}>{sale.customer?.name || 'Sin cliente'}</Text>
              </View>
              <View style={styles.saleRight}>
                <Text style={styles.saleTotal}>{formatCurrency(sale.total)}</Text>
                <View style={[
                  styles.statusBadge,
                  sale.status === 'COMPLETED' && styles.statusCompleted,
                  sale.status === 'CANCELLED' && styles.statusCancelled,
                ]}>
                  <Text style={styles.statusText}>{sale.status === 'COMPLETED' ? 'Completada' : sale.status === 'CANCELLED' ? 'Cancelada' : 'Pendiente'}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {stats.lowStockItems.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stock Bajo</Text>
          <View style={styles.card}>
            {stats.lowStockItems.slice(0, 5).map((item, index) => (
              <View key={index} style={styles.stockItem}>
                <View>
                  <Text style={styles.stockName}>{item.productName}</Text>
                  {item.warehouse ? <Text style={styles.stockWarehouse}>{item.warehouse}</Text> : null}
                </View>
                <View style={styles.stockBadge}>
                  <Text style={styles.stockText}>{item.quantity} uds</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </>
  );

  const renderSeller = () => (
    <>
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: COLORS.primaryLight }]}>
          <Text style={styles.statLabel}>Mis Ventas Hoy</Text>
          <Text style={[styles.statValue, { color: COLORS.primary }]}>{formatCurrency(stats.today.sales)}</Text>
          <Text style={styles.statCount}>{stats.today.count} ventas</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: COLORS.successLight }]}>
          <Text style={styles.statLabel}>Mis Ventas Mes</Text>
          <Text style={[styles.statValue, { color: COLORS.success }]}>{formatCurrency(stats.month.sales)}</Text>
          <Text style={styles.statCount}>{stats.month.count} ventas</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: COLORS.warningLight }]}>
          <Text style={styles.statLabel}>Esta Semana</Text>
          <Text style={[styles.statValue, { color: COLORS.warning }]}>{formatCurrency(stats.week.sales)}</Text>
          <Text style={styles.statCount}>{stats.week.count} ventas</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#F3E8FF' }]}>
          <Text style={styles.statLabel}>Comisiones</Text>
          <Text style={[styles.statValue, { color: '#9333EA' }]}>{formatCurrency(stats.totals.pendingCommissions)}</Text>
          <Text style={styles.statCount}>pendientes</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mis Ventas Recientes</Text>
        <View style={styles.card}>
          {stats.recentSales.length === 0 ? (
            <Text style={styles.emptyText}>No tienes ventas registradas</Text>
          ) : (
            stats.recentSales.slice(0, 5).map((sale) => (
              <View key={sale.id} style={styles.saleItem}>
                <View style={styles.saleInfo}>
                  <Text style={styles.saleCustomer}>{sale.customer?.name || 'Sin cliente'}</Text>
                  <Text style={styles.saleDate}>{new Date(sale.saleDate).toLocaleDateString('es-CO')}</Text>
                </View>
                <View style={styles.saleRight}>
                  <Text style={styles.saleTotal}>{formatCurrency(sale.total)}</Text>
                  <View style={[
                    styles.statusBadge,
                    sale.status === 'COMPLETED' && styles.statusCompleted,
                    sale.status === 'CANCELLED' && styles.statusCancelled,
                  ]}>
                    <Text style={styles.statusText}>{sale.status === 'COMPLETED' ? 'Completada' : sale.status === 'CANCELLED' ? 'Cancelada' : 'Pendiente'}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    </>
  );

  const renderWarehouse = () => (
    <>
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: COLORS.primaryLight }]}>
          <Text style={styles.statLabel}>Total Productos</Text>
          <Text style={[styles.statValue, { color: COLORS.primary }]}>{stats.totals.products}</Text>
          <Text style={styles.statCount}>en inventario</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: COLORS.dangerLight }]}>
          <Text style={styles.statLabel}>Stock Bajo</Text>
          <Text style={[styles.statValue, { color: COLORS.danger }]}>{stats.totals.lowStockCount}</Text>
          <Text style={styles.statCount}>productos</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: COLORS.warningLight }]}>
          <Text style={styles.statLabel}>Bodegas</Text>
          <Text style={[styles.statValue, { color: COLORS.warning }]}>{stats.warehouseStats.length}</Text>
          <Text style={styles.statCount}>activas</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: COLORS.successLight }]}>
          <Text style={styles.statLabel}>Ventas Hoy</Text>
          <Text style={[styles.statValue, { color: COLORS.success }]}>{formatCurrency(stats.today.sales)}</Text>
          <Text style={styles.statCount}>{stats.today.count} transacciones</Text>
        </View>
      </View>

      {stats.warehouseStats.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mis Bodegas</Text>
          <View style={styles.card}>
            {stats.warehouseStats.map((wh, index) => (
              <View key={index} style={styles.saleItem}>
                <View style={styles.saleInfo}>
                  <Text style={styles.sellerName}>{wh.name}</Text>
                  <Text style={styles.sellerCount}>{wh.totalProducts} productos</Text>
                </View>
                <View style={styles.saleRight}>
                  <Text style={styles.saleTotal}>{wh.totalItems} uds</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {stats.lowStockItems.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stock Bajo</Text>
          <View style={styles.card}>
            {stats.lowStockItems.slice(0, 10).map((item, index) => (
              <View key={index} style={styles.stockItem}>
                <View>
                  <Text style={styles.stockName}>{item.productName}</Text>
                  {item.warehouse ? <Text style={styles.stockWarehouse}>{item.warehouse}</Text> : null}
                </View>
                <View style={styles.stockBadge}>
                  <Text style={styles.stockText}>{item.quantity} uds</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ventas Recientes</Text>
        <View style={styles.card}>
          {stats.recentSales.slice(0, 5).map((sale) => (
            <View key={sale.id} style={styles.saleItem}>
              <View style={styles.saleInfo}>
                <Text style={styles.saleSeller}>{sale.seller?.firstName} {sale.seller?.lastName}</Text>
                <Text style={styles.saleCustomer}>{sale.customer?.name || 'Sin cliente'}</Text>
              </View>
              <View style={styles.saleRight}>
                <Text style={styles.saleTotal}>{formatCurrency(sale.total)}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </>
  );

  const getSubtitle = () => {
    switch (role) {
      case 'ADMIN': return 'Panel de administracion';
      case 'MANAGER': return 'Panel de gerencia';
      case 'SELLER': return 'Tus estadisticas de ventas';
      case 'WAREHOUSE': return 'Gestion de inventario';
      default: return 'Resumen';
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, {user?.firstName}</Text>
          <Text style={styles.subtitle}>{getSubtitle()}</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </Text>
        </View>
      </View>

      {role === 'ADMIN' || role === 'MANAGER' ? renderAdminManager() : null}
      {role === 'SELLER' ? renderSeller() : null}
      {role === 'WAREHOUSE' ? renderWarehouse() : null}
      {!['ADMIN', 'MANAGER', 'SELLER', 'WAREHOUSE'].includes(role) && (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ color: COLORS.gray[500] }}>Rol no reconocido</Text>
        </View>
      )}

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.gray[500],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.gray[900],
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray[500],
    marginTop: 4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray[600],
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  statCount: {
    fontSize: 11,
    color: COLORS.gray[500],
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray[900],
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  sellerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankGold: { backgroundColor: '#FEF3C7' },
  rankSilver: { backgroundColor: COLORS.gray[200] },
  rankBronze: { backgroundColor: '#FED7AA' },
  rankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.gray[700],
  },
  sellerInfo: { flex: 1 },
  sellerName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray[900],
  },
  sellerCount: {
    fontSize: 12,
    color: COLORS.gray[500],
  },
  saleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  saleInfo: { flex: 1 },
  saleSeller: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray[900],
  },
  saleCustomer: {
    fontSize: 14,
    color: COLORS.gray[700],
  },
  saleDate: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  saleRight: { alignItems: 'flex-end' },
  saleTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray[900],
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 4,
  },
  statusCompleted: { backgroundColor: COLORS.successLight },
  statusCancelled: { backgroundColor: COLORS.dangerLight },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.gray[700],
  },
  stockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  stockName: {
    fontSize: 14,
    color: COLORS.gray[900],
  },
  stockWarehouse: {
    fontSize: 11,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  stockBadge: {
    backgroundColor: COLORS.dangerLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stockText: {
    fontSize: 12,
    color: COLORS.danger,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.gray[500],
    padding: 20,
  },
});
