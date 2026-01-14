/*
 * CONFIGURACIÓN CENTRALIZADA DE API
 * Las variables de entorno se inyectan automáticamente desde:
 * - .env.development (cuando ejecutas: npm run dev)
 * - .env.production (cuando ejecutas: npm run build)
 */

// URL base del API backend (se obtiene de las variables de entorno)
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

// URL de la API de QR (se obtiene de las variables de entorno)
export const API_QR =
  import.meta.env.VITE_API_QR ||
  "https://apis.siamsoft.gobiernodigitalperu.com";

// Modo de desarrollo (útil para debugging)
export const IS_DEV = import.meta.env.DEV;
export const IS_PROD = import.meta.env.PROD;
