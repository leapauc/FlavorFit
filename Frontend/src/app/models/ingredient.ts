export interface IngredientByGroup {
  id_ingredient: number;
  alim_nom_fr: string;
  alim_ssgrp_nom_fr: string;
  alim_ssssgrp_nom_fr: string;
}

export interface Ingredient {
  alim_ssgrp_nom_fr: string;
  alim_ssssgrp_nom_fr: string;
  alim_nom_gr: string;
}

export interface IngredientUnitWeight {
  id_ingredient: number;
  ingredient: string;
  alim_grp_nom_fr: string;
  alim_ssgrp_nom_fr: string;
  poids_unitaire: number | null;
  statut: string;
}

export interface IngredientUI {
  group?: string;
  ingredient?: {
    id_ingredient: number;
    alim_nom_fr: string;
    alim_grp_nom_fr?: string;
    alim_ssgrp_nom_fr?: string;
    alim_ssssgrp_nom_fr?: string;
  };
  quantity?: number | null;
  unit?: string;
  unitWeight?: number | null;
  availableIngredients?: { id_ingredient: number; alim_nom_fr: string }[];
  availableUnits?: string[];
  availableContainers?: MeasuringContainer[];
}

export interface DistinctIngredient {
  id_ingredient: number;
  alim_grp_nom_fr: string;
  alim_ssgrp_nom_fr: string;
  alim_ssssgrp_nom_fr: string;
  alim_nom_fr: string;
}

export interface MeasuringContainer {
  name: string;
  weight: number;
}
