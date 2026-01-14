import { API_BASE_URL as API_URL } from '../config';
import { generateReportUrl } from './reportService';

const listAlcabala = async (connectionParams) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/alcabala/list`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(connectionParams)
        });

        if (!response.ok) {
            let errorMsg = 'Error al obtener registros de Alcabala';
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
 * Genera la URL para la impresión del reporte de Alcabala.
 */
const getAlcabalaReportUrl = (itemFila, ide_bde) => {
    const getValue = (obj, key) => {
        if (!obj) return null;
        if (obj[key] !== undefined) return obj[key];
        const keys = Object.keys(obj);
        const match = keys.find(k => k.toLowerCase() === key.toLowerCase());
        return match ? obj[match] : null;
    };

    const ideDec = getValue(itemFila, 'ide_alc'); // Asumiendo ide_alc para Alcabala
    const ideEje = getValue(itemFila, 'ano_eje');

    return generateReportUrl({
        arr_ide_dec: [ideDec],
        cod_pro: 'SIAM_ALC_CAB',
        ide_eje: ideEje,
        ide_bde
    });
};

export { listAlcabala, getAlcabalaReportUrl };
