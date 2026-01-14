import React from 'react';
import logo from '../../assets/images/logo_SIAM_verde.png';

// A layout wrapper that provides the professional notary look
const LoginLayout = ({ children }) => {
    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background to-accent/30 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-accent rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-light rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-secondary rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <div className="max-w-md w-full space-y-8 bg-surface/80 backdrop-blur-lg p-10 rounded-2xl shadow-xl z-10 border border-white/60 relative">
                {/* Branding Area */}
                <div className="flex flex-col items-center text-center">
                    <img
                        src={logo}
                        alt="SIAMsoft Notarial"
                        className="h-24 w-auto mb-6 drop-shadow-sm transition-transform hover:scale-105 duration-300"
                    />
                    <h2 className="text-3xl font-extrabold text-primary tracking-tight">
                        Acceso Notarial
                    </h2>
                    <p className="mt-2 text-sm text-gray-500 font-medium">
                        Sistema Integrado de Gestión
                    </p>
                </div>
                {children}

                {/* Footer Copyright */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                    <p className="text-center text-xs text-gray-400">
                        &copy; 2026 SIAMsoft. Todos los derechos reservados.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginLayout;
