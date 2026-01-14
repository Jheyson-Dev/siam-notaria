/*
 * CONFIGURACIÓN CENTRALIZADA DE API
 * Para producción: Comentar la línea de desarrollo y descomentar la de producción.
 * Opcional: Se incluye auto-detección para evitar cambios manuales.
 */

// 1. URL de PRODUCCIÓN (Cambiar por tu dominio real si es diferente al origen)
const PROD_URL = window.location.origin;

// 2. URL de DESARROLLO
const DEV_URL = 'http://localhost:3001';

// 3. SELECCIÓN AUTOMÁTICA O MANUAL
// Para forzar una URL, simplemente asigna el valor directamente a API_BASE_URL
export const API_BASE_URL = window.location.hostname === 'localhost'
    ? DEV_URL
    : PROD_URL;

// Configuración de API de QR (generalmente es la misma en todos los entornos)
export const API_QR = import.meta.env.VITE_API_QR ||
    'https://apis.siamsoft.gobiernodigitalperu.com';
