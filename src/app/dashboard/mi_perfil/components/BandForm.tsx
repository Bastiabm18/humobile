// components/BandForm.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
// Importamos GeoData y la interfaz BandData de tus tipos
import { BandData, GeoData } from '@/types/profile'; 
import { getSupabaseBrowser } from '@/lib/supabase/supabase-client';
import { FiUploadCloud, FiX } from 'react-icons/fi';

interface Props {
  defaultValues: Partial<BandData>; // Usamos BandData para los valores por defecto
  onSubmit: (data: BandData) => void;
  onCancel: () => void;
  geoData: GeoData; // Requerimos GeoData para los selectores
}

export default function BandForm({ defaultValues, onSubmit, onCancel, geoData }: Props) {
    console.log('banda defaultValues:', defaultValues);
    const supabase = getSupabaseBrowser();
    
  // ESTADO ÚNICO: Manejando TODOS los campos en un solo objeto 'form'
  const [form, setForm] = useState<BandData>({
    band_name: defaultValues.band_name || '',
    style: defaultValues.style || '',
    music_type:  defaultValues.music_type || '',
    is_tribute: defaultValues.is_tribute || false,
    contact_phone: defaultValues.contact_phone || '',
    countryId:  defaultValues.countryId || '',
    regionId: defaultValues.regionId ||'',
    cityId:  defaultValues.cityId || '',
    
    // URLs
    photo_url: defaultValues.photo_url || '',
    video_url: defaultValues.video_url || '',
    updateAt: defaultValues.updateAt || new Date().toISOString(),
     tipo_perfil: defaultValues.tipo_perfil || 'band',
     integrante: defaultValues.integrante || []
  });
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(defaultValues.photo_url || null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  
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

    // === CASCADA NORMAL (solo en creación) ===
    const isEditing = !!defaultValues.countryId;

  // Lógica de filtrado en cascada para País > Región > Comuna (usando form.countryId)
  const filteredRegiones = useMemo(() => {
    return geoData.regiones.filter(r => r.parentId === form.countryId);
  }, [form.countryId, geoData.regiones]);

  const filteredComunas = useMemo(() => {
    return geoData.comunas.filter(c => c.parentId === form.regionId);
  }, [form.regionId, geoData.comunas]);
  
  // Reseteo de selección en cascada (igual que en ArtistForm)
  useEffect(() => {
    setForm(prev => ({ ...prev, regionId: '', cityId: '' }));
  }, [form.countryId]);
  
  useEffect(() => {
    setForm(prev => ({ ...prev, cityId: '' }));
  }, [form.regionId]);

  // Manejador genérico de cambios (opcional pero útil)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // Manejo especial para el checkbox 'is_tribute'
    if (type === 'checkbox' && 'checked' in e.target) {
        setForm(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
        setForm(prev => ({ ...prev, [name]: value }));
    }
  };
    
  // Manejador especial para el cambio de selectores geográficos (para evitar errores de tipado con name)
  const handleGeoChange = (name: 'countryId' | 'regionId' | 'cityId', value: string) => {
      setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
<div className="mt-8 max-w-5xl mx-auto">
  <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-red-600/30 shadow-2xl shadow-red-900/40 p-8">
    <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
      Perfil de Grupo/Banda
    </h2>

    <form onSubmit={handleSubmit} className="space-y-7">
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
      {/* PRIMERA FILA - DATOS BÁSICOS */}
      <div className="grid md:grid-cols-2 gap-6">
         
        <input
          type="text"
          placeholder="Nombre de la banda *"
          name="band_name"
          value={form.band_name}
          onChange={handleChange}
          required
          className="px-5 py-4 bg-neutral-900/80 border border-red-600/40 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-900/30 transition-all"
        />

        <input
          type="text"
          placeholder="Estilo de la banda *"
          name="style"
          value={form.style}
          onChange={handleChange}
          required
          className="px-5 py-4 bg-neutral-900/80 border border-red-600/40 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-900/30 transition-all"
        />

        <input
          type="text"
          placeholder="Tipo de música *"
          name="music_type"
          value={form.music_type}
          onChange={handleChange}
          required
          className="px-5 py-4 bg-neutral-900/80 border border-red-600/40 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-900/30 transition-all"
        />

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="is_tribute"
            checked={form.is_tribute}
            onChange={handleChange}
            className="w-6 h-6 text-red-600 bg-neutral-900 border-red-600/50 rounded focus:ring-red-500"
          />
          <label className="text-lg text-gray-300 font-medium">¿Es tributo?</label>
        </div>

        <div className="md:col-span-2">
          <input
            type="tel"
            placeholder="Teléfono de contacto *"
            name="contact_phone"
            value={form.contact_phone}
            onChange={handleChange}
            required
            className="w-full px-5 py-4 bg-neutral-900/80 border border-red-600/40 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-900/30 transition-all"
          />
        </div>
      </div>

      {/* SELECTORES GEOGRÁFICOS */}
      <div className="grid md:grid-cols-3 gap-6">
        <select
          value={form.countryId}
          onChange={e => handleGeoChange('countryId', e.target.value)}
          required
          className="px-5 py-4 bg-neutral-900/80 border border-red-600/40 rounded-xl text-white focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-900/30 transition-all appearance-none cursor-pointer"
        >
          <option value="">Selecciona País *</option>
          {geoData.paises.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select
          value={form.regionId}
          onChange={e => handleGeoChange('regionId', e.target.value)}
          required
          disabled={!form.countryId || filteredRegiones.length === 0}
          className="px-5 py-4 bg-neutral-900/80 border border-red-600/40 rounded-xl text-white focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
        >
          <option value="">Selecciona Región *</option>
          {filteredRegiones.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>

        <select
          value={form.cityId}
          onChange={e => handleGeoChange('cityId', e.target.value)}
          required
          disabled={!form.regionId || filteredComunas.length === 0}
          className="px-5 py-4 bg-neutral-900/80 border border-red-600/40 rounded-xl text-white focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
        >
          <option value="">Selecciona Comuna *</option>
          {filteredComunas.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* FOTO Y VIDEO */}
      <div className="grid md:grid-cols-2 gap-6 pt-2">
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
          type="url"
          placeholder="URL de Video (Youtube/Vimeo) (Opcional)"
          name="video_url"
          value={form.video_url}
          onChange={handleChange}
          className="px-5 py-4 bg-neutral-900/80 border border-red-600/40 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-900/30 transition-all"
        />
      </div>

      {/* BOTONES FINALES */}
      <div className="flex gap-5 pt-8">
        <button
          type="submit"
          className="flex-1 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl font-bold text-lg text-white transition-all transform hover:scale-105 shadow-lg shadow-red-900/60"
        >
          Crear Banda
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
  );
}