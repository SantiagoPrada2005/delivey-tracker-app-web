# DeliveryTracker - Sistema de Gestión de Entregas

## 📋 Índice

1. [Descripción General](#descripción-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Análisis Detallado de Páginas](#análisis-detallado-de-páginas)
5. [Cálculos y Algoritmos](#cálculos-y-algoritmos)
6. [Base de Datos](#base-de-datos)
7. [Tecnologías Utilizadas](#tecnologías-utilizadas)
8. [Configuración e Instalación](#configuración-e-instalación)
9. [API Documentation](#api-documentation)
10. [Flujo de Organizaciones](#flujo-de-organizaciones)

## 📖 Descripción General

**DeliveryTracker** es una aplicación web completa para la gestión de entregas y pedidos, diseñada con arquitectura multi-tenant que permite a múltiples organizaciones gestionar sus operaciones de delivery de forma independiente.

### Características Principales

- **Gestión Multi-Tenant**: Soporte para múltiples organizaciones
- **Autenticación Firebase**: Sistema de autenticación robusto
- **Dashboard en Tiempo Real**: Estadísticas y métricas actualizadas
- **Gestión Completa de Pedidos**: Desde creación hasta entrega
- **Control de Inventario**: Gestión de productos y stock
- **Asignación de Repartidores**: Sistema inteligente de asignaciones
- **Análisis y Reportes**: Gráficos y estadísticas detalladas

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 15)                   │
├─────────────────────────────────────────────────────────────┤
│ • React 19 + TypeScript                                    │
│ • Tailwind CSS + Shadcn/ui                                 │
│ • Radix UI Components                                       │
│ • React Hook Form + Zod                                    │
│ • Recharts (Gráficos)                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API ROUTES (Next.js)                    │
├─────────────────────────────────────────────────────────────┤
│ • RESTful API                                               │
│ • Middleware de Autenticación                               │
│ • Validación con Zod                                        │
│ • Manejo de Errores Centralizado                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   AUTENTICACIÓN                             │
├─────────────────────────────────────────────────────────────┤
│ • Firebase Auth                                             │
│ • JWT Tokens                                                │
│ • Role-Based Access Control                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   BASE DE DATOS                             │
├─────────────────────────────────────────────────────────────┤
│ • MySQL Database                                            │
│ • Drizzle ORM                                               │
│ • Migraciones Automáticas                                   │
│ • Relaciones Complejas                                      │
└─────────────────────────────────────────────────────────────┘
```

### Patrón de Arquitectura

- **Frontend**: Component-Based Architecture con React
- **Backend**: API Routes con Next.js App Router
- **Estado**: Custom Hooks para manejo de estado
- **Datos**: Repository Pattern con Drizzle ORM
- **Autenticación**: Firebase Auth con middleware personalizado

## 📁 Estructura del Proyecto

```
delivey-tracker-app-web/
├── 📁 .trae/                          # Configuración de reglas del proyecto
│   └── rules/
│       ├── DELIVERY_TRACKER_PROJECT_RULES.md
│       └── project_rules.md
├── 📁 drizzle/                        # Migraciones de base de datos
│   ├── 0000_*.sql                    # Archivos de migración
│   └── meta/                         # Metadatos de migraciones
├── 📁 public/                         # Archivos estáticos
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── 📁 src/
│   ├── 📁 app/                        # App Router de Next.js
│   │   ├── 📁 admin/                  # Panel de administración
│   │   ├── 📁 api/                    # API Routes
│   │   ├── 📁 auth/                   # Páginas de autenticación
│   │   ├── 📁 clientes/               # Gestión de clientes
│   │   ├── 📁 configuracion/          # Configuración del sistema
│   │   ├── 📁 dashboard/              # Dashboard principal
│   │   ├── 📁 notificaciones/         # Sistema de notificaciones
│   │   ├── 📁 organization/           # Gestión de organizaciones
│   │   ├── 📁 pedidos/                # Gestión de pedidos
│   │   ├── 📁 perfil/                 # Perfil de usuario
│   │   ├── 📁 productos/              # Gestión de productos
│   │   ├── 📁 repartidores/           # Gestión de repartidores
│   │   ├── client-layout.tsx          # Layout del cliente
│   │   ├── globals.css                # Estilos globales
│   │   ├── layout.tsx                 # Layout principal
│   │   ├── not-found.tsx              # Página 404
│   │   └── page.tsx                   # Página de inicio
│   ├── 📁 components/                 # Componentes reutilizables
│   │   ├── 📁 auth/                   # Componentes de autenticación
│   │   ├── 📁 dashboard/              # Componentes del dashboard
│   │   ├── 📁 organization/           # Componentes de organización
│   │   ├── 📁 pedidos/                # Componentes de pedidos
│   │   ├── 📁 productos/              # Componentes de productos
│   │   ├── 📁 ui/                     # Componentes UI base
│   │   ├── dashboard-layout.tsx       # Layout del dashboard
│   │   ├── error-boundary.tsx         # Manejo de errores
│   │   ├── organization-selector.tsx  # Selector de organización
│   │   ├── theme-provider.tsx         # Proveedor de temas
│   │   ├── theme-switcher.tsx         # Cambiador de temas
│   │   └── user-auth-nav.tsx          # Navegación de usuario
│   ├── 📁 contexts/                   # Contextos de React
│   │   └── organization-flow-context.tsx
│   ├── 📁 db/                         # Configuración de base de datos
│   │   ├── 📁 schema/                 # Esquemas de Drizzle
│   │   │   ├── asignacionesPedido.ts
│   │   │   ├── categoriaProducto.ts
│   │   │   ├── clientes.ts
│   │   │   ├── detallesPedido.ts
│   │   │   ├── index.ts
│   │   │   ├── organizationInvitations.ts
│   │   │   ├── organizationRequests.ts
│   │   │   ├── organizations.ts
│   │   │   ├── pedidos.ts
│   │   │   ├── productos.ts
│   │   │   ├── repartidores.ts
│   │   │   ├── userPermitions.ts
│   │   │   └── users.ts
│   │   └── index.ts                   # Configuración de DB
│   ├── 📁 hooks/                      # Custom Hooks
│   │   ├── use-mobile.ts              # Hook para detección móvil
│   │   ├── use-toast.ts               # Hook para notificaciones
│   │   ├── useAuth.tsx                # Hook de autenticación
│   │   ├── useCategorias.tsx          # Hook para categorías
│   │   ├── useClientes.tsx            # Hook para clientes
│   │   ├── useCreateOrganization.tsx  # Hook para crear organizaciones
│   │   ├── useOrganization.tsx        # Hook para organizaciones
│   │   ├── usePedidos.tsx             # Hook para pedidos
│   │   ├── useProductos.tsx           # Hook para productos
│   │   ├── useRepartidores.tsx        # Hook para repartidores
│   │   └── useUser.tsx                # Hook para usuarios
│   └── 📁 lib/                        # Utilidades y configuraciones
│       ├── 📁 auth/                   # Utilidades de autenticación
│       ├── 📁 firebase/               # Configuración de Firebase
│       ├── auth-utils.ts              # Utilidades de auth
│       ├── database.ts                # Configuración de DB
│       └── utils.ts                   # Utilidades generales
├── 📄 API_DOCUMENTATION.md            # Documentación de API
├── 📄 DATABASE_SETUP.md               # Configuración de base de datos
├── 📄 MIDDLEWARE_AUTH.md              # Documentación de middleware
├── 📄 ORGANIZATION_FLOW.md            # Flujo de organizaciones
├── 📄 PROJECT_RULES.md                # Reglas del proyecto
├── 📄 components.json                 # Configuración de componentes
├── 📄 drizzle.config.ts               # Configuración de Drizzle
├── 📄 eslint.config.mjs               # Configuración de ESLint
├── 📄 middleware.ts                   # Middleware de Next.js
├── 📄 next.config.ts                  # Configuración de Next.js
├── 📄 package.json                    # Dependencias del proyecto
├── 📄 postcss.config.mjs              # Configuración de PostCSS
└── 📄 tsconfig.json                   # Configuración de TypeScript
```

## 📊 Análisis Detallado de Páginas

### 1. Página Principal (Landing Page) - `/`

**Archivo**: `src/app/page.tsx`

#### Funcionalidad
- **Propósito**: Página de bienvenida y punto de entrada
- **Componentes**: Hero section, características, navegación
- **Lógica de Autenticación**: Muestra diferentes CTAs según estado de auth

#### Cálculos Específicos
```typescript
// Detección de estado de autenticación
const { isAuthenticated, loading } = useAuth();

// Lógica condicional para CTAs
if (loading) {
  // Mostrar skeleton loader
} else if (isAuthenticated) {
  // Mostrar botones: "Ir al Dashboard" y "Gestionar Pedidos"
} else {
  // Mostrar botones: "Comenzar Prueba Gratuita" y "Ver Demo"
}
```

#### Responsive Design
- **Breakpoints**: `xs`, `sm`, `md`, `lg`, `xl`
- **Grid System**: Flexbox con clases Tailwind
- **Typography Scale**: `text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl`

### 2. Dashboard Principal - `/dashboard`

**Archivo**: `src/app/dashboard/page.tsx`

#### Métricas Calculadas
```typescript
// Estadísticas en tiempo real
interface DashboardMetrics {
  totalPedidos: number;           // COUNT(*) FROM pedidos
  pedidosPendientes: number;      // COUNT(*) WHERE estado = 'pendiente'
  pedidosEntregados: number;      // COUNT(*) WHERE estado = 'entregado'
  totalVentas: number;            // SUM(total) FROM pedidos
  promedioVenta: number;          // AVG(total) FROM pedidos
  tasaEntrega: number;            // (entregados / total) * 100
}
```

#### Componentes de Visualización
- **StatusChart**: Gráfico de torta con distribución de estados
- **PedidoStats**: Cards con métricas principales
- **RecentOrders**: Lista de pedidos recientes

### 3. Gestión de Pedidos - `/pedidos`

**Archivo**: `src/app/pedidos/page.tsx`

#### Funcionalidades Principales
1. **Listado de Pedidos**: Tabla paginada con filtros
2. **Creación de Pedidos**: Formulario avanzado multi-step
3. **Edición de Pedidos**: Formulario pre-poblado
4. **Estadísticas**: Métricas en tiempo real

#### Cálculos de Pedidos
```typescript
// Hook usePedidos - Cálculos principales
interface PedidoCalculations {
  // Cálculo de subtotal por producto
  calculateSubtotal: (cantidad: number, precioUnitario: number) => number;
  
  // Cálculo de total del pedido
  calculateTotal: (detalles: DetallePedido[]) => number;
  
  // Validación de stock
  validateStock: (detalles: DetallePedido[]) => Promise<StockValidation[]>;
  
  // Estadísticas agregadas
  getEstadisticasPedidos: () => {
    total: number;
    pendientes: number;
    entregados: number;
    totalVentas: number;
    promedioVenta: number;
  };
}
```

#### Algoritmo de Cálculo de Total
```typescript
function calculateTotal(detalles: DetallePedido[]): number {
  return detalles.reduce((total, detalle) => {
    const subtotal = detalle.cantidad * detalle.precioUnitario;
    return total + subtotal;
  }, 0);
}
```

#### Estados de Pedido
```typescript
type EstadoPedido = 
  | 'pendiente'    // Recién creado
  | 'en_proceso'   // En preparación
  | 'en_camino'    // Asignado a repartidor
  | 'entregado'    // Completado
  | 'cancelado';   // Cancelado
```

### 4. Gestión de Clientes - `/clientes`

**Archivo**: `src/app/clientes/page.tsx`

#### Funcionalidades
- **CRUD Completo**: Crear, leer, actualizar, eliminar
- **Tabla Interactiva**: Sorting, filtering, pagination
- **Validaciones**: Email, teléfono, campos requeridos

#### Métricas de Clientes
```typescript
interface ClienteMetrics {
  totalClientes: number;          // COUNT(*) FROM clientes
  clientesActivos: number;        // Clientes con pedidos recientes
  clientesInactivos: number;      // Sin pedidos en 30 días
  promedioCompra: number;         // AVG(total) por cliente
}
```

#### Algoritmo de Segmentación
```typescript
function segmentarClientes(clientes: Cliente[], pedidos: Pedido[]) {
  return clientes.map(cliente => {
    const pedidosCliente = pedidos.filter(p => p.clienteId === cliente.id);
    const totalCompras = pedidosCliente.reduce((sum, p) => sum + p.total, 0);
    const ultimaCompra = Math.max(...pedidosCliente.map(p => p.createdAt));
    
    return {
      ...cliente,
      totalCompras,
      ultimaCompra,
      segmento: totalCompras > 100000 ? 'VIP' : 
                totalCompras > 50000 ? 'Premium' : 'Regular'
    };
  });
}
```

### 5. Gestión de Productos - `/productos`

**Archivo**: `src/app/productos/page.tsx`

#### Funcionalidades
- **Inventario**: Control de stock en tiempo real
- **Categorización**: Organización por categorías
- **Pricing**: Gestión de precios

#### Cálculos de Inventario
```typescript
interface InventoryCalculations {
  // Stock disponible
  stockDisponible: number;
  
  // Stock reservado (en pedidos pendientes)
  stockReservado: number;
  
  // Punto de reorden
  puntoReorden: number;
  
  // Valor total del inventario
  valorInventario: number; // stock * precio
}
```

#### Algoritmo de Alertas de Stock
```typescript
function calcularAlertasStock(productos: Producto[]) {
  return productos.filter(producto => {
    const stockMinimo = producto.puntoReorden || 10;
    return producto.stock <= stockMinimo;
  }).map(producto => ({
    productoId: producto.id,
    nombre: producto.nombre,
    stockActual: producto.stock,
    stockMinimo: producto.puntoReorden,
    urgencia: producto.stock === 0 ? 'critica' : 'media'
  }));
}
```

### 6. Gestión de Repartidores - `/repartidores`

**Archivo**: `src/app/repartidores/page.tsx`

#### Funcionalidades
- **Disponibilidad**: Control de estado en tiempo real
- **Asignaciones**: Historial de entregas
- **Performance**: Métricas de rendimiento

#### Métricas de Repartidores
```typescript
interface RepartidorMetrics {
  totalRepartidores: number;
  disponibles: number;
  enRuta: number;
  entregasHoy: number;
  promedioEntregas: number;
  tiempoPromedioEntrega: number; // en minutos
}
```

#### Algoritmo de Asignación Inteligente
```typescript
function asignarRepartidorOptimo(pedido: Pedido, repartidores: Repartidor[]) {
  const disponibles = repartidores.filter(r => r.disponible);
  
  return disponibles.reduce((mejor, actual) => {
    const distanciaActual = calcularDistancia(actual.ubicacion, pedido.direccion);
    const distanciaMejor = calcularDistancia(mejor.ubicacion, pedido.direccion);
    
    // Priorizar por: 1) Distancia, 2) Carga de trabajo, 3) Rating
    if (distanciaActual < distanciaMejor) return actual;
    if (distanciaActual === distanciaMejor && actual.pedidosActivos < mejor.pedidosActivos) return actual;
    
    return mejor;
  });
}
```

### 7. Sistema de Notificaciones - `/notificaciones`

#### Tipos de Notificaciones
1. **Pedidos** (`/notificaciones/pedidos`): Nuevos pedidos, cambios de estado
2. **Stock** (`/notificaciones/stock`): Alertas de inventario bajo
3. **Mensajes** (`/notificaciones/mensajes`): Comunicaciones internas

#### Cálculo de Prioridades
```typescript
function calcularPrioridadNotificacion(tipo: string, datos: any): 'alta' | 'media' | 'baja' {
  switch (tipo) {
    case 'stock_critico':
      return datos.stock === 0 ? 'alta' : 'media';
    case 'pedido_urgente':
      return datos.tiempoEspera > 60 ? 'alta' : 'media';
    case 'repartidor_retrasado':
      return datos.retraso > 30 ? 'alta' : 'baja';
    default:
      return 'baja';
  }
}
```

## 🧮 Cálculos y Algoritmos

### 1. Cálculos Financieros

#### Total de Ventas
```sql
SELECT 
  SUM(total) as totalVentas,
  AVG(total) as promedioVenta,
  COUNT(*) as totalPedidos
FROM pedidos 
WHERE estado = 'entregado' 
  AND organizationId = ?
  AND DATE(createdAt) = CURDATE();
```

#### Análisis de Rentabilidad
```typescript
interface RentabilityAnalysis {
  ingresosBrutos: number;     // SUM(total) WHERE estado = 'entregado'
  costoOperativo: number;     // Costos fijos + variables
  margenBruto: number;        // (ingresosBrutos - costoOperativo) / ingresosBrutos
  puntoEquilibrio: number;    // costoOperativo / margenPromedioPedido
}
```

### 2. Algoritmos de Optimización

#### Optimización de Rutas
```typescript
function optimizarRutas(pedidos: Pedido[], repartidores: Repartidor[]) {
  // Algoritmo de asignación basado en:
  // 1. Distancia euclidiana
  // 2. Capacidad del repartidor
  // 3. Tiempo estimado de entrega
  
  const asignaciones = [];
  
  for (const pedido of pedidos) {
    const repartidorOptimo = encontrarRepartidorOptimo(pedido, repartidores);
    asignaciones.push({
      pedidoId: pedido.id,
      repartidorId: repartidorOptimo.id,
      tiempoEstimado: calcularTiempoEntrega(pedido, repartidorOptimo),
      distancia: calcularDistancia(pedido.direccion, repartidorOptimo.ubicacion)
    });
  }
  
  return asignaciones;
}
```

#### Predicción de Demanda
```typescript
function predecirDemanda(historialPedidos: Pedido[], dias: number = 7) {
  const pedidosPorDia = agruparPorDia(historialPedidos);
  const tendencia = calcularTendencia(pedidosPorDia);
  
  return {
    prediccionDiaria: tendencia.promedio + tendencia.crecimiento,
    confianza: calcularConfianza(pedidosPorDia),
    factoresEstacionales: detectarPatrones(pedidosPorDia)
  };
}
```

### 3. Métricas de Performance

#### KPIs Principales
```typescript
interface KPIs {
  // Operacionales
  tiempoPromedioEntrega: number;      // Minutos desde pedido hasta entrega
  tasaEntregaExitosa: number;         // % pedidos entregados vs total
  tasaCancelacion: number;            // % pedidos cancelados
  
  // Financieros
  ticketPromedio: number;             // Valor promedio por pedido
  ingresosPorRepartidor: number;      // Ingresos / número de repartidores
  costoAcquisicionCliente: number;    // Costo marketing / nuevos clientes
  
  // Satisfacción
  tiempoRespuestaPromedio: number;    // Tiempo de respuesta a consultas
  retencionClientes: number;          // % clientes que repiten compra
}
```

#### Cálculo de Eficiencia
```typescript
function calcularEficienciaOperacional(datos: OperationalData) {
  const eficienciaEntrega = datos.entregasExitosas / datos.totalEntregas;
  const eficienciaTiempo = datos.tiempoOptimo / datos.tiempoReal;
  const eficienciaCosto = datos.presupuesto / datos.costoReal;
  
  return {
    eficienciaGeneral: (eficienciaEntrega + eficienciaTiempo + eficienciaCosto) / 3,
    areas_mejora: identificarAreasMejora(datos),
    recomendaciones: generarRecomendaciones(datos)
  };
}
```

## 🗄️ Base de Datos

### Esquema de Relaciones

```mermaid
erDiagram
    ORGANIZATIONS ||--o{ USERS : "has"
    ORGANIZATIONS ||--o{ CLIENTES : "has"
    ORGANIZATIONS ||--o{ PRODUCTOS : "has"
    ORGANIZATIONS ||--o{ PEDIDOS : "has"
    ORGANIZATIONS ||--o{ REPARTIDORES : "has"
    
    USERS ||--o{ ORGANIZATION_REQUESTS : "creates"
    USERS ||--o{ ORGANIZATION_INVITATIONS : "sends/receives"
    
    CLIENTES ||--o{ PEDIDOS : "places"
    PEDIDOS ||--o{ DETALLES_PEDIDO : "contains"
    PRODUCTOS ||--o{ DETALLES_PEDIDO : "included_in"
    PEDIDOS ||--o{ ASIGNACIONES_PEDIDO : "assigned_to"
    REPARTIDORES ||--o{ ASIGNACIONES_PEDIDO : "handles"
    
    CATEGORIA_PRODUCTO ||--o{ PRODUCTOS : "categorizes"
```

### Tablas Principales

#### 1. Organizations
```sql
CREATE TABLE organizations (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  nit INT UNSIGNED UNIQUE,
  phone_service VARCHAR(20),
  address VARCHAR(200),
  regimen_contribucion ENUM('Regimen simplificado', 'Regimen común'),
  email VARCHAR(255),
  website VARCHAR(255),
  description TEXT,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_by INT UNSIGNED,
  allow_invitations BOOLEAN DEFAULT TRUE NOT NULL,
  require_approval_for_join BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
);
```

#### 2. Pedidos
```sql
CREATE TABLE pedidos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  estado ENUM('pendiente', 'en_proceso', 'en_camino', 'entregado', 'cancelado') DEFAULT 'pendiente' NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  direccion_entrega TEXT NOT NULL,
  fecha_entrega TIMESTAMP,
  organization_id INT UNSIGNED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  INDEX idx_estado (estado),
  INDEX idx_fecha (created_at),
  INDEX idx_organization (organization_id)
);
```

#### 3. Detalles de Pedido
```sql
CREATE TABLE detalles_pedido (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT UNSIGNED NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  nota_producto TEXT,
  
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
  INDEX idx_pedido (pedido_id),
  INDEX idx_producto (producto_id)
);
```

### Índices y Optimizaciones

```sql
-- Índices para consultas frecuentes
CREATE INDEX idx_pedidos_estado_fecha ON pedidos(estado, created_at);
CREATE INDEX idx_pedidos_organization_estado ON pedidos(organization_id, estado);
CREATE INDEX idx_clientes_organization ON clientes(organization_id);
CREATE INDEX idx_productos_organization_categoria ON productos(organization_id, categoria_id);

-- Índices compuestos para reportes
CREATE INDEX idx_pedidos_reporting ON pedidos(organization_id, estado, created_at, total);
CREATE INDEX idx_detalles_analytics ON detalles_pedido(producto_id, cantidad, subtotal);
```

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Next.js 15**: Framework React con App Router
- **React 19**: Biblioteca de UI con hooks modernos
- **TypeScript**: Tipado estático para JavaScript
- **Tailwind CSS**: Framework de CSS utility-first
- **Shadcn/ui**: Componentes UI pre-construidos
- **Radix UI**: Primitivos de UI accesibles
- **React Hook Form**: Manejo de formularios
- **Zod**: Validación de esquemas
- **Recharts**: Biblioteca de gráficos
- **Lucide React**: Iconos SVG

### Backend
- **Next.js API Routes**: Endpoints RESTful
- **Drizzle ORM**: ORM type-safe para TypeScript
- **MySQL**: Base de datos relacional
- **Firebase Auth**: Autenticación y autorización
- **Middleware personalizado**: Autenticación y CORS

### Herramientas de Desarrollo
- **ESLint**: Linting de código
- **Prettier**: Formateo de código
- **TypeScript**: Verificación de tipos
- **Drizzle Kit**: Migraciones de base de datos

### Dependencias Principales
```json
{
  "dependencies": {
    "@hookform/resolvers": "^5.0.1",
    "@radix-ui/react-*": "^1.1.x - ^2.2.x",
    "@tanstack/react-table": "^8.21.3",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "date-fns": "^4.1.0",
    "drizzle-orm": "^0.44.1",
    "firebase": "^11.8.1",
    "firebase-admin": "^13.4.0",
    "lucide-react": "^0.512.0",
    "mysql2": "^3.14.1",
    "next": "15.3.3",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-hook-form": "^7.57.0",
    "recharts": "^2.15.3",
    "tailwind-merge": "^3.3.0",
    "zod": "^3.25.55"
  }
}
```

## ⚙️ Configuración e Instalación

### Requisitos Previos
- Node.js 18+ y npm
- MySQL Server 8.0+
- Cuenta de Firebase

### Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd delivey-tracker-app-web
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:
```env
# Base de datos
DATABASE_URL="mysql://usuario:password@localhost:3306/delivey_tracker"

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY="tu_api_key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="tu_proyecto.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="tu_proyecto_id"

# Firebase Admin (servidor)
FIREBASE_ADMIN_PROJECT_ID="tu_proyecto_id"
FIREBASE_ADMIN_CLIENT_EMAIL="tu_service_account@tu_proyecto.iam.gserviceaccount.com"
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

4. **Configurar base de datos**
```bash
# Crear base de datos
mysql -u root -p -e "CREATE DATABASE delivey_tracker;"

# Aplicar migraciones
npx drizzle-kit push

# Poblar con datos de prueba
npm run db:seed
```

5. **Ejecutar en desarrollo**
```bash
npm run dev
```

### Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Linting de código

# Base de datos
npm run db:seed      # Poblar con datos de prueba
npx drizzle-kit push # Aplicar cambios de schema
npx drizzle-kit generate # Generar migraciones
```

## 📚 API Documentation

La API está completamente documentada en `API_DOCUMENTATION.md`. Incluye:

### Endpoints Principales

#### Autenticación
- `POST /api/auth/verify` - Verificar token Firebase
- `POST /api/auth/sync` - Sincronizar usuario con DB

#### Organizaciones
- `GET /api/organizations` - Listar organizaciones
- `POST /api/organizations` - Crear organización
- `PUT /api/organizations/:id` - Actualizar organización

#### Pedidos
- `GET /api/pedidos` - Listar pedidos
- `POST /api/pedidos` - Crear pedido
- `PUT /api/pedidos/:id` - Actualizar pedido
- `DELETE /api/pedidos/:id` - Eliminar pedido

#### Clientes
- `GET /api/clientes` - Listar clientes
- `POST /api/clientes` - Crear cliente
- `PUT /api/clientes/:id` - Actualizar cliente

### Estructura de Respuestas

Todas las respuestas siguen el formato:
```typescript
{
  success: boolean;
  data?: any;
  error?: string;
  code?: string;
}
```

## 🏢 Flujo de Organizaciones

El sistema implementa un flujo multi-tenant complejo documentado en `ORGANIZATION_FLOW.md`:

### Estados del Usuario
1. **Sin Organización**: Usuario registrado sin organización asignada
2. **Solicitud Pendiente**: Ha solicitado crear una organización
3. **Miembro**: Pertenece a una organización existente
4. **Administrador**: Puede gestionar la organización

### Proceso de Creación
1. Usuario se registra con Firebase Auth
2. Se crea registro en tabla `users`
3. Usuario elige: crear organización o unirse por invitación
4. Si crea: se genera `organization_request`
5. Admin del sistema aprueba/rechaza
6. Si se aprueba: se crea organización y se asigna usuario

### Invitaciones
```typescript
interface OrganizationInvitation {
  id: number;
  organizationId: number;
  invitedEmail: string;
  invitedBy: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  role: 'admin' | 'manager' | 'employee';
  expiresAt: Date;
}
```

## 🚀 Deployment

### Vercel (Recomendado)
1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Deploy automático en cada push

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📈 Roadmap

### Próximas Características
- [ ] Sistema de notificaciones push
- [ ] Integración con APIs de mapas
- [ ] Reportes avanzados con exportación
- [ ] App móvil para repartidores
- [ ] Sistema de calificaciones
- [ ] Integración con pasarelas de pago
- [ ] Analytics avanzados con ML

### Mejoras Técnicas
- [ ] Implementar Redis para caché
- [ ] Migrar a PostgreSQL
- [ ] Implementar WebSockets para tiempo real
- [ ] Añadir tests automatizados
- [ ] Implementar CI/CD completo
- [ ] Optimización de performance

---

**Desarrollado por**: Santiago Prada Moreno  
**Versión**: 1.0.0  
**Última actualización**: Enero 2025

Para más información, consulta la documentación específica en los archivos:
- `API_DOCUMENTATION.md`
- `DATABASE_SETUP.md`
- `ORGANIZATION_FLOW.md`
- `PROJECT_RULES.md`
