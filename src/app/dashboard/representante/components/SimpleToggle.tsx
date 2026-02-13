"use client";
import { useState } from "react";
import { actualizarperfilVisible } from "../actions/actions";

export default function SimpleToggle({ id, initialState }: { id: string, initialState: boolean }) {
  const [enabled, setEnabled] = useState(initialState);

  const handleToggle = async () => {
    // Calculamos el valor que QUEREMOS enviar
    const valorNuevo = !enabled; 
    
    // 1. Cambiamos la UI de una
    setEnabled(valorNuevo);

    // 2. Mandamos el valor correcto (el nuevo) a la DB
    const result = await actualizarperfilVisible(id, valorNuevo);
    
    // 3. Si la DB dice que no, volvemos atrás
    if (!result.success) {
        setEnabled(!valorNuevo);
        alert("Falló la DB: " + result.error);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`w-18 h-9 flex items-center rounded-full p-1 transition-colors ${
        enabled ? "bg-sky-500" : "bg-gray-400"
      }`}
    >
      <div className={`bg-white w-6 h-6 rounded-full shadow transform transition-transform duration-200 ${
        enabled ? "translate-x-9" : "translate-x-0"
      }`} />
    </button>
  );
}