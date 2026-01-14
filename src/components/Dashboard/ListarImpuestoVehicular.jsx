import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { listImpuestoVehicular } from '../../services/impuestoVehicularService';

const ListarImpuestoVehicular = ({ isOpen, onClose, data, connectionData }) => {
    const [vehicularList, setVehicularList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Helper para mapear campos de forma insensible a mayúsculas
    const getValue = (obj, key) => {
        if (!obj) return '-';
        if (obj[key] !== undefined && obj[key] !== null) return obj[key];

        const keys = Object.keys(obj);
        const match = keys.find(k => k.toLowerCase() === key.toLowerCase());
        if (match && obj[match] !== undefined && obj[match] !== null) {
            return obj[match];
        }
        return '-';
    };

    const formatCurrency = (amount) => {
        if (amount === '-' || amount === undefined || amount === null) return 'S/ 0.00';
        const num = parseFloat(amount);
        if (isNaN(num)) return 'S/ 0.00';
        return num.toLocaleString('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 2 });
    };

    const formatDate = (dateString) => {
        if (!dateString || dateString === '-' || dateString === 'null') return '-';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-PE');
        } catch (e) {
            return dateString;
        }
    };

    // Obtener información del usuario conectado para el encabezado (Notaría)
    const user = React.useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('user') || '{}');
        } catch (e) {
            return {};
        }
    }, []);

    // Calcular totales de Deuda, Pago y Saldo
    const totals = React.useMemo(() => {
        if (!Array.isArray(vehicularList)) return { impuesto: 0, deuda: 0, pago: 0, saldo: 0 };
        return vehicularList.reduce((acc, item) => {
            const imp = parseFloat(getValue(item, 'imp_imp')) || 0;
            const deu = parseFloat(getValue(item, 'imp_deu')) || 0;
            const pag = parseFloat(getValue(item, 'imp_pag')) || 0;
            const sld = parseFloat(getValue(item, 'imp_sld')) || 0;
            return {
                impuesto: acc.impuesto + imp,
                deuda: acc.deuda + deu,
                pago: acc.pago + pag,
                saldo: acc.saldo + sld
            };
        }, { impuesto: 0, deuda: 0, pago: 0, saldo: 0 });
    }, [vehicularList]);

    const handlePrintRow = (item) => {
        const ide_i_v = getValue(item, 'ide_i_v');
        alert(`ide_i_v: ${ide_i_v}`);
    };

    const fetchImpuestoVehicular = async () => {
        setIsLoading(true);
        setError('');
        try {
            const { ide_cnt, ide_bde } = connectionData;

            const payload = {
                pide_cnt: ide_cnt,
                ide_bde: ide_bde
            };

            const result = await listImpuestoVehicular(payload);
            console.log("Impuesto Vehicular raw data:", result);
            console.log("Primer elemento:", result[0]);
            console.log("Tipo de result:", typeof result, Array.isArray(result));
            if (result && result.length > 0) {
                console.log("Campos del primer elemento:", Object.keys(result[0]));
            }
            setVehicularList(Array.isArray(result) ? result : []);
        } catch (err) {
            console.error("Error fetching Impuesto Vehicular:", err);
            setError(err.message || 'Error al cargar los registros de Impuesto Vehicular');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            setVehicularList([]);
            setError('');
            fetchImpuestoVehicular();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            {/* Overlay */}
            <div className="absolute inset-0 bg-slate-900/60 transition-opacity" onClick={onClose}></div>

            {/* Modal Container */}
            <div className="relative w-full max-w-7xl bg-white rounded-[2.5rem] shadow-2xl flex flex-col max-h-[92vh] border border-slate-100 animate-fade-scale">

                {/* Header Premium */}
                <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-emerald-500 p-3 rounded-2xl shadow-lg shadow-emerald-500/20">
                            <span className="text-2xl">🚗</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-secondary tracking-tight">Impuesto Vehicular</h2>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                <span className="flex items-center text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span>
                                    {user.nom_com || 'Notaria'}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white px-2 py-0.5 rounded-lg border border-slate-100 shadow-sm">
                                    Contribuyente: {getValue(data, 'nom_com')}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={fetchImpuestoVehicular}
                            disabled={isLoading}
                            className="flex-1 md:flex-none inline-flex items-center justify-center px-5 py-2.5 bg-secondary text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-secondary-dark transition-all active:scale-95 shadow-lg shadow-secondary/10 disabled:opacity-50"
                        >
                            <svg className={`w-3.5 h-3.5 mr-2 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Actualizar
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2.5 bg-white text-slate-400 hover:text-rose-500 rounded-xl transition-all border border-slate-100 shadow-sm hover:shadow-md"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content - Responsive Views */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 animate-shake">
                            <span className="text-xl">⚠️</span>
                            <span className="text-sm font-bold text-rose-600">{error}</span>
                        </div>
                    )}

                    {/* Desktop View Table */}
                    <div className="hidden lg:block overflow-hidden rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]" rowSpan="2">Año</th>
                                    <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]" rowSpan="2">Imp.Veh.Nº</th>
                                    <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]" rowSpan="2">Fecha</th>
                                    <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]" rowSpan="2">Placa</th>
                                    <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]" rowSpan="2">Dni/Ruc</th>
                                    <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]" rowSpan="2">Apellidos y Nombres / Razón Social del Contribuyente</th>
                                    <th className="px-4 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]" rowSpan="2">Anu</th>
                                    <th className="px-4 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]" rowSpan="2">Liq</th>
                                    <th className="px-4 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]" rowSpan="2">Impuesto S/</th>
                                    <th className="bg-secondary/5 px-4 py-2 text-center text-[10px] font-black text-secondary uppercase tracking-[0.2em] border-l border-slate-100" colSpan="3">Importe S/</th>
                                    <th className="px-4 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]" rowSpan="2">Acción</th>
                                </tr>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-4 py-3 text-right text-[9px] font-bold text-secondary uppercase tracking-widest border-l border-slate-300">Deuda</th>
                                    <th className="px-4 py-3 text-right text-[9px] font-bold text-emerald-600 uppercase tracking-widest border-l border-slate-100">Pagos</th>
                                    <th className="px-4 py-3 text-right text-[9px] font-bold text-rose-600 uppercase tracking-widest border-l border-slate-100">Saldo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="14" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Obteniendo información...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : vehicularList.length > 0 ? (
                                    vehicularList.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-4 py-4 text-xs font-bold text-secondary">{getValue(item, 'ano_eje')}</td>
                                            <td className="px-4 py-4 text-xs font-bold text-slate-600">{getValue(item, 'nro_i_v')}</td>
                                            <td className="px-4 py-4 text-xs font-bold text-slate-500">{formatDate(getValue(item, 'fch_dec'))}</td>
                                            <td className="px-4 py-4 text-xs font-bold text-slate-600 font-mono">{getValue(item, 'pla_veh')}</td>
                                            <td className="px-4 py-4 text-xs font-mono text-slate-700 font-bold">{getValue(item, 'doc_cnt')}</td>
                                            <td className="px-4 py-4 text-[10px] font-black text-secondary leading-tight max-w-[250px]">{getValue(item, 'nom_cnt')}</td>
                                            <td className="px-4 py-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={getValue(item, 'flg_anu') == 1}
                                                    readOnly
                                                    className="h-4 w-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 accent-emerald-600"
                                                />
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={getValue(item, 'flg_liq') == 1}
                                                    readOnly
                                                    className="h-4 w-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 accent-emerald-600"
                                                />
                                            </td>
                                            <td className="px-4 py-4 text-right text-xs font-black font-mono text-slate-700">{formatCurrency(getValue(item, 'imp_imp'))}</td>
                                            <td className="px-4 py-4 text-right text-xs font-black font-mono border-l border-slate-300 bg-slate-50/30 text-secondary">{formatCurrency(getValue(item, 'imp_deu'))}</td>
                                            <td className="px-4 py-4 text-right text-xs font-black font-mono text-emerald-600 border-l border-slate-100 bg-emerald-50/10">{formatCurrency(getValue(item, 'imp_pag'))}</td>
                                            <td className="px-4 py-4 text-right text-xs font-black font-mono text-rose-500 border-l border-slate-100 bg-rose-50/10">{formatCurrency(getValue(item, 'imp_sld'))}</td>
                                            <td className="px-4 py-4 text-center border-l border-slate-100 bg-slate-50/20">
                                                <button
                                                    onClick={() => handlePrintRow(item)}
                                                    className="p-2 text-slate-400 hover:text-secondary hover:bg-emerald-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-emerald-100"
                                                    title="Imprimir Impuesto Vehicular"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="14" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center opacity-40">
                                                <span className="text-4xl mb-3">📁</span>
                                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No se encontraron registros de Impuesto Vehicular</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            {vehicularList.length > 0 && !isLoading && (
                                <tfoot className="bg-slate-50 border-t-2 border-slate-300">
                                    <tr>
                                        <td colSpan="8" className="px-4 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Total S/</td>
                                        <td className="px-4 py-4 text-right text-xs font-black font-mono text-slate-700 bg-white/50">{formatCurrency(totals.impuesto)}</td>
                                        <td className="px-4 py-4 text-right text-xs font-black font-mono border-l border-slate-200 text-secondary bg-white/50">{formatCurrency(totals.deuda)}</td>
                                        <td className="px-4 py-4 text-right text-xs font-black font-mono text-emerald-600 border-l border-slate-200 bg-emerald-50/5">{formatCurrency(totals.pago)}</td>
                                        <td className="px-4 py-4 text-right text-xs font-black font-mono text-rose-600 border-l border-slate-200 bg-rose-50/5">{formatCurrency(totals.saldo)}</td>
                                        <td className="bg-white/50 border-l border-slate-200"></td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>

                    {/* Mobile/Tablet Card View */}
                    <div className="lg:hidden space-y-6">
                        {vehicularList.map((item, idx) => (
                            <div key={idx} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                                {/* Card Header */}
                                <div className="px-5 py-4 bg-slate-50/80 border-b border-slate-100 flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-black text-secondary bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-sm">
                                                Año: {getValue(item, 'ano_eje')}
                                            </span>
                                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                                                Nº {getValue(item, 'nro_i_v')}
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 font-mono tracking-widest uppercase">
                                            Placa: {getValue(item, 'pla_veh')}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        {getValue(item, 'flg_anu') == 1 && (
                                            <span className="px-3 py-1 bg-rose-500 text-white text-[9px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-rose-500/20">
                                                Anulado
                                            </span>
                                        )}
                                        {getValue(item, 'flg_liq') == 1 && (
                                            <span className="px-3 py-1 bg-emerald-500 text-white text-[9px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                                                Liquidado
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Main Content */}
                                <div className="p-5 space-y-5">
                                    {/* Contribuyente Info */}
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                            Contribuyente
                                        </span>
                                        <div className="pl-3 border-l-2 border-slate-100 ml-0.5">
                                            <p className="text-xs font-black text-secondary leading-snug">{getValue(item, 'nom_cnt')}</p>
                                            <p className="text-[10px] font-bold text-slate-400 mt-0.5 font-mono tracking-wider">{getValue(item, 'doc_cnt')}</p>
                                        </div>
                                    </div>

                                    {/* Financial Grid */}
                                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col gap-3">
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.15em] text-center mb-1">Resumen Financiero</span>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="flex flex-col items-center p-2 bg-white rounded-xl border border-slate-100 shadow-sm col-span-2">
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Impuesto</span>
                                                <span className="text-[11px] font-black text-slate-700 font-mono">{formatCurrency(getValue(item, 'imp_imp'))}</span>
                                            </div>
                                            <div className="flex flex-col items-center p-2 bg-white rounded-xl border border-slate-100 shadow-sm">
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Deuda</span>
                                                <span className="text-[11px] font-black text-secondary font-mono">{formatCurrency(getValue(item, 'imp_deu'))}</span>
                                            </div>
                                            <div className="flex flex-col items-center p-2 bg-emerald-50/50 rounded-xl border border-emerald-100 shadow-sm">
                                                <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1">Pago</span>
                                                <span className="text-[11px] font-black text-emerald-600 font-mono">{formatCurrency(getValue(item, 'imp_pag'))}</span>
                                            </div>
                                            <div className="flex flex-col items-center p-2 bg-rose-50/50 rounded-xl border border-rose-100 shadow-sm col-span-2">
                                                <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest mb-1">Saldo</span>
                                                <span className="text-[11px] font-black text-rose-600 font-mono">{formatCurrency(getValue(item, 'imp_sld'))}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <button
                                        onClick={() => handlePrintRow(item)}
                                        className="w-full py-3.5 bg-secondary text-white rounded-2xl flex items-center justify-center space-x-3 shadow-lg shadow-secondary/20 active:scale-[0.98] transition-all font-black text-[11px] uppercase tracking-[0.15em]"
                                    >
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                        </svg>
                                        <span>Imprimir</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Modal */}
                <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-center">
                    <button
                        onClick={onClose}
                        className="px-10 py-2.5 bg-white border border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-50 hover:text-slate-800 transition-all active:scale-95 shadow-sm"
                    >
                        Cerrar Ventana
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ListarImpuestoVehicular;
