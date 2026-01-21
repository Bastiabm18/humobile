// app/hooks/useUbicacion.ts - VERSIÓN SIMPLIFICADA Y FUNCIONAL
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

    // Leer ubicación inicial
    const leerUbicacion = () => {
      try {
        const ubicacionGuardada = localStorage.getItem('ubicacionUsuario');
        return ubicacionGuardada ? JSON.parse(ubicacionGuardada) : null;
      } catch (error) {
        console.error('❌ Error al parsear ubicación:', error);
        return null;
      }
    };

    // Configurar solo al montar
    const datosIniciales = leerUbicacion();
    setUbicacion(datosIniciales);

    // Escuchar el evento 'ubicacionObtenida' que envía PermisoUbicacion
    const manejarUbicacionObtenida = (e: CustomEvent) => {
      setUbicacion(e.detail);
    };

    // Escuchar cambios en localStorage (de otras pestañas)
    const manejarCambioStorage = (e: StorageEvent) => {
      if (e.key === 'ubicacionUsuario') {
        const nuevaUbicacion = e.newValue ? JSON.parse(e.newValue) : null;
        setUbicacion(nuevaUbicacion);
      }
    };

    window.addEventListener('ubicacionObtenida', manejarUbicacionObtenida as EventListener);
    window.addEventListener('storage', manejarCambioStorage);

    return () => {
      window.removeEventListener('ubicacionObtenida', manejarUbicacionObtenida as EventListener);
      window.removeEventListener('storage', manejarCambioStorage);
    };
  }, []); // Solo se ejecuta al montar

  return ubicacion;
}