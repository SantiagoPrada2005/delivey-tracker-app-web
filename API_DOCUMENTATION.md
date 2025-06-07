# Documentación de API - Delivery Tracker App

## Índice

1. [Introducción](#introducción)
2. [Autenticación](#autenticación)
3. [Estructura de Respuestas](#estructura-de-respuestas)
4. [Códigos de Error](#códigos-de-error)
5. [Rutas de API](#rutas-de-api)
   - [Autenticación](#rutas-de-autenticación)
   - [Organizaciones](#organizaciones)
   - [Usuarios](#usuarios)
   - [Gestión de Recursos](#gestión-de-recursos)
   - [Administración](#administración)

## Introducción

Esta documentación describe todas las rutas de la API del sistema Delivery Tracker App, una aplicación web para gestión de entregas y pedidos. La API está construida con Next.js 15 y utiliza Firebase Auth para autenticación.

### Tecnologías Utilizadas
- **Framework**: Next.js 15 con App Router
- **Base de datos**: PostgreSQL con Drizzle ORM
- **Autenticación**: Firebase Auth
- **Documentación**: JSDoc

## Autenticación

Todas las rutas protegidas requieren un token de Firebase Auth válido en el header `Authorization`:

```
Authorization: Bearer <firebase_token>
```

El middleware de autenticación verifica el token y agrega información del usuario a los headers de la request.

## Estructura de Respuestas

Todas las respuestas siguen un formato consistente:

```typescript
{
  success: boolean;
  data?: any;
  error?: string;
  code?: string;
}
```

## Códigos de Error

| Código | Descripción |
|--------|-------------|
| `AUTH_REQUIRED` | Usuario no autenticado |
| `AUTH_TOKEN_MISSING` | Token de autorización no proporcionado |
| `AUTH_TOKEN_INVALID` | Token inválido o expirado |
| `INSUFFICIENT_PERMISSIONS` | Permisos insuficientes |
| `VALIDATION_ERROR` | Error de validación de datos |
| `NOT_FOUND` | Recurso no encontrado |
| `INTERNAL_SERVER_ERROR` | Error interno del servidor |
| `USER_ALREADY_HAS_ORGANIZATION` | Usuario ya pertenece a una organización |
| `UID_MISMATCH` | UID del token no coincide |

---

# Rutas de API

## Rutas de Autenticación

### POST /api/auth/verify

**Descripción**: Verifica la validez de un token de Firebase Auth y devuelve información del usuario.

**Headers**:
```
Authorization: Bearer <firebase_token>
```

**Respuesta exitosa**:
```typescript
{
  uid: string;
  email: string;
  emailVerified: boolean;
  displayName: string;
  photoURL: string;
}
```

**Códigos de estado**:
- `200`: Token válido
- `401`: Token inválido o no proporcionado

---

### POST /api/auth/sync

**Descripción**: Sincroniza un usuario de Firebase Auth con la base de datos local.

**Headers**:
```
Authorization: Bearer <firebase_token>
```

**Body**:
```typescript
{
  firebaseUid: string;
  email: string;
  displayName?: string;
  emailVerified: boolean;
  photoURL?: string;
  providerId?: string;
}
```

**Respuesta exitosa**:
```typescript
{
  success: true;
  user: {
    id: number;
    firebaseUid: string;
    email: string;
    organizationId: number | null;
    role: string;
    isNewUser: boolean;
  };
}
```

**Códigos de estado**:
- `200`: Usuario sincronizado exitosamente
- `400`: Datos de validación incorrectos
- `401`: Token inválido

---

## Organizaciones

### GET /api/organizations

**Descripción**: Obtiene la lista de todas las organizaciones disponibles.

**Headers**:
```
Authorization: Bearer <firebase_token>
```

**Respuesta exitosa**:
```typescript
{
  success: true;
  organizations: Array<{
    id: number;
    name: string;
    slug: string;
    description: string | null;
    createdAt: Date;
  }>;
}
```

**Códigos de estado**:
- `200`: Lista obtenida exitosamente
- `401`: Usuario no autenticado

---

### POST /api/organizations

**Descripción**: Crea una nueva organización y asigna al usuario como administrador.

**Headers**:
```
Authorization: Bearer <firebase_token>
```

**Body**:
```typescript
{
  name: string;
  description?: string;
  slug?: string;
}
```

**Respuesta exitosa**:
```typescript
{
  success: true;
  organization: {
    id: number;
    name: string;
    slug: string;
    description: string | null;
  };
}
```

**Códigos de estado**:
- `201`: Organización creada exitosamente
- `400`: Usuario ya pertenece a una organización
- `401`: Usuario no autenticado

---

### GET /api/organizations/invitations

**Descripción**: Obtiene las invitaciones pendientes para el usuario actual.

**Headers**:
```
Authorization: Bearer <firebase_token>
```

**Respuesta exitosa**:
```typescript
{
  invitations: Array<{
    id: number;
    organizationId: number;
    organizationName: string;
    inviterEmail: string;
    invitedEmail: string;
    status: string;
    createdAt: string;
  }>;
}
```

**Códigos de estado**:
- `200`: Invitaciones obtenidas exitosamente
- `401`: Usuario no autenticado

---

### POST /api/organizations/invitations

**Descripción**: Crea una nueva invitación a la organización.

**Headers**:
```
Authorization: Bearer <firebase_token>
```

**Body**:
```typescript
{
  email: string;
  role?: string;
}
```

**Respuesta exitosa**:
```typescript
{
  success: true;
  invitation: {
    id: number;
    token: string;
    expiresAt: Date;
  };
}
```

**Códigos de estado**:
- `201`: Invitación creada exitosamente
- `400`: Email ya invitado o usuario ya pertenece a organización
- `403`: Usuario no pertenece a organización

---

## Usuarios

### GET /api/user/profile

**Descripción**: Obtiene el perfil del usuario autenticado.

**Headers**:
```
Authorization: Bearer <firebase_token>
```

**Respuesta exitosa**:
```typescript
{
  success: true;
  user: {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    role: string;
    organizationId: string;
  };
}
```

**Códigos de estado**:
- `200`: Perfil obtenido exitosamente
- `401`: Usuario no autenticado

---

### PUT /api/user/profile

**Descripción**: Actualiza el perfil del usuario autenticado.

**Headers**:
```
Authorization: Bearer <firebase_token>
```

**Body**:
```typescript
{
  name: string;
  preferences?: object;
}
```

**Respuesta exitosa**:
```typescript
{
  success: true;
  user: {
    id: string;
    name: string;
    updatedAt: Date;
  };
}
```

**Códigos de estado**:
- `200`: Perfil actualizado exitosamente
- `400`: Datos de validación incorrectos
- `401`: Usuario no autenticado

---

### GET /api/user/organization-status

**Descripción**: Verifica el estado de organización del usuario (si tiene organización, invitaciones pendientes, etc.).

**Headers**:
```
Authorization: Bearer <firebase_token>
```

**Respuesta exitosa**:
```typescript
{
  success: true;
  status: 'HAS_ORGANIZATION' | 'PENDING_INVITATION' | 'PENDING_REQUEST' | 'NO_ORGANIZATION';
  data: {
    user: {
      id: number;
      email: string;
      organizationId: number | null;
      role: string;
    };
    organization?: {
      id: number;
      name: string;
      slug: string;
    };
    pendingInvitations?: Array<{
      id: number;
      organizationName: string;
      inviterEmail: string;
      token: string;
      expiresAt: Date;
    }>;
  };
}
```

**Códigos de estado**:
- `200`: Estado obtenido exitosamente
- `401`: Usuario no autenticado
- `404`: Usuario no encontrado

---

## Gestión de Recursos

### Pedidos

#### GET /api/pedidos

**Descripción**: Obtiene la lista de pedidos de la organización del usuario.

**Headers**:
```
Authorization: Bearer <firebase_token>
```

**Query Parameters**:
- `id` (opcional): ID específico del pedido
- `completo` (opcional): `true` para obtener detalles completos

**Respuesta exitosa**:
```typescript
{
  success: true;
  pedidos: Array<{
    id: number;
    numeroOrden: string;
    clienteId: number;
    estado: string;
    total: number;
    fechaCreacion: Date;
    fechaEntrega?: Date;
  }>;
  total: number;
}
```

**Códigos de estado**:
- `200`: Pedidos obtenidos exitosamente
- `401`: Usuario no autenticado
- `404`: Pedido específico no encontrado

---

#### POST /api/pedidos

**Descripción**: Crea un nuevo pedido en la organización.

**Headers**:
```
Authorization: Bearer <firebase_token>
```

**Body**:
```typescript
{
  clienteId: number;
  productos: Array<{
    productoId: number;
    cantidad: number;
    precioUnitario: number;
  }>;
  direccionEntrega: string;
  fechaEntregaDeseada?: Date;
  notas?: string;
}
```

**Respuesta exitosa**:
```typescript
{
  success: true;
  pedido: {
    id: number;
    numeroOrden: string;
    total: number;
    estado: string;
  };
}
```

**Códigos de estado**:
- `201`: Pedido creado exitosamente
- `400`: Datos de validación incorrectos
- `401`: Usuario no autenticado

---

#### PUT /api/pedidos

**Descripción**: Actualiza un pedido existente.

**Headers**:
```
Authorization: Bearer <firebase_token>
```

**Body**:
```typescript
{
  id: number;
  estado?: string;
  direccionEntrega?: string;
  fechaEntregaDeseada?: Date;
  notas?: string;
}
```

**Respuesta exitosa**:
```typescript
{
  success: true;
  pedido: {
    id: number;
    estado: string;
    updatedAt: Date;
  };
}
```

**Códigos de estado**:
- `200`: Pedido actualizado exitosamente
- `400`: Datos de validación incorrectos
- `401`: Usuario no autenticado
- `404`: Pedido no encontrado

---

#### DELETE /api/pedidos

**Descripción**: Elimina un pedido.

**Headers**:
```
Authorization: Bearer <firebase_token>
```

**Body**:
```typescript
{
  id: number;
}
```

**Respuesta exitosa**:
```typescript
{
  success: true;
  message: string;
}
```

**Códigos de estado**:
- `200`: Pedido eliminado exitosamente
- `401`: Usuario no autenticado
- `404`: Pedido no encontrado

---

### Clientes

#### GET /api/clientes

**Descripción**: Obtiene la lista de clientes de la organización.

**Headers**:
```
Authorization: Bearer <firebase_token>
```

**Query Parameters**:
- `id` (opcional): ID específico del cliente

**Respuesta exitosa**:
```typescript
{
  success: true;
  clientes: Array<{
    id: number;
    nombre: string;
    email: string;
    telefono: string;
    direccion: string;
    fechaRegistro: Date;
  }>;
  total: number;
}
```

**Códigos de estado**:
- `200`: Clientes obtenidos exitosamente
- `401`: Usuario no autenticado
- `404`: Cliente específico no encontrado

---

#### POST /api/clientes

**Descripción**: Crea un nuevo cliente.

**Headers**:
```
Authorization: Bearer <firebase_token>
```

**Body**:
```typescript
{
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  notas?: string;
}
```

**Respuesta exitosa**:
```typescript
{
  success: true;
  cliente: {
    id: number;
    nombre: string;
    email: string;
  };
}
```

**Códigos de estado**:
- `201`: Cliente creado exitosamente
- `400`: Datos de validación incorrectos
- `401`: Usuario no autenticado

---

#### PUT /api/clientes

**Descripción**: Actualiza un cliente existente.

**Headers**:
```
Authorization: Bearer <firebase_token>
```

**Body**:
```typescript
{
  id: number;
  nombre?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  notas?: string;
}
```

**Respuesta exitosa**:
```typescript
{
  success: true;
  cliente: {
    id: number;
    updatedAt: Date;
  };
}
```

**Códigos de estado**:
- `200`: Cliente actualizado exitosamente
- `400`: Datos de validación incorrectos
- `401`: Usuario no autenticado
- `404`: Cliente no encontrado

---

#### DELETE /api/clientes

**Descripción**: Elimina un cliente.

**Headers**:
```
Authorization: Bearer <firebase_token>
```

**Body**:
```typescript
{
  id: number;
}
```

**Respuesta exitosa**:
```typescript
{
  success: true;
  message: string;
}
```

**Códigos de estado**:
- `200`: Cliente eliminado exitosamente
- `401`: Usuario no autenticado
- `404`: Cliente no encontrado

---

### Productos

#### GET /api/productos

**Descripción**: Obtiene la lista de productos de la organización.

**Headers**:
```
Authorization: Bearer <firebase_token>
```

**Query Parameters**:
- `id` (opcional): ID específico del producto

**Respuesta exitosa**:
```typescript
{
  success: true;
  productos: Array<{
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    categoria: string;
    stock: number;
    activo: boolean;
  }>;
  total: number;
}
```

**Códigos de estado**:
- `200`: Productos obtenidos exitosamente
- `401`: Usuario no autenticado
- `404`: Producto específico no encontrado

---

#### POST /api/productos

**Descripción**: Crea un nuevo producto.

**Headers**:
```
Authorization: Bearer <firebase_token>
```

**Body**:
```typescript
{
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  stock: number;
  activo?: boolean;
}
```

**Respuesta exitosa**:
```typescript
{
  success: true;
  producto: {
    id: number;
    nombre: string;
    precio: number;
  };
}
```

**Códigos de estado**:
- `201`: Producto creado exitosamente
- `400`: Datos de validación incorrectos
- `401`: Usuario no autenticado

---

#### PUT /api/productos

**Descripción**: Actualiza un producto existente.

**Headers**:
```
Authorization: Bearer <firebase_token>
```

**Body**:
```typescript
{
  id: number;
  nombre?: string;
  descripcion?: string;
  precio?: number;
  categoria?: string;
  stock?: number;
  activo?: boolean;
}
```

**Respuesta exitosa**:
```typescript
{
  success: true;
  producto: {
    id: number;
    updatedAt: Date;
  };
}
```

**Códigos de estado**:
- `200`: Producto actualizado exitosamente
- `400`: Datos de validación incorrectos
- `401`: Usuario no autenticado
- `404`: Producto no encontrado

---

#### DELETE /api/productos

**Descripción**: Elimina un producto.

**Headers**:
```
Authorization: Bearer <firebase_token>
```

**Body**:
```typescript
{
  id: number;
}
```

**Respuesta exitosa**:
```typescript
{
  success: true;
  message: string;
}
```

**Códigos de estado**:
- `200`: Producto eliminado exitosamente
- `401`: Usuario no autenticado
- `404`: Producto no encontrado

---

### Repartidores

#### GET /api/repartidores

**Descripción**: Obtiene la lista de repartidores de la organización.

**Headers**:
```
Authorization: Bearer <firebase_token>
```

**Query Parameters**:
- `id` (opcional): ID específico del repartidor

**Respuesta exitosa**:
```typescript
{
  success: true;
  repartidores: Array<{
    id: number;
    nombre: string;
    email: string;
    telefono: string;
    vehiculo: string;
    licencia: string;
    activo: boolean;
  }>;
  total: number;
}
```

**Códigos de estado**:
- `200`: Repartidores obtenidos exitosamente
- `401`: Usuario no autenticado
- `404`: Repartidor específico no encontrado

---

#### POST /api/repartidores

**Descripción**: Crea un nuevo repartidor.

**Headers**:
```
Authorization: Bearer <firebase_token>
```

**Body**:
```typescript
{
  nombre: string;
  email: string;
  telefono: string;
  vehiculo: string;
  licencia: string;
  activo?: boolean;
}
```

**Respuesta exitosa**:
```typescript
{
  success: true;
  repartidor: {
    id: number;
    nombre: string;
    email: string;
  };
}
```

**Códigos de estado**:
- `201`: Repartidor creado exitosamente
- `400`: Datos de validación incorrectos
- `401`: Usuario no autenticado

---

#### PUT /api/repartidores

**Descripción**: Actualiza un repartidor existente.

**Headers**:
```
Authorization: Bearer <firebase_token>
```

**Body**:
```typescript
{
  id: number;
  nombre?: string;
  email?: string;
  telefono?: string;
  vehiculo?: string;
  licencia?: string;
  activo?: boolean;
}
```

**Respuesta exitosa**:
```typescript
{
  success: true;
  repartidor: {
    id: number;
    updatedAt: Date;
  };
}
```

**Códigos de estado**:
- `200`: Repartidor actualizado exitosamente
- `400`: Datos de validación incorrectos
- `401`: Usuario no autenticado
- `404`: Repartidor no encontrado

---

#### DELETE /api/repartidores

**Descripción**: Elimina un repartidor.

**Headers**:
```
Authorization: Bearer <firebase_token>
```

**Body**:
```typescript
{
  id: number;
}
```

**Respuesta exitosa**:
```typescript
{
  success: true;
  message: string;
}
```

**Códigos de estado**:
- `200`: Repartidor eliminado exitosamente
- `401`: Usuario no autenticado
- `404`: Repartidor no encontrado

---

### Asignaciones

#### GET /api/asignaciones

**Descripción**: Obtiene la lista de asignaciones de pedidos a repartidores.

**Headers**:
```
Authorization: Bearer <firebase_token>
```

**Query Parameters**:
- `pedidoId` (opcional): ID específico del pedido

**Respuesta exitosa**:
```typescript
{
  success: true;
  asignaciones: Array<{
    id: number;
    pedidoId: number;
    repartidorId: number;
    estado: string;
    fechaAsignacion: Date;
    fechaEntrega?: Date;
    notas?: string;
  }>;
  total: number;
}
```

**Códigos de estado**:
- `200`: Asignaciones obtenidas exitosamente
- `401`: Usuario no autenticado
- `404`: Asignación específica no encontrada

---

#### POST /api/asignaciones

**Descripción**: Crea una nueva asignación de pedido a repartidor.

**Headers**:
```
Authorization: Bearer <firebase_token>
```

**Body**:
```typescript
{
  pedidoId: number;
  repartidorId: number;
  fechaEntregaEstimada?: Date;
  notas?: string;
}
```

**Respuesta exitosa**:
```typescript
{
  success: true;
  asignacion: {
    id: number;
    pedidoId: number;
    repartidorId: number;
    estado: string;
  };
}
```

**Códigos de estado**:
- `201`: Asignación creada exitosamente
- `400`: Datos de validación incorrectos
- `401`: Usuario no autenticado

---

#### PUT /api/asignaciones

**Descripción**: Actualiza el estado de una asignación.

**Headers**:
```
Authorization: Bearer <firebase_token>
```

**Body**:
```typescript
{
  id: number;
  estado?: string;
  fechaEntrega?: Date;
  notas?: string;
}
```

**Respuesta exitosa**:
```typescript
{
  success: true;
  asignacion: {
    id: number;
    estado: string;
    updatedAt: Date;
  };
}
```

**Códigos de estado**:
- `200`: Asignación actualizada exitosamente
- `400`: Datos de validación incorrectos
- `401`: Usuario no autenticado
- `404`: Asignación no encontrada

---

#### DELETE /api/asignaciones

**Descripción**: Elimina una asignación.

**Headers**:
```
Authorization: Bearer <firebase_token>
```

**Body**:
```typescript
{
  id: number;
}
```

**Respuesta exitosa**:
```typescript
{
  success: true;
  message: string;
}
```

**Códigos de estado**:
- `200`: Asignación eliminada exitosamente
- `401`: Usuario no autenticado
- `404`: Asignación no encontrada

---

## Administración

### GET /api/admin/users

**Descripción**: Obtiene la lista de usuarios del sistema (solo administradores).

**Headers**:
```
Authorization: Bearer <firebase_token>
```

**Respuesta exitosa**:
```typescript
{
  success: true;
  users: Array<{
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt: string;
    emailVerified: boolean;
  }>;
  total: number;
  requestedBy: {
    id: string;
    email: string;
    role: string;
  };
}
```

**Códigos de estado**:
- `200`: Usuarios obtenidos exitosamente
- `401`: Usuario no autenticado
- `403`: Permisos insuficientes

---

### POST /api/admin/users

**Descripción**: Crea un nuevo usuario (solo administradores).

**Headers**:
```
Authorization: Bearer <firebase_token>
```

**Body**:
```typescript
{
  email: string;
  name: string;
  role: string;
  password: string;
}
```

**Respuesta exitosa**:
```typescript
{
  success: true;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}
```

**Códigos de estado**:
- `201`: Usuario creado exitosamente
- `400`: Datos de validación incorrectos
- `401`: Usuario no autenticado
- `403`: Permisos insuficientes

---

### POST /api/admin/seed

**Descripción**: Ejecuta el script de seed para poblar la base de datos con datos de prueba (solo en desarrollo).

**Respuesta exitosa**:
```typescript
{
  success: true;
  message: string;
}
```

**Códigos de estado**:
- `200`: Seed ejecutado exitosamente
- `403`: No disponible en producción
- `500`: Error durante la ejecución

---

### GET /api/admin/seed

**Descripción**: Verifica la disponibilidad del endpoint de seed.

**Respuesta exitosa**:
```typescript
{
  message: string;
  available: boolean;
}
```

**Códigos de estado**:
- `200`: Endpoint disponible
- `403`: No disponible en producción

---

## Notas de Implementación

### Middleware de Autenticación

Todas las rutas protegidas utilizan el middleware de autenticación que:
1. Verifica el token de Firebase Auth
2. Extrae información del usuario
3. Agrega headers con datos del usuario a la request
4. Maneja rutas públicas y protegidas

### Manejo de Errores

Todas las rutas implementan manejo consistente de errores:
- Validación de entrada
- Autenticación y autorización
- Errores de base de datos
- Respuestas estructuradas con códigos de error

### Seguridad

- Todas las operaciones verifican la pertenencia a organización
- Los datos se filtran por organización del usuario
- Validación de permisos por rol
- Sanitización de entrada de datos

### Performance

- Consultas optimizadas con Drizzle ORM
- Paginación en endpoints que manejan listas grandes
- Índices de base de datos apropiados
- Caché de consultas frecuentes

---

*Documentación generada automáticamente basada en JSDoc y análisis de código*
*Versión: 1.0.0*
*Fecha: 2025-01-20*