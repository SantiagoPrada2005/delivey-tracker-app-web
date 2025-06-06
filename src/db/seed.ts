// Cargar variables de entorno al inicio
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import {
  createOrganization,
  createUserPermissions,
  createUser,
  createCliente,
  createProducto,
  createRepartidor,
  createPedidoCompleto,
  createAsignacionPedido,
  getClientesByOrganization,
  getProductosByOrganization,
  getRepartidoresByOrganization,
} from '@/lib/database';

export async function seed() {
  console.log('🌱 Iniciando seed de la base de datos...');

  try {
    // 1. Crear organizaciones
    console.log('📊 Creando organizaciones...');
    const org1 = await createOrganization({
      name: 'Restaurante El Buen Sabor',
      slug: 'restaurante-el-buen-sabor',
      nit: 900123456,
      phoneService: '+57 301 234 5678',
      address: 'Calle 123 #45-67, Bogotá',
      regimenContribucion: 'Regimen común'
    });

    const org2 = await createOrganization({
      name: 'Pizzería Don Luigi',
      slug: 'pizzeria-don-luigi',
      nit: 900654321,
      phoneService: '+57 302 987 6543',
      address: 'Carrera 78 #12-34, Medellín',
      regimenContribucion: 'Regimen simplificado'
    });

    const org1Id = org1.id;
    const org2Id = org2.id;

    // 2. Crear permisos de usuario
    console.log('🔐 Creando permisos de usuario...');
    await createUserPermissions({
      description: 'Administrador completo',
      modifyClients: true,
      modifyOrders: true
    });

    await createUserPermissions({
      description: 'Solo lectura',
      modifyClients: false,
      modifyOrders: false
    });

    await createUserPermissions({
      description: 'Gestión de pedidos',
      modifyClients: false,
      modifyOrders: true
    });

    // 3. Crear usuarios
    console.log('👥 Creando usuarios...');
    await createUser({
      firebaseUid: 'admin_001',
      email: 'admin@buensabor.com',
      emailVerified: true,
      displayName: 'Administrador Principal',
      role: 'admin',
      isActive: true
    }, org1Id);

    await createUser({
      firebaseUid: 'delivery_001',
      email: 'repartidor@buensabor.com',
      emailVerified: true,
      displayName: 'Carlos Repartidor',
      role: 'delivery',
      isActive: true
    }, org1Id);

    await createUser({
      firebaseUid: 'admin_002',
      email: 'admin@donluigi.com',
      emailVerified: true,
      displayName: 'Luigi Administrador',
      role: 'admin',
      isActive: true
    }, org2Id);

    // 4. Crear clientes
    console.log('👤 Creando clientes...');
    await createCliente({
      nombre: 'María',
      apellido: 'González',
      telefono: '+57 310 123 4567',
      email: 'maria.gonzalez@email.com',
      direccion: 'Calle 45 #23-12, Apartamento 301, Bogotá'
    }, org1Id);

    await createCliente({
      nombre: 'Juan',
      apellido: 'Pérez',
      telefono: '+57 315 987 6543',
      email: 'juan.perez@email.com',
      direccion: 'Carrera 15 #67-89, Casa 2B, Bogotá'
    }, org1Id);

    await createCliente({
      nombre: 'Ana',
      apellido: 'Rodríguez',
      telefono: '+57 320 456 7890',
      email: 'ana.rodriguez@email.com',
      direccion: 'Avenida 80 #45-23, Torre 3, Apto 1205, Medellín'
    }, org2Id);

    // 5. Crear productos
    console.log('🍕 Creando productos...');
    await createProducto({
      nombre: 'Hamburguesa Clásica',
      descripcion: 'Hamburguesa de carne de res con lechuga, tomate, cebolla y salsa especial',
      precio: '15000.00',
      stock: 50,
      categoria: 'Hamburguesas',
      imagen: '/images/hamburguesa-clasica.jpg'
    }, org1Id);

    await createProducto({
      nombre: 'Pizza Margherita',
      descripcion: 'Pizza tradicional con salsa de tomate, mozzarella fresca y albahaca',
      precio: '25000.00',
      stock: 30,
      categoria: 'Pizzas',
      imagen: '/images/pizza-margherita.jpg'
    }, org1Id);

    await createProducto({
      nombre: 'Ensalada César',
      descripcion: 'Lechuga romana, crutones, queso parmesano y aderezo césar',
      precio: '12000.00',
      stock: 25,
      categoria: 'Ensaladas',
      imagen: '/images/ensalada-cesar.jpg'
    }, org1Id);

    await createProducto({
      nombre: 'Pizza Pepperoni',
      descripcion: 'Pizza con salsa de tomate, mozzarella y pepperoni',
      precio: '28000.00',
      stock: 20,
      categoria: 'Pizzas',
      imagen: '/images/pizza-pepperoni.jpg'
    }, org2Id);

    await createProducto({
      nombre: 'Lasaña Boloñesa',
      descripcion: 'Lasaña tradicional con carne boloñesa y queso gratinado',
      precio: '22000.00',
      stock: 15,
      categoria: 'Pastas',
      imagen: '/images/lasana-bolonesa.jpg'
    }, org2Id);

    // 6. Crear repartidores
    console.log('🚴 Creando repartidores...');
    await createRepartidor({
      nombre: 'Carlos',
      apellido: 'Martínez',
      telefono: '+57 311 234 5678',
      email: 'carlos.martinez@buensabor.com',
      disponible: true
    }, org1Id);

    await createRepartidor({
      nombre: 'Luis',
      apellido: 'García',
      telefono: '+57 312 345 6789',
      email: 'luis.garcia@buensabor.com',
      disponible: true
    }, org1Id);

    await createRepartidor({
      nombre: 'Miguel',
      apellido: 'López',
      telefono: '+57 313 456 7890',
      email: 'miguel.lopez@donluigi.com',
      disponible: false
    }, org2Id);

    // Obtener los IDs de los registros creados para crear las relaciones
    const clientesOrg1 = await getClientesByOrganization(org1Id);
    const clientesOrg2 = await getClientesByOrganization(org2Id);
    const productosOrg1 = await getProductosByOrganization(org1Id);
    const productosOrg2 = await getProductosByOrganization(org2Id);
    const repartidoresOrg1 = await getRepartidoresByOrganization(org1Id);
    const repartidoresOrg2 = await getRepartidoresByOrganization(org2Id);

    // 7. Crear pedidos con detalles usando transacciones
    console.log('📦 Creando pedidos con detalles...');
    
    // Pedido 1: María - Hamburguesa + Pizza
    const pedido1 = await createPedidoCompleto(
      {
        clienteId: clientesOrg1[0].id, // María
        estado: 'pendiente',
        total: '40000.00',
        direccionEntrega: 'Calle 45 #23-12, Apartamento 301, Bogotá',
        fechaEntrega: new Date('2024-01-15 19:30:00')
      },
      [
        {
          productoId: productosOrg1[0].id, // Hamburguesa Clásica
          cantidad: 1,
          precioUnitario: '15000.00',
          subtotal: '15000.00'
        },
        {
          productoId: productosOrg1[1].id, // Pizza Margherita
          cantidad: 1,
          precioUnitario: '25000.00',
          subtotal: '25000.00'
        }
      ],
      org1Id
    );

    // Pedido 2: Juan - Ensalada + Hamburguesa
    const pedido2 = await createPedidoCompleto(
      {
        clienteId: clientesOrg1[1].id, // Juan
        estado: 'en_proceso',
        total: '27000.00',
        direccionEntrega: 'Carrera 15 #67-89, Casa 2B, Bogotá',
        fechaEntrega: new Date('2024-01-15 20:00:00')
      },
      [
        {
          productoId: productosOrg1[2].id, // Ensalada César
          cantidad: 1,
          precioUnitario: '12000.00',
          subtotal: '12000.00'
        },
        {
          productoId: productosOrg1[0].id, // Hamburguesa Clásica
          cantidad: 1,
          precioUnitario: '15000.00',
          subtotal: '15000.00'
        }
      ],
      org1Id
    );

    // Pedido 3: Ana - Pizza Pepperoni + Lasaña
    const pedido3 = await createPedidoCompleto(
      {
        clienteId: clientesOrg2[0].id, // Ana
        estado: 'entregado',
        total: '50000.00',
        direccionEntrega: 'Avenida 80 #45-23, Torre 3, Apto 1205, Medellín',
        fechaEntrega: new Date('2024-01-14 18:45:00')
      },
      [
        {
          productoId: productosOrg2[0].id, // Pizza Pepperoni
          cantidad: 1,
          precioUnitario: '28000.00',
          subtotal: '28000.00'
        },
        {
          productoId: productosOrg2[1].id, // Lasaña Boloñesa
          cantidad: 1,
          precioUnitario: '22000.00',
          subtotal: '22000.00'
        }
      ],
      org2Id
    );

    // 8. Crear asignaciones de pedidos
    console.log('🚚 Creando asignaciones de pedidos...');
    await createAsignacionPedido({
      pedidoId: pedido1.pedidoId,
      repartidorId: repartidoresOrg1[0].id, // Carlos
      estado: 'asignado'
    });

    await createAsignacionPedido({
      pedidoId: pedido2.pedidoId,
      repartidorId: repartidoresOrg1[1].id, // Luis
      estado: 'en_camino'
    });

    await createAsignacionPedido({
      pedidoId: pedido3.pedidoId,
      repartidorId: repartidoresOrg2[0].id, // Miguel
      estado: 'entregado'
    });

    console.log('✅ Seed completado exitosamente!');
    console.log('📊 Datos creados:');
    console.log('  - 2 organizaciones');
    console.log('  - 3 permisos de usuario');
    console.log('  - 3 usuarios');
    console.log('  - 3 clientes');
    console.log('  - 5 productos');
    console.log('  - 3 repartidores');
    console.log('  - 3 pedidos');
    console.log('  - 6 detalles de pedido');
    console.log('  - 3 asignaciones de pedido');

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    throw error;
  }
}

// Ejecutar el seed si este archivo se ejecuta directamente
if (require.main === module) {
  seed()
    .then(() => {
      console.log('🎉 Proceso de seed finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal en el seed:', error);
      process.exit(1);
    });
}