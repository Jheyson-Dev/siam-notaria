import React, { useState } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import logo from '../../assets/images/logo_SIAM_verde.png';

const MainLayout = ({ children }) => {
    const navigate = useNavigate();
    // Retrieve user from localStorage (or Context in future)
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans transition-colors duration-500">
            {/* Header - Fluid & Glassmorphism */}
            <header className="bg-white/95 shadow-sm border-b border-emerald-100 z-50 sticky top-0 transition-all">
                <div className="max-w-[1800px] mx-auto px-6 sm:px-10 lg:px-14">
                    <div className="flex justify-between h-16">
                        {/* Logo / Brand */}
                        <div className="flex items-center">
                            <div
                                onClick={() => window.location.href = '/dashboard'}
                                className="flex-shrink-0 flex items-center group cursor-pointer"
                            >
                                <img
                                    className="h-8 w-auto transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                                    src={logo}
                                    alt="SIAMsoft Notarial"
                                />
                                <div className="ml-3 flex flex-col justify-center">
                                    <span className="text-base font-bold text-secondary tracking-tight leading-none group-hover:text-primary transition-colors">
                                        SIAMsoft Notarial
                                    </span>
                                    <span className="text-[0.5rem] uppercase tracking-[0.15em] text-emerald-600/60 font-bold mt-0.5">
                                        Gestión Inteligente
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Mobile menu button */}
                        <div className="flex items-center md:hidden">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-xl text-gray-400 hover:text-primary hover:bg-emerald-50 focus:outline-none transition-all"
                            >
                                <span className="sr-only">Abrir menú</span>
                                {!isMobileMenuOpen ? (
                                    <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                ) : (
                                    <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        {/* User Info & Actions - Desktop */}
                        <div className="hidden md:flex items-center space-x-6">
                            {/* User Details */}
                            <div className="text-right group cursor-pointer" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                                <div className="text-sm font-bold text-secondary">
                                    {user.nom_com || 'Usuario'}
                                </div>
                                <div className="text-[0.65rem] text-emerald-700/60 flex flex-col items-end leading-tight font-semibold">
                                    <span className="truncate max-w-[180px]">{user.dir_not || 'Dirección no registrada'}</span>
                                    <span className="opacity-70">
                                        {user.des_dis ? `${user.des_dis}, ${user.des_pro}` : 'Sin ubicación'}
                                    </span>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="h-6 w-px bg-emerald-100/50"></div>

                            {/* Actions Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="flex items-center focus:outline-none group"
                                >
                                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-lg shadow-emerald-500/10 group-hover:shadow-emerald-500/20 group-hover:-translate-y-0.5 transition-all duration-300 ring-2 ring-white">
                                        <span className="font-bold text-sm">{(user.nom_com || 'U').charAt(0).toUpperCase()}</span>
                                    </div>
                                    <svg className={`ml-2 h-3.5 w-3.5 text-emerald-800/40 transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Dropdown Menu */}
                                {isMenuOpen && (
                                    <div className="origin-top-right absolute right-0 mt-4 w-60 rounded-2xl shadow-2xl py-2 bg-white border border-emerald-50 animate-fade-scale z-50">
                                        <div className="px-4 py-2 mb-1 border-b border-emerald-50/50">
                                            <p className="text-[0.6rem] text-emerald-600/40 uppercase tracking-[0.15em] font-bold">Tu Cuenta</p>
                                        </div>
                                        <Link
                                            to="/change-password"
                                            className="group flex items-center px-4 py-2.5 text-xs text-gray-700 hover:bg-emerald-50 hover:text-primary transition-all rounded-xl mx-2"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <div className="p-1.5 bg-slate-50 rounded-lg mr-2.5 group-hover:bg-white group-hover:shadow-sm">
                                                <svg className="h-3.5 w-3.5 text-slate-400 group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.536 16.293a1 1 0 01-1.414 0l-.707.707a1 1 0 01-1.414 0l-.707.707a1 1 0 01-1.414 0L3 21l-.707.707a1 1 0 01-1.414 0l1.414-1.414a1 1 0 010-1.414l.707-.707a1 1 0 010-1.414l.707-.707 3.586-3.586A6 6 0 1115 7z" />
                                                </svg>
                                            </div>
                                            <span className="font-semibold">Seguridad</span>
                                        </Link>
                                        {user.flg_adm === 1 && (
                                            <Link
                                                to="/admin/users"
                                                className="group flex items-center px-4 py-2.5 text-xs text-gray-700 hover:bg-emerald-50 hover:text-primary transition-all rounded-xl mx-2"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                <div className="p-1.5 bg-slate-50 rounded-lg mr-2.5 group-hover:bg-white group-hover:shadow-sm">
                                                    <svg className="h-3.5 w-3.5 text-slate-400 group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                    </svg>
                                                </div>
                                                <span className="font-semibold">Usuarios</span>
                                            </Link>
                                        )}
                                        <div className="mt-1.5 pt-1.5 border-t border-emerald-50/50">
                                            <button
                                                onClick={handleLogout}
                                                className="w-[calc(100%-1rem)] group flex items-center px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 transition-all rounded-xl mx-2"
                                            >
                                                <div className="p-1.5 bg-red-50/50 rounded-lg mr-2.5 group-hover:bg-white group-hover:shadow-sm">
                                                    <svg className="h-3.5 w-3.5 text-red-400 group-hover:text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                    </svg>
                                                </div>
                                                <span className="font-semibold">Salir</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-emerald-50 bg-white/95 backdrop-blur-xl animate-fade-in">
                        <div className="px-6 py-8 space-y-6">
                            <div className="flex items-center p-4 bg-emerald-50 rounded-2xl">
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-emerald-500/10">
                                    {(user.nom_com || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div className="ml-4">
                                    <div className="text-base font-bold text-secondary">{user.nom_com || 'Usuario'}</div>
                                    <div className="text-[0.65rem] text-secondary/60 font-semibold">{user.dir_not || 'Sin dirección'}</div>
                                </div>
                            </div>
                            <nav className="space-y-1">
                                <Link
                                    to="/change-password"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-emerald-50 hover:text-primary transition-all"
                                >
                                    Seguridad y Perfil
                                </Link>
                                {user.flg_adm === 1 && (
                                    <Link
                                        to="/admin/users"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-emerald-50 hover:text-primary transition-all"
                                    >
                                        Gestión Administrativa
                                    </Link>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center w-full px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-all"
                                >
                                    Cerrar Sesión
                                </button>
                            </nav>
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content - Fluid and Expansive */}
            <main className="flex-1 w-full max-w-[1920px] mx-auto px-6 sm:px-10 lg:px-14 py-4 animate-fade-scale">
                <Outlet />
            </main>

            {/* Premium Footer */}
            <footer className="bg-white border-t border-emerald-50 py-6">
                <div className="max-w-[1800px] mx-auto px-6 sm:px-10 lg:px-14 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-xs font-semibold text-slate-400">
                    <div className="flex flex-col items-center md:items-start">
                        <p>&copy; {new Date().getFullYear()} <span className="text-secondary">SIAMsoft</span>. Versión 2.1</p>
                        <p className="text-[9px] text-emerald-600/30 uppercase tracking-widest mt-0.5">Infraestructura Notarial Inteligente</p>
                    </div>
                    <div className="flex space-x-6">
                        <span className="hover:text-primary cursor-pointer transition-colors">Soporte</span>
                        <span className="hover:text-primary cursor-pointer transition-colors">Términos</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};
export default MainLayout;
