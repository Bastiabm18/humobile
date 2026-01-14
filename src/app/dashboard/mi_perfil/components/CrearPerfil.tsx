// app/dashboard/mi_perfil/CrearPerfil.tsx
'use client';

import { Perfil, PerfilSelect } from '@/types/profile';
import { 
  FaBuilding,
  FaPhone,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaVideo,
  FaUpload,
  FaGlobe,
  FaMap,
  FaLocationArrow,
  FaSave,
  FaUser,
  FaUsers,
  FaHeadphones,
  FaTrash,
  FaPlus,
  FaBriefcase,
  FaMapMarkerAlt
} from 'react-icons/fa';
import { FaCheck, FaCrown, FaUser as FaUserSolid } from 'react-icons/fa6';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase/supabase-client';
import { FiUploadCloud, FiX, FiGlobe } from 'react-icons/fi';
import LocationPickerMap from './LocationPickerMap';
import { GeoData } from '@/types/profile';
import { getPerfilesArtistaVisibles,getPerfilesRepresentanteVisibles  } from '../actions/actions';
import { useRouter } from 'next/navigation';

interface CrearPerfilProps {
  userId: string;
  onSave: (nuevoPerfil: Omit<Perfil, 'id_perfil' | 'creado_en' | 'actualizado_en'>) => Promise<void>;
  onCancel: () => void;
  geoData?: GeoData;
  membresia: string;
}



export default function CrearPerfil({ userId, onSave, onCancel, geoData,membresia }: CrearPerfilProps) {
  // Estado inicial para un nuevo perfil
  const [formData, setFormData] = useState<Omit<Perfil, 'id_perfil' | 'creado_en' | 'actualizado_en'>>({
    usuario_id: userId,
    tipo_perfil: 'artista' as const,
    nombre: '',
    email: '',
    direccion: '',
    lat: null,
    lon: null,
    telefono_contacto: '',
    imagen_url: '',
    video_url: '',
    perfil_visible: true,
    id_comuna: '',
    id_region: '',
    id_pais: '',
    artista_data: {},
    banda_data: {},
    local_data: {},
    productor_data: {},
    representante_data: {},
    integrantes_perfil: [],
    representados_perfil: []
  });

  // Estados para selección dinámica
  const [integrantesSeleccionados, setIntegrantesSeleccionados] = useState<string[]>([]);
  const [representadosSeleccionados, setRepresentadosSeleccionados] = useState<string[]>([]);
  const [nuevoIntegrante, setNuevoIntegrante] = useState<string>('');
  const [nuevoRepresentado, setNuevoRepresentado] = useState<string>('');
  const router = useRouter();

  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [tempVideoUrl, setTempVideoUrl] = useState<string>('');
  const [showMapModal, setShowMapModal] = useState(false);
  const [filteredRegiones, setFilteredRegiones] = useState<Array<{id: string, name: string}>>([]);
  const [filteredComunas, setFilteredComunas] = useState<Array<{id: string, name: string}>>([]);
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState({
    pais: '',
    region: '',
    comuna: ''
  });

  // Estado para artistas disponibles (SOLO artistas como dice tu función)
  const [artistasDisponibles, setArtistasDisponibles] = useState<PerfilSelect[]>([]);
  const [cargandoArtistas, setCargandoArtistas] = useState(false);
  
  const supabase = getSupabaseBrowser();

  // Tipos de perfil disponibles
  
  const tiposPerfil = [
    { id: 'artista', label: 'Artista/Solista', icon: <FaUserSolid />, color: 'bg-blue-500' },
    { id: 'banda', label: 'Grupo/Banda', icon: <FaUsers />, color: 'bg-purple-500' },
    { id: 'local', label: 'Espacio/Lugar', icon: <FaBuilding />, color: 'bg-green-500' },
    { id: 'productor', label: 'Productor', icon: <FaHeadphones />, color: 'bg-yellow-500' },
    { id: 'representante', label: 'Representante', icon: <FaBriefcase />, color: 'bg-red-500' }
  ];
  

  // Cargar artistas visibles cuando es tipo banda
  useEffect(() => {
    if (formData.tipo_perfil === 'banda' || formData.tipo_perfil === 'representante') {
      cargarPerfilesDisponibles();
    } else {
      setArtistasDisponibles([]);
    }
  }, [formData.tipo_perfil]);

  useEffect(() => {
    // Actualizar formData con los arrays seleccionados
    setFormData(prev => ({
      ...prev,
      integrantes_perfil: integrantesSeleccionados,
      representados_perfil: representadosSeleccionados
    }));
  }, [integrantesSeleccionados, representadosSeleccionados]);

  const cargarPerfilesDisponibles = async () => {
    try {
      setCargandoArtistas(true);
      if (formData.tipo_perfil === 'banda') {
      // Para banda: solo artistas
      const perfiles = await getPerfilesArtistaVisibles();
      setArtistasDisponibles(perfiles);
    } else if (formData.tipo_perfil === 'representante') {
      // Para representante: artistas Y bandas
      const perfiles = await getPerfilesRepresentanteVisibles();
      setArtistasDisponibles(perfiles);
    } else {
      setArtistasDisponibles([]);
    }
    } catch (error) {
      console.error('Error cargando artistas:', error);
      setArtistasDisponibles([]);
    } finally {
      setCargandoArtistas(false);
    }
  };

  // Inicializar datos de ubicación cuando hay geoData
  useEffect(() => {
    if (geoData && formData.id_pais) {
      const regionesFiltradas = geoData.regiones
        .filter(region => region.parentId === formData.id_pais)
        .map(region => ({ id: region.id, name: region.name }));
      setFilteredRegiones(regionesFiltradas);
    }
  }, [geoData, formData.id_pais]);

  // Filtrar comunas cuando cambia la región
  useEffect(() => {
    if (geoData && formData.id_region) {
      const comunasFiltradas = geoData.comunas
        .filter(comuna => comuna.parentId === formData.id_region)
        .map(comuna => ({ id: comuna.id, name: comuna.name }));
      setFilteredComunas(comunasFiltradas);
    }
  }, [geoData, formData.id_region]);

  const getTipoColor = () => {
    switch (formData.tipo_perfil) {
      case 'artista': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'banda': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'local': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'productor': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'representante': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
    }
  };

  const handlePaisChange = (idPais: string) => {
    setFormData(prev => ({ 
      ...prev, 
      id_pais: idPais,
      id_region: '',
      id_comuna: ''
    }));

    if (geoData) {
      const pais = geoData.paises.find(p => p.id === idPais);
      setUbicacionSeleccionada(prev => ({ ...prev, pais: pais?.name || '', region: '', comuna: '' }));
      setFilteredRegiones([]);
      setFilteredComunas([]);
    }
  };

  const handleRegionChange = (idRegion: string) => {
    setFormData(prev => ({ 
      ...prev, 
      id_region: idRegion,
      id_comuna: ''
    }));
  };

  const handleComunaChange = (idComuna: string) => {
    setFormData(prev => ({ ...prev, id_comuna: idComuna }));
  };

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>): Promise<string | null> => {
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

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('La imagen es demasiado grande. El tamaño máximo es 5MB');
      }

      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `perfiles/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('perfiles')
        .upload(filePath, file, { 
          upsert: true,
          cacheControl: '3600',
          contentType: file.type
        });

      if (uploadError) {
        URL.revokeObjectURL(previewUrl);
        throw new Error(`Error al subir imagen: ${uploadError.message}`);
      }

      const { data: urlData } = supabase.storage
        .from('perfiles')
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        throw new Error('No se pudo obtener la URL pública de la imagen');
      }

      const publicUrl = urlData.publicUrl;

      setPreview(publicUrl);
      setFormData(prev => ({ 
        ...prev, 
        imagen_url: publicUrl
      }));

      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);

      URL.revokeObjectURL(previewUrl);

      return publicUrl;

    } catch (error: any) {
      console.error('Error en uploadImage:', error);
      alert(`Error: ${error.message || 'Error desconocido al subir la imagen'}`);
      
      setPreview(null);
      setFormData(prev => ({ ...prev, imagen_url: '' }));
      
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData(prev => ({ 
      ...prev, 
      lat: lat,
      lon: lng 
    }));
  };

  const handleTipoPerfilChange = (tipo: Perfil['tipo_perfil']) => {
    setFormData(prev => ({ ...prev, tipo_perfil: tipo }));
  };

  // Funciones para manejar integrantes (para banda)
  const agregarIntegrante = () => {
    if (nuevoIntegrante && !integrantesSeleccionados.includes(nuevoIntegrante)) {
      setIntegrantesSeleccionados([...integrantesSeleccionados, nuevoIntegrante]);
      setNuevoIntegrante('');
    }
  };

  const eliminarIntegrante = (id: string) => {
    setIntegrantesSeleccionados(integrantesSeleccionados.filter(item => item !== id));
  };

  // Funciones para manejar representados (para representante)
  const agregarRepresentado = () => {
    if (nuevoRepresentado && !representadosSeleccionados.includes(nuevoRepresentado)) {
      setRepresentadosSeleccionados([...representadosSeleccionados, nuevoRepresentado]);
      setNuevoRepresentado('');
    }
  };

  const eliminarRepresentado = (id: string) => {
    setRepresentadosSeleccionados(representadosSeleccionados.filter(item => item !== id));
  };

  const handleSave = async () => {
    // Validaciones básicas
    if (!formData.nombre.trim()) {
      alert('El nombre del perfil es obligatorio');
      return;
    }

    if (!formData.id_pais || !formData.id_region || !formData.id_comuna) {
      alert('Debe seleccionar país, región y comuna');
      return;
    }

    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error al crear perfil:', error);
      alert('Error al crear el perfil. Intenta nuevamente.');
    }
  };

  // Renderizar campos adicionales según tipo
  const renderCamposAdicionales = () => {
    switch (formData.tipo_perfil) {
      case 'banda':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">
                Seleccionar Artistas como Integrantes
              </label>
              
              {/* Select para agregar nuevo integrante */}
              <div className="flex gap-2 mb-4">
                {cargandoArtistas ? (
                  <div className="flex-1 bg-black/50 border border-purple-600/30 rounded-xl px-4 py-3 flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-purple-500"></div>
                    <span className="text-gray-400">Cargando artistas...</span>
                  </div>
                ) : (
                  <select
                    value={nuevoIntegrante}
                    onChange={(e) => setNuevoIntegrante(e.target.value)}
                    className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-white"
                    disabled={artistasDisponibles.length === 0}
                  >
                    <option value="">Seleccionar artista</option>
                    {artistasDisponibles.map((artista) => (
                      <option key={artista.id_perfil} value={artista.id_perfil}>
                        {artista.nombre} | {artista.tipo_perfil}
                      </option>
                    ))}
                  </select>
                )}
                
                <button
                  type="button"
                  onClick={agregarIntegrante}
                  disabled={!nuevoIntegrante}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/30 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2"
                >
                  <FaPlus className="w-4 h-4" />
                  Agregar
                </button>
              </div>

              {/* Lista de integrantes seleccionados */}
              {integrantesSeleccionados.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-neutral-400 mb-2">Integrantes seleccionados:</h4>
                  <div className="space-y-2">
                    {integrantesSeleccionados.map(id => {
                      const artista = artistasDisponibles.find(a => a.id_perfil === id);
                      return (
                        <div key={id} className="flex items-center justify-between bg-neutral-900/50 border border-neutral-700 rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <FaUser className="text-purple-400" />
                            <span className="text-white">{artista?.nombre || 'Artista'}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => eliminarIntegrante(id)}
                            className="p-1 text-red-400 hover:text-red-300"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'representante':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">
                Seleccionar Artistas como Representados
              </label>
              
              {/* Select para agregar nuevo representado */}
              <div className="flex gap-2 mb-4">
                {cargandoArtistas ? (
                  <div className="flex-1 bg-black/50 border border-red-600/30 rounded-xl px-4 py-3 flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-red-500"></div>
                    <span className="text-gray-400">Cargando artistas...</span>
                  </div>
                ) : (
                  <select
                    value={nuevoRepresentado}
                    onChange={(e) => setNuevoRepresentado(e.target.value)}
                    className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-white"
                    disabled={artistasDisponibles.length === 0}
                  >
                    <option value="">Seleccionar perfil</option>
                    {artistasDisponibles.map((artista) => (
                      <option key={artista.id_perfil} value={artista.id_perfil}>
                        {artista.nombre} | {artista.tipo_perfil}
                      </option>
                    ))}
                  </select>
                )}
                
                <button
                  type="button"
                  onClick={agregarRepresentado}
                  disabled={!nuevoRepresentado}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/30 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2"
                >
                  <FaPlus className="w-4 h-4" />
                  Agregar
                </button>
              </div>

              {/* Lista de representados seleccionados */}
              {representadosSeleccionados.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-neutral-400 mb-2">Representados seleccionados:</h4>
                  <div className="space-y-2">
                    {representadosSeleccionados.map(id => {
                      const artista = artistasDisponibles.find(a => a.id_perfil === id);
                      return (
                        <div key={id} className="flex items-center justify-between bg-neutral-900/50 border border-neutral-700 rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <FaUser className="text-red-400" />
                            <span className="text-white">{artista?.nombre || 'Artista'}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => eliminarRepresentado(id)}
                            className="p-1 text-red-400 hover:text-red-300"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-neutral-800 border border-neutral-700 rounded-2xl overflow-hidden shadow-xl"
      >
        {/* Header con selector de tipo y nombre */}
        <div className="relative h-56 overflow-hidden bg-gradient-to-br from-neutral-900 to-neutral-800">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items justify-center text-center">
              {preview ? (
                <div className="mb-6">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-full mx-auto border-4 border-neutral-700"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 mx-auto bg-neutral-900 border-4 border-neutral-700 rounded-full flex items-center justify-center mb-6">
                  <div className="text-6xl text-neutral-700">
                    {formData.tipo_perfil === 'artista' ? <FaUserSolid className="w-16 h-16" /> :
                     formData.tipo_perfil === 'banda' ? <FaUsers className="w-16 h-16" /> :
                     formData.tipo_perfil === 'local' ? <FaBuilding className="w-16 h-16" /> :
                     formData.tipo_perfil === 'productor' ? <FaHeadphones className="w-16 h-16" /> :
                     <FaBriefcase className="w-16 h-16" />}
                  </div>
                </div>
              )}
              
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                className="text-3xl font-bold text-white mb-4 bg-transparent border-none outline-none text-center w-full max-w-md mx-auto"
                placeholder="Nombre del perfil"
                required
              />
            </div>
          </div>
          
          {/* Botón para subir imagen */}
          <div className="absolute top-4 right-4">
            <label className="cursor-pointer">
              <div className="px-4 py-2 bg-sky-800/80 hover:bg-sky-700/80 border border-sky-700 text-sky-200 rounded-full text-sm font-medium flex items-center gap-2 backdrop-blur-sm transition-colors">
                <FiUploadCloud className="w-4 h-4" />
                {uploading ? 'Subiendo...' : preview ? 'Cambiar imagen' : 'Subir imagen'}
              </div>
              <input
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={uploadImage}
                className="hidden"
              />
            </label>
          </div>
          
          {uploadSuccess && (
            <div className="absolute top-4 left-4 px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-sm font-medium backdrop-blur-sm flex items-center gap-2">
              <FaCheck className="w-4 h-4" />
              Imagen subida
            </div>
          )}
        </div>

        {/* Contenido principal */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Columna izquierda */}
            <div className="space-y-6">
              {/* Tipo de Perfil */}
              <div className="bg-neutral-900/50 border border-neutral-700 rounded-xl p-5">
                <h2 className="text-xl font-semibold text-white mb-5">Tipo de Perfil</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
             {tiposPerfil.map((tipo) => {
                  // Verificar si este tipo requiere PREMIUM para usuarios no PREMIUM
                  const requierePremium = membresia !== 'PREMIUM' && 
                    (tipo.id === 'productor' || tipo.id === 'representante');
                  const estaSeleccionado = formData.tipo_perfil === tipo.id;

                  return (
                    <button
                      key={tipo.id}
                      type="button"
                      onClick={() => {
                        if (!requierePremium) {
                          handleTipoPerfilChange(tipo.id as Perfil['tipo_perfil']);
                        }
                      }}
                      disabled={requierePremium}
                      className={`
                        flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all
                        relative group
                        ${estaSeleccionado 
                          ? `${tipo.color.replace('bg-', '')}/20 text-white border-${tipo.color.replace('bg-', '')}/50 bg-${tipo.color.replace('bg-', '')}/10` 
                          : 'bg-neutral-800/50 text-neutral-400 border-neutral-700'
                        }
                        ${!estaSeleccionado && !requierePremium ? 'hover:border-neutral-600 hover:text-neutral-300' : ''}
                        ${requierePremium ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      {/* Badge PREMIUM para tipos que lo requieren */}
                      {requierePremium && (
                        <div className="absolute -top-2 -right-2 z-10">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-yellow-500/90 text-yellow-100 border border-yellow-500 shadow-lg">
                            <FaCrown className="w-3 h-3 mr-1" />
                            PREMIUM
                          </span>
                        </div>
                      )}

                      <div className={`
                        text-2xl mb-2 transition-transform
                        ${requierePremium ? '' : 'group-hover:scale-110'}
                      `}>
                        {tipo.icon}
                      </div>
                      
                      <span className="text-xs font-medium text-center">{tipo.label}</span>
                      
                      {/* Tooltip para tipos PREMIUM */}
                      {requierePremium && (
                        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 hidden group-hover:block z-20">
                          <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-3 shadow-xl whitespace-nowrap">
                            <div className="flex items-center gap-2 text-yellow-400 font-medium">
                              <FaCrown className="w-3 h-3" />
                              <span className="text-xs">Requiere cuenta PREMIUM</span>
                            </div>
                            <div className="text-xs text-neutral-300 mt-1">
                              Actualiza tu plan para desbloquear
                            </div>
                          </div>
                          {/* Flecha del tooltip */}
                          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                            <div className="w-3 h-3 bg-neutral-900 border-l border-t border-neutral-700 rotate-45"></div>
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}

                    {/* Mensaje informativo debajo de los botones */}
                    {membresia !== 'PREMIUM' && (
                      <div className="col-span-5 p-4 bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20 rounded-xl mt-2">
                        <div className="flex items-center justify-center gap-3">
                          <div className="p-2 bg-yellow-500/20 rounded-lg">
                            <FaCrown className="w-5 h-5 text-yellow-400" />
                          </div>
                          <div className="text-center">
                            <p className="text-yellow-400 font-medium text-sm">
                              Actualiza a PREMIUM para desbloquear todos los tipos de perfil
                            </p>
                            <p className="text-neutral-400 text-xs mt-1">
                              Los perfiles de Productor y Representante están disponibles solo para usuarios PREMIUM
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                             router.push('/dashboard/membresia');
                            }}
                            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                          >
                            <FaCrown className="w-4 h-4" />
                            Actualizar Plan
                          </button>
                        </div>
                      </div>
                    )}
                </div>
                <div className={`
                  mt-4 inline-flex items-center gap-2 px-4 py-2
                  ${getTipoColor()}
                  rounded-full text-sm font-semibold backdrop-blur-sm
                `}>
                  {formData.tipo_perfil === 'artista' ? <FaUserSolid className="w-4 h-4" /> :
                   formData.tipo_perfil === 'banda' ? <FaUsers className="w-4 h-4" /> :
                   formData.tipo_perfil === 'local' ? <FaBuilding className="w-4 h-4" /> :
                   formData.tipo_perfil === 'productor' ? <FaHeadphones className="w-4 h-4" /> :
                   <FaBriefcase className="w-4 h-4" />}
                  <span className="capitalize">
                    {tiposPerfil.find(t => t.id === formData.tipo_perfil)?.label}
                  </span>
                </div>
              </div>

              {/* Campos adicionales según tipo */}
              {(formData.tipo_perfil === 'banda' || formData.tipo_perfil === 'representante') && (
                <div className="bg-neutral-900/50 border border-neutral-700 rounded-xl p-5">
                  <h2 className="text-xl font-semibold text-white mb-5">
                    {formData.tipo_perfil === 'banda' ? 'Integrantes' : 'Artistas Representados'}
                  </h2>
                  {renderCamposAdicionales()}
                </div>
              )}

              {/* Contacto */}
              <div className="bg-neutral-900/50 border border-neutral-700 rounded-xl p-5">
                <h2 className="text-xl font-semibold text-white mb-5 flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <FaPhone className="w-5 h-5 text-blue-400" />
                  </div>
                  <span>Contacto</span>
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">Teléfono</label>
                    <input
                      type="text"
                      value={formData.telefono_contacto || ''}
                      onChange={(e) => setFormData({...formData, telefono_contacto: e.target.value})}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      placeholder="Ingresa teléfono"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      placeholder="Ingresa email"
                    />
                  </div>

                  {/* Visibilidad */}
                  <div className="pt-4 border-t border-neutral-700/50">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className={`
                        relative inline-flex items-center h-6 rounded-full w-11
                        ${formData.perfil_visible ? 'bg-green-500' : 'bg-neutral-700'}
                        transition-colors
                      `}>
                        <span className={`
                          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                          ${formData.perfil_visible ? 'translate-x-6' : 'translate-x-1'}
                        `} />
                      </div>
                      <div className="flex items-center gap-2">
                        {formData.perfil_visible ? <FaEye /> : <FaEyeSlash />}
                        <span className="text-neutral-300">Perfil visible públicamente</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.perfil_visible}
                        onChange={(e) => setFormData({...formData, perfil_visible: e.target.checked})}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna derecha */}
            <div className="space-y-6">
              {/* Ubicación Geográfica */}
              <div className="bg-neutral-900/50 border border-neutral-700 rounded-xl p-5">
                <h2 className="text-xl font-semibold text-white mb-5 flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <FiGlobe className="w-5 h-5 text-purple-400" />
                  </div>
                  <span>Ubicación Geográfica *</span>
                </h2>
                
                <div className="space-y-4">
                  {/* País */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">País *</label>
                    <select
                      value={formData.id_pais || ''}
                      onChange={(e) => handlePaisChange(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      disabled={!geoData}
                      required
                    >
                      <option value="">Seleccionar país</option>
                      {geoData?.paises.map(pais => (
                        <option key={pais.id} value={pais.id}>
                          {pais.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Región */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">Región *</label>
                    <select
                      value={formData.id_region || ''}
                      onChange={(e) => handleRegionChange(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      disabled={!formData.id_pais || filteredRegiones.length === 0}
                      required
                    >
                      <option value="">Seleccionar región</option>
                      {filteredRegiones.map(region => (
                        <option key={region.id} value={region.id}>
                          {region.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Comuna */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">Comuna *</label>
                    <select
                      value={formData.id_comuna || ''}
                      onChange={(e) => handleComunaChange(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      disabled={!formData.id_region || filteredComunas.length === 0}
                      required
                    >
                      <option value="">Seleccionar comuna</option>
                      {filteredComunas.map(comuna => (
                        <option key={comuna.id} value={comuna.id}>
                          {comuna.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Dirección y Coordenadas */}
              <div className="bg-neutral-900/50 border border-neutral-700 rounded-xl p-5">
                <h2 className="text-xl font-semibold text-white mb-5 flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <FaMapMarkerAlt className="w-5 h-5 text-green-400" />
                  </div>
                  <span>Dirección y Coordenadas</span>
                </h2>
                
                <div className="space-y-4">
                  {/* Dirección */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">Dirección</label>
                    <textarea
                      value={formData.direccion || ''}
                      onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-green-500"
                      placeholder="Ingresa dirección completa"
                      rows={3}
                    />
                  </div>

                  {/* Coordenadas */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-neutral-400">Coordenadas</label>
                      <button
                        type="button"
                        onClick={() => setShowMapModal(true)}
                        className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white text-sm rounded-lg flex items-center gap-2"
                      >
                        <FaMap className="w-3 h-3" />
                        Seleccionar en mapa
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          type="number"
                          step="any"
                          value={formData.lat || ''}
                          onChange={(e) => setFormData({...formData, lat: parseFloat(e.target.value) || null})}
                          className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-sky-500"
                          placeholder="Latitud"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          step="any"
                          value={formData.lon || ''}
                          onChange={(e) => setFormData({...formData, lon: parseFloat(e.target.value) || null})}
                          className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-sky-500"
                          placeholder="Longitud"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Video */}
              <div className="bg-neutral-900/50 border border-neutral-700 rounded-xl p-5">
                <h2 className="text-xl font-semibold text-white mb-5 flex items-center gap-3">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <FaVideo className="w-5 h-5 text-red-400" />
                  </div>
                  <span>Video</span>
                </h2>
                <div className="space-y-3">
                  <input
                    type="url"
                    value={tempVideoUrl}
                    onChange={(e) => setTempVideoUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                    placeholder="URL del video (Solo YouTube)"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="mt-8 pt-8 border-t border-neutral-700/50 flex justify-end gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-neutral-700 hover:bg-neutral-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <FiX className="w-4 h-4" />
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creando...
                </>
              ) : (
                <>
                  <FaSave className="w-4 h-4" />
                  Crear Perfil
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Modal del mapa para seleccionar coordenadas */}
      {showMapModal && (
        <LocationPickerMap
          initialLat={formData.lat || 0}
          initialLng={formData.lon || 0}
          onLocationSelect={handleLocationSelect}
          onClose={() => setShowMapModal(false)}
        />
      )}
    </>
  );
}