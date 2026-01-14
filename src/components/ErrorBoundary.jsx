import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Actualizar estado para que el próximo render muestre la UI de respaldo.
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // También puedes registrar el error en un servicio de reporte de errores
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            // Puedes renderizar cualquier UI de respaldo personalizada
            return (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4 rounded shadow-md">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-lg font-medium text-red-800">Ha ocurrido un error en la interfaz</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>Por favor intente recargar la página o contacte a soporte si el problema persiste.</p>
                                {this.state.error && (
                                    <details className="mt-3 p-2 bg-red-100 rounded text-xs font-mono whitespace-pre-wrap">
                                        <summary className="cursor-pointer font-bold mb-1">Ver detalles técnicos</summary>
                                        {this.state.error.toString()}
                                        <br />
                                        {this.state.errorInfo?.componentStack}
                                    </details>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
