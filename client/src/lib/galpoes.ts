/** Galpões usados em coleta, dashboards e estoque (alinhado ao mock admin). */
export const GALPOES = ["Oceânica", "Vicente", "Nova Mirim", "Goiânia"] as const;

export type GalpaoNome = (typeof GALPOES)[number];
