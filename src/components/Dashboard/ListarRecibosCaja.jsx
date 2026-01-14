import React, { useState, useEffect, useMemo } from 'react';
import { listRecibosCaja } from '../../services/recibosService';

import { createPortal } from 'react-dom';

const ListarRecibosCaja = ({ isOpen, onClose, data }) => {
    // ... (mantener hooks existentes)
    const [year, setYear] = useState(''); // Inicializar vacío para "Todos"
    const [receiptFilter, setReceiptFilter] = useState(''); // Filtro por Nro Recibo
    const [glosaFilter, setGlosaFilter] = useState(''); // Filtro por Glosa
    const [recibosList, setRecibosList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    // Estado para controlar qué grupos están expandidos (Array de ide_rcg)
    const [expandedGroups, setExpandedGroups] = useState([]);
    // Estado para controlar qué recibos están expandidos (Array de ide_rec)
    const [expandedReceipts, setExpandedReceipts] = useState([]);

    const user = React.useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('user') || '{}');
        } catch (e) {
            return {};
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            setRecibosList([]);
            setError('');
            setYear(''); // Resetear a vacío al abrir
            setReceiptFilter(''); // Resetear filtro recibo
            setGlosaFilter(''); // Resetear filtro glosa
            setExpandedGroups([]);
            setExpandedReceipts([]);
        }
    }, [isOpen]);

    const fetchRecibos = async (selectedYear) => {
        setIsLoading(true);
        setError('');
        try {
            const payload = {
                pide_cnt: data?.ide_cnt,
                ide_bde: data?.ide_bde,
                pano_eje: selectedYear ? selectedYear.toString() : null // Enviar null si es vacío
            };

            let result = await listRecibosCaja(payload);

            // Lógica de limpieza/desempaquetado mejorada
            if (Array.isArray(result) && result.length === 1) {
                if (Array.isArray(result[0])) {
                    // Caso [[{...}]]
                    result = result[0];
                } else if (typeof result[0] === 'string') {
                    // Caso ["[{...}]"] (JSON string inside array)
                    try {
                        result = JSON.parse(result[0]);
                    } catch (e) {
                        console.error("Error parsing JSON string array:", e);
                    }
                }
            } else if (typeof result === 'string') {
                // Caso "[{...}]" (Direct JSON string)
                try {
                    result = JSON.parse(result);
                } catch (e) {
                    console.error("Error parsing JSON string:", e);
                }
            }
            setRecibosList(result);
        } catch (err) {
            console.error("Error fetching Recibos:", err);
            setError(err.message || 'Error al cargar los Recibos de Caja');
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-search effect when modal opens
    useEffect(() => {
        if (isOpen) {
            // Pequeño delay para asegurar que el estado de reset (arriba) se procese o simplemente llamar directo
            // Como el reset es síncrono en el otro effect, podemos llamar aquí, pero cuidado con las dependencias.
            // Mejor opción: llamarlo aquí pasando '' como año por defecto.
            fetchRecibos('');
        }
    }, [isOpen]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchRecibos(year);
    };

    // Procesamiento de datos para TreeView
    // El JSON nuevo ya viene agrupado: [{ ide_rcg: ..., recibos: [...] }, ...]
    // Calculamos totales aquí para mostrar en la cabecera del grupo y filas.
    // Procesamiento de datos para TreeView
    // El JSON nuevo ya viene agrupado: [{ ide_rcg: ..., recibos: [...] }, ...]
    // Calculamos totales aquí para mostrar en la cabecera del grupo y filas.
    const processedGroups = useMemo(() => {
        if (!recibosList || !Array.isArray(recibosList)) return [];

        return recibosList.map(group => {
            // Filtrar recibos si hay filtro
            let receiptsToProcess = group.recibos || [];

            // Filtro por Nro Recibo
            if (receiptFilter) {
                const lowerFilter = receiptFilter.toLowerCase();
                receiptsToProcess = receiptsToProcess.filter(r =>
                    (r.nro_rec && r.nro_rec.toLowerCase().includes(lowerFilter))
                );
            }

            // Filtro por Glosa (Optimista / Multi-palabra)
            if (glosaFilter) {
                const searchTokens = glosaFilter.toLowerCase().split(/\s+/).filter(token => token.length > 0);
                receiptsToProcess = receiptsToProcess.filter(r => {
                    if (!r.gls_rec) return false;
                    const lowerGlosa = r.gls_rec.toLowerCase();
                    // Verificar que CADA palabra buscada exista en la glosa
                    return searchTokens.every(token => lowerGlosa.includes(token));
                });
            }

            // Calcular totales de cada recibo dentro del grupo
            const enrichedRecibos = receiptsToProcess.map(recibo => {
                // Total Recibo = Suma de val_tot de sus detalles
                const totalRecibo = (recibo.detalle || []).reduce((sum, det) => sum + parseFloat(det.val_tot || 0), 0);

                // Construir una glosa combinada de los primeros detalles para mostrar (opcional en nivel 2)
                const glosaItems = (recibo.detalle || []).map(d => d.des_itm).join(' | ');
                const glosaPreview = glosaItems.length > 100 ? glosaItems.substring(0, 100) + '...' : glosaItems;

                return {
                    ...recibo,
                    totalCalculado: totalRecibo,
                    glosaPreview
                };
            });

            // Total Grupo = Suma de totales de sus recibos
            const totalGrupo = enrichedRecibos.reduce((sum, rec) => sum + rec.totalCalculado, 0);

            return {
                ...group,
                items: enrichedRecibos,
                totalGrupo
            };
        }).filter(group => group.items.length > 0); // Ocultar grupos vacios tras el filtro
    }, [recibosList, receiptFilter, glosaFilter]);


    const toggleGroup = (ide_rcg) => {
        setExpandedGroups(prev => {
            if (prev.includes(ide_rcg)) return prev.filter(id => id !== ide_rcg);
            return [...prev, ide_rcg];
        });
    };

    const toggleReceipt = (ide_rec, e) => {
        e.stopPropagation(); // Evitar que el click propague al grupo si fuera el caso
        setExpandedReceipts(prev => {
            if (prev.includes(ide_rec)) return prev.filter(id => id !== ide_rec);
            return [...prev, ide_rec];
        });
    };

    const formatCurrency = (amount) => {
        return parseFloat(amount || 0).toLocaleString('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 2 });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        if (dateString.match && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [y, m, d] = dateString.split('-');
            return `${d}/${m}/${y}`;
        }
        return new Date(dateString).toLocaleDateString('es-PE');
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString; // Si no es fecha válida, devolver original

        const pad = (n) => n.toString().padStart(2, '0');
        const d = pad(date.getDate());
        const m = pad(date.getMonth() + 1);
        const y = date.getFullYear();
        const h = pad(date.getHours()); // 24h format
        const min = pad(date.getMinutes());
        const s = pad(date.getSeconds());

        return `${d}/${m}/${y} ${h}:${min}:${s}`;
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4" aria-labelledby="modal-recibos" role="dialog" aria-modal="true">
            <div
                className="fixed inset-0 bg-slate-900/40 transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            ></div>

            <div className="relative inline-block w-full max-w-[98vw] sm:max-w-[95vw] bg-white rounded-3xl text-left shadow-2xl transform transition-all animate-fade-scale z-50 border border-slate-200 max-h-[95vh] overflow-y-auto">

                {/* Header */}
                <div className="bg-white px-6 py-5 border-b border-slate-200 flex justify-between items-center">
                    <div className="flex items-center space-x-5">
                        {user.logo_url ? <img src={user.logo_url} alt="Logo" className="h-14 w-auto object-contain" /> : <div className="h-14 w-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300 border border-slate-200">Not</div>}
                        <div>
                            <h2 className="text-2xl font-bold text-secondary uppercase tracking-tight leading-none">{user.nom_com || user.raz_soc || 'NOTARIA'}</h2>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1.5 ml-0.5">Recibos de Caja</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-6">
                        {data?.nom_eje && (
                            <div className="text-right hidden md:block">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 opacity-80">Entidad Consultada</p>
                                <p className="text-base font-bold text-primary uppercase leading-tight tracking-tight">{data.nom_eje}</p>
                            </div>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all border border-slate-100 shadow-sm"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Info bar */}
                <div className="bg-slate-50/50 px-8 py-5 border-b border-slate-200">
                    <div className="flex flex-wrap items-center gap-8 mb-6">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 ml-0.5">Contribuyente</span>
                            <span className="text-base font-bold text-slate-800 uppercase tracking-tight">{data?.nom_com}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 ml-0.5">DNI / RUC</span>
                            <span className="text-base font-bold text-slate-700 font-mono tracking-widest">{data?.nro_doc}</span>
                        </div>
                    </div>
                    <form onSubmit={handleSearch} className="flex items-end gap-3">
                        <div className="w-48">
                            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                                Año Fiscal
                            </label>
                            <input
                                type="text"
                                id="year"
                                name="year"
                                placeholder="Todos (Vacio)"
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                value={year}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    // Permitir solo números y vacío
                                    if (val === '' || /^\d{0,4}$/.test(val)) {
                                        setYear(val);
                                    }
                                }}
                            />
                        </div>
                        <div className="w-48">
                            <label htmlFor="receiptFilter" className="block text-sm font-medium text-gray-700 mb-1">
                                Nº Recibo
                            </label>
                            <input
                                type="text"
                                id="receiptFilter"
                                name="receiptFilter"
                                placeholder="Buscar..."
                                value={receiptFilter}
                                onChange={(e) => setReceiptFilter(e.target.value)}
                                disabled={!recibosList || recibosList.length === 0}
                                className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${(!recibosList || recibosList.length === 0) ? 'bg-gray-100 cursor-not-allowed opacity-50' : ''}`}
                            />
                        </div>
                        <div className="w-64">
                            <label htmlFor="glosaFilter" className="block text-sm font-medium text-gray-700 mb-1">
                                Glosa
                            </label>
                            <input
                                type="text"
                                id="glosaFilter"
                                name="glosaFilter"
                                placeholder="Buscar en Glosa..."
                                value={glosaFilter}
                                onChange={(e) => setGlosaFilter(e.target.value)}
                                disabled={!recibosList || recibosList.length === 0}
                                className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${(!recibosList || recibosList.length === 0) ? 'bg-gray-100 cursor-not-allowed opacity-50' : ''}`}
                            />
                        </div>
                        <button
                            type="submit"
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors mb-[1px]"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Buscando...' : 'Filtrar'}
                        </button>
                    </form>
                </div>

                {/* Body */}
                <div className="bg-white px-6 py-4 min-h-[400px] overflow-auto relative">
                    {/* Dev Label */}
                    <div className="absolute top-0 right-0 bg-gray-200 text-gray-500 text-[10px] px-1 rounded-bl opacity-50 hover:opacity-100 z-10 font-mono">
                        src/components/Dashboard/ListarRecibosCaja.jsx
                    </div>
                    {error && <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-red-700">{error}</div>}
                    {!isLoading && processedGroups.length === 0 && !error && <div className="text-center py-10 text-gray-500">No se encontraron recibos.</div>}

                    <div className="space-y-4">
                        {processedGroups.map((group, idx) => {
                            const groupKey = group.ide_rcg || `idx-${idx}`;
                            const isGroupExpanded = expandedGroups.includes(groupKey);

                            return (
                                <div key={groupKey} className="border border-gray-200 rounded-md overflow-hidden shadow-sm">
                                    {/* Group Header */}
                                    <div
                                        className="bg-gray-100 px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-gray-200 transition-colors select-none"
                                        onClick={() => toggleGroup(groupKey)}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="bg-white rounded-full p-1 border border-gray-300 transform transition-transform duration-200" style={{ transform: isGroupExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center">
                                                {group.fch_hra_rcg && (
                                                    <span className="text-xs font-bold text-slate-600 mr-2 uppercase tracking-widest opacity-80">
                                                        Emitido el: {formatDateTime(group.fch_hra_rcg)} |
                                                    </span>
                                                )}
                                                <span className="text-base font-bold text-secondary mr-2 tracking-tight">
                                                    {(group.ser_gru && group.ser_gru.trim()) ? group.ser_gru : 'SIN GRUPO'}
                                                </span>
                                                <span className="text-xs bg-emerald-50 text-emerald-700 py-0.5 px-2 rounded-full font-bold border border-emerald-100 uppercase tracking-widest">
                                                    {group.items.length} {group.items.length === 1 ? 'recibo' : 'recibos'}
                                                </span>
                                            </div>
                                        </div>
                                        {/* Print Button */}
                                        <button
                                            onClick={(e) => {
                                                if (!group.ide_rcg) return; // Prevent action if disabled
                                                e.stopPropagation();
                                                alert(`Imprimir Resumen:\nide_rcg: ${group.ide_rcg}\nide_eje: ${data?.ide_eje || 'No definido'}`);
                                            }}
                                            disabled={!group.ide_rcg}
                                            className={`p-2 mr-2 rounded-full transition-colors focus:outline-none ${!group.ide_rcg ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'}`}
                                            title={!group.ide_rcg ? "No hay resumen para imprimir" : "Imprimir Resumen de Caja"}
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                            </svg>
                                        </button>

                                        {/* Amount and Chevron */}
                                        <div className="text-right mr-4">
                                            <span className="text-xs text-gray-500 block uppercase tracking-wide">Total Grupo</span>
                                            <span className="text-lg font-bold text-gray-900">{formatCurrency(group.totalGrupo)}</span>
                                        </div>
                                    </div>

                                    {/* Recibos List (Tree Level 2) */}
                                    {isGroupExpanded && (
                                        <div className="bg-white border-t border-gray-200 animate-fade-in-down p-2 bg-gray-50">
                                            <div className="space-y-2">
                                                {group.items.map((recibo, rIdx) => {
                                                    const isAnul = recibo.flg_anu_rec == 1 || recibo.flg_anu_rec === true;
                                                    const receiptKey = recibo.ide_rec || `rec-${rIdx}`;
                                                    const isReceiptExpanded = expandedReceipts.includes(receiptKey);

                                                    return (
                                                        <div key={receiptKey} className={`border rounded-md overflow-hidden shadow-sm transition-all duration-200 ${isReceiptExpanded ? 'border-gray-400 bg-white ring-1 ring-gray-200' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                                                            {/* Receipt Header */}
                                                            <div
                                                                className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-colors select-none ${isReceiptExpanded ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                                                                onClick={(e) => toggleReceipt(receiptKey, e)}
                                                            >
                                                                <div className="flex items-center space-x-3 overflow-hidden">
                                                                    <div className={`transform transition-transform duration-200 ${isReceiptExpanded ? 'rotate-90' : ''}`}>
                                                                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                                    </div>

                                                                    {/* Main Info Grid */}
                                                                    <div className="grid grid-cols-1 md:grid-cols-[auto_auto_auto_1fr] gap-4 md:gap-6 items-center flex-1">
                                                                        <div className="flex flex-col">
                                                                            <span className="text-xs text-gray-500">Fecha</span>
                                                                            <span className={`text-sm font-medium ${isAnul ? 'text-red-800 line-through' : 'text-gray-900'}`}>{formatDate(recibo.fch_emi)}</span>
                                                                        </div>
                                                                        <div className="flex flex-col">
                                                                            <span className="text-xs text-gray-500">Nº Recibo</span>
                                                                            <span className={`text-sm font-medium ${isAnul ? 'text-red-800' : 'text-gray-900'}`}>{recibo.nro_rec}</span>
                                                                        </div>

                                                                        {/* Print Receipt Button */}
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                alert(`Imprimir Recibo:\nide_rec: ${recibo.ide_rec}\nide_eje: ${data?.ide_eje || 'No definido'}`);
                                                                            }}
                                                                            className="hidden md:flex p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors focus:outline-none"
                                                                            title="Imprimir Recibo"
                                                                        >
                                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                                                            </svg>
                                                                        </button>

                                                                        <div className="hidden md:flex flex-col flex-1 px-4">
                                                                            <span className="text-xs text-gray-500">Glosa</span>
                                                                            <span className={`text-xs ${isAnul ? 'text-red-700' : 'text-gray-600'}`} title={recibo.gls_rec}>
                                                                                {recibo.gls_rec || '-'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center space-x-4 pl-4">
                                                                    {isAnul && (
                                                                        <div className="flex items-center text-red-600 bg-red-100 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide">
                                                                            Anulado
                                                                        </div>
                                                                    )}
                                                                    <div className="text-right min-w-[120px]">
                                                                        <span className="text-xs text-slate-500 font-bold uppercase tracking-widest block opacity-80 mb-0.5">Importe Recibo</span>
                                                                        <span className={`text-[0.8rem] font-bold font-mono tracking-tight ${isAnul ? 'text-rose-400 line-through' : 'text-secondary'}`}>
                                                                            {formatCurrency(recibo.totalCalculado)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Details Table (Tree Level 3) */}
                                                            {isReceiptExpanded && (
                                                                <div className="bg-slate-50 p-4 animate-fade-in-down border-t border-slate-200 shadow-inner ml-12 rounded-bl-md border-l">
                                                                    <div className="text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Detalle del Recibo</div>
                                                                    <table className="min-w-full divide-y divide-slate-200 text-sm border border-slate-200 rounded-md overflow-hidden">
                                                                        <thead className="bg-secondary text-white">
                                                                            <tr>
                                                                                <th className="px-4 py-3 text-left text-[0.7rem] font-bold uppercase tracking-[0.15em] opacity-80">Concepto / Item</th>
                                                                                <th className="px-4 py-3 text-right text-[0.7rem] font-bold uppercase tracking-[0.15em] opacity-80 w-32">Monto</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className="divide-y divide-gray-200 bg-white">
                                                                            {(recibo.detalle || []).map((det, dIdx) => (
                                                                                <tr key={dIdx} className={isAnul ? 'bg-red-50/30' : 'hover:bg-slate-50'}>
                                                                                    <td className={`px-4 py-2 ${isAnul ? 'text-red-800' : 'text-slate-700'}`}>
                                                                                        {det.des_itm}
                                                                                    </td>
                                                                                    <td className={`px-4 py-2 text-right font-medium ${isAnul ? 'text-red-700' : 'text-slate-900'}`}>
                                                                                        {formatCurrency(det.val_tot)}
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                            {(!recibo.detalle || recibo.detalle.length === 0) && (
                                                                                <tr>
                                                                                    <td colSpan="2" className="px-4 py-4 text-center text-gray-400 italic">No hay detalles disponibles para este recibo.</td>
                                                                                </tr>
                                                                            )}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-end">
                    <button type="button" className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none" onClick={onClose}>
                        Cerrar
                    </button>
                </div>

            </div>
        </div>,
        document.body
    );
};

export default ListarRecibosCaja;
