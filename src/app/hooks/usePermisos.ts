// @/hooks/usePermisos.ts
import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext'; //  Importamos contexto QUE TRAE LOS PERMISOS
import { PermisoUsuario } from '@/types/profile';

export interface ContadoresPermisos {
  [key: string]: number; 
}


export const usePermisos = (contadores: ContadoresPermisos = {}) => {
  
  
  const { permisos } = useAuth();

  return useMemo(() => {
    const permisosSeguros: PermisoUsuario[] = Array.isArray(permisos) ? permisos : [];
    const getP = (codigo: string) => permisosSeguros.find(p => p.codigo_permiso === codigo);

    return {
      activo: (codigo: string): boolean => getP(codigo)?.estado ?? false,
      
      puedeCrear: (codigo: string): boolean => {
        const p = getP(codigo);
        if (!p) return false;
        if (p.valor_limite >= 999) return p.estado;
        const cantidadActual = contadores[codigo] || 0;
        return p.estado && cantidadActual < p.valor_limite;
      },
      
      limite: (codigo: string): number => {
        const p = getP(codigo);
        if (!p) return 0;
        return p.valor_limite >= 999 ? p.valor_limite : p.valor_limite;
      },
      
      disponibles: (codigo: string): number => {
        const p = getP(codigo);
        if (!p) return 0;
        if (p.valor_limite >= 999) return p.valor_limite;
        const cantidadActual = contadores[codigo] || 0;
        return Math.max(0, p.valor_limite - cantidadActual);
      }
    };
  }, [permisos, contadores]); 
};