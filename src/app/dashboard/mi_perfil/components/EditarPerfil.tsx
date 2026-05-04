// app/dashboard/mi_perfil/EditarPerfil.tsx
'use client';

import { categoria_perfil, Perfil, PerfilSelect } from '@/types/profile';
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
  FaTrash,
  FaPlus,
  FaUsers,
  FaUserCheck
} from 'react-icons/fa';
import { FaCheck, FaUser } from 'react-icons/fa6';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase/supabase-client';
import { FiUploadCloud, FiX, FiGlobe } from 'react-icons/fi';
import LocationPickerMap from './LocationPickerMap';
import { getCategoriasPerfilActivas, getGeoData, getPerfilesArtistaVisibles, getPerfilesRepresentanteVisibles, getPerfilesTodoUso } from '../actions/actions';
import { GeoData } from '@/types/profile';
import BuscarBandaModal from './BuscarBandaModal';
import BuscarIntegrantesBandaModal from './BuscarIntegrantesBandaModal';
import BuscarRepresentanteModal from './BuscarRepresentanteModal';
import BuscarRepresentadosModal from './BuscarRepresentadosModal';
import GestionarAdministradoresModal from './GestionarAdministradoresModal';

interface EditarPerfilProps {
  perfil: Perfil;
  onSave: (perfilActualizado: Perfil) => void;
  onCancel: () => void;
  geoData?: GeoData;
}

export default function EditarPerfil({ perfil, onSave, onCancel, geoData }: EditarPerfilProps) {
  const [formData, setFormData] = useState<Perfil>({ ...perfil });
  console.log(perfil)
  // Estados para manejar los arrays de IDs
  const [integrantesSeleccionados, setIntegrantesSeleccionados] = useState<string[]>(
    Array.isArray(perfil.integrantes_perfil) ? perfil.integrantes_perfil : []
  );

  const [representadosSeleccionados, setRepresentadosSeleccionados] = useState<string[]>(
    Array.isArray(perfil.representados_perfil) ? perfil.representados_perfil : []
  );

  const [intengranteEn, setIntegranteEn] = useState<string[]>(
    Array.isArray(perfil.bandas_ids)? perfil.bandas_ids : []
  );

  const [representadoPor, setRepresentadoPor] = useState<string[]>(
    Array.isArray(perfil.representantes_ids)? perfil.representantes_ids : []
  );

    // estado para categoria de perfiles 
    const [categoriasPerfil, setCategoriasPerfil] = useState<categoria_perfil[]>([]);
    const [cargandoCategorias, setCargandoCategorias] = useState(false);

  // manejar los integrantes a eliminar 
  const [integrantesEliminar, setIntegrantesEliminar] = useState<string[]>([]);
  const [representadosEliminar, setRepresentadosEliminar] = useState<string[]>([]);

  const [nuevoIntegrante, setNuevoIntegrante] = useState<string>('');
  const [nuevoRepresentado, setNuevoRepresentado] = useState<string>('');
  
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
  
  // Estados para perfiles disponibles
  const [perfilesDisponibles, setPerfilesDisponibles] = useState<PerfilSelect[]>([]);
  const [cargandoPerfiles, setCargandoPerfiles] = useState(false);
  
  const supabase = getSupabaseBrowser();

  // Estados para los modales de relaciones
  const [showBuscarBandaModal, setShowBuscarBandaModal] = useState(false);
  const [showBuscarIntegrantesModal, setShowBuscarIntegrantesModal] = useState(false);
  const [showBuscarRepresentanteModal, setShowBuscarRepresentanteModal] = useState(false);
  const [showBuscarRepresentadosModal, setShowBuscarRepresentadosModal] = useState(false);
  const [showGestionarAdminsModal, setShowGestionarAdminsModal] = useState(false);

// categorias
  useEffect(() => {
  if (formData.tipo_perfil) {
    setCargandoCategorias(true);
    getCategoriasPerfilActivas(formData.tipo_perfil)
      .then(categorias => {
        console.log('Categorías activas:', categorias);
        setCategoriasPerfil(categorias);
      })
      .catch(error => {
        console.error('Error cargando categorías:', error);
      })
      .finally(() => {
        setCargandoCategorias(false);
      });
  }
}, [formData.tipo_perfil]);
  // Cargar perfiles disponibles según el tipo
  useEffect(() => {
    if (formData.tipo_perfil === 'banda' || formData.tipo_perfil === 'representante' || formData.tipo_perfil === 'artista') {
      cargarPerfilesDisponibles();
    } else {
      setPerfilesDisponibles([]);
    }
  }, [formData.tipo_perfil]);

  // Actualizar formData cuando cambian los arrays
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      integrantes_perfil: integrantesSeleccionados,
      representados_perfil: representadosSeleccionados
    }));
  }, [integrantesSeleccionados, representadosSeleccionados]);

  // 
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

  const cargarPerfilesDisponibles = async () => {
    try {
      setCargandoPerfiles(true);
      
      if (formData.tipo_perfil === 'banda') {
        // Para banda: solo artistas
        const perfiles: PerfilSelect[] = await getPerfilesArtistaVisibles();
        // Filtrar para excluir el propio perfil actual
        const perfilesFiltrados: PerfilSelect[] = perfiles.filter(p => p.id_perfil !== perfil.id_perfil);
        
        const mappedPerfiles: PerfilSelect[] = perfilesFiltrados.map(p => ({
          id_perfil: p.id_perfil,
          nombre: p.nombre,
          tipo_perfil: p.tipo_perfil,
          perfil_visible: p.perfil_visible
        }));
        setPerfilesDisponibles(mappedPerfiles);
      } else if (formData.tipo_perfil === 'representante') {
        // Para representante: artistas y bandas
        const perfiles = await getPerfilesRepresentanteVisibles();
        // Filtrar para excluir el propio perfil actual
        const perfilesFiltrados = perfiles.filter(p => p.id_perfil !== perfil.id_perfil);
        
        setPerfilesDisponibles(perfilesFiltrados.map(p => ({
          id_perfil: p.id_perfil,
          nombre: p.nombre,
          tipo_perfil: p.tipo_perfil,
          perfil_visible: p.perfil_visible
        })));
      }else if (formData.tipo_perfil === 'artista'){
   const perfiles = await getPerfilesTodoUso();
        // Filtrar para excluir el propio perfil actual
        const perfilesFiltrados = perfiles.filter(p => p.id_perfil !== perfil.id_perfil);
        
        setPerfilesDisponibles(perfilesFiltrados.map(p => ({
          id_perfil: p.id_perfil,
          nombre: p.nombre,
          tipo_perfil: p.tipo_perfil,
          perfil_visible: p.perfil_visible
        })));

      }
    } catch (error) {
      console.error('Error cargando perfiles:', error);
      setPerfilesDisponibles([]);
    } finally {
      setCargandoPerfiles(false);
    }
  };

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

  // Funciones para manejar integrantes
  const agregarIntegrante = () => {
    if (nuevoIntegrante && !integrantesSeleccionados.includes(nuevoIntegrante)) {
      setIntegrantesSeleccionados([...integrantesSeleccionados, nuevoIntegrante]);
      setNuevoIntegrante('');
    }
  };

  const eliminarIntegrante = (id: string) => {
    setIntegrantesSeleccionados(integrantesSeleccionados.filter(item => item !== id));
    setIntegrantesEliminar([...integrantesEliminar, id]);
  };
  const eliminarIntegranteEn = (id: string) => {
    setIntegranteEn(intengranteEn.filter(item => item !== id));
    setIntegrantesEliminar([...integrantesEliminar, id]);
  };


  // Funciones para manejar representados
  const agregarRepresentado = () => {
    if (nuevoRepresentado && !representadosSeleccionados.includes(nuevoRepresentado)) {
      setRepresentadosSeleccionados([...representadosSeleccionados, nuevoRepresentado]);
      setNuevoRepresentado('');
    }
  };

  const eliminarRepresentado = (id: string) => {
    setRepresentadosSeleccionados(representadosSeleccionados.filter(item => item !== id));
    setRepresentadosEliminar([...representadosEliminar, id]);
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
  const eliminarRepresentanteDeEstePerfil = (id: string) => {
  // 1. Lo quitamos del estado visual
  setRepresentadoPor(prev => prev.filter(item => item !== id));
  
  // 2. Lo agregamos a la lista de eliminación para el backend
  // IMPORTANTE: Asegúrate de que el backend use este array para borrar en la tabla 'representado'
  setRepresentadosEliminar(prev => [...prev, id]);
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
      integrantes_perfil: integrantesSeleccionados,
      representados_perfil: representadosSeleccionados,
      integrantes_eliminar: integrantesEliminar,
      representados_eliminar: representadosEliminar
    };
    onSave(updatedPerfil);
  };

  // Renderizar sección de integrantes para banda
  const renderIntegrantesSection = () => {
    if (formData.tipo_perfil !== 'banda') return null;

    return (
      <div className="bg-neutral-900/50 border border-neutral-700 rounded-xl p-5">
        <h2 className="text-xl font-semibold text-white mb-5 flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <FaUsers className="w-5 h-5 text-purple-400" />
          </div>
          <span>Integrantes de la Banda</span>
        </h2>
        
        <div className="space-y-4">
          {/* Botón para abrir el modal de búsqueda */}
          <button
            type="button"
            onClick={() => setShowBuscarIntegrantesModal(true)}
            className="w-full px-4 py-3 bg-purple-900/30 border border-dashed border-purple-500/50 hover:bg-purple-900/50 text-purple-300 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <FaPlus className="w-4 h-4" />
            Buscar y Agregar Integrante
          </button>

          {integrantesSeleccionados.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-neutral-400 mb-2">Integrantes actuales:</h4>
              <div className="space-y-2">
                {integrantesSeleccionados.map(id => {
                  const artista = perfilesDisponibles.find(a => a.id_perfil === id);
                  return (
                    <div key={id} className="flex items-center justify-between bg-neutral-800/50 border border-neutral-700 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <FaUser className="text-purple-400" />
                        <span className="text-white">{artista?.nombre || 'Cargando nombre...'}</span>
                      </div>
                      <button type="button" onClick={() => eliminarIntegrante(id)} className="p-1 text-red-400 hover:text-red-300">
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Gestión de Administradores Externos */}
          <div className="mt-6 pt-4 border-t border-neutral-700">
             <button
              type="button"
              onClick={() => setShowGestionarAdminsModal(true)}
              className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-600 hover:bg-neutral-700 text-neutral-300 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
            >
              <FaUserCheck className="w-4 h-4" />
              Gestionar Administradores Externos
            </button>
          </div>
        </div>
      </div>
    );
  };
  // Renderizar sección de artista si es participante en banda
  const renderIntegranteDeBandaSection = () => {
    if (formData.tipo_perfil !== 'artista') return null;

    return (
      <div className="bg-neutral-900/50 border border-neutral-700 rounded-xl p-5">
        <h2 className="text-xl font-semibold text-white mb-5 flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <FaUsers className="w-5 h-5 text-purple-400" />
          </div>
          <span>Soy Miembro De</span>
        </h2>
        
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setShowBuscarBandaModal(true)}
            className="w-full px-4 py-3 bg-purple-900/30 border border-dashed border-purple-500/50 hover:bg-purple-900/50 text-purple-300 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <FaPlus className="w-4 h-4" />
            Buscar y Agregar Banda
          </button>

          {intengranteEn.length > 0 && (
            <div className="mt-4">
              <div className="space-y-2">
                {intengranteEn.map(id => {
                  const banda = perfilesDisponibles.find(a => a.id_perfil === id);
                  return (
                    <div key={id} className="flex items-center justify-between bg-neutral-800/50 border border-neutral-700 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <FaUsers className="text-purple-400" />
                        <span className="text-white">{banda?.nombre || 'Cargando nombre...'}</span>
                      </div>
                      <button type="button" onClick={() => eliminarIntegranteEn(id)} className="p-1 text-red-400 hover:text-red-300">
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
  };

  // Renderizar sección de representados para representante
  const renderRepresentadosSection = () => {
    if (formData.tipo_perfil !== 'representante') return null;

    return (
      <div className="bg-neutral-900/50 border border-neutral-700 rounded-xl p-5">
        <h2 className="text-xl font-semibold text-white mb-5 flex items-center gap-3">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <FaUserCheck className="w-5 h-5 text-red-400" />
          </div>
          <span>Artistas y Bandas Representados</span>
        </h2>
        
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setShowBuscarRepresentadosModal(true)}
            className="w-full px-4 py-3 bg-red-900/30 border border-dashed border-red-500/50 hover:bg-red-900/50 text-red-300 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <FaPlus className="w-4 h-4" />
            Buscar y Agregar Representado
          </button>

          {representadosSeleccionados.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-neutral-400 mb-2">Representados actuales:</h4>
              <div className="space-y-2">
                {representadosSeleccionados.map(id => {
                  const perfil = perfilesDisponibles.find(p => p.id_perfil === id);
                  return (
                    <div key={id} className="flex items-center justify-between bg-neutral-800/50 border border-neutral-700 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        {perfil?.tipo_perfil === 'artista' ? <FaUser className="text-blue-400" /> : <FaUsers className="text-purple-400" />}
                        <span className="text-white">{perfil?.nombre || 'Cargando...'}</span>
                      </div>
                      <button type="button" onClick={() => eliminarRepresentado(id)} className="p-1 text-red-400 hover:text-red-300">
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
  };
  const renderRepresentanteSection = () => {
    if (formData.tipo_perfil == 'representante') return null;

    return (
      <div className="bg-neutral-900/50 border border-neutral-700 rounded-xl p-5">
        <h2 className="text-xl font-semibold text-white mb-5 flex items-center gap-3">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <FaUserCheck className="w-5 h-5 text-red-400" />
          </div>
          <span>Mi Representante</span>
        </h2>
        
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setShowBuscarRepresentanteModal(true)}
            className="w-full px-4 py-3 bg-red-900/30 border border-dashed border-red-500/50 hover:bg-red-900/50 text-red-300 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <FaPlus className="w-4 h-4" />
            Buscar y Agregar Representante
          </button>

          {representadoPor.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-neutral-400 mb-2">Representantes actuales:</h4>
              <div className="space-y-2">
                {representadoPor.map(id => {
                  const perfilEncontrado = perfilesDisponibles.find(p => p.id_perfil === id);
                  return (
                    <div key={id} className="flex items-center justify-between bg-neutral-800/50 border border-neutral-700 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <FaUserCheck className="text-blue-400" />
                        <span className="text-white">{perfilEncontrado?.nombre || 'Cargando...'}</span>
                      </div>
                      <button type="button" onClick={() => eliminarRepresentanteDeEstePerfil(id)} className="p-1 text-red-400 hover:text-red-300">
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
  };

const renderCamposcategoria = () => {
  // Si no hay categorías o no es un tipo que tenga categorías, no mostrar nada
        if (!formData.tipo_perfil || 
            formData.tipo_perfil === 'representante' || 
            formData.tipo_perfil === 'productor') {
          return null;
        }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-neutral-400 mb-2">
          Categoría del Perfil
        </label>
        
        <div className="flex gap-2 mb-4">
          {cargandoCategorias ? (
            <div className="flex-1 bg-black/50 border border-purple-600/30 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-purple-500"></div>
              <span className="text-gray-400">Cargando categorías...</span>
            </div>
          ) : (
            <select
              value={formData.id_categoria || ''}
              onChange={(e) => setFormData({...formData, id_categoria: e.target.value})}
              className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-white"
              disabled={categoriasPerfil.length === 0}
            >
              <option value="">Seleccionar categoría</option>
              {categoriasPerfil.map((categoria) => (
                <option key={categoria.id_categoria} value={categoria.id_categoria}>
                  {categoria.nombre_categoria}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Mostrar categoría actual seleccionada */}
        {formData.id_categoria && (
          <div className="mt-2 p-3 bg-purple-900/20 border border-purple-800/30 rounded-lg">
            <p className="text-sm text-purple-300">
              <span className="font-medium">Categoría seleccionada: </span>
              {categoriasPerfil.find(c => String(c.id_categoria) === String(formData.id_categoria))?.nombre_categoria || 'Cargando...'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
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
                <textarea
               
                value={formData.descripcion_perfil}
                onChange={(e) => setFormData({...formData, descripcion_perfil: e.target.value})}
                className="text-xl font-bold text-white mb-4 bg-transparent border-none outline-none text-center w-full max-w-md mx-auto"
                placeholder="Descripción del perfil (200 caracteres máximo)"
                cols={15}
                rows={3}
                maxLength={200}
                
                >
                </textarea>
                
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



              {(formData.tipo_perfil !== 'representante' && formData.tipo_perfil !== 'productor') && (
              <div className="bg-neutral-900/50 border border-neutral-700 rounded-xl p-5">
                <h2 className="text-xl font-semibold text-white mb-5 flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-5-5A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <span>Categoría del Perfil</span>
                </h2>
                {renderCamposcategoria()}
              </div>
            )}
              {/* Sección de Integrantes (solo para banda) */}
              {renderIntegrantesSection()}
              {/* Sección de Integrante en banda (solo para artista) */}
              {renderIntegranteDeBandaSection()}


              {/* Sección de Representados (solo para representante) */}
              {renderRepresentadosSection()}
              {/* Sección de Representados (solo para representante) */}
              {renderRepresentanteSection()}

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
                    
                    <div hidden className="grid grid-cols-2 gap-3">
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

        {/* Modales de Relaciones */}
      <BuscarBandaModal
        isOpen={showBuscarBandaModal}
        onClose={() => setShowBuscarBandaModal(false)}
        id_perfil_artista={perfil.id_perfil}
      />

      <BuscarIntegrantesBandaModal
        isOpen={showBuscarIntegrantesModal}
        onClose={() => setShowBuscarIntegrantesModal(false)}
        id_perfil_banda={perfil.id_perfil}
        nombre_banda={perfil.nombre}
      />

      <BuscarRepresentanteModal
        isOpen={showBuscarRepresentanteModal}
        onClose={() => setShowBuscarRepresentanteModal(false)}
        id_perfil={perfil.id_perfil}
      />

      <BuscarRepresentadosModal
        isOpen={showBuscarRepresentadosModal}
        onClose={() => setShowBuscarRepresentadosModal(false)}
        id_representante={perfil.id_perfil}
      />

      <GestionarAdministradoresModal
        isOpen={showGestionarAdminsModal}
        onClose={() => setShowGestionarAdminsModal(false)}
        id_banda={perfil.id_perfil}
      />
    </>
  );
}