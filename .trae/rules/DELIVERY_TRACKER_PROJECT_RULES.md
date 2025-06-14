# Reglas Específicas del Proyecto - Delivery Tracker App

> **Sistema de Administración de Pedidos Multi-Tenant**  
> Autor: Santiago Prada  
> Stack: Next.js 15 + MySQL + Drizzle ORM + Firebase Auth + Tailwind CSS  
> Versión: 2.0 - Actualizado con mejores prácticas y optimizaciones

## 📖 Índice

1. [🏗️ Arquitectura del Proyecto](#️-arquitectura-del-proyecto)
2. [🔐 Autenticación y Multi-Tenancy](#-reglas-de-autenticación-y-multi-tenancy)
3. [🗄️ Base de Datos (MySQL + Drizzle)](#️-reglas-de-base-de-datos-mysql--drizzle)
4. [🛡️ API Routes](#️-reglas-de-api-routes)
5. [🎨 Componentes y UI](#-reglas-de-componentes-y-ui)
6. [📊 Datos y Estados](#-reglas-de-datos-y-estados)
7. [🚀 Deployment y Performance](#-reglas-de-deployment-y-performance)
8. [🧪 Testing](#-reglas-de-testing)
9. [🔧 Herramientas de Desarrollo](#-herramientas-de-desarrollo)
10. [📋 Checklist de Desarrollo](#-checklist-de-desarrollo)
11. [🚨 Troubleshooting](#-troubleshooting)
12. [📚 Recursos y Referencias](#-recursos-y-referencias)

## 🏗️ Arquitectura del Proyecto

### Stack Tecnológico Específico

```yaml
Frontend:
  - Next.js: 15.3.3 (App Router)
  - React: 19.0.0
  - TypeScript: Strict mode
  - Tailwind CSS: 4.x con PostCSS
  - Radix UI: Componentes base
  - Lucide React: Iconografía
  - Next Themes: Gestión de temas

Backend:
  - API Routes: Next.js App Router
  - Base de Datos: MySQL
  - ORM: Drizzle ORM 0.44.1
  - Autenticación: Firebase Auth 11.8.1
  - Validación: Zod 3.25.55

Herramientas:
  - Drizzle Kit: Migraciones
  - React Hook Form: Formularios
  - TanStack Table: Tablas de datos
  - Recharts: Gráficos y analytics
```

### Estructura de Directorios Específica

```
src/
├── app/                           # Next.js App Router
│   ├── admin/                     # Panel administrativo
│   ├── api/                       # API Routes
│   │   ├── admin/                 # APIs administrativas
│   │   ├── auth/                  # Autenticación
│   │   ├── organizations/         # Multi-tenancy
│   │   ├── pedidos/              # Gestión de pedidos
│   │   ├── clientes/             # Gestión de clientes
│   │   ├── productos/            # Catálogo de productos
│   │   └── repartidores/         # Gestión de delivery
│   ├── auth/                      # Páginas de autenticación
│   ├── clientes/                  # CRUD de clientes
│   ├── pedidos/                   # Gestión de pedidos
│   ├── productos/                 # Catálogo de productos
│   ├── repartidores/             # Gestión de repartidores
│   ├── configuracion/            # Configuración de organización
│   ├── notificaciones/           # Sistema de notificaciones
│   └── organization/             # Flujo de organizaciones
├── components/
│   ├── auth/                     # Componentes de autenticación
│   ├── dashboard/                # Componentes del dashboard
│   ├── organization/             # Componentes multi-tenant
│   └── ui/                       # Componentes base (Radix UI)
├── contexts/
│   └── organization-flow-context.tsx  # Contexto multi-tenant
├── db/
│   ├── schema/                   # Esquemas de Drizzle
│   │   ├── users.ts             # Usuarios Firebase
│   │   ├── organizations.ts     # Multi-tenancy
│   │   ├── pedidos.ts          # Pedidos
│   │   ├── clientes.ts         # Clientes
│   │   ├── productos.ts        # Productos
│   │   ├── repartidores.ts     # Repartidores
│   │   └── asignacionesPedido.ts # Asignaciones
│   ├── index.ts                 # Configuración Drizzle
│   └── seed.ts                  # Datos de prueba
├── hooks/
│   ├── useAuth.tsx              # Hook de Firebase Auth
│   ├── useOrganization.tsx      # Hook multi-tenant
│   └── use-mobile.ts            # Responsive utilities
└── lib/
    ├── firebase/                # Configuración Firebase
    │   ├── client.ts           # Cliente Firebase
    │   ├── admin.ts            # Firebase Admin
    │   └── config.ts           # Configuración
    ├── auth-utils.ts           # Utilidades de auth
    ├── database.ts             # Utilidades de DB
    └── utils.ts                # Utilidades generales
```

## 🔐 Reglas de Autenticación y Multi-Tenancy

### 1. Arquitectura de Usuarios y Organizaciones

```typescript
// ✅ CORRECTO: Estructura de usuario con Firebase
interface User {
  id: number;                    // PK interna
  firebaseUid: string;          // UID de Firebase (único)
  email: string;
  role: 'admin' | 'service_client' | 'delivery' | 'N/A';
  organizationId?: number;      // Relación con organización
  isActive: boolean;
}

// ✅ CORRECTO: Estructura de organización
interface Organization {
  id: number;
  name: string;
  slug: string;                 // URL amigable
  nit?: number;                 // Identificación fiscal
  regimenContribucion: 'Regimen simplificado' | 'Regimen común';
  createdBy: number;           // Usuario creador
  allowInvitations: boolean;   // Permite invitaciones
  requireApprovalForJoin: boolean; // Requiere aprobación
}
```

### 2. Middleware de Autenticación Robusto

```typescript
// ✅ CORRECTO: Middleware con verificación completa
// middleware.ts
export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  
  // Rutas públicas
  const publicRoutes = ['/', '/auth/login', '/auth/register', '/landing'];
  if (publicRoutes.includes(request.nextUrl.pathname)) {
    return NextResponse.next();
  }
  
  // Verificar token Firebase
  try {
    const decodedToken = await verifyFirebaseToken(token);
    
    // Verificar estado de organización
    const userOrgStatus = await getUserOrganizationStatus(decodedToken.uid);
    
    // Redirigir según estado
    if (!userOrgStatus.hasOrganization) {
      return NextResponse.redirect(new URL('/organization', request.url));
    }
    
    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}
```

### 3. Flujo de Organizaciones

```typescript
// ✅ CORRECTO: Estados del flujo organizacional
type OrganizationFlowStep = 
  | 'loading' 
  | 'no-organization' 
  | 'pending-invitation' 
  | 'pending-request' 
  | 'has-organization';

// ✅ CORRECTO: Contexto de organización
const OrganizationFlowContext = createContext<{
  currentStep: OrganizationFlowStep;
  organizationData: {
    pendingInvitations: PendingInvitation[];
    pendingRequests: PendingRequest[];
    currentOrganization: Organization | null;
  };
  refreshOrganizationStatus: () => Promise<void>;
}>({});
```

## 🗄️ Reglas de Base de Datos (MySQL + Drizzle)

### 1. Configuración de Drizzle Específica

```typescript
// ✅ CORRECTO: Configuración para MySQL
// drizzle.config.ts
export default defineConfig({
  schema: './src/db/schema',
  out: './drizzle',
  dialect: 'mysql',           // MySQL específico
  dbCredentials: {
    url: process.env.DATABASE_URL!
  },
  casing: 'snake_case'        // Convención snake_case
});

// ✅ CORRECTO: Pool de conexiones MySQL
// src/db/index.ts
const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000
});

export const db = drizzle(pool, { schema, mode: 'default' });
```

### 2. Esquemas Multi-Tenant

```typescript
// ✅ CORRECTO: Todas las tablas principales incluyen organizationId
export const pedidos = mysqlTable('pedidos', {
  id: serial('id').primaryKey(),
  clienteId: int('cliente_id').notNull(),
  estado: mysqlEnum('estado', [
    'pendiente', 'en_proceso', 'en_camino', 'entregado', 'cancelado'
  ]).default('pendiente'),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  direccionEntrega: text('direccion_entrega').notNull(),
  organizationId: int('organization_id', { unsigned: true })
    .references(() => organizations.id), // ✅ Clave foránea obligatoria
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ✅ CORRECTO: Relaciones definidas
export const pedidosRelations = relations(pedidos, ({ one, many }) => ({
  cliente: one(clientes, {
    fields: [pedidos.clienteId],
    references: [clientes.id],
  }),
  organization: one(organizations, {
    fields: [pedidos.organizationId],
    references: [organizations.id],
  }),
  detalles: many(detallesPedido),
  asignaciones: many(asignacionesPedido),
}));
```

### 3. Queries Multi-Tenant

```typescript
// ✅ CORRECTO: Siempre filtrar por organizationId
export async function getPedidosByOrganization(organizationId: number) {
  return await db.query.pedidos.findMany({
    where: eq(pedidos.organizationId, organizationId),
    with: {
      cliente: true,
      detalles: {
        with: {
          producto: true
        }
      },
      asignaciones: {
        with: {
          repartidor: true
        }
      }
    }
  });
}

// ✅ CORRECTO: Transacciones con verificación de organización
export async function createPedidoCompleto(
  pedidoData: InsertPedido,
  detallesData: InsertDetallePedido[],
  organizationId: number
) {
  return await db.transaction(async (tx) => {
    // Verificar que el cliente pertenece a la organización
    const cliente = await tx.query.clientes.findFirst({
      where: and(
        eq(clientes.id, pedidoData.clienteId),
        eq(clientes.organizationId, organizationId)
      )
    });
    
    if (!cliente) {
      throw new Error('Cliente no encontrado en la organización');
    }
    
    const [pedido] = await tx
      .insert(pedidos)
      .values({ ...pedidoData, organizationId })
      .returning({ id: pedidos.id });
    
    await tx.insert(detallesPedido).values(
      detallesData.map(detalle => ({
        ...detalle,
        pedidoId: pedido.id
      }))
    );
    
    return pedido;
  });
}
```

## 🛡️ Reglas de API Routes

### 1. Estructura Estándar de API Route

```typescript
// ✅ CORRECTO: Estructura completa con autenticación y multi-tenancy
// app/api/pedidos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseToken } from '@/lib/firebase/admin';
import { getUserOrganization } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    // 1. Verificar autenticación
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: 'Token requerido' }, 
        { status: 401 }
      );
    }
    
    const decodedToken = await verifyFirebaseToken(token);
    
    // 2. Obtener organización del usuario
    const userOrg = await getUserOrganization(decodedToken.uid);
    if (!userOrg) {
      return NextResponse.json(
        { error: 'Usuario sin organización' }, 
        { status: 403 }
      );
    }
    
    // 3. Ejecutar query filtrado por organización
    const pedidos = await getPedidosByOrganization(userOrg.id);
    
    return NextResponse.json(pedidos);
    
  } catch (error) {
    console.error('Error en GET /api/pedidos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const decodedToken = await verifyFirebaseToken(
      request.headers.get('authorization')?.replace('Bearer ', '')
    );
    
    const userOrg = await getUserOrganization(decodedToken.uid);
    const body = await request.json();
    
    // Validación con Zod
    const validatedData = PedidoSchema.parse(body);
    
    const nuevoPedido = await createPedidoCompleto(
      validatedData,
      validatedData.detalles,
      userOrg.id
    );
    
    return NextResponse.json(nuevoPedido, { status: 201 });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
```

### 2. APIs Administrativas

```typescript
// ✅ CORRECTO: API de administración con verificación de rol
// app/api/admin/users/route.ts
export async function GET(request: NextRequest) {
  try {
    const decodedToken = await verifyFirebaseToken(
      request.headers.get('authorization')?.replace('Bearer ', '')
    );
    
    // Verificar rol de administrador
    const user = await getUserByFirebaseUid(decodedToken.uid);
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acceso denegado' },
        { status: 403 }
      );
    }
    
    const users = await getAllUsers();
    return NextResponse.json(users);
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
```

## 🎨 Reglas de Componentes y UI

### 1. Componentes con Radix UI

```typescript
// ✅ CORRECTO: Uso de Radix UI como base
import * as Dialog from '@radix-ui/react-dialog';
import * as Select from '@radix-ui/react-select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ✅ CORRECTO: Componente con Tailwind y Radix
export function PedidoDialog({ pedido, onSave }: PedidoDialogProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button variant="outline">Editar Pedido</Button>
      </Dialog.Trigger>
      <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <Dialog.Title className="text-lg font-semibold mb-4">
            Editar Pedido #{pedido.id}
          </Dialog.Title>
          {/* Formulario */}
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
```

### 2. Hooks Personalizados

```typescript
// ✅ CORRECTO: Hook de autenticación con Firebase
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Sincronizar con base de datos local
        const localUser = await syncUserWithDatabase(firebaseUser);
        setUser(localUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);
  
  return { user, loading, signIn, signOut, signUp };
}

// ✅ CORRECTO: Hook de organización multi-tenant
export function useOrganization() {
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  
  useEffect(() => {
    if (user?.organizationId) {
      fetchOrganization(user.organizationId).then(setOrganization);
    }
  }, [user]);
  
  return { organization, refreshOrganization };
}
```

### 3. Formularios con React Hook Form + Zod

```typescript
// ✅ CORRECTO: Formulario validado
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const PedidoSchema = z.object({
  clienteId: z.number().min(1, 'Cliente requerido'),
  direccionEntrega: z.string().min(5, 'Dirección muy corta'),
  detalles: z.array(z.object({
    productoId: z.number(),
    cantidad: z.number().min(1),
    precio: z.number().min(0)
  })).min(1, 'Debe tener al menos un producto')
});

export function PedidoForm({ onSubmit }: PedidoFormProps) {
  const form = useForm<z.infer<typeof PedidoSchema>>({
    resolver: zodResolver(PedidoSchema),
    defaultValues: {
      detalles: []
    }
  });
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="clienteId">Cliente</Label>
        <Select {...form.register('clienteId')}>
          {/* Opciones */}
        </Select>
        {form.formState.errors.clienteId && (
          <p className="text-red-500 text-sm">
            {form.formState.errors.clienteId.message}
          </p>
        )}
      </div>
      
      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Guardando...' : 'Guardar Pedido'}
      </Button>
    </form>
  );
}
```

## 📊 Reglas de Datos y Estados

### 1. Estados de Pedidos

```typescript
// ✅ CORRECTO: Estados definidos en el esquema
type EstadoPedido = 
  | 'pendiente'    // Pedido creado, esperando procesamiento
  | 'en_proceso'   // Siendo preparado
  | 'en_camino'    // Asignado a repartidor, en delivery
  | 'entregado'    // Completado exitosamente
  | 'cancelado';   // Cancelado por cualquier motivo

// ✅ CORRECTO: Transiciones de estado válidas
const VALID_TRANSITIONS: Record<EstadoPedido, EstadoPedido[]> = {
  pendiente: ['en_proceso', 'cancelado'],
  en_proceso: ['en_camino', 'cancelado'],
  en_camino: ['entregado', 'cancelado'],
  entregado: [], // Estado final
  cancelado: []  // Estado final
};
```

### 2. Roles de Usuario

```typescript
// ✅ CORRECTO: Roles específicos del dominio
type UserRole = 
  | 'admin'          // Administrador del sistema
  | 'service_client' // Cliente que hace pedidos
  | 'delivery'       // Repartidor
  | 'N/A';          // Sin rol asignado

// ✅ CORRECTO: Permisos por rol
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['*'], // Todos los permisos
  service_client: [
    'pedidos:create',
    'pedidos:read:own',
    'clientes:create',
    'clientes:read:own'
  ],
  delivery: [
    'pedidos:read:assigned',
    'pedidos:update:status',
    'asignaciones:read:own'
  ],
  'N/A': []
};
```

## 🚀 Reglas de Deployment y Performance

### 1. Variables de Entorno

```bash
# ✅ CORRECTO: Variables específicas del proyecto
# .env.local
DATABASE_URL="mysql://user:password@host:port/delivery_tracker"

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-...@your-project.iam.gserviceaccount.com"

# Desarrollo
NEXT_PUBLIC_USE_FIREBASE_EMULATOR="false"
NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST="localhost:9099"
```

### 2. Scripts de Package.json

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio",
    "db:seed": "tsx src/db/seed.ts"
  }
}
```

### 3. Optimizaciones Específicas

```typescript
// ✅ CORRECTO: Lazy loading de componentes pesados
const PedidosTable = dynamic(() => import('@/components/pedidos/pedidos-table'), {
  loading: () => <TableSkeleton />,
  ssr: false
});

// ✅ CORRECTO: Memoización de queries costosas
const memoizedPedidos = useMemo(() => {
  return pedidos.filter(p => p.estado === filtroEstado);
}, [pedidos, filtroEstado]);

// ✅ CORRECTO: Server Components para data fetching
export default async function PedidosPage() {
  const pedidos = await getPedidosByOrganization(organizationId);
  
  return (
    <div>
      <PedidosTable data={pedidos} />
    </div>
  );
}

// ✅ CORRECTO: Paginación para grandes datasets
export async function getPedidosPaginated(
  organizationId: number,
  page: number = 1,
  limit: number = 20
) {
  const offset = (page - 1) * limit;
  
  const [pedidos, total] = await Promise.all([
    db.query.pedidos.findMany({
      where: eq(pedidos.organizationId, organizationId),
      limit,
      offset,
      orderBy: [desc(pedidos.createdAt)]
    }),
    db.select({ count: count() })
      .from(pedidos)
      .where(eq(pedidos.organizationId, organizationId))
  ]);
  
  return {
    data: pedidos,
    pagination: {
      page,
      limit,
      total: total[0].count,
      totalPages: Math.ceil(total[0].count / limit)
    }
  };
}

// ✅ CORRECTO: Cache de queries frecuentes
import { unstable_cache } from 'next/cache';

export const getCachedOrganizationStats = unstable_cache(
  async (organizationId: number) => {
    return await db.select({
      totalPedidos: count(pedidos.id),
      totalClientes: count(clientes.id),
      totalProductos: count(productos.id)
    })
    .from(pedidos)
    .leftJoin(clientes, eq(clientes.organizationId, organizationId))
    .leftJoin(productos, eq(productos.organizationId, organizationId))
    .where(eq(pedidos.organizationId, organizationId));
  },
  ['organization-stats'],
  {
    revalidate: 300, // 5 minutos
    tags: ['organization-stats']
  }
);
```

### 4. Configuración de Vercel

```json
// vercel.json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 2 * * *"
    }
  ],
  "env": {
    "DATABASE_URL": "@database-url",
    "FIREBASE_PRIVATE_KEY": "@firebase-private-key"
  }
}
```

## 🔒 Reglas de Seguridad Avanzada

### 1. Validación de Entrada Robusta

```typescript
// ✅ CORRECTO: Validación con Zod y sanitización
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

const PedidoInputSchema = z.object({
  clienteId: z.number().int().positive(),
  direccionEntrega: z.string()
    .min(10, 'Dirección muy corta')
    .max(500, 'Dirección muy larga')
    .transform(val => DOMPurify.sanitize(val)),
  notas: z.string().optional()
    .transform(val => val ? DOMPurify.sanitize(val) : undefined),
  detalles: z.array(z.object({
    productoId: z.number().int().positive(),
    cantidad: z.number().int().min(1).max(1000),
    precio: z.number().positive().max(999999.99)
  })).min(1, 'Debe incluir al menos un producto')
});

// ✅ CORRECTO: Rate limiting por organización
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  organizationId: number,
  maxRequests: number = 100,
  windowMs: number = 60000
): boolean {
  const key = `org_${organizationId}`;
  const now = Date.now();
  const windowStart = now - windowMs;
  
  const current = rateLimitMap.get(key);
  
  if (!current || current.resetTime < windowStart) {
    rateLimitMap.set(key, { count: 1, resetTime: now });
    return true;
  }
  
  if (current.count >= maxRequests) {
    return false;
  }
  
  current.count++;
  return true;
}
```

### 2. Auditoría y Logging

```typescript
// ✅ CORRECTO: Sistema de auditoría
export const auditLog = mysqlTable('audit_logs', {
  id: serial('id').primaryKey(),
  organizationId: int('organization_id').notNull(),
  userId: int('user_id').notNull(),
  action: varchar('action', { length: 100 }).notNull(),
  resourceType: varchar('resource_type', { length: 50 }).notNull(),
  resourceId: int('resource_id'),
  oldValues: json('old_values'),
  newValues: json('new_values'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// ✅ CORRECTO: Función de auditoría
export async function createAuditLog({
  organizationId,
  userId,
  action,
  resourceType,
  resourceId,
  oldValues,
  newValues,
  request
}: AuditLogParams) {
  const ipAddress = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  await db.insert(auditLog).values({
    organizationId,
    userId,
    action,
    resourceType,
    resourceId,
    oldValues,
    newValues,
    ipAddress,
    userAgent
  });
}
```

### 3. Encriptación de Datos Sensibles

```typescript
// ✅ CORRECTO: Encriptación de campos sensibles
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;
const ALGORITHM = 'aes-256-gcm';

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
  cipher.setAAD(Buffer.from('delivery-tracker'));
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedText.split(':');
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
  decipher.setAAD(Buffer.from('delivery-tracker'));
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// ✅ CORRECTO: Uso en esquemas sensibles
export const clientesSensitive = mysqlTable('clientes', {
  id: serial('id').primaryKey(),
  nombre: varchar('nombre', { length: 255 }).notNull(),
  telefono: varchar('telefono', { length: 20 })
    .transform(val => val ? encrypt(val) : null), // Encriptar teléfono
  email: varchar('email', { length: 255 })
    .transform(val => val ? encrypt(val) : null), // Encriptar email
  direccion: text('direccion')
    .transform(val => val ? encrypt(val) : null), // Encriptar dirección
  organizationId: int('organization_id').notNull()
});
```

### 4. Validación de Permisos Granular

```typescript
// ✅ CORRECTO: Sistema de permisos granular
type Permission = 
  | 'pedidos:create' | 'pedidos:read' | 'pedidos:update' | 'pedidos:delete'
  | 'clientes:create' | 'clientes:read' | 'clientes:update' | 'clientes:delete'
  | 'productos:create' | 'productos:read' | 'productos:update' | 'productos:delete'
  | 'repartidores:create' | 'repartidores:read' | 'repartidores:update'
  | 'organization:admin' | 'organization:settings';

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'pedidos:create', 'pedidos:read', 'pedidos:update', 'pedidos:delete',
    'clientes:create', 'clientes:read', 'clientes:update', 'clientes:delete',
    'productos:create', 'productos:read', 'productos:update', 'productos:delete',
    'repartidores:create', 'repartidores:read', 'repartidores:update',
    'organization:admin', 'organization:settings'
  ],
  service_client: [
    'pedidos:create', 'pedidos:read',
    'clientes:create', 'clientes:read', 'clientes:update'
  ],
  delivery: [
    'pedidos:read', 'pedidos:update'
  ],
  'N/A': []
};

export function hasPermission(
  userRole: UserRole,
  permission: Permission
): boolean {
  return ROLE_PERMISSIONS[userRole].includes(permission);
}

// ✅ CORRECTO: Middleware de permisos
export function requirePermission(permission: Permission) {
  return async (request: NextRequest) => {
    const user = await getCurrentUser(request);
    
    if (!user || !hasPermission(user.role, permission)) {
      return NextResponse.json(
        { error: 'Permisos insuficientes' },
        { status: 403 }
      );
    }
    
    return null; // Continuar
  };
}
```

## 🧪 Reglas de Testing

### 1. Tests de API Routes

```typescript
// ✅ CORRECTO: Test de API con autenticación
import { POST } from '@/app/api/pedidos/route';
import { NextRequest } from 'next/server';

describe('/api/pedidos', () => {
  it('debe crear un pedido válido', async () => {
    const request = new NextRequest('http://localhost:3000/api/pedidos', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-firebase-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clienteId: 1,
        direccionEntrega: 'Calle 123',
        detalles: [{
          productoId: 1,
          cantidad: 2,
          precio: 10.50
        }]
      })
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(201);
    expect(data.id).toBeDefined();
  });
});
```

### 2. Tests de Componentes

```typescript
// ✅ CORRECTO: Test de componente con contexto
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '@/hooks/useAuth';
import { PedidoCard } from '@/components/pedidos/pedido-card';

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <AuthProvider>
      <OrganizationProvider>
        {component}
      </OrganizationProvider>
    </AuthProvider>
  );
};

describe('PedidoCard', () => {
  it('debe mostrar información del pedido', () => {
    const pedido = {
      id: 1,
      clienteNombre: 'Juan Pérez',
      estado: 'pendiente' as const,
      total: 25.50
    };
    
    renderWithProviders(<PedidoCard pedido={pedido} />);
    
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('$25.50')).toBeInTheDocument();
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
  });
});
```

## 📋 Checklist de Desarrollo

### Antes de cada commit:
- [ ] Código lintado sin errores (`npm run lint`)
- [ ] Todas las queries incluyen filtro por `organizationId`
- [ ] APIs verifican autenticación Firebase
- [ ] Componentes usan Radix UI como base
- [ ] Formularios validados con Zod
- [ ] Estados de pedidos siguen transiciones válidas
- [ ] Variables de entorno documentadas

### Antes de cada deploy:
- [ ] Build exitoso (`npm run build`)
- [ ] Migraciones aplicadas (`npm run db:migrate`)
- [ ] Variables de entorno configuradas en Vercel
- [ ] Tests de API pasando
- [ ] Verificación multi-tenant funcionando
- [ ] Firebase Auth configurado correctamente
- [ ] Rate limiting configurado
- [ ] Logs de auditoría funcionando
- [ ] Encriptación de datos sensibles activa

### Code Review:
- [ ] Verificación de organización en todas las queries
- [ ] Manejo de errores implementado
- [ ] Tipos TypeScript correctos
- [ ] Componentes accesibles (Radix UI)
- [ ] Performance optimizada (lazy loading, memoización)
- [ ] Seguridad: no exposición de datos entre organizaciones
- [ ] Validación de permisos granular
- [ ] Sanitización de inputs
- [ ] Logging de acciones críticas

### Monitoreo en Producción:
- [ ] Métricas de performance configuradas
- [ ] Alertas de errores activas
- [ ] Monitoreo de base de datos
- [ ] Logs de seguridad revisados
- [ ] Backup de base de datos funcionando

## 🏛️ Patrones de Arquitectura Avanzada

### 1. Repository Pattern con Drizzle

```typescript
// ✅ CORRECTO: Repository pattern para abstracción de datos
interface IPedidoRepository {
  findByOrganization(organizationId: number): Promise<Pedido[]>;
  create(data: CreatePedidoData, organizationId: number): Promise<Pedido>;
  update(id: number, data: UpdatePedidoData, organizationId: number): Promise<Pedido>;
  delete(id: number, organizationId: number): Promise<void>;
}

export class PedidoRepository implements IPedidoRepository {
  constructor(private db: DrizzleDB) {}
  
  async findByOrganization(organizationId: number): Promise<Pedido[]> {
    return await this.db.query.pedidos.findMany({
      where: eq(pedidos.organizationId, organizationId),
      with: {
        cliente: true,
        detalles: {
          with: { producto: true }
        },
        asignacion: {
          with: { repartidor: true }
        }
      },
      orderBy: [desc(pedidos.createdAt)]
    });
  }
  
  async create(data: CreatePedidoData, organizationId: number): Promise<Pedido> {
    return await this.db.transaction(async (tx) => {
      // Verificar que el cliente pertenece a la organización
      const cliente = await tx.query.clientes.findFirst({
        where: and(
          eq(clientes.id, data.clienteId),
          eq(clientes.organizationId, organizationId)
        )
      });
      
      if (!cliente) {
        throw new Error('Cliente no encontrado en la organización');
      }
      
      const [pedido] = await tx.insert(pedidos)
        .values({ ...data, organizationId })
        .returning();
      
      // Crear detalles del pedido
      if (data.detalles?.length) {
        await tx.insert(detallesPedido).values(
          data.detalles.map(detalle => ({
            ...detalle,
            pedidoId: pedido.id
          }))
        );
      }
      
      return pedido;
    });
  }
}

// ✅ CORRECTO: Service layer con inyección de dependencias
export class PedidoService {
  constructor(
    private pedidoRepo: IPedidoRepository,
    private notificationService: INotificationService,
    private auditService: IAuditService
  ) {}
  
  async createPedido(
    data: CreatePedidoData,
    organizationId: number,
    userId: string
  ): Promise<Pedido> {
    // Validación de negocio
    await this.validatePedidoData(data, organizationId);
    
    // Crear pedido
    const pedido = await this.pedidoRepo.create(data, organizationId);
    
    // Auditoría
    await this.auditService.log({
      action: 'pedido:created',
      resourceId: pedido.id,
      userId,
      organizationId
    });
    
    // Notificación asíncrona
    this.notificationService.sendPedidoCreated(pedido).catch(console.error);
    
    return pedido;
  }
}
```

### 2. Event-Driven Architecture

```typescript
// ✅ CORRECTO: Sistema de eventos para desacoplamiento
type DomainEvent = {
  id: string;
  type: string;
  aggregateId: string;
  organizationId: number;
  payload: Record<string, any>;
  timestamp: Date;
  userId?: string;
};

class EventBus {
  private handlers = new Map<string, Array<(event: DomainEvent) => Promise<void>>>();
  
  subscribe(eventType: string, handler: (event: DomainEvent) => Promise<void>) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }
  
  async publish(event: DomainEvent) {
    const handlers = this.handlers.get(event.type) || [];
    
    // Ejecutar handlers en paralelo
    await Promise.allSettled(
      handlers.map(handler => handler(event))
    );
    
    // Persistir evento para replay/debugging
    await this.persistEvent(event);
  }
  
  private async persistEvent(event: DomainEvent) {
    await db.insert(domainEvents).values({
      id: event.id,
      type: event.type,
      aggregateId: event.aggregateId,
      organizationId: event.organizationId,
      payload: JSON.stringify(event.payload),
      timestamp: event.timestamp,
      userId: event.userId
    });
  }
}

// ✅ CORRECTO: Event handlers específicos
class PedidoEventHandlers {
  static async onPedidoCreated(event: DomainEvent) {
    const { pedidoId, clienteId } = event.payload;
    
    // Actualizar estadísticas del cliente
    await db.update(clientes)
      .set({ 
        totalPedidos: sql`total_pedidos + 1`,
        ultimoPedido: new Date()
      })
      .where(and(
        eq(clientes.id, clienteId),
        eq(clientes.organizationId, event.organizationId)
      ));
  }
  
  static async onPedidoAsignado(event: DomainEvent) {
    const { pedidoId, repartidorId } = event.payload;
    
    // Notificar al repartidor
    await notificationService.sendToRepartidor(repartidorId, {
      type: 'nuevo_pedido',
      pedidoId,
      message: 'Tienes un nuevo pedido asignado'
    });
  }
}

// Registrar handlers
eventBus.subscribe('pedido.created', PedidoEventHandlers.onPedidoCreated);
eventBus.subscribe('pedido.asignado', PedidoEventHandlers.onPedidoAsignado);
```

### 3. CQRS Pattern para Queries Complejas

```typescript
// ✅ CORRECTO: Separación de Commands y Queries
interface IQuery<TResult> {
  execute(): Promise<TResult>;
}

interface ICommand<TResult = void> {
  execute(): Promise<TResult>;
}

// Query para dashboard con métricas
class DashboardMetricsQuery implements IQuery<DashboardMetrics> {
  constructor(
    private db: DrizzleDB,
    private organizationId: number,
    private dateRange: { from: Date; to: Date }
  ) {}
  
  async execute(): Promise<DashboardMetrics> {
    const [pedidosStats, ventasStats, repartidoresStats] = await Promise.all([
      this.getPedidosStats(),
      this.getVentasStats(),
      this.getRepartidoresStats()
    ]);
    
    return {
      pedidos: pedidosStats,
      ventas: ventasStats,
      repartidores: repartidoresStats,
      generatedAt: new Date()
    };
  }
  
  private async getPedidosStats() {
    return await this.db
      .select({
        total: count(),
        pendientes: count(case().when(eq(pedidos.estado, 'pendiente')).then(1)),
        enProceso: count(case().when(eq(pedidos.estado, 'en_proceso')).then(1)),
        entregados: count(case().when(eq(pedidos.estado, 'entregado')).then(1)),
        cancelados: count(case().when(eq(pedidos.estado, 'cancelado')).then(1))
      })
      .from(pedidos)
      .where(and(
        eq(pedidos.organizationId, this.organizationId),
        between(pedidos.createdAt, this.dateRange.from, this.dateRange.to)
      ));
  }
}

// Command para operaciones complejas
class AsignarPedidoCommand implements ICommand<void> {
  constructor(
    private pedidoId: number,
    private repartidorId: number,
    private organizationId: number,
    private userId: string
  ) {}
  
  async execute(): Promise<void> {
    await db.transaction(async (tx) => {
      // Verificar que el pedido existe y está disponible
      const pedido = await tx.query.pedidos.findFirst({
        where: and(
          eq(pedidos.id, this.pedidoId),
          eq(pedidos.organizationId, this.organizationId),
          eq(pedidos.estado, 'pendiente')
        )
      });
      
      if (!pedido) {
        throw new Error('Pedido no disponible para asignación');
      }
      
      // Verificar disponibilidad del repartidor
      const repartidor = await tx.query.repartidores.findFirst({
        where: and(
          eq(repartidores.id, this.repartidorId),
          eq(repartidores.organizationId, this.organizationId),
          eq(repartidores.disponible, true)
        )
      });
      
      if (!repartidor) {
        throw new Error('Repartidor no disponible');
      }
      
      // Crear asignación
      await tx.insert(asignacionesPedido).values({
        pedidoId: this.pedidoId,
        repartidorId: this.repartidorId,
        fechaAsignacion: new Date()
      });
      
      // Actualizar estado del pedido
      await tx.update(pedidos)
        .set({ estado: 'asignado' })
        .where(eq(pedidos.id, this.pedidoId));
      
      // Publicar evento
      await eventBus.publish({
        id: crypto.randomUUID(),
        type: 'pedido.asignado',
        aggregateId: this.pedidoId.toString(),
        organizationId: this.organizationId,
        payload: {
          pedidoId: this.pedidoId,
          repartidorId: this.repartidorId
        },
        timestamp: new Date(),
        userId: this.userId
      });
    });
  }
}
```

## 📊 Monitoreo y Métricas

### 1. Métricas de Performance

```typescript
// ✅ CORRECTO: Métricas personalizadas con contexto organizacional
export async function trackMetric(
  organizationId: number,
  metricName: string,
  value: number,
  tags?: Record<string, string>
) {
  const metric = {
    organizationId,
    metricName,
    value,
    tags: {
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version,
      ...tags
    },
    timestamp: new Date().toISOString()
  };
  
  // En desarrollo, solo log
  if (process.env.NODE_ENV === 'development') {
    console.log(`[METRIC] ${metricName}: ${value}`, metric);
    return;
  }
  
  // En producción, enviar a múltiples destinos
  await Promise.allSettled([
    // Vercel Analytics
    fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metric)
    }),
    
    // Base de datos para análisis histórico
    db.insert(metrics).values({
      organizationId,
      name: metricName,
      value,
      tags: JSON.stringify(tags),
      timestamp: new Date()
    })
  ]);
}

// ✅ CORRECTO: Middleware de métricas
export function withMetrics<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  metricName: string
) {
  return async (...args: T): Promise<R> => {
    const startTime = Date.now();
    
    try {
      const result = await fn(...args);
      const duration = Date.now() - startTime;
      
      await trackMetric(0, `${metricName}.duration`, duration, {
        status: 'success'
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      await trackMetric(0, `${metricName}.duration`, duration, {
        status: 'error',
        error: error.message
      });
      
      throw error;
    }
  };
}
```

### 2. Health Checks

```typescript
// ✅ CORRECTO: API de health check
// app/api/health/route.ts
export async function GET() {
  const checks = {
    database: false,
    firebase: false,
    timestamp: new Date().toISOString()
  };
  
  try {
    // Verificar base de datos
    await db.select({ count: count() }).from(users).limit(1);
    checks.database = true;
  } catch (error) {
    console.error('Database health check failed:', error);
  }
  
  try {
    // Verificar Firebase
    await adminAuth.listUsers(1);
    checks.firebase = true;
  } catch (error) {
    console.error('Firebase health check failed:', error);
  }
  
  const isHealthy = checks.database && checks.firebase;
  
  return NextResponse.json(checks, {
    status: isHealthy ? 200 : 503
  });
}
```

### 3. Alertas y Notificaciones

```typescript
// ✅ CORRECTO: Sistema de alertas con escalamiento
type AlertLevel = 'info' | 'warning' | 'error' | 'critical';
type AlertChannel = 'console' | 'webhook' | 'email' | 'sms';

interface AlertConfig {
  level: AlertLevel;
  channels: AlertChannel[];
  throttle?: number; // minutos
  escalation?: {
    after: number; // minutos
    to: AlertChannel[];
  };
}

class AlertManager {
  private throttleCache = new Map<string, Date>();
  
  async sendAlert(
    message: string,
    context: Record<string, any> = {},
    config: AlertConfig
  ) {
    const alertKey = `${config.level}:${message}`;
    
    // Verificar throttling
    if (this.isThrottled(alertKey, config.throttle)) {
      return;
    }
    
    const alert = {
      id: crypto.randomUUID(),
      level: config.level,
      message,
      context: {
        ...context,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        version: process.env.npm_package_version
      }
    };
    
    // Enviar a canales configurados
    await Promise.allSettled(
      config.channels.map(channel => this.sendToChannel(alert, channel))
    );
    
    // Programar escalamiento si está configurado
    if (config.escalation) {
      setTimeout(() => {
        this.escalateAlert(alert, config.escalation!);
      }, config.escalation.after * 60 * 1000);
    }
    
    // Actualizar throttle
    this.throttleCache.set(alertKey, new Date());
  }
  
  private async sendToChannel(alert: any, channel: AlertChannel) {
    switch (channel) {
      case 'console':
        console.log(`[ALERT:${alert.level.toUpperCase()}] ${alert.message}`, alert.context);
        break;
        
      case 'webhook':
        if (process.env.WEBHOOK_URL) {
          await fetch(process.env.WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: `🚨 ${alert.level.toUpperCase()}: ${alert.message}`,
              attachments: [{
                color: this.getAlertColor(alert.level),
                fields: Object.entries(alert.context).map(([key, value]) => ({
                  title: key,
                  value: String(value),
                  short: true
                }))
              }]
            })
          });
        }
        break;
        
      case 'email':
        // Implementar envío de email
        break;
        
      case 'sms':
        // Implementar envío de SMS para alertas críticas
        break;
    }
  }
  
  private isThrottled(key: string, throttleMinutes?: number): boolean {
    if (!throttleMinutes) return false;
    
    const lastSent = this.throttleCache.get(key);
    if (!lastSent) return false;
    
    const now = new Date();
    const diffMinutes = (now.getTime() - lastSent.getTime()) / (1000 * 60);
    
    return diffMinutes < throttleMinutes;
  }
  
  private getAlertColor(level: AlertLevel): string {
    const colors = {
      info: 'good',
      warning: 'warning', 
      error: 'danger',
      critical: 'danger'
    };
    return colors[level];
  }
}

// ✅ CORRECTO: Configuraciones predefinidas de alertas
export const alertManager = new AlertManager();

export const AlertConfigs = {
  DATABASE_ERROR: {
    level: 'critical' as AlertLevel,
    channels: ['console', 'webhook', 'email'] as AlertChannel[],
    throttle: 5,
    escalation: {
      after: 10,
      to: ['sms'] as AlertChannel[]
    }
  },
  
  PERFORMANCE_WARNING: {
    level: 'warning' as AlertLevel,
    channels: ['console', 'webhook'] as AlertChannel[],
    throttle: 15
  },
  
  SECURITY_BREACH: {
    level: 'critical' as AlertLevel,
    channels: ['console', 'webhook', 'email', 'sms'] as AlertChannel[],
    throttle: 0 // Sin throttling para seguridad
  }
};
```

## 🚀 Optimizaciones de Performance Avanzadas

### 1. Caching Estratégico Multi-Nivel

```typescript
// ✅ CORRECTO: Sistema de cache con múltiples niveles
import { unstable_cache } from 'next/cache';
import { Redis } from 'ioredis';

class CacheManager {
  private redis: Redis;
  private memoryCache = new Map<string, { data: any; expires: number }>();
  
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL!);
  }
  
  // Nivel 1: Memory cache (más rápido)
  private getFromMemory<T>(key: string): T | null {
    const cached = this.memoryCache.get(key);
    if (!cached || Date.now() > cached.expires) {
      this.memoryCache.delete(key);
      return null;
    }
    return cached.data;
  }
  
  private setInMemory<T>(key: string, data: T, ttlSeconds: number) {
    this.memoryCache.set(key, {
      data,
      expires: Date.now() + (ttlSeconds * 1000)
    });
  }
  
  // Nivel 2: Redis cache (compartido entre instancias)
  private async getFromRedis<T>(key: string): Promise<T | null> {
    try {
      const cached = await this.redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }
  
  private async setInRedis<T>(key: string, data: T, ttlSeconds: number) {
    try {
      await this.redis.setex(key, ttlSeconds, JSON.stringify(data));
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }
  
  // Método principal de cache con fallback
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: {
      memoryTTL?: number;
      redisTTL?: number;
      organizationId?: number;
    } = {}
  ): Promise<T> {
    const { memoryTTL = 60, redisTTL = 300, organizationId } = options;
    const cacheKey = organizationId ? `org:${organizationId}:${key}` : key;
    
    // Nivel 1: Verificar memory cache
    let data = this.getFromMemory<T>(cacheKey);
    if (data) {
      await trackMetric(organizationId || 0, 'cache.memory.hit', 1);
      return data;
    }
    
    // Nivel 2: Verificar Redis cache
    data = await this.getFromRedis<T>(cacheKey);
    if (data) {
      // Guardar en memory para próximas consultas
      this.setInMemory(cacheKey, data, memoryTTL);
      await trackMetric(organizationId || 0, 'cache.redis.hit', 1);
      return data;
    }
    
    // Nivel 3: Ejecutar fetcher y cachear resultado
    await trackMetric(organizationId || 0, 'cache.miss', 1);
    data = await fetcher();
    
    // Guardar en ambos niveles
    this.setInMemory(cacheKey, data, memoryTTL);
    await this.setInRedis(cacheKey, data, redisTTL);
    
    return data;
  }
  
  // Invalidación de cache por patrones
  async invalidatePattern(pattern: string, organizationId?: number) {
    const fullPattern = organizationId ? `org:${organizationId}:${pattern}` : pattern;
    
    // Limpiar memory cache
    for (const key of this.memoryCache.keys()) {
      if (key.includes(fullPattern)) {
        this.memoryCache.delete(key);
      }
    }
    
    // Limpiar Redis cache
    try {
      const keys = await this.redis.keys(fullPattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error('Redis invalidation error:', error);
    }
  }
}

export const cacheManager = new CacheManager();

// ✅ CORRECTO: Uso del cache en queries frecuentes
export async function getPedidosDashboard(organizationId: number) {
  return await cacheManager.get(
    'dashboard:pedidos',
    async () => {
      return await db.query.pedidos.findMany({
        where: eq(pedidos.organizationId, organizationId),
        with: {
          cliente: true,
          asignacion: {
            with: { repartidor: true }
          }
        },
        orderBy: [desc(pedidos.createdAt)],
        limit: 50
      });
    },
    {
      memoryTTL: 30,
      redisTTL: 120,
      organizationId
    }
  );
}
```

### 2. Optimización de Queries con Índices Inteligentes

```typescript
// ✅ CORRECTO: Índices compuestos optimizados
export const pedidos = mysqlTable('pedidos', {
  id: serial('id').primaryKey(),
  organizationId: int('organization_id').notNull(),
  clienteId: int('cliente_id').notNull(),
  estado: varchar('estado', { length: 50 }).notNull().default('pendiente'),
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull(),
  fechaEntrega: timestamp('fecha_entrega'),
  total: decimal('total', { precision: 10, scale: 2 }).notNull()
}, (table) => ({
  // Índice compuesto para queries más frecuentes
  orgEstadoFecha: index('idx_org_estado_fecha')
    .on(table.organizationId, table.estado, table.fechaCreacion),
  
  // Índice para búsquedas por cliente
  orgCliente: index('idx_org_cliente')
    .on(table.organizationId, table.clienteId),
  
  // Índice para reportes de ventas
  orgFechaTotal: index('idx_org_fecha_total')
    .on(table.organizationId, table.fechaCreacion, table.total),
  
  // Índice parcial para pedidos activos
  orgEstadoActivo: index('idx_org_estado_activo')
    .on(table.organizationId, table.estado)
    .where(sql`estado IN ('pendiente', 'en_proceso', 'asignado')`)
}));

// ✅ CORRECTO: Query optimizada con hint de índice
export async function getPedidosActivosPorOrganizacion(
  organizationId: number,
  limit: number = 50
) {
  return await db
    .select({
      id: pedidos.id,
      clienteNombre: clientes.nombre,
      estado: pedidos.estado,
      fechaCreacion: pedidos.fechaCreacion,
      total: pedidos.total
    })
    .from(pedidos)
    .innerJoin(clientes, eq(pedidos.clienteId, clientes.id))
    .where(and(
      eq(pedidos.organizationId, organizationId),
      inArray(pedidos.estado, ['pendiente', 'en_proceso', 'asignado'])
    ))
    .orderBy(desc(pedidos.fechaCreacion))
    .limit(limit);
}
```

### 3. Paginación Eficiente con Cursor

```typescript
// ✅ CORRECTO: Paginación cursor-based para mejor performance
interface CursorPaginationParams {
  cursor?: string;
  limit?: number;
  organizationId: number;
}

interface PaginatedResult<T> {
  data: T[];
  nextCursor?: string;
  hasMore: boolean;
  total?: number;
}

export async function getPedidosPaginated({
  cursor,
  limit = 20,
  organizationId
}: CursorPaginationParams): Promise<PaginatedResult<Pedido>> {
  const whereConditions = [eq(pedidos.organizationId, organizationId)];
  
  // Si hay cursor, agregar condición para paginación
  if (cursor) {
    const decodedCursor = Buffer.from(cursor, 'base64').toString();
    const [id, timestamp] = decodedCursor.split('|');
    
    whereConditions.push(
      or(
        lt(pedidos.fechaCreacion, new Date(timestamp)),
        and(
          eq(pedidos.fechaCreacion, new Date(timestamp)),
          lt(pedidos.id, parseInt(id))
        )
      )!
    );
  }
  
  // Obtener un elemento extra para verificar si hay más páginas
  const results = await db.query.pedidos.findMany({
    where: and(...whereConditions),
    with: {
      cliente: {
        columns: { nombre: true, telefono: true }
      },
      asignacion: {
        with: {
          repartidor: {
            columns: { nombre: true, telefono: true }
          }
        }
      }
    },
    orderBy: [desc(pedidos.fechaCreacion), desc(pedidos.id)],
    limit: limit + 1
  });
  
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, -1) : results;
  
  let nextCursor: string | undefined;
  if (hasMore && data.length > 0) {
    const lastItem = data[data.length - 1];
    const cursorData = `${lastItem.id}|${lastItem.fechaCreacion.toISOString()}`;
    nextCursor = Buffer.from(cursorData).toString('base64');
  }
  
  return {
    data,
    nextCursor,
    hasMore
  };
}
```

## 🚀 DevOps y CI/CD

### 1. Pipeline de GitHub Actions

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18'
  PNPM_VERSION: '8'

jobs:
  test:
    name: Test & Lint
    runs-on: ubuntu-latest
    
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: test
          MYSQL_DATABASE: delivery_tracker_test
        ports:
          - 3306:3306
        options: --health-cmd="mysqladmin ping" --health-interval=10s --health-timeout=5s --health-retries=3
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
      
      - name: Get pnpm store directory
        shell: bash
        run: echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_ENV
      
      - name: Setup pnpm cache
        uses: actions/cache@v3
        with:
          path: ${{ env.STORE_PATH }}
          key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-store-
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Type check
        run: pnpm type-check
      
      - name: Lint
        run: pnpm lint
      
      - name: Run database migrations
        run: pnpm db:migrate
        env:
          DATABASE_URL: mysql://root:test@localhost:3306/delivery_tracker_test
      
      - name: Run tests
        run: pnpm test:ci
        env:
          DATABASE_URL: mysql://root:test@localhost:3306/delivery_tracker_test
          FIREBASE_PROJECT_ID: test-project
          FIREBASE_PRIVATE_KEY: ${{ secrets.FIREBASE_PRIVATE_KEY_TEST }}
          FIREBASE_CLIENT_EMAIL: test@test.iam.gserviceaccount.com
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella

  security:
    name: Security Scan
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'
      
      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'
      
      - name: Audit dependencies
        run: |
          npm audit --audit-level=high
          pnpm audit --audit-level=high

  build:
    name: Build & Deploy
    runs-on: ubuntu-latest
    needs: [test, security]
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Build application
        run: pnpm build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
          FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
      
      - name: Run post-deployment tests
        run: pnpm test:e2e:prod
        env:
          E2E_BASE_URL: ${{ steps.deploy.outputs.preview-url }}
```

### 2. Configuración de Dependabot

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
    open-pull-requests-limit: 10
    reviewers:
      - "@team-leads"
    assignees:
      - "@maintainers"
    commit-message:
      prefix: "deps"
      include: "scope"
    ignore:
      - dependency-name: "*"
        update-types: ["version-update:semver-major"]
    groups:
      development-dependencies:
        dependency-type: "development"
      production-dependencies:
        dependency-type: "production"

  - package-ecosystem: "github-actions"
    directory: "/.github/workflows"
    schedule:
      interval: "monthly"
```

### 3. Scripts de Deployment Automatizado

```json
// package.json - Scripts optimizados
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint --fix",
    "lint:check": "next lint",
    "type-check": "tsc --noEmit",
    "test": "jest --watch",
    "test:ci": "jest --ci --coverage --watchAll=false",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:prod": "playwright test --config=playwright.prod.config.ts",
    "db:generate": "drizzle-kit generate:mysql",
    "db:migrate": "drizzle-kit push:mysql",
    "db:studio": "drizzle-kit studio",
    "db:seed": "tsx scripts/seed.ts",
    "db:reset": "tsx scripts/reset-db.ts",
    "prepare": "husky install",
    "pre-commit": "lint-staged",
    "pre-push": "pnpm type-check && pnpm test:ci",
    "deploy:staging": "vercel --target staging",
    "deploy:prod": "vercel --prod",
    "health-check": "tsx scripts/health-check.ts",
    "backup:db": "tsx scripts/backup-database.ts",
    "analyze": "ANALYZE=true next build",
    "bundle-analyzer": "@next/bundle-analyzer"
  }
}
```

### 4. Configuración de Monitoreo en Producción

```typescript
// scripts/health-check.ts
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  checks: {
    database: boolean;
    redis?: boolean;
    firebase: boolean;
    external_apis: boolean;
  };
  timestamp: string;
  version: string;
}

export async function performHealthCheck(): Promise<HealthCheckResult> {
  const checks = {
    database: false,
    redis: false,
    firebase: false,
    external_apis: false
  };
  
  try {
    // Verificar base de datos
    await db.execute(sql`SELECT 1`);
    checks.database = true;
  } catch (error) {
    console.error('Database health check failed:', error);
  }
  
  try {
    // Verificar Redis si está configurado
    if (process.env.REDIS_URL) {
      const { Redis } = await import('ioredis');
      const redis = new Redis(process.env.REDIS_URL);
      await redis.ping();
      checks.redis = true;
      await redis.disconnect();
    }
  } catch (error) {
    console.error('Redis health check failed:', error);
  }
  
  try {
    // Verificar Firebase
    const { getAuth } = await import('firebase-admin/auth');
    await getAuth().listUsers(1);
    checks.firebase = true;
  } catch (error) {
    console.error('Firebase health check failed:', error);
  }
  
  try {
    // Verificar APIs externas críticas
    const response = await fetch('https://api.example.com/health', {
      timeout: 5000
    });
    checks.external_apis = response.ok;
  } catch (error) {
    console.error('External API health check failed:', error);
  }
  
  const allHealthy = Object.values(checks).every(Boolean);
  
  return {
    status: allHealthy ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || 'unknown'
  };
}

// Ejecutar health check si es llamado directamente
if (require.main === module) {
  performHealthCheck()
    .then(result => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.status === 'healthy' ? 0 : 1);
    })
    .catch(error => {
      console.error('Health check failed:', error);
      process.exit(1);
    });
}
```

### 5. Configuración de Backup Automatizado

```typescript
// scripts/backup-database.ts
import { exec } from 'child_process';
import { promisify } from 'util';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { createReadStream } from 'fs';
import { unlink } from 'fs/promises';

const execAsync = promisify(exec);

interface BackupConfig {
  retention: number; // días
  compression: boolean;
  encryption: boolean;
  destinations: ('s3' | 'local')[];
}

class DatabaseBackup {
  private s3Client: S3Client;
  
  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      }
    });
  }
  
  async createBackup(config: BackupConfig) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.sql`;
    const compressedFilename = `${filename}.gz`;
    
    try {
      // Crear dump de la base de datos
      console.log('Creating database dump...');
      await this.createDatabaseDump(filename);
      
      // Comprimir si está habilitado
      let finalFilename = filename;
      if (config.compression) {
        console.log('Compressing backup...');
        await this.compressFile(filename, compressedFilename);
        await unlink(filename);
        finalFilename = compressedFilename;
      }
      
      // Subir a destinos configurados
      for (const destination of config.destinations) {
        switch (destination) {
          case 's3':
            await this.uploadToS3(finalFilename, config);
            break;
          case 'local':
            console.log(`Backup saved locally: ${finalFilename}`);
            break;
        }
      }
      
      // Limpiar archivos locales si se subió a S3
      if (config.destinations.includes('s3') && !config.destinations.includes('local')) {
        await unlink(finalFilename);
      }
      
      console.log('Backup completed successfully');
      
    } catch (error) {
      console.error('Backup failed:', error);
      throw error;
    }
  }
  
  private async createDatabaseDump(filename: string) {
    const dbUrl = new URL(process.env.DATABASE_URL!);
    const command = `mysqldump -h ${dbUrl.hostname} -P ${dbUrl.port || 3306} -u ${dbUrl.username} -p${dbUrl.password} ${dbUrl.pathname.slice(1)} > ${filename}`;
    
    await execAsync(command);
  }
  
  private async compressFile(input: string, output: string) {
    await execAsync(`gzip -c ${input} > ${output}`);
  }
  
  private async uploadToS3(filename: string, config: BackupConfig) {
    const key = `database-backups/${filename}`;
    
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BACKUP_BUCKET!,
      Key: key,
      Body: createReadStream(filename),
      ServerSideEncryption: config.encryption ? 'AES256' : undefined,
      Metadata: {
        'backup-date': new Date().toISOString(),
        'retention-days': config.retention.toString()
      }
    });
    
    await this.s3Client.send(command);
    console.log(`Backup uploaded to S3: ${key}`);
  }
}

// Configuración por defecto
const defaultConfig: BackupConfig = {
  retention: 30,
  compression: true,
  encryption: true,
  destinations: ['s3']
};

// Ejecutar backup si es llamado directamente
if (require.main === module) {
  const backup = new DatabaseBackup();
  backup.createBackup(defaultConfig)
    .then(() => {
      console.log('Backup process completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Backup process failed:', error);
      process.exit(1);
    });
}
```

## 🧪 Reglas de Testing

### 1. Testing de API Routes

```typescript
// ✅ CORRECTO: Test de API route con autenticación
import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/pedidos';
import { verifyIdToken } from '@/lib/firebase-admin';

jest.mock('@/lib/firebase-admin');

describe('/api/pedidos', () => {
  beforeEach(() => {
    (verifyIdToken as jest.Mock).mockResolvedValue({
      uid: 'test-uid',
      organizationId: 1
    });
  });

  it('should create pedido with valid data', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        authorization: 'Bearer valid-token'
      },
      body: {
        clienteId: 1,
        productos: [{ id: 1, cantidad: 2 }],
        direccionEntrega: 'Test Address'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    expect(JSON.parse(res._getData())).toMatchObject({
      success: true,
      pedido: expect.objectContaining({
        clienteId: 1,
        organizationId: 1
      })
    });
  });
});
```

### 2. Testing de Componentes

```typescript
// ✅ CORRECTO: Test de componente con providers
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '@/contexts/AuthContext';
import { OrganizationProvider } from '@/contexts/OrganizationContext';
import PedidosList from '@/components/PedidosList';

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <OrganizationProvider>
      {children}
    </OrganizationProvider>
  </AuthProvider>
);

describe('PedidosList', () => {
  it('should render pedidos list', () => {
    const mockPedidos = [
      { id: 1, cliente: 'Test Cliente', estado: 'pendiente' }
    ];
    
    render(
      <PedidosList pedidos={mockPedidos} />,
      { wrapper: TestWrapper }
    );
    
    expect(screen.getByText('Test Cliente')).toBeInTheDocument();
  });
});
```

## 🌐 Internacionalización (i18n) y Accesibilidad (a11y)

### 1. Configuración de Internacionalización

```typescript
// lib/i18n/config.ts
import { createI18nMiddleware } from 'next-i18n-router';
import { i18nConfig } from '@/i18n-config';

export const locales = ['es', 'en', 'pt'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'es';

export const i18nConfig = {
  locales,
  defaultLocale,
  localeDetection: true,
  prefixDefault: false,
};

export const i18nMiddleware = createI18nMiddleware({
  ...i18nConfig,
  urlMappingStrategy: 'rewrite',
});

// Función para cargar traducciones según el idioma
export async function getTranslations(locale: Locale, namespace: string) {
  try {
    return (await import(`@/locales/${locale}/${namespace}.json`)).default;
  } catch (error) {
    console.error(`Could not load translations for ${locale}/${namespace}`, error);
    return {};
  }
}

// Hook personalizado para traducciones con soporte para variables
export function useTranslations(namespace: string) {
  const { locale } = useParams();
  const [translations, setTranslations] = useState<Record<string, string>>({}); 

  useEffect(() => {
    getTranslations(locale as Locale || defaultLocale, namespace)
      .then(setTranslations)
      .catch(console.error);
  }, [locale, namespace]);

  const t = useCallback((key: string, variables?: Record<string, string | number>) => {
    let text = translations[key] || key;
    
    if (variables) {
      Object.entries(variables).forEach(([varKey, value]) => {
        text = text.replace(new RegExp(`{{${varKey}}}`, 'g'), String(value));
      });
    }
    
    return text;
  }, [translations]);

  return { t };
}
```

### 2. Estructura de Archivos de Traducción

```json
// locales/es/common.json
{
  "app_name": "Delivery Tracker",
  "welcome": "Bienvenido a Delivery Tracker",
  "login": "Iniciar sesión",
  "logout": "Cerrar sesión",
  "dashboard": "Panel de control",
  "orders": "Pedidos",
  "customers": "Clientes",
  "products": "Productos",
  "settings": "Configuración",
  "organization": "Organización",
  "profile": "Perfil",
  "notifications": "Notificaciones",
  "search": "Buscar",
  "create_new": "Crear nuevo",
  "save": "Guardar",
  "cancel": "Cancelar",
  "delete": "Eliminar",
  "edit": "Editar",
  "view": "Ver",
  "status": "Estado",
  "date": "Fecha",
  "actions": "Acciones",
  "error_occurred": "Ha ocurrido un error",
  "try_again": "Intentar de nuevo",
  "loading": "Cargando...",
  "no_results": "No se encontraron resultados",
  "required_field": "Este campo es obligatorio",
  "invalid_format": "Formato inválido"
}

// locales/en/common.json
{
  "app_name": "Delivery Tracker",
  "welcome": "Welcome to Delivery Tracker",
  "login": "Log in",
  "logout": "Log out",
  "dashboard": "Dashboard",
  "orders": "Orders",
  "customers": "Customers",
  "products": "Products",
  "settings": "Settings",
  "organization": "Organization",
  "profile": "Profile",
  "notifications": "Notifications",
  "search": "Search",
  "create_new": "Create new",
  "save": "Save",
  "cancel": "Cancel",
  "delete": "Delete",
  "edit": "Edit",
  "view": "View",
  "status": "Status",
  "date": "Date",
  "actions": "Actions",
  "error_occurred": "An error has occurred",
  "try_again": "Try again",
  "loading": "Loading...",
  "no_results": "No results found",
  "required_field": "This field is required",
  "invalid_format": "Invalid format"
}
```

### 3. Implementación en Componentes

```tsx
// components/LanguageSwitcher.tsx
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { locales, Locale } from '@/lib/i18n/config';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] as Locale;
  
  const handleChangeLanguage = (locale: Locale) => {
    // Si estamos en la raíz o en la ruta actual del idioma
    if (pathname === '/' || locales.some(loc => pathname === `/${loc}`)) {
      router.push(`/${locale}`);
      return;
    }
    
    // Si ya tenemos un prefijo de idioma, lo reemplazamos
    if (locales.includes(pathname.split('/')[1] as Locale)) {
      router.push(`/${locale}${pathname.substring(3)}`);
      return;
    }
    
    // En cualquier otro caso, añadimos el prefijo
    router.push(`/${locale}${pathname}`);
  };
  
  return (
    <div className="flex items-center space-x-2">
      {locales.map((locale) => (
        <button
          key={locale}
          onClick={() => handleChangeLanguage(locale)}
          className={`px-2 py-1 rounded ${currentLocale === locale ? 'bg-primary text-white' : 'bg-gray-200'}`}
          aria-label={`Cambiar idioma a ${locale}`}
        >
          {locale.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
```

### 4. Middleware para Detección de Idioma

```typescript
// middleware.ts
import { NextRequest } from 'next/server';
import { i18nMiddleware } from '@/lib/i18n/config';

export function middleware(request: NextRequest) {
  return i18nMiddleware(request);
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### 5. Reglas de Accesibilidad (a11y)

#### Componentes Accesibles

```tsx
// components/ui/Button.tsx
import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:bg-primary/90',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'underline-offset-4 hover:underline text-primary',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, ...props }, ref) => {
    return (
      <button
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        disabled={props.disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span className="sr-only">Cargando...</span>
            {children}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
```

#### Utilidades de Accesibilidad

```typescript
// lib/a11y/focus-trap.ts
export function setupFocusTrap(containerElement: HTMLElement) {
  const focusableElements = containerElement.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
  
  // Función para manejar el ciclo de foco
  function handleTabKey(e: KeyboardEvent) {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      // Si shift + tab y estamos en el primer elemento, vamos al último
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Si tab y estamos en el último elemento, vamos al primero
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }
  
  // Enfocar el primer elemento al abrir
  firstElement?.focus();
  
  // Agregar listener para el ciclo de foco
  containerElement.addEventListener('keydown', handleTabKey);
  
  // Función para limpiar
  return () => {
    containerElement.removeEventListener('keydown', handleTabKey);
  };
}

// lib/a11y/skip-link.tsx
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:outline focus:outline-offset-2 focus:outline-primary"
    >
      Saltar al contenido principal
    </a>
  );
}
```

### 6. Reglas Generales de Accesibilidad

1. **Etiquetas ARIA**: Usar correctamente los atributos ARIA solo cuando sea necesario.

```tsx
// ✅ CORRECTO: Uso adecuado de ARIA
<button 
  aria-expanded={isOpen} 
  aria-controls="dropdown-menu"
  onClick={toggleMenu}
>
  Menú
</button>
<div 
  id="dropdown-menu" 
  role="menu" 
  hidden={!isOpen}
>
  {/* Contenido del menú */}
</div>

// ❌ INCORRECTO: Uso excesivo o innecesario de ARIA
<button 
  role="button" // Innecesario, ya es un botón
  aria-label="Botón de menú" // Innecesario si ya tiene texto visible
  aria-expanded={isOpen}
>
  Menú
</button>
```

2. **Contraste de Colores**: Asegurar un contraste mínimo de 4.5:1 para texto normal y 3:1 para texto grande.

```tsx
// Configuración en tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Colores con buen contraste
        primary: {
          DEFAULT: '#0056b3', // Buen contraste con blanco (4.5:1+)
          light: '#4d94ff',
          dark: '#003366',
        },
        // Evitar colores con bajo contraste como:
        // lowContrast: '#a3a3a3', // Mal contraste con blanco (2.5:1)
      },
    },
  },
};
```

3. **Formularios Accesibles**: Siempre asociar labels con inputs.

```tsx
// ✅ CORRECTO: Label asociado con input
<div className="form-group">
  <label htmlFor="email">Correo electrónico</label>
  <input 
    id="email" 
    type="email" 
    aria-describedby="email-help"
    required
  />
  <p id="email-help" className="text-sm text-gray-500">
    Nunca compartiremos tu correo con terceros.
  </p>
</div>

// ❌ INCORRECTO: Input sin label
<div className="form-group">
  <input 
    type="email" 
    placeholder="Correo electrónico" // No sustituye a un label
  />
</div>
```

4. **Manejo de Errores**: Comunicar errores de forma accesible.

```tsx
// ✅ CORRECTO: Error asociado con input
<div className="form-group">
  <label htmlFor="password">Contraseña</label>
  <input 
    id="password" 
    type="password" 
    aria-invalid={!!error}
    aria-describedby={error ? "password-error" : undefined}
  />
  {error && (
    <p id="password-error" className="text-red-500" role="alert">
      {error}
    </p>
  )}
</div>
```

## 🔍 SEO y Meta Tags

### 1. Configuración de Metadata Dinámica

```typescript
// lib/seo/metadata.ts
import { Metadata } from 'next';
import { Locale } from '@/lib/i18n/config';

interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  locale?: Locale;
  alternateLanguages?: Record<Locale, string>;
}

export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    image = '/images/og-default.jpg',
    url,
    type = 'website',
    locale = 'es',
    alternateLanguages = {}
  } = config;

  const siteName = 'Delivery Tracker';
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://delivery-tracker.com';
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl;
  const fullImageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`;

  return {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    authors: [{ name: 'Delivery Tracker Team' }],
    creator: 'Delivery Tracker',
    publisher: 'Delivery Tracker',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type,
      locale,
      url: fullUrl,
      title: fullTitle,
      description,
      siteName,
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [fullImageUrl],
      creator: '@deliverytracker',
    },
    alternates: {
      canonical: fullUrl,
      languages: alternateLanguages,
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      yandex: process.env.YANDEX_VERIFICATION,
      yahoo: process.env.YAHOO_VERIFICATION,
    },
  };
}

// Metadata específica para diferentes páginas
export const pageMetadata = {
  home: (locale: Locale): SEOConfig => ({
    title: locale === 'es' ? 'Gestión de Entregas Inteligente' : 'Smart Delivery Management',
    description: locale === 'es' 
      ? 'Plataforma completa para gestionar entregas, pedidos y clientes. Optimiza tu negocio de delivery con herramientas avanzadas de seguimiento y análisis.'
      : 'Complete platform to manage deliveries, orders and customers. Optimize your delivery business with advanced tracking and analytics tools.',
    keywords: locale === 'es'
      ? ['delivery', 'entregas', 'gestión', 'pedidos', 'logística', 'seguimiento']
      : ['delivery', 'management', 'orders', 'logistics', 'tracking', 'business'],
    type: 'website'
  }),
  
  dashboard: (locale: Locale): SEOConfig => ({
    title: locale === 'es' ? 'Panel de Control' : 'Dashboard',
    description: locale === 'es'
      ? 'Visualiza métricas en tiempo real, gestiona pedidos y supervisa el rendimiento de tu negocio de delivery.'
      : 'View real-time metrics, manage orders and monitor your delivery business performance.',
    keywords: locale === 'es'
      ? ['dashboard', 'métricas', 'análisis', 'control']
      : ['dashboard', 'metrics', 'analytics', 'control']
  }),
  
  orders: (locale: Locale): SEOConfig => ({
    title: locale === 'es' ? 'Gestión de Pedidos' : 'Order Management',
    description: locale === 'es'
      ? 'Administra todos tus pedidos de delivery de forma eficiente. Seguimiento en tiempo real y gestión completa del ciclo de vida del pedido.'
      : 'Efficiently manage all your delivery orders. Real-time tracking and complete order lifecycle management.',
    keywords: locale === 'es'
      ? ['pedidos', 'órdenes', 'gestión', 'seguimiento']
      : ['orders', 'management', 'tracking', 'delivery']
  })
};
```

### 2. Implementación en Layout y Páginas

```tsx
// app/[locale]/layout.tsx
import { generateMetadata as generateMeta } from '@/lib/seo/metadata';
import { pageMetadata } from '@/lib/seo/metadata';
import { Locale } from '@/lib/i18n/config';

interface RootLayoutProps {
  children: React.ReactNode;
  params: { locale: Locale };
}

export async function generateMetadata({ params }: { params: { locale: Locale } }) {
  return generateMeta(pageMetadata.home(params.locale));
}

export default function RootLayout({ children, params }: RootLayoutProps) {
  return (
    <html lang={params.locale}>
      <head>
        {/* Preconnect para mejorar performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Favicon y iconos */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Theme color para PWA */}
        <meta name="theme-color" content="#0056b3" />
        <meta name="msapplication-TileColor" content="#0056b3" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Delivery Tracker',
              description: 'Plataforma de gestión de entregas y pedidos',
              url: process.env.NEXT_PUBLIC_BASE_URL,
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD'
              }
            })
          }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
```

### 3. Sitemap Dinámico

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';
import { locales } from '@/lib/i18n/config';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://delivery-tracker.com';
  
  // Rutas estáticas
  const staticRoutes = [
    '',
    '/dashboard',
    '/orders',
    '/customers',
    '/products',
    '/settings'
  ];
  
  // Generar URLs para cada idioma
  const urls: MetadataRoute.Sitemap = [];
  
  staticRoutes.forEach(route => {
    locales.forEach(locale => {
      urls.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            locales.map(loc => [loc, `${baseUrl}/${loc}${route}`])
          )
        }
      });
    });
  });
  
  return urls;
}
```

### 4. Robots.txt Dinámico

```typescript
// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://delivery-tracker.com';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/private/',
          '*.json$'
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: '/'
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl
  };
}
```

### 5. Optimización de Imágenes para SEO

```tsx
// components/seo/OptimizedImage.tsx
import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!hasError ? (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          sizes={sizes}
          className={`transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
          quality={85}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        />
      ) : (
        <div className="flex items-center justify-center bg-gray-200 text-gray-500">
          <span>Error al cargar imagen</span>
        </div>
      )}
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-pulse bg-gray-300 w-full h-full" />
        </div>
      )}
    </div>
  );
}
```

### 6. Schema Markup para Páginas Específicas

```tsx
// components/seo/StructuredData.tsx
interface StructuredDataProps {
  type: 'Organization' | 'WebApplication' | 'BreadcrumbList' | 'Product';
  data: any;
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const generateSchema = () => {
    const baseSchema = {
      '@context': 'https://schema.org',
      '@type': type
    };
    
    switch (type) {
      case 'Organization':
        return {
          ...baseSchema,
          name: 'Delivery Tracker',
          url: process.env.NEXT_PUBLIC_BASE_URL,
          logo: `${process.env.NEXT_PUBLIC_BASE_URL}/logo.png`,
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+1-555-123-4567',
            contactType: 'customer service'
          },
          ...data
        };
        
      case 'BreadcrumbList':
        return {
          ...baseSchema,
          itemListElement: data.items.map((item: any, index: number) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url
          }))
        };
        
      default:
        return { ...baseSchema, ...data };
    }
  };
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateSchema())
      }}
    />
  );
}
```

### 7. Configuración de Analytics y Tracking

```tsx
// components/analytics/GoogleAnalytics.tsx
'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

interface GoogleAnalyticsProps {
  gaId: string;
}

export default function GoogleAnalytics({ gaId }: GoogleAnalyticsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', gaId, {
        page_path: pathname + searchParams.toString()
      });
    }
  }, [pathname, searchParams, gaId]);
  
  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
              anonymize_ip: true,
              allow_google_signals: false,
              allow_ad_personalization_signals: false
            });
          `
        }}
      />
    </>
  );
}

// Hook para tracking de eventos
export function useAnalytics() {
  const trackEvent = (action: string, category: string, label?: string, value?: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value
      });
    }
  };
  
  const trackPageView = (url: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_ID!, {
        page_path: url
      });
    }
  };
  
  return { trackEvent, trackPageView };
}
```

## 🔧 Herramientas de Desarrollo

### 1. Configuración de VSCode

```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"],
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

### 2. Extensiones Recomendadas

```json
// .vscode/extensions.json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json",
    "bradlc.vscode-tailwindcss"
  ]
}
```

### 3. Configuración de Git Hooks

```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run lint
npm run type-check
```

### 4. Configuración de Prettier

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

## 🚨 Troubleshooting

### Problemas Comunes y Soluciones

#### 1. Error de Conexión a Base de Datos

```bash
# Verificar variables de entorno
echo $DATABASE_URL

# Probar conexión
npm run db:studio

# Regenerar migraciones si es necesario
npm run db:generate
npm run db:migrate
```

#### 2. Problemas con Firebase Auth

```typescript
// Verificar configuración en desarrollo
if (process.env.NODE_ENV === 'development') {
  console.log('Firebase Config:', {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.substring(0, 10) + '...',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  });
}
```

#### 3. Problemas de Multi-Tenancy

```sql
-- Verificar datos de organización
SELECT u.email, o.name as organization_name 
FROM users u 
LEFT JOIN organizations o ON u.organization_id = o.id 
WHERE u.firebase_uid = 'user-firebase-uid';

-- Verificar aislamiento de datos
SELECT COUNT(*) as total_pedidos, organization_id 
FROM pedidos 
GROUP BY organization_id;
```

#### 4. Problemas de Performance

```typescript
// Monitoreo de queries lentas
const startTime = Date.now();
const result = await db.query.pedidos.findMany({
  where: eq(pedidos.organizationId, orgId)
});
const duration = Date.now() - startTime;

if (duration > 1000) {
  console.warn(`Query lenta detectada: ${duration}ms`);
}
```

### Logs de Debugging

```typescript
// Configuración de logs por ambiente
const logger = {
  info: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[INFO] ${message}`, data);
    }
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
    // En producción, enviar a servicio de logging
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data);
  }
};
```

## 📚 Recursos y Referencias

### Documentación Oficial

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Radix UI Documentation](https://www.radix-ui.com/primitives)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Herramientas de Desarrollo

- [Drizzle Studio](https://orm.drizzle.team/drizzle-studio/overview) - Explorador de base de datos
- [Firebase Console](https://console.firebase.google.com/) - Gestión de autenticación
- [Vercel Dashboard](https://vercel.com/dashboard) - Deployment y monitoreo

### Comandos Útiles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo con Turbopack
npm run dev:debug        # Desarrollo con debugging habilitado

# Base de datos
npm run db:generate      # Generar migraciones
npm run db:migrate       # Aplicar migraciones
npm run db:studio        # Abrir Drizzle Studio
npm run db:seed          # Poblar con datos de prueba
npm run db:reset         # Resetear base de datos (desarrollo)

# Testing
npm run test             # Ejecutar tests
npm run test:watch       # Tests en modo watch
npm run test:coverage    # Tests con coverage

# Build y Deploy
npm run build            # Build de producción
npm run start            # Servidor de producción
npm run lint             # Linting
npm run type-check       # Verificación de tipos
```

### Estructura de Commits

```
feat: nueva funcionalidad de pedidos
fix: corregir filtro de organizaciones
refactor: optimizar queries de base de datos
docs: actualizar documentación de API
test: agregar tests para autenticación
style: formatear código con prettier
chore: actualizar dependencias
```

---

**Nota Importante**: Este proyecto implementa un sistema multi-tenant robusto donde cada organización tiene sus propios datos completamente aislados. Todas las operaciones DEBEN incluir verificación de `organizationId` para mantener la seguridad y privacidad de los datos.

**Versión del Documento**: 2.0 - Última actualización: $(date)
**Mantenido por**: Santiago Prada
**Contacto**: Para dudas sobre implementación, revisar este documento primero, luego consultar la documentación oficial de las tecnologías utilizadas.