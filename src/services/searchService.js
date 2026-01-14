import { API_BASE_URL as API_URL } from '../config';

const searchByDocument = async (documentNumber) => {
    try {
        const token = localStorage.getItem('token');
        const fullUrl = `${API_URL}/api/search/doc`;

        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ documentNumber })
        });

        if (!response.ok) {
            let errorMessage = 'Error al buscar contribuyente';
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                // If response is not JSON (e.g. 403 Forbidden default text), use status text
                errorMessage = response.statusText || errorMessage;
            }

            // Check for auth errors to potentially redirect or notify
            if (response.status === 401 || response.status === 403) {
                errorMessage = 'Sesión expirada. Por favor inicie sesión nuevamente.';
                // Optional: localStorage.removeItem('token');
            }

            throw new Error(errorMessage);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
};

export { searchByDocument };
