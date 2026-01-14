import React, { useState } from 'react';
import { searchByDocument } from '../../services/searchService';

const SearchForm = ({ onSearchResults, user = {} }) => {
    const [searchType, setSearchType] = useState('doc'); // 'doc' or 'name'
    const [formData, setFormData] = useState({
        documentNumber: '',
        paternalLast: '',
        maternalLast: '',
        firstName: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [secondsElapsed, setSecondsElapsed] = useState(0);

    const handleTypeChange = (e) => {
        setSearchType(e.target.value);
        setFormData({
            documentNumber: '',
            paternalLast: '',
            maternalLast: '',
            firstName: ''
        });
        setError('');
        onSearchResults(null); // Limpiar resultados al cambiar tipo
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Limpiar resultados al escribir
        onSearchResults(null);

        if (name === 'documentNumber') {
            const re = /^[0-9\b]+$/;
            if (value === '' || re.test(value)) {
                if (value.length <= 11) {
                    setFormData(prev => ({ ...prev, [name]: value }));
                }
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (searchType === 'doc') {
            if (formData.documentNumber.length < 8) {
                setError('El número de documento debe tener al menos 8 dígitos.');
                return;
            }

            setIsLoading(true);
            setSecondsElapsed(0);

            // Iniciar contador - Incremento inmediato para dar feedback
            let seconds = 0;
            const timerId = setInterval(() => {
                seconds++;
                setSecondsElapsed(seconds);
            }, 1000);

            try {
                const data = await searchByDocument(formData.documentNumber);

                if (Array.isArray(data) && data.length === 0) {
                    setError('El DNI / RUC no tiene información en esta plataforma');
                    onSearchResults([]);
                } else {
                    onSearchResults(data); // Pasar resultados al padre
                }

            } catch (err) {
                console.error(err);
                setError(err.message || 'Error al conectar con el servidor.');
                onSearchResults([]); // Limpiar resultados en error? O mantener previos? limpiar es más seguro.
            } finally {
                clearInterval(timerId);
                setIsLoading(false);
            }
        } else {
            // Marcador de posición para búsqueda por nombre
            console.log('Búsqueda por nombre no implementada aún vía backend');
            setError('La búsqueda por nombre estará disponible prontamente.');
        }
    };

    return (
        <div className="premium-card p-5 md:p-6 relative overflow-hidden group">
            {/* Background Decorative Element */}
            <div className="absolute top-0 right-0 -tr-10 w-48 h-48 bg-emerald-50 rounded-full blur-3xl opacity-40 group-hover:opacity-60 transition-opacity duration-700 -z-10"></div>

            <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 gap-3">
                <div className="flex flex-col gap-0.5">
                    <h3 className="text-base sm:text-lg font-bold text-secondary flex items-center tracking-tight">
                        <div className="p-1.5 sm:p-2 bg-emerald-50 rounded-lg mr-2 sm:mr-3 shadow-sm border border-emerald-100">
                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </div>
                        <span className="truncate">Panel de Búsqueda Nacional</span>
                    </h3>
                    <div className="ml-10 sm:ml-12 inline-flex items-center">
                        <span className="text-[0.6rem] sm:text-[0.7rem] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                            SESIÓN: {user.des_dis || 'Municipalidad'}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2 self-start md:self-center">
                    {user.flg_adm === 1 && (
                        <button
                            onClick={() => window.location.href = '/admin/users'}
                            className="bg-secondary text-white px-2.5 py-1.5 rounded-lg shadow-sm hover:bg-secondary-dark transition-colors flex items-center gap-2"
                            title="Gestión de usuarios"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <span className="hidden sm:inline text-[0.65rem] font-bold uppercase tracking-wider">Gestión de usuarios</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Horizontal Search Bar Section */}
            <div className="bg-slate-50/50 p-1.5 sm:p-2 rounded-2xl border border-slate-100 mb-3">
                <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3">
                    {/* Label and Selector Group */}
                    <div className="flex items-center gap-2 px-1 sm:px-2">
                        <span className="text-[0.65rem] sm:text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                            Buscar:
                        </span>
                        <div className="flex bg-white p-0.5 rounded-lg border border-slate-200 shadow-sm">
                            <button
                                type="button"
                                onClick={() => handleTypeChange({ target: { value: 'doc' } })}
                                className={`px-2.5 sm:px-4 py-1 rounded-md text-[0.55rem] sm:text-[0.65rem] font-bold uppercase tracking-tight transition-all ${searchType === 'doc' ? 'bg-emerald-50 text-primary ring-1 ring-emerald-100' : 'text-slate-500 hover:text-secondary'}`}
                            >
                                DNI/RUC
                            </button>
                            <button
                                type="button"
                                onClick={() => handleTypeChange({ target: { value: 'name' } })}
                                className={`px-2.5 sm:px-4 py-1 rounded-md text-[0.55rem] sm:text-[0.65rem] font-bold uppercase tracking-tight transition-all ${searchType === 'name' ? 'bg-emerald-50 text-primary ring-1 ring-emerald-100' : 'text-slate-500 hover:text-secondary opacity-50 cursor-not-allowed'}`}
                            >
                                NOMBRES
                            </button>
                        </div>
                    </div>

                    {/* Input and Button Group */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
                        <div className="flex-1 relative group">
                            {searchType === 'doc' ? (
                                <>
                                    <input
                                        type="text"
                                        name="documentNumber"
                                        id="documentNumber"
                                        className="block w-full pl-4 pr-10 py-2 bg-white border-2 border-slate-200 rounded-xl focus:ring-0 focus:border-primary focus:bg-white text-sm sm:text-base font-bold tracking-widest text-secondary transition-all placeholder-slate-300 shadow-sm"
                                        placeholder="Ingrese DNI o RUC"
                                        value={formData.documentNumber}
                                        onChange={handleChange}
                                        required
                                        autoFocus
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="text-slate-400 text-[8px] font-bold font-mono">
                                            {formData.documentNumber.length}/11
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <div className="w-full py-2 px-4 bg-slate-100 border-2 border-dashed border-slate-200 rounded-xl text-center">
                                    <span className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest">
                                        FUTURO MÓDULO
                                    </span>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || searchType !== 'doc'}
                            className={`btn-primary w-full sm:w-auto px-6 py-2 rounded-xl text-[0.65rem] sm:text-[0.7rem] font-bold uppercase tracking-widest flex items-center justify-center gap-2 group/btn min-w-[160px] ${isLoading || searchType !== 'doc' ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg transition-all'}`}
                        >
                            {/* Loading State - Always in DOM */}
                            <span className={isLoading ? "flex items-center gap-2" : "hidden"}>
                                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="whitespace-nowrap">Cargando... {secondsElapsed}s</span>
                            </span>

                            {/* Normal State - Always in DOM */}
                            <span className={!isLoading ? "flex items-center gap-2" : "hidden"}>
                                <svg className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                                <span className="truncate">Realizar Consulta</span>
                            </span>
                        </button>
                    </div>
                </form>
            </div>
            {error && (
                <div className="rounded-xl bg-red-50 p-4 border border-red-100 animate-shake flex items-center max-w-lg">
                    <div className="p-1.5 bg-white rounded-lg mr-3 shadow-sm">
                        <svg className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <p className="text-xs font-bold text-red-800">{error}</p>
                </div>
            )}

            <div className="pt-0">
                {/* This button is now part of the horizontal search bar, so it's removed from here. */}
            </div>
            <div className="absolute bottom-3 right-5 text-[10px] text-slate-400 font-bold tracking-widest uppercase">
                Infraestructura Notarial SIAMsoft
            </div>
        </div>
    );
};

export default SearchForm;
