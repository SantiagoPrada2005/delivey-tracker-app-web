/**
 * @fileoverview Utilidades de autenticación para el cliente (Frontend)
 * @version 1.0.0
 * @author Santiago Prada
 * @date 2025-01-20
 * 
 * @description
 * Este archivo proporciona utilidades para manejar autenticación
 * desde el cliente usando Firebase Auth. Incluye funciones para
 * obtener tokens y realizar llamadas autenticadas a las APIs.
 */

import { auth } from '@/lib/firebase/client';

/**
 * Obtiene el token de autenticación del usuario actual.
 * 
 * @param {boolean} forceRefresh - Si forzar la renovación del token
 * @returns {Promise<string | null>} Token de autenticación o null si no hay usuario
 */
export async function getCurrentUserToken(forceRefresh: boolean = false): Promise<string | null> {
  try {
    const user = auth.currentUser;
    if (!user) {
      return null;
    }
    
    return await user.getIdToken(forceRefresh);
  } catch (error) {
    console.error('[Auth Client Utils] Error al obtener token:', error);
    return null;
  }
}

/**
 * Realiza una llamada autenticada a la API.
 * 
 * @param {string} url - URL de la API
 * @param {RequestInit} options - Opciones de la request
 * @param {boolean} forceRefresh - Si forzar la renovación del token
 * @returns {Promise<Response>} Respuesta de la API
 */
export async function authenticatedFetch(
  url: string, 
  options: RequestInit = {}, 
  forceRefresh: boolean = false
): Promise<Response> {
  const token = await getCurrentUserToken(forceRefresh);
  
  if (!token) {
    throw new Error('Usuario no autenticado');
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };
  
  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Realiza una llamada GET autenticada a la API.
 * 
 * @param {string} url - URL de la API
 * @param {boolean} forceRefresh - Si forzar la renovación del token
 * @returns {Promise<Response>} Respuesta de la API
 */
export async function authenticatedGet(url: string, forceRefresh: boolean = false): Promise<Response> {
  return authenticatedFetch(url, { method: 'GET' }, forceRefresh);
}

/**
 * Realiza una llamada POST autenticada a la API.
 * 
 * @param {string} url - URL de la API
 * @param {unknown} data - Datos a enviar
 * @param {boolean} forceRefresh - Si forzar la renovación del token
 * @returns {Promise<Response>} Respuesta de la API
 */
export async function authenticatedPost(url: string, data?: unknown, forceRefresh: boolean = false): Promise<Response> {
  return authenticatedFetch(url, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  }, forceRefresh);
}

/**
 * Realiza una llamada PUT autenticada a la API.
 * 
 * @param {string} url - URL de la API
 * @param {unknown} data - Datos a enviar
 * @param {boolean} forceRefresh - Si forzar la renovación del token
 * @returns {Promise<Response>} Respuesta de la API
 */
export async function authenticatedPut(url: string, data?: unknown, forceRefresh: boolean = false): Promise<Response> {
  return authenticatedFetch(url, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  }, forceRefresh);
}

/**
 * Realiza una llamada DELETE autenticada a la API.
 * 
 * @param {string} url - URL de la API
 * @param {boolean} forceRefresh - Si forzar la renovación del token
 * @returns {Promise<Response>} Respuesta de la API
 */
export async function authenticatedDelete(url: string, forceRefresh: boolean = false): Promise<Response> {
  return authenticatedFetch(url, { method: 'DELETE' }, forceRefresh);
}

/**
 * Verifica si el usuario actual está autenticado.
 * 
 * @returns {boolean} true si hay un usuario autenticado, false en caso contrario
 */
export function isUserAuthenticated(): boolean {
  return auth.currentUser !== null;
}

/**
 * Obtiene el UID del usuario actual.
 * 
 * @returns {string | null} UID del usuario o null si no está autenticado
 */
export function getCurrentUserUid(): string | null {
  return auth.currentUser?.uid || null;
}

/**
 * Obtiene el email del usuario actual.
 * 
 * @returns {string | null} Email del usuario o null si no está autenticado
 */
export function getCurrentUserEmail(): string | null {
  return auth.currentUser?.email || null;
}