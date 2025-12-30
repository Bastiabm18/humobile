// src/types/role.ts   (o en types/index.ts)
export const USER_ROLES = ['ADMIN', 'user', 'PROFESIONAL', 'CLIENTE', 'MODERADOR', 'SUPERADMIN'] as const;

export type UserRole = typeof USER_ROLES[number];