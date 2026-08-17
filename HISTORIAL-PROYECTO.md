# CauCE - Historial del Proyecto

## Resumen Ejecutivo
Sistema de ventas e inventario completo (web + mobile) con dashboard, productos, bodegas, inventario, ventas, clientes, invitaciones por email, y roles (Admin, Gerente, Vendedor, Bodega).

---

## Stack Tecnologico

| Componente | Tecnologia | URL |
|------------|-----------|-----|
| Backend | Node.js + Express + Prisma | https://cauce-system-production.up.railway.app |
| Frontend | Next.js 14 + Tailwind CSS | https://cauce-system-two.vercel.app |
| Mobile | React Native + Expo SDK 51 | Build en EAS (cuenta leosazom2) |
| Base de datos | PostgreSQL (Supabase) | Proyecto: txlbltovtbfxxirjytwb |
| Email | Resend API | API Key: [ver Railway ENV vars] |
| Repositorio | GitHub | https://github.com/sazoleonardo95/cauce-system |

---

## Credenciales

### Supabase
- URL: postgresql://postgres.txlbltovtbfxxirjytwb:HZSh7sXZtOYjy3py@db.txlbltovtbfxxirjytwb.supabase.co:5432/postgres
- Dashboard: https://supabase.com/dashboard/project/txlbltovtbfxxirjytwb
- Password: HZSh7sXZtOYjy3py

### Railway
- Proyecto: overflowing-endness (ae936596-0039-40bc-afe2-168098be7496)
- Deploy: https://cauce-system-production.up.railway.app

### Expo / EAS
- Cuenta: leosazom2 (emercar2026@gmail.com)
- Cuenta vieja: leosazom (sazoleonardo95@gmail.com) - sin builds disponibles
- EAS Project ID: 702e2357-e91a-4c87-ab36-1fbc733c947e

### Demo Credentials
- admin@demo.com / admin123 (Admin)
- seller@demo.com / seller123 (Vendedor)
- bodega@demo.com / warehouse123 (Bodega)
- sazoleonardo95@gmail.com (Usuario real, rol SELLER)

---

## Credenciales de Deploy

### Railway ENV vars
```
DATABASE_URL=postgresql://postgres.txlbltovtbfxxirjytwb:HZSh7sXZtOYjy3py@db.txlbltovtbfxxirjytwb.supabase.co:5432/postgres?pgbouncer=true
JWT_SECRET=cauce-jwt-secret-2026
JWT_REFRESH_SECRET=cauce-jwt-refresh-secret-2026
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=production
FRONTEND_URL=https://cauce-system-two.vercel.app
PORT=4000
RESEND_API_KEY=[ver dashboard de Railway]
```

### Vercel ENV vars
```
NEXT_PUBLIC_API_URL=https://cauce-system-production.up.railway.app/api
```

---

## Arquitectura del Codigo

### Backend (C:\Users\carlitos\sales-system\backend\)
```
backend/
  prisma/
    schema.prisma          # Modelos: User, Company, Product, Warehouse, InventoryItem, Sale, SaleItem, Customer, Invitation, Notification, StockMovement, Commission, DeviceToken
    seed.js                # Datos demo
  src/
    config/
      database.js          # Prisma client singleton
      email.js             # Resend API config
    controllers/
      authController.js    # Login, register, profile
      productController.js
      warehouseController.js
      inventoryController.js  # Incluye push notification en LOW_STOCK
      saleController.js    # Descuenta inventario automaticamente
      customerController.js
      invitationController.js # Incluye push notification en accept
      dashboardController.js  # Stats por rol (sin authorize middleware)
      notificationController.js # CRUD notificaciones + register token
    middleware/
      auth.js              # JWT + authorize(roles)
      errorHandler.js      # Prisma error handling
    routes/
      auth.js, products.js, warehouses.js, inventory.js, customers.js, sales.js, invitations.js, dashboard.js, notifications.js
    services/
      notificationService.js  # Firebase init + push helpers
    server.js              # Express app, CORS, rate limit, Firebase init
```

### Frontend (C:\Users\carlitos\sales-system\frontend\)
```
frontend/src/
  app/
    (auth)/login/page.js       # Login con back button, password toggle, demo accounts
    (auth)/register/page.js    # Register con terms checkbox
    (dashboard)/dashboard/page.js  # Role-based rendering (Admin/Manager/Seller/Warehouse)
    (dashboard)/products/page.js   # CRUD con edit modal
    (dashboard)/warehouses/page.js # CRUD con stats
    (dashboard)/customers/page.js  # CRUD con edit modal
    (dashboard)/sales/page.js
    (dashboard)/inventory/page.js
    (dashboard)/team/page.js
    (dashboard)/invitations/page.js
    accept-invite/page.js
  components/
    LandingPage.js    # Hero, features, pricing, FAQ, integrations, security, testimonials
    Sidebar.js        # Nav con adminOnly filter
  lib/
    api.js            # API client con JWT
    utils.js          # formatCurrency (es-CO), formatDate
```

### Mobile (C:\Users\carlitos\sales-system\mobile\)
```
mobile/
  App.js              # Navigation: Dashboard, Productos, Ventas, Inventario, Clientes, Bodegas(admin), Equipo(admin), Perfil, Notificaciones
  src/
    context/AuthContext.js  # Login, logout, register push token
    lib/
      api.js          # API client con todos los endpoints
      utils.js        # formatCurrency (es-CO), COLORS
      notifications.js # Push notification setup
    screens/
      LoginScreen.js
      RegisterScreen.js
      DashboardScreen.js     # Role-based (3 render functions)
      ProductsScreen.js      # CRUD con edit modal
      SalesScreen.js         # Con customer/warehouse/payment pickers
      InventoryScreen.js     # Con product picker
      CustomersScreen.js     # CRUD con edit modal
      WarehousesScreen.js    # CRUD con stats
      InvitationsScreen.js   # Solo admin/manager
      NotificationsScreen.js # In-app notifications
    components/
      ErrorBoundary.js  # Catch crashes
```

---

## Funcionalidades por Rol

| Modulo | Admin | Gerente | Vendedor | Bodega |
|--------|-------|---------|----------|--------|
| Dashboard | Total company stats | Total company stats | Solo sus ventas/comisiones | Inventario + bodegas |
| Productos | CRUD completo | CRUD completo | Crear/Editar | Solo ver |
| Ventas | CRUD + cancelar | CRUD + cancelar | Crear (requiere bodega) | Solo ver |
| Inventario | Ajustar stock | Ajustar stock | Ajustar stock | Solo ver |
| Clientes | CRUD | CRUD | CRUD | Solo ver |
| Bodegas | CRUD + eliminar | CRUD | No accede | Solo ver |
| Invitaciones | Enviar/Reenviar/Cancelar | Enviar/Reenviar/Cancelar | No accede | No accede |
| Notificaciones | Ver + marcar leido | Ver + marcar leido | Ver + marcar leido | Ver + marcar leido |

---

## Decisiones Tecnicas Importantes

1. **Currency format**: `$17,490` (es-CO locale, sin .00 para numeros enteros)
2. **Registration flow**: User created first, then company with ownerId, then user updated with companyId
3. **Dashboard route auth removed**: `/api/dashboard/stats` no usa `authorize()` middleware; el controller filtra por rol internamente
4. **Sidebar admin filtering**: Usa propiedad `adminOnly` en nav items (Bodegas, Equipo, Invitaciones)
5. **Sale inventory deduction**: Solo descuenta si `warehouseId` esta presente
6. **Firebase graceful degradation**: Si no hay env vars, no crashea - solo log warning
7. **Push notifications fire-and-forget**: Nunca bloquean la request principal
8. **Invalid tokens auto-deactivated**: Si Firebase retorna token invalido, se desactiva en DB

---

## Notificaciones (Pendiente - v1.1)

Todo el codigo esta listo pero falta:
1. **Crear proyecto Firebase** en console.firebase.google.com
2. **Ejecutar SQL en Supabase**:
```sql
CREATE TABLE IF NOT EXISTS "DeviceToken" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  token TEXT UNIQUE NOT NULL,
  platform TEXT DEFAULT 'android',
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now(),
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "DeviceToken_userId_idx" ON "DeviceToken"("userId");
```
3. **Agregar env vars en Railway**:
```
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_CLIENT_ID=...
FIREBASE_CLIENT_CERT_URL=...
```

---

## Ultimos Bugs Corregidos

| Bug | Fix |
|-----|-----|
| ProductsScreen crash (archivo corrupto) | Reescrito completo |
| Dashboard lentitud | `[search]` removido de useFocusEffect |
| Dashboard muestra "Reintentar" en carga | Spinner limpio, error solo si falla |
| Productos no编辑aban | Agregado modal de edicion |
| Clientes no编辑aban | Agregado modal de edicion |
| formatCurrency inconsistente | Unificado a es-CO en mobile y web |
| "Exito" sin acento | Corregido a unicode |
| Crash por nombre null | `item.name?.[0] \|\| 'P'` |
| Doble-tap en guardado | Estado `saving` en todos los screens |

---

## Comandos Utiles

```bash
# Backend
cd backend
npm run dev                    # Desarrollo
npx prisma migrate dev         # Migrar DB
npx prisma db seed             # Seed datos demo

# Frontend
cd frontend
npm run dev                    # Desarrollo
npm run build                  # Build produccion

# Mobile
cd mobile
npx expo start                 # Desarrollo
npx eas-cli build --platform android --profile preview  # Build APK
npx eas-cli build:list --platform android --limit 1 --json  # Ver ultimo build

# Deploy
git push                       # Auto-deploy Railway + Vercel
```

---

## Fecha: 16-17 Agosto 2026
## Version: 1.0
