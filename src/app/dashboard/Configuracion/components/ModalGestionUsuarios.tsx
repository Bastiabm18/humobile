'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTimes, 
  FaUserEdit, 
  FaUserSlash, 
  FaUserLock, 
  FaUserCheck,
  FaSearch,
  FaFilter,
  FaSync,
  FaEye,
  FaTrash,
  FaBan,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUserCog
} from 'react-icons/fa';
import { activarUsuario, bloquearUsuario, eliminarUsuario, getUsuarios } from '../actions/actions';
import { User} from '@/types/profile';
import ModalConfirmacionUsuario from './ModalConfirmacionUsuario';

interface PropsModalGestionUsuarios {
  estaAbierto: boolean;
  alCerrar: () => void;
}

interface FiltrosUsuarios {
  busqueda: string;
  rol: string;
  membresia: string;
  estado: string;
}

export default function ModalGestionUsuarios({ 
  estaAbierto, 
  alCerrar 
}: PropsModalGestionUsuarios) {
  // Estados para usuarios
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para filtros y búsqueda
  const [filtros, setFiltros] = useState<FiltrosUsuarios>({
    busqueda: '',
    rol: 'todos',
    membresia: 'todos',
    estado: 'todos'
  });
  
  // Estado para modal de confirmación
  const [modalConfirmacion, setModalConfirmacion] = useState<{
    mostrar: boolean;
    usuario: User | null;
    accion: 'eliminar' | 'bloquear' | 'activar' | 'editar' | null;
  }>({
    mostrar: false,
    usuario: null,
    accion: null
  });
  
  // Estado para usuario seleccionado
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<User | null>(null);
  
  // Estado para mostrar/ocultar filtros
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Cargar usuarios cuando se abre el modal
  useEffect(() => {
    if (estaAbierto) {
      cargarUsuarios();
    }
  }, [estaAbierto]);

  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      setError(null);
      const data = await getUsuarios();
      setUsuarios(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los usuarios');
      console.error('Error cargando usuarios:', err);
    } finally {
      setCargando(false);
    }
  };

  // Filtrar usuarios según los filtros aplicados
  const usuariosFiltrados = usuarios.filter(usuario => {
    // Filtro por búsqueda
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      const coincideNombre = usuario.name.toLowerCase().includes(busqueda);
      const coincideEmail = usuario.email.toLowerCase().includes(busqueda);
      const coincideTelefono = usuario.telefono?.toLowerCase().includes(busqueda) || false;
      if (!coincideNombre && !coincideEmail && !coincideTelefono) {
        return false;
      }
    }
    
    // Filtro por rol
    if (filtros.rol !== 'todos' && usuario.role !== filtros.rol) {
      return false;
    }
    
    // Filtro por membresía
    if (filtros.membresia !== 'todos' && usuario.membresia !== filtros.membresia) {
      return false;
    }
    
    // Filtro por estado
    if (filtros.estado !== 'todos' && usuario.estado !== filtros.estado) {
      return false;
    }
    
    return true;
  });

  // Función para abrir modal de confirmación
  const abrirModalConfirmacion = (usuario: User, accion: 'eliminar' | 'bloquear' | 'activar' | 'editar') => {
    setModalConfirmacion({
      mostrar: true,
      usuario,
      accion
    });
  };

  // Función para cerrar modal de confirmación
  const cerrarModalConfirmacion = () => {
    setModalConfirmacion({
      mostrar: false,
      usuario: null,
      accion: null
    });
  };

  // Función para manejar la confirmación
  const manejarConfirmacion = async () => {
    if (!modalConfirmacion.usuario || !modalConfirmacion.accion) return;

    try {
      setError(null);
      
      // Aquí llamarías a las funciones correspondientes según la acción
      switch (modalConfirmacion.accion) {
        case 'eliminar':
         await eliminarUsuario(modalConfirmacion.usuario.id);
          break;
        case 'bloquear':
          await bloquearUsuario(modalConfirmacion.usuario.id);
          break;
        case 'activar':
         await activarUsuario(modalConfirmacion.usuario.id);
          break;
       
      }
      
      // Recargar usuarios después de la acción
      await cargarUsuarios();
      cerrarModalConfirmacion();
      
    } catch (err: any) {
      setError(err.message || `Error al ${modalConfirmacion.accion} el usuario`);
      console.error(`Error ${modalConfirmacion.accion} usuario:`, err);
    }
  };

  // Función para formatear fecha
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Obtener opciones únicas para filtros
  const opcionesRoles = Array.from(new Set(usuarios.map(u => u.role)));
  const opcionesMembresias = Array.from(new Set(usuarios.map(u => u.membresia).filter(Boolean)));
  const opcionesEstados = Array.from(new Set(usuarios.map(u => u.estado).filter(Boolean)));

  const totalUsuarios = usuarios.length;
  const usuariosActivos = usuarios.filter(u => u.estado === 'activo').length;
  const usuariosBloqueados = usuarios.filter(u => u.estado === 'bloqueado').length;

  const totalPerfiles = usuarios.reduce((total, usuario) => 
  total + usuario.perfil_artista + usuario.perfil_banda + usuario.perfil_lugar, 0
);

  return (
    <>
      {/* Modal principal */}
      <AnimatePresence>
        {estaAbierto && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={alCerrar}
              className="fixed inset-0 bg-black/70 z-40"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="fixed top-4 left-1/2 transform -translate-x-1/2
                        w-full max-w-[90vw] h-[90vh]
                        bg-neutral-800 rounded-xl border border-neutral-700 
                        z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-neutral-700 bg-neutral-900">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Gestión de Usuarios
                  </h2>
                  <p className="text-neutral-400 text-sm mt-1">
                    Administra usuarios, permisos y estados
                  </p>
                </div>
                <button
                  onClick={alCerrar}
                  className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-700"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              {/* Contenido */}
              <div className="h-full flex flex-col">
                {/* Barra superior con estadísticas y controles */}
                <div className="p-4 border-b border-neutral-700 bg-neutral-900/50">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Estadísticas */}
                  <div className="flex flex-wrap gap-3">
  <div className="px-3 py-1 bg-neutral-700 border border-blue-600 rounded-xl">
    <span className="text-blue-300 font-medium">
      Total: {totalUsuarios}
    </span>
  </div>
  <div className="px-3 py-1 bg-neutral-700 border border-emerald-600 rounded-xl">
    <span className="text-emerald-300 font-medium">
      Activos: {usuariosActivos}
    </span>
  </div>
  <div className="px-3 py-1 bg-neutral-700 border border-red-600 rounded-xl">
    <span className="text-red-300 font-medium">
      Bloqueados: {usuariosBloqueados}
    </span>
  </div>
  <div className="px-3 py-1 bg-neutral-700 border border-purple-600 rounded-xl">
    <span className="text-purple-300 font-medium">
      Perfiles: {totalPerfiles}
    </span>
  </div>
</div>
                    
                    {/* Controles */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={cargarUsuarios}
                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="Actualizar lista"
                      >
                        <FaSync />
                      </button>
                      <button
                        onClick={() => setMostrarFiltros(!mostrarFiltros)}
                        className="p-2 text-amber-400 hover:text-amber-300 hover:bg-amber-900/30 rounded-lg transition-colors"
                        title="Mostrar/Ocultar filtros"
                      >
                        <FaFilter />
                      </button>
                    </div>
                  </div>

                  {/* Barra de búsqueda */}
                  <div className="mt-4">
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                      <input
                        type="text"
                        value={filtros.busqueda}
                        onChange={(e) => setFiltros({...filtros, busqueda: e.target.value})}
                        placeholder="Buscar por nombre, email o teléfono..."
                        className="w-full pl-10 pr-4 py-2 bg-neutral-700 border border-neutral-600 
                                 rounded-lg text-white placeholder-neutral-400
                                 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Filtros avanzados */}
                  <AnimatePresence>
                    {mostrarFiltros && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 p-4 bg-neutral-700/50 rounded-lg border border-neutral-600"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Filtro por rol */}
                          <div>
                            <label className="block text-sm text-neutral-300 mb-2">
                              Rol
                            </label>
                            <select
                              value={filtros.rol}
                              onChange={(e) => setFiltros({...filtros, rol: e.target.value})}
                              className="w-full p-2 bg-neutral-600 border border-neutral-500 rounded text-white"
                            >
                              <option value="todos">Todos los roles</option>
                              {opcionesRoles.map(rol => (
                                <option key={rol} value={rol}>{rol}</option>
                              ))}
                            </select>
                          </div>
                          
                          {/* Filtro por membresía */}
                          <div>
                            <label className="block text-sm text-neutral-300 mb-2">
                              Membresía
                            </label>
                            <select
                              value={filtros.membresia}
                              onChange={(e) => setFiltros({...filtros, membresia: e.target.value})}
                              className="w-full p-2 bg-neutral-600 border border-neutral-500 rounded text-white"
                            >
                              <option value="todos">Todas las membresías</option>
                              {opcionesMembresias.map(membresia => (
                                <option key={membresia} value={membresia}>{membresia}</option>
                              ))}
                            </select>
                          </div>
                          
                          {/* Filtro por estado */}
                          <div>
                            <label className="block text-sm text-neutral-300 mb-2">
                              Estado
                            </label>
                            <select
                              value={filtros.estado}
                              onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
                              className="w-full p-2 bg-neutral-600 border border-neutral-500 rounded text-white"
                            >
                              <option value="todos">Todos los estados</option>
                              {opcionesEstados.map(estado => (
                                <option key={estado} value={estado}>{estado}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Mensaje de Error */}
                {error && (
                  <div className="mx-4 mt-4 p-3 bg-red-900/30 border border-red-700 rounded-lg">
                    <p className="text-red-300 font-medium">Error:</p>
                    <p className="text-red-200 text-sm">{error}</p>
                  </div>
                )}

                {/* Tabla de usuarios */}
                <div className="flex-1 overflow-auto p-4">
                  {cargando && usuarios.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                      <p className="text-neutral-400 mt-4">Cargando usuarios...</p>
                    </div>
                  ) : usuariosFiltrados.length === 0 ? (
                    <div className="text-center py-12 bg-neutral-700/30 rounded-xl">
                      <p className="text-neutral-400 text-lg">
                        {usuarios.length === 0 
                          ? 'No hay usuarios registrados' 
                          : 'No se encontraron usuarios con los filtros aplicados'}
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full min-w-full">
  <thead>
    <tr className="border-b border-neutral-700">
      <th className="text-left py-3 px-4 text-neutral-300 font-semibold">Usuario</th>
      <th className="text-left py-3 px-4 text-neutral-300 font-semibold">Email</th>
      <th className="text-left py-3 px-4 text-neutral-300 font-semibold">Contacto</th>
      <th className="text-left py-3 px-4 text-neutral-300 font-semibold">Rol</th>
      <th className="text-left py-3 px-4 text-neutral-300 font-semibold">Membresía</th>
      <th className="text-left py-3 px-4 text-neutral-300 font-semibold">Perfiles</th>
      <th className="text-left py-3 px-4 text-neutral-300 font-semibold">Artista</th>
      <th className="text-left py-3 px-4 text-neutral-300 font-semibold">Banda</th>
      <th className="text-left py-3 px-4 text-neutral-300 font-semibold">Lugar</th>
      <th className="text-left py-3 px-4 text-neutral-300 font-semibold">Estado</th>
      <th className="text-left py-3 px-4 text-neutral-300 font-semibold">Registro</th>
      <th className="text-left py-3 px-4 text-neutral-300 font-semibold">Acciones</th>
    </tr>
  </thead>
  <tbody>
    {usuariosFiltrados.map((usuario) => (
      <tr 
        key={usuario.id}
        className="border-b border-neutral-800 hover:bg-neutral-700/30 transition-colors"
      >
        {/* Usuario */}
        <td className="py-3 px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-neutral-600 flex items-center justify-center">
              <FaUserCog className="text-neutral-300" />
            </div>
            <div>
              <p className="text-white font-medium">{usuario.name}</p>
              <p className="text-xs text-neutral-400">ID: {usuario.id.substring(0, 8)}...</p>
            </div>
          </div>
        </td>
        
        {/* Email */}
        <td className="py-3 px-4">
          <p className="text-neutral-300 truncate max-w-[200px]" title={usuario.email}>
            {usuario.email}
          </p>
        </td>
        
        {/* Contacto */}
        <td className="py-3 px-4">
          <p className="text-neutral-300">{usuario.telefono || 'No registrado'}</p>
        </td>
        
        {/* Rol */}
        <td className="py-3 px-4">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            usuario.role === 'admin' 
              ? 'bg-purple-900/30 text-purple-300 border border-purple-700'
              : usuario.role === 'superadmin'
              ? 'bg-red-900/30 text-red-300 border border-red-700'
              : 'bg-blue-900/30 text-blue-300 border border-blue-700'
          }`}>
            {usuario.role}
          </span>
        </td>
        
        {/* Membresía */}
        <td className="py-3 px-4">
          <div className="flex flex-col gap-1">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              usuario.membresia?.toLowerCase().includes('premium')
                ? 'bg-amber-900/30 text-amber-300 border border-amber-700'
                : usuario.membresia?.toLowerCase().includes('basic')
                ? 'bg-blue-900/30 text-blue-300 border border-blue-700'
                : 'bg-neutral-700 text-neutral-300 border border-neutral-600'
            }`}>
              {usuario.membresia || 'Sin membresía'}
            </span>
            {usuario.membership_precio > 0 && (
              <span className="text-xs text-neutral-400">
                ${usuario.membership_precio.toFixed(2)}
              </span>
            )}
          </div>
        </td>
        
        {/* Total Perfiles */}
        <td className="py-3 px-4">
          <div className="flex flex-col items-center">
            <span className={`text-lg font-bold ${
              usuario.perfil_artista + usuario.perfil_banda + usuario.perfil_lugar > 0
                ? 'text-emerald-400'
                : 'text-neutral-500'
            }`}>
              {usuario.perfil_artista + usuario.perfil_banda + usuario.perfil_lugar}
            </span>
            <span className="text-xs text-neutral-400">total</span>
          </div>
        </td>
        
        {/* Perfil Artista */}
        <td className="py-3 px-4">
          <div className="flex flex-col items-center">
            <span className={`text-lg font-bold ${
              usuario.perfil_artista > 0 ? 'text-blue-400' : 'text-neutral-500'
            }`}>
              {usuario.perfil_artista}
            </span>
            <span className="text-xs text-neutral-400">artista</span>
          </div>
        </td>
        
        {/* Perfil Banda */}
        <td className="py-3 px-4">
          <div className="flex flex-col items-center">
            <span className={`text-lg font-bold ${
              usuario.perfil_banda > 0 ? 'text-purple-400' : 'text-neutral-500'
            }`}>
              {usuario.perfil_banda}
            </span>
            <span className="text-xs text-neutral-400">banda</span>
          </div>
        </td>
        
        {/* Perfil Lugar */}
        <td className="py-3 px-4">
          <div className="flex flex-col items-center">
            <span className={`text-lg font-bold ${
              usuario.perfil_lugar > 0 ? 'text-amber-400' : 'text-neutral-500'
            }`}>
              {usuario.perfil_lugar}
            </span>
            <span className="text-xs text-neutral-400">lugar</span>
          </div>
        </td>
        
        {/* Estado */}
        <td className="py-3 px-4">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            usuario.estado === 'activo'
              ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-700'
              : usuario.estado === 'bloqueado'
              ? 'bg-red-900/30 text-red-300 border border-red-700'
              : usuario.estado === 'pendiente'
              ? 'bg-amber-900/30 text-amber-300 border border-amber-700'
              : 'bg-neutral-700 text-neutral-300 border border-neutral-600'
          }`}>
            {usuario.estado || 'Desconocido'}
          </span>
        </td>
        
        {/* Fecha Registro */}
        <td className="py-3 px-4">
          <div className="flex flex-col">
            <p className="text-sm text-neutral-400">{formatearFecha(usuario.createdAt)}</p>
            {usuario.membership_inicio && (
              <p className="text-xs text-neutral-500">
                Memb: {new Date(usuario.membership_inicio).toLocaleDateString('es-ES')}
              </p>
            )}
          </div>
        </td>
        
        {/* Acciones */}
        <td className="py-3 px-4">
          <div className="flex gap-2">
            {/* Botón Ver Detalles */}
            <button
              onClick={() => setUsuarioSeleccionado(usuario)}
              className=" border p-3 bg-blue-900/50  text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 rounded-xl"
              title="Ver detalles completos"
            >
              <FaEye />
            </button>
            

            
            {/* Botón Gestionar Perfiles */}
            <button
              onClick={() =>{
               
                console.log(usuario);
              } }
              className=" border p-3 bg-indigo-900/50 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/30 rounded-xl"
              title="Gestionar perfiles"
            >
              <FaUserCog />
            </button>
            
            {/* Botón Bloquear/Activar */}
            {usuario.estado === 'activo' ? (
              <button
                onClick={() => abrirModalConfirmacion(usuario, 'bloquear')}
                className=" border p-3 bg-amber-900/50 text-amber-400 hover:text-amber-300 hover:bg-amber-900/30 rounded-xl"
                title="Bloquear usuario"
              >
                <FaBan />
              </button>
            ) : (
              <button
                onClick={() => abrirModalConfirmacion(usuario, 'activar')}
                className=" border p-3 bg-emerald-900/50  text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/30 rounded-xl"
                title="Activar usuario"
              >
                <FaUserCheck />
              </button>
            )}
            
            {/* Botón Eliminar */}
            <button
              onClick={() => abrirModalConfirmacion(usuario, 'eliminar')}
              className=" border p-3 bg-red-900/50  text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-xl"
              title="Eliminar usuario permanentemente"
            >
              <FaTrash />
            </button>
          </div>
        </td>
      </tr>
    ))}
  </tbody>
</table>
                    </div>
                  )}
                </div>

                {/* Footer con resumen */}
                <div className="p-4 border-t border-neutral-700 bg-neutral-900/50">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-neutral-400">
                      Mostrando {usuariosFiltrados.length} de {totalUsuarios} usuarios
                    </div>
                    <div className="text-sm text-neutral-400">
                      Última actualización: {new Date().toLocaleTimeString('es-ES')}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal de confirmación */}
      <ModalConfirmacionUsuario
        estaAbierto={modalConfirmacion.mostrar}
        alCerrar={cerrarModalConfirmacion}
        usuario={modalConfirmacion.usuario}
        accion={modalConfirmacion.accion}
        alConfirmar={manejarConfirmacion}
      />

      {/* Modal de detalles del usuario (pendiente de implementar) */}
      {usuarioSeleccionado && (
        // Aquí puedes agregar otro modal para mostrar detalles completos
        <div></div>
      )}
    </>
  );
}