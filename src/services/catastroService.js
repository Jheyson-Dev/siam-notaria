import { API_BASE_URL } from '../config';

/**
 * Llama al backend para obtener los documentos catastrales de un contribuyente.
 * @param {Object} params - Parámetros de la consulta (pide_cnt, ide_bde).
 * @returns {Promise<Array>} - Lista de documentos catastrales.
 */
export const listDocumentosCatastrales = async (params) => {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_BASE_URL}/api/catastro/list`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(params)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al obtener documentos catastrales');
        }

        return await response.json();
    } catch (error) {
        console.error("Error en catastroService:", error);
        throw error;
    }
};
