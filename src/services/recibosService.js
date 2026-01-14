import { API_BASE_URL as API_URL } from '../config';

const listRecibosCaja = async (connectionParams) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/recibos/list`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(connectionParams)
        });

        if (!response.ok) {
            let errorMsg = 'Error al obtener Recibos de Caja';
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

export { listRecibosCaja };
