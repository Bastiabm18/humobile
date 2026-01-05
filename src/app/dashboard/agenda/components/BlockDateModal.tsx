'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { HiX, HiLockClosed, HiCalendar } from 'react-icons/hi';
import { blockDateRange, createDateBlock } from '../actions/actions';
import RespuestaModal from './RespuestaModal';

interface Profile {
  id: string;
  type: 'artist' | 'band' | 'place';
  name?: string;
}

interface BlockDateModalProps {
  open: boolean;
  onClose: () => void;
  profile: Profile;
  initialDate?: Date; // la fecha que apretó en el calendario
}

export default function BlockDateModal({ open, onClose, profile, initialDate }: BlockDateModalProps) {
  const [title, setTitle] = useState('');
  const [reason, setReason] = useState('');
  const [perfil ,setPerfil] = useState(profile);
  const defaultStart = initialDate
    ? format(initialDate, "yyyy-MM-dd'T'HH:mm")
    : format(new Date(), "yyyy-MM-dd'T'HH:mm");
  const [startDateTime, setStartDateTime] = useState(defaultStart);
  const [endDateTime, setEndDateTime] = useState('');
  const [loading, setLoading] = useState(false);


    // estados para el modal de respuesta para el back
  
   const [modalState, setModalState] = useState({
      isOpen: false,
      mensaje: '',
      esExito: true
    });
  console.log('perfil usuario :', perfil);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !reason.trim()) {
      alert('titulo o razon vacios');
      return;
    }
    if (!startDateTime) {
      alert('Fecha/hora inicio es obligatoria');
      return;
    }

    setLoading(true);

    const result = await createDateBlock({
      creator_profile_id: perfil.id,
      creator_type: perfil.type,
      title: title.trim(),
      reason: reason.trim(),
      fecha_hora_ini: new Date(startDateTime),
      fecha_hora_fin: endDateTime ? new Date(endDateTime) : new Date(startDateTime),

    });

    setLoading(false);

    if (result.success) {
       setModalState({
          isOpen: true,
          mensaje: 'Bloqueo creado exitosamente',
          esExito: true
        });
      //onClose();
      // opcional: refresh del calendario
      
    } else {
       setModalState({
          isOpen: true,
          mensaje: result?.error || 'Error desconocido al crear el evento',
          esExito: false
        });
    }
  };

  if (!open) return null;

  return (
    <>
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl border border-neutral-700 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-700">
          <div className="flex items-center gap-3">
            <HiLockClosed className="text-red-500" size={28} />
            <h2 className="text-xl font-bold text-white">Bloquear fecha</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <HiX size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Título del bloqueo
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Vacaciones, Enfermo, Otro show..."
              className="w-full px-4 py-3 bg-light-gray border border-neutral-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition"
              maxLength={50}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Motivo (se verá en el calendario)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Motivo bloqueo"
              rows={3}
              className="w-full px-4 py-3 bg-light-gray border border-neutral-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition resize-none"
              maxLength={200}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <HiCalendar className="inline mr-1" />
                Fecha inicio
              </label>
              <input
                type="datetime-local"
                value={startDateTime}
                onChange={(e) => setStartDateTime(e.target.value)}
                required
                className="w-full px-4 py-3 bg-light-gray border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Fecha fin 
              </label>
              <input
                type="datetime-local"
                value={endDateTime}
                onChange={(e) => setEndDateTime(e.target.value)}
                min={startDateTime}
                required
                className="w-full px-4 py-3 bg-light-gray border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-light-gray hover:bg-gray-600 text-white font-medium rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? 'Bloqueando...' : 'Bloquear fecha'}
              <HiLockClosed size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
 <RespuestaModal
        isOpen={modalState.isOpen}
        mensaje={modalState.mensaje}
        esExito={modalState.esExito}
        onClose={onClose}
        onAceptar={onClose}
      />
    </>
  );
}