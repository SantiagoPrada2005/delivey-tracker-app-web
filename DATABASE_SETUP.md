# Configuración de la Base de Datos

## Requisitos Previos

1. **MySQL Server** instalado y ejecutándose
2. **Node.js** y **npm** instalados
3. Acceso a una base de datos MySQL

## Configuración Inicial

### 1. Configurar Variables de Entorno

1. Copia el archivo `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edita el archivo `.env` con tus credenciales de MySQL:
   ```env
   DATABASE_URL="mysql://tu_usuario:tu_password@localhost:3306/administrador_pedidos"
   ```

### 2. Crear la Base de Datos

Conéctate a MySQL y crea la base de datos:

```sql
CREATE DATABASE administrador_pedidos;
```

### 3. Aplicar el Schema

Ejecuta las migraciones de Drizzle para crear las tablas:

```bash
npx drizzle-kit push
```

### 4. Poblar con Datos de Prueba

Ejecuta el script de seed para agregar datos de ejemplo:

```bash
npm run db:seed
```

## Estructura de Datos Creada

El script de seed creará:

### Organizaciones (2)
- **Restaurante El Buen Sabor** (Bogotá)
- **Pizzería Don Luigi** (Medellín)

### Usuarios (3)
- Administrador principal
- Repartidor
- Administrador de pizzería

### Clientes (3)
- María González (Bogotá)
- Juan Pérez (Bogotá)
- Ana Rodríguez (Medellín)

### Productos (5)
- Hamburguesa Clásica ($15,000)
- Pizza Margherita ($25,000)
- Ensalada César ($12,000)
- Pizza Pepperoni ($28,000)
- Lasaña Boloñesa ($22,000)

### Repartidores (3)
- Carlos Martínez (disponible)
- Luis García (disponible)
- Miguel López (no disponible)

### Pedidos (3)
- Pedido pendiente ($40,000)
- Pedido en proceso ($27,000)
- Pedido entregado ($50,000)

## Comandos Útiles

```bash
# Aplicar cambios del schema a la base de datos
npx drizzle-kit push

# Generar migraciones
npx drizzle-kit generate

# Poblar base de datos con datos de prueba
npm run db:seed

# Ver el estado de la base de datos
npx drizzle-kit introspect
```

## Solución de Problemas

### Error de Conexión
Si obtienes un error de acceso denegado:
1. Verifica que MySQL esté ejecutándose
2. Confirma que las credenciales en `.env` sean correctas
3. Asegúrate de que la base de datos exista
4. Verifica que el usuario tenga permisos suficientes

### Error de Foreign Key
Si hay errores de claves foráneas:
1. Ejecuta `npx drizzle-kit push` para sincronizar el schema
2. Verifica que todas las tablas estén creadas correctamente

### Limpiar y Reiniciar
Para limpiar completamente la base de datos:

```sql
DROP DATABASE administrador_pedidos;
CREATE DATABASE administrador_pedidos;
```

Luego ejecuta nuevamente:
```bash
npx drizzle-kit push
npm run db:seed
```