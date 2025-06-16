/**
 * @fileoverview Hook especializado para manejar operaciones CRUD de pedidos
 * @version 1.0.0
 * @author Santiago Prada
 * @date 2025-01-20
 * 
 * @description
 * Este hook proporciona funcionalidades avanzadas para gestionar pedidos,
 * incluyendo validaciones complejas, cálculos automáticos, manejo de stock,
 * y operaciones transaccionales para la creación de pedidos completos.
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useClientes } from './useClientes';
import { useProductos } from './useProductos';
import { useRepartidores } from './useRepartidores';
import { Pedido } from '@/components/pedidos/types';

export interface DetallePedido {
  id?: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  notaProducto?: string;
  producto?: {
    id: number;
    nombre: string;
    precio: string;
    stock: number;
  };
}

export interface PedidoCompleto {
  // Datos básicos del pedido
  clienteId: number;
  direccionEntrega: string;
  fechaEntrega?: Date;
  estado: 'pendiente' | 'en_proceso' | 'en_camino' | 'entregado' | 'cancelado';
  total: number;
  
  // Detalles del pedido
  detalles: DetallePedido[];
  
  // Asignación opcional
  repartidorId?: number;
  
  // Metadatos
  organizationId: number;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface StockValidation {
  productoId: number;
  nombreProducto: string;
  cantidadSolicitada: number;
  stockDisponible: number;
  esValido: boolean;
}

interface UsePedidosState {
  pedidos: Pedido[];
  loading: boolean;
  error: string | null;
  validationErrors: ValidationError[];
  stockValidations: StockValidation[];
  calculatedTotal: number;
}

interface UsePedidosReturn extends UsePedidosState {
  // Operaciones CRUD básicas
  fetchPedidos: () => Promise<void>;
  getPedidoById: (id: number, completo?: boolean) => Promise<Pedido | null>;
  createPedido: (pedidoData: PedidoCompleto) => Promise<{ success: boolean; pedidoId?: number; errors?: ValidationError[] }>;
  updatePedido: (id: number, pedidoData: Partial<PedidoCompleto>) => Promise<boolean>;
  deletePedido: (id: number) => Promise<boolean>;
  
  // Validaciones y cálculos
  validatePedidoData: (pedidoData: PedidoCompleto) => Promise<ValidationError[]>;
  validateStock: (detalles: DetallePedido[]) => Promise<StockValidation[]>;
  calculateTotal: (detalles: DetallePedido[]) => number;
  calculateSubtotal: (cantidad: number, precioUnitario: number) => number;
  
  // Utilidades para formularios
  initializeEmptyPedido: () => PedidoCompleto;
  addDetalle: (pedido: PedidoCompleto, detalle: Omit<DetallePedido, 'subtotal'>) => PedidoCompleto;
  removeDetalle: (pedido: PedidoCompleto, index: number) => PedidoCompleto;
  updateDetalle: (pedido: PedidoCompleto, index: number, detalle: Partial<DetallePedido>) => PedidoCompleto;
  
  // Operaciones de estado
  updateEstadoPedido: (id: number, estado: Pedido['estado']) => Promise<boolean>;
  asignarRepartidor: (pedidoId: number, repartidorId: number) => Promise<boolean>;
  
  // Búsqueda y filtrado
  searchPedidos: (searchTerm: string) => Pedido[];
  filterPedidosByEstado: (estado: Pedido['estado']) => Pedido[];
  filterPedidosByDateRange: (fechaInicio: Date, fechaFin: Date) => Pedido[];
  
  // Estadísticas y reportes
  getEstadisticasPedidos: () => {
    total: number;
    pendientes: number;
    enProceso: number;
    entregados: number;
    cancelados: number;
    totalVentas: number;
    promedioVenta: number;
  };
  
  // Limpieza de estado
  clearErrors: () => void;
  clearValidations: () => void;
  refreshPedidos: () => Promise<void>;
}

export const usePedidos = (): UsePedidosReturn => {
  const { user, isAuthenticated, getIdToken } = useAuth();
  const { productos, fetchProductos } = useProductos();
  const { clientes, fetchClientes } = useClientes();
  const { repartidores, fetchRepartidores } = useRepartidores();
  
  const [state, setState] = useState<UsePedidosState>({
    pedidos: [],
    loading: false,
    error: null,
    validationErrors: [],
    stockValidations: [],
    calculatedTotal: 0
  });

  // Función para hacer peticiones autenticadas
  const authenticatedFetch = useCallback(async (
    url: string, 
    options: RequestInit = {}
  ): Promise<Response> => {
    if (!isAuthenticated || !user) {
      throw new Error('Usuario no autenticado');
    }

    const token = await getIdToken();
    if (!token) {
      throw new Error('No se pudo obtener el token de autenticación');
    }

    return fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
  }, [isAuthenticated, user, getIdToken]);

  // Obtener todos los pedidos
  const fetchPedidos = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await authenticatedFetch('/api/pedidos');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        pedidos: data.pedidos || [],
        loading: false
      }));
      
    } catch (error) {
      console.error('[usePedidos] Error al obtener pedidos:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error desconocido',
        loading: false
      }));
    }
  }, [authenticatedFetch]);

  // Obtener un pedido por ID
  const getPedidoById = useCallback(async (id: number, completo: boolean = false): Promise<Pedido | null> => {
    try {
      const url = completo ? `/api/pedidos?id=${id}&completo=true` : `/api/pedidos?id=${id}`;
      const response = await authenticatedFetch(url);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.pedido || null;
      
    } catch (error) {
      console.error('[usePedidos] Error al obtener pedido:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }));
      return null;
    }
  }, [authenticatedFetch]);

  // Validar datos del pedido
  // Calcular total del pedido
  const calculateTotal = useCallback((detalles: DetallePedido[]): number => {
    return detalles.reduce((total, detalle) => {
      return total + (detalle.cantidad * detalle.precioUnitario);
    }, 0);
  }, []);

  const validatePedidoData = useCallback(async (pedidoData: PedidoCompleto): Promise<ValidationError[]> => {
    const errors: ValidationError[] = [];

    // Validar cliente
    if (!pedidoData.clienteId) {
      errors.push({
        field: 'clienteId',
        message: 'Debe seleccionar un cliente',
        code: 'REQUIRED_FIELD'
      });
    } else {
      // Verificar que el cliente existe
      const clienteExiste = clientes.some(c => c.id === pedidoData.clienteId);
      if (!clienteExiste) {
        errors.push({
          field: 'clienteId',
          message: 'El cliente seleccionado no existe',
          code: 'INVALID_CLIENT'
        });
      }
    }

    // Validar dirección de entrega
    if (!pedidoData.direccionEntrega || pedidoData.direccionEntrega.trim().length < 10) {
      errors.push({
        field: 'direccionEntrega',
        message: 'La dirección de entrega debe tener al menos 10 caracteres',
        code: 'INVALID_ADDRESS'
      });
    }

    // Validar detalles
    if (!pedidoData.detalles || pedidoData.detalles.length === 0) {
      errors.push({
        field: 'detalles',
        message: 'El pedido debe tener al menos un producto',
        code: 'NO_PRODUCTS'
      });
    } else {
      // Validar cada detalle
      pedidoData.detalles.forEach((detalle, index) => {
        if (!detalle.productoId) {
          errors.push({
            field: `detalles.${index}.productoId`,
            message: `Producto ${index + 1}: Debe seleccionar un producto`,
            code: 'REQUIRED_PRODUCT'
          });
        }

        if (!detalle.cantidad || detalle.cantidad <= 0) {
          errors.push({
            field: `detalles.${index}.cantidad`,
            message: `Producto ${index + 1}: La cantidad debe ser mayor a 0`,
            code: 'INVALID_QUANTITY'
          });
        }

        if (!detalle.precioUnitario || detalle.precioUnitario <= 0) {
          errors.push({
            field: `detalles.${index}.precioUnitario`,
            message: `Producto ${index + 1}: El precio unitario debe ser mayor a 0`,
            code: 'INVALID_PRICE'
          });
        }
      });
    }

    // Validar total
    const calculatedTotal = calculateTotal(pedidoData.detalles);
    if (Math.abs(pedidoData.total - calculatedTotal) > 0.01) {
      errors.push({
        field: 'total',
        message: 'El total calculado no coincide con el total del pedido',
        code: 'INVALID_TOTAL'
      });
    }

    // Validar repartidor si está asignado
    if (pedidoData.repartidorId) {
      const repartidorExiste = repartidores.some(r => r.id === pedidoData.repartidorId);
      if (!repartidorExiste) {
        errors.push({
          field: 'repartidorId',
          message: 'El repartidor seleccionado no existe',
          code: 'INVALID_REPARTIDOR'
        });
      }
    }

    return errors;
  }, [clientes, repartidores, calculateTotal]);

  // Validar stock de productos
  const validateStock = useCallback(async (detalles: DetallePedido[]): Promise<StockValidation[]> => {
    const validations: StockValidation[] = [];

    for (const detalle of detalles) {
      const producto = productos.find(p => p.id === detalle.productoId);
      
      if (producto) {
        const esValido = producto.stock >= detalle.cantidad;
        
        validations.push({
          productoId: detalle.productoId,
          nombreProducto: producto.nombre,
          cantidadSolicitada: detalle.cantidad,
          stockDisponible: producto.stock,
          esValido
        });
      }
    }

    return validations;
  }, [productos]);

  // Calcular subtotal de un detalle
  const calculateSubtotal = useCallback((cantidad: number, precioUnitario: number): number => {
    return cantidad * precioUnitario;
  }, []);

  // Crear un nuevo pedido
  const createPedido = useCallback(async (pedidoData: PedidoCompleto): Promise<{ success: boolean; pedidoId?: number; errors?: ValidationError[] }> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null, validationErrors: [] }));
      
      // Validar datos del pedido
      const validationErrors = await validatePedidoData(pedidoData);
      if (validationErrors.length > 0) {
        setState(prev => ({ ...prev, validationErrors, loading: false }));
        return { success: false, errors: validationErrors };
      }

      // Validar stock
      const stockValidations = await validateStock(pedidoData.detalles);
      const stockErrors = stockValidations.filter(v => !v.esValido);
      
      if (stockErrors.length > 0) {
        const stockValidationErrors: ValidationError[] = stockErrors.map(stock => ({
          field: 'stock',
          message: `${stock.nombreProducto}: Stock insuficiente (disponible: ${stock.stockDisponible}, solicitado: ${stock.cantidadSolicitada})`,
          code: 'INSUFFICIENT_STOCK'
        }));
        
        setState(prev => ({ 
          ...prev, 
          validationErrors: stockValidationErrors,
          stockValidations,
          loading: false 
        }));
        return { success: false, errors: stockValidationErrors };
      }

      // Preparar datos para la API
      const apiData = {
        clienteId: pedidoData.clienteId,
        direccionEntrega: pedidoData.direccionEntrega,
        fechaEntrega: pedidoData.fechaEntrega,
        estado: pedidoData.estado || 'pendiente',
        total: pedidoData.total,
        detalles: pedidoData.detalles.map(detalle => ({
          productoId: detalle.productoId,
          cantidad: detalle.cantidad,
          precioUnitario: detalle.precioUnitario,
          notaProducto: detalle.notaProducto
        }))
      };
      
      const response = await authenticatedFetch('/api/pedidos', {
        method: 'POST',
        body: JSON.stringify(apiData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      setState(prev => ({ ...prev, loading: false }));
      
      // Refrescar la lista de pedidos
      await fetchPedidos();
      
      return { success: true, pedidoId: data.id };
      
    } catch (error) {
      console.error('[usePedidos] Error al crear pedido:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false
      }));
      return { success: false, errors: [{ field: 'general', message: errorMessage, code: 'CREATE_ERROR' }] };
    }
  }, [authenticatedFetch, validatePedidoData, validateStock, fetchPedidos]);

  // Actualizar un pedido existente
  const updatePedido = useCallback(async (id: number, pedidoData: Partial<PedidoCompleto>): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await authenticatedFetch(`/api/pedidos`, {
        method: 'PUT',
        body: JSON.stringify({ id, ...pedidoData })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      
      setState(prev => ({ ...prev, loading: false }));
      
      // Refrescar la lista de pedidos
      await fetchPedidos();
      
      return true;
      
    } catch (error) {
      console.error('[usePedidos] Error al actualizar pedido:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error desconocido',
        loading: false
      }));
      return false;
    }
  }, [authenticatedFetch, fetchPedidos]);

  // Eliminar un pedido
  const deletePedido = useCallback(async (id: number): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await authenticatedFetch(`/api/pedidos?id=${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      
      setState(prev => ({ ...prev, loading: false }));
      
      // Refrescar la lista de pedidos
      await fetchPedidos();
      
      return true;
      
    } catch (error) {
      console.error('[usePedidos] Error al eliminar pedido:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error desconocido',
        loading: false
      }));
      return false;
    }
  }, [authenticatedFetch, fetchPedidos]);

  // Inicializar un pedido vacío
  const initializeEmptyPedido = useCallback((): PedidoCompleto => {
    return {
      clienteId: 0,
      direccionEntrega: '',
      fechaEntrega: undefined,
      estado: 'pendiente',
      total: 0,
      detalles: [],
      organizationId: user?.organizationId ? parseInt(user.organizationId, 10) : 0
    };
  }, [user?.organizationId]);

  // Agregar detalle al pedido
  const addDetalle = useCallback((pedido: PedidoCompleto, detalle: Omit<DetallePedido, 'subtotal'>): PedidoCompleto => {
    const subtotal = calculateSubtotal(detalle.cantidad, detalle.precioUnitario);
    const nuevoDetalle: DetallePedido = { ...detalle, subtotal };
    
    const nuevosDetalles = [...pedido.detalles, nuevoDetalle];
    const nuevoTotal = calculateTotal(nuevosDetalles);
    
    return {
      ...pedido,
      detalles: nuevosDetalles,
      total: nuevoTotal
    };
  }, [calculateSubtotal, calculateTotal]);

  // Remover detalle del pedido
  const removeDetalle = useCallback((pedido: PedidoCompleto, index: number): PedidoCompleto => {
    const nuevosDetalles = pedido.detalles.filter((_, i) => i !== index);
    const nuevoTotal = calculateTotal(nuevosDetalles);
    
    return {
      ...pedido,
      detalles: nuevosDetalles,
      total: nuevoTotal
    };
  }, [calculateTotal]);

  // Actualizar detalle del pedido
  const updateDetalle = useCallback((pedido: PedidoCompleto, index: number, detalle: Partial<DetallePedido>): PedidoCompleto => {
    const nuevosDetalles = [...pedido.detalles];
    const detalleActualizado = { ...nuevosDetalles[index], ...detalle };
    
    // Recalcular subtotal si cambió cantidad o precio
    if (detalle.cantidad !== undefined || detalle.precioUnitario !== undefined) {
      detalleActualizado.subtotal = calculateSubtotal(detalleActualizado.cantidad, detalleActualizado.precioUnitario);
    }
    
    nuevosDetalles[index] = detalleActualizado;
    const nuevoTotal = calculateTotal(nuevosDetalles);
    
    return {
      ...pedido,
      detalles: nuevosDetalles,
      total: nuevoTotal
    };
  }, [calculateSubtotal, calculateTotal]);

  // Actualizar estado del pedido
  const updateEstadoPedido = useCallback(async (id: number, estado: Pedido['estado']): Promise<boolean> => {
    return await updatePedido(id, { estado });
  }, [updatePedido]);

  // Asignar repartidor al pedido
  const asignarRepartidor = useCallback(async (pedidoId: number, repartidorId: number): Promise<boolean> => {
    try {
      // Verificar que el repartidor existe y está disponible
      const repartidor = repartidores.find(r => r.id === repartidorId);
      if (!repartidor) {
        setState(prev => ({
          ...prev,
          error: 'El repartidor seleccionado no existe'
        }));
        return false;
      }
      
      if (!repartidor.disponible) {
        setState(prev => ({
          ...prev,
          error: 'El repartidor seleccionado no está disponible'
        }));
        return false;
      }
      
      // Actualizar el pedido con el repartidor asignado
      return await updatePedido(pedidoId, { repartidorId });
    } catch (error) {
      console.error('[usePedidos] Error al asignar repartidor:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error al asignar repartidor'
      }));
      return false;
    }
  }, [updatePedido, repartidores]);

  // Búsqueda de pedidos
  const searchPedidos = useCallback((searchTerm: string): Pedido[] => {
    if (!searchTerm.trim()) return state.pedidos;
    
    const term = searchTerm.toLowerCase();
    return state.pedidos.filter(pedido => 
      pedido.id.toString().includes(term) ||
      pedido.cliente?.nombre?.toLowerCase().includes(term) ||
      pedido.cliente?.apellido?.toLowerCase().includes(term) ||
      pedido.direccionEntrega.toLowerCase().includes(term)
    );
  }, [state.pedidos]);

  // Filtrar por estado
  const filterPedidosByEstado = useCallback((estado: Pedido['estado']): Pedido[] => {
    return state.pedidos.filter(pedido => pedido.estado === estado);
  }, [state.pedidos]);

  // Filtrar por rango de fechas
  const filterPedidosByDateRange = useCallback((fechaInicio: Date, fechaFin: Date): Pedido[] => {
    return state.pedidos.filter(pedido => {
      const fechaPedido = new Date(pedido.createdAt);
      return fechaPedido >= fechaInicio && fechaPedido <= fechaFin;
    });
  }, [state.pedidos]);

  // Obtener estadísticas
  const getEstadisticasPedidos = useCallback(() => {
    const total = state.pedidos.length;
    const pendientes = state.pedidos.filter(p => p.estado === 'pendiente').length;
    const enProceso = state.pedidos.filter(p => p.estado === 'en_proceso').length;
    const entregados = state.pedidos.filter(p => p.estado === 'entregado').length;
    const cancelados = state.pedidos.filter(p => p.estado === 'cancelado').length;
    const totalVentas = state.pedidos.reduce((sum, p) => sum + p.total, 0);
    const promedioVenta = total > 0 ? totalVentas / total : 0;

    return {
      total,
      pendientes,
      enProceso,
      entregados,
      cancelados,
      totalVentas,
      promedioVenta
    };
  }, [state.pedidos]);

  // Limpiar errores
  const clearErrors = useCallback(() => {
    setState(prev => ({ ...prev, error: null, validationErrors: [] }));
  }, []);

  // Limpiar validaciones
  const clearValidations = useCallback(() => {
    setState(prev => ({ ...prev, validationErrors: [], stockValidations: [] }));
  }, []);

  // Refrescar pedidos
  const refreshPedidos = useCallback(async () => {
    await fetchPedidos();
  }, [fetchPedidos]);

  // Cargar datos iniciales
  useEffect(() => {
    if (isAuthenticated && user?.organizationId) {
      fetchPedidos();
      fetchProductos();
      fetchClientes();
      fetchRepartidores();
    }
  }, [isAuthenticated, user?.organizationId, fetchPedidos, fetchProductos, fetchClientes, fetchRepartidores]);

  return {
    // Estado
    ...state,
    
    // Operaciones CRUD
    fetchPedidos,
    getPedidoById,
    createPedido,
    updatePedido,
    deletePedido,
    
    // Validaciones y cálculos
    validatePedidoData,
    validateStock,
    calculateTotal,
    calculateSubtotal,
    
    // Utilidades para formularios
    initializeEmptyPedido,
    addDetalle,
    removeDetalle,
    updateDetalle,
    
    // Operaciones de estado
    updateEstadoPedido,
    asignarRepartidor,
    
    // Búsqueda y filtrado
    searchPedidos,
    filterPedidosByEstado,
    filterPedidosByDateRange,
    
    // Estadísticas
    getEstadisticasPedidos,
    
    // Limpieza
    clearErrors,
    clearValidations,
    refreshPedidos
  };
};

export default usePedidos;