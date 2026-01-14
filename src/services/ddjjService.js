import { generateReportUrl } from './reportService';

import { API_BASE_URL as API_URL } from '../config';

const listDDJJ = async (connectionParams) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/ddjj/list`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(connectionParams)
        });

        if (!response.ok) {
            let errorMsg = 'Error al obtener DDJJ';
            try {
                const data = await response.json();
                errorMsg = data.message || errorMsg;
            } catch (e) { }
            throw new Error(errorMsg);
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};


/**
 * Genera la URL para la impresión/visualización del reporte de DDJJ.
 * 
 * Esta función encapsula la lógica de consumo del API de reportes para DDJJ.
 * 
 * Detalles del API consumido:
 * - URL Base: definida en reportService (documentosvirtuales.com)
 * - Parámetros requeridos por el servicio externo:
 *   1. arr_ide_dec: Array de IDs de declaración (se envia como array de un solo elemento).
 *   2. cod_pro: Código de proceso, valor fijo 'SIAM_DEC_CAB' para Declaraciones Juradas.
 *   3. ide_eje: Año/Eje de la declaración.
 *   4. ide_bde: ID de Base de Datos Externa (contexto de conexión).
 * 
 * @param {Object} itemFila - Objeto con los datos de la fila de la grilla (debe contener ide_dec, ide_eje).
 * @param {string|number} ide_bde - Identificador de la base de datos actual.
 * @returns {string} URL lista para ser asignada a un iframe o window.open.
 */
const getDDJJReportUrl = (itemFila, ide_bde) => {
    // Función auxiliar para obtener propiedades sin importar mayúsculas/minúsculas
    const getValue = (obj, key) => {
        if (!obj) return null;
        if (obj[key] !== undefined) return obj[key];
        const keys = Object.keys(obj);
        const match = keys.find(k => k.toLowerCase() === key.toLowerCase());
        return match ? obj[match] : null;
    };

    const ideDec = getValue(itemFila, 'ide_dec');
    const ideEje = getValue(itemFila, 'ide_eje');

    console.log("Generando URL de reporte con ide_bde:", ide_bde); // DEBUG: Verificar ide_bde

    return generateReportUrl({
        arr_ide_dec: [ideDec],
        cod_pro: 'SIAM_DEC_CAB',
        ide_eje: ideEje,
        ide_bde
    });
};

export { listDDJJ, getDDJJReportUrl };
