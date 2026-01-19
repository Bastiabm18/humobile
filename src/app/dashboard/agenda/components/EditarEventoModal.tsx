'use client';

import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import {
  HiX,
  HiPencil,
  HiCalendar,
  HiMap,
  HiUserGroup,
  HiPhotograph,
  HiLink,
} from 'react-icons/hi';
import { FiUploadCloud, FiX as FiXIcon, FiTrash2 } from 'react-icons/fi';
import {
  getArtistasVisibles,
  getLugaresVisibles,
  getCategoriasVisibles,
  updateEvento, // 
} from '../actions/actions';
import { getSupabaseBrowser } from '@/lib/supabase/supabase-client';
import RespuestaModal from './RespuestaModal';
import { EventoCalendario, ParticipanteEvento, categoriaEvento, IntegranteBandaEvento } from '@/types/profile';

interface EditarEventoModalProps {
  open: boolean;
  onClose: () => void;
  profile: { id: string; tipo: string; nombre?: string };
  evento: EventoCalendario;
  onSuccess?: () => void;
}

export default function EditarEventoModal({
  open,
  onClose,
  profile,
  evento,
  onSuccess,
}: EditarEventoModalProps) {
  const supabase = getSupabaseBrowser();

  // ── Estados principales ────────────────────────────────────────────────
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    fecha_hora_ini: '',
    fecha_hora_fin: '',
    id_categoria: null as string | null,
    flyer_url: null as string | null,
    video_url: null as string | null,
    tickets_evento: null as string | null,
    es_publico: true,
  });

  // Participantes del EVENTO (bandas, artistas individuales, lugares, etc)
  const [participantes, setParticipantes] = useState<ParticipanteEvento[]>([]);

  const [categorias, setCategorias] = useState<categoriaEvento[]>([]);
  const [perfilesVisibles, setPerfilesVisibles] = useState<any[]>([]);
  const [lugaresVisibles, setLugaresVisibles] = useState<any[]>([]);

  const [selectedCategoria, setSelectedCategoria] = useState('');
  const [selectedParticipante, setSelectedParticipante] = useState('');

  // Lugar
  const [idLugar, setIdLugar] = useState<string | null>(null);
  const [showCustomLugar, setShowCustomLugar] = useState(false);
  const [nombreLugarCustom, setNombreLugarCustom] = useState('');
  const [direccionLugarCustom, setDireccionLugarCustom] = useState('');

  // Flyer
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Loading & modal respuesta
  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    mensaje: '',
    esExito: true,
  });

  // ── Carga inicial del evento ───────────────────────────────────────────
  useEffect(() => {
    if (!open || !evento) return;

    // Datos básicos
    setForm({
      titulo: evento.titulo || '',
      descripcion: evento.descripcion || '',
      fecha_hora_ini: format(new Date(evento.inicio), "yyyy-MM-dd'T'HH:mm"),
      fecha_hora_fin: evento.fin ? format(new Date(evento.fin), "yyyy-MM-dd'T'HH:mm") : '',
      id_categoria: evento.id_categoria || null,
      flyer_url: evento.flyer_url || null,
      video_url: evento.video_url || null,
      tickets_evento: evento.tickets_evento || null,
      es_publico: evento.es_publico ?? true,
    });

    setPreview(evento.flyer_url || null);

    // Participantes del evento (formato ParticipanteEvento)
    setParticipantes(
      (evento.participantes || []).map((p: IntegranteBandaEvento) => ({
        id_perfil: p.id_participante,
        nombre: p.nombre_participante,
        tipo: p.tipo_perfil_participante,
      }))
    );

    // Lugar
    if (evento.id_lugar) {
      setIdLugar(evento.id_lugar);
      setShowCustomLugar(false);
    } else if (evento.nombre_lugar) {
      setShowCustomLugar(true);
      setNombreLugarCustom(evento.nombre_lugar);
      setDireccionLugarCustom(evento.direccion_lugar || '');
    }

    // Cargar datos auxiliares
    cargarDatosAuxiliares();
  }, [open, evento]);

  const cargarDatosAuxiliares = async () => {
    try {
      const [cats, arts, places] = await Promise.all([
        getCategoriasVisibles(),
        getArtistasVisibles(),
        getLugaresVisibles(),
      ]);
      setCategorias(cats);
      setPerfilesVisibles(arts);
      setLugaresVisibles(places);
    } catch (err) {
      console.error('Error cargando datos auxiliares:', err);
    }
  };

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleFormChange = (field: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUploadFlyer = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      if (!['image/jpeg', 'image/png', 'image/webp'].some(t => file.type.includes(t))) {
        throw new Error('Formato no soportado (solo jpg, png, webp)');
      }
      if (file.size > 5 * 1024 * 1024) throw new Error('Máximo 5MB');

      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${crypto.randomUUID()}.${ext}`;
      const path = `flyers/${fileName}`;

      const { error: uploadErr } = await supabase.storage
        .from('perfiles')
        .upload(path, file, { upsert: true });

      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from('perfiles').getPublicUrl(path);

      setForm((prev) => ({ ...prev, flyer_url: urlData.publicUrl }));
      setPreview(urlData.publicUrl);
    } catch (err: any) {
      alert(err.message || 'Error al subir flyer');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const removeFlyer = () => {
    setPreview(null);
    setForm((p) => ({ ...p, flyer_url: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const agregarParticipante = () => {
    if (!selectedParticipante) return;

    const yaExiste = participantes.some((p) => p.id_perfil === selectedParticipante);
    if (yaExiste) {
      alert('Este perfil ya está agregado como participante');
      return;
    }

    // Evitar agregar al creador otra vez
    if (selectedParticipante === profile.id) {
      alert('El creador ya está incluido automáticamente');
      return;
    }

    const perfil = perfilesVisibles.find((p) => p.id === selectedParticipante);
    if (!perfil) return;

    setParticipantes((prev) => [
      ...prev,
      {
        id_perfil: perfil.id,
        nombre: perfil.nombre || '',
        tipo: perfil.tipo,
      },
    ]);

    setSelectedParticipante('');
  };

  const quitarParticipante = (id: string) => {
    if (id === profile.id) {
      alert('No puedes quitar al creador del evento');
      return;
    }
    setParticipantes((prev) => prev.filter((p) => p.id_perfil !== id));
  };

  const handleSelectLugar = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'custom') {
      setIdLugar(null);
      setShowCustomLugar(true);
    } else if (value) {
      setIdLugar(value);
      setShowCustomLugar(false);
      setNombreLugarCustom('');
      setDireccionLugarCustom('');
    } else {
      setIdLugar(null);
      setShowCustomLugar(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.titulo.trim()) {
      alert('El título es obligatorio');
      return;
    }

    const ini = new Date(form.fecha_hora_ini);
    const fin = form.fecha_hora_fin ? new Date(form.fecha_hora_fin) : null;

    if (fin && ini >= fin) {
      alert('La fecha/hora de inicio debe ser anterior a la de fin');
      return;
    }

    setLoading(true);

    try {
      const dataToSend = {
        id: evento.id,
        ...form,
        fecha_hora_ini: ini.toISOString(),
        fecha_hora_fin: fin?.toISOString() ?? null,

        // Lugar
        id_lugar: idLugar,
        nombre_lugar: showCustomLugar ? nombreLugarCustom.trim() || null : null,
        direccion_lugar: showCustomLugar ? direccionLugarCustom.trim() || null : null,
        lat_lugar: null, // puedes implementar después
        lon_lugar: null,

        // Solo participantes del evento (sin los integrantes internos)
        participantes: participantes.map((p) => ({
          id_perfil: p.id_perfil,
          nombre: p.nombre,
          tipo: p.tipo,
        })),
      };

      const result = await updateEvento(dataToSend);

      if (!result.success) {
        throw new Error(result.error || 'Error desconocido al actualizar');
      }

      setModalState({
        isOpen: true,
        mensaje: 'Evento actualizado correctamente',
        esExito: true,
      });
    } catch (err: any) {
      setModalState({
        isOpen: true,
        mensaje: err.message || 'Error al actualizar el evento',
        esExito: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccess = () => {
    setModalState((p) => ({ ...p, isOpen: false }));
    if (modalState.esExito) {
      onSuccess?.();
      onClose();
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-neutral-800 rounded-2xl border border-neutral-700 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-700">
            <div className="flex items-center gap-3">
              <HiPencil className="text-yellow-500" size={28} />
              <h2 className="text-xl font-bold text-white">Editar Evento</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <HiX size={28} />
            </button>
          </div>

          {/* Contenido principal */}
          <div className="flex-1 p-6 overflow-y-auto grid md:grid-cols-3 gap-6">
            {/* Columna 1 - Flyer + info básica */}
            <div className="space-y-6">
              {/* Flyer */}
              <div className="bg-neutral-900/40 border border-neutral-700 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                  <HiPhotograph /> Flyer del evento
                </h3>

                {preview ? (
                  <div className="relative rounded-lg overflow-hidden group">
                    <img src={preview} alt="Flyer preview" className="w-full h-56 object-cover" />
                    <button
                      onClick={removeFlyer}
                      className="absolute top-2 right-2 bg-red-600/90 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <FiXIcon size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="h-56 bg-neutral-950/70 rounded-lg border-2 border-dashed border-neutral-600 flex flex-col items-center justify-center">
                    <FiUploadCloud size={48} className="text-neutral-500 mb-3" />
                    <p className="text-sm text-neutral-400">Sin flyer cargado</p>
                  </div>
                )}

                <label className="mt-4 block">
                  <span
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium cursor-pointer transition ${
                      uploading ? 'bg-gray-700 text-gray-400' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {uploading ? 'Subiendo...' : preview ? 'Cambiar flyer' : 'Subir flyer'}
                    <FiUploadCloud size={18} />
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    disabled={uploading}
                    onChange={handleUploadFlyer}
                  />
                </label>
              </div>

              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Título del evento *
                </label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={(e) => handleFormChange('titulo', e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:border-emerald-500"
                  maxLength={120}
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => handleFormChange('descripcion', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:border-emerald-500 resize-none"
                  maxLength={800}
                />
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Categoría
                </label>
                <select
                  value={selectedCategoria || form.id_categoria || ''}
                  onChange={(e) => {
                    setSelectedCategoria(e.target.value);
                    handleFormChange('id_categoria', e.target.value || null);
                  }}
                  className="w-full px-4 py-2.5 bg-neutral-700 border border-neutral-600 rounded-lg text-white"
                >
                  <option value="">Sin categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat.id_categoria} value={cat.id_categoria}>
                      {cat.nombre_categoria}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Columna 2 - Fechas / Lugar / Participantes */}
            <div className="space-y-6">
              {/* Fechas */}
              <div className="bg-neutral-900/40 border border-neutral-700 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                  <HiCalendar /> Fechas y horario
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Inicio *</label>
                    <input
                      type="datetime-local"
                      value={form.fecha_hora_ini}
                      onChange={(e) => handleFormChange('fecha_hora_ini', e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Fin</label>
                    <input
                      type="datetime-local"
                      value={form.fecha_hora_fin}
                      onChange={(e) => handleFormChange('fecha_hora_fin', e.target.value || '')}
                      className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Lugar */}
              <div className="bg-neutral-900/40 border border-neutral-700 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                  <HiMap /> Lugar del evento
                </h3>

                {profile.tipo === 'lugar' ? (
                  <div className="p-4 bg-emerald-950/40 border border-emerald-800/40 rounded-lg">
                    <p className="font-medium">{profile.nombre || 'Este local'}</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Asignado automáticamente como creador
                    </p>
                  </div>
                ) : (
                  <>
                    <select
                      value={idLugar || (showCustomLugar ? 'custom' : '')}
                      onChange={handleSelectLugar}
                      className="w-full px-4 py-2.5 bg-neutral-700 border border-neutral-600 rounded-lg text-white mb-3"
                    >
                      <option value="">— Seleccionar lugar —</option>
                      {lugaresVisibles.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.nombre}
                        </option>
                      ))}
                      <option value="custom">Otro lugar (especificar)</option>
                    </select>

                    {showCustomLugar && (
                      <div className="space-y-3 mt-2">
                        <input
                          type="text"
                          placeholder="Nombre del lugar"
                          value={nombreLugarCustom}
                          onChange={(e) => setNombreLugarCustom(e.target.value)}
                          className="w-full px-4 py-2.5 bg-neutral-700 border border-neutral-600 rounded-lg text-white"
                        />
                        <input
                          type="text"
                          placeholder="Dirección completa"
                          value={direccionLugarCustom}
                          onChange={(e) => setDireccionLugarCustom(e.target.value)}
                          className="w-full px-4 py-2.5 bg-neutral-700 border border-neutral-600 rounded-lg text-white"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Participantes del evento */}
              <div className="bg-neutral-900/40 border border-neutral-700 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                  <HiUserGroup /> Participantes del evento
                </h3>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {participantes.map((p) => (
                    <div
                      key={p.id_perfil}
                      className="flex items-center justify-between bg-neutral-800/60 p-3 rounded-lg border border-neutral-700"
                    >
                      <div>
                        <p className="font-medium">{p.nombre}</p>
                        <p className="text-xs text-gray-400 capitalize">{p.tipo}</p>
                      </div>

                      {p.id_perfil !== profile.id && (
                        <button
                          onClick={() => quitarParticipante(p.id_perfil)}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}

                  {participantes.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Aún no hay participantes adicionales
                    </p>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <select
                    value={selectedParticipante}
                    onChange={(e) => setSelectedParticipante(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-neutral-700 border border-neutral-600 rounded-lg text-white"
                  >
                    <option value="">Agregar participante...</option>
                    {perfilesVisibles
                      .filter((p) => !participantes.some((part) => part.id_perfil === p.id))
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombre} · {p.tipo}
                        </option>
                      ))}
                  </select>

                  <button
                    type="button"
                    onClick={agregarParticipante}
                    disabled={!selectedParticipante}
                    className="px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800/50 disabled:text-gray-400 text-white rounded-lg transition"
                  >
                    +
                  </button>
                </div>

                {/* Nota importante sobre integrantes */}
                <p className="text-xs text-gray-500 mt-3">
                  Nota: Los integrantes de bandas aparecen como detalle de la banda participante, 
                  no como participantes independientes del evento.
                </p>
              </div>
            </div>

            {/* Columna 3 - Enlaces + visibilidad + info */}
            <div className="space-y-6">
              {/* Enlaces */}
              <div className="bg-neutral-900/40 border border-neutral-700 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                  <HiLink /> Enlaces
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Tickets / Reservas</label>
                    <input
                      type="url"
                      value={form.tickets_evento || ''}
                      onChange={(e) => handleFormChange('tickets_evento', e.target.value)}
                      placeholder="https://..."
                      className="w-full px-4 py-2.5 bg-neutral-700 border border-neutral-600 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Video promocional</label>
                    <input
                      type="url"
                      value={form.video_url || ''}
                      onChange={(e) => handleFormChange('video_url', e.target.value)}
                      placeholder="YouTube, Vimeo..."
                      className="w-full px-4 py-2.5 bg-neutral-700 border border-neutral-600 rounded-lg text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Visibilidad */}
              <div className="bg-neutral-900/40 border border-neutral-700 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-gray-200 mb-4">Visibilidad del evento</h3>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.es_publico}
                    onChange={(e) => handleFormChange('es_publico', e.target.checked)}
                    className="w-5 h-5 accent-emerald-600"
                  />
                  <span>Evento público (visible para todos)</span>
                </label>
              </div>

              {/* Info resumen */}
              <div className="bg-neutral-900/60 border border-neutral-700 rounded-xl p-5 text-sm">
                <p className="text-gray-400">Creador:</p>
                <p className="font-medium text-white mt-1">{profile.nombre || '—'}</p>
                <p className="text-gray-400 mt-3">ID Evento:</p>
                <p className="font-mono text-xs text-gray-300 break-all mt-1">
                  {evento.id}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-neutral-700 p-5 flex gap-4">
            <button
              onClick={onClose}
              disabled={loading || uploading}
              className="flex-1 py-3 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading || uploading}
              className="flex-1 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Guardando...' : 'Guardar cambios'}
              <HiPencil size={18} />
            </button>
          </div>
        </div>
      </div>

      <RespuestaModal
        isOpen={modalState.isOpen}
        mensaje={modalState.mensaje}
        esExito={modalState.esExito}
        onClose={() => setModalState((p) => ({ ...p, isOpen: false }))}
        onAceptar={modalState.esExito ? handleCloseSuccess : undefined}
      />
    </>
  );
}