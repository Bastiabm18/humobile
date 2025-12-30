// schemas/placeSchema.ts
import { z } from 'zod';

export const placeSchema = z.object({
  place_name: z.string().min(2, 'Mínimo 2 caracteres'),
  address: z.string().min(5, 'Dirección muy corta'),
  city: z.string().min(2, 'Ciudad requerida'),
  phone: z.string().regex(/^\+?\d{8,15}$/, 'Teléfono inválido'),
  place_type: z.enum(['pub', 'bar', 'event_center', 'disco', 'other'], {
    message: 'Selecciona un tipo de local',
  }),
  receive_emails: z.object({
    singer: z.boolean(),
    band: z.boolean(),
    actor: z.boolean(),
    comedian: z.boolean(),
    impersonator: z.boolean(),
    tribute: z.boolean(),
  }),
});

export type PlaceFormData = z.infer<typeof placeSchema>;