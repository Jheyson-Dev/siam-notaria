import React, { useState, useEffect } from 'react';
import { listDDJJ, getDDJJReportUrl } from '../../services/ddjjService';
import PdfViewerModal from './PdfViewerModal';

import { createPortal } from 'react-dom';

const ListarDDJJ = ({ isOpen, onClose, data, connectionData }) => {
    const [year, setYear] = useState('');
    const [ddjjList, setDdjjList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [pdfUrl, setPdfUrl] = useState('');
    const [isPdfOpen, setIsPdfOpen] = useState(false);


    // Obtener información del usuario conectado para el encabezado
    const user = React.useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('user') || '{}');
        } catch (e) {
            return {};
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            setDdjjList([]);
            setError('');
            setYear('');
            fetchDDJJ(null);
        }
    }, [isOpen]);

    const getValue = (obj, key) => {
        if (!obj) return null;
        const keys = Object.keys(obj);
        const match = keys.find(k => k.toLowerCase() === key.toLowerCase());
        return match ? obj[match] : null;
    };

    const fetchDDJJ = async (yearFilter) => {
        setIsLoading(true);
        setError('');
        try {
            const { dbName, ide_cnt, ide_bde } = connectionData;
            let finalIdeBde = ide_bde;
            if (dbName && dbName.toLowerCase().includes('siam')) {
                finalIdeBde = null;
            }

            // Mapear ide_cnt a pide_cnt para el backend
            const pide_cnt = ide_cnt;

            const payload = {
                ...connectionData,
                pide_cnt,
                ide_bde: finalIdeBde
            };

            // alert(`Enviando a listDDJJ:\n${JSON.stringify(payload, null, 2)}`);

            const result = await listDDJJ(payload);

            let filteredResult = result;
            if (yearFilter && yearFilter.toString().trim() !== '') {
                const filterStr = yearFilter.toString();
                filteredResult = result.filter(item => {
                    const yearVal = getValue(item, 'ano_eje');
                    return yearVal && yearVal.toString() === filterStr;
                });
            }

            setDdjjList(filteredResult);
        } catch (err) {
            console.error("Error fetching DDJJ:", err);
            setError(err.message || 'Error al cargar las DDJJ');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchDDJJ(year);
    };

    const formatCurrency = (amount) => {
        const num = parseFloat(amount || 0);
        return num.toLocaleString('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 2 });
    };

    const formatNumber = (amount) => {
        const num = parseFloat(amount || 0);
        return num.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        // Asumiendo que dateString viene como 'YYYY-MM-DD' o ISO
        const date = new Date(dateString);
        // Ajustar por problemas de zona horaria si es necesario, o usar métodos UTC si es solo fecha
        // Si es estrictamente YYYY-MM-DD de la base de datos, es más seguro dividir la cadena
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [year, month, day] = dateString.split('-');
            return `${day}/${month}/${year}`;
        }
        return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    // Calcular totales
    const totals = React.useMemo(() => {
        return ddjjList.reduce((acc, item) => {
            acc.deuda += parseFloat(getValue(item, 'val_tot') || 0);
            acc.pagado += parseFloat(getValue(item, 'imp_pag') || 0);
            acc.saldo += parseFloat(getValue(item, 'imp_sld') || 0);
            return acc;
        }, { deuda: 0, pagado: 0, saldo: 0 });
    }, [ddjjList]);

    /**
     * Maneja la acción de imprimir (visualizar PDF) para una fila específica.
     * 
     * La lógica de consumo del API de reportes está encapsulada en getDDJJReportUrl (ddjjService).
     * Esto simplifica la integración y centraliza la configuración de parámetros.
     */
    const handlePrintRow = (item) => {
        const url = getDDJJReportUrl(item, data.ide_bde);
        setPdfUrl(url);
        setIsPdfOpen(true);
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4" aria-labelledby="modal-ddjj" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-slate-900/40 transition-opacity" onClick={onClose} aria-hidden="true"></div>

            <div className="relative inline-block w-full max-w-[98vw] sm:max-w-[95vw] bg-white rounded-3xl text-left shadow-2xl transform transition-all animate-fade-scale z-50 border border-slate-200 max-h-[95vh] overflow-y-auto">

                {/* Encabezado con datos heredados de la notaría */}
                <div className="bg-white px-6 py-5 border-b border-slate-200 flex justify-between items-center">
                    <div className="flex items-center space-x-5">
                        {/* Logo */}
                        {user.logo_url ? (
                            <img src={user.logo_url} alt="Logo" className="h-14 w-auto object-contain" />
                        ) : (
                            <div
                                className="h-14 w-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300 border border-slate-200">
                                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 2 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                        )}
                        <div>
                            <h2 className="text-2xl font-bold text-secondary uppercase tracking-tight leading-none">{user.nom_com || user.raz_soc || 'NOTARIA'}</h2>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1.5 ml-0.5">Consulta de DDJJ Impuesto Predial</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all border border-slate-100 shadow-sm"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="bg-slate-50/50 px-8 py-5 border-b border-slate-200">
                    <div className="flex flex-wrap items-center gap-8 mb-6">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 ml-0.5">Contribuyente</span>
                            <span className="text-base font-bold text-slate-800 uppercase tracking-tighter">{data?.nom_com}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 ml-0.5">DNI / RUC</span>
                            <span className="text-base font-bold text-slate-700 font-mono tracking-widest">{data?.nro_doc}</span>
                        </div>
                    </div>

                    {/* Formulario de filtro */}
                    <form onSubmit={handleSearch} className="flex items-end space-x-4">
                        <div className="w-32">
                            <label htmlFor="ddjj-year"
                                className="block text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Periodo</label>
                            <input
                                type="number"
                                id="ddjj-year"
                                className="block w-full px-4 py-2 bg-white border-2 border-slate-200 rounded-xl shadow-sm focus:ring-0 focus:border-primary sm:text-sm font-bold text-secondary"
                                placeholder="Todos"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                onFocus={(e) => {
                                    if (e.target.value === '') {
                                        setYear(new Date().getFullYear());
                                    }
                                }}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-dark shadow-md shadow-primary/20 transition-all uppercase tracking-widest"
                        >
                            {isLoading ? '...' : 'Filtrar Periodo'}
                        </button>
                    </form>
                </div>

                {/* Grilla y Looper */}
                <div className="bg-white px-2 sm:px-6 py-4 min-h-[400px] overflow-auto">
                    {error && (
                        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
                            <p className="text-red-700 text-sm font-bold">{error}</p>
                        </div>
                    )}

                    {/* Mobile Summary (Horizontal on tablet, vertical on mobile) */}
                    <div className="lg:hidden grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total Deuda</span>
                            <span className="text-xl font-black text-secondary">{formatCurrency(totals.deuda)}</span>
                        </div>
                        <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50 shadow-sm">
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-1">Total Pagado</span>
                            <span className="text-xl font-black text-emerald-600">{formatCurrency(totals.pagado)}</span>
                        </div>
                        <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100/50 shadow-sm">
                            <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest block mb-1">Total Saldo</span>
                            <span className="text-xl font-black text-rose-600">{formatCurrency(totals.saldo)}</span>
                        </div>
                    </div>

                    {/* Table View (Hidden on Mobile/Tablet) */}
                    <div className="hidden lg:block overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-secondary text-white">
                                <tr>
                                    <th className="px-3 py-4 text-left text-[0.7rem] font-bold uppercase tracking-[0.15em] opacity-80">Año</th>
                                    <th className="px-3 py-4 text-left text-[0.7rem] font-bold uppercase tracking-[0.15em] opacity-80">DDJJ Nº</th>
                                    <th className="px-3 py-4 text-center text-[0.7rem] font-bold uppercase tracking-[0.15em] opacity-80 whitespace-nowrap">Anx</th>
                                    <th className="px-3 py-4 text-left text-[0.7rem] font-bold uppercase tracking-[0.15em] opacity-80">FECHA</th>
                                    <th className="px-3 py-4 text-left text-[0.7rem] font-bold uppercase tracking-[0.15em] opacity-80">MOTIVO</th>
                                    <th className="px-3 py-4 text-left text-[0.7rem] font-bold uppercase tracking-[0.15em] opacity-80">REGIMEN</th>
                                    <th className="px-3 py-4 text-center text-[0.7rem] font-bold uppercase tracking-[0.15em] opacity-80">Anu</th>
                                    <th className="px-3 py-4 text-right text-[0.7rem] font-bold uppercase tracking-[0.15em] opacity-80">AVALUO</th>
                                    <th className="px-3 py-4 text-right text-[0.7rem] font-bold uppercase tracking-[0.15em] opacity-80">BAS.IMP.</th>
                                    <th className="px-3 py-4 text-right text-[0.7rem] font-bold uppercase tracking-[0.15em] opacity-80">IMPUESTO</th>
                                    <th className="px-3 py-4 text-right text-[0.7rem] font-bold uppercase tracking-[0.15em] opacity-80">DEUDA</th>
                                    <th className="px-3 py-4 text-right text-[0.7rem] font-bold uppercase tracking-[0.15em] opacity-80">PAGADO</th>
                                    <th className="px-3 py-4 text-right text-[0.7rem] font-bold uppercase tracking-[0.15em] opacity-80">SALDO</th>
                                    <th className="px-3 py-4 text-center text-[0.7rem] font-bold uppercase tracking-[0.15em] opacity-80">ACCION</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200 text-sm font-medium text-slate-600">
                                {ddjjList.length > 0 ? (
                                    ddjjList.map((item, idx) => {
                                        const flgAnu = getValue(item, 'flg_anu');
                                        const isAnul = flgAnu == 1 || flgAnu === '1';

                                        return (
                                            <tr key={idx}
                                                className={`transition-colors duration-150 ${isAnul ? 'bg-red-50/80 text-red-800' : 'hover:bg-slate-50'}`}>
                                                <td className="px-3 py-3 whitespace-nowrap">{getValue(item, 'ano_eje')}</td>
                                                <td className="px-3 py-3 whitespace-nowrap">{getValue(item, 'nro_dec')}</td>
                                                <td className="px-3 py-3 whitespace-nowrap text-center">{getValue(item, 'cnt_anx')}</td>
                                                <td className="px-3 py-3 whitespace-nowrap">{formatDate(getValue(item, 'fch_dec'))}</td>
                                                <td className="px-3 py-3 whitespace-nowrap max-w-[150px] truncate"
                                                    title={getValue(item, 'des_mot')}>
                                                    {getValue(item, 'des_mot')}
                                                </td>
                                                <td className="px-3 py-3 whitespace-nowrap">{getValue(item, 'arr_des_reg')}</td>
                                                <td className="px-3 py-3 whitespace-nowrap text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={isAnul}
                                                        readOnly
                                                        className="h-4 w-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 accent-emerald-600"
                                                    />
                                                </td>
                                                <td className="px-3 py-3 whitespace-nowrap text-right text-[0.7rem] font-medium">{formatNumber(getValue(item, 'bas_dec'))}</td>
                                                <td className="px-3 py-3 whitespace-nowrap text-right text-[0.7rem] font-medium">{formatNumber(getValue(item, 'bas_imp'))}</td>
                                                <td className="px-3 py-3 whitespace-nowrap text-right text-[0.7rem] font-medium text-slate-700">{formatCurrency(getValue(item, 'imp_pre'))}</td>
                                                <td className="px-3 py-3 whitespace-nowrap text-right text-[0.75rem] font-bold font-mono tracking-tight text-slate-800">{formatCurrency(getValue(item, 'val_tot'))}</td>
                                                <td className="px-3 py-3 whitespace-nowrap text-right text-[0.75rem] font-bold font-mono tracking-tight text-emerald-600">{formatCurrency(getValue(item, 'imp_pag'))}</td>
                                                <td className="px-3 py-3 whitespace-nowrap text-right text-[0.75rem] font-bold font-mono tracking-tight text-rose-500">{formatCurrency(getValue(item, 'imp_sld'))}</td>
                                                <td className="px-3 py-3 whitespace-nowrap text-center">
                                                    <button
                                                        onClick={() => handlePrintRow(item)}
                                                        className="text-slate-400 hover:text-secondary bg-slate-100 hover:bg-emerald-50 p-1.5 rounded-lg transition-all duration-200"
                                                        title="Ver detalles"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"
                                                            fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="14" className="px-6 py-8 text-center text-slate-500 italic">
                                            {isLoading ? 'Cargando información...' : 'No se encontraron registros.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            {/* Pie de página con totales */}
                            {ddjjList.length > 0 && (
                                <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-200">
                                    <tr>
                                        <td colSpan="10"
                                            className="px-3 py-3 text-right uppercase text-xs tracking-wider text-slate-500">Totales Generales:
                                        </td>
                                        <td className="px-3 py-3 text-right text-slate-900">{formatCurrency(totals.deuda)}</td>
                                        <td className="px-3 py-3 text-right text-emerald-600">{formatCurrency(totals.pagado)}</td>
                                        <td className="px-3 py-3 text-right text-red-600">{formatCurrency(totals.saldo)}</td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>

                    {/* Mobile Looper (Individual Cards) */}
                    <div className="lg:hidden space-y-4 pb-10">
                        {ddjjList.length > 0 ? (
                            ddjjList.map((item, idx) => {
                                const flgAnu = getValue(item, 'flg_anu');
                                const isAnul = flgAnu == 1 || flgAnu === '1';

                                return (
                                    <div key={idx} className={`relative p-5 rounded-2xl border-2 transition-all relative overflow-hidden group border-l-emerald-500/40 border-l-4 ${isAnul ? 'bg-red-50/50 border-red-100 opacity-80' : 'bg-white border-slate-100 shadow-md active:shadow-lg active:scale-[0.99]'}`}>
                                        {/* Status Header */}
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center space-x-2">
                                                <span className="px-2.5 py-1 bg-secondary text-white text-[10px] font-black rounded-lg uppercase tracking-widest">{getValue(item, 'ano_eje')}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nº {getValue(item, 'nro_dec')}</span>
                                            </div>
                                            {isAnul && (
                                                <span className="px-2 py-0.5 bg-red-500 text-white text-[8px] font-black rounded-full uppercase tracking-[0.2em]">Anulada</span>
                                            )}
                                        </div>

                                        {/* Main Content */}
                                        <div className="space-y-3 mb-5">
                                            <div>
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1 opacity-70">Motivo / Régimen</span>
                                                <p className="text-[11px] font-bold text-slate-700 leading-tight">
                                                    {getValue(item, 'des_mot')} • <span className="text-secondary">{getValue(item, 'arr_des_reg')}</span>
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between text-[10px] py-2 border-y border-slate-50">
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Presentación</span>
                                                    <span className="font-bold text-slate-600">{formatDate(getValue(item, 'fch_dec'))}</span>
                                                </div>
                                                <div className="flex flex-col text-right">
                                                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Anexos</span>
                                                    <span className="font-bold text-slate-600">{getValue(item, 'cnt_anx')} registrados</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Value Grid */}
                                        <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                                            <div>
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block opacity-70">Impuesto</span>
                                                <span className="text-[11px] font-black text-slate-600">{formatCurrency(getValue(item, 'imp_pre'))}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block opacity-70">Base Imp.</span>
                                                <span className="text-[11px] font-bold text-slate-500">{formatNumber(getValue(item, 'bas_imp'))}</span>
                                            </div>
                                            <div className="pt-1.5 border-t border-slate-200/50">
                                                <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest block opacity-70">Pagado</span>
                                                <span className="text-[12px] font-black text-emerald-600">{formatCurrency(getValue(item, 'imp_pag'))}</span>
                                            </div>
                                            <div className="pt-1.5 border-t border-slate-200/50 text-right">
                                                <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest block opacity-70">Saldo</span>
                                                <span className="text-[12px] font-black text-rose-600">{formatCurrency(getValue(item, 'imp_sld'))}</span>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <button
                                            onClick={() => handlePrintRow(item)}
                                            className="w-full py-2.5 bg-white border-2 border-slate-100 rounded-xl flex items-center justify-center space-x-2 text-slate-500 hover:text-emerald-600 hover:border-emerald-100 transition-all font-black text-[10px] uppercase tracking-widest"
                                        >
                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                            </svg>
                                            <span>Visualizar Constancia</span>
                                        </button>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 text-center">
                                <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                                    <svg className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h4 className="text-sm font-black text-secondary tracking-widest uppercase">Sin Declaraciones</h4>
                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">No se encontraron registros para este periodo.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-slate-50 px-8 py-5 border-t border-slate-200 flex justify-end">
                    <button
                        type="button"
                        className="inline-flex justify-center py-2.5 px-8 border border-slate-300 shadow-sm text-xs font-bold uppercase tracking-widest rounded-xl text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-800 transition-all active:scale-95"
                        onClick={onClose}
                    >
                        Cerrar Ventana
                    </button>
                </div>
            </div>

            <PdfViewerModal
                isOpen={isPdfOpen}
                onClose={() => setIsPdfOpen(false)}
                pdfUrl={pdfUrl}
                title="Visualización de Declaración Jurada"
            />
        </div>,
        document.body
    );
};

export default ListarDDJJ;
