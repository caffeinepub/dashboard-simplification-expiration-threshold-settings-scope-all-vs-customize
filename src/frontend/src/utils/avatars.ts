export const AVATAR_MAP: Record<string, string> = {
  duck: '/assets/generated/duck-01.dim_512x512.png',
  basketball: '/assets/generated/basketball-01.dim_512x512.png',
  rocket: '/assets/generated/rocket-01.dim_512x512.png',
  robot: '/assets/generated/robot-01.dim_512x512.png',
  toy: '/assets/generated/toy-avatar.dim_128x128.png',
  gear: '/assets/generated/gear-avatar.dim_128x128.png',
  coffee: '/assets/generated/coffee-avatar.dim_128x128.png',
  electric: '/assets/generated/electric-avatar.dim_128x128.png',
  lab: '/assets/generated/gallery-lab-01.dim_512x512.png',
  pcb: '/assets/generated/gallery-pcb-01.dim_512x512.png',
  toolbox: '/assets/generated/gallery-toolbox-01.dim_512x512.png',
  deadline: '/assets/generated/gallery-deadline-01.dim_512x512.png',
  docs: '/assets/generated/gallery-docs-01.dim_512x512.png',
  maintenance: '/assets/generated/gallery-maintenance-01.dim_512x512.png',
  inventory: '/assets/generated/gallery-inventory-01.dim_512x512.png',
  analytics: '/assets/generated/gallery-analytics-01.dim_512x512.png',
};

export function getAvatarPath(avatarId: string): string {
  return AVATAR_MAP[avatarId] || AVATAR_MAP.duck;
}

export function getAllAvatarIds(): string[] {
  return Object.keys(AVATAR_MAP);
}
