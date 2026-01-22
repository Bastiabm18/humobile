// app/dashboard/agenda/CrearEventoModal.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { format, addHours } from 'date-fns';
import { HiX, HiPlus, HiClock, HiCalendar, HiLink, HiPhotograph, HiMap, HiUser, HiPhone, HiUserGroup } from 'react-icons/hi';
import {  getArtistasVisibles, getLugaresVisibles,getCategoriasVisibles, crearEvento } from '../actions/actions';
import { getSupabaseBrowser } from '@/lib/supabase/supabase-client';
import { FiUploadCloud, FiX, FiTrash2 } from 'react-icons/fi';
import RespuestaModal from './RespuestaModal';
import { categoriaEvento, EventoGuardar, ParticipanteEvento, Profile } from '@/types/profile';
import { FaCheck } from 'react-icons/fa6';

// Interfaces


interface CrearEventoModalProps {
  open: boolean;
  onClose: () => void;
  profile: Profile;
  selectedDate: Date;
}




export default function CrearEventoModal({ open, onClose, profile, selectedDate }: CrearEventoModalProps) {
  const supabase = getSupabaseBrowser();
 // console.log('crear evento perfil:' ,profile);
  // ========== ESTADOS DEL FORMULARIO ==========
  const [form, setForm] = useState<EventoGuardar>({
    titulo: '',
    descripcion: '',
    fecha_hora_ini: new Date(),
    fecha_hora_fin: null,
    id_categoria: null,
    flyer_url: null,
    video_url: null,
    id_creador: profile.id,
    creador_tipo_perfil: profile.tipo,
    id_lugar: null,
    nombre_lugar: null,
    direccion_lugar: null,
    lat_lugar: null,
    lon_lugar: null,
    id_productor: null,
    tickets_evento: null,
    es_publico: true,
    es_bloqueado: false,
    motivo_bloqueo: null,
  });

  // ========== ESTADOS PARA DATOS DINÁMICOS ==========
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estados para carga de perfiles y lugares
  const [loadingPerfiles, setLoadingPerfiles] = useState(false);
  const [loadingLugares, setLoadingLugares] = useState(false);
  const [perfilesVisibles, setPerfilesVisibles] = useState<any[]>([]);
  const [lugaresVisibles, setLugaresVisibles] = useState<any[]>([]);
  const [categoriasVisibles, setCategoriasVisibles] = useState<any[]>([]);
  const [loadingcategoria, setLoadingcategoria] = useState(false);
  
  // Estados para opciones personalizadas
  const [showCustomArtist, setShowCustomArtist] = useState(false);
  const [showCustomLugar, setShowCustomLugar] = useState(false);
  const [customArtistName, setCustomArtistName] = useState('');
  const [customPlaceName, setCustomPlaceName] = useState('');
  
  // ========== ESTADO PARA PARTICIPANTES ==========
  const [participantes, setParticipantes] = useState<ParticipanteEvento[]>([
    // El creador se agrega automáticamente si es artista o banda
    ...(profile.tipo === 'artista' || profile.tipo === 'banda' || profile.tipo === 'lugar'? [{
      id_perfil: profile.id,
      nombre: profile?.nombre  || '',
      tipo: profile.tipo
    }] : [])
  ]);
  const [categorias, setCategorias] = useState<categoriaEvento[]>([]);
  const [selectedParticipante, setSelectedParticipante] = useState<string>('');
  const [selectedCategoria, setSelectedcategoria] = useState<string>('');
  
  // ========== ESTADO PARA MODAL DE RESPUESTA ==========
  const [modalState, setModalState] = useState({
    isOpen: false,
    mensaje: '',
    esExito: true
  });

  // ========== EFECTO PARA CARGAR DATOS AL ABRIR ==========
  useEffect(() => {
    if (open) {
      cargarPerfiles();
      cargarLugares();
      cargarcategorias();
      
      // Si el creador es un lugar, asignarlo automáticamente
      if (profile.tipo === 'lugar') {
        setForm(prev => ({
          ...prev,
          id_lugar: profile.id,
          nombre_lugar: profile?.nombre || '', 
          
        }));
      }
      
      // Inicializar fechas
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const tomorrow = addHours(selectedDate, 24);
      const tomorrowStr = format(tomorrow, 'yyyy-MM-dd');
      
      setForm(prev => ({
        ...prev,
        fecha_hora_ini: `${dateStr}T19:00`,
        fecha_hora_fin: `${tomorrowStr}T20:00`
      }));
    }
  }, [open]);

  // ========== FUNCIONES PARA CARGAR DATOS ==========
  const cargarcategorias = async () => {
    setLoadingcategoria(true);
    try {
      const categorias = await getCategoriasVisibles();
      setCategoriasVisibles(categorias);
    } catch (error) {
      console.error('Error cargando categorias:', error);
    } finally {
      setLoadingcategoria(false);
    }
  };
  // ========== FUNCIONES PARA CARGAR DATOS ==========
  const cargarLugares = async () => {
    setLoadingLugares(true);
    try {
      const lugares = await getLugaresVisibles();
      setLugaresVisibles(lugares);
    } catch (error) {
      console.error('Error cargando lugares:', error);
    } finally {
      setLoadingLugares(false);
    }
  };

  const cargarPerfiles = async () => {
    setLoadingPerfiles(true);
    try {
      const perfiles = await getArtistasVisibles();
      setPerfilesVisibles(perfiles);
    } catch (error) {
      console.error('Error cargando perfiles:', error);
    } finally {
      setLoadingPerfiles(false);
    }
  };

  // ========== MANEJADORES DE CAMBIOS ==========
  const handleChange = (field: keyof EventoGuardar, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // ========== MANEJO DE PARTICIPANTES ==========
  const agregarParticipante = () => {
    if (!selectedParticipante) return;
    
    const perfilSeleccionado = perfilesVisibles.find(p => p.id === selectedParticipante);
    if (!perfilSeleccionado) return;
    
    // Verificar si ya existe
    const existe = participantes.some(p => p.id_perfil === selectedParticipante);
    if (existe) {
      alert('Este participante ya fue agregado');
      return;
    }
    
    setParticipantes(prev => [...prev, {
      id_perfil: perfilSeleccionado.id,
      nombre: perfilSeleccionado.nombre || '',
      tipo: perfilSeleccionado.tipo
    }]);
    
    setSelectedParticipante('');
  };

  const eliminarParticipante = (id: string) => {
    // No permitir eliminar al creador si es artista/banda
    if (id === profile.id && (profile.tipo === 'artista' || profile.tipo === 'banda')) {
      alert('No puedes eliminar al creador del evento');
      return;
    }
    
    setParticipantes(prev => prev.filter(p => p.id_perfil !== id));
  };

  // ========== SUBIDA DE FLYER ==========
  const uploadFlyer = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) throw new Error('No se seleccionó archivo');
      
      // Validaciones
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) throw new Error('Formato no válido');
      if (file.size > 5 * 1024 * 1024) throw new Error('Máximo 5MB');
      
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      
      // Subir a Supabase Storage
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `flyers/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('perfiles')
        .upload(filePath, file, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      const { data: urlData } = supabase.storage
        .from('perfiles')
        .getPublicUrl(filePath);
      
      setPreview(urlData.publicUrl);
      setForm(prev => ({ ...prev, flyer_url: urlData.publicUrl }));
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
      
      URL.revokeObjectURL(previewUrl);
    } catch (error: any) {
      console.error('Error subiendo flyer:', error);
      alert(`Error: ${error.message}`);
      setPreview(null);
      setForm(prev => ({ ...prev, flyer_url: null }));
    } finally {
      setUploading(false);
    }
  };

  const removeFlyer = () => {
    setPreview(null);
    setForm(prev => ({ ...prev, flyer_url: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const eliminarLugarComoParticipante = (lugarId: string) => {
  setParticipantes(prev => prev.filter(p => p.id_perfil !== lugarId));
};


  // ========== ENVÍO DEL FORMULARIO ==========
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!form.titulo.trim()) {
      alert('El título es obligatorio');
      return;
    }
    
    const startDateTime = new Date(form.fecha_hora_ini);
    const endDateTime = form.fecha_hora_fin ? new Date(form.fecha_hora_fin) : null;
    
    if (endDateTime && startDateTime >= endDateTime) {
      alert('La fecha/hora de inicio debe ser anterior a la de fin');
      return;
    }

    setLoading(true);

    try {
      // Preparar datos para el backend
      const eventData = {
        ...form,
        // Asegurar que las fechas sean strings ISO
        fecha_hora_ini: startDateTime.toISOString(),
        fecha_hora_fin: endDateTime?.toISOString() || null,
        // Si hay lugar personalizado, usar esos datos
        ...(showCustomLugar && customPlaceName && {
          nombre_lugar: customPlaceName,
          id_lugar: null
        }),
        id_categoria: selectedCategoria || null
        

      };

      console.log('Datos del evento:', eventData);
      console.log('Participantes:', participantes);
      
      // Llamar a la acción del servidor (debes crear esta función)
       const result = await crearEvento(eventData, participantes);
      
      setLoading(false);
      setModalState({
        isOpen: true,
        mensaje: 'Evento creado exitosamente',
        esExito: true
      });
      
    } catch (error: any) {
      setLoading(false);
      setModalState({
        isOpen: true,
        mensaje: 'Error: ' + error.message,
        esExito: false
      });
    }
  };

  // ========== MANEJADORES DEL MODAL DE RESPUESTA ==========
  const handleCloseModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
    if (modalState.esExito) onClose();
  };

  const handleAceptarModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
    if (modalState.esExito) onClose();
  };

  if (!open) return null;

  // ========== RENDERIZADO ==========
  return (
    <>
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-neutral-800 rounded-2xl border border-neutral-700 w-full max-w-7xl max-h-[90vh] overflow-y-auto md:max-h-[95vh] md:overflow-y-hidden flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-700">
            <div className="flex items-center gap-3">
              <HiPlus className="text-green-500" size={28} />
              <h2 className="text-xl font-bold text-white">Crear Nuevo Evento</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition">
              <HiX size={24} />
            </button>
          </div>

          {/* Contenido principal - Grid de 3 columnas */}
          <div className="flex-1 overflow-y-auto custom-scrollbar md:overflow-y-hidden md:grid md:grid-cols-3 md:gap-6 p-6">
            
            {/* Columna 1: Información básica */}
            <div className="space-y-5 md:overflow-y-scroll custom-scrollbar md:pr-2">
              {/* Flyer */}
              <div className="bg-neutral-800/40 border border-neutral-700 rounded-xl p-4">
                <label className="block text-sm font-medium text-gray-300 mb-3 text-center">
                  <HiPhotograph className="inline mr-2" size={18} />
                  Flyer del Evento
                </label>
                <div className="flex flex-col items-center">
                  {preview ? (
                    <div className="relative mb-4 group">
                      <img src={preview} alt="Flyer preview" className="w-full max-w-xs h-48 object-contain rounded-lg border-2 border-green-600/50" />
                      <button onClick={removeFlyer} className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition">
                        <FiX size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-full max-w-xs h-48 bg-neutral-900/80 rounded-lg border-2 border-dashed border-green-600/30 flex flex-col items-center justify-center gap-3">
                      <FiUploadCloud className="text-green-500" size={40} />
                      <p className="text-sm text-gray-400">Subir flyer</p>
                    </div>
                  )}
                  <label className="cursor-pointer">
                    <span className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${uploading ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white shadow-lg'}`}>
                      {uploading ? 'Subiendo...' : preview ? 'Cambiar Flyer' : 'Subir Flyer'}
                      {!uploading && <FiUploadCloud size={16} />}
                    </span>
                    <input ref={fileInputRef} type="file" accept="image/*" disabled={uploading} onChange={uploadFlyer} className="hidden" />
                  </label>
                  {uploadSuccess && <p className="text-green-500 text-sm mt-2 animate-pulse">✓ Flyer subido correctamente</p>}
                  <p className="text-xs text-gray-500 mt-2">JPG, PNG hasta 5MB</p>
                </div>
              </div>

              {/* Título y Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Título del evento *</label>
                <input type="text" value={form.titulo} onChange={(e) => handleChange('titulo', e.target.value)} placeholder="Ej: Show en Rock Bar..." className="w-full px-4 py-3 bg-neutral-600 border border-neutral-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Descripción *</label>
                <textarea value={form.descripcion} onChange={(e) => handleChange('descripcion', e.target.value)} placeholder="Detalles del evento..." rows={3} className="w-full px-4 py-3 bg-neutral-600 border border-neutral-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition resize-none" maxLength={500} required />
              </div>

              {/* Categoría */}
                  <div className="flex gap-2 mb-5">
                    <select value={selectedCategoria} onChange={(e) => setSelectedcategoria(e.target.value)} className="flex-1 px-3 py-2 bg-neutral-600 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-green-500 transition text-sm">
                      <option value="">Agregar categoría</option>
                      {categoriasVisibles
                        .filter(p => !categorias.some(part => part.id_categoria === p.id_categoria))
                        .map((categoria) => (
                          <option key={categoria.id} value={categoria.id_categoria}>
                            {categoria.nombre_categoria || 'Sin nombre'} 
                          </option>
                        ))
                      }
                    </select>
             
                  </div>
            </div>

            {/* Columna 2: Fechas, Lugar y Participantes */}
            <div className="space-y-5 mt-5 md:mt-0 md:overflow-y-auto custom-scrollbar md:pl-2">
              {/* Fechas */}
              <div className="bg-neutral-800/40 border border-neutral-700 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-1">
                  <HiCalendar size={16} /> Fechas y Horarios *
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Inicio</label>
                    <input type="datetime-local" value={form.fecha_hora_ini as string} onChange={(e) => handleChange('fecha_hora_ini', e.target.value)} className="w-full px-3 py-2 bg-neutral-600 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-green-500 transition text-sm" required />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Fin</label>
                    <input type="datetime-local" value={form.fecha_hora_fin as string || ''} onChange={(e) => handleChange('fecha_hora_fin', e.target.value || null)} className="w-full px-3 py-2 bg-neutral-600 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-green-500 transition text-sm" />
                  </div>
                </div>
              </div>

                  {/* Lugar */}  
           <div className="bg-neutral-800/40 border border-neutral-700 rounded-xl p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-1">
              <HiMap size={16} /> Lugar
            </h3>
            <div className="space-y-3">
              {/* Si es LOCAL, mostrar info fija SIN posibilidad de cambiar */}
              {profile.tipo === 'lugar' ? (
                <div className="space-y-2">
                  <div className="bg-black/50 border border-green-600/30 rounded-xl px-4 py-3">
                    <p className="text-white font-medium">
                      {profile?.nombre || 'Este lugar'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Local - Sede del evento (asignado automáticamente)</p>
                  </div>
                  <p className="text-xs text-yellow-500">
                    ⚠️ Como eres un local, este será el lugar del evento
                  </p>
                </div>
              ) : (
                /* Si NO es local, mostrar selector de lugares */
                <>
                  {loadingLugares ? (
                    <div className="bg-black/50 border border-green-600/30 rounded-xl px-4 py-3 flex items-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-green-500"></div>
                      <span className="text-gray-400">Cargando lugares...</span>
                    </div>
                  ) : (
                    <>
                      <select
                          value={form.id_lugar || ''}
                          onChange={(e) => {
                            const lugarId = e.target.value;
                            console.log('Lugar seleccionado:', lugarId);

                            if (lugarId === '') {
                              // Si selecciona "Otro lugar"
                              setShowCustomLugar(true);
                              setForm(prev => ({
                                ...prev,
                                id_lugar: null,
                                nombre_lugar: null,
                                direccion_lugar: null,
                                lat_lugar: null,
                                lon_lugar: null
                              }));

                              // Remover cualquier lugar que haya sido agregado como participante
                              setParticipantes(prev => prev.filter(p => 
                                lugaresVisibles.findIndex(l => l.id === p.id_perfil) === -1
                              ));
                            } else {
                              // Si selecciona un lugar de la lista
                              setShowCustomLugar(false);
                              const lugar = lugaresVisibles.find(l => l.id === lugarId);

                              if (lugar) {
                                setForm(prev => ({
                                  ...prev,
                                  id_lugar: lugarId,
                                  nombre_lugar: lugar.nombre || '',
                                  direccion_lugar: lugar.direccion || '',
                                  lat_lugar: lugar.lat || null,
                                  lon_lugar: lugar.lon || null
                                }));

                                // Agregar el lugar como participante
                                const lugarComoParticipante = {
                                  id_perfil: lugarId,
                                  nombre: lugar.nombre || '',
                                  tipo: lugar.tipo
                                };

                                // Verificar si ya está en la lista
                                const yaExiste = participantes.some(p => p.id_perfil === lugarId);

                                if (!yaExiste) {
                                  setParticipantes(prev => [...prev, lugarComoParticipante]);
                                }
                              }
                            }
                          }}
                          className="w-full px-3 py-2 bg-neutral-600 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-green-500 transition text-sm"
                          disabled={form.id_lugar !== null && form.id_lugar !== ''}
                        >
                          <option value="">Seleccionar un lugar</option>
                          {lugaresVisibles.map((lugar) => (
                            <option 
                              key={lugar.id} 
                              value={lugar.id}  
                              disabled={form.id_lugar === lugar.id}
                            >
                              {lugar.nombre || 'Sin nombre'}
                            </option>
                          ))}
                          <option value="">Otro lugar (especificar)</option>
                        </select>
                      
                      {/* Si ya seleccionó un lugar, mostrar info y opción para cambiar */}
                      {form.id_lugar && !showCustomLugar && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between bg-black/50 border border-green-600/30 rounded-xl px-4 py-3">
                            <div>
                              <p className="text-white font-medium">
                                {lugaresVisibles.find(l => l.id === form.id_lugar)?.nombre || 'Lugar seleccionado'}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">Lugar asignado al evento</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setForm(prev => ({
                                  ...prev,
                                  id_lugar: null,
                                  nombre_lugar: null,
                                  direccion_lugar: null
                                }));
                                setShowCustomLugar(false);
                              }}
                              className="p-1 text-red-400 hover:text-red-300"
                            >
                              <FiX size={16} />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Campos para lugar personalizado */}
                      {showCustomLugar && (
                        <div className="space-y-2 mt-3 animate-fadeIn">
                          <input
                            type="text"
                            value={form.nombre_lugar || ''}
                            onChange={(e) => handleChange('nombre_lugar', e.target.value)}
                            placeholder="Nombre del lugar..."
                            className="w-full px-3 py-2 bg-neutral-600 border border-neutral-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition text-sm"
                          />
                          <input
                            type="text"
                            value={form.direccion_lugar || ''}
                            onChange={(e) => handleChange('direccion_lugar', e.target.value)}
                            placeholder="Dirección completa..."
                            className="w-full px-3 py-2 bg-neutral-600 border border-neutral-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition text-sm"
                          />
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>

              {/* Participantes */}
              <div className="bg-neutral-800/40 border border-neutral-700 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-1">
                  <HiUserGroup size={16} /> Participantes
                </h3>
                <div className="space-y-3">
                  {/* Lista de participantes */}
                  {participantes.length > 0 && (
                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                      {participantes.map((participante) => (
                        <div key={participante.id_perfil} className="flex items-center justify-between bg-neutral-900/50 border border-neutral-700 rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <HiUser className="text-green-400" />
                            <div>
                              <p className="text-white text-sm">{participante.nombre}</p>
                              <p className="text-xs text-gray-400 capitalize">{participante.tipo}</p>
                            </div>
                          </div>
                          {participante.id_perfil !== profile.id && (
                            <button type="button" onClick={() => eliminarParticipante(participante.id_perfil)} className="p-1 text-red-400 hover:text-red-300">
                              <FiTrash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Agregar nuevo participante */}
                  <div className="flex gap-2">
                    <select value={selectedParticipante} onChange={(e) => setSelectedParticipante(e.target.value)} className="flex-1 px-3 py-2 bg-neutral-600 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-green-500 transition text-sm">
                      <option value="">Agregar participante</option>
                      {perfilesVisibles
                        .filter(p => !participantes.some(part => part.id_perfil === p.id))
                        .map((perfil) => (
                          <option key={perfil.id} value={perfil.id}>
                            {perfil.nombre || 'Sin nombre'} | {perfil.tipo.toUpperCase()}
                          </option>
                        ))
                      }
                    </select>
                    <button type="button" onClick={agregarParticipante} disabled={!selectedParticipante} className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/30 disabled:cursor-not-allowed text-white rounded-lg">
                      <HiPlus size={20} />
                    </button>
                  </div>

                  {/* Opción para artista personalizado */}
                  {(profile.tipo === 'lugar' || showCustomArtist) && (
                    <div className="mt-3">
                      <label className="block text-xs text-gray-400 mb-1">Artista/banda personalizado</label>
                      <input type="text" value={customArtistName} onChange={(e) => setCustomArtistName(e.target.value)} placeholder="Nombre del artista/banda..." className="w-full px-3 py-2 bg-neutral-600 border border-neutral-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition text-sm" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Columna 3: Información adicional */}
            <div className="space-y-5 mt-5 md:mt-0 md:overflow-y-auto custom-scrollbar md:pl-2">
              {/* Tickets y Enlaces */}
              <div className="bg-neutral-800/40 border border-neutral-700 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-1">
                  <HiLink size={16} /> Tickets y Enlaces
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Enlace a tickets</label>
                    <input type="url" value={form.tickets_evento || ''} onChange={(e) => handleChange('tickets_evento', e.target.value)} placeholder="https://..." className="w-full px-3 py-2 bg-neutral-600 border border-neutral-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Video del evento (URL)</label>
                    <input type="url" value={form.video_url || ''} onChange={(e) => handleChange('video_url', e.target.value)} placeholder="https://youtube.com/..." className="w-full px-3 py-2 bg-neutral-600 border border-neutral-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition text-sm" />
                  </div>
                </div>
              </div>

              {/* Productor (opcional) */}
              <div className="bg-neutral-800/40 border border-neutral-700 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-1">
                  <HiUser size={16} /> Productor (opcional)
                </h3>
                <select value={form.id_productor || ''} onChange={(e) => handleChange('id_productor', e.target.value || null)} className="w-full px-3 py-2 bg-neutral-600 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-green-500 transition text-sm">
                  <option value="">Seleccionar productor</option>
                  {/* Aquí se cargarían los perfiles de tipo 'productor' */}
                </select>
              </div>

              {/* Información del creador */}
              <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">Creador del evento:</p>
                <p className="text-white font-medium text-sm capitalize">{profile.nombre || `Perfil ${profile.tipo}`}</p>
                <p className="text-xs text-gray-400 mt-2">Tipo: {profile.tipo}</p>
                <p className="text-xs text-gray-400">Fecha seleccionada: {format(selectedDate, 'dd/MM/yyyy')}</p>
              </div>
            </div>
          </div>

          {/* Footer con botones */}
          <div className="border-t border-neutral-700 p-4">
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 py-3 bg-neutral-600 hover:bg-gray-600 text-white font-medium rounded-lg transition" disabled={loading || uploading}>
                Cancelar
              </button>
              <button type="button" onClick={handleSubmit} disabled={loading || uploading} className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition disabled:opacity-70 flex items-center justify-center gap-2">
                {loading ? 'Creando...' : 'Crear Evento'}
                <HiPlus size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de respuesta */}
      <RespuestaModal
        isOpen={modalState.isOpen}
        mensaje={modalState.mensaje}
        esExito={modalState.esExito}
        onClose={handleCloseModal}
        onAceptar={handleAceptarModal}
      />
    </>
  );
}