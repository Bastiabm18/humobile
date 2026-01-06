// app/hooks/useUbicacionSimple.ts
'use client';

import { useState, useEffect } from 'react';

interface Ubicacion {
  latitud: number;
  longitud: number;
}

export function useUbicacionSimple() {
  const [ubicacion, setUbicacion] = useState<Ubicacion | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Solo leer de localStorage
    const ubicacionGuardada = localStorage.getItem('ubicacionUsuario');
    
    if (ubicacionGuardada) {
      try {
        const datos = JSON.parse(ubicacionGuardada);
        setUbicacion(datos);
        
        // Imprimir en consola
        console.log('📍 Ubicación cargada de localStorage:');
        console.log('Latitud:', datos.latitud);
        console.log('Longitud:', datos.longitud);
      } catch (error) {
        console.error('❌ Error al parsear ubicación:', error);
      }
    } else {
      console.log('📭 No hay ubicación guardada en localStorage');
    }
  }, []);

  return ubicacion;
}