/**
 * @fileoverview Modal para listar y visualizar documentos catastrales de un contribuyente
 * @module components/Dashboard/ListarDocumentosCatastrales
 */

import React, { useState, useEffect } from 'react';
import { listDocumentosCatastrales } from '../../services/catastroService';
import PdfViewerModal from './PdfViewerModal';
import { createPortal } from 'react-dom';
import { API_QR, API_BASE_URL } from '../../config';

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Modal que muestra la lista de documentos catastrales de un contribuyente.
 * Permite visualizar PDFs con y sin firma digital, extrayendo automáticamente
 * la información de validación de firma cuando el documento está firmado.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Controla la visibilidad del modal
 * @param {Function} props.onClose - Callback para cerrar el modal
 * @param {Object} props.data - Datos del contribuyente
 * @param {Object} props.connectionData - Información de conexión (ide_cnt, ide_bde)
 */

const ListarDocumentosCatastrales = ({ isOpen, onClose, data, connectionData }) => {
    // ========================================================================
    // ESTADO DEL COMPONENTE
    // ========================================================================

    const [documentList, setDocumentList] = useState([]);           // Lista de documentos catastrales
    const [isLoading, setIsLoading] = useState(false);              // Estado de carga
    const [error, setError] = useState('');                         // Mensaje de error
    const [pdfUrl, setPdfUrl] = useState('');                       // URL del PDF a visualizar
    const [isPdfOpen, setIsPdfOpen] = useState(false);              // Control de visibilidad del visor PDF
    const [currentSignatureData, setCurrentSignatureData] = useState(null); // Metadatos de firma digital extraídos
    const [downloadingIdx, setDownloadingIdx] = useState(null);     // Índice del documento que se está descargando/convirtiendo

    // ========================================================================
    // HOOKS Y EFECTOS
    // ========================================================================

    /**
     * Obtener información del usuario conectado (notaría) desde localStorage
     * Se usa para mostrar el logo y nombre en el encabezado del modal
     */
    const user = React.useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('user') || '{}');
        } catch (e) {
            return {};
        }
    }, []);

    /**
     * Efecto para cargar los documentos cuando se abre el modal
     * y limpiar las URLs temporales cuando se cierra
     */
    useEffect(() => {
        if (isOpen) {
            setDocumentList([]);
            setError('');
            fetchData();
        } else {
            // Limpiar la URL temporal del blob si existe
            if (pdfUrl && pdfUrl.startsWith('blob:')) {
                URL.revokeObjectURL(pdfUrl);
            }
        }
    }, [isOpen]);

    /**
     * Limpiar URL del blob cuando cambia
     */
    useEffect(() => {
        return () => {
            if (pdfUrl && pdfUrl.startsWith('blob:')) {
                URL.revokeObjectURL(pdfUrl);
            }
        };
    }, [pdfUrl]);

    // ========================================================================
    // FUNCIONES AUXILIARES
    // ========================================================================

    /**
     * Obtiene la lista de documentos catastrales del contribuyente
     * desde el backend usando el servicio catastroService
     */
    const fetchData = async () => {
        setIsLoading(true);
        setError('');
        try {
            const payload = {
                pide_cnt: connectionData.ide_cnt,
                ide_bde: connectionData.ide_bde
            };

            const result = await listDocumentosCatastrales(payload);
            setDocumentList(result);
        } catch (err) {
            console.error("Error fetching catastro docs:", err);
            setError(err.message || 'Error al cargar los documentos catastrales');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Formatea una cadena de fecha a formato DD/MM/YYYY
     * Maneja diferentes formatos de entrada (YYYY-MM-DD, ISO 8601)
     * 
     * @param {string} dateString - Fecha en formato ISO o YYYY-MM-DD
     * @returns {string} Fecha formateada o '-' si no existe
     */
    const formatDate = (dateString) => {
        if (!dateString) return '-';

        // Ajuste para evitar problemas de zona horaria con formato YYYY-MM-DD
        if (dateString.includes('T')) {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
        }

        const [year, month, day] = dateString.split('-').map(part => part.slice(0, 4));
        return `${day}/${month}/${year}`;
    };

    /**
     * Maneja el evento de clic en el botón de imprimir/visualizar documento
     * 
     * Para documentos con firma digital (flg_cer_fir = 1):
     * - Construye la URL del PDF desde el servidor de APIs
     * - Extrae automáticamente los metadatos de firma del PDF
     * - Pasa la información de firma al modal de visualización
     * 
     * Para documentos sin firma digital (flg_cer_fir = 0):
     * - Utiliza el contenido base64 almacenado en doc_sin_fir
     * - No hay metadatos de firma para extraer
     * 
    /**
     * Maneja el evento de clic en el botón de imprimir/visualizar documento
     * @param {Object} item - Objeto con datos del documento
     * @param {number} idx - Índice del documento en la lista
     */
    const handlePrintRow = async (item, idx) => {
        // Establecer estado de descarga para este índice
        setDownloadingIdx(idx);

        try {
            let finalUrl = '';
            const token = localStorage.getItem('token');

            // Resetear metadata de firma anterior
            setCurrentSignatureData(null);

            // CASO 1: DOCUMENTO CON FIRMA DIGITAL
            // ====================================================================
            if (item.flg_cer_fir === 1 || item.flg_cer_fir === '1') {
                if (!item.url_q_r) {
                    console.error('El documento indica firma digital pero no tiene URL asociada.');
                    return;
                }

                // Construir URL completa del PDF firmado
                finalUrl = `${API_QR}${item.url_q_r}&token=${token}`;

                // Extraer metadatos de firma digital del PDF
                try {
                    const response = await fetch(`${API_BASE_URL}/api/pdf/extract-signature`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ pdfUrl: finalUrl })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.signature) {
                            // Guardar información de firma para mostrar en el modal
                            setCurrentSignatureData([data.signature]);
                        }
                    }
                } catch (err) {
                    console.error('Error extrayendo firma digital:', err);
                    // Continuar mostrando el PDF aunque falle la extracción de firma
                }
            }
            // ====================================================================
            // CASO 2: DOCUMENTO SIN FIRMA DIGITAL (BASE64)
            // ====================================================================
            else {
                if (!item.doc_sin_fir) {
                    console.error('No hay archivo disponible para este documento.');
                    return;
                }

                // Usar endpoint backend para extraer PDF del ZIP automáticamente
                try {
                    const response = await fetch(`${API_BASE_URL}/api/pdf/zip-to-pdf`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ base64Data: item.doc_sin_fir })
                    });

                    if (response.ok) {
                        // Convertir la respuesta binaria a Blob
                        const pdfBlob = await response.blob();

                        // Crear una URL temporal del Blob
                        finalUrl = URL.createObjectURL(pdfBlob);
                    } else {
                        const errorText = await response.text();
                        console.error('[Base64 PDF] Error del servidor:', errorText);
                        console.error('[Base64 PDF] Status:', response.status, response.statusText);
                        throw new Error(`Error del servidor: ${response.status}`);
                    }
                } catch (err) {
                    console.error('[Base64 PDF] Error:', err);
                    return;
                }
            }

            // Abrir el visor de PDF con la URL preparada y los metadatos de firma (si existen)
            setPdfUrl(finalUrl);
            setIsPdfOpen(true);

        } catch (err) {
            console.error('Error al visualizar PDF:', err);
        } finally {
            setDownloadingIdx(null);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4" aria-labelledby="modal-catastro" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-slate-900/40 transition-opacity" onClick={onClose} aria-hidden="true"></div>

            <div className="relative inline-block w-full max-w-[98vw] sm:max-w-[95vw] bg-white rounded-3xl text-left shadow-2xl transform transition-all animate-fade-scale z-50 border border-slate-200 max-h-[92vh] overflow-y-auto">

                {/* Encabezado con datos heredados de la notaría */}
                <div className="bg-white px-6 py-5 border-b border-slate-200 flex justify-between items-center">
                    <div className="flex items-center space-x-5">
                        {user.logo_url ? (
                            <img src={user.logo_url} alt="Logo" className="h-14 w-auto object-contain" />
                        ) : (
                            <div className="h-14 w-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300 border border-slate-200">
                                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 2 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                        )}
                        <div>
                            <h2 className="text-2xl font-bold text-secondary uppercase tracking-tight">{user.nom_com || user.raz_soc || 'NOTARIA'}</h2>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Consulta de Documentos Catastrales</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all border border-slate-100 shadow-sm">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="bg-slate-50/50 px-8 py-5 border-b border-slate-200 flex flex-wrap justify-between items-end gap-4">
                    <div className="flex flex-wrap items-center gap-8">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 ml-0.5">Contribuyente</span>
                            <span className="text-base font-bold text-slate-800 uppercase tracking-tighter">{data?.nom_com}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 ml-0.5">DNI / RUC</span>
                            <span className="text-base font-bold text-slate-700 font-mono tracking-widest">{data?.nro_doc}</span>
                        </div>
                    </div>

                    <button
                        onClick={fetchData}
                        disabled={isLoading}
                        className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-dark shadow-md shadow-primary/20 transition-all uppercase tracking-widest flex items-center gap-2"
                    >
                        {isLoading ? (
                            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                        )}
                        Actualizar
                    </button>
                </div>

                <div className="bg-white px-2 sm:px-4 py-6 min-h-[400px]">
                    {error && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
                            <p className="text-red-700 text-sm font-bold">{error}</p>
                        </div>
                    )}

                    {/* VISTA ESCRITORIO (Tabla) - Oculta en móviles */}
                    <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-secondary text-white">
                                <tr>
                                    <th className="px-3 py-4 text-left text-[0.65rem] font-bold uppercase tracking-widest">Año</th>
                                    <th className="px-3 py-4 text-left text-[0.65rem] font-bold uppercase tracking-widest">Documento</th>
                                    <th className="px-3 py-4 text-left text-[0.65rem] font-bold uppercase tracking-widest">Doc.Nº</th>
                                    <th className="px-3 py-4 text-left text-[0.65rem] font-bold uppercase tracking-widest">Sigla</th>
                                    <th className="px-3 py-4 text-left text-[0.65rem] font-bold uppercase tracking-widest">Fecha</th>
                                    <th className="px-3 py-4 text-left text-[0.65rem] font-bold uppercase tracking-widest">Domicilio Contribuyente</th>
                                    <th className="px-3 py-4 text-left text-[0.65rem] font-bold uppercase tracking-widest">Ubicación Predio</th>
                                    <th className="px-3 py-4 text-center text-[0.65rem] font-bold uppercase tracking-widest">Con Firma</th>
                                    <th className="px-3 py-4 text-center text-[0.65rem] font-bold uppercase tracking-widest">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100 text-[0.75rem]">
                                {documentList.length > 0 ? (
                                    documentList.map((item, idx) => {
                                        const hasSignature = item.flg_cer_fir === 1 || item.flg_cer_fir === '1';
                                        return (
                                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-3 py-3 font-bold text-slate-700">{item.ano_eje}</td>
                                                <td className="px-3 py-3 font-medium text-slate-800 uppercase whitespace-nowrap">{item.nom_doc}</td>
                                                <td className="px-3 py-3 font-bold text-primary font-mono">{item.nro_i_d}</td>
                                                <td className="px-3 py-3 text-slate-600 font-bold uppercase">{item.sig_laa}</td>
                                                <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{formatDate(item.fch_d_c)}</td>
                                                <td className="px-3 py-3 text-slate-500 text-[0.7rem] max-w-[150px] truncate" title={item.dom_esp}>{item.dom_esp}</td>
                                                <td className="px-3 py-3 text-slate-500 text-[0.7rem] max-w-[150px] truncate" title={item.des_via}>{item.des_via}</td>
                                                <td className="px-3 py-3 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={hasSignature}
                                                        readOnly
                                                        className="h-4 w-4 text-primary border-slate-300 rounded focus:ring-primary accent-primary"
                                                    />
                                                </td>
                                                <td className="px-3 py-3 text-center">
                                                    <button
                                                        onClick={() => handlePrintRow(item, idx)}
                                                        disabled={downloadingIdx !== null}
                                                        className={`p-1.5 rounded-lg transition-all ${downloadingIdx === idx
                                                            ? 'bg-amber-50 text-amber-600 cursor-wait ring-1 ring-amber-200'
                                                            : 'bg-slate-100 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                                                            }`}
                                                        title={downloadingIdx === idx ? "Convirtiendo documento..." : "Imprimir / Ver Documento"}
                                                    >
                                                        {downloadingIdx === idx ? (
                                                            <div className="flex items-center space-x-1">
                                                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                </svg>
                                                                <span className="text-[0.65rem] font-bold uppercase hidden md:inline-block">Procesando</span>
                                                            </div>
                                                        ) : (
                                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="px-6 py-20 text-center text-slate-400 italic font-medium">
                                            {isLoading ? 'Cargando documentos...' : 'No se encontraron documentos catastrales.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* VISTA MÓVIL (Tarjetas/Loopers) - Visible solo en móviles */}
                    <div className="md:hidden space-y-4">
                        {documentList.length > 0 ? (
                            documentList.map((item, idx) => {
                                const hasSignature = item.flg_cer_fir === 1 || item.flg_cer_fir === '1';
                                return (
                                    <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition-all">
                                        {/* Encabezado Tarjeta */}
                                        <div className="flex justify-between items-start mb-3 pb-3 border-b border-slate-100">
                                            <div className="flex-1 pr-2">
                                                <h3 className="text-sm font-bold text-slate-800 uppercase leading-snug">{item.nom_doc}</h3>
                                                <span className="text-[0.65rem] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded mt-1 inline-block">
                                                    AÑO: {item.ano_eje}
                                                </span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                {hasSignature ? (
                                                    <span className="flex items-center text-[0.6rem] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 mb-1">
                                                        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        FIRMADO
                                                    </span>
                                                ) : (
                                                    <span className="text-[0.6rem] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full border border-slate-200 mb-1">
                                                        SIN FIRMA
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Cuerpo Tarjeta */}
                                        <div className="grid grid-cols-2 gap-x-2 gap-y-3 text-xs mb-4">
                                            <div>
                                                <p className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Nº Documento</p>
                                                <p className="font-bold text-primary font-mono bg-slate-50 px-2 py-1 rounded border border-slate-100 inline-block">
                                                    {item.nro_i_d}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Fecha</p>
                                                <p className="font-bold text-slate-700">
                                                    {formatDate(item.fch_d_c)}
                                                </p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Sigla</p>
                                                <p className="text-slate-600 font-bold uppercase truncate">{item.sig_laa}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Ubicación</p>
                                                <p className="text-slate-600 text-[0.7rem] leading-tight line-clamp-2" title={item.des_via}>
                                                    {item.des_via || item.dom_esp}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Acciones Tarjeta */}
                                        <button
                                            onClick={() => handlePrintRow(item, idx)}
                                            disabled={downloadingIdx !== null}
                                            className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center space-x-2 ${downloadingIdx === idx
                                                    ? 'bg-amber-50 text-amber-600 cursor-wait ring-1 ring-amber-200'
                                                    : 'bg-slate-50 text-slate-600 hover:bg-emerald-600 hover:text-white border border-slate-200 hover:border-emerald-600 hover:shadow-md hover:shadow-emerald-200'
                                                }`}
                                        >
                                            {downloadingIdx === idx ? (
                                                <>
                                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    <span>Procesando...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                                    </svg>
                                                    <span>Visualizar Documento</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-8 text-center">
                                <p className="text-slate-400 italic text-sm font-medium">
                                    {isLoading ? 'Cargando documentos...' : 'No se encontraron documentos.'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-slate-50 px-8 py-5 border-t border-slate-200 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-8 py-2.5 bg-white border border-slate-300 text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                    >
                        Cerrar Ventana
                    </button>
                </div>
            </div >

            <PdfViewerModal
                isOpen={isPdfOpen}
                onClose={() => setIsPdfOpen(false)}
                pdfUrl={pdfUrl}
                title="Vista Previa de Documento Catastral"
                signatureData={currentSignatureData}
            />
        </div >,
        document.body
    );
};

export default ListarDocumentosCatastrales;
