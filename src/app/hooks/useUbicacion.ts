// app/hooks/useUbicacion.ts - VERSIÓN SIMPLIFICADA
'use client';

import { useState, useEffect } from 'react';

interface Ubicacion {
  latitud: number;
  longitud: number;
}

export function useUbicacion() {
  const [ubicacion, setUbicacion] = useState<Ubicacion | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Función para leer ubicación
    const leerUbicacion = () => {
      try {
        const ubicacionGuardada = localStorage.getItem('ubicacionUsuario');
        return ubicacionGuardada ? JSON.parse(ubicacionGuardada) : null;
      } catch (error) {
        console.error(' Error al parsear ubicación:', error);
        return null;
      }
    };

    // Leer ubicación inicial
    setUbicacion(leerUbicacion());

    // Escuchar cambios en localStorage (cuando el botón actualiza)
    const manejarCambioStorage = (event: StorageEvent) => {
      if (event.key === 'ubicacionUsuario') {
        console.log(' Storage actualizado desde botón');
        const nuevaUbicacion = event.newValue ? JSON.parse(event.newValue) : null;
        setUbicacion(nuevaUbicacion);
      }
    };

    // Escuchar evento personalizado (alternativa)
    const manejarUbicacionActualizada = (event: CustomEvent) => {
      console.log(' Evento personalizado recibido:', event.detail);
      setUbicacion(event.detail);
    };

    window.addEventListener('storage', manejarCambioStorage);
    window.addEventListener('ubicacion-actualizada', manejarUbicacionActualizada as EventListener);

    return () => {
      window.removeEventListener('storage', manejarCambioStorage);
      window.removeEventListener('ubicacion-actualizada', manejarUbicacionActualizada as EventListener);
    };
  }, []);

  return ubicacion;
}