import React, { useState } from 'react';
import { login, recoverPassword } from '../../services/authService';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isRecovering, setIsRecovering] = useState(false);

    // Handlers
    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({ ...prev, [name]: value }));
        setError(''); // Clear error on type
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const data = await login(credentials.email, credentials.password);
            // Save user data for MainLayout
            localStorage.setItem('user', JSON.stringify(data.user));
            // In a real app, storing token
            localStorage.setItem('token', data.token);

            setSuccessMessage(`¡Bienvenido, ${data.user.nom_com}! Redirigiendo...`);

            setTimeout(() => {
                navigate('/dashboard');
            }, 1000);
        } catch (err) {
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRecovery = async () => {
        if (!credentials.email) {
            setError("Por favor ingrese su correo electrónico para recuperar la clave.");
            return;
        }
        setIsRecovering(true);
        try {
            const res = await recoverPassword(credentials.email);
            setSuccessMessage(res.message);
            setError('');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsRecovering(false);
        }
    }

    const handleCancel = () => {
        setCredentials({ email: '', password: '' });
        setError('');
        setSuccessMessage('');
    };

    // SVG Icons
    const EyeIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
    );

    const EyeOffIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
    );

    return (
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-5">
                <div>
                    <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
                        Correo Electrónico
                    </label>
                    <input
                        id="email-address"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-200 ease-in-out sm:text-sm bg-gray-50 focus:bg-white"
                        placeholder="ejemplo@notaria.pe"
                        value={credentials.email}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Contraseña
                    </label>
                    <div className="relative">
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            required
                            className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-200 ease-in-out sm:text-sm bg-gray-50 focus:bg-white"
                            placeholder="••••••••"
                            value={credentials.password}
                            onChange={handleChange}
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-primary transition-colors"
                            onClick={togglePasswordVisibility}
                        >
                            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end">
                <div className="text-sm">
                    <button
                        type="button"
                        onClick={handleRecovery}
                        className="font-medium text-secondary hover:text-primary transition-colors"
                        disabled={isRecovering}
                    >
                        {isRecovering ? 'Enviando...' : '¿Olvidaste tu contraseña?'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="rounded-lg bg-red-50 p-4 border border-red-100 animate-fade-in">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">{error}</h3>
                        </div>
                    </div>
                </div>
            )}

            {successMessage && (
                <div className="rounded-lg bg-green-50 p-4 border border-green-100 animate-fade-in">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-green-800">{successMessage}</h3>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
                >
                    {isLoading ? (
                        <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Validando credenciales...
                        </span>
                    ) : (
                        'Ingresar a la Plataforma'
                    )}
                </button>
                <button
                    type="button"
                    onClick={handleCancel}
                    className="w-full flex justify-center py-3 px-4 border border-gray-200 text-sm font-medium rounded-lg text-gray-600 bg-white hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors duration-200"
                >
                    Cancelar
                </button>
            </div>
        </form>
    );
};

export default LoginForm;
