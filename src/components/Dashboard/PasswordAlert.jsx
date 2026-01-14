import React from 'react';
import { useNavigate } from 'react-router-dom';

const PasswordAlert = ({ user }) => {
    const navigate = useNavigate();

    // Si no hay usuario o no tiene los campos necesarios, no mostrar nada
    if (!user) return null;

    const needsFirstChange = user.flg_cam_psw === 0;
    let needsPeriodicChange = false;
    let daysDiff = 0;

    if (user.fch_cam_psw) {
        const lastChange = new Date(user.fch_cam_psw);
        const now = new Date();
        const diffTime = Math.abs(now - lastChange);
        daysDiff = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (daysDiff > 60) {
            needsPeriodicChange = true;
        }
    }

    if (!needsFirstChange && !needsPeriodicChange) return null;

    return (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r-lg shadow-sm animate-pulse-subtle">
            <div className="flex items-center">
                <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <div className="ml-4 flex-1">
                    <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wide">
                        Recomendación de Seguridad
                    </h3>
                    <div className="mt-1 text-sm text-amber-700">
                        <p>
                            {needsFirstChange
                                ? "Para proteger su cuenta, es necesario que realice su primer cambio de contraseña."
                                : `Su contraseña no ha sido actualizada en ${daysDiff} días. Le recomendamos cambiarla por seguridad.`}
                        </p>
                    </div>
                </div>
                <div className="ml-4">
                    <button
                        onClick={() => navigate('/change-password')}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all transform hover:scale-105"
                    >
                        Cambiar Clave Ahora
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PasswordAlert;
