// src/lib/firebase/adminConfig.ts

/**
 * @fileoverview Configuración e inicialización del SDK de Firebase Admin para el backend.
 * @version 1.0.0
 * @author Santiago Prada
 * @date 2025-05-12
 *
 * @description
 * Este archivo inicializa la aplicación Firebase Admin utilizando credenciales de cuenta de servicio.
 * Es esencial para operaciones del lado del servidor como la verificación de Tokens ID de Firebase
 * enviados desde el cliente. Las credenciales se obtienen de variables de entorno por seguridad.
 * NO confundir con la configuración del SDK de cliente de Firebase (firebase/config.ts).
 *
 * @requires firebase-admin - SDK de Admin para Firebase.
 * @requires process - Para acceder a las variables de entorno.
 *
 * @example - Variables de entorno necesarias para `firebase-admin`:
 * # Opción 1 (Recomendada: campos individuales)
 * FIREBASE_ADMIN_PROJECT_ID="tu-project-id-de-firebase"
 * FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0B...\n-----END PRIVATE KEY-----\n" (Asegúrate de escapar los saltos de línea con \n si la variable es una sola línea)
 * FIREBASE_ADMIN_CLIENT_EMAIL="firebase-adminsdk-xxxx@tu-project-id-de-firebase.iam.gserviceaccount.com"
 *
 * # Opción 2 (JSON completo en una variable, menos común para este setup)
 * # FIREBASE_SERVICE_ACCOUNT_JSON='{"type": "service_account", "project_id": "...", ...}'
 *
 * Para obtener estas credenciales:
 * 1. Ve a tu Proyecto en Firebase Console.
 * 2. "Configuración del proyecto" (engranaje) -> "Cuentas de servicio".
 * 3. Selecciona "Firebase Admin SDK" y haz clic en "Generar nueva clave privada".
 * 4. Guarda el archivo JSON descargado de forma segura y usa su contenido para las variables de entorno.
 *    ¡NO LO SUBAS A TU REPOSITORIO GIT!
 *
 * @see {@link https://firebase.google.com/docs/admin/setup} - Documentación de Firebase Admin SDK Setup.
 */

import * as admin from 'firebase-admin';
import type { DecodedIdToken } from 'firebase-admin/auth'; // Solo para el tipado

// --- Variables globales para el estado de inicialización ---
let isInitialized = false;
let initializationError: Error | null = null;

/**
 * Inicializa Firebase Admin SDK de forma lazy (solo cuando se necesita)
 * @returns {boolean} true si la inicialización fue exitosa, false en caso contrario
 */
function initializeFirebaseAdmin(): boolean {
  // Si ya se intentó inicializar, retornar el estado actual
  if (isInitialized || initializationError) {
    return isInitialized;
  }

  try {
    // Verificar si ya hay una app inicializada
    if (admin.apps.length > 0) {
      console.log(' [Firebase Admin] SDK ya estaba inicializado.');
      isInitialized = true;
      return true;
    }

    // Verificar variables de entorno
    if (!process.env.FIREBASE_PROJECT_ID || 
        !process.env.FIREBASE_PRIVATE_KEY || 
        !process.env.FIREBASE_CLIENT_EMAIL) {
      throw new Error(
        'Variables de entorno de Firebase no configuradas. ' +
        'Verifica FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY y FIREBASE_CLIENT_EMAIL.'
      );
    }

    // Crear credenciales
    const serviceAccountCredential = admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    });

    // Inicializar la app
    admin.initializeApp({
      credential: serviceAccountCredential,
      // Opcional: si usas Firebase Realtime Database desde el admin SDK
      // databaseURL: `https://<TU_PROJECT_ID_O_DATABASE_NAME>.firebaseio.com`
    });

    console.log(' [Firebase Admin] SDK inicializado correctamente.');
    isInitialized = true;
    return true;

  } catch (error) {
    const err = error as Error;
    initializationError = err;
    console.error(` [Firebase Admin] Error al inicializar el SDK: ${err.message}`);
    return false;
  }
}

/**
 * Verifica un Token ID de Firebase proporcionado por el cliente.
 *
 * @async
 * @param {string} idToken - El Token ID JWT de Firebase.
 * @returns {Promise<DecodedIdToken | null>} El token decodificado con la información del usuario
 *                                           si es válido, o `null` si es inválido, ha expirado,
 *                                           o si el SDK de Admin no está inicializado.
 */
export const verifyFirebaseToken = async (idToken: string): Promise<DecodedIdToken | null> => {
  // Intentar inicializar Firebase Admin si no está inicializado
  if (!initializeFirebaseAdmin()) {
    console.error(' [Firebase Admin] No se pudo inicializar el SDK para verificar el token.');
    return null;
  }

  try {
    // Verificar que tenemos una app válida antes de acceder a auth()
    const app = admin.app();
    if (!app) {
      console.error(' [Firebase Admin] No hay una app de Firebase Admin disponible.');
      return null;
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    const err = error as Error & { code?: string }; // Firebase errors a menudo tienen un `code`
    console.error(
        ` [Firebase Admin] Error al verificar el Token ID (Código: ${err.code || 'N/A'}): ${err.message}`
    );
    // Puedes querer manejar códigos de error específicos de Firebase aquí
    // ej. 'auth/id-token-expired', 'auth/argument-error'
    return null;
  }
};

/**
 * Obtiene la instancia de Firebase Admin de forma segura
 * @returns {typeof admin | null} La instancia de admin o null si no está inicializada
 */
export const getFirebaseAdmin = (): typeof admin | null => {
  if (!initializeFirebaseAdmin()) {
    return null;
  }
  return admin;
};

/**
 * Obtiene la instancia de auth de forma segura
 * @returns {admin.auth.Auth | null} La instancia de auth o null si no está inicializada
 */
export const getFirebaseAuth = (): admin.auth.Auth | null => {
  if (!initializeFirebaseAdmin()) {
    return null;
  }
  try {
    return admin.auth();
  } catch (error) {
    console.error(' [Firebase Admin] Error al acceder a auth():', error);
    return null;
  }
};

// Exportar la instancia `admin` si se necesita acceso directo en otras partes del backend.
// Generalmente, `verifyFirebaseToken` será la interfaz principal.
// DEPRECATED: Usar getFirebaseAdmin() en su lugar
export { admin as firebaseAdmin };

// DEPRECATED: Usar getFirebaseAuth() en su lugar
export const auth = () => {
  console.warn(' [Firebase Admin] Uso de export auth deprecated. Usar getFirebaseAuth() en su lugar.');
  return getFirebaseAuth();
};