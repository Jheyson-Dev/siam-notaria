import React, { useState, useMemo } from 'react';
import ConsultaModal from './ConsultaModal_x_cnt';

const ResultsGrid = ({ results }) => {
    // alert("debug: Entrando a ResultsGrid (Render)");
    // Estado para filtro (solo Municipalidad)
    const [filterMunicipality, setFilterMunicipality] = useState('');

    // Estado del Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // Normalizar datos: asegurar que es un array
    let rawData = [];
    if (Array.isArray(results)) {
        rawData = results;
    } else if (results && typeof results === 'object') {
        if (Array.isArray(results.result)) {
            rawData = results.result;
        } else {
            if (Object.keys(results).length > 0) {
                rawData = [results];
            }
        }
    }

    // Helper para obtener propiedad de forma segura (insensible a mayúsculas/minúsculas)
    const getValue = (obj, key) => {
        if (!obj) return null;
        const foundKey = Object.keys(obj).find(k => k.toLowerCase() === key.toLowerCase());
        return foundKey ? obj[foundKey] : null;
    };

    // Lógica de filtro - Solo por nom_eje
    const filteredData = useMemo(() => {
        try {
            if (!rawData) return [];
            if (!filterMunicipality) return rawData;

            return rawData.filter(item => {
                if (!item) return false;
                const nomEje = getValue(item, 'nom_eje') || '';
                return nomEje.toLowerCase().includes(filterMunicipality.toLowerCase());
            });
        } catch (err) {
            console.error("Error in filter useMemo:", err);
            return [];
        }
    }, [rawData, filterMunicipality]);

    const handleFilterChange = (e) => {
        setFilterMunicipality(e.target.value);
    };

    if (!rawData || rawData.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center animate-fade-in border border-gray-200">
                <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Sin resultados</h3>
                <p className="mt-1 text-sm text-gray-500">No se encontraron registros para el documento ingresado.</p>
            </div>
        );
    }

    // Formateador auxiliar para moneda (S/ 9,999.99)
    const formatCurrency = (amount) => {
        const num = parseFloat(amount || 0);
        if (isNaN(num)) return 'S/ 0.00';
        return num.toLocaleString('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 2 });
    };

    // Calcular deuda total (basado en datos FILTRADOS)
    const totalDebt = filteredData.reduce((sum, item) => {
        const val = parseFloat(getValue(item, 'imp_deu') || 0);
        return sum + (isNaN(val) ? 0 : val);
    }, 0);

    const handleConsult = (item) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
    };

    return (
        <div className="space-y-4">
            <div className="premium-card overflow-hidden">
                <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-secondary tracking-tight flex items-center">
                            <span className="w-1.5 h-6 bg-primary rounded-full mr-3"></span>
                            Resultados Consolidados
                        </h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">Base de Datos Nacional</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-white text-emerald-700 text-xs font-bold rounded-full border border-emerald-100 shadow-sm uppercase tracking-widest">
                            {filteredData.length} Registros
                        </span>
                    </div>
                </div>

                {/* Desktop Table View (Hidden on Mobile) */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead>
                            <tr className="bg-secondary text-white">
                                <th className="px-6 py-4 text-left min-w-[280px]">
                                    <div className="text-[0.6rem] font-bold uppercase tracking-[0.15em] mb-2 opacity-70">Entidad / Municipalidad</div>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={filterMunicipality}
                                            onChange={handleFilterChange}
                                            placeholder="Filtrar entidad..."
                                            className="w-full px-3 py-1.5 bg-white/10 text-white placeholder-white/30 text-[0.65rem] rounded-lg border border-white/10 focus:outline-none focus:bg-white/20 focus:border-white/40 transition-all font-medium"
                                        />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-[0.7rem] font-bold uppercase tracking-[0.15em] opacity-80">Identificación</th>
                                <th className="px-6 py-4 text-left text-[0.7rem] font-bold uppercase tracking-[0.15em] opacity-80">Nombre / Razón Social</th>
                                <th className="px-6 py-4 text-right text-[0.7rem] font-bold uppercase tracking-[0.15em] opacity-80">Deuda Insoluta</th>
                                <th className="px-6 py-4 text-center text-[0.7rem] font-bold uppercase tracking-[0.15em] opacity-80">Detalles</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-50">
                            {filteredData.length > 0 ? (
                                filteredData.map((item, index) => (
                                    <tr key={index} className="group/row hover:bg-emerald-50/5 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-[0.7rem] font-bold text-secondary group-hover/row:text-primary transition-colors">
                                                {getValue(item, 'nom_eje') || '-'}
                                            </div>
                                            <div className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-widest">Municipalidad</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2 py-0.5 bg-slate-50 text-slate-700 text-[0.7rem] font-bold rounded border border-slate-100 font-mono">
                                                {getValue(item, 'nro_doc') || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-[0.75rem] font-semibold text-slate-700">
                                                {getValue(item, 'nom_com') || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className={`text-[0.8rem] font-bold font-mono ${parseFloat(getValue(item, 'imp_deu')) > 0 ? 'text-rose-500' : 'text-slate-500'}`}>
                                                {formatCurrency(getValue(item, 'imp_deu'))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button
                                                onClick={() => handleConsult(item)}
                                                className="p-2 bg-slate-50 text-slate-400 hover:bg-primary hover:text-white rounded-lg transition-all shadow-sm border border-slate-100 active:scale-95"
                                                title="Ver detalle"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-300 italic text-[0.75rem]">
                                        No se encontraron registros para el filtro aplicado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot className="bg-slate-50/50">
                            <tr>
                                <td colSpan="3" className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">Total Deuda Identificada</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="text-base font-bold text-rose-600 font-mono tracking-tight">
                                        {formatCurrency(totalDebt)}
                                    </div>
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Mobile Card View (Looper) - Visible only on Mobile */}
                <div className="md:hidden">
                    {/* Mobile Filter */}
                    <div className="p-4 bg-secondary border-b border-white/10">
                        <div className="relative">
                            <input
                                type="text"
                                value={filterMunicipality}
                                onChange={handleFilterChange}
                                placeholder="Filtrar por Municipalidad..."
                                className="w-full px-4 py-2 bg-white/10 text-white placeholder-white/40 text-sm rounded-xl border border-white/20 focus:outline-none focus:bg-white/20 transition-all"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 space-y-4">
                        {filteredData.length > 0 ? (
                            filteredData.map((item, index) => (
                                <div key={index} className="p-5 bg-white space-y-4 rounded-2xl border-2 border-slate-100 shadow-md active:shadow-lg transition-all relative overflow-hidden group border-l-emerald-500/40 border-l-4">
                                    {/* Entity Header */}
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                                <span className="text-[0.65rem] font-black text-emerald-600 uppercase tracking-[0.15em]">Entidad</span>
                                            </div>
                                            <h4 className="text-sm font-bold text-secondary leading-tight">
                                                {getValue(item, 'nom_eje') || '-'}
                                            </h4>
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-flex px-2.5 py-1 bg-slate-50 text-slate-600 text-[0.65rem] font-bold rounded-lg border border-slate-100 font-mono">
                                                {getValue(item, 'nro_doc') || '-'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Contributor Name */}
                                    <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100/50">
                                        <p className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest mb-1">Contribuyente</p>
                                        <p className="text-xs font-bold text-slate-700">{getValue(item, 'nom_com') || '-'}</p>
                                    </div>

                                    {/* Debt and Actions */}
                                    <div className="flex items-center justify-between pt-1">
                                        <div className="flex flex-col">
                                            <span className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Deuda Insoluta</span>
                                            <span className={`text-lg font-black font-mono leading-none ${parseFloat(getValue(item, 'imp_deu')) > 0 ? 'text-rose-500' : 'text-slate-500'}`}>
                                                {formatCurrency(getValue(item, 'imp_deu'))}
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => handleConsult(item)}
                                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-secondary text-white rounded-xl shadow-lg shadow-secondary/10 active:scale-95 transition-all text-xs font-bold uppercase tracking-widest"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            <span>Detalles</span>
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center text-slate-400 italic text-sm">
                                No se encontraron registros.
                            </div>
                        )}
                    </div>

                    {/* Mobile Total Summary */}
                    <div className="bg-rose-50 p-6 border-t border-rose-100">
                        <div className="flex flex-col items-center justify-center space-y-1">
                            <span className="text-[0.65rem] font-black text-rose-400 uppercase tracking-[0.2em]">Total Deuda Identificada</span>
                            <span className="text-2xl font-black text-rose-600 font-mono tracking-tight">
                                {formatCurrency(totalDebt)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <ConsultaModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                data={selectedItem}
            />

            <div className="flex justify-between items-center px-2">
                <p className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-widest">SIAM • Infraestructura de Apoyo Municipal</p>
                <p className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-widest">v2.1 Refinamiento Profesional</p>
            </div>
        </div >
    );
};

export default ResultsGrid;
