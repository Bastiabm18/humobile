'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaPlus, FaEdit, FaTrash, FaSave, FaUndo, FaExclamationTriangle, FaEyeSlash, FaEye } from 'react-icons/fa';
import { 
  getPreguntasFrecuentes, 
  crearPreguntaFrecuente,
  actualizarPreguntaFrecuente,
  eliminarPreguntaFrecuente
} from '../actions/actions';
import { pregunta_frecuente } from '@/types/externo';

interface PropsModalPreguntasFrecuentes {
  estaAbierto: boolean;
  alCerrar: () => void;
}

export default function ModalPreguntasFrecuentes({ 
  estaAbierto, 
  alCerrar 
}: PropsModalPreguntasFrecuentes) {
  // Estados para las preguntas
  const [preguntas, setPreguntas] = useState<pregunta_frecuente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para el formulario
  const [preguntaEditando, setPreguntaEditando] = useState<pregunta_frecuente | null>(null);
  const [nuevaPregunta, setNuevaPregunta] = useState({
    pregunta: '',
    respuesta: '',
    estado: true
  });
  const [mostrarFormularioNuevo, setMostrarFormularioNuevo] = useState(false);
  
  // Estado para filtrar preguntas activas/inactivas
  const [mostrarInactivas, setMostrarInactivas] = useState(false);


  //modal 

    const [modalConfirmacion, setModalConfirmacion] = useState<{
    mostrar: boolean;
    id: string;
    pregunta: string;
    tipo: 'eliminar' | 'desactivar' | 'activar';
  }>({
    mostrar: false,
    id: '',
    pregunta: '',
    tipo: 'eliminar'
  });

  // Cargar preguntas cuando se abre el modal
  useEffect(() => {
    if (estaAbierto) {
      cargarPreguntas();
    }
  }, [estaAbierto]);

  const cargarPreguntas = async () => {
    try {
      setCargando(true);
      setError(null);
      const data = await getPreguntasFrecuentes();
      setPreguntas(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las preguntas frecuentes');
      console.error('Error cargando preguntas:', err);
    } finally {
      setCargando(false);
    }
  };

  // Filtrar preguntas según estado
  const preguntasFiltradas = mostrarInactivas 
    ? preguntas 
    : preguntas.filter(p => p.estado);

  const agregarPregunta = async () => {
    try {
      // Validaciones
      if (!nuevaPregunta.pregunta.trim()) {
        setError('La pregunta es requerida');
        return;
      }
      if (!nuevaPregunta.respuesta.trim()) {
        setError('La respuesta es requerida');
        return;
      }

      setError(null);
      const preguntaCreada = await crearPreguntaFrecuente({
        pregunta: nuevaPregunta.pregunta,
        respuesta: nuevaPregunta.respuesta,
        estado: nuevaPregunta.estado
      });
      
      // Agregar a la lista local
      setPreguntas([preguntaCreada, ...preguntas]);
      
      // Resetear formulario
      setNuevaPregunta({ pregunta: '', respuesta: '', estado: true });
      setMostrarFormularioNuevo(false);
      
    } catch (err: any) {
      setError(err.message || 'Error al crear la pregunta');
      console.error('Error creando pregunta:', err);
    }
  };

  const guardarEdicion = async () => {
    try {
      if (!preguntaEditando) return;

      // Validaciones
      if (!preguntaEditando.pregunta.trim()) {
        setError('La pregunta es requerida');
        return;
      }
      if (!preguntaEditando.respuesta.trim()) {
        setError('La respuesta es requerida');
        return;
      }

      setError(null);
      const preguntaActualizada = await actualizarPreguntaFrecuente(
        preguntaEditando.id,
        {
          pregunta: preguntaEditando.pregunta,
          respuesta: preguntaEditando.respuesta,
          estado: preguntaEditando.estado
        }
      );

      // Actualizar en la lista local
      setPreguntas(preguntas.map(p => 
        p.id === preguntaActualizada.id ? preguntaActualizada : p
      ));
      
      setPreguntaEditando(null);
      
    } catch (err: any) {
      setError(err.message || 'Error al actualizar la pregunta');
      console.error('Error actualizando pregunta:', err);
    }
  };

  const eliminarPregunta = async (id: string) => {
    try {
      if (!confirm('¿Estás seguro de que deseas desactivar esta pregunta?\n\nLa pregunta se marcará como inactiva pero no se eliminará permanentemente.')) {
        return;
      }

      setError(null);
      await eliminarPreguntaFrecuente(id);
      
      // Actualizar estado local
      setPreguntas(preguntas.map(p => 
        p.id === id ? { ...p, estado: false } : p
      ));
      
    } catch (err: any) {
      setError(err.message || 'Error al desactivar la pregunta');
      console.error('Error eliminando pregunta:', err);
    }
  };

  const restaurarPregunta = async (id: string) => {
    try {
      setError(null);
      await actualizarPreguntaFrecuente(id, { estado: true });
      
      // Actualizar estado local
      setPreguntas(preguntas.map(p => 
        p.id === id ? { ...p, estado: true } : p
      ));
      
    } catch (err: any) {
      setError(err.message || 'Error al restaurar la pregunta');
      console.error('Error restaurando pregunta:', err);
    }
  };

    // Función para abrir modal de confirmación
  const abrirModalConfirmacion = (id: string, pregunta: string, tipo: 'eliminar' | 'desactivar' | 'activar') => {
    setModalConfirmacion({
      mostrar: true,
      id,
      pregunta,
      tipo
    });
  };

  // Función para cerrar modal de confirmación
  const cerrarModalConfirmacion = () => {
    setModalConfirmacion({
      mostrar: false,
      id: '',
      pregunta: '',
      tipo: 'eliminar'
    });
  };

   const cambiarEstadoPregunta = async (nuevoEstado: boolean) => {
    try {
      await actualizarPreguntaFrecuente(modalConfirmacion.id, { estado: nuevoEstado });
      
      // Actualizar en la lista local
      setPreguntas(preguntas.map(p => 
        p.id === modalConfirmacion.id ? { ...p, estado: nuevoEstado } : p
      ));
      
      cerrarModalConfirmacion();
      
    } catch (err: any) {
      setError(err.message || `Error al ${nuevoEstado ? 'activar' : 'desactivar'} la pregunta`);
      cerrarModalConfirmacion();
    }
  };

    const eliminarPreguntaPermanente = async () => {
    try {
    
      await eliminarPreguntaFrecuente(modalConfirmacion.id);
      
      // Eliminar de la lista local
      setPreguntas(preguntas.filter(p => p.id !== modalConfirmacion.id));
      
      cerrarModalConfirmacion();
      
    } catch (err: any) {
      setError(err.message || 'Error al eliminar la pregunta');
      cerrarModalConfirmacion();
    }
  };
  // Función que renderiza el modal de confirmación
  const renderModalConfirmacion = () => {
    const { mostrar, id, pregunta, tipo } = modalConfirmacion;
    if (!mostrar) return null;

    const config = {
      eliminar: {
        titulo: 'Eliminar Pregunta',
        mensaje: '¿Estás seguro de que deseas eliminar permanentemente esta pregunta?',
        color: 'red',
        icono: <FaExclamationTriangle className="text-red-400 text-xl" />,
        botonAccion: 'Eliminar Permanentemente',
        accion: eliminarPreguntaPermanente
      },
      desactivar: {
        titulo: 'Desactivar Pregunta',
        mensaje: '¿Estás seguro de que deseas desactivar esta pregunta?',
        color: 'amber',
        icono: <FaEyeSlash className="text-amber-400 text-xl" />,
        botonAccion: 'Desactivar',
        accion: () => cambiarEstadoPregunta(false)
      },
      activar: {
        titulo: 'Activar Pregunta',
        mensaje: '¿Estás seguro de que deseas activar esta pregunta?',
        color: 'emerald',
        icono: <FaEye className="text-emerald-400 text-xl" />,
        botonAccion: 'Activar',
        accion: () => cambiarEstadoPregunta(true)
      }
    }[tipo];

    return (
      <AnimatePresence>
        {mostrar && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={cerrarModalConfirmacion}
              className="fixed inset-0 bg-black/80 z-[60]"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                        w-full max-w-md 
                        bg-neutral-800 rounded-xl border border-neutral-700 
                        z-[70] overflow-hidden"
            >
              {/* Header */}
              <div className={`p-6 border-b border-${config.color}-700 bg-${config.color}-900/20`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 bg-${config.color}-900/40 rounded-lg`}>
                    {config.icono}
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    {config.titulo}
                  </h3>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-6">
                <div className="mb-6">
                  <p className="text-neutral-300 mb-4">
                    {config.mensaje}
                  </p>
                  
                  <div className="p-4 bg-neutral-700/50 rounded-lg border border-neutral-600 mb-4">
                    <p className="text-white font-medium mb-1">Pregunta:</p>
                    <p className="text-neutral-300 italic">"{pregunta}"</p>
                  </div>
                  
                  {tipo === 'eliminar' && (
                    <div className="p-3 bg-red-900/20 border border-red-800/50 rounded-lg">
                      <p className="text-red-300 text-sm">
                        ⚠️ Esta acción es permanente y no se puede deshacer.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={cerrarModalConfirmacion}
                    className="px-5 py-2 bg-neutral-700 hover:bg-neutral-600 
                             text-white font-medium rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={config.accion}
                    className={`px-5 py-2 bg-${config.color}-600 hover:bg-${config.color}-700 
                             text-white font-medium rounded-lg transition-colors`}
                  >
                    {config.botonAccion}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  };


  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const preguntasActivas = preguntas.filter(p => p.estado).length;
  const preguntasInactivas = preguntas.filter(p => !p.estado).length;

  return (
    <>
    
    <AnimatePresence>
      {estaAbierto && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={alCerrar}
            className="fixed inset-0 bg-black/70 z-40"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                      w-[95vw] max-w-4xl max-h-[90vh] 
                      bg-neutral-800 rounded-xl border border-neutral-700 
                      z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-700">
              <h2 className="text-2xl font-bold text-white">
                Gestión de Preguntas Frecuentes
              </h2>
              <button
                onClick={alCerrar}
                className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-700"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-6 overflow-y-auto custom-scrollbar max-h-[calc(90vh-140px)]">
              {/* Estadísticas y Filtros */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex gap-4">
                  <div className="px-3 py-1 bg-neutral-700 border border-emerald-600 rounded">
                    <span className="text-emerald-300 font-medium">
                      {preguntasActivas} Activas
                    </span>
                  </div>
                  <div className="px-3 py-1 bg-neutral-700 border border-red-600 rounded">
                    <span className="text-red-300 font-medium">
                      {preguntasInactivas} Inactivas
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setMostrarInactivas(false)}
                    className={`px-3 py-1 rounded transition-colors ${
                      !mostrarInactivas 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                    }`}
                  >
                    Solo Activas
                  </button>
                  <button
                    onClick={() => setMostrarInactivas(true)}
                    className={`px-3 py-1 rounded transition-colors ${
                      mostrarInactivas 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                    }`}
                  >
                    Todas
                  </button>
                </div>
              </div>

              {/* Botón Agregar */}
              <div className="mb-6">
                <button
                  onClick={() => {
                    setMostrarFormularioNuevo(!mostrarFormularioNuevo);
                    setPreguntaEditando(null);
                  }}
                  className="flex items-center gap-2 px-4 py-3 bg-blue-600 
                           hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <FaPlus />
                  Agregar Nueva Pregunta
                </button>
              </div>

              {/* Mensaje de Error */}
              {error && (
                <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg">
                  <p className="text-red-300 font-medium">Error:</p>
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              {/* Formulario Nueva Pregunta */}
              <AnimatePresence>
                {mostrarFormularioNuevo && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-8 p-6 bg-neutral-700/50 rounded-xl border border-neutral-600"
                  >
                    <h3 className="text-xl font-semibold text-white mb-4">
                      Nueva Pregunta Frecuente
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                          Pregunta *
                        </label>
                        <input
                          type="text"
                          value={nuevaPregunta.pregunta}
                          onChange={(e) => setNuevaPregunta({
                            ...nuevaPregunta,
                            pregunta: e.target.value
                          })}
                          className="w-full p-3 bg-neutral-600 border border-neutral-500 
                                   rounded-lg text-white focus:ring-2 focus:ring-blue-500 
                                   focus:border-transparent transition-all"
                          placeholder="Escribe la pregunta que quieres agregar"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                          Respuesta *
                        </label>
                        <textarea
                          value={nuevaPregunta.respuesta}
                          onChange={(e) => setNuevaPregunta({
                            ...nuevaPregunta,
                            respuesta: e.target.value
                          })}
                          className="w-full p-3 bg-neutral-600 border border-neutral-500 
                                   rounded-lg text-white focus:ring-2 focus:ring-blue-500 
                                   focus:border-transparent transition-all resize-none"
                          rows={4}
                          placeholder="Escribe la respuesta detallada"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="estadoNuevo"
                          checked={nuevaPregunta.estado}
                          onChange={(e) => setNuevaPregunta({
                            ...nuevaPregunta,
                            estado: e.target.checked
                          })}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="estadoNuevo" className="text-neutral-300">
                          Publicar inmediatamente (estado activo)
                        </label>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={agregarPregunta}
                          className="px-6 py-3 bg-green-700 hover:bg-green-800 
                                   text-white font-medium rounded-lg transition-colors"
                        >
                          Guardar Pregunta
                        </button>
                        <button
                          onClick={() => {
                            setMostrarFormularioNuevo(false);
                            setNuevaPregunta({ 
                              pregunta: '', 
                              respuesta: '', 
                              estado: true 
                            });
                          }}
                          className="px-6 py-3 bg-neutral-600 hover:bg-neutral-700 
                                   text-white font-medium rounded-lg transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Lista de Preguntas */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">
                    Preguntas {mostrarInactivas ? 'Todas' : 'Activas'}
                    <span className="text-neutral-400 text-base font-normal ml-2">
                      ({preguntasFiltradas.length})
                    </span>
                  </h3>
                  
                  {cargando && (
                    <div className="flex items-center gap-2 text-blue-400">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                      <span className="text-sm">Cargando...</span>
                    </div>
                  )}
                </div>
                
                {cargando && preguntas.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <p className="text-neutral-400 mt-4">Cargando preguntas...</p>
                  </div>
                ) : preguntasFiltradas.length === 0 ? (
                  <div className="text-center py-12 bg-neutral-700/30 rounded-xl">
                    <p className="text-neutral-400 text-lg">
                      {mostrarInactivas 
                        ? 'No hay preguntas frecuentes registradas' 
                        : 'No hay preguntas activas. Agrega una nueva o activa alguna existente.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {preguntasFiltradas.map((pregunta) => (
                      <div
                        key={pregunta.id}
                        className={`p-5 rounded-xl border transition-all ${
                          pregunta.estado 
                            ? 'bg-neutral-700/50 border-neutral-600 hover:border-neutral-500' 
                            : 'bg-neutral-800/30 border-neutral-700/50'
                        } ${preguntaEditando?.id === pregunta.id ? 'ring-2 ring-blue-500' : ''}`}
                      >
                        {preguntaEditando?.id === pregunta.id ? (
                          // Modo edición
                          <div className="space-y-4">
                            <input
                              type="text"
                              value={preguntaEditando.pregunta}
                              onChange={(e) => setPreguntaEditando({
                                ...preguntaEditando,
                                pregunta: e.target.value
                              })}
                              className="w-full p-3 bg-neutral-600 border border-neutral-500 
                                       rounded-lg text-white text-lg font-semibold
                                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Escribe la pregunta"
                            />
                            <textarea
                              value={preguntaEditando.respuesta}
                              onChange={(e) => setPreguntaEditando({
                                ...preguntaEditando,
                                respuesta: e.target.value
                              })}
                              className="w-full p-3 bg-neutral-600 border border-neutral-500 
                                       rounded-lg text-white
                                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              rows={4}
                              placeholder="Escribe la respuesta"
                            />
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  id={`estado-${pregunta.id}`}
                                  checked={preguntaEditando.estado}
                                  onChange={(e) => setPreguntaEditando({
                                    ...preguntaEditando,
                                    estado: e.target.checked
                                  })}
                                  className="w-4 h-4 text-blue-600 rounded"
                                />
                                <label 
                                  htmlFor={`estado-${pregunta.id}`} 
                                  className="text-neutral-300"
                                >
                                  Pregunta activa
                                </label>
                              </div>
                              <div className="flex gap-3">
                                <button
                                  onClick={guardarEdicion}
                                  className="flex items-center gap-2 px-4 py-2 
                                           bg-emerald-600 hover:bg-emerald-700 
                                           text-white rounded-lg transition-colors"
                                >
                                  <FaSave />
                                  Guardar Cambios
                                </button>
                                <button
                                  onClick={() => setPreguntaEditando(null)}
                                  className="px-4 py-2 bg-neutral-600 hover:bg-neutral-700 
                                           text-white rounded-lg transition-colors"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // Modo visualización
                          <>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <h4 className="text-lg font-semibold text-white">
                                    {pregunta.pregunta}
                                  </h4>
                                  {!pregunta.estado && (
                                    <span className="px-2 py-1 text-xs bg-red-900/50 text-red-300 rounded">
                                      INACTIVA
                                    </span>
                                  )}
                                </div>
                                <p className="text-neutral-300 mb-4 whitespace-pre-line">
                                  {pregunta.respuesta}
                                </p>
                                <div className="flex flex-wrap gap-4 text-sm text-neutral-400">
                                  <div className="flex items-center gap-1">
                                    <span className="font-medium">Creada:</span>
                                    <span>{formatearFecha(pregunta.created_at)}</span>
                                  </div>
                                  {pregunta.updated_at !== pregunta.created_at && (
                                    <div className="flex items-center gap-1">
                                      <span className="font-medium">Actualizada:</span>
                                      <span>{formatearFecha(pregunta.updated_at)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

<div className="flex gap-2 ml-4 flex-shrink-0">
  {pregunta.estado ? (
    <>
      {/* Botón Editar */}
      <button
        onClick={() => {
          setPreguntaEditando(pregunta);
          setMostrarFormularioNuevo(false);
        }}
        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 rounded-lg transition-colors"
        title="Editar pregunta"
      >
        <FaEdit />
      </button>
      
      {/* Botón Desactivar */}
      <button
        onClick={() => abrirModalConfirmacion(pregunta.id, pregunta.pregunta, 'desactivar')}
        className="p-2 text-amber-400 hover:text-amber-300 hover:bg-amber-900/30 rounded-lg transition-colors"
        title="Desactivar pregunta"
      >
        <FaEyeSlash />
      </button>
      
      {/* Botón Eliminar */}
      <button
        onClick={() => abrirModalConfirmacion(pregunta.id, pregunta.pregunta, 'eliminar')}
        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-colors"
        title="Eliminar permanentemente"
      >
        <FaTrash />
      </button>
    </>
  ) : (
    <>
      {/* Para preguntas inactivas */}
      {/* Botón Activar */}
      <button
        onClick={() => abrirModalConfirmacion(pregunta.id, pregunta.pregunta, 'activar')}
        className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/30 rounded-lg transition-colors"
        title="Activar pregunta"
      >
        <FaEye />
      </button>
      
      {/* Botón Editar (también para inactivas) */}
      <button
        onClick={() => {
          setPreguntaEditando(pregunta);
          setMostrarFormularioNuevo(false);
        }}
        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 rounded-lg transition-colors"
        title="Editar pregunta"
      >
        <FaEdit />
      </button>
      
      {/* Botón Eliminar */}
      <button
        onClick={() => abrirModalConfirmacion(pregunta.id, pregunta.pregunta, 'eliminar')}
        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-colors"
        title="Eliminar permanentemente"
      >
        <FaTrash />
      </button>
    </>
  )}
</div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-neutral-700 bg-neutral-700/50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-neutral-400">
                  Total: {preguntas.length} preguntas • 
                  Activas: {preguntasActivas} • 
                  Inactivas: {preguntasInactivas}
                </div>
                <button
                  onClick={alCerrar}
                  className="px-6 py-2 bg-neutral-600 hover:bg-neutral-700 
                           text-white font-medium rounded-lg transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>

      {renderModalConfirmacion()}
    </>
  );
}