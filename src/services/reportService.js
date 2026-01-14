/**
 * Servicio para la generación de URLs de reportes.
 * Encapsula la lógica de construcción de la URL para el sistema de documentos virtuales.
 */

const BASE_API_URL_REPORTES_WD = "https://documentosvirtuales.com";

/**
 * Genera la URL para visualizar el reporte de Declaración Jurada.
 *
 * @param {Object} options - Opciones para la generación del reporte.
 * @param {Array<string|number>} options.arr_ide_dec - Array de identificadores de declaración (ide_dec).
 * @param {string} options.cod_pro - Código del proceso (ej. 'SIAM_DEC_CAB').
 * @param {string|number} options.ide_eje - Identificador del eje (año/periodo).
 * @param {string|number} options.ide_bde - Identificador de la base de datos externa (ide_bde) de la conexión actual.
 * @returns {string} La URL completa para abrir el reporte.
 */
export const generateReportUrl = ({ arr_ide_dec, cod_pro = 'SIAM_DEC_CAB', ide_eje, ide_bde }) => {
    const token = localStorage.getItem("token");

    if (!token) {
        console.warn("No se encontró token de autenticación para generar el reporte.");
    }

    const params = {
        arr_ide_dec,
        cod_pro,
        ide_eje,
    };

    // Construcción de la URL con los parámetros serializados
    // Se utiliza encodeURIComponent para asegurar que los parámetros sean válidos en la URL, 
    // aunque la implementación original no lo usaba, es una buena práctica. 
    // Mantenemos la estructura original solicitada por el usuario para minimizar fricción:
    // url = `${BASE}.../reportes?data=${JSON.stringify(params)}&token=${token}&ide_bde=${String(ide_bde)}`;

    return `${BASE_API_URL_REPORTES_WD}/reportes?data=${JSON.stringify(params)}&token=${token}&ide_bde=${String(ide_bde)}`;
};
