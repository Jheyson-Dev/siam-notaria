import { API_BASE_URL as API_URL } from '../config';

const listImpuestoVehicular = async (connectionParams) => {
    try {
        const token = localStorage.getItem('token');
        const { pide_cnt, ide_bde } = connectionParams;

        const response = await fetch(`${API_URL}/api/impuesto-vehicular/${pide_cnt}/${ide_bde}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            let errorMsg = 'Error al obtener registros de Impuesto Vehicular';
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

export { listImpuestoVehicular };
