// schemas/bandSchema.ts
import { z } from 'zod';

export const bandSchema = z.object({
  band_name: z.string().min(2, 'Nombre de banda obligatorio'),
  style: z.string().min(1, 'Estilo obligatorio'),
  music_type: z.string().min(1, 'Tipo de música obligatorio'),
  is_tribute: z.boolean(),
  contact_phone: z.string().regex(/^\+?\d{8,15}$/, 'Teléfono inválido'),
 // CAMBIOS: Usamos IDs para las selecciones en cascada
  countryId: z.string().uuid('Debes seleccionar un País válido.'),
  regionId: z.string().uuid('Debes seleccionar una Región válida.'),
  cityId: z.string().uuid('Debes seleccionar una Comuna/Ciudad válida.'),

  photo_url: z.string().url('URL de foto inválida').optional().or(z.literal('')),
  video_url: z.string().url('URL de video inválida').optional().or(z.literal('')),
});

export type BandFormData = z.infer<typeof bandSchema>;