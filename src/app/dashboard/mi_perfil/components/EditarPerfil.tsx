// app/dashboard/mi_perfil/EditarPerfil.tsx
'use client';

import { Perfil } from '@/types/profile';
import { 
  FaGuitar, 
  FaBuilding, 
  FaMusic, 
  FaBriefcase,
  FaMapMarkerAlt,
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
  FaTrash
} from 'react-icons/fa';
import { FaCheck, FaUser } from 'react-icons/fa6';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase/supabase-client';
import { FiUploadCloud, FiX, FiGlobe } from 'react-icons/fi';
import LocationPickerMap from './LocationPickerMap';
import { getGeoData } from '../actions/actions';
import { GeoData } from '@/types/profile';

interface EditarPerfilProps {
  perfil: Perfil;
  onSave: (perfilActualizado: Perfil) => void;
  onCancel: () => void;
  geoData?: GeoData;
}

export default function EditarPerfil({ perfil, onSave, onCancel, geoData }: EditarPerfilProps) {
  const [formData, setFormData] = useState<Perfil>({ ...perfil });
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(perfil.imagen_url);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [tempVideoUrl, setTempVideoUrl] = useState<string>(perfil.video_url || '');
  const [showMapModal, setShowMapModal] = useState(false);
  const [filteredRegiones, setFilteredRegiones] = useState<Array<{id: string, name: string}>>([]);
  const [filteredComunas, setFilteredComunas] = useState<Array<{id: string, name: string}>>([]);
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState({
    pais: '',
    region: '',
    comuna: ''
  });
  
  const supabase = getSupabaseBrowser();

  // Inicializar datos de ubicación
  useEffect(() => {
    if (geoData) {
      // Obtener nombres de la ubicación actual
      const paisActual = geoData.paises.find(p => p.id === formData.id_pais);
      const regionActual = geoData.regiones.find(r => r.id === formData.id_region);
      const comunaActual = geoData.comunas.find(c => c.id === formData.id_comuna);

      setUbicacionSeleccionada({
        pais: paisActual?.name || '',
        region: regionActual?.name || '',
        comuna: comunaActual?.name || ''
      });

      // Filtrar regiones según país seleccionado
      if (formData.id_pais) {
        const regionesFiltradas = geoData.regiones
          .filter(region => region.parentId === formData.id_pais)
          .map(region => ({ id: region.id, name: region.name }));
        setFilteredRegiones(regionesFiltradas);
      }

      // Filtrar comunas según región seleccionada
      if (formData.id_region) {
        const comunasFiltradas = geoData.comunas
          .filter(comuna => comuna.parentId === formData.id_region)
          .map(comuna => ({ id: comuna.id, name: comuna.name }));
        setFilteredComunas(comunasFiltradas);
      }
    }
  }, [geoData, formData.id_pais, formData.id_region, formData.id_comuna]);

  // Actualizar regiones cuando cambia el país
  const handlePaisChange = (idPais: string) => {
    setFormData(prev => ({ 
      ...prev, 
      id_pais: idPais,
      id_region: '', // Resetear región cuando cambia país
      id_comuna: ''  // Resetear comuna cuando cambia región
    }));

    if (geoData) {
      const pais = geoData.paises.find(p => p.id === idPais);
      setUbicacionSeleccionada(prev => ({ ...prev, pais: pais?.name || '' }));
      
      const regionesFiltradas = geoData.regiones
        .filter(region => region.parentId === idPais)
        .map(region => ({ id: region.id, name: region.name }));
      setFilteredRegiones(regionesFiltradas);
      setFilteredComunas([]); // Limpiar comunas
    }
  };

  // Actualizar comunas cuando cambia la región
  const handleRegionChange = (idRegion: string) => {
    setFormData(prev => ({ 
      ...prev, 
      id_region: idRegion,
      id_comuna: '' // Resetear comuna cuando cambia región
    }));

    if (geoData) {
      const region = geoData.regiones.find(r => r.id === idRegion);
      setUbicacionSeleccionada(prev => ({ ...prev, region: region?.name || '' }));
      
      const comunasFiltradas = geoData.comunas
        .filter(comuna => comuna.parentId === idRegion)
        .map(comuna => ({ id: comuna.id, name: comuna.name }));
      setFilteredComunas(comunasFiltradas);
    }
  };

  // Actualizar comuna
  const handleComunaChange = (idComuna: string) => {
    setFormData(prev => ({ ...prev, id_comuna: idComuna }));

    if (geoData) {
      const comuna = geoData.comunas.find(c => c.id === idComuna);
      setUbicacionSeleccionada(prev => ({ ...prev, comuna: comuna?.name || '' }));
    }
  };

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
      
      if (perfil.imagen_url) {
        setPreview(perfil.imagen_url);
        setFormData(prev => ({ ...prev, imagen_url: perfil.imagen_url || '' }));
      } else {
        setPreview(null);
        setFormData(prev => ({ ...prev, imagen_url: '' }));
      }
      
      return null;
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setPreview(null);
    setFormData(prev => ({ ...prev, imagen_url: '' }));
    setUploadSuccess(false);
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData(prev => ({ 
      ...prev, 
      lat: lat,
      lon: lng 
    }));
  };

  const handleSave = () => {
    const updatedPerfil = {
      ...formData,
      video_url: tempVideoUrl,
      actualizado_en: new Date().toISOString()
    };
    onSave(updatedPerfil);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-neutral-800 border border-neutral-700 rounded-2xl overflow-hidden shadow-xl"
      >
        {/* Header con imagen editable */}
        <div className="relative h-64 overflow-hidden">
          {preview ? (
            <img
              src={preview}
              alt={formData.nombre}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
              <div className="text-7xl text-neutral-700">
                {formData.tipo_perfil === 'artista' ? <FaUser className="w-16 h-16" /> :
                 formData.tipo_perfil === 'banda' ? <FaGuitar className="w-16 h-16" /> :
                 formData.tipo_perfil === 'local' ? <FaBuilding className="w-16 h-16" /> :
                 formData.tipo_perfil === 'productor' ? <FaMusic className="w-16 h-16" /> :
                 <FaBriefcase className="w-16 h-16" />}
              </div>
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/60 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className={`
                  inline-flex items-center gap-2 px-4 py-2
                  ${getTipoColor()}
                  rounded-full text-sm font-semibold mb-4 backdrop-blur-sm
                `}>
                  {formData.tipo_perfil === 'artista' ? <FaUser className="w-4 h-4" /> :
                   formData.tipo_perfil === 'banda' ? <FaGuitar className="w-4 h-4" /> :
                   formData.tipo_perfil === 'local' ? <FaBuilding className="w-4 h-4" /> :
                   formData.tipo_perfil === 'productor' ? <FaMusic className="w-4 h-4" /> :
                   <FaBriefcase className="w-4 h-4" />}
                  <span className="capitalize">{formData.tipo_perfil}</span>
                </div>
                
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="text-4xl font-bold text-white mb-2 bg-transparent border-none outline-none w-full"
                  placeholder="Nombre del perfil"
                />
                
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="text-neutral-300 bg-transparent border-none outline-none w-full"
                  placeholder="Agregar email"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <label className={`
                  px-4 py-2 rounded-full text-sm font-medium
                  ${formData.perfil_visible 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }
                  flex items-center gap-2 backdrop-blur-sm cursor-pointer
                `}>
                  <input
                    type="checkbox"
                    checked={formData.perfil_visible}
                    onChange={(e) => setFormData({...formData, perfil_visible: e.target.checked})}
                    className="hidden"
                  />
                  {formData.perfil_visible ? <FaEye /> : <FaEyeSlash />}
                  <span>{formData.perfil_visible ? 'Visible' : 'Oculto'}</span>
                </label>
              </div>
            </div>
          </div>
          
          {/* Botón para cambiar imagen */}
          <div className="absolute top-4 right-4">
            <label className="cursor-pointer">
              <div className="px-4 py-2 bg-neutral-800/80 hover:bg-neutral-700/80 border border-neutral-700 text-white rounded-full text-sm font-medium flex items-center gap-2 backdrop-blur-sm transition-colors">
                <FiUploadCloud className="w-4 h-4" />
                {uploading ? 'Subiendo...' : 'Cambiar imagen'}
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
              Imagen actualizada
            </div>
          )}
        </div>

        {/* Información principal editable */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Columna izquierda */}
            <div className="space-y-6">
              {/* Contacto */}
              <div className="bg-neutral-900/50 border border-neutral-700 rounded-xl p-5">
                <h2 className="text-xl font-semibold text-white mb-5 flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <FaPhone className="w-5 h-5 text-blue-400" />
                  </div>
                  <span>Información de Contacto</span>
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-3 bg-neutral-800/50 rounded-lg">
                    <div className="p-2 bg-red-500/10 rounded-lg">
                      <FaPhone className="w-4 h-4 text-red-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-400 mb-2">Teléfono</p>
                      <input
                        type="text"
                        value={formData.telefono_contacto || ''}
                        onChange={(e) => setFormData({...formData, telefono_contacto: e.target.value})}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        placeholder="Ingresa teléfono"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-3 bg-neutral-800/50 rounded-lg">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <FaEnvelope className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-400 mb-2">Email</p>
                      <input
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        placeholder="Ingresa email"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Ubicación - País, Región, Comuna */}
              <div className="bg-neutral-900/50 border border-neutral-700 rounded-xl p-5">
                <h2 className="text-xl font-semibold text-white mb-5 flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <FiGlobe className="w-5 h-5 text-purple-400" />
                  </div>
                  <span>Ubicación Geográfica</span>
                </h2>
                
                <div className="space-y-4">
                  {/* País */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-400">País</label>
                    <select
                      value={formData.id_pais || ''}
                      onChange={(e) => handlePaisChange(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      disabled={!geoData}
                    >
                      <option value="">Seleccionar país</option>
                      {geoData?.paises.map(pais => (
                        <option key={pais.id} value={pais.id}>
                          {pais.name}
                        </option>
                      ))}
                    </select>
                    {ubicacionSeleccionada.pais && (
                      <p className="text-xs text-green-400">Seleccionado: {ubicacionSeleccionada.pais}</p>
                    )}
                  </div>

                  {/* Región */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-400">Región</label>
                    <select
                      value={formData.id_region || ''}
                      onChange={(e) => handleRegionChange(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      disabled={!formData.id_pais || filteredRegiones.length === 0}
                    >
                      <option value="">Seleccionar región</option>
                      {filteredRegiones.map(region => (
                        <option key={region.id} value={region.id}>
                          {region.name}
                        </option>
                      ))}
                    </select>
                    {ubicacionSeleccionada.region && (
                      <p className="text-xs text-green-400">Seleccionado: {ubicacionSeleccionada.region}</p>
                    )}
                    {formData.id_pais && filteredRegiones.length === 0 && (
                      <p className="text-xs text-yellow-400">No hay regiones disponibles para este país</p>
                    )}
                  </div>

                  {/* Comuna */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-400">Comuna</label>
                    <select
                      value={formData.id_comuna || ''}
                      onChange={(e) => handleComunaChange(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      disabled={!formData.id_region || filteredComunas.length === 0}
                    >
                      <option value="">Seleccionar comuna</option>
                      {filteredComunas.map(comuna => (
                        <option key={comuna.id} value={comuna.id}>
                          {comuna.name}
                        </option>
                      ))}
                    </select>
                    {ubicacionSeleccionada.comuna && (
                      <p className="text-xs text-green-400">Seleccionado: {ubicacionSeleccionada.comuna}</p>
                    )}
                    {formData.id_region && filteredComunas.length === 0 && (
                      <p className="text-xs text-yellow-400">No hay comunas disponibles para esta región</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Columna derecha */}
            <div className="space-y-6">
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
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-400">Dirección</label>
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
                        <label className="text-xs text-neutral-500 mb-1 block">Latitud</label>
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
                        <label className="text-xs text-neutral-500 mb-1 block">Longitud</label>
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
                    
                    {formData.lat && formData.lon && (
                      <div className="bg-sky-900/20 border border-sky-800/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-sm">
                          <FaLocationArrow className="text-sky-400" />
                          <span className="text-sky-300 font-medium">
                            Lat: {formData.lat.toFixed(6)}, Lng: {formData.lon.toFixed(6)}
                          </span>
                        </div>
                      </div>
                    )}
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
                    placeholder="URL del video (YouTube, Vimeo, etc.)"
                  />
                  <p className="text-xs text-neutral-500">
                    Coloca el enlace completo del video (ej: https://youtube.com/watch?v=...)
                  </p>
                </div>
              </div>

              {/* Datos específicos */}
              <div className="bg-neutral-900/50 border border-neutral-700 rounded-xl p-5">
                <h2 className="text-xl font-semibold text-white mb-5 flex items-center gap-3">
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <FaBriefcase className="w-5 h-5 text-orange-400" />
                  </div>
                  <span>Datos Específicos ({formData.tipo_perfil})</span>
                </h2>
                <div className="bg-neutral-900/30 rounded-lg p-4">
                  <textarea
                    value={JSON.stringify(
                      formData.tipo_perfil === 'artista' ? formData.artista_data :
                      formData.tipo_perfil === 'banda' ? formData.banda_data :
                      formData.tipo_perfil === 'local' ? formData.local_data :
                      formData.tipo_perfil === 'productor' ? formData.productor_data :
                      formData.representante_data,
                      null,
                      2
                    )}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        const field = `${formData.tipo_perfil}_data` as keyof Perfil;
                        setFormData({...formData, [field]: parsed});
                      } catch {
                        // Ignorar errores de JSON inválido mientras se escribe
                      }
                    }}
                    className="w-full h-48 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-orange-500"
                    placeholder={`Datos en formato JSON para ${formData.tipo_perfil}`}
                  />
                  <p className="text-xs text-neutral-500 mt-2">
                    Edita los datos en formato JSON. Asegúrate de mantener la sintaxis correcta.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="mt-8 pt-8 border-t border-neutral-700/50 flex justify-end gap-4">
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-neutral-700 hover:bg-neutral-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <FiX className="w-4 h-4" />
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-blue-600/70 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <FaSave className="w-4 h-4" />
                  Guardar Cambios
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