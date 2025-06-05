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
import serviceAccountCredentials_json from '../../../gestor-pedidos-15764-firebase-adminsdk-hi0zn-c5572fa398.json';

// --- Configuración de Credenciales de Cuenta de Servicio ---
// Las credenciales se cargan directamente desde el archivo JSON importado.
// Asegúrate de que `resolveJsonModule: true` y `esModuleInterop: true` (recomendado)
// estén en tu `tsconfig.json` para que la importación de JSON funcione correctamente.

let serviceAccountParams: admin.ServiceAccount | null;

try {
  // El JSON importado se asigna directamente.
  // Se realiza una validación básica de los campos esperados del JSON (snake_case)
  // y se mapean a la interfaz admin.ServiceAccount (camelCase).
  const credentials = serviceAccountCredentials_json;

  if (credentials && typeof credentials === 'object' &&
      'project_id' in credentials && typeof credentials.project_id === 'string' &&
      'private_key' in credentials && typeof credentials.private_key === 'string' &&
      'client_email' in credentials && typeof credentials.client_email === 'string') {
    
    serviceAccountParams = {
      projectId: credentials.project_id,
      privateKey: credentials.private_key.replace(/\\n/g, '\n'), // Manejar escapes de nueva línea
      clientEmail: credentials.client_email,
      // Otros campos del JSON como client_id, type, etc., son generalmente manejados
      // internamente por admin.credential.cert() si los necesita.
    };

    // Verificar que los campos mapeados no sean undefined o null si son críticos
    if (!serviceAccountParams.projectId || !serviceAccountParams.privateKey || !serviceAccountParams.clientEmail) {
        console.error(' [Firebase Admin] Valores críticos (projectId, privateKey, clientEmail) faltan o son inválidos en el JSON de credenciales importado.');
        serviceAccountParams = null;
    }

  } else {
    console.error(' [Firebase Admin] El archivo JSON de credenciales importado está incompleto, no es un objeto, o no tiene el formato esperado (project_id, private_key, client_email deben ser strings).');
    serviceAccountParams = null;
  }
} catch (error) {
  const err = error as Error;
  console.error(` [Firebase Admin] Error al procesar el archivo JSON de credenciales importado: ${err.message}`);
  serviceAccountParams = null;
}

// --- Inicialización de Firebase Admin App ---

/**
 * Inicializa la aplicación Firebase Admin si aún no ha sido inicializada
 * y las credenciales de servicio están disponibles.
 */
if (!admin.apps.length) {
  if (serviceAccountParams && serviceAccountParams.projectId) { // Verifica que las credenciales esenciales estén presentes
    console.log(' [Firebase Admin] Inicializando SDK...');
    //console.log(' [Firebase Admin] Proyecto:', serviceAccountParams);
    console.log(' [Firebase Admin] Inspeccionando objeto admin antes de initializeApp:', admin); // Nueva línea de log
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountParams),
        // Opcional: si usas Firebase Realtime Database desde el admin SDK
        // databaseURL: `https://<TU_PROJECT_ID_O_DATABASE_NAME>.firebaseio.com`
      });
      console.log(' [Firebase Admin] SDK inicializado correctamente.');
    } catch (error) {
      const err = error as Error;
      console.error(` [Firebase Admin] Error al inicializar el SDK: ${err.message}`, err.stack);
      // En un entorno de producción, podrías querer que esto sea un error fatal
      // si el admin SDK es crítico para el funcionamiento de tus APIs.
      throw new Error(`Failed to initialize Firebase Admin SDK: ${serviceAccountParams} ${err.message}`);
    }
  } else {
    // Advertencia si las credenciales no están configuradas pero no es necesariamente un error fatal
    // (por ejemplo, si algunas partes de la app no usan el admin SDK o en entornos de prueba específicos).
    console.warn(
      ' [Firebase Admin] Credenciales de cuenta de servicio no completamente configuradas ' +
      'o FIREBASE_SERVICE_ACCOUNT_JSON no es un JSON válido. ' +
      'El SDK de Firebase Admin no se inicializará. La verificación de tokens fallará.'
    );
  }
} else {
  console.log(' [Firebase Admin] SDK ya estaba inicializado.'); // Log opcional
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
  // Comprobar si la app admin por defecto existe y está inicializada
  if (!admin.apps.length || !admin.app()) {
    console.error(' [Firebase Admin] Intento de verificar token pero el SDK de Admin no está inicializado.');
    return null;
  }

  try {
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

// Exportar la instancia `admin` si se necesita acceso directo en otras partes del backend.
// Generalmente, `verifyFirebaseToken` será la interfaz principal.
export { admin as firebaseAdmin };

// Export auth for convenience
export const auth = admin.auth;