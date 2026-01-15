// components/ProfileViewModal.tsx
"use client";

import { motion } from "framer-motion";
import { HiX, HiUser, HiVideoCamera } from "react-icons/hi";
import { FaMapPin } from "react-icons/fa";
import { Profile } from "@/types/profile";

interface Props {
  profile: Profile;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileViewModal({ profile, isOpen, onClose }: Props) {
  if (!isOpen) return null;

  console.log(profile)
  const data = profile



  const videoUrl =  data.video_url || '' ;
  const profileImage = profile.imagen_url;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50"
      />

      {/* Modal Container - Responsivo perfecto */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 overflow-y-auto"
      >
        <div
          className="bg-neutral-900 border border-blue-600/40 rounded-2xl shadow-2xl  w-full
                     max-w-4xl 
                     max-h-full          
                     md:max-h-[95vh]     
                     overflow-hidden     
                     flex flex-col"
        >
          {/* HEADER CON IMAGEN */}
          <div className="relative h-48 md:h-64 lg:h-80 flex-shrink-0">
            {profileImage ? (
              <img
                src={profile.imagen_url}
                alt="Perfil"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-900/80 to-black flex items-center justify-center">
                <HiUser className="w-24 h-24 md:w-32 md:h-32 text-blue-500/50" />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent">
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <h2 className="text-3xl md:text-5xl font-bold text-white drop-shadow-2xl">
                  {data.nombre}
                </h2>
                <p className="text-lg md:text-2xl text-blue-400 font-medium drop-shadow-lg">
                 perfil de {data.tipo}
                </p>
              </div>

              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-3 bg-black/60 hover:bg-blue-900/80 rounded-xl transition backdrop-blur-sm"
              >
                <HiX className="w-7 h-7 text-blue-400" />
              </button>
            </div>
          </div>

          {/* CONTENIDO CON SCROLL */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 space-y-8">
            {/* TU CONTENIDO EXISTENTE (sin cambios) */}
            {profile.tipo === "artista" && (
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Nombre completo</p>
                  <p className="text-2xl font-bold text-white">{data.nombre || "—"}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Teléfono</p>
                  <p className="text-2xl font-bold text-blue-400">{data.telefono || "—"}</p>
                </div>
                <div className="md:col-span-2 flex items-center gap-3">
                  <FaMapPin className="w-6 h-6 text-blue-400" />
                  <p className="text-xl text-white">
                    {data.ciudad_id || "Ubicación no especificada"}, Chile
                  </p>
                </div>
              </div>
            )}

            {/* BANDA */}
            {profile.tipo === "banda" && (
              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Nombre de la banda</p>
                    <p className="text-3xl font-bold text-white">{data.nombre}</p>
                  </div>




                  <div>
                    {/* En una línea horizontal */}
                    {data.integrante && data.integrante.length > 0 && (
                      <div className="mt-4">
                        <p className="text-gray-400 text-sm mb-1">Integrantes</p>
                        <div className="flex flex-wrap items-center gap-2">
                          {data.integrante.map((integrante: any, index: any) => (
                            <span key={integrante.id || index} className="text-white">
                              {integrante.nombre_integrante || 'Sin nombre'}
                              <span className="text-sm text-gray-400 ml-1">
                                ({integrante.tipo || 'miembro'})
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Teléfono</p>
                    <p className="text-2xl font-bold text-blue-400">{data.telefono}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaMapPin className="w-6 h-6 text-blue-400" />
                    <p className="text-xl text-white">
                      {data.ciudad_id  || "Sin ubicación"}, Chile
                    </p>
                  </div>
                </div>

                {videoUrl ? (
                  <div className="aspect-video rounded-xl overflow-hidden border border-blue-600/40">
                    <iframe
                      src={videoUrl.replace("watch?v=", "embed/")}
                      title="Video"
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="bg-black/60 border border-blue-600/30 rounded-xl p-12 flex flex-col items-center gap-4">
                    <HiVideoCamera className="w-16 h-16 text-blue-600/50" />
                    <p className="text-xl text-gray-400">No hay video disponible</p>
                  </div>
                )}
              </div>
            )}

            {/* LOCAL */}
            {profile.tipo === "lugar" && (
              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Nombre del local</p>
                    <p className="text-3xl font-bold text-white">{data.nombre}</p>
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm mb-1">Dirección</p>
                    <p className="text-xl text-white">{data.direccion}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Teléfono</p>
                    <p className="text-2xl font-bold text-blue-400">{data.telefono}</p>
                  </div>
                  <div className="md:col-span-2 flex items-center gap-3">
                    <FaMapPin className="w-6 h-6 text-blue-400" />
                    <p className="text-xl text-white">
                      {data.ciudad_id  || "Sin ubicación"}, Chile
                    </p>
                  </div>
                </div>

                {videoUrl ? (
                  <div className="aspect-video rounded-xl overflow-hidden border border-blue-600/40">
                    <iframe
                      src={videoUrl.replace("watch?v=", "embed/")}
                      title="Video del local"
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="bg-black/60 border border-blue-600/30 rounded-xl p-12 flex flex-col items-center gap-4">
                    <HiVideoCamera className="w-16 h-16 text-blue-600/50" />
                    <p className="text-xl text-gray-400">No hay video del local</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>

    </>
  );
}