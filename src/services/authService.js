/**
 * Servicio de Autenticación
 * Interactúa con el API Backend de Node.js.
 */

import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/api/auth`;

export const login = async (email, password) => {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            // Lanzar error desde la respuesta del API
            throw new Error(data.message || 'Error al iniciar sesión');
        }

        // Retornar datos del usuario (y token si se maneja JWT)
        return data;

    } catch (error) {
        // Re-lanzar para ser capturado por el componente
        throw error;
    }
};

export const recoverPassword = async (email) => {
    try {
        const response = await fetch(`${API_URL}/recover-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error al solicitar recuperación');
        }

        return data;

    } catch (error) {
        throw error;
    }
}

export const resetPassword = async (token, newPassword) => {
    try {
        const response = await fetch(`${API_URL}/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, newPassword }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Error al restablecer');
        return data;
    } catch (error) {
        throw error;
    }
};
