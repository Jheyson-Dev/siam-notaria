import React, { useState, useEffect } from 'react';

import ListarDDJJ from './ListarDDJJ';
import ListarRecibosCaja from './ListarRecibosCaja';
import ListarAlcabala from './ListarAlcabala';
import ListarDocumentosCatastrales from './ListarDocumentosCatastrales';
import ListarImpuestoVehicular from './ListarImpuestoVehicular';

import { createPortal } from 'react-dom';

const ConsultaModal = ({ isOpen, onClose, data }) => {
    // ...
    const [year, setYear] = useState(new Date().getFullYear());
    const [isDDJJModalOpen, setIsDDJJModalOpen] = useState(false);
    const [isRecibosModalOpen, setIsRecibosModalOpen] = useState(false);
    const [isAlcabalaModalOpen, setIsAlcabalaModalOpen] = useState(false);
    const [isCatastralesModalOpen, setIsCatastralesModalOpen] = useState(false);
    const [isVehicularModalOpen, setIsVehicularModalOpen] = useState(false);

    // Restablecer el año cuando se abre el modal
    useEffect(() => {
        if (isOpen) {
            setYear(new Date().getFullYear());
            setIsDDJJModalOpen(false);
            setIsRecibosModalOpen(false);
            setIsAlcabalaModalOpen(false);
            setIsCatastralesModalOpen(false);
            setIsVehicularModalOpen(false);
        }
    }, [isOpen, data]);
    // ...

    if (!isOpen || !data) return null;

    // Ayudante para obtener propiedad de forma segura sin importar mayúsculas/minúsculas (búsqueda insensible a mayúsculas)
    const getCaseInsensitive = (obj, key) => {
        if (!obj) return '';
        const lowerKey = key.toLowerCase();
        const foundKey = Object.keys(obj).find(k => k.toLowerCase() === lowerKey);
        return foundKey ? obj[foundKey] : '-';
    };

    // Preparar datos de conexión para DDJJ
    const connectionData = {
        ide_cnt: getCaseInsensitive(data, 'ide_cnt') !== '-' ? getCaseInsensitive(data, 'ide_cnt') : null,
        ide_bde: getCaseInsensitive(data, 'ide_bde') !== '-' ? getCaseInsensitive(data, 'ide_bde') : null, // Parámetro añadido
    };
    // Calcular deuda de forma segura
    const rawDebt = getCaseInsensitive(data, 'imp_deu');
    const impDeu = parseFloat(rawDebt === '-' ? 0 : rawDebt);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Aquí activarías la búsqueda/proceso real del backend
        console.log(`Consultando para: ${getCaseInsensitive(data, 'nom_com')} (Doc: ${getCaseInsensitive(data, 'nro_doc')}) - Año: ${year}`);
        alert(`Iniciando consulta para el año ${year}...\nContribuyente: ${getCaseInsensitive(data, 'nom_com')}`);
        onClose();
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            {/* Fondo / Overlay - Ocupa todo el viewport y bloquea interacción */}
            <div
                className="fixed inset-0 bg-slate-900/40 transition-opacity"
                aria-hidden="true"
                onClick={onClose}
            ></div>

            {/* Contenedor del Modal - Centrado absoluto en el viewport */}
            <div className="relative inline-block w-full max-w-3xl bg-white rounded-[2rem] text-left shadow-2xl transform transition-all animate-fade-scale z-10 border border-slate-100 max-h-[90vh] overflow-y-auto">

                {/* Encabezado Premium */}
                <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-secondary tracking-tight" id="modal-title">
                            Detalles de Consulta
                        </h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">Siam Infraestructura</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 bg-white text-slate-400 hover:text-white hover:bg-rose-500 rounded-xl transition-all border border-slate-200 shadow-sm hover:shadow-md active:scale-95"
                        aria-label="Cerrar modal"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-0">
                    {/* Cuerpo Compacto */}
                    <div className="px-6 py-6">
                        <div className="space-y-4">
                            {/* Datos del Contribuyente */}
                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Contribuyente</span>
                                    <span className="text-[0.8rem] font-bold text-secondary">{getCaseInsensitive(data, 'nom_com')}</span>
                                </div>
                                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">DNI / RUC</span>
                                    <span className="text-[0.8rem] font-bold text-secondary font-mono">{getCaseInsensitive(data, 'nro_doc')}</span>
                                </div>
                                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Origen</span>
                                    <span className="text-[0.8rem] font-bold text-primary">{getCaseInsensitive(data, 'nom_eje')}</span>
                                </div>
                                <div className="flex justify-between items-center pt-1">
                                    <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">Deuda Total</span>
                                    <span className="text-base font-bold text-rose-600 font-mono">
                                        {impDeu.toLocaleString('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>

                            {/* Selección de Año */}
                            <div className="px-1">
                                <label htmlFor="year" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                                    Periodo Fiscal a Consultar
                                </label>
                                <div className="relative group">
                                    <input
                                        type="number"
                                        id="year"
                                        name="year"
                                        min="2000"
                                        max="2100"
                                        required
                                        className="block w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-0 focus:border-primary focus:bg-white text-sm font-bold text-secondary transition-all"
                                        value={year}
                                        onChange={(e) => setYear(e.target.value)}
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-300">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Opciones de Acción Estilo App */}
                    <div className="bg-slate-50 px-4 sm:px-6 md:px-8 py-6 md:py-8 border-t border-slate-100">
                        {/* Grilla de Accesos Directos - Responsive */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                            <button
                                type="button"
                                onClick={() => setIsDDJJModalOpen(true)}
                                className="flex flex-col items-center justify-center p-3 sm:p-4 bg-white border border-slate-200 rounded-2xl hover:border-primary hover:bg-emerald-50/50 hover:shadow-md hover:-translate-y-0.5 transition-all group min-h-[100px] sm:min-h-[110px]"
                            >
                                <span className="text-2xl sm:text-3xl mb-2 group-hover:scale-110 transition-transform">🏠</span>
                                <span className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-tight text-center leading-tight">DDJJ<br />Predial</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsAlcabalaModalOpen(true)}
                                className="flex flex-col items-center justify-center p-3 sm:p-4 bg-white border border-slate-200 rounded-2xl hover:border-primary hover:bg-emerald-50/50 hover:shadow-md hover:-translate-y-0.5 transition-all group min-h-[100px] sm:min-h-[110px]"
                            >
                                <span className="text-2xl sm:text-3xl mb-2 group-hover:scale-110 transition-transform">💰</span>
                                <span className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-tight text-center leading-tight">Impuesto<br />Alcabala</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsRecibosModalOpen(true)}
                                className="flex flex-col items-center justify-center p-3 sm:p-4 bg-white border border-slate-200 rounded-2xl hover:border-primary hover:bg-emerald-50/50 hover:shadow-md hover:-translate-y-0.5 transition-all group min-h-[100px] sm:min-h-[110px]"
                            >
                                <span className="text-2xl sm:text-3xl mb-2 group-hover:scale-110 transition-transform">🎟️</span>
                                <span className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-tight text-center leading-tight">Recibos<br />Caja</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsVehicularModalOpen(true)}
                                className="flex flex-col items-center justify-center p-3 sm:p-4 bg-white border border-slate-200 rounded-2xl hover:border-primary hover:bg-emerald-50/50 hover:shadow-md hover:-translate-y-0.5 transition-all group min-h-[100px] sm:min-h-[110px]"
                            >
                                <span className="text-2xl sm:text-3xl mb-2 group-hover:scale-110 transition-transform">🚗</span>
                                <span className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-tight text-center leading-tight">Impuesto<br />Vehicular</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsCatastralesModalOpen(true)}
                                className="flex flex-col items-center justify-center p-3 sm:p-4 bg-white border border-slate-200 rounded-2xl hover:border-primary hover:bg-emerald-50/50 hover:shadow-md hover:-translate-y-0.5 transition-all group min-h-[100px] sm:min-h-[110px] col-span-2 sm:col-span-1"
                            >
                                <span className="text-2xl sm:text-3xl mb-2 group-hover:scale-110 transition-transform">📜</span>
                                <span className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-tight text-center leading-tight">Constancias<br />No Adeudo</span>
                            </button>
                        </div>

                        {/* Cancelar */}
                        <button
                            type="button"
                            className="w-full mt-5 py-2 text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-slate-700 transition-colors"
                            onClick={onClose}
                        >
                            Cerrar Ventana
                        </button>
                    </div>
                </form>
            </div>

            {/* Modal DDJJ Anidado - Fuera del contenedor con transform para posicionamiento fixed correcto */}
            <ListarDDJJ
                isOpen={isDDJJModalOpen}
                onClose={() => setIsDDJJModalOpen(false)}
                data={data}
                connectionData={connectionData}
            />

            <ListarRecibosCaja
                isOpen={isRecibosModalOpen}
                onClose={() => setIsRecibosModalOpen(false)}
                data={data}
            />

            <ListarAlcabala
                isOpen={isAlcabalaModalOpen}
                onClose={() => setIsAlcabalaModalOpen(false)}
                data={data}
                connectionData={connectionData}
            />

            <ListarDocumentosCatastrales
                isOpen={isCatastralesModalOpen}
                onClose={() => setIsCatastralesModalOpen(false)}
                data={data}
                connectionData={connectionData}
            />

            <ListarImpuestoVehicular
                isOpen={isVehicularModalOpen}
                onClose={() => setIsVehicularModalOpen(false)}
                data={data}
                connectionData={connectionData}
            />

            <div className="absolute bottom-2 right-2 text-[10px] text-gray-300 font-mono z-20">
                src/components/Dashboard/ConsultaModal_x_cnt.jsx
            </div>
        </div>,
        document.body
    );
};

export default ConsultaModal;
