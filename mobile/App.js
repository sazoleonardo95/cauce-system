import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { COLORS } from './src/lib/utils';
import ErrorBoundary from './src/components/ErrorBoundary';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ProductsScreen from './src/screens/ProductsScreen';
import SalesScreen from './src/screens/SalesScreen';
import InventoryScreen from './src/screens/InventoryScreen';
import CustomersScreen from './src/screens/CustomersScreen';
import InvitationsScreen from './src/screens/InvitationsScreen';
import WarehousesScreen from './src/screens/WarehousesScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Cerrar sesion', 'Estas seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesion', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.gray[50], padding: 16 }}>
      <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 24 }}>
        <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: COLORS.primary }}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </Text>
        </View>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: COLORS.gray[900] }}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text style={{ fontSize: 14, color: COLORS.gray[500], marginTop: 4 }}>{user?.email}</Text>
        <View style={{ marginTop: 8, backgroundColor: COLORS.primaryLight, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: COLORS.primary, textTransform: 'uppercase' }}>{user?.role}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={{ backgroundColor: COLORS.danger, borderRadius: 12, padding: 16, alignItems: 'center' }}
        onPress={handleLogout}
      >
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Cerrar sesion</Text>
      </TouchableOpacity>
    </View>
  );
}

function TabIcon({ icon }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 20 }}>{icon}</Text>
    </View>
  );
}

function AppTabs() {
  const { user } = useAuth();
  const isAdminOrManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray[400],
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: COLORS.gray[100],
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color }) => <TabIcon icon="🏠" />,
        }}
      />
      <Tab.Screen
        name="Productos"
        component={ProductsScreen}
        options={{
          tabBarIcon: ({ color }) => <TabIcon icon="📦" />,
        }}
      />
      <Tab.Screen
        name="Ventas"
        component={SalesScreen}
        options={{
          tabBarIcon: ({ color }) => <TabIcon icon="💰" />,
        }}
      />
      <Tab.Screen
        name="Inventario"
        component={InventoryScreen}
        options={{
          tabBarIcon: ({ color }) => <TabIcon icon="📊" />,
        }}
      />
      <Tab.Screen
        name="Clientes"
        component={CustomersScreen}
        options={{
          tabBarIcon: ({ color }) => <TabIcon icon="👥" />,
        }}
      />
      {isAdminOrManager && (
        <Tab.Screen
          name="Bodegas"
          component={WarehousesScreen}
          options={{
            tabBarIcon: ({ color }) => <TabIcon icon="🏬" />,
          }}
        />
      )}
      {isAdminOrManager && (
        <Tab.Screen
          name="Equipo"
          component={InvitationsScreen}
          options={{
            tabBarIcon: ({ color }) => <TabIcon icon="✉️" />,
          }}
        />
      )}
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => <TabIcon icon="👤" />,
        }}
      />
      <Tab.Screen
        name="Notificaciones"
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ color }) => <TabIcon icon="🔔" />,
        }}
      />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Auth" component={AuthStack} />
      ) : (
        <Stack.Screen name="Main" component={AppTabs} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
          <StatusBar style="auto" />
        </NavigationContainer>
      </AuthProvider>
    </ErrorBoundary>
  );
}
