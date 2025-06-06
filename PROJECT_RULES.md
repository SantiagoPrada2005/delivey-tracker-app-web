# Reglas de Desarrollo - Delivery Tracker App

## Stack Tecnológico

- **Frontend**: Next.js 14+ con App Router
- **Base de Datos**: PostgreSQL con Drizzle ORM
- **Autenticación**: Firebase Auth
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Deployment**: Vercel

## Reglas Generales de Arquitectura

### 1. Estructura de Directorios

```
src/
├── app/                    # App Router de Next.js
│   ├── api/               # API Routes
│   ├── (auth)/            # Rutas de autenticación
│   └── dashboard/         # Rutas del dashboard
├── components/            # Componentes reutilizables
├── lib/                   # Utilidades y configuraciones
│   ├── database.ts        # Configuración y queries de Drizzle
│   ├── firebase.ts        # Configuración de Firebase
│   └── auth.ts           # Middleware de autenticación
└── types/                 # Definiciones de tipos TypeScript
```

### 2. Convenciones de Nomenclatura

- **Archivos**: kebab-case (`user-profile.tsx`)
- **Componentes**: PascalCase (`UserProfile`)
- **Funciones**: camelCase (`getUserData`)
- **Constantes**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Tipos**: PascalCase con sufijo Type (`UserType`)

## Reglas de Next.js

### 1. App Router

```typescript
// ✅ Correcto: Usar App Router con layout.tsx
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}

// ✅ Correcto: Server Components por defecto
// app/dashboard/page.tsx
export default async function DashboardPage() {
  const data = await fetchData() // Server-side data fetching
  return <div>{data}</div>
}

// ✅ Correcto: Client Components cuando sea necesario
'use client'
import { useState } from 'react'

export default function InteractiveComponent() {
  const [state, setState] = useState()
  return <button onClick={() => setState(!state)}>Toggle</button>
}
```

### 2. API Routes

```typescript
// ✅ Correcto: Estructura de API Route
// app/api/pedidos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await auth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const data = await getPedidos(user.organizationId)
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await auth(request)
    const body = await request.json()
    
    // Validación de datos
    const validatedData = validatePedidoData(body)
    
    const result = await createPedido(validatedData, user.organizationId)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error.message }, 
      { status: 400 }
    )
  }
}
```

### 3. Middleware de Autenticación

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyIdToken } from '@/lib/firebase-admin'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  try {
    const decodedToken = await verifyIdToken(token)
    const response = NextResponse.next()
    response.headers.set('x-user-id', decodedToken.uid)
    return response
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*']
}
```

## Reglas de Drizzle ORM

### 1. Definición de Esquemas

```typescript
// ✅ Correcto: Definición de esquema con relaciones
// lib/schema.ts
import { pgTable, serial, varchar, timestamp, integer, text } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const organizaciones = pgTable('organizaciones', {
  id: serial('id').primaryKey(),
  nombre: varchar('nombre', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

export const pedidos = pgTable('pedidos', {
  id: serial('id').primaryKey(),
  organizacionId: integer('organizacion_id').references(() => organizaciones.id),
  clienteNombre: varchar('cliente_nombre', { length: 255 }).notNull(),
  direccion: text('direccion').notNull(),
  estado: varchar('estado', { length: 50 }).default('pendiente'),
  createdAt: timestamp('created_at').defaultNow()
})

// Definir relaciones
export const organizacionesRelations = relations(organizaciones, ({ many }) => ({
  pedidos: many(pedidos)
}))

export const pedidosRelations = relations(pedidos, ({ one, many }) => ({
  organizacion: one(organizaciones, {
    fields: [pedidos.organizacionId],
    references: [organizaciones.id]
  }),
  detalles: many(detallesPedido)
}))
```

### 2. Queries y Transacciones

```typescript
// ✅ Correcto: Queries con relaciones
import { db } from '@/lib/database'
import { eq, and } from 'drizzle-orm'

export async function getPedidosWithDetails(organizacionId: number) {
  return await db.query.pedidos.findMany({
    where: eq(pedidos.organizacionId, organizacionId),
    with: {
      detalles: true,
      organizacion: true
    }
  })
}

// ✅ Correcto: Transacciones
export async function createPedidoCompleto(
  pedidoData: InsertPedido,
  detallesData: InsertDetallePedido[],
  organizacionId: number
) {
  return await db.transaction(async (tx) => {
    const [pedido] = await tx
      .insert(pedidos)
      .values({ ...pedidoData, organizacionId })
      .returning({ id: pedidos.id })
    
    const detallesWithPedidoId = detallesData.map(detalle => ({
      ...detalle,
      pedidoId: pedido.id
    }))
    
    await tx.insert(detallesPedido).values(detallesWithPedidoId)
    
    return { pedidoId: pedido.id }
  })
}

// ✅ Correcto: Usar $returningId() para operaciones simples
export async function createAsignacionPedido(asignacionData: InsertAsignacion) {
  const [result] = await db
    .insert(asignacionesPedido)
    .values(asignacionData)
    .$returningId()
  
  return {
    id: result.id,
    asignacionData
  }
}
```

### 3. Migraciones

```typescript
// ✅ Correcto: Configuración de migraciones
// drizzle.config.ts
import type { Config } from 'drizzle-kit'

export default {
  schema: './src/lib/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!
  }
} satisfies Config

// Comandos para migraciones:
// npm run db:generate  # Generar migraciones
// npm run db:migrate   # Aplicar migraciones
// npm run db:studio    # Abrir Drizzle Studio
```

## Reglas de Firebase Auth

### 1. Configuración del Cliente

```typescript
// ✅ Correcto: Configuración de Firebase
// lib/firebase.ts
import { initializeApp } from 'firebase/app'
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)

// Configurar persistencia
setPersistence(auth, browserLocalPersistence)
```

### 2. Autenticación en el Cliente

```typescript
// ✅ Correcto: Hook de autenticación
// hooks/useAuth.ts
'use client'
import { useEffect, useState } from 'react'
import { User, onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })
    
    return unsubscribe
  }, [])
  
  return { user, loading }
}

// ✅ Correcto: Componente de login
export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await signInWithEmailAndPassword(auth, email, password)
      // Redirigir después del login exitoso
    } catch (error) {
      console.error('Error de login:', error)
    }
  }
  
  return (
    <form onSubmit={handleLogin}>
      {/* Formulario */}
    </form>
  )
}
```

### 3. Verificación en el Servidor

```typescript
// ✅ Correcto: Verificación de tokens en API Routes
// lib/auth.ts
import { NextRequest } from 'next/server'
import { auth as adminAuth } from 'firebase-admin/auth'
import { initializeApp, getApps, cert } from 'firebase-admin/app'

// Inicializar Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  })
}

export async function verifyAuth(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value ||
                request.headers.get('authorization')?.replace('Bearer ', '')
  
  if (!token) {
    throw new Error('No token provided')
  }
  
  try {
    const decodedToken = await adminAuth.verifyIdToken(token)
    return decodedToken
  } catch (error) {
    throw new Error('Invalid token')
  }
}
```

## Reglas de Manejo de Errores

### 1. API Routes

```typescript
// ✅ Correcto: Manejo consistente de errores
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    const data = await request.json()
    
    // Validación
    if (!data.nombre) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      )
    }
    
    const result = await createItem(data, user.uid)
    return NextResponse.json(result, { status: 201 })
    
  } catch (error) {
    console.error('Error en API:', error)
    
    if (error.message === 'Invalid token') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
```

### 2. Componentes

```typescript
// ✅ Correcto: Error boundaries
'use client'
import { ErrorBoundary } from 'react-error-boundary'

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="p-4 border border-red-300 rounded bg-red-50">
      <h2 className="text-red-800">Algo salió mal:</h2>
      <pre className="text-red-600">{error.message}</pre>
      <button onClick={resetErrorBoundary}>Intentar de nuevo</button>
    </div>
  )
}

export function AppWithErrorBoundary({ children }) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      {children}
    </ErrorBoundary>
  )
}
```

## Reglas de Performance

### 1. Optimización de Imágenes

```typescript
// ✅ Correcto: Usar Next.js Image
import Image from 'next/image'

export function ProductImage({ src, alt }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={300}
      height={200}
      priority={false}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
    />
  )
}
```

### 2. Lazy Loading de Componentes

```typescript
// ✅ Correcto: Dynamic imports
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Cargando...</div>,
  ssr: false
})
```

### 3. Caching de Datos

```typescript
// ✅ Correcto: Cache en Server Components
export default async function ProductsPage() {
  const products = await fetch('https://api.example.com/products', {
    next: { revalidate: 3600 } // Cache por 1 hora
  })
  
  return <ProductList products={products} />
}

// ✅ Correcto: SWR para Client Components
'use client'
import useSWR from 'swr'

export function ProductList() {
  const { data, error, isLoading } = useSWR('/api/products', fetcher)
  
  if (error) return <div>Error al cargar productos</div>
  if (isLoading) return <div>Cargando...</div>
  
  return <div>{/* Renderizar productos */}</div>
}
```

## Reglas de Seguridad

### 1. Validación de Datos

```typescript
// ✅ Correcto: Usar Zod para validación
import { z } from 'zod'

const PedidoSchema = z.object({
  clienteNombre: z.string().min(1, 'Nombre requerido'),
  direccion: z.string().min(5, 'Dirección muy corta'),
  telefono: z.string().regex(/^\d{10}$/, 'Teléfono inválido')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = PedidoSchema.parse(body)
    // Procesar datos validados
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }
  }
}
```

### 2. Variables de Entorno

```bash
# ✅ Correcto: .env.local
DATABASE_URL="postgresql://..."
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
```

### 3. Sanitización de Datos

```typescript
// ✅ Correcto: Sanitizar inputs
import DOMPurify from 'isomorphic-dompurify'

export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input.trim())
}
```

## Reglas de Testing

### 1. Tests Unitarios

```typescript
// ✅ Correcto: Test de componente
import { render, screen } from '@testing-library/react'
import { PedidoCard } from './PedidoCard'

describe('PedidoCard', () => {
  it('debe mostrar la información del pedido', () => {
    const pedido = {
      id: 1,
      clienteNombre: 'Juan Pérez',
      estado: 'pendiente'
    }
    
    render(<PedidoCard pedido={pedido} />)
    
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
    expect(screen.getByText('pendiente')).toBeInTheDocument()
  })
})
```

### 2. Tests de API

```typescript
// ✅ Correcto: Test de API Route
import { POST } from '@/app/api/pedidos/route'
import { NextRequest } from 'next/server'

describe('/api/pedidos', () => {
  it('debe crear un pedido válido', async () => {
    const request = new NextRequest('http://localhost:3000/api/pedidos', {
      method: 'POST',
      body: JSON.stringify({
        clienteNombre: 'Test Cliente',
        direccion: 'Test Dirección'
      })
    })
    
    const response = await POST(request)
    const data = await response.json()
    
    expect(response.status).toBe(201)
    expect(data.id).toBeDefined()
  })
})
```

## Reglas de Deployment

### 1. Configuración de Vercel

```json
// vercel.json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "DATABASE_URL": "@database-url",
    "FIREBASE_PROJECT_ID": "@firebase-project-id"
  }
}
```

### 2. Scripts de Package.json

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "drizzle-kit generate:pg",
    "db:migrate": "drizzle-kit push:pg",
    "db:studio": "drizzle-kit studio",
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

## Checklist de Desarrollo

### Antes de cada commit:
- [ ] Código lintado sin errores
- [ ] Tests pasando
- [ ] Variables de entorno documentadas
- [ ] Tipos TypeScript correctos
- [ ] Manejo de errores implementado

### Antes de cada deploy:
- [ ] Build exitoso
- [ ] Migraciones de DB aplicadas
- [ ] Variables de entorno configuradas en Vercel
- [ ] Tests de integración pasando
- [ ] Performance verificada

### Code Review:
- [ ] Seguimiento de convenciones de nomenclatura
- [ ] Validación de datos implementada
- [ ] Autenticación y autorización correctas
- [ ] Optimización de queries de DB
- [ ] Manejo de estados de carga y error

---

**Nota**: Estas reglas deben ser seguidas consistentemente en todo el proyecto para mantener la calidad del código y facilitar el mantenimiento.