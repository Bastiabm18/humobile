'use client';

import { useState, useMemo, useEffect } from 'react';
import { PlaceData, GeoData } from '@/types/profile';
import LocationPickerMap from './LocationPickerMap';
import { getSupabaseBrowser } from '@/lib/supabase/supabase-client';
import { FiUploadCloud, FiX } from 'react-icons/fi';

interface Props {
  defaultValues?: Partial<PlaceData>;
  onSubmit: (data: PlaceData) => void;
  onCancel: () => void;
  geoData: GeoData;
}

export default function PlaceForm({ defaultValues = {}, onSubmit, onCancel, geoData }: Props) {
  
   console.log('lugar defaultValues:', defaultValues);
      const supabase = getSupabaseBrowser();
      
  // Estado inicial con todos los campos
  const [form, setForm] = useState<PlaceData>({
    place_name: defaultValues.place_name || '',
    address: defaultValues.address || '',
    phone: defaultValues.phone || '',
    place_type: defaultValues.place_type || 'pub',
    countryId: defaultValues.countryId || '',
    regionId: defaultValues.regionId || '',
    cityId: defaultValues.cityId || '',
    lat: defaultValues.lat || 0,
    lng: defaultValues.lng || 0,
    photo_url: defaultValues.photo_url || '',
    video_url: defaultValues.video_url || '',
    singer: defaultValues.singer ?? false,
    band: defaultValues.band ?? false,
    actor: defaultValues.actor ?? false,
    comedian: defaultValues.comedian ?? false,
    impersonator: defaultValues.impersonator ?? false,
    tribute: defaultValues.tribute ?? false,
    updateAt: defaultValues.updateAt || new Date().toISOString(),
    perfil_visible: defaultValues.perfil_visible ?? false
  });

  const [isMapOpen, setIsMapOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(defaultValues.photo_url || null);
  const [uploadSuccess, setUploadSuccess] = useState(false);


  
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
      const filePath = `artists/${fileName}`;

      console.log('Subiendo a:', filePath);

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

      console.log('Subida exitosa');

      const { data: urlData } = supabase.storage
        .from('perfiles')
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        throw new Error('No se pudo obtener la URL pública de la imagen');
      }

      const publicUrl = urlData.publicUrl;
      console.log('URL pública generada:', publicUrl);

      setPreview(publicUrl);
      setForm(prev => ({ 
        ...prev, 
        photo_url: publicUrl
      }));

      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);

      URL.revokeObjectURL(previewUrl);

      return publicUrl;

    } catch (error: any) {
      console.error('Error en uploadImage:', error);
      
      const errorMessage = error.message || 'Error desconocido al subir la imagen';
      alert(`Error: ${errorMessage}`);
      
      if (defaultValues.photo_url) {
        setPreview(defaultValues.photo_url);
        setForm(prev => ({ ...prev, photo_url: defaultValues.photo_url || '' }));
      } else {
        setPreview(null);
        setForm(prev => ({ ...prev, photo_url: '' }));
      }
      
      return null;
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setPreview(null);
    setForm(prev => ({ ...prev, photo_url: '' }));
    setUploadSuccess(false);
  };

  
    // === FUNCIÓN PARA CONVERTIR NOMBRE → ID ===
    const getIdByName = (list: { id: string; name: string }[], name: string): string => {
      if (!name) return '';
      const found = list.find(item => item.name === name);
      return found ? found.id : '';
    };
  
    // === CONVERTIR NOMBRES A IDs AL CARGAR (solo en edición) ===
    useEffect(() => {
      if (!defaultValues || Object.keys(defaultValues).length === 0) return;
  
      // Si ya tiene IDs válidos → no hacer nada
      const hasValidCountryId = defaultValues.countryId && 
        geoData.paises.some(p => p.id === defaultValues.countryId);
  
      if (hasValidCountryId) return;
  
      // Convertir nombres a IDs
      const countryId = getIdByName(geoData.paises, defaultValues.countryId as string);
      const regionId = getIdByName(geoData.regiones, defaultValues.regionId as string);
      const cityId = getIdByName(geoData.comunas, defaultValues.cityId as string);
  
      if (countryId || regionId || cityId) {
        setForm(prev => ({
          ...prev,
          countryId: countryId || prev.countryId,
          regionId: regionId || prev.regionId,
          cityId: cityId || prev.cityId,
        }));
      }
    }, [defaultValues, geoData]);
  
    // === CASCADA NORMAL (solo en creación) ===
    const isEditing = !!defaultValues.countryId;

  // === CASCADA DE REGIONES Y COMUNAS ===
  const filteredRegiones = useMemo(() => {
    return geoData.regiones.filter(r => r.parentId === form.countryId);
  }, [form.countryId, geoData.regiones]);

  const filteredComunas = useMemo(() => {
    return geoData.comunas.filter(c => c.parentId === form.regionId);
  }, [form.regionId, geoData.comunas]);


// Solo resetear región y comuna cuando estamos CREANDO (no editando)
useEffect(() => {
  if (isEditing) return; // ← ESTO ES LA CLAVE: no tocar nada si es edición
  setForm(prev => ({ ...prev, regionId: '', cityId: '' }));
}, [form.countryId, isEditing]);

useEffect(() => {
  if (isEditing) return; // ← Aquí también
  setForm(prev => ({ ...prev, cityId: '' }));
}, [form.regionId, isEditing]);

  // === HANDLERS ===
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

const handleLocationSelect = (lat: number, lng: number) => {
    setForm(prev => ({ ...prev, lat, lng }));
    // ¡El modal sigue abierto! El usuario puede seguir moviéndose y ajustando
  };

  const handleCloseMap = () => {
    setIsMapOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación mínima: ubicación seleccionada
    if (form.lat === 0 || form.lng === 0) {
      alert('Por favor selecciona una ubicación en el mapa');
      return;
    }

    onSubmit(form);
  };

  return (
    <>
    <div className="mt-8 max-w-5xl mx-auto">
  <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-red-600/30 shadow-2xl shadow-red-900/40 p-8">
    
    <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
      Crear Perfil de Local
    </h2>

    <form onSubmit={handleSubmit} className="space-y-8">

     <div className="flex flex-col items-center">
                            <div className="relative">
                              {preview ? (
                                <div className="relative group">
                                  <img src={preview} alt="Preview" className="w-32 h-32 rounded-full object-cover border-4 border-red-600 shadow-lg" />
                                  <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                                  >
                                    <FiX size={16} />
                                  </button>
                                </div>
                              ) : (
                                <div className="w-32 h-32 bg-neutral-800 rounded-full border-4 border-dashed border-red-600/50 flex items-center justify-center">
                                  <FiUploadCloud className="text-red-500" size={40} />
                                </div>
                              )}
                            </div>
                
                            <label className="mt-4 cursor-pointer">
                              <span className={`
                                px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2
                                ${uploading 
                                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                                  : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg'
                                }
                              `}>
                                {uploading ? 'Subiendo...' : preview ? 'Cambiar Foto' : 'Subir Foto de Perfil'}
                                {!uploading && <FiUploadCloud size={20} />}
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                disabled={uploading}
                                onChange={uploadImage}
                                className="hidden"
                              />
                            </label>
                            
                            {uploadSuccess && (
                              <p className="text-green-500 text-sm mt-2 animate-pulse">
                                ✓ Imagen subida correctamente
                              </p>
                            )}
                            
                            <p className="text-xs text-gray-500 mt-2">JPG, PNG hasta 5MB</p>
                          </div>
      {/* NOMBRE, DIRECCIÓN, TELÉFONO, TIPO */}
      <div className="grid md:grid-cols-2 gap-6">
                <input
          hidden
          type="url"
          placeholder="URL de Foto de Perfil (Opcional)"
          name="photo_url"
          value={form.photo_url}
          onChange={handleChange}
          className="px-5 py-4 bg-neutral-900/80 border border-red-600/40 rounded-xl text-white placeholder-gray-500 text-white focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-900/30 transition-all"
        />
        <input
          name="place_name"
          value={form.place_name}
          onChange={handleChange}
          placeholder="Nombre del local *"
          required
          className="px-5 py-4 bg-neutral-900/80 border border-red-600/40 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-900/30 transition-all"
        />
        <input
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="Dirección *"
          required
          className="px-5 py-4 bg-neutral-900/80 border border-red-600/40 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-900/30 transition-all"
        />
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Teléfono *"
          required
          className="px-5 py-4 bg-neutral-900/80 border border-red-600/40 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-900/30 transition-all"
        />
        <select
          name="place_type"
          value={form.place_type}
          onChange={handleChange}
          required
          className="px-5 py-4 bg-neutral-900/80 border border-red-600/40 rounded-xl text-white focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-900/30 transition-all appearance-none cursor-pointer"
        >
          <option value="">Tipo de local *</option>
          <option value="pub">Pub</option>
          <option value="bar">Bar</option>
          <option value="event_center">Centro de eventos</option>
          <option value="disco">Disco</option>
          <option value="other">Otro</option>
        </select>
      </div>

      {/* SELECTORES GEOGRÁFICOS */}
      <div className="grid md:grid-cols-3 gap-6">
        <select
          name="countryId"
          value={form.countryId}
          onChange={handleChange}
          required
          className="px-5 py-4 bg-neutral-900/80 border border-red-600/40 rounded-xl text-white focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-900/30 transition-all appearance-none"
        >
          <option value="">País *</option>
          {geoData.paises.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select
          name="regionId"
          value={form.regionId}
          onChange={handleChange}
          disabled={!form.countryId}
          required
          className="px-5 py-4 bg-neutral-900/80 border border-red-600/40 rounded-xl text-white focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
        >
          <option value="">Región *</option>
          {filteredRegiones.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>

        <select
          name="cityId"
          value={form.cityId}
          onChange={handleChange}
          disabled={!form.regionId}
          required
          className="px-5 py-4 bg-neutral-900/80 border border-red-600/40 rounded-xl text-white focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
        >
          <option value="">Comuna *</option>
          {filteredComunas.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* UBICACIÓN EN MAPA */}
      <div className="pt-6 border-t border-red-600/30">
        <h3 className="text-xl font-bold text-white mb-4">Ubicación exacta (clic en el mapa) *</h3>
        <div className="grid md:grid-cols-3 gap-6 items-end">
          <input
            value={form.lat.toFixed(6)}
            readOnly
            placeholder="Latitud"
            className="px-5 py-4 bg-neutral-900/80 border border-red-600/40 rounded-xl text-gray-300 focus:outline-none"
          />
          <input
            value={form.lng.toFixed(6)}
            readOnly
            placeholder="Longitud"
            className="px-5 py-4 bg-neutral-900/80 border border-red-600/40 rounded-xl text-gray-300 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setIsMapOpen(true)}
            className="py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-xl font-bold text-white transition-all transform hover:scale-105 shadow-lg shadow-green-900/60"
          >
            Abrir Mapa
          </button>
        </div>
        {form.lat === 0 && form.lng === 0 && (
          <p className="mt-3 text-red-400 font-medium flex items-center gap-2">
            Debes seleccionar la ubicación exacta en el mapa
          </p>
        )}
      </div>

      {/* CHECKBOXES DE INTERESES */}
      <div className="pt-6">
        <h3 className="text-xl font-bold text-white mb-5">¿Qué tipo de artistas te interesan?</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {(['singer', 'band', 'actor', 'comedian', 'impersonator', 'tribute'] as const).map(type => (
            <label key={type} className="flex items-center gap-4 cursor-pointer">
              <input
                type="checkbox"
                name={type}
                checked={form[type]}
                onChange={handleChange}
                className="w-6 h-6 text-red-600 bg-neutral-900 border-red-600/50 rounded focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black transition-all"
              />
              <span className="text-lg text-gray-200 capitalize">
                {type === 'singer' ? 'Cantante' :
                 type === 'band' ? 'Banda/Grupo' :
                 type === 'actor' ? 'Actor' :
                 type === 'comedian' ? 'Comediante' :
                 type === 'impersonator' ? 'Impersonator' :
                 'Tributo'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* BOTONES FINALES */}
      <div className="flex gap-5 pt-8">
        <button
          type="submit"
          className="flex-1 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl font-bold text-lg text-white transition-all transform hover:scale-105 shadow-lg shadow-red-900/60"
        >
          Guardar Local
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-4 bg-gray-700 hover:bg-gray-800 rounded-xl font-bold text-lg text-white transition-all transform hover:scale-105 shadow-lg shadow-gray-900/60"
        >
          Cancelar
        </button>
      </div>
    </form>
  </div>
</div>

      {/* Modal del mapa */}
      {isMapOpen && (
        <LocationPickerMap
          initialLat={form.lat}
          initialLng={form.lng}
          onLocationSelect={handleLocationSelect}
          onClose={handleCloseMap}
        />
      )}
    </>
  );
}