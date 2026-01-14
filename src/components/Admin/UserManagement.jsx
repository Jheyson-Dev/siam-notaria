import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState('');
    const [modalError, setModalError] = useState('');
    const [success, setSuccess] = useState('');
    const [expandedGroups, setExpandedGroups] = useState({});

    // Form state
    const [dni, setDni] = useState('');
    const [foundPerson, setFoundPerson] = useState(null);
    const [email, setEmail] = useState('');
    const [isAdminField, setIsAdminField] = useState(false);
    const [isSearchingDni, setIsSearchingDni] = useState(false);

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/api/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setUsers(data);
                // Por defecto expandir el primer grupo si existe
                if (data.length > 0) {
                    setExpandedGroups({ [data[0].ide_not_sol_ser]: true });
                }
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Error al conectar con el servidor.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        const newStatus = currentStatus === 1 ? 0 : 1;
        try {
            const response = await fetch(`${API_BASE_URL}/api/users/toggle-status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ id: userId, act_ina: newStatus })
            });
            if (response.ok) {
                setUsers(users.map(u => u.id === userId ? { ...u, act_ina: newStatus } : u));
            } else {
                setError('Error al actualizar el estado.');
            }
        } catch (err) {
            setError('Error de conexión.');
        }
    };

    const handleSearchDni = async () => {
        if (!dni) return;
        setIsSearchingDni(true);
        setModalError('');
        try {
            const response = await fetch(`${API_BASE_URL}/api/mantenimiento/siam/persona/${dni}`);
            const data = await response.json();
            if (response.ok) setFoundPerson(data);
            else setModalError(data.message || 'No se encontró a la persona.');
        } catch (err) {
            setModalError('Error al consultar RENIEC.');
        } finally {
            setIsSearchingDni(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        if (!foundPerson) return;

        setIsLoading(true);
        setModalError('');
        try {
            const response = await fetch(`${API_BASE_URL}/api/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ide_per: foundPerson.ide_per,
                    cor_ele: email,
                    flg_adm: isAdminField ? 1 : 0
                })
            });
            const data = await response.json();
            if (response.ok) {
                setSuccess('Usuario registrado con éxito.');
                setIsModalOpen(false);
                fetchUsers();
                setDni(''); setFoundPerson(null); setEmail(''); setIsAdminField(false); setModalError('');
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setModalError(data.message);
            }
        } catch (err) {
            setModalError('Error al crear el usuario.');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleGroup = (groupId) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupId]: !prev[groupId]
        }));
    };

    // Agrupación por ide_not_sol_ser
    const groupedUsers = users.reduce((groups, user) => {
        const groupId = user.ide_not_sol_ser;
        if (!groups[groupId]) {
            groups[groupId] = {
                name: user.nom_usu || 'Entidad Sin Nombre',
                members: []
            };
        }
        groups[groupId].members.push(user);
        return groups;
    }, {});

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString() + ' ' + new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="space-y-10 animate-fade-scale">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3 pb-4 md:pb-6 border-b border-emerald-100/50">
                <div className="flex-1 min-w-0">
                    <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-[0.2em] mb-1.5 border border-emerald-100">
                        Configuración de Entidad
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-black text-secondary tracking-tighter truncate lg:whitespace-normal">
                        Gestión de Usuarios
                    </h2>
                    <p className="mt-0.5 text-slate-400 font-bold max-w-2xl leading-tight text-[0.65rem] md:text-xs lg:text-base opacity-70">
                        Permisos y accesos de su equipo de trabajo.
                    </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                    <button
                        onClick={fetchUsers}
                        disabled={isLoading}
                        className="flex items-center justify-center p-2.5 sm:px-4 sm:py-2.5 bg-white border-2 border-slate-100 rounded-xl text-[10px] font-black text-slate-500 hover:bg-slate-50 hover:border-emerald-100 transition-all active:scale-95 shadow-sm"
                        title="Sincronizar Panel"
                    >
                        <svg className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-primary' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span className="hidden sm:inline-block ml-2">Sincronizar</span>
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:shadow-lg hover:shadow-emerald-500/20 transition-all active:scale-95"
                    >
                        <svg className="h-3.5 w-3.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="sm:hidden">Nuevo</span>
                        <span className="hidden sm:inline-block">Registrar Colaborador</span>
                    </button>
                </div>
            </div>

            {error && !isModalOpen && (
                <div className="bg-red-50 text-red-700 p-3 md:p-6 rounded-2xl border border-red-100 flex items-center shadow-lg shadow-red-500/5 animate-shake text-[10px] md:text-sm">
                    <div className="p-1.5 bg-white rounded-lg mr-3 shadow-sm shrink-0">
                        <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                    </div>
                    <span className="font-bold">{error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {Object.keys(groupedUsers).length === 0 && !isLoading && (
                    <div className="premium-card p-10 md:p-20 text-center flex flex-col items-center">
                        <div className="p-4 bg-slate-50 rounded-full mb-4">
                            <svg className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <h4 className="text-sm font-black text-secondary uppercase tracking-widest">Sin Registros</h4>
                        <p className="text-slate-400 font-bold mt-1 text-[10px]">No se encontraron usuarios.</p>
                    </div>
                )}

                {Object.keys(groupedUsers).map(groupId => (
                    <div key={groupId} className="premium-card overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/50 rounded-2xl">
                        <div
                            onClick={() => toggleGroup(groupId)}
                            className={`flex items-center justify-between px-4 lg:px-8 py-3.5 cursor-pointer transition-all duration-300 ${expandedGroups[groupId] ? 'bg-emerald-50/40' : 'hover:bg-slate-50/50'}`}
                        >
                            <div className="flex items-center space-x-3 md:space-x-6">
                                <div className={`p-1.5 rounded-lg bg-white shadow-sm border border-slate-100 transition-transform duration-500 ${expandedGroups[groupId] ? 'rotate-90' : ''}`}>
                                    <svg className="h-2.5 w-2.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                                <div className="min-w-0">
                                    <span className="text-sm lg:text-2xl font-black text-secondary tracking-tighter truncate block uppercase">{groupedUsers[groupId].name}</span>
                                    <div className="flex flex-wrap items-center mt-0.5 gap-2">
                                        <span className="px-2 py-0.5 rounded-md text-[8px] font-black bg-white text-emerald-600 shadow-sm border border-emerald-100 uppercase tracking-widest">
                                            {groupedUsers[groupId].members.length} MIEMBROS
                                        </span>
                                        <span className="text-[8px] text-slate-300 font-bold uppercase tracking-widest hidden lg:inline">ID: {groupId}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {expandedGroups[groupId] && (
                            <div className="animate-fade-scale border-t border-emerald-50/50">
                                {/* Desktop Tablet View (Hidden on Mobile/Landscape Mobile) */}
                                <div className="hidden lg:block overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-100">
                                        <thead className="bg-slate-50/50">
                                            <tr>
                                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Colaborador</th>
                                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contacto Email</th>
                                                <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nivel</th>
                                                <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Estado</th>
                                                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Password</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-slate-50">
                                            {groupedUsers[groupId].members.map(user => (
                                                <tr key={user.id} className="group/row hover:bg-emerald-50/10 transition-colors">
                                                    <td className="px-8 py-5 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-secondary font-black text-sm border border-slate-100 group-hover/row:border-emerald-200 group-hover/row:bg-white transition-all">
                                                                {(user.nom_usu || 'U').charAt(0)}
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-black text-secondary">{user.nom_usu}</div>
                                                                <div className="text-[10px] text-slate-400 font-bold tracking-tight">Creado: {formatDate(user.fch_cre)}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 whitespace-nowrap">
                                                        <div className="flex items-center text-sm font-bold text-slate-500">
                                                            <svg className="h-4 w-4 mr-2 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                            </svg>
                                                            {user.cor_ele}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 whitespace-nowrap text-center">
                                                        <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black tracking-[0.1em] ${user.flg_adm === 1 ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>
                                                            {user.flg_adm === 1 ? 'ADMIN' : 'COLAB'}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-5 whitespace-nowrap">
                                                        <div className="flex justify-center flex-col items-center gap-1">
                                                            <label className={`relative inline-flex items-center ${user.flg_adm === 1 ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:scale-105 transition-transform'}`}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={user.act_ina === 1}
                                                                    onChange={() => handleToggleStatus(user.id, user.act_ina)}
                                                                    disabled={user.flg_adm === 1}
                                                                    className="sr-only peer"
                                                                />
                                                                <div className="w-10 h-5.5 bg-slate-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-slate-200 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
                                                            </label>
                                                            <span className={`text-[8px] font-black uppercase tracking-widest ${user.act_ina === 1 ? 'text-emerald-600' : 'text-rose-400'}`}>
                                                                {user.act_ina === 1 ? 'Activo' : 'Inactivo'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 whitespace-nowrap text-right">
                                                        <div className="text-[10px] font-bold text-slate-400 group-hover/row:text-secondary transition-colors font-mono">
                                                            {formatDate(user.fch_cam_psw)}
                                                        </div>
                                                        <div className="text-[8px] text-slate-300 font-black uppercase tracking-widest">Último Cambio</div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile/Landscape Looper - Visible on all mobile up to lg */}
                                <div className="lg:hidden md:grid md:grid-cols-2 lg:gap-4 lg:p-4 p-3 bg-slate-50/30">
                                    {groupedUsers[groupId].members.map(user => (
                                        <div key={user.id} className="mb-4 p-5 space-y-4 bg-white rounded-2xl border-2 border-slate-100 shadow-md active:shadow-lg transition-all relative overflow-hidden group border-l-emerald-500/40 border-l-4">
                                            {/* User Info Header */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className="h-11 w-11 rounded-xl bg-slate-50 flex items-center justify-center text-secondary font-black text-sm border border-slate-100 shadow-sm relative shrink-0">
                                                        {(user.nom_usu || 'U').charAt(0)}
                                                        <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${user.act_ina === 1 ? 'bg-emerald-500 shadow-sm' : 'bg-rose-400 shadow-sm'}`}></div>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-[12px] font-black text-secondary leading-tight truncate uppercase tracking-tight">{user.nom_usu}</div>
                                                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1 truncate opacity-90">{(user.cor_ele || '').toLowerCase()}</div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end shrink-0">
                                                    <span className={`px-2 py-1 rounded-lg text-[8px] font-black tracking-widest border ${user.flg_adm === 1 ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                                        {user.flg_adm === 1 ? 'ADMIN' : 'COLAB'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Status and Actions Container */}
                                            <div className="flex items-center justify-between bg-slate-50/50 rounded-xl p-3 border border-slate-100 shadow-inner">
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1.5 opacity-70">Estado Operativo</span>
                                                    <div className="flex items-center space-x-2.5">
                                                        <label className={`relative inline-flex items-center ${user.flg_adm === 1 ? 'cursor-not-allowed opacity-60' : 'cursor-pointer active:scale-95 transition-transform'}`}>
                                                            <input
                                                                type="checkbox"
                                                                checked={user.act_ina === 1}
                                                                onChange={() => handleToggleStatus(user.id, user.act_ina)}
                                                                disabled={user.flg_adm === 1}
                                                                className="sr-only peer"
                                                            />
                                                            <div className="w-10 h-5.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
                                                        </label>
                                                        <span className={`text-[9px] font-black uppercase tracking-widest ${user.act_ina === 1 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                                            {user.act_ina === 1 ? 'Activo' : 'Inactivo'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1.5 opacity-70">Último Acceso</span>
                                                    <div className="text-[10px] font-bold text-slate-500 font-mono mt-0.5">
                                                        {formatDate(user.fch_cam_psw)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Modal de Registro con Glassmorphism */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-secondary/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="bg-white rounded-[40px] shadow-2xl max-w-xl w-full p-10 relative overflow-hidden animate-fade-scale border border-white/20">
                        {/* Decorative background in modal */}
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-60"></div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-3xl font-black text-secondary tracking-tighter">Nuevo Colaborador</h3>
                                    <p className="text-sm text-slate-400 font-bold mt-1 tracking-tight">Complete los datos para generar el acceso.</p>
                                </div>
                                <button onClick={() => { setIsModalOpen(false); setModalError(''); }} className="bg-slate-50 hover:bg-slate-100 p-4 rounded-3xl transition-all text-slate-400 hover:text-secondary">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {modalError && (
                                <div className="mb-8 bg-red-50 text-red-800 p-5 rounded-3xl border border-red-100 flex items-center shadow-lg shadow-red-500/5 animate-shake">
                                    <div className="p-2 bg-white rounded-xl mr-4 shadow-sm">
                                        <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-black">{modalError}</span>
                                </div>
                            )}

                            <form onSubmit={handleCreateUser} className="space-y-8">
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Documento de Identidad (DNI)</label>
                                    <div className="bg-slate-50 p-2 rounded-3xl flex border-2 border-slate-100 shadow-inner group focus-within:border-primary transition-all">
                                        <input
                                            type="text"
                                            className="flex-1 bg-transparent border-none focus:ring-0 px-5 py-3 text-xl font-black text-secondary placeholder-slate-300"
                                            value={dni}
                                            onChange={(e) => setDni(e.target.value)}
                                            placeholder="00000000"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleSearchDni}
                                            disabled={isSearchingDni}
                                            className="bg-secondary text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary disabled:opacity-50 transition-all shadow-lg"
                                        >
                                            {isSearchingDni ? '...' : 'Validar'}
                                        </button>
                                    </div>
                                </div>

                                {foundPerson && (
                                    <div className="bg-emerald-50 p-6 rounded-[32px] border border-emerald-100 flex items-center space-x-6 animate-fade-scale shadow-lg shadow-emerald-500/5">
                                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-emerald-100">
                                            <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[9px] text-emerald-600 font-black uppercase tracking-widest mb-1">Colaborador Identificado:</p>
                                            <p className="text-xl font-black text-secondary leading-tight">
                                                {foundPerson.Nombre}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Correo Institucional</label>
                                    <input
                                        type="email"
                                        required
                                        className="block w-full rounded-3xl border-2 border-slate-100 bg-slate-50 focus:bg-white py-5 px-6 text-secondary border transition-all font-black text-lg focus:border-primary focus:ring-0 placeholder-slate-300"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="correo@notaria.com"
                                    />
                                </div>

                                <div className="flex items-center space-x-5 p-6 bg-slate-50 rounded-[32px] border border-slate-100 shadow-inner">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isAdminField}
                                            onChange={(e) => setIsAdminField(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-12 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-amber-500 shadow-inner"></div>
                                    </label>
                                    <div>
                                        <p className="text-xs font-black text-secondary uppercase tracking-tight">Privilegios de Administrador</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Habilita el panel de gestión total.</p>
                                    </div>
                                </div>

                                <div className="pt-6 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-8 py-5 rounded-3xl text-sm font-black text-slate-400 bg-slate-50 hover:bg-slate-100 transition-all active:scale-95"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading || !foundPerson}
                                        className="flex-1 px-8 py-5 bg-primary text-white rounded-3xl text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 disabled:opacity-50 transition-all hover:-translate-y-1 active:scale-95"
                                    >
                                        {isLoading ? '...' : 'Confirmar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
