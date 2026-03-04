'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaShieldAlt, FaPlus, FaSave, FaTrash, FaEdit, 
  FaTimes, FaChevronRight, FaUnlink, FaKey, FaCheck 
} from 'react-icons/fa';

import { 
  getPermisos, upsertPermiso, eliminarPermiso,
  getMembresias, getPermisosDeMembresia, 
  asignarPermisoAMembresia, quitarPermisoDeMembresia,
  actualizarLimitePermiso 
} from '../actions/actions';

export default function ModalGestorPermisos({ estaAbierto, alCerrar }: { estaAbierto: boolean, alCerrar: () => void }) {
  const [pestana, setPestana] = useState<'permisos' | 'asignacion'>('permisos');
  
  // Estados para permisos
  const [permisos, setPermisos] = useState<any[]>([]);
  const [editandoPermiso, setEditandoPermiso] = useState<any>(null);

  // Estados para Asignación
  const [membresias, setMembresias] = useState<any[]>([]);
  const [idMembresiaSel, setIdMembresiaSel] = useState<string | null>(null);
  const [permisosAsignados, setPermisosAsignados] = useState<any[]>([]);
  const [mostrandoSelector, setMostrandoSelector] = useState(false);
  const [limitesPendientes, setLimitesPendientes] = useState<{[key: string]: string}>({});
  
  // Estado para el mini-modal de edición de límite
  const [editandoLimite, setEditandoLimite] = useState<{id_permiso: string, valor: number} | null>(null);

  useEffect(() => {
    if (estaAbierto) cargarDatosIniciales();
  }, [estaAbierto]);

  const cargarDatosIniciales = async () => {
    const [p, m] = await Promise.all([getPermisos(), getMembresias()]);
    setPermisos(p || []);
    setMembresias(m || []);
  };

  const cargarPermisosMembresia = async (id: string) => {
    setIdMembresiaSel(id);
    const data = await getPermisosDeMembresia(id);
    setPermisosAsignados(data || []);
  };

  // --- HANDLERS permisos ---
  const handleGuardarMaestro = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const datos = {
      id_permiso: editandoPermiso?.id_permiso,
      codigo_permiso: formData.get('codigo'),
      nombre_permiso: formData.get('nombre'),
      descripcion: formData.get('descripcion'),
    };
    await upsertPermiso(datos);
    setEditandoPermiso(null);
    cargarDatosIniciales();
  };

  // --- HANDLERS ASIGNACIÓN ---
  const handleVincularPermiso = async (idPermiso: string) => {
    if (!idMembresiaSel) return;
    const limite = parseInt(limitesPendientes[idPermiso] || "0");
    await asignarPermisoAMembresia(idMembresiaSel, idPermiso, limite);
    setLimitesPendientes(prev => {
      const nuevo = {...prev};
      delete nuevo[idPermiso];
      return nuevo;
    });
    setMostrandoSelector(false);
    cargarPermisosMembresia(idMembresiaSel);
  };

  const handleActualizarLimite = async () => {
    if (!idMembresiaSel || !editandoLimite) return;
    await actualizarLimitePermiso(idMembresiaSel, editandoLimite.id_permiso, editandoLimite.valor);
    setEditandoLimite(null);
    cargarPermisosMembresia(idMembresiaSel);
  };

  const handleQuitarPermiso = async (idPermiso: string) => {
    if (!idMembresiaSel) return;
    await quitarPermisoDeMembresia(idMembresiaSel, idPermiso);
    cargarPermisosMembresia(idMembresiaSel);
  };

  if (!estaAbierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md ">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-neutral-900 border border-neutral-800 h-[90vh] w-full md:w-[75vw] rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        
        {/* HEADER */}
        <div className="px-8 py-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-950/50">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <FaShieldAlt className="text-blue-500" /> SEGURIDAD & PLANES
            </h2>
            <nav className="flex bg-neutral-900 p-1 rounded-2xl border border-neutral-800">
              <button onClick={() => setPestana('permisos')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${pestana === 'permisos' ? 'bg-blue-600 text-white shadow-lg' : 'text-neutral-500 hover:text-neutral-300'}`}>permisos</button>
              <button onClick={() => setPestana('asignacion')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${pestana === 'asignacion' ? 'bg-orange-600 text-white shadow-lg' : 'text-neutral-500 hover:text-neutral-300'}`}>ASIGNACIÓN POR PLAN</button>
            </nav>
          </div>
          <button onClick={alCerrar} className="p-2 hover:bg-neutral-800 rounded-full text-neutral-500 transition-colors"><FaTimes size={20}/></button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* PESTAÑA MAESTRO DE PERMISOS */}
          {pestana === 'permisos' && (
            <div className="flex-1 flex gap-6 p-8 overflow-y-auto">
              <div className="w-1/3 bg-neutral-800/50 p-6 rounded-3xl border border-neutral-800 h-fit sticky top-0">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">{editandoPermiso ? <FaEdit/> : <FaPlus/>} {editandoPermiso ? 'Editar' : 'Nuevo'} Permiso</h3>
                <form onSubmit={handleGuardarMaestro} className="space-y-4">
                  <input name="nombre" defaultValue={editandoPermiso?.nombre_permiso} placeholder="Nombre (ej: Crear Eventos)" className="w-full bg-neutral-950 border border-neutral-700 p-3 rounded-xl text-sm text-white" required />
                  <input name="codigo" defaultValue={editandoPermiso?.codigo_permiso} placeholder="Código (ej: ev_create)" className="w-full bg-neutral-950 border border-neutral-700 p-3 rounded-xl text-sm text-blue-400 font-mono" required />
                  <textarea name="descripcion" defaultValue={editandoPermiso?.descripcion} placeholder="Descripción..." className="w-full bg-neutral-950 border border-neutral-700 p-3 rounded-xl text-sm text-white h-24" />
                  <div className="flex gap-2 pt-2">
                    <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all">{editandoPermiso ? 'Actualizar' : 'Crear Permiso'}</button>
                    {editandoPermiso && <button type="button" onClick={() => setEditandoPermiso(null)} className="px-4 bg-neutral-700 text-white rounded-xl">✕</button>}
                  </div>
                </form>
              </div>
              <div className="flex-1 space-y-3">
                {permisos.map(p => (
                  <div key={p.id_permiso} className="group bg-neutral-950 border border-neutral-800 p-4 rounded-2xl flex justify-between items-center hover:border-blue-500/50 transition-all">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold">{p.nombre_permiso}</span>
                        <code className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">{p.codigo_permiso}</code>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">{p.descripcion}</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditandoPermiso(p)} className="p-2 text-neutral-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg"><FaEdit /></button>
                      <button onClick={() => eliminarPermiso(p.id_permiso).then(cargarDatosIniciales)} className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg"><FaTrash /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PESTAÑA ASIGNACIÓN */}
          {pestana === 'asignacion' && (
            <div className="flex-1 flex overflow-hidden">
              <div className="w-72 border-r border-neutral-800 p-6 overflow-y-auto bg-neutral-950/20">
                <p className="text-[10px] font-black text-neutral-500 mb-4 tracking-widest uppercase">Selecciona un Plan</p>
                <div className="space-y-2">
                  {membresias.map(m => (
                    <button key={m.id_membership} onClick={() => cargarPermisosMembresia(m.id_membership)} className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${idMembresiaSel === m.id_membership ? 'bg-orange-600 border-orange-500 text-white shadow-lg translate-x-2' : 'bg-neutral-800/40 border-neutral-800 text-neutral-400 hover:bg-neutral-800'}`}>
                      <span className="font-bold text-sm">{m.nombre}</span>
                      <FaChevronRight size={12} className={idMembresiaSel === m.id_membership ? 'opacity-100' : 'opacity-0'} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 p-8 overflow-y-auto bg-neutral-900">
                {idMembresiaSel ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-bold text-white">Permisos de <span className="text-orange-500 underline">{membresias.find(m => m.id_membership === idMembresiaSel)?.nombre}</span></h3>
                      <button onClick={() => setMostrandoSelector(true)} className="bg-white text-black px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-orange-500 hover:text-white transition-all"><FaPlus /> AGREGAR PERMISO AL PLAN</button>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {permisosAsignados.length > 0 ? (
                        permisosAsignados.map(pa => (
                          <div key={pa.id_permiso} className="bg-neutral-800/30 border border-neutral-700/50 p-4 rounded-2xl flex justify-between items-center group">
                            <div className="flex items-center gap-4">
                              <div className="bg-emerald-500/10 p-3 rounded-xl text-emerald-500"><FaKey size={14}/></div>
                              <div>
                                <p className="text-white font-bold text-sm">{pa.permiso?.nombre_permiso}</p>
                                <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-tighter">{pa.permiso?.codigo_permiso}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex flex-col items-end">
                                <span className="text-[9px] text-neutral-500 font-bold uppercase mb-1">Límite</span>
                                <button title='Editar Limite'
                                  onClick={() => setEditandoLimite({ id_permiso: pa.id_permiso, valor: pa.valor_limite })}
                                  className="px-4 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg text-sm text-blue-400 font-black hover:border-blue-500 transition-colors"
                                >
                                  {pa.valor_limite}
                                </button>
                              </div>
                              <button title="Eliminar Permiso" onClick={() => handleQuitarPermiso(pa.id_permiso)} className="p-3  text-red-500 bg-red-500/10 hover:text-red-300 hover:bg-red-500/40 rounded-xl transition-all"><FaUnlink /></button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-20 text-center border-2 border-dashed border-neutral-800 rounded-3xl text-neutral-600 italic">Este plan no tiene permisos asignados.</div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-neutral-700">
                    <FaShieldAlt size={64} className="mb-4 opacity-10" />
                    <p className="font-bold">Selecciona una membresía para configurar</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* MODAL: SELECTOR PARA VINCULAR */}
      <AnimatePresence>
        {mostrandoSelector && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-6">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-neutral-900 border border-neutral-700 w-full max-w-md rounded-3xl p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-white font-black uppercase tracking-tight text-sm">Vincular Permiso</h4>
                <button onClick={() => setMostrandoSelector(false)} className="text-neutral-500 hover:text-white transition-colors"><FaTimes/></button>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {permisos.filter(p => !permisosAsignados.some(pa => pa.id_permiso === p.id_permiso)).map(p => (
                  <div key={p.id_permiso} className="w-full flex items-center gap-3 p-3 bg-neutral-800 rounded-2xl border border-neutral-700 group hover:border-blue-500/50 transition-all">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm truncate">{p.nombre_permiso}</p>
                      <p className="text-[10px] text-neutral-500 font-mono truncate">{p.codigo_permiso}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-center">
                        <span className="text-[8px] text-neutral-500 font-bold uppercase mb-0.5">Límite</span>
                        <input type="number" placeholder="0" value={limitesPendientes[p.id_permiso] || ""} onChange={(e) => setLimitesPendientes({...limitesPendientes, [p.id_permiso]: e.target.value})} className="w-16 bg-neutral-950 border border-neutral-600 rounded-lg p-1.5 text-center text-xs text-white outline-none focus:border-blue-500" />
                      </div>
                      <button onClick={() => handleVincularPermiso(p.id_permiso)} disabled={!limitesPendientes[p.id_permiso]} className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-20 transition-all"><FaPlus size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MINI MODAL: EDITAR LÍMITE */}
      <AnimatePresence>
        {editandoLimite && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 10 }} animate={{ scale: 1, y: 0 }} className="bg-neutral-900 border border-neutral-700 p-6 rounded-3xl shadow-2xl w-full max-w-[280px]">
              <p className="text-white font-black text-center mb-4 text-xs uppercase tracking-widest">Ajustar Límite</p>
              <div className="flex items-center justify-center gap-4 mb-6">
                <button onClick={() => setEditandoLimite({...editandoLimite, valor: Math.max(0, editandoLimite.valor - 1)})} className="w-10 h-10 rounded-full bg-neutral-800 text-white font-bold hover:bg-neutral-700">-</button>
                <input type="number" value={editandoLimite.valor} onChange={(e) => setEditandoLimite({...editandoLimite, valor: parseInt(e.target.value) || 0})} className="w-16 bg-transparent text-center text-2xl font-black text-blue-500 outline-none" />
                <button onClick={() => setEditandoLimite({...editandoLimite, valor: editandoLimite.valor + 1})} className="w-10 h-10 rounded-full bg-neutral-800 text-white font-bold hover:bg-neutral-700">+</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setEditandoLimite(null)} className="py-3 rounded-xl bg-neutral-800 text-neutral-400 text-xs font-bold hover:text-white">CANCELAR</button>
                <button onClick={handleActualizarLimite} className="py-3 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-blue-500 shadow-lg shadow-blue-500/20"><FaCheck /> ACEPTAR</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}