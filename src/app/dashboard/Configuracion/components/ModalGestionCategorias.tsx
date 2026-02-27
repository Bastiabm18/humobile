'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTimes, 
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheck,
  FaBan,
  FaSave,
  FaTimesCircle,
  FaSort,
  FaSortUp,
  FaSortDown
} from 'react-icons/fa';
import { eliminarCategoriaPerfil, getCategoriasPerfil, crearCategoriaPerfil, cambiarEstadoCategoriaPerfil, actualizarCategoriaPerfil } from '../actions/actions';
import { categoria_perfil } from '@/types/profile';

interface PropsModalGestionCategorias {
  estaAbierto: boolean;
  alCerrar: () => void;
}

type SortField = 'id_categoria' | 'nombre_categoria' | 'tipo_perfil' | 'estado' | 'createdAt' | 'updatedAt';
type SortDirection = 'asc' | 'desc';

const tiposPerfil = [
  { id: 'artista', label: 'Artista', color: 'blue' },
  { id: 'banda', label: 'Banda', color: 'purple' },
  { id: 'lugar', label: 'Lugar', color: 'green' },
  { id: 'productor', label: 'Productor', color: 'yellow' },
  { id: 'representante', label: 'Representante', color: 'red' }
];

export default function ModalGestionCategorias({ estaAbierto, alCerrar }: PropsModalGestionCategorias) {
  const [categorias, setCategorias] = useState<categoria_perfil[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);
  
  // Estados para ordenamiento
  const [sortField, setSortField] = useState<SortField>('id_categoria');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState<categoria_perfil | null>(null);
  const [formData, setFormData] = useState({
    categoria: '',
    tipo: 'artista',
    estado: true
  });

  // Cargar categorías
  useEffect(() => {
    if (estaAbierto) {
      cargarCategorias();
    } else {
      resetearEstado();
    }
  }, [estaAbierto]);

  // Función para manejar el ordenamiento
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Si ya está ordenando por este campo, cambia la dirección
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Si es un campo nuevo, ordena ascendente por defecto
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Obtener el icono de ordenamiento para cada columna
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <FaSort className="inline ml-1 text-neutral-500" />;
    return sortDirection === 'asc' 
      ? <FaSortUp className="inline ml-1 text-blue-400" />
      : <FaSortDown className="inline ml-1 text-blue-400" />;
  };

  // Categorías ordenadas usando useMemo
  const categoriasOrdenadas = useMemo(() => {
    return [...categorias].sort((a, b) => {
      let aValue: any = a[sortField as keyof categoria_perfil];
      let bValue: any = b[sortField as keyof categoria_perfil];

      // Manejar valores null/undefined
      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';

      // Comparación según el tipo de campo
      if (sortField === 'id_categoria') {
        // Numérico
        return sortDirection === 'asc' 
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      } 
      else if (sortField === 'estado') {
        // Booleano
        const aBool = aValue ? 1 : 0;
        const bBool = bValue ? 1 : 0;
        return sortDirection === 'asc' ? aBool - bBool : bBool - aBool;
      }
      else if (sortField === 'createdAt' || sortField === 'updatedAt') {
        // Fechas
        const aDate = new Date(aValue || 0).getTime();
        const bDate = new Date(bValue || 0).getTime();
        return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
      }
      else {
        // Texto
        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        return sortDirection === 'asc'
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
      }
    });
  }, [categorias, sortField, sortDirection]);

  const resetearEstado = () => {
    setMostrarFormulario(false);
    setEditando(null);
    setFormData({ categoria: '', tipo: 'artista', estado: true });
    setError(null);
    setExito(null);
    setSortField('id_categoria');
    setSortDirection('asc');
  };

  const cargarCategorias = async () => {
    try {
      setCargando(true);
      const data = await getCategoriasPerfil();
      setCategorias(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleCrear = () => {
    setEditando(null);
    setFormData({ categoria: '', tipo: 'artista', estado: true });
    setMostrarFormulario(true);
  };
  
  const handleEditar = (categoria: categoria_perfil) => {
    setEditando(categoria);
    setFormData({
      categoria: categoria.nombre_categoria,
      tipo: categoria.tipo_perfil,
      estado: categoria.estado as unknown as boolean
    });
    setMostrarFormulario(true);
  };

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;
    
    try {
      await eliminarCategoriaPerfil(id);
      setExito('Categoría eliminada correctamente');
      cargarCategorias();
      setTimeout(() => setExito(null), 3000);
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleToggleEstado = async (categoria: categoria_perfil) => {
    try {
      await cambiarEstadoCategoriaPerfil(categoria.id_categoria as unknown as number, !categoria.estado);
      setExito(`Categoría ${!categoria.estado ? 'activada' : 'desactivada'} correctamente`);
      cargarCategorias();
      setTimeout(() => setExito(null), 3000);
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleGuardar = async () => {
    if (!formData.categoria.trim()) {
      setError('El nombre de la categoría es obligatorio');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      if (editando) {
        // Editar
        await actualizarCategoriaPerfil(editando.id_categoria as unknown as number, {
          nombre_categoria: formData.categoria.trim(),
          tipo_perfil: formData.tipo,
          estado: formData.estado as unknown as string
        });
        setExito('Categoría actualizada correctamente');
      } else {
        // Crear
        await crearCategoriaPerfil({
          nombre_categoria: formData.categoria.trim(),
          tipo_perfil: formData.tipo,
          estado: formData.estado as unknown as string
        });
        setExito('Categoría creada correctamente');
      }

      cargarCategorias();
      setMostrarFormulario(false);
      setEditando(null);
      setFormData({ categoria: '', tipo: 'artista', estado: true });
      setTimeout(() => setExito(null), 3000);
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const formatearFecha = (fecha: string) => {
    if (!fecha) return 'No disponible';
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
                      w-full md:max-w-[90vw] max-h-[90vh] overflow-y-auto
                      bg-neutral-800 rounded-xl border border-neutral-700 
                      z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-700 bg-neutral-900">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Gestión de Categorías
                </h2>
                <p className="text-neutral-400 text-sm mt-1">
                  Administra las categorías por tipo de perfil
                </p>
              </div>
              <button
                onClick={alCerrar}
                className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-700"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* Mensajes de éxito/error */}
            {(exito || error) && (
              <div className={`mx-6 mt-4 p-3 rounded-lg ${
                exito ? 'bg-emerald-900/30 border border-emerald-700' : 'bg-red-900/30 border border-red-700'
              }`}>
                <p className={exito ? 'text-emerald-300' : 'text-red-300'}>
                  {exito || error}
                </p>
              </div>
            )}

            {/* Botón crear nueva categoría */}
            {!mostrarFormulario && (
              <div className="p-6">
                <button
                  onClick={handleCrear}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  <FaPlus />
                  Nueva Categoría
                </button>
              </div>
            )}

            {/* Formulario de creación/edición */}
            {mostrarFormulario && (
              <div className="mx-6 mb-6 p-4 bg-neutral-900/50 border border-neutral-700 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">
                  {editando ? 'Editar Categoría' : 'Nueva Categoría'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">
                      Nombre de la Categoría
                    </label>
                    <input
                      type="text"
                      value={formData.categoria}
                      onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                      className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white"
                      placeholder="Ej: DJ, ROCK, ESTADIO..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">
                      Tipo de Perfil
                    </label>
                    <select
                      value={formData.tipo}
                      onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                      className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white"
                    >
                      {tiposPerfil.map(tipo => (
                        <option key={tipo.id} value={tipo.id}>
                          {tipo.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {editando && (
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-neutral-400">Estado:</label>
                      <button
                        onClick={() => setFormData({...formData, estado: !formData.estado})}
                        className={`px-3 py-1 rounded-lg text-sm font-medium ${
                          formData.estado
                            ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-700'
                            : 'bg-red-900/30 text-red-300 border border-red-700'
                        }`}
                      >
                        {formData.estado ? 'Activo' : 'Inactivo'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      setMostrarFormulario(false);
                      setEditando(null);
                    }}
                    className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg flex items-center gap-2"
                  >
                    <FaTimesCircle />
                    Cancelar
                  </button>
                  <button
                    onClick={handleGuardar}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                  >
                    <FaSave />
                    Guardar
                  </button>
                </div>
              </div>
            )}

            {/* Tabla de categorías */}
            <div className="p-6 pt-0 max-h-[60vh] overflow-auto custom-scrollbar">
              {cargando ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  <p className="text-neutral-400 mt-4">Cargando categorías...</p>
                </div>
              ) : categoriasOrdenadas.length === 0 ? (
                <div className="text-center py-12 bg-neutral-700/30 rounded-xl">
                  <p className="text-neutral-400">No hay categorías registradas</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-700">
                      <th 
                        className="text-left py-3 px-4 text-neutral-300 cursor-pointer hover:text-white"
                        onClick={() => handleSort('id_categoria')}
                      >
                        <span className="flex items-center">
                          ID {getSortIcon('id_categoria')}
                        </span>
                      </th>
                      <th 
                        className="text-left py-3 px-4 text-neutral-300 cursor-pointer hover:text-white"
                        onClick={() => handleSort('nombre_categoria')}
                      >
                        <span className="flex items-center">
                          Categoría {getSortIcon('nombre_categoria')}
                        </span>
                      </th>
                      <th 
                        className="text-left py-3 px-4 text-neutral-300 cursor-pointer hover:text-white"
                        onClick={() => handleSort('tipo_perfil')}
                      >
                        <span className="flex items-center">
                          Tipo {getSortIcon('tipo_perfil')}
                        </span>
                      </th>
                      <th 
                        className="text-left py-3 px-4 text-neutral-300 cursor-pointer hover:text-white"
                        onClick={() => handleSort('estado')}
                      >
                        <span className="flex items-center">
                          Estado {getSortIcon('estado')}
                        </span>
                      </th>
                      <th 
                        className="text-left py-3 px-4 text-neutral-300 cursor-pointer hover:text-white"
                        onClick={() => handleSort('createdAt')}
                      >
                        <span className="flex items-center">
                          Creado {getSortIcon('createdAt')}
                        </span>
                      </th>
                      <th 
                        className="text-left py-3 px-4 text-neutral-300 cursor-pointer hover:text-white"
                        onClick={() => handleSort('updatedAt')}
                      >
                        <span className="flex items-center">
                          Actualizado {getSortIcon('updatedAt')}
                        </span>
                      </th>
                      <th className="text-left py-3 px-4 text-neutral-300">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoriasOrdenadas.map((cat) => (
                      <tr key={cat.id_categoria} className="border-b border-neutral-800 hover:bg-neutral-700/30">
                        <td className="py-3 px-4 text-neutral-300">#{cat.id_categoria}</td>
                        <td className="py-3 px-4">
                          <span className="text-white font-medium">{cat.nombre_categoria}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            cat.tipo_perfil === 'artista' ? 'bg-blue-900/30 text-blue-300 border border-blue-700' :
                            cat.tipo_perfil === 'banda' ? 'bg-purple-900/30 text-purple-300 border border-purple-700' :
                            cat.tipo_perfil === 'lugar' ? 'bg-green-900/30 text-green-300 border border-green-700' :
                            cat.tipo_perfil === 'productor' ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-700' :
                            'bg-red-900/30 text-red-300 border border-red-700'
                          }`}>
                            {tiposPerfil.find(t => t.id === cat.tipo_perfil)?.label || cat.tipo_perfil}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            cat.estado
                              ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-700'
                              : 'bg-red-900/30 text-red-300 border border-red-700'
                          }`}>
                            {cat.estado ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-neutral-400 text-sm">{formatearFecha(cat.createdAt || '')}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-neutral-400 text-sm">{formatearFecha(cat.updatedAt || '')}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditar(cat)}
                              className="p-2 bg-blue-900/50 text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 rounded-xl"
                              title="Editar categoría"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleToggleEstado(cat)}
                              className={`p-2 ${
                                cat.estado
                                  ? 'bg-amber-900/50 text-amber-400 hover:bg-amber-900/30'
                                  : 'bg-emerald-900/50 text-emerald-400 hover:bg-emerald-900/30'
                              } rounded-xl`}
                              title={cat.estado ? 'Desactivar' : 'Activar'}
                            >
                              {cat.estado ? <FaBan /> : <FaCheck />}
                            </button>
                            <button
                              onClick={() => handleEliminar(cat.id_categoria as unknown as number)}
                              className="p-2 bg-red-900/50 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-xl"
                              title="Eliminar categoría"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-neutral-700 bg-neutral-900/50">
              <div className="text-sm text-neutral-400">
                Total de categorías: {categorias.length} | 
                Activas: {categorias.filter(c => c.estado).length} | 
                Inactivas: {categorias.filter(c => !c.estado).length}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}