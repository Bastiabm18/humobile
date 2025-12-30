// app/dashboard/mi_perfil/ArtistForm.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import { ArtistData, GeoData } from '@/types/profile'; 
import { FiUploadCloud, FiX } from 'react-icons/fi';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseBrowser } from '@/lib/supabase/supabase-client';

interface Props {
  defaultValues?: Partial<ArtistData>;
  onSubmit: (data: ArtistData) => void;
  onCancel: () => void;
  geoData: GeoData;
}

export default function ArtistForm({ defaultValues = {}, onSubmit, onCancel, geoData }: Props) {
  console.log('ArtistForm defaultValues:', defaultValues);
  const supabase = getSupabaseBrowser();
  
  const [form, setForm] = useState<ArtistData>({
    name: defaultValues.name || '',
    email: defaultValues.email || '',
    phone: defaultValues.phone || '',
    countryId: defaultValues.countryId || '', 
    regionId: defaultValues.regionId || '',
    cityId: defaultValues.cityId || '',
    image_url: defaultValues.image_url || '',
    updateAt: defaultValues.updateAt || new Date().toISOString(),
    perfil_visible: defaultValues.perfil_visible ?? false,
    tipo_perfil: defaultValues.tipo_perfil || 'artista',
  });

  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(defaultValues.image_url || null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
 const [newImageUrl, setNewImageUrl] = useState<string | null>(null); // NUEVO: para trackear nueva imagen
  // === FUNCIÓN PARA CONVERTIR NOMBRE → ID ===
  const getIdByName = (list: { id: string; name: string }[], name: string): string => {
    if (!name) return '';
    const found = list.find(item => item.name === name);
    return found ? found.id : '';
  };

  // === CONVERTIR NOMBRES A IDs AL CARGAR (solo en edición) ===
  useEffect(() => {
    if (!defaultValues || Object.keys(defaultValues).length === 0) return;

    const hasValidCountryId = defaultValues.countryId && 
      geoData.paises.some(p => p.id === defaultValues.countryId);

    if (hasValidCountryId) return;

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


    useEffect(() => {
    if (defaultValues.image_url && defaultValues.image_url !== form.image_url) {
      setForm(prev => ({
        ...prev,
        image_url: defaultValues.image_url || ''
      }));
      setPreview(defaultValues.image_url);
    }
  }, [defaultValues.image_url]);
  
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

       // ACTUALIZAR TODO CORRECTAMENTE
      setPreview(publicUrl);
      setForm(prev => ({ 
        ...prev, 
        image_url: publicUrl  // ← ESTO actualiza el formulario
      }));
      setNewImageUrl(publicUrl); // ← Guardamos la nueva URL


      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);

      URL.revokeObjectURL(previewUrl);

      return publicUrl;

    } catch (error: any) {
      console.error('Error en uploadImage:', error);
      
      const errorMessage = error.message || 'Error desconocido al subir la imagen';
      alert(`Error: ${errorMessage}`);
      
      if (defaultValues.image_url) {
        setPreview(defaultValues.image_url);
        setForm(prev => ({ ...prev, image_url: defaultValues.image_url || '' }));
      } else {
        setPreview(null);
        setForm(prev => ({ ...prev, image_url: '' }));
      }
      
      return null;
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setPreview(null);
    setForm(prev => ({ ...prev, image_url: '' }));
    setUploadSuccess(false);
  };

  const isEditing = !!defaultValues.countryId;

  useEffect(() => {
    if (isEditing) return;
    setForm(prev => ({ ...prev, regionId: '', cityId: '' }));
  }, [form.countryId, isEditing]);

  useEffect(() => {
    if (isEditing) return;
    setForm(prev => ({ ...prev, cityId: '' }));
  }, [form.regionId, isEditing]);

  const filteredRegiones = useMemo(() => {
    return geoData.regiones.filter(r => r.parentId === form.countryId);
  }, [form.countryId, geoData.regiones]);

  const filteredComunas = useMemo(() => {
    return geoData.comunas.filter(c => c.parentId === form.regionId);
  }, [form.regionId, geoData.comunas]);

  return (
    <div className="mt-8 max-w-4xl mx-auto">
      <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-red-600/30 shadow-2xl shadow-red-900/40 p-8">
        <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
          {defaultValues.name ? `Editar ${defaultValues.name}` : "Crear Perfil de Artista"}
        </h2>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-6">
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
      
          <div>
            <input
              type="text"
              placeholder="Nombre Artístico/Personal *"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
              className="w-full px-5 py-4 bg-neutral-900/80 border border-red-600/40 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-900/30 transition-all"
            />
          </div>

          <div>
            <input
              type="tel"
              placeholder="Teléfono de contacto *"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              required
              className="w-full px-5 py-4 bg-neutral-900/80 border border-red-600/40 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-900/30 transition-all"
            />
          </div>

          <div>
            <select
              value={form.countryId}
              onChange={e => setForm({ ...form, countryId: e.target.value })}
              required
              className="w-full px-5 py-4 bg-neutral-900/80 border border-red-600/40 rounded-xl text-white focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-900/30 transition-all appearance-none cursor-pointer"
              style={{ backgroundImage: "none" }}
            >
              <option value="" className="text-gray-500">Selecciona País *</option>
              {geoData.paises.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={form.regionId}
              onChange={e => setForm({ ...form, regionId: e.target.value })}
              required
              disabled={!form.countryId}
              className="w-full px-5 py-4 bg-neutral-900/80 border border-red-600/40 rounded-xl text-white focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
            >
              <option value="" className="text-gray-500">Selecciona Región *</option>
              {filteredRegiones.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={form.cityId}
              onChange={e => setForm({ ...form, cityId: e.target.value })}
              required
              disabled={!form.regionId}
              className="w-full px-5 py-4 bg-neutral-900/80 border border-red-600/40 rounded-xl text-white focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
            >
              <option value="" className="text-gray-500">Selecciona Comuna *</option>
              {filteredComunas.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

           <div className=' flex w-full py-4'>
            <label key='visible' className="flex items-center gap-4 cursor-pointer">
              <input
                type="checkbox"
                name="perfil_visible"
                checked={form.perfil_visible}
                onChange={e => setForm({...form, perfil_visible: e.target.checked})}
                className="w-6 h-6 text-red-600 bg-neutral-900 border-red-600/50 rounded focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black transition-all"
              />
              <span className="text-lg text-gray-200 capitalize">
              Quieres dejar tu Perfil visible
              </span>
            </label>
           </div>

          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              className="flex-1 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl font-bold text-lg text-white transition-all transform hover:scale-105 shadow-lg shadow-red-900/60"
            >
              {defaultValues.name ? "Guardar Cambios" : "Crear Perfil"}
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