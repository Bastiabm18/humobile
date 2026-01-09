// app/dashboard/mi_perfil/ProfileManager.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX } from 'react-icons/hi';
import ProfileTypeSelector from './ProfileTypeSelector';
import ProfileTable from './ProfileTable';
import ArtistForm from './ArtistForm';
import BandForm from './BandForm';
import PlaceForm from './PlaceForm';
import { getProfiles, createProfile, updateProfile } from '../actions/actions';
import { GeoData, Profile, ArtistData, BandData, PlaceData } from '@/types/profile';
import { FaGuitar, FaMusic, FaPlaceOfWorship } from 'react-icons/fa';

interface ProfileManagerProps {
  initialProfiles: Profile[];
  userEmail: string;
  userName?: string;
  userId: string;
  geoData: GeoData;
}

export default function ProfileManager({
  initialProfiles,
  userEmail,
  userName,
  userId,
  geoData
}: ProfileManagerProps) {

  const [profiles, setProfiles] = useState(initialProfiles);
  const [selectedType, setSelectedType] = useState<'artist' | 'band' | 'place' |'representative'|'producer' | null>(null);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  const loadProfiles = async () => {
    const data = await getProfiles(userId);
    setProfiles(data);
  };

  const handleEdit = (profile: Profile) => {
    setEditingProfile(profile);
    setSelectedType(profile.type);
  };

  const handleCancel = () => {
    setSelectedType(null);
    setEditingProfile(null);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (editingProfile) {
        await updateProfile(editingProfile.id, editingProfile.type, data);
      } else {
        await createProfile(userId, selectedType!, data);
      }
      handleCancel();
      await loadProfiles();
    } catch (error) {
      alert('Error al guardar el perfil');
    }
  };

  const parseData = (data: any) => {
    if (typeof data === 'string') {
      try { return JSON.parse(data); } catch (e) { console.error(e); return {}; }
    }
    return data || {};
  };

  const artistDefaults = editingProfile && editingProfile.type === 'artist'
    ? parseData(editingProfile.data) as Partial<ArtistData>
    : {} as Partial<ArtistData>;

  const bandDefaults = editingProfile && editingProfile.type === 'band'
    ? parseData(editingProfile.data) as Partial<BandData>
    : {} as Partial<BandData>;

  const placeDefaults = editingProfile && editingProfile.type === 'place'
    ? parseData(editingProfile.data) as Partial<PlaceData>
    : {} as Partial<PlaceData>;

  return (
    <div className="w-screen p-2 md:max-w-6xl mx-auto relative">
      <h1 className="text-3xl font-bold mb-8 text-center text-white">Mis Perfiles</h1>

      {/* Crear nuevo */}
      {!selectedType && (
        <div className="mt-10 mb-10">
          <h2 className="text-xl font-semibold mb-6 text-center text-white">Crear un nuevo perfil</h2>
          <ProfileTypeSelector onSelect={setSelectedType} />
        </div>
      )}
      <ProfileTable
        profiles={profiles}
        onRefresh={loadProfiles}
        onEdit={handleEdit}
        geoData={geoData}
      />


      {/* MODAL PARA FORMULARIOS - CONTAINER WRAPPER */}
      <AnimatePresence>
        {selectedType && (
          <>
            {/* Backdrop con blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancel}
              className="fixed inset-0 w-full h-full  bg-black/20 backdrop-blur-md z-40"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed  inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-neutral-800/30 h-[99vh] backdrop-blur-xl border border-neutral-700/50 rounded-2xl shadow-2xl shadow-black/50 w-full max-w-[99vw] max-h-[90vh] overflow-y-scroll custom-scrollbar">
                
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 border-b border-neutral-700/50 p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      selectedType === 'artist' ? 'bg-red-500/20' :
                      selectedType === 'band' ? 'bg-green-500/20' :
                      'bg-blue-500/20'
                    }`}>
                      <span className={`text-xl ${
                        selectedType === 'artist' ? 'text-red-400' :
                        selectedType === 'band' ? 'text-green-400' :
                        'text-blue-400'
                      }`}>
                        {selectedType === 'artist' ? <FaMusic/> : selectedType === 'band' ? <FaGuitar/> : <FaPlaceOfWorship/>}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {editingProfile 
                          ? `Editar ${selectedType === 'artist' ? 'Artista' : selectedType === 'band' ? 'Banda' : 'Local'}` 
                          : `Crear ${selectedType === 'artist' ? 'Artista' : selectedType === 'band' ? 'Banda' : 'Local'}`
                        }
                      </h2>
                      <p className="text-neutral-400 text-sm">
                        {editingProfile ? 'Actualiza la información del perfil' : 'Completa los datos para crear un nuevo perfil'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCancel}
                    className="p-2 hover:bg-neutral-700 rounded-lg transition-colors"
                    title="Cerrar"
                  >
                    <HiX className="w-6 h-6 text-neutral-400 hover:text-white" />
                  </button>
                </div>

                {/* Modal Content - Aquí renderizamos el formulario que ya existe */}
                <div className="overflow-y-scroll max-h-[80vh] custom-scrollbar">
                  
                  {/* Artist Form - Envolvemos el componente existente */}
                  {selectedType === 'artist' && (
                    <div className="p-2">
                      <ArtistForm
                        defaultValues={artistDefaults}
                        onSubmit={(data) => {
                          handleSubmit(data);
                        }}
                        onCancel={handleCancel}
                        geoData={geoData}
                      />
                    </div>
                  )}

                  {/* Band Form - Envolvemos el componente existente */}
                  {selectedType === 'band' && (
                    <div className="p-2">
                      <BandForm
                        defaultValues={bandDefaults}
                        onSubmit={(data) => {
                          handleSubmit(data);
                        }}
                        onCancel={handleCancel}
                        geoData={geoData}
                      />
                    </div>
                  )}

                  {/* Place Form - Envolvemos el componente existente */}
                  {selectedType === 'place' && (
                    <div className="p-2">
                      <PlaceForm
                        defaultValues={placeDefaults}
                        onSubmit={(data) => {
                          handleSubmit(data);
                        }}
                        onCancel={handleCancel}
                        geoData={geoData}
                      />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Si no queremos modal (renderizado normal), comentamos/eliminamos la sección de arriba y usamos esto: */}
      {/*
      {selectedType === 'artist' && (
        <ArtistForm
          defaultValues={artistDefaults}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          geoData={geoData}
        />
      )}

      {selectedType === 'band' && (
        <BandForm
          defaultValues={bandDefaults}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          geoData={geoData}
        />
      )}

      {selectedType === 'place' && (
        <PlaceForm
          defaultValues={placeDefaults}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          geoData={geoData}
        />
      )}
      */}
    </div>
  );
}