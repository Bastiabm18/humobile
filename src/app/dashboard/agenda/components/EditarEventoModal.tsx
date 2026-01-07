// app/dashboard/agenda/EditarEventoModal.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { format, addHours } from 'date-fns';
import { HiX, HiClock, HiCalendar, HiLink, HiPhotograph, HiMap, HiUser, HiPhone, HiPencil } from 'react-icons/hi';
import { updateEvent, getArtistasVisibles, getLugaresVisibles } from '../actions/actions';
import { getSupabaseBrowser } from '@/lib/supabase/supabase-client';
import { FiUploadCloud, FiX } from 'react-icons/fi';
import RespuestaModal from './RespuestaModal';
import { CalendarEvent } from '@/types/profile';

interface Profile {
  id: string;
  type: 'artist' | 'band' | 'place';
  name?: string;
  data?: {
    place_name?: string;
    band_name?: string;
    name?: string;
    integrante?: Array<{  
      id: string;
    }>;
  };
}

interface EditarEventoModalProps {
  open: boolean;
  onClose: () => void;
  profile: Profile;
  evento: CalendarEvent;
  onSuccess?: () => void;
}

export default function EditarEventoModal({ 
  open, 
  onClose, 
  profile, 
  evento,
  onSuccess 
}: EditarEventoModalProps) {
  const supabase = getSupabaseBrowser();
  
  // Estados para todos los campos
  const [form, setForm] = useState({
    title: '',
    description: '',
    id_artista: '',
    nombre_artista: '',
    id_tipo_artista: '',
    startDate: '',
    startTime: '19:00',
    endDate: '',
    endTime: '23:00',
    custom_place_name: '',
    address: '',
    organizer_name: '',
    organizer_contact: '',
    ticket_link: '',
    instagram_link: '',
    flyer_url: '',
    category: 'show',
  });

  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingPerfiles, setLoadingPerfiles] = useState(false);
  const [loadingLugares, setLoadingLugares] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tipoPerfil, setTipoPerfil] = useState(evento.tipo);
  const [perfilesVisibles, setPerfilesVisibles] = useState<any[]>([]);
  const [lugaresVisibles, setLugaresVisibles] = useState<any[]>([]);
  const [showCustomArtist, setShowCustomArtist] = useState(false);
  const [showCustomLugar, setShowCustomLugar] = useState(false);
  const [customArtistName, setCustomArtistName] = useState('');
  const [customPlaceName, setCustomPlaceName] = useState('');
  const [selectedPlaceId, setSelectedPlaceId] = useState('');
  
  // estados para el modal de respuesta
  const [modalState, setModalState] = useState({
    isOpen: false,
    mensaje: '',
    esExito: true
  });

  // Cargar datos del evento cuando se abre el modal
  useEffect(() => {
    if (open && evento) {
      cargarDatosEvento();
      cargarPerfiles();
      cargarLugares();
    }
  }, [open, evento]);

  const cargarDatosEvento = () => {
    if (!evento) return;
    
    const startDate = new Date(evento.start);
    const endDate = new Date(evento.end);
    
    // Configurar el formulario con los datos del evento
    setForm({
      title: evento.title || '',
      description: evento.description || '',
      id_artista: (evento.resource as any)?.creator_profile_id || '',
      nombre_artista: (evento.resource as any)?.nombre_artista || '',
      id_tipo_artista: (evento.resource as any)?.id_tipo_artista || '',
      startDate: format(startDate, 'yyyy-MM-dd'),
      startTime: format(startDate, 'HH:mm'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      endTime: format(endDate, 'HH:mm'),
      custom_place_name: (evento.resource as any)?.custom_place_name || '',
      address: (evento.resource as any)?.address || '',
      organizer_name: (evento.resource as any)?.organizer_name || '',
      organizer_contact: (evento.resource as any)?.organizer_contact || '',
      ticket_link: (evento.resource as any)?.ticket_link || '',
      instagram_link: (evento.resource as any)?.instagram_link || '',
      flyer_url: (evento.resource as any)?.flyer_url || '',
      category: (evento.resource as any)?.category || 'show',
    });

    // Configurar preview de imagen si existe
    if (evento.resource?.flyer_url) {
      setPreview(evento.resource.flyer_url);
    }

    // Configurar campos personalizados
    if (!form.id_artista && form.nombre_artista) {
      setShowCustomArtist(true);
      setCustomArtistName((evento.resource as any)?.nombre_artista || '');
    }

    if (evento.resource?.custom_place_name && !evento.resource?.place_profile_id) {
      setShowCustomLugar(true);
      setCustomPlaceName(evento.resource.custom_place_name);
    }

    if (evento.resource?.place_profile_id) {
      setSelectedPlaceId(evento.resource.place_profile_id);
    }
  };

  const cargarPerfiles = async () => {
    setLoadingPerfiles(true);
    try {
      const perfiles = await getArtistasVisibles();
      setPerfilesVisibles(perfiles);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingPerfiles(false);
    }
  };

  const cargarLugares = async () => {
    setLoadingLugares(true);
    try {
      const lugares = await getLugaresVisibles();
      setLugaresVisibles(lugares);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingLugares(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // Función para subir imagen del flyer (igual que en CrearEventoModal)
  const uploadFlyer = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      
      if (!file) {
        throw new Error('No se seleccionó ningún archivo');
      }

      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validImageTypes.includes(file.type)) {
        throw new Error('Formato de archivo no válido. Solo se permiten imágenes (JPG, PNG, GIF, WebP)');
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('La imagen es demasiado grande. El tamaño máximo es 5MB');
      }

      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `flyers/${fileName}`;

      console.log('Subiendo flyer a:', filePath);

      const { error: uploadError } = await supabase.storage
        .from('perfiles')
        .upload(filePath, file, { 
          upsert: true,
          cacheControl: '3600',
          contentType: file.type
        });

      if (uploadError) {
        URL.revokeObjectURL(previewUrl);
        
        console.error('Error detallado de subida:', uploadError);
        if (uploadError.message.includes('403') || uploadError.message.includes('unauthorized')) {
          throw new Error('No tienes permisos para subir imágenes. Contacta al administrador.');
        } else if (uploadError.message.includes('payload too large')) {
          throw new Error('La imagen es demasiado grande');
        } else {
          throw new Error(`Error al subir imagen: ${uploadError.message}`);
        }
      }

      const { data: urlData } = supabase.storage
        .from('perfiles')
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        throw new Error('No se pudo obtener la URL pública del flyer');
      }

      const publicUrl = urlData.publicUrl;
      console.log('URL pública generada:', publicUrl);

      setPreview(publicUrl);
      setForm(prev => ({ 
        ...prev, 
        flyer_url: publicUrl
      }));

      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);

      URL.revokeObjectURL(previewUrl);

    } catch (error: any) {
      console.error('Error en uploadFlyer:', error);
      
      const errorMessage = error.message || 'Error desconocido al subir la imagen';
      alert(`Error: ${errorMessage}`);
      
      setPreview(null);
      setForm(prev => ({ ...prev, flyer_url: '' }));
      
    } finally {
      setUploading(false);
    }
  };

  const removeFlyer = () => {
    setPreview(null);
    setForm(prev => ({ ...prev, flyer_url: '' }));
    setUploadSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!form.title.trim()) {
      alert('El título es obligatorio');
      return;
    }
    
    const startDateTime = new Date(`${form.startDate}T${form.startTime}`);
    const endDateTime = new Date(`${form.endDate}T${form.endTime}`);
    
    if (!startDateTime || !endDateTime) {
      alert('Fechas y horas son obligatorias');
      return;
    }
    
    if (startDateTime >= endDateTime) {
      alert('La fecha/hora de inicio debe ser anterior a la de fin');
      return;
    }

    setLoading(true);

    try {
      let placeProfileId = null;
    if (tipoPerfil === 'place') {
      // Si el creador es un local, usar su propio ID
      placeProfileId = profile.id;
    } else if (selectedPlaceId) {
      // Solo usar selectedPlaceId si realmente seleccionó un lugar de la lista
      // Verificar que el lugar seleccionado existe en lugaresVisibles
      const lugarSeleccionado = lugaresVisibles.find(l => l.id === selectedPlaceId);
      if (lugarSeleccionado) {
        placeProfileId = selectedPlaceId;
      } else {
        // Si no se encuentra, es un lugar personalizado
        placeProfileId = null;
      }
    }

    // Si es lugar personalizado (showCustomLugar es true), placeProfileId debe ser null
    if (showCustomLugar) {
      placeProfileId = null;
    }

      // Determinar el nombre del artista
      let artistaNombre = '';
      let artistaId = '';
      let lugarId = '';
      let lugarNombre = '';

      if (tipoPerfil === 'place') {
      // Si es local...
      lugarNombre = profile.data?.name || profile.name || '';
      if (form.id_artista === '' && customArtistName.trim()) {
        artistaNombre = customArtistName.trim();
        artistaId = '';
      } else if (form.id_artista) {
        const perfilSeleccionado = perfilesVisibles.find(p => p.id === form.id_artista);
        artistaNombre = perfilSeleccionado?.data?.name || '';
        artistaId = form.id_artista;
      }
    } else {
      // Si es artista o banda...
      artistaNombre = profile.type === 'band' 
        ? profile.data?.band_name || profile.data?.name || profile.name || ''
        : profile.data?.name || profile.name || '';
      artistaId = profile.id;

      if (showCustomLugar && customPlaceName.trim()) {
        lugarNombre = customPlaceName.trim();
      } else if (form.custom_place_name) {
        lugarNombre = form.custom_place_name;
      }
    }


      // Preparar datos del evento para actualizar
    const eventData = {
      id: evento.id,
      creator_profile_id: profile.id,
      creator_type: profile.type,
      nombre_artista: artistaNombre || profile.name || '',
      id_artista: artistaId || null, // Asegurar null si está vacío
      id_tipo_artista: perfilesVisibles.find(p => p.id === form.id_artista)?.type || null,
      integrantes: profile.type === 'band' 
        ? (profile.data?.integrante || []).map((i: any) => i.id || '')
        : [],
      title: form.title.trim(),
      description: form.description.trim(),
      fecha_hora_ini: startDateTime,
      fecha_hora_fin: endDateTime,
      place_profile_id: placeProfileId, // Usar el placeProfileId validado
      custom_place_name: showCustomLugar ? customPlaceName.trim() : (form.custom_place_name.trim() || lugarNombre || ''),
      address: form.address.trim() || '',
      organizer_name: form.organizer_name.trim() || '',
      organizer_contact: form.organizer_contact.trim() || '',
      ticket_link: form.ticket_link.trim() || '',
      instagram_link: form.instagram_link.trim() || '',
      flyer_url: form.flyer_url.trim() || '',
      category: form.category,
      updated_at: new Date().toISOString(),
    };

      console.log('Datos del evento a actualizar:', eventData);
      
      // Llamar a la acción de actualización
      const result = await updateEvent(eventData);

      setLoading(false);

      if (result?.success) {
        setModalState({
          isOpen: true,
          mensaje: 'Evento actualizado exitosamente',
          esExito: true
        });
        
        // Llamar callback si existe
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setModalState({
          isOpen: true,
          mensaje: result?.error || 'Error desconocido al actualizar el evento',
          esExito: false
        });
      }
    } catch (error: any) {
      setLoading(false);
      setModalState({
        isOpen: true,
        mensaje: 'Error: ' + error.message,
        esExito: false
      });
    }
  };

  const handleCloseModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
    if (modalState.esExito && onClose) {
      onClose();
    }
  };

  const handleAceptarModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
    if (modalState.esExito && onSuccess) {
    onSuccess(); // <-- Esto notificará al EventModal
  }
  if (modalState.esExito && onClose) {
    onClose();
  }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-100 p-4">
        {/* Contenedor principal */}
        <div className="
          bg-card rounded-2xl border border-neutral-700 
          w-full max-w-7xl
          max-h-[90vh] 
          overflow-y-auto
          md:max-h-[95vh] md:overflow-y-hidden
          flex flex-col
        ">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-700 flex-shrink-0">
            <div className="flex items-center gap-3">
              <HiPencil className="text-yellow-500" size={28} />
              <h2 className="text-xl font-bold text-white">Editar Evento</h2>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-white transition"
              disabled={loading || uploading}
            >
              <HiX size={24} />
            </button>
          </div>

          {/* Contenido con scroll solo en móvil, grid en desktop */}
          <div className="
            flex-1 overflow-y-auto custom-scrollbar 
            md:overflow-y-hidden md:grid md:grid-cols-3 md:gap-6
            p-6
          ">
            {/* Columna izquierda - Imagen y campos principales */}
            <div className="space-y-5 md:overflow-y-scroll custom-scrollbar md:pr-2">
              {/* Upload de Flyer */}
              <div className="bg-neutral-800/40 border border-neutral-700 rounded-xl p-4">
                <label className="block text-sm font-medium text-gray-300 mb-3 text-center">
                  <HiPhotograph className="inline mr-2" size={18} />
                  Flyer del Evento
                </label>
                
                <div className="flex flex-col items-center">
                  {/* Vista previa */}
                  <div className="relative mb-4">
                    {preview ? (
                      <div className="relative group">
                        <img 
                          src={preview} 
                          alt="Flyer preview" 
                          className="w-full max-w-xs h-48 object-contain rounded-lg border-2 border-yellow-600/50"
                        />
                        <button
                          type="button"
                          onClick={removeFlyer}
                          className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-full max-w-xs h-48 bg-neutral-900/80 rounded-lg border-2 border-dashed border-yellow-600/30 flex flex-col items-center justify-center gap-3">
                        <FiUploadCloud className="text-yellow-500" size={40} />
                        <p className="text-sm text-gray-400">No hay flyer</p>
                      </div>
                    )}
                  </div>

                  {/* Botón de subida */}
                  <label className="cursor-pointer">
                    <span className={`
                      px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2
                      ${uploading 
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                        : 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg'
                      }
                    `}>
                      {uploading ? 'Subiendo...' : preview ? 'Cambiar Flyer' : 'Subir Flyer'}
                      {!uploading && <FiUploadCloud size={16} />}
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      disabled={uploading}
                      onChange={uploadFlyer}
                      className="hidden"
                    />
                  </label>
                  
                  {/* Mensaje de éxito */}
                  {uploadSuccess && (
                    <p className="text-green-500 text-sm mt-2 animate-pulse">
                      ✓ Flyer subido correctamente
                    </p>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-2">JPG, PNG hasta 5MB</p>
                </div>
              </div>

              {/* Título y Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Título del evento *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Ej: Show en Rock Bar, Presentación, Ensayo..."
                  className="w-full px-4 py-3 bg-light-gray border border-neutral-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition"
                  maxLength={100}
                  required
                  disabled={loading || uploading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Detalles del evento..."
                  rows={3}
                  className="w-full px-4 py-3 bg-light-gray border border-neutral-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition resize-none"
                  maxLength={500}
                  disabled={loading || uploading}
                />
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Categoría
                </label>
                <select
                  value={form.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full px-4 py-3 bg-light-gray border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-yellow-500 transition"
                  disabled={loading || uploading}
                >
                  <option value="show">Show/Concierto</option>
                  <option value="rehearsal">Ensayo</option>
                  <option value="meeting">Reunión</option>
                  <option value="recording">Grabación</option>
                  <option value="workshop">Taller</option>
                  <option value="other">Otro</option>
                </select>
              </div>
            </div>

            {/* Columna derecha - Fechas, lugar y contactos */}
            <div className="space-y-5 mt-5 md:mt-0 md:overflow-y-auto md:pl-2">
              {/* Fechas y horas */}
              <div className="bg-neutral-800/40 border border-neutral-700 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-1">
                  <HiCalendar size={16} />
                  Fechas y Horarios *
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Inicio
                    </label>
                    <div className="flex flex-col gap-2">
                      <input
                        type="date"
                        value={form.startDate}
                        onChange={(e) => handleChange('startDate', e.target.value)}
                        className="w-full px-3 py-2 bg-light-gray border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-yellow-500 transition text-sm"
                        required
                        disabled={loading || uploading}
                      />
                      <input
                        type="time"
                        value={form.startTime}
                        onChange={(e) => handleChange('startTime', e.target.value)}
                        className="w-full px-3 py-2 bg-light-gray border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-yellow-500 transition text-sm"
                        required
                        disabled={loading || uploading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Fin
                    </label>
                    <div className="flex flex-col gap-2">
                      <input
                        type="date"
                        value={form.endDate}
                        onChange={(e) => handleChange('endDate', e.target.value)}
                        min={form.startDate}
                        className="w-full px-3 py-2 bg-light-gray border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-yellow-500 transition text-sm"
                        required
                        disabled={loading || uploading}
                      />
                      <input
                        type="time"
                        value={form.endTime}
                        onChange={(e) => handleChange('endTime', e.target.value)}
                        className="w-full px-3 py-2 bg-light-gray border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-yellow-500 transition text-sm"
                        required
                        disabled={loading || uploading}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Lugar */}
              <div className="bg-neutral-800/40 border border-neutral-700 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-1">
                  <HiMap size={16} />
                  Lugar
                </h3>

                <div className="space-y-3">
                  {/* Si es LOCAL, mostrar su info fija */}
                  {tipoPerfil === 'place' ? (
                    <div className="bg-black/50 border border-yellow-600/30 rounded-xl px-4 py-3">
                      <p className="text-white font-medium">
                        {profile.data?.place_name || 'Este local'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Local - Sede del evento</p>
                    </div>
                  ) : (
                    /* Si es ARTISTA o BANDA, mostrar select de lugares */
                    <>
                      {loadingLugares ? (
                        <div className="bg-black/50 border border-yellow-600/30 rounded-xl px-4 py-3 flex items-center gap-3">
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-yellow-500"></div>
                          <span className="text-gray-400">Cargando lugares...</span>
                        </div>
                      ) : (
                        <select
                          value={form.custom_place_name}
                          onChange={(e) => {
                            const selectedIndex = e.target.selectedIndex;
                            const selectedOption = e.target.options[selectedIndex];
                            const placeId = selectedOption.dataset.id || '';
                            handleChange('custom_place_name', e.target.value);
                            setShowCustomLugar(e.target.value === '');
                            setSelectedPlaceId(e.target.value ? placeId : '');
                            if (e.target.value !== '') {
                              setCustomArtistName('');
                            }
                          }}
                          className="w-full px-3 py-2 bg-light-gray border border-neutral-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition text-sm"
                          disabled={loading || uploading}
                        >
                          <option value="">Selecciona un lugar</option>
                          {lugaresVisibles.map((lugar) => (
                            <option 
                              key={lugar.id}
                              value={lugar.data?.place_name || ''}
                              data-id={lugar.id}
                            >
                              {lugar.data?.place_name || lugar.place_name || 'Sin nombre'}
                            </option>
                          ))}
                          <option value="">Otro lugar (especificar abajo)</option>
                        </select>
                      )}
                    </>
                  )}

                  {/* Campo para dirección (siempre visible) */}
                  <div>
                    {showCustomLugar && (
                      <div className="mt-3 animate-fadeIn">
                        <label className="block text-xs text-gray-400 mb-1">
                          Lugar del evento
                        </label>
                        <input
                          type="text"
                          value={customPlaceName}
                          onChange={(e) => setCustomPlaceName(e.target.value)}
                          placeholder="Escribe el nombre del lugar..."
                          className="w-full px-3 py-2 bg-light-gray border border-neutral-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition text-sm"
                          disabled={loading || uploading}
                        />
                      </div>
                    )}
                    
                    <label className="block text-xs text-gray-400 mb-1">
                      Dirección
                    </label>
                    <input
                      type="text"
                      value={form.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      placeholder="Dirección completa..."
                      className="w-full px-3 py-2 bg-light-gray border border-neutral-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition text-sm"
                      disabled={loading || uploading}
                    />
                  </div>
                </div>
              </div>

              {tipoPerfil === 'place' ? (
                <>
                  <div className="bg-neutral-800/40 border border-neutral-700 rounded-xl p-4">
                    <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-1">
                      <HiMap size={16} />
                      Artistas
                    </h3>  
                    {loadingPerfiles ? (
                      <div className="bg-black/50 border border-yellow-600/30 rounded-xl px-4 py-3 flex items-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-yellow-500"></div>
                        <span className="text-gray-400">Cargando perfiles...</span>
                      </div>
                    ) : (
                      <select
                        name="id_artista"
                        value={form.id_artista}
                        onChange={(e) => {
                          handleChange('id_artista', e.target.value);
                          setShowCustomArtist(e.target.value === '');
                          if (e.target.value !== '') {
                            setCustomArtistName('');
                          }
                        }}
                        className="w-full px-4 py-3 bg-light-gray border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-yellow-500 transition"
                      >
                        <option value="">Selecciona un artista/banda</option>
                        {perfilesVisibles.map((perfil) => (
                          <option key={perfil.id} value={perfil.id}>
                            {perfil.data?.name || 'Sin nombre'}
                          </option>
                        ))}
                        <option value="">Otro (especificar...)</option>
                      </select>
                    )}
                  </div>
                </>
              ) : (
                // Cuando es artista o banda, mostrar solo su info
                <div className="bg-neutral-800/40 border border-neutral-700 rounded-xl p-4">
                  <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-1">
                    <HiMap size={16} />
                    Artista/Banda del evento
                  </h3>
                  <div className="bg-black/50 border border-yellow-600/30 rounded-xl px-4 py-3">
                    <p className="text-white font-medium">
                      {profile.type === 'band' 
                        ? profile.data?.band_name || profile.data?.name || profile.name
                        : profile.data?.name || profile.name
                      }
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {profile.type === 'band' ? 'Banda' : 'Artista'} - Creador del evento
                    </p>
                  </div>
                </div>
              )}

              {showCustomArtist && (
                <div className="mt-3 animate-fadeIn">
                  <label className="block text-xs text-gray-400 mb-1">
                    Nombre del artista/banda
                  </label>
                  <input
                    type="text"
                    value={customArtistName}
                    onChange={(e) => setCustomArtistName(e.target.value)}
                    placeholder="Escribe el nombre del artista o banda..."
                    className="w-full px-3 py-2 bg-light-gray border border-neutral-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition text-sm"
                    disabled={loading || uploading}
                  />
                </div>
              )}                    
            </div>

            {/* Tercera columna - Organizador, enlaces e info */}
            <div className="space-y-5 mt-5 md:mt-0 md:overflow-y-auto custom-scrollbar md:pl-2">
              {/* Organizador */}
              <div className="bg-neutral-800/40 border border-neutral-700 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-1">
                  <HiUser size={16} />
                  Organizador
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={form.organizer_name}
                      onChange={(e) => handleChange('organizer_name', e.target.value)}
                      placeholder="Nombre del organizador..."
                      className="w-full px-3 py-2 bg-light-gray border border-neutral-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition text-sm"
                      disabled={loading || uploading}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Contacto
                    </label>
                    <input
                      type="text"
                      value={form.organizer_contact}
                      onChange={(e) => handleChange('organizer_contact', e.target.value)}
                      placeholder="Teléfono o email..."
                      className="w-full px-3 py-2 bg-light-gray border border-neutral-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition text-sm"
                      disabled={loading || uploading}
                    />
                  </div>
                </div>
              </div>

              {/* Links */}
              <div className="bg-neutral-800/40 border border-neutral-700 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-1">
                  <HiLink size={16} />
                  Enlaces
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Tickets
                    </label>
                    <input
                      type="url"
                      value={form.ticket_link}
                      onChange={(e) => handleChange('ticket_link', e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 bg-light-gray border border-neutral-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition text-sm"
                      disabled={loading || uploading}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Instagram
                    </label>
                    <input
                      type="url"
                      value={form.instagram_link}
                      onChange={(e) => handleChange('instagram_link', e.target.value)}
                      placeholder="https://instagram.com/..."
                      className="w-full px-3 py-2 bg-light-gray border border-neutral-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition text-sm"
                      disabled={loading || uploading}
                    />
                  </div>
                </div>
              </div>

              {/* Info resumen */}
              <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">Perfil asociado:</p>
                <p className="text-white font-medium text-sm">
                  {profile.name || `Perfil ${profile.type} #${profile.id.substring(0, 8)}...`}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  ID Evento: {evento.id.substring(0, 8)}...
                </p>
              </div>
            </div>
          </div>

          {/* Footer fijo con botones */}
          <div className="border-t border-neutral-700 p-4 flex-shrink-0">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-light-gray hover:bg-gray-600 text-white font-medium rounded-lg transition"
                disabled={loading || uploading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading || uploading}
                className="flex-1 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-lg transition disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading ? 'Actualizando...' : 'Actualizar Evento'}
                <HiPencil size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
      
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