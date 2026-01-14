import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';

const ChangePassword = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            setError("Las contraseñas nuevas no coinciden.");
            return;
        }

        if (formData.newPassword.length < 6) {
            setError("La nueva contraseña debe tener al menos 6 caracteres.");
            return;
        }

        setIsLoading(true);

        try {
            // Retrieve token? In this flow we might just send email + password verification
            // Ideally we use a stored token, but for now passing email to identify user

            const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: user.cor_ele,
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al cambiar la contraseña');
            }

            setSuccess('Contraseña actualizada correctamente.');

            // Actualizar localStorage para que la alerta desaparezca
            const updatedUser = {
                ...user,
                flg_cam_psw: 1,
                fch_cam_psw: new Date().toISOString()
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white shadow rounded-lg p-6 mt-10">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Cambiar Contraseña</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Contraseña Actual</label>
                    <input
                        type="password"
                        name="currentPassword"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border"
                        value={formData.currentPassword}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
                    <input
                        type="password"
                        name="newPassword"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border"
                        value={formData.newPassword}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Confirmar Nueva Contraseña</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                    />
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}
                {success && <p className="text-sm text-green-600">{success}</p>}

                <div className="flex justify-end space-x-3 mt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-opacity-90 focus:outline-none disabled:opacity-50"
                    >
                        {isLoading ? 'Actualizando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChangePassword;
