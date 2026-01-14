import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../services/authService';

const ResetPasswordForm = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (passwords.newPassword !== passwords.confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        if (passwords.newPassword.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await resetPassword(token, passwords.newPassword);
            setSuccess(response.message);

            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/');
            }, 3000);

        } catch (err) {
            setError(err.message || 'Error al restablecer contraseña.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-primary">Restablecer Contraseña</h2>
                <p className="text-gray-600 mt-2">Ingrese su nueva contraseña.</p>
            </div>

            <div className="rounded-md shadow-sm -space-y-px">
                <div className="mb-4">
                    <label htmlFor="newPassword" class="block text-sm font-medium text-gray-700 mb-1">
                        Nueva Contraseña
                    </label>
                    <input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        required
                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        placeholder="Nueva contraseña"
                        value={passwords.newPassword}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label htmlFor="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
                        Confirmar Contraseña
                    </label>
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        placeholder="Repita la contraseña"
                        value={passwords.confirmPassword}
                        onChange={handleChange}
                    />
                </div>
            </div>

            {error && (
                <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">{error}</h3>
                        </div>
                    </div>
                </div>
            )}

            {success && (
                <div className="rounded-md bg-green-50 p-4">
                    <div className="flex">
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-green-800">{success}</h3>
                            <div className="mt-2 text-sm text-green-700">
                                <p>Redirigiendo al login...</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div>
                <button
                    type="submit"
                    disabled={isLoading || success}
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 disabled:opacity-50"
                >
                    {isLoading ? 'Actualizando...' : 'Cambiar Contraseña'}
                </button>
            </div>
        </form>
    );
};

export default ResetPasswordForm;
