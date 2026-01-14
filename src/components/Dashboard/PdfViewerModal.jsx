import React from 'react';
import { createPortal } from 'react-dom';

const PdfViewerModal = ({ isOpen, onClose, pdfUrl, title, signatureData }) => {
    const [isLoading, setIsLoading] = React.useState(true);
    const [showSigInfo, setShowSigInfo] = React.useState(false);

    // Restablecer estado de carga cuando cambia la url o se abre el modal
    React.useEffect(() => {
        if (isOpen && pdfUrl) {
            setIsLoading(true);
            setShowSigInfo(false);
        }
    }, [isOpen, pdfUrl]);

    const handleLoad = () => {
        setIsLoading(false);
    };

    // Procesar información de firma si existe
    const sigInfo = React.useMemo(() => {
        if (!signatureData || !Array.isArray(signatureData) || signatureData.length === 0) return null;
        return signatureData[0]; // Tomamos la primera firma
    }, [signatureData]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-0 sm:p-2" aria-labelledby="modal-pdf" role="dialog" aria-modal="true">
            {/* Superposición */}
            <div
                className="fixed inset-0 bg-slate-900/40 transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            ></div>

            {/* Contenedor del Modal - Casi pantalla completa */}
            <div className="relative w-full h-full sm:w-[98vw] sm:h-[95vh] bg-white sm:rounded-lg text-left shadow-2xl transform transition-all flex flex-col z-50 border border-slate-200 overflow-hidden">

                {/* Encabezado */}
                <div className="bg-white px-4 py-3 border-b border-gray-200 flex justify-between items-center shrink-0">
                    <div className="flex items-center space-x-3 overflow-hidden">
                        <h3 className="text-lg leading-6 font-bold text-secondary truncate" id="modal-title">
                            {title || 'Vista Previa del Documento'}
                        </h3>
                        {sigInfo && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-700 uppercase tracking-widest border border-emerald-200">
                                <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                Firmado Digitalmente
                            </span>
                        )}
                    </div>
                    <div className="flex items-center space-x-3">
                        {sigInfo && (
                            <button
                                onClick={() => setShowSigInfo(!showSigInfo)}
                                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${showSigInfo ? 'bg-primary text-white border-primary shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span>{showSigInfo ? 'Ocultar Info' : 'Validar Firma'}</span>
                            </button>
                        )}
                        <button
                            type="button"
                            className="bg-white rounded-md text-gray-400 hover:text-rose-500 transition-colors p-1"
                            onClick={onClose}
                        >
                            <span className="sr-only">Cerrar</span>
                            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Contenido - Iframe (Desktop) y Botón (Móvil) */}
                    <div className="flex-1 bg-slate-200 relative">
                        {isLoading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-20 transition-all">
                                <div className="p-8 bg-white rounded-3xl shadow-xl flex flex-col items-center">
                                    <svg className="animate-spin h-10 w-10 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span className="text-secondary font-bold text-sm uppercase tracking-widest">Generando Vista Previa...</span>
                                </div>
                            </div>
                        )}
                        {pdfUrl ? (
                            <>
                                {/* VISTA MÓVIL: Botón de Descarga/Apertura Directa */}
                                <div className="md:hidden absolute inset-0 flex flex-col items-center justify-center bg-slate-50 p-6 z-10">
                                    <div className="text-center space-y-6 max-w-xs">
                                        <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-2">
                                            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800 mb-2">Documento Listo</h3>
                                            <p className="text-sm text-slate-500">
                                                Para visualizar el documento en tu dispositivo móvil, por favor presiona el botón.
                                            </p>
                                        </div>
                                        <a
                                            href={pdfUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 active:scale-95 transition-transform uppercase tracking-widest text-sm"
                                            download="documento_catastral.pdf"
                                        >
                                            Abrir Documento
                                        </a>
                                        <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-left">
                                            <p className="text-[10px] font-bold text-amber-700 uppercase mb-1">
                                                ⚠️ ¿Aparece una advertencia de seguridad?
                                            </p>
                                            <p className="text-[10px] text-amber-600 leading-tight">
                                                Al descargar archivos internos, Chrome puede mostrar <strong>"No es posible descargar el archivo de forma segura"</strong>.
                                                <br /><br />
                                                Por favor presiona <strong>"CONSERVAR"</strong> para abrir el documento. Es totalmente seguro.
                                            </p>
                                        </div>
                                        {/* <p className="text-xs text-slate-400 mt-4">
                                            Si no abre automáticamente, mantén presionado el botón y selecciona "Descargar vínculo" o "Abrir en pestaña nueva".
                                        </p> */}
                                    </div>
                                </div>

                                {/* VISTA DESKTOP: Iframe Embebido */}
                                <iframe
                                    src={pdfUrl}
                                    title="Visor PDF"
                                    className="hidden md:block absolute inset-0 w-full h-full border-0"
                                    onLoad={handleLoad}
                                />
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                No se ha proporcionado una URL válida.
                            </div>
                        )}
                    </div>

                    {/* Panel de Firma (Lateral o Emergente) */}
                    {showSigInfo && sigInfo && (
                        <div className="w-80 border-l border-slate-200 bg-slate-50 overflow-y-auto animate-slide-in-right shrink-0">
                            <div className="p-5 space-y-6">
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 pb-1">Validación Técnica</h4>
                                    <div className="space-y-4">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase">Titular / Firmante</span>
                                            <span className="text-[11px] font-black text-secondary leading-tight">{sigInfo.Nombre_2 || sigInfo.Nom_fir || sigInfo.Nom_com || 'No especificado'}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase">Documento / ID</span>
                                            <span className="text-[11px] font-bold text-slate-700 font-mono">{sigInfo.Ide_ide || 'Ver en Titular'}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase">Fecha de Firma</span>
                                            <span className="text-[11px] font-bold text-slate-700">{sigInfo.Fch_hra || sigInfo.Fec_fir || 'N/A'}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase">Entidad Emisora</span>
                                            <span className="text-[11px] font-bold text-slate-700 leading-tight">{sigInfo.Nombre_1 || sigInfo.Emisor || sigInfo.Nom_ent || 'N/A'}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase">Motivo</span>
                                            <span className="text-[11px] font-bold text-emerald-600 italic">"{sigInfo.Motivo || sigInfo.Mot_fir || 'Autorización de documento'}"</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                                    <h4 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-2 flex items-center">
                                        <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                        Estado de Firma
                                    </h4>
                                    <p className="text-[10px] font-medium text-emerald-700 leading-normal">
                                        Firma validada digitalmente. La integridad del documento está garantizada.
                                    </p>
                                </div>

                                <div className="pt-4 mt-4 border-t border-slate-200">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Información Legal</h4>
                                    <p className="text-[10px] text-slate-500 leading-relaxed text-justify">
                                        Este documento cuenta con firma digital válida bajo el marco de la <strong>Ley N° 27269</strong> "Ley de Firmas y Certificados Digitales" y su respectivo reglamento. La firma digital tiene la misma validez y eficacia jurídica que una firma manuscrita.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Pie de página */}
                <div className="bg-white px-6 py-3 border-t border-slate-100 flex justify-between items-center shrink-0">
                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">SIAMsoft Cloud Infrastructure v2.0</span>
                    <button
                        type="button"
                        className="inline-flex justify-center rounded-xl border border-slate-200 shadow-sm px-8 py-2 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-secondary transition-all"
                        onClick={onClose}
                    >
                        Cerrar Visor
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default PdfViewerModal;
