'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaEdit, FaSave, FaTimesCircle, FaCrown,FaPlus,FaTrashAlt } from 'react-icons/fa';
import { obtenerMembresias, actualizarMembresia, crearMembresia,eliminarMembresia } from '../actions/actions';

interface PropsModal {
  estaAbierto: boolean;
  alCerrar: () => void;
}

interface Membresia {
  id_membership: string;
  nombre: string;
  precio_mensual: number;
  duracion_dias: number | null;
}

export default function ModalGestionPrecioMembresia({ estaAbierto, alCerrar }: PropsModal) {
  const [membresias, setMembresias] = useState<Membresia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);
  
  // Estado para controlar qué fila se está editando
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ nombre: string; precio: number; duracion: number | null }>({
    nombre: '',
    precio: 0,
    duracion: null
  });

  // estado para nueva membresia
    const [creandoNuevo, setCreandoNuevo] = useState(false);
    const [nuevoData, setNuevoData] = useState<{
      nombre: string;
      precio: number;
      duracion: number | null;
    }>({
      nombre: '',
      precio: 0,
      duracion: null
    });


    // eliminar membresia 

    const [confirmandoEliminarId, setConfirmandoEliminarId] = useState<string | null>(null);

    // efecto al cargar modal 
  useEffect(() => {
    if (estaAbierto) {
      cargarMembresias();
    } else {
      resetearEstado();
    }
  }, [estaAbierto]);

  const resetearEstado = () => {
    setMembresias([]);
    setCargando(true);
    setError(null);
    setExito(null);
    setEditandoId(null);
      setCreandoNuevo(false);
  };

  const cargarMembresias = async () => {
    try {
      setCargando(true);
      const data = await obtenerMembresias();
      setMembresias(data as Membresia[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const iniciarEdicion = (membresia: Membresia) => {
    setEditandoId(membresia.id_membership);
    setEditData({
      nombre: membresia.nombre,
      precio: membresia.precio_mensual,
      duracion: membresia.duracion_dias
    });
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setEditData({ nombre: '', precio: 0, duracion: null });
  };

  const guardarCambios = async (id: string) => {
    if (editData.precio < 0) {
      setError('El precio no puede ser negativo');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      await actualizarMembresia(id, editData.precio, editData.duracion, editData.nombre);
      setExito('Membresía actualizada correctamente');
      setEditandoId(null); // Salir del modo edición
      cargarMembresias(); // Refrescar datos
      setTimeout(() => setExito(null), 3000);
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(precio);
  };

  // CREAR MEMBRESIA 
  const iniciarCreacion = () => {
  setCreandoNuevo(true);
  setNuevoData({ nombre: '', precio: 0, duracion: null });
};

const cancelarCreacion = () => {
  setCreandoNuevo(false);
  setNuevoData({ nombre: '', precio: 0, duracion: null });
};

const guardarNuevo = async () => {
  if (!nuevoData.nombre.trim()) {
    setError('El nombre es obligatorio');
    setTimeout(() => setError(null), 3000);
    return;
  }
  if (nuevoData.precio < 0) {
    setError('El precio no puede ser negativo');
    setTimeout(() => setError(null), 3000);
    return;
  }

  try {
    await crearMembresia(nuevoData.nombre.trim(), nuevoData.precio, nuevoData.duracion);
    setExito('Membresía creada correctamente');
    setCreandoNuevo(false);
    cargarMembresias();
    setTimeout(() => setExito(null), 3000);
  } catch (err: any) {
    setError(err.message);
    setTimeout(() => setError(null), 3000);
  }
};

//FIN CREAR MEMBRESIA 
const solicitarEliminar = (id: string) => {
  setConfirmandoEliminarId(id);
  // Auto-cancelar después de 4 segundos si no confirma
  setTimeout(() => {
    setConfirmandoEliminarId((prev) => (prev === id ? null : prev));
  }, 4000);
};

const cancelarEliminar = () => {
  setConfirmandoEliminarId(null);
};

const confirmarEliminar = async (id: string) => {
  try {
    await eliminarMembresia(id);
    setExito('Membresía eliminada correctamente');
    setConfirmandoEliminarId(null);
    cargarMembresias();
    setTimeout(() => setExito(null), 3000);
  } catch (err: any) {
    setError(err.message);
    setTimeout(() => setError(null), 3000);
  }
};
// eliminar membresia 


//fin eliminar

  return (
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
                      w-full md:max-w-[60vw] max-h-[80vh] overflow-y-auto
                      bg-neutral-800 rounded-xl border border-neutral-700 
                      z-50 overflow-hidden"
          >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-neutral-700 bg-neutral-900">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <FaCrown className="text-yellow-500" />
                    Membresías
                  </h2>
                  <p className="text-neutral-400 text-sm mt-1">
                    Gestiona los precios y duración de las membresías disponibles en el sistema.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={iniciarCreacion}
                    disabled={creandoNuevo}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700
                               disabled:opacity-40 disabled:cursor-not-allowed
                               text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <FaPlus size={14} />
                    Nuevo
                  </button>
                  <button
                    onClick={alCerrar}
                    className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-700"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>
              </div>

            {/* Mensajes */}
            {(exito || error) && (
              <div className={`mx-6 mt-4 p-3 rounded-lg ${
                exito ? 'bg-emerald-900/30 border border-emerald-700' : 'bg-red-900/30 border border-red-700'
              }`}>
                <p className={exito ? 'text-emerald-300' : 'text-red-300'}>
                  {exito || error}
                </p>
              </div>
            )}

            {/* Tabla */}
            <div className="p-6">
              {cargando ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
                  <p className="text-neutral-400 mt-4">Cargando planes...</p>
                </div>
              ) : membresias.length === 0 ? (
                <div className="text-center py-12 bg-neutral-700/30 rounded-xl">
                  <p className="text-neutral-400">No hay membresías registradas</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-700">
                      <th className="text-left py-3 px-4 text-neutral-300">Plan</th>
                      <th className="text-left py-3 px-4 text-neutral-300">Precio Mensual</th>
                      <th className="text-left py-3 px-4 text-neutral-300">Duración (Días)</th>
                      <th className="text-right py-3 px-4 text-neutral-300">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Fila de nueva membresía */}
                    {creandoNuevo && (
                      <tr className="border-b border-yellow-600/40 bg-yellow-900/10">
                        <td className="py-4 px-4">
                          <input
                            type="text"
                            value={nuevoData.nombre}
                            onChange={(e) => setNuevoData({ ...nuevoData, nombre: e.target.value })}
                            placeholder="Nombre del plan"
                            className="w-full px-3 py-2 bg-neutral-700 border border-yellow-500 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
                            autoFocus
                          />
                        </td>
                        <td className="py-4 px-4">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">$</span>
                            <input
                              type="number"
                              value={nuevoData.precio || ''}
                              onChange={(e) => setNuevoData({ ...nuevoData, precio: parseFloat(e.target.value) || 0 })}
                              className="w-full pl-7 pr-3 py-2 bg-neutral-700 border border-yellow-500 rounded-lg text-white text-right focus:outline-none focus:ring-1 focus:ring-yellow-500"
                              min="0"
                              step="1000"
                              placeholder="0"
                            />
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <input
                            type="number"
                            value={nuevoData.duracion || ''}
                            onChange={(e) => setNuevoData({ ...nuevoData, duracion: parseInt(e.target.value) || null })}
                            className="w-24 px-3 py-2 bg-neutral-700 border border-yellow-500 rounded-lg text-white text-center focus:outline-none focus:ring-1 focus:ring-yellow-500"
                            placeholder="∞"
                            min="1"
                          />
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={cancelarCreacion}
                              className="p-2 bg-neutral-600 text-neutral-300 hover:bg-neutral-500 rounded-lg"
                              title="Cancelar"
                            >
                              <FaTimesCircle />
                            </button>
                            <button
                              onClick={guardarNuevo}
                              className="p-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg"
                              title="Guardar"
                            >
                              <FaSave />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}

                    {membresias.map((m) => (
                      <tr key={m.id_membership} className="border-b border-neutral-800 hover:bg-neutral-700/30">

                        {/* Nombre (Editable o Lectura) */}
                        <td className="py-4 px-4">
                          {editandoId === m.id_membership ? (
                            <input
                              type="text"
                              value={editData.nombre}
                              onChange={(e) => setEditData({ ...editData, nombre: e.target.value })}
                              className="w-full px-3 py-2 bg-neutral-700 border border-blue-500 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          ) : (
                            <span className="text-white font-medium capitalize">{m.nombre}</span>
                          )}
                        </td>
                        
                        {/* Precio (Editable o Lectura) */}
                        <td className="py-4 px-4">
                          {editandoId === m.id_membership ? (
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">$</span>
                              <input
                                type="number"
                                value={editData.precio}
                                onChange={(e) => setEditData({ ...editData, precio: parseFloat(e.target.value) || 0 })}
                                className="w-full pl-7 pr-3 py-2 bg-neutral-700 border border-blue-500 rounded-lg text-white text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                                min="0"
                                step="1000"
                              />
                            </div>
                          ) : (
                            <span className="text-emerald-400 font-bold text-lg">
                              {formatearPrecio(m.precio_mensual)}
                            </span>
                          )}
                        </td>
                        
                        {/* Duración (Editable o Lectura) */}
                        <td className="py-4 px-4">
                          {editandoId === m.id_membership ? (
                            <input
                              type="number"
                              value={editData.duracion || ''}
                              onChange={(e) => setEditData({ ...editData, duracion: parseInt(e.target.value) || null })}
                              className="w-24 px-3 py-2 bg-neutral-700 border border-blue-500 rounded-lg text-white text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="∞"
                              min="1"
                            />
                          ) : (
                            <span className="text-neutral-300">
                              {m.duracion_dias ? `${m.duracion_dias} días` : 'Indefinido'}
                            </span>
                          )}
                        </td>
                        
                      {/* Botones de Acción */}
                        <td className="py-4 px-4 text-right">
                          {editandoId === m.id_membership ? (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={cancelarEdicion}
                                className="p-2 bg-neutral-600 text-neutral-300 hover:bg-neutral-500 rounded-lg"
                                title="Cancelar"
                              >
                                <FaTimesCircle />
                              </button>
                              <button
                                onClick={() => guardarCambios(m.id_membership)}
                                className="p-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg"
                                title="Guardar"
                              >
                                <FaSave />
                              </button>
                            </div>
                          ) : confirmandoEliminarId === m.id_membership ? (
                            <div className="flex justify-end items-center gap-2">
                              <span className="text-red-400 text-xs font-medium">¿Eliminar?</span>
                              <button
                                onClick={cancelarEliminar}
                                className="px-2 py-1 bg-neutral-600 text-neutral-300 hover:bg-neutral-500 rounded-lg text-xs"
                              >
                                No
                              </button>
                              <button
                                onClick={() => confirmarEliminar(m.id_membership)}
                                className="px-2 py-1 bg-red-600 text-white hover:bg-red-700 rounded-lg text-xs font-medium"
                              >
                                Sí
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => iniciarEdicion(m)}
                                className="p-2 bg-blue-900/50 text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 rounded-lg"
                                title="Editar membresía"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => solicitarEliminar(m.id_membership)}
                                className="p-2 bg-red-900/40 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg"
                                title="Eliminar membresía"
                              >
                                <FaTrashAlt />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}